import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import {
  safeDestination,
  recentVerification,
  normalizeRecoveryCode,
  deviceLabel,
  hasUserVerification,
} from "../src/lib/account-auth/policy.ts";
function moduleAt(path: string, mocks: Record<string, unknown>) {
  const code = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const exports: any = {};
  new Function("require", "exports", code)((name: string) => {
    if (!(name in mocks)) throw Error(`Unmocked ${name}`);
    return mocks[name];
  }, exports);
  return exports;
}
import * as crypto from "node:crypto";
const crypt = moduleAt("../src/lib/account-auth/crypto.ts", {
  "node:crypto": crypto,
  "./policy": { normalizeRecoveryCode },
});
test("destinations preserve plan checkout but reject external, protocol-relative and encoded bypasses", () => {
  for (const bad of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/account/../admin",
    "/%2f%2fevil.test",
    "/api/account/auth",
    null,
  ])
    assert.equal(safeDestination(bad), "/account");
  assert.equal(
    safeDestination("/start?plan=busy&review=1"),
    "/start?plan=busy&review=1",
  );
});
test("fresh verification expires and cannot be claimed from the future", () => {
  const now = Date.now();
  assert.equal(
    recentVerification(new Date(now - 1000).toISOString(), now),
    true,
  );
  for (const date of [
    null,
    "invalid",
    new Date(now - 600001).toISOString(),
    new Date(now + 1000).toISOString(),
  ])
    assert.equal(recentVerification(date, now), false);
});
test("recovery codes have 96 bits, are unique and hash differently for each account", () => {
  const codes = crypt.recoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) {
    assert.match(normalizeRecoveryCode(code), /^[0-9A-F]{24}$/);
    assert.notEqual(
      crypt.recoveryHash("a", code),
      crypt.recoveryHash("b", code),
    );
    assert.equal(
      crypt.recoveryHash("a", code),
      crypt.recoveryHash("a", code.toLowerCase().replaceAll("-", " ")),
    );
  }
});
test("provider tokens are encrypted and authenticated; tampering and missing keys fail closed", () => {
  const saved = process.env.AUTH_SESSION_ENCRYPTION_KEY;
  try {
    process.env.AUTH_SESSION_ENCRYPTION_KEY = "ab".repeat(32);
    const encoded = crypt.seal("provider-secret");
    assert.ok(!encoded.includes("provider-secret"));
    assert.equal(crypt.unseal(encoded), "provider-secret");
    const bytes = Buffer.from(encoded, "base64url");
    bytes[30] ^= 1;
    assert.throws(() => crypt.unseal(bytes.toString("base64url")));
    delete process.env.AUTH_SESSION_ENCRYPTION_KEY;
    assert.throws(() => crypt.seal("secret"));
  } finally {
    if (saved) process.env.AUTH_SESSION_ENCRYPTION_KEY = saved;
    else delete process.env.AUTH_SESSION_ENCRYPTION_KEY;
  }
});
test("device labels cannot reflect injected HTML or an unbounded user-agent", () => {
  assert.equal(deviceLabel("<script>alert(1)</script>"), "Browser on device");
  assert.equal(deviceLabel("Mozilla Macintosh Chrome/100"), "Chrome on Mac");
});
function sessionHarness({
  pkce = true,
  providerError = false,
  origin = true,
} = {}) {
  let starts = 0,
    revokes = 0;
  class AuthError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  }
  const route = moduleAt("../src/app/api/account/session/route.ts", {
    "next/headers": {
      cookies: async () => ({
        get: (name: string) =>
          name === "account_pkce" && pkce
            ? { value: "secret-verifier" }
            : undefined,
        delete: () => {},
      }),
    },
    "next/server": { NextResponse: { json: Response.json } },
    "@/lib/platform/server": {
      checkOrigin: () => {
        if (!origin) throw Error("CSRF");
      },
    },
    "@/lib/account-auth/server": {
      AuthError,
      PKCE_COOKIE: "account_pkce",
      DESTINATION_COOKIE: "account_destination",
      emailProvider: async () => ({
        auth: {
          exchangeCodeForSession: async () =>
            providerError
              ? { error: Error() }
              : { data: { session: { access_token: "verified" } } },
        },
      }),
      startSession: async () => {
        starts++;
      },
      revokeCurrent: async () => {
        revokes++;
      },
    },
  });
  return {
    route,
    get starts() {
      return starts;
    },
    get revokes() {
      return revokes;
    },
    post: (body: unknown) =>
      route.POST(
        new Request("http://localhost/api/account/session", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      ),
  };
}
test("session endpoint rejects bare bearer tokens, missing PKCE cookies, invalid links and CSRF", async () => {
  for (const [options, body] of [
    [{}, { access_token: "forged" }],
    [{ pkce: false }, { code: "valid" }],
    [{ providerError: true }, { code: "bad" }],
    [{ origin: false }, { code: "valid" }],
  ] as const) {
    const h = sessionHarness(options);
    assert.equal((await h.post(body)).status, 401);
    assert.equal(h.starts, 0);
  }
});
test("verified email callback creates restricted session and routes to server-driven security flow", async () => {
  const h = sessionHarness();
  const response = await h.post({ code: "valid" });
  assert.equal(response.status, 200);
  assert.equal(h.starts, 1);
  assert.equal((await response.json()).url, "/account/security");
});
test("sign out revokes server session and rejects cross-origin attempts", async () => {
  const h = sessionHarness();
  assert.equal(
    (
      await h.route.DELETE(
        new Request("http://localhost", { method: "DELETE" }),
      )
    ).status,
    200,
  );
  assert.equal(h.revokes, 1);
  const bad = sessionHarness({ origin: false });
  assert.equal(
    (
      await bad.route.DELETE(
        new Request("http://localhost", { method: "DELETE" }),
      )
    ).status,
    403,
  );
  assert.equal(bad.revokes, 0);
});
function ownerHarness({
  cookie = "a".repeat(43),
  approved = true,
  recovery = false,
  revoked = false,
  expired = false,
  providerValid = true,
  userMatches = true,
} = {}) {
  let tokenRead = false;
  const filters: any[] = [];
  const row = {
    user_id: "user",
    provider_token: "encrypted",
    approved_at: approved ? "2026-09-12" : null,
    recovery_only: recovery,
  };
  const query: any = {
    select() {
      return this;
    },
    eq(...args: any[]) {
      filters.push(args);
      return this;
    },
    is(...args: any[]) {
      filters.push(args);
      return this;
    },
    gt(...args: any[]) {
      filters.push(args);
      return this;
    },
    maybeSingle: async () => ({
      data: revoked || expired ? null : row,
      error: null,
    }),
  };
  const server = moduleAt("../src/lib/account-auth/server.ts", {
    "next/headers": {
      cookies: async () => ({ get: () => ({ value: cookie }) }),
    },
    "@supabase/supabase-js": {
      createClient: () => ({
        auth: {
          getUser: async () => ({
            data: {
              user: {
                id: userMatches ? "user" : "attacker",
                email_confirmed_at: "yes",
              },
            },
            error: providerValid ? null : Error(),
          }),
        },
      }),
    },
    "@/lib/env": {
      env: { supabaseUrl: "https://auth.example", supabaseAnonKey: "anon" },
    },
    "@/lib/supabase": { serviceClient: () => ({ from: () => query }) },
    "./crypto": {
      digest: (x: string) => `hash:${x}`,
      unseal: () => {
        tokenRead = true;
        return "jwt";
      },
    },
    "./policy": { deviceLabel, recentVerification, safeDestination },
  });
  return {
    server,
    filters,
    get tokenRead() {
      return tokenRead;
    },
  };
}
test("business data requires approved, unexpired, unrevoked session and matching verified provider identity", async () => {
  for (const options of [
    { approved: false },
    { recovery: true },
    { revoked: true },
    { expired: true },
    { providerValid: false },
    { userMatches: false },
    { cookie: "legacy.jwt.token" },
  ])
    assert.equal(await ownerHarness(options).server.authenticatedOwner(), null);
  const h = ownerHarness();
  assert.equal((await h.server.authenticatedOwner()).id, "user");
  assert.ok(h.filters.some(([k, v]) => k === "revoked_at" && v === null));
  assert.ok(h.filters.some(([k]) => k === "expires_at"));
});
function actionHarness({
  verified = true,
  recovery = false,
  enrolled = true,
  origin = true,
  identity = true,
  recent = true,
  factors = [{ id: "factor-a", factor_type: "totp", status: "verified" }],
  recoverySession = null,
  sessionId = "session-a",
}: {
  verified?: boolean;
  recovery?: boolean;
  enrolled?: boolean;
  origin?: boolean;
  identity?: boolean;
  recent?: boolean;
  factors?: any[];
  recoverySession?: string | null;
  sessionId?: string;
} = {}) {
  class AuthError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  }
  const i = {
    row: {
      id: sessionId,
      approved_at: verified ? "now" : null,
      recovery_only: recovery,
    },
    user: { id: "owner-a", email: "owner@example.com", factors },
  };
  const calls: any[] = [],
    audits: any[] = [];
  let approvals = 0;
  const query: any = {
    update(v: any) {
      calls.push(["update", v]);
      return this;
    },
    eq(...v: any[]) {
      calls.push(["eq", ...v]);
      return this;
    },
    select() {
      return this;
    },
    maybeSingle: async () => ({ data: null }),
    single: async () => ({ data: { id: "request" } }),
    is() {
      return this;
    },
    neq(...v: any[]) {
      calls.push(["neq", ...v]);
      return this;
    },
    in() {
      return this;
    },
    insert(v: any) {
      calls.push(["insert", v]);
      return this;
    },
    delete() {
      return this;
    },
    then(resolve: any) {
      return Promise.resolve({ error: null }).then(resolve);
    },
  };
  const modules: Record<string, any> = {
    "node:crypto": crypto,
    "next/server": { NextResponse: { json: Response.json } },
    "next/headers": {
      cookies: async () => ({
        get: () => undefined,
        set: () => {},
        delete: () => {},
      }),
    },
    "@/lib/platform/server": {
      checkOrigin: () => {
        if (!origin) throw new AuthError("CSRF", 403);
      },
    },
    "@/lib/supabase": {
      serviceClient: () => ({
        from: () => query,
        rpc: async (name: string, args: any) => {
          calls.push([name, args]);
          return { data: true, error: null };
        },
      }),
    },
    "@/lib/account-auth/crypto": crypt,
    "@/lib/account-auth/policy": { normalizeRecoveryCode },
    "@/lib/account-auth/server": {
      AuthError,
      requireIdentity: async () => {
        if (!identity) throw new AuthError("Sign in", 401);
        return i;
      },
      securityRecord: async () => ({
        enrolled,
        recovery_session_id: recoverySession,
      }),
      limit: async () => {},
      requireRecent: (value: any) => {
        if (!verified || recovery || !recent)
          throw new AuthError("Verify again", 428);
      },
      providerRequest: async (
        _i: any,
        path: string,
        method: string,
        body: any,
      ) => {
        calls.push(["provider", path, method, body]);
        if (path.endsWith("/challenge")) return { id: "challenge" };
        if (path.endsWith("/verify"))
          return { access_token: "new-verified-token" };
        if (path === "/factors")
          return {
            id: "new-factor",
            totp: { secret: "TEST", qr_code: "<svg></svg>" },
          };
        return [];
      },
      approve: async () => {
        approvals++;
      },
      audit: async (...args: any[]) => audits.push(args),
      cookieOptions: {},
    },
  };
  const route = moduleAt("../src/app/api/account/auth/route.ts", modules);
  return {
    calls,
    audits,
    get approvals() {
      return approvals;
    },
    post: (body: unknown) =>
      route.POST(
        new Request("http://localhost/api/account/auth", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      ),
  };
}
test("security routes reject anonymous and cross-origin changes before provider calls", async () => {
  for (const options of [{ identity: false }, { origin: false }]) {
    const h = actionHarness(options);
    const r = await h.post({ action: "totp-enroll" });
    assert.ok([401, 403].includes(r.status));
    assert.equal(h.calls.length, 0);
  }
});
test("email cannot enroll over existing MFA, and another session cannot take over recovery enrollment", async () => {
  const h = actionHarness({ verified: false, enrolled: false });
  assert.equal((await h.post({ action: "totp-enroll" })).status, 428);
  assert.ok(!h.calls.some((c) => c[0] === "provider"));
  const recovery = actionHarness({
    verified: false,
    enrolled: false,
    factors: [],
    recoverySession: "different",
  });
  assert.equal((await recovery.post({ action: "totp-enroll" })).status, 403);
});
test("TOTP verification accepts only a registered factor belonging to this identity", async () => {
  const h = actionHarness({ verified: false });
  assert.equal(
    (
      await h.post({
        action: "totp-verify",
        factorId: "someone-elses-factor",
        code: "123456",
      })
    ).status,
    400,
  );
  assert.equal(h.approvals, 0);
  const good = actionHarness({ verified: false });
  assert.equal(
    (
      await good.post({
        action: "totp-verify",
        factorId: "factor-a",
        code: "123456",
      })
    ).status,
    200,
  );
  assert.equal(good.approvals, 1);
  assert.ok(
    good.calls.some(
      (c) =>
        c[1] === "/factors/factor-a/verify" &&
        c[3].challenge_id === "challenge",
    ),
  );
});
test("recovery codes require recent full verification and are stored only as hashes", async () => {
  for (const options of [
    { verified: false },
    { recovery: true },
    { recent: false },
  ])
    assert.equal(
      (await actionHarness(options).post({ action: "recovery-generate" }))
        .status,
      428,
    );
  const h = actionHarness();
  const r = await h.post({ action: "recovery-generate" });
  const data = await r.json();
  assert.equal(data.codes.length, 10);
  const hashes = h.calls.find((c) => c[0] === "account_replace_recovery")[1]
    .p_hashes;
  assert.ok(hashes.every((s: string) => /^[a-f0-9]{64}$/.test(s)));
  assert.ok(!JSON.stringify(h.calls).includes(data.codes[0]));
});
test("the last sign-in method cannot be removed and recovery reset needs a consumed recovery code", async () => {
  assert.equal(
    (
      await actionHarness().post({
        action: "method-remove",
        kind: "totp",
        id: "factor-a",
      })
    ).status,
    400,
  );
  assert.equal(
    (await actionHarness().post({ action: "recovery-reset" })).status,
    403,
  );
});
test("revoking devices is scoped to this owner and excludes the current session", async () => {
  const h = actionHarness();
  assert.equal((await h.post({ action: "sessions-revoke" })).status, 200);
  assert.ok(
    h.calls.some(
      (c) => c[0] === "eq" && c[1] === "user_id" && c[2] === "owner-a",
    ),
  );
  assert.ok(
    h.calls.some(
      (c) => c[0] === "neq" && c[1] === "id" && c[2] === "session-a",
    ),
  );
  assert.ok(h.calls.some((c) => c[0] === "account_security_unlock"));
});

test("passkey assurance requires signed user-verification flag, not presence alone", () => {
  const bytes = Buffer.alloc(37);
  bytes[32] = 1;
  assert.equal(hasUserVerification(bytes.toString("base64url")), false);
  bytes[32] = 5;
  assert.equal(hasUserVerification(bytes.toString("base64url")), true);
  assert.equal(hasUserVerification("invalid"), false);
  assert.equal(hasUserVerification(null), false);
});
