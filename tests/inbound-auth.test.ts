import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gatewaySecretMatches, signInboundSession, verifyInboundSession, inboundJson } from "../src/lib/platform/inbound-auth.ts";
const secret = "fixture-session-secret-never-used-outside-tests";
const now = Date.parse("2026-09-09T14:00:00Z");
const session = { customerId: "aaaaaaaa-1111-4111-8111-111111111111", callId: "bbbbbbbb-1111-4111-8111-111111111111", expires: now + 300000 };
test("booking sessions bind one business and call, reject changes, wrong keys, expiry and extra segments", () => {
  const token = signInboundSession(session, secret);
  assert.deepEqual(verifyInboundSession(token, secret, now), session);
  const [body, sig] = token.split(".");
  const changed = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, "base64url").toString()), customerId: session.callId })).toString("base64url");
  assert.equal(verifyInboundSession(`${changed}.${sig}`, secret, now), null);
  assert.equal(verifyInboundSession(token, secret + "other", now), null);
  assert.equal(verifyInboundSession(token, secret, session.expires), null);
  assert.equal(verifyInboundSession(token + ".ignored", secret, now), null);
  assert.equal(verifyInboundSession(token, "", now), null);
  assert.equal(verifyInboundSession(signInboundSession({ ...session, expires: now + 3600000 }, secret), secret, now), null);
});
test("gateway credentials are compared to a hash and fail closed", () => {
  const hash = createHash("sha256").update(secret).digest("hex");
  assert.equal(gatewaySecretMatches(secret, hash), true);
  assert.equal(gatewaySecretMatches(secret + "wrong", hash), false);
  assert.equal(gatewaySecretMatches("", hash), false);
  assert.equal(gatewaySecretMatches(secret, ""), false);
});
test("incoming endpoints reject oversized bodies and non-object JSON", async () => {
  const req = (body: string) => new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body });
  assert.deepEqual(await inboundJson(req('{"action":"start"}')), { action: "start" });
  await assert.rejects(inboundJson(req("[]")), /object/);
  await assert.rejects(inboundJson(req('{"message":"too long"}'), 5), /large/);
});
