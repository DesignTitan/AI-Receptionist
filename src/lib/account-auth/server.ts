import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serviceClient } from "@/lib/supabase";
import { digest, secret, seal, unseal } from "./crypto";
import { deviceLabel, recentVerification, safeDestination } from "./policy";
const cookieName = (name: string) =>
  process.env.NODE_ENV === "production" ? `__Host-${name}` : name;
export const SESSION_COOKIE = cookieName("receptionist_owner");
export const PKCE_COOKIE = cookieName("account_pkce");
export const DESTINATION_COOKIE = cookieName("account_destination");
export const CHALLENGE_COOKIE = cookieName("account_challenge");
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
export class AuthError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function provider() {
  if (!env.supabaseUrl || !env.supabaseAnonKey)
    throw new AuthError(
      "Sign-in is being prepared. Please try again later.",
      503,
    );
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      experimental: { passkey: true },
    },
  });
}
/** Server-side PKCE storage: the email link only works in the browser that requested it. */
export async function emailProvider() {
  const jar = await cookies();
  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storageKey: "account-email",
      storage: {
        getItem: async (key) =>
          key.endsWith("-code-verifier")
            ? (jar.get(PKCE_COOKIE)?.value ?? null)
            : null,
        setItem: async (key, value) => {
          if (key.endsWith("-code-verifier"))
            jar.set(PKCE_COOKIE, value, { ...cookieOptions, maxAge: 600 });
        },
        removeItem: async (key) => {
          if (key.endsWith("-code-verifier")) jar.delete(PKCE_COOKIE);
        },
      },
    },
  });
}
export type AccountSession = {
  id: string;
  user_id: string;
  provider_token: string;
  approved_at: string | null;
  recovery_only: boolean;
  expires_at: string;
  destination: string;
  label: string;
  created_at: string;
};
export type Identity = { row: AccountSession; user: User; token: string };
export async function audit(userId: string, event: string) {
  const { error } = await serviceClient()
    .from("account_security_events")
    .insert({ user_id: userId, event });
  if (error)
    throw new AuthError(
      "We could not save this security change. Please try again.",
      503,
    );
}
export async function limit(key: string, max = 10) {
  const { data, error } = await serviceClient().rpc("account_auth_limit", {
    p_key: digest(key),
    p_max: max,
  });
  if (error)
    throw new AuthError(
      "Sign-in is temporarily unavailable. Please try again later.",
      503,
    );
  if (!data)
    throw new AuthError(
      "Too many attempts. Please wait ten minutes and try again.",
      429,
    );
}
export async function identity(): Promise<Identity | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value || !/^[A-Za-z0-9_-]{43}$/.test(value)) return null;
  const { data, error } = await serviceClient()
    .from("account_sessions")
    .select("*")
    .eq("token_hash", digest(value))
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  const token = unseal(data.provider_token);
  const result = await provider().auth.getUser(token);
  if (
    result.error ||
    result.data.user?.id !== data.user_id ||
    !result.data.user.email_confirmed_at
  )
    return null;
  return { row: data as AccountSession, user: result.data.user, token };
}
export async function requireIdentity(): Promise<Identity> {
  const value = await identity();
  if (!value)
    throw new AuthError("Your session has expired. Please sign in again.", 401);
  return value;
}
export async function authenticatedOwner() {
  try {
    const i = await identity();
    return i?.row.approved_at && !i.row.recovery_only ? i.user : null;
  } catch {
    return null;
  }
}
export async function securityRecord(userId: string) {
  const { error } = await serviceClient()
    .from("account_security")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error)
    throw new AuthError("Account security is temporarily unavailable.", 503);
  const result = await serviceClient()
    .from("account_security")
    .select("enrolled,recovery_session_id")
    .eq("user_id", userId)
    .single();
  if (result.error)
    throw new AuthError("Account security is temporarily unavailable.", 503);
  return result.data;
}
export function requireRecent(i: Identity) {
  if (
    !i.row.approved_at ||
    i.row.recovery_only ||
    !recentVerification(i.row.approved_at)
  )
    throw new AuthError(
      "Verify your identity again before making this change.",
      428,
    );
}
export async function providerRequest(
  i: Identity,
  path: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(`${env.supabaseUrl}/auth/v1${path}`, {
    method,
    headers: {
      apikey: env.supabaseAnonKey!,
      Authorization: `Bearer ${i.token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new AuthError(
      response.status === 429
        ? "Too many attempts. Please wait and try again."
        : "We could not complete that security check. Please try again.",
      response.status === 429 ? 429 : 400,
    );
  return data;
}
export async function startSession(
  token: string,
  request: Request,
  destination: unknown,
) {
  const result = await provider().auth.getUser(token);
  if (result.error || !result.data.user?.email_confirmed_at)
    throw new AuthError("This sign-in link is missing or expired.", 401);
  const user = result.data.user;
  // Decoding only after the auth server has verified the exact token.
  const claims = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString(),
  );
  const approved = false;
  await securityRecord(user.id);
  const raw = secret();
  const expires = new Date(
    Math.min(claims.exp * 1000, Date.now() + (approved ? 3600 : 900) * 1000),
  );
  if (!Number.isFinite(expires.getTime()) || expires.getTime() <= Date.now())
    throw new AuthError("This sign-in link has expired.", 401);
  const { data, error } = await serviceClient()
    .from("account_sessions")
    .insert({
      user_id: user.id,
      token_hash: digest(raw),
      provider_token: seal(token),
      approved_at: approved ? new Date().toISOString() : null,
      label: deviceLabel(request.headers.get("user-agent") ?? ""),
      destination: safeDestination(destination),
      expires_at: expires.toISOString(),
    })
    .select("id")
    .single();
  if (error)
    throw new AuthError(
      "We could not start your session. Please try again.",
      503,
    );
  (await cookies()).set(SESSION_COOKIE, raw, {
    ...cookieOptions,
    maxAge: Math.floor((expires.getTime() - Date.now()) / 1000),
  });
  await audit(user.id, "signed_in");
  return { id: data.id, user, approved };
}
export async function approve(i: Identity, token = i.token) {
  const security = await securityRecord(i.user.id);
  if (security.recovery_session_id && security.recovery_session_id !== i.row.id)
    throw new AuthError("Recovery is in progress in another browser.", 403);
  const result = await provider().auth.getUser(token);
  if (result.error || result.data.user?.id !== i.user.id)
    throw new AuthError("Verification failed.", 401);
  const claims = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString(),
  );
  const expires = new Date(Math.min(claims.exp * 1000, Date.now() + 3600_000));
  if (security.recovery_session_id === i.row.id) {
    const retired = await serviceClient()
      .from("account_recovery_codes")
      .delete()
      .eq("user_id", i.user.id);
    if (retired.error)
      throw new AuthError(
        "Could not replace the previous recovery codes.",
        503,
      );
  }
  const raw = secret();
  const { data, error } = await serviceClient()
    .from("account_sessions")
    .update({
      token_hash: digest(raw),
      provider_token: seal(token),
      approved_at: new Date().toISOString(),
      recovery_only: false,
      expires_at: expires.toISOString(),
    })
    .eq("id", i.row.id)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error || !data)
    throw new AuthError("Your session expired. Please sign in again.", 401);
  const enrolled = await serviceClient()
    .from("account_security")
    .update({ enrolled: true, recovery_session_id: null })
    .eq("user_id", i.user.id);
  if (enrolled.error)
    throw new AuthError("Could not finish security setup.", 503);
  (await cookies()).set(SESSION_COOKIE, raw, {
    ...cookieOptions,
    maxAge: Math.floor((expires.getTime() - Date.now()) / 1000),
  });
  await audit(i.user.id, "identity_verified");
}
export async function revokeCurrent() {
  const jar = await cookies(),
    raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const { error } = await serviceClient()
      .from("account_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", digest(raw));
    if (error) throw new AuthError("Sign-out failed. Please try again.", 503);
  }
  jar.delete(SESSION_COOKIE);
}
