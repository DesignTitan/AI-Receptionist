import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkOrigin } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import {
  SESSION_COOKIE,
  CHALLENGE_COOKIE,
  AuthError,
  provider,
  requireIdentity,
  identity,
  securityRecord,
  limit,
  requireRecent,
  providerRequest,
  startSession,
  approve,
  audit,
  cookieOptions,
  type Identity,
} from "@/lib/account-auth/server";
import {
  recoveryCodes,
  recoveryHash,
  secret,
  digest,
} from "@/lib/account-auth/crypto";
import {
  normalizeRecoveryCode,
  hasUserVerification,
} from "@/lib/account-auth/policy";
const passkeysEnabled = () => process.env.AUTH_PASSKEYS_ENABLED === "true";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
const fail = (error: unknown) =>
  json(
    {
      error:
        error instanceof AuthError
          ? error.message
          : "We could not complete that request. Please try again.",
    },
    error instanceof AuthError ? error.status : 400,
  );
async function passkeys(i: Identity) {
  return passkeysEnabled() ? await providerRequest(i, "/passkeys") : [];
}
async function bind(kind: string, id: string, userId: string) {
  (await cookies()).set(
    CHALLENGE_COOKIE,
    JSON.stringify({ kind, id, userId }),
    { ...cookieOptions, maxAge: 300 },
  );
}
async function challenge(kind: string, userId: string) {
  const jar = await cookies();
  let value;
  try {
    value = JSON.parse(jar.get(CHALLENGE_COOKIE)?.value ?? "{}");
  } catch {
    throw new AuthError("Start this security check again.");
  }
  if (
    value.kind !== kind ||
    value.userId !== userId ||
    typeof value.id !== "string"
  )
    throw new AuthError("Start this security check again.");
  return value.id as string;
}
async function canEnroll(i: Identity) {
  const security = await securityRecord(i.user.id);
  if (security.recovery_session_id && security.recovery_session_id !== i.row.id)
    throw new AuthError(
      "Recovery is in progress. Continue in the browser where you used your recovery code.",
      403,
    );
  if (security.enrolled) requireRecent(i);
  // Existing provider factors are authoritative even before migration/enrollment is recorded.
  if (
    !i.row.approved_at &&
    (i.user.factors?.some((f) => f.status === "verified") ||
      (await passkeys(i)).length > 0)
  )
    throw new AuthError("Verify your existing authenticator first.", 428);
}
export async function GET() {
  try {
    const i = await requireIdentity(),
      security = await securityRecord(i.user.id);
    const factors = (i.user.factors ?? [])
      .filter((f) => f.factor_type === "totp" && f.status === "verified")
      .map((f) => ({ id: f.id, name: f.friendly_name ?? "Authenticator app" }));
    const keys = await passkeys(i);
    const enrolled = security.enrolled || factors.length > 0 || keys.length > 0;
    let sessions: unknown[] = [],
      remaining = 0;
    if (i.row.approved_at && !i.row.recovery_only) {
      const result = await serviceClient()
        .from("account_sessions")
        .select("id,label,created_at,expires_at")
        .eq("user_id", i.user.id)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(50);
      if (result.error)
        throw new AuthError("Could not load your sessions.", 503);
      sessions = (result.data ?? []).map((s) => ({
        ...s,
        current: s.id === i.row.id,
      }));
      const count = await serviceClient()
        .from("account_recovery_codes")
        .select("code_hash", { count: "exact", head: true })
        .eq("user_id", i.user.id)
        .is("used_at", null);
      remaining = count.count ?? 0;
    }
    const recovery = await serviceClient()
      .from("account_recovery_requests")
      .select("id,status,created_at")
      .eq("user_id", i.user.id)
      .in("status", ["pending", "reviewing"])
      .maybeSingle();
    return json({
      email: i.user.email,
      enrolled,
      verified: !!i.row.approved_at && !i.row.recovery_only,
      recoveryOnly: i.row.recovery_only,
      factors,
      passkeys: keys,
      passkeysEnabled: passkeysEnabled(),
      sessions,
      remaining,
      recoveryRequest: recovery.data,
      destination: i.row.destination,
    });
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  let lock: { user: string; operation: string } | undefined;
  try {
    checkOrigin(request);
    if (Number(request.headers.get("content-length") ?? 0) > 32768)
      throw new AuthError("Request too large.", 413);
    const body = await request.json();
    const action = String(body.action ?? "");
    if (action === "passkey-options" || action === "passkey-signin") {
      if (!passkeysEnabled())
        throw new AuthError(
          "Passkeys are not available yet. Use email to continue.",
          503,
        );
      await limit(
        `passkey:${request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"}`,
        30,
      );
      if (action === "passkey-options") {
        const { data, error } =
          await provider().auth.passkey.startAuthentication();
        if (error || !data)
          throw new AuthError(
            "Could not start passkey sign-in. Please try email.",
          );
        data.options.userVerification = "required";
        await bind("signin", data.challenge_id, "");
        return json(data);
      }
      const id = await challenge("signin", "");
      const { data, error } =
        await provider().auth.passkey.verifyAuthentication({
          challengeId: id,
          credential: body.credential,
        });
      if (error || !data?.session)
        throw new AuthError("Passkey verification failed. Please try again.");
      if (!hasUserVerification(body.credential?.response?.authenticatorData))
        throw new AuthError(
          "Use a passkey protected by your fingerprint, face scan or device PIN.",
        );
      const previous = await identity();
      if (previous && previous.user.id !== data.user?.id)
        throw new AuthError(
          "Choose a passkey for the account you are currently using.",
        );
      (await cookies()).delete(CHALLENGE_COOKIE);
      if (previous) await approve(previous, data.session.access_token);
      else {
        await startSession(data.session.access_token, request, "/account");
        const current = await requireIdentity();
        await approve(current);
      }
      return json({ ok: true, url: "/account/security" });
    }
    const i = await requireIdentity();
    await limit(`action:${i.user.id}`, 60);
    const operation = randomUUID();
    const acquired = await serviceClient().rpc("account_security_lock", {
      p_user: i.user.id,
      p_operation: operation,
    });
    if (acquired.error || !acquired.data)
      throw new AuthError(
        "Another security change is in progress. Please try again shortly.",
        409,
      );
    lock = { user: i.user.id, operation };
    if (action === "totp-enroll") {
      await canEnroll(i);
      // Remove only abandoned, unverified enrollments; verified methods remain intact.
      for (const factor of i.user.factors ?? [])
        if (factor.factor_type === "totp" && factor.status === "unverified")
          await providerRequest(i, `/factors/${factor.id}`, "DELETE");
      const data = await providerRequest(i, "/factors", "POST", {
        factor_type: "totp",
        friendly_name: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
        issuer: "bubs",
      });
      await bind("enroll", data.id, i.user.id);
      const qr = data.totp.qr_code;
      return json({
        id: data.id,
        totp: {
          ...data.totp,
          qr_code: qr.startsWith("<svg")
            ? `data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`
            : qr,
        },
      });
    }
    if (action === "totp-verify") {
      await limit(`totp:${i.user.id}`, 10);
      if (!/^\d{6}$/.test(body.code ?? ""))
        throw new AuthError(
          "Enter the six-digit code from your authenticator.",
        );
      const factorId = body.enrollment
        ? await challenge("enroll", i.user.id)
        : String(body.factorId ?? "");
      if (
        !body.enrollment &&
        !i.user.factors?.some(
          (f) =>
            f.id === factorId &&
            f.status === "verified" &&
            f.factor_type === "totp",
        )
      )
        throw new AuthError("Choose a registered authenticator.");
      const c = await providerRequest(
        i,
        `/factors/${factorId}/challenge`,
        "POST",
        {},
      );
      const data = await providerRequest(
        i,
        `/factors/${factorId}/verify`,
        "POST",
        { challenge_id: c.id, code: body.code },
      );
      await approve(i, data.access_token);
      (await cookies()).delete(CHALLENGE_COOKIE);
      return json({ ok: true });
    }
    if (action === "passkey-register-options") {
      if (!passkeysEnabled())
        throw new AuthError("Passkeys are not available yet.", 503);
      await canEnroll(i);
      const data = await providerRequest(
        i,
        "/passkeys/registration/options",
        "POST",
        {},
      );
      await bind("register", data.challenge_id, i.user.id);
      return json(data);
    }
    if (action === "passkey-register") {
      await canEnroll(i);
      const id = await challenge("register", i.user.id);
      await providerRequest(i, "/passkeys/registration/verify", "POST", {
        challenge_id: id,
        credential: body.credential,
      });
      (await cookies()).delete(CHALLENGE_COOKIE);
      // Registration is not an authentication assertion. Require a real passkey sign-in next.
      const enrolled = await serviceClient()
        .from("account_security")
        .update({ enrolled: true })
        .eq("user_id", i.user.id);
      if (enrolled.error)
        throw new AuthError("Could not finish registration.", 503);
      await audit(i.user.id, "passkey_added");
      return json({ ok: true });
    }
    if (action === "recovery-use") {
      await limit(`recovery:${i.user.id}`, 5);
      const code = normalizeRecoveryCode(body.code);
      if (!/^[A-F0-9]{24}$/.test(code))
        throw new AuthError(
          "That recovery code is invalid or has already been used.",
        );
      const rotated = secret();
      const { data, error } = await serviceClient().rpc(
        "account_use_recovery",
        {
          p_user: i.user.id,
          p_hash: recoveryHash(i.user.id, code),
          p_session: i.row.id,
          p_new_hash: digest(rotated),
        },
      );
      if (error || !data)
        throw new AuthError(
          "That recovery code is invalid or has already been used.",
        );
      (await cookies()).set(SESSION_COOKIE, rotated, {
        ...cookieOptions,
        maxAge: Math.max(
          0,
          Math.floor((Date.parse(i.row.expires_at) - Date.now()) / 1000),
        ),
      });
      return json({ ok: true });
    }
    if (action === "recovery-reset") {
      if (!i.row.recovery_only)
        throw new AuthError("A verified recovery code is required.", 403);
      // Explicit recovery action: replace lost methods, never silently disable MFA on email alone.
      const claim = await serviceClient()
        .from("account_security")
        .update({ recovery_session_id: i.row.id })
        .eq("user_id", i.user.id);
      if (claim.error) throw new AuthError("Could not start recovery.", 503);
      const admin = serviceClient().auth.admin;
      for (const factor of i.user.factors ?? []) {
        const { error } = await admin.mfa.deleteFactor({
          userId: i.user.id,
          id: factor.id,
        });
        if (error)
          throw new AuthError(
            "Could not reset your authenticator. Please try again.",
          );
      }
      if (passkeysEnabled()) {
        const listed = await admin.passkey.listPasskeys({ userId: i.user.id });
        if (listed.error) throw new AuthError("Could not load passkeys.");
        for (const key of listed.data ?? []) {
          const deleted = await admin.passkey.deletePasskey({
            userId: i.user.id,
            passkeyId: key.id,
          });
          if (deleted.error)
            throw new AuthError("Could not remove the lost passkey.");
        }
      }
      const reset = await serviceClient()
        .from("account_security")
        .update({ enrolled: false, recovery_session_id: i.row.id })
        .eq("user_id", i.user.id);
      if (reset.error) throw new AuthError("Could not reset security.", 503);
      const session = await serviceClient()
        .from("account_sessions")
        .update({ approved_at: null, recovery_only: false })
        .eq("id", i.row.id);
      if (session.error)
        throw new AuthError("Could not reset this session.", 503);
      await audit(i.user.id, "lost_methods_reset");
      return json({ ok: true });
    }
    if (action === "recovery-request") {
      await limit(`request:${i.user.id}`, 3);
      const existing = await serviceClient()
        .from("account_recovery_requests")
        .select("id,status")
        .eq("user_id", i.user.id)
        .in("status", ["pending", "reviewing"])
        .maybeSingle();
      if (existing.error)
        throw new AuthError("Could not request recovery.", 503);
      if (existing.data) return json(existing.data);
      const result = await serviceClient()
        .from("account_recovery_requests")
        .insert({ user_id: i.user.id })
        .select("id,status")
        .single();
      if (result.error)
        throw new AuthError(
          "Could not request recovery. Please try again.",
          503,
        );
      await audit(i.user.id, "recovery_requested");
      return json(result.data);
    }
    requireRecent(i);
    if (action === "recovery-generate") {
      const codes = recoveryCodes();
      const { error } = await serviceClient().rpc("account_replace_recovery", {
        p_user: i.user.id,
        p_hashes: codes.map((c) => recoveryHash(i.user.id, c)),
      });
      if (error) throw new AuthError("Could not create recovery codes.", 503);
      await audit(i.user.id, "recovery_codes_replaced");
      return json({ codes });
    }
    if (action === "passkey-rename") {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 80
      )
        throw new AuthError("Enter a name up to 80 characters.");
      if (!(await passkeys(i)).some((p: { id: string }) => p.id === body.id))
        throw new AuthError("Passkey not found.");
      await providerRequest(i, `/passkeys/${body.id}`, "PATCH", {
        friendly_name: body.name.trim(),
      });
      await audit(i.user.id, "passkey_renamed");
      return json({ ok: true });
    }
    if (action === "method-remove") {
      const keys = await passkeys(i),
        factors = (i.user.factors ?? []).filter((f) => f.status === "verified");
      if (keys.length + factors.length <= 1)
        throw new AuthError(
          "Add another sign-in method before removing your last one.",
        );
      if (
        body.kind === "passkey" &&
        keys.some((k: { id: string }) => k.id === body.id)
      )
        await providerRequest(i, `/passkeys/${body.id}`, "DELETE");
      else if (body.kind === "totp" && factors.some((f) => f.id === body.id))
        await providerRequest(i, `/factors/${body.id}`, "DELETE");
      else throw new AuthError("Sign-in method not found.");
      await audit(i.user.id, "sign_in_method_removed");
      return json({ ok: true });
    }
    if (action === "sessions-revoke") {
      let q = serviceClient()
        .from("account_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", i.user.id)
        .neq("id", i.row.id)
        .is("revoked_at", null);
      if (body.id) q = q.eq("id", String(body.id));
      const { error } = await q;
      if (error) throw new AuthError("Could not sign out those devices.", 503);
      await audit(i.user.id, "other_sessions_revoked");
      return json({ ok: true });
    }
    throw new AuthError("Unknown security action.");
  } catch (e) {
    return fail(e);
  } finally {
    if (lock)
      await serviceClient().rpc("account_security_unlock", {
        p_user: lock.user,
        p_operation: lock.operation,
      });
  }
}
