// UI integration checks use isolated example API responses; they do not contact real accounts.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { resolve } from "node:path";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const origin = "http://localhost:3101";
const states = [
  "signin",
  "email",
  "verify",
  "enroll",
  "passkey",
  "authenticator",
  "codes",
  "recovery",
  "pending",
  "expired",
  "settings",
  "devices",
];
const capture = process.argv.includes("--capture");
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const width of process.argv.includes("--flows")
    ? []
    : [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const state of states) {
      const r = await page.goto(`${origin}/account/login?preview=${state}`, {
        waitUntil: "networkidle",
      });
      assert.ok(r.ok());
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.locator("h1").isVisible(),
        `${width}/${state} heading`,
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(overflow, false, `${width}/${state} horizontal overflow`);
      if (state === "devices") {
        assert.ok(await page.locator("dialog").isVisible());
        const box = await page.locator("dialog").boundingBox();
        assert.ok(
          Math.abs(box.x + box.width / 2 - width / 2) < 2,
          "Dialog must be centered horizontally",
        );
        assert.ok(
          Math.abs(box.y + box.height / 2 - 450) < 2,
          "Dialog must be centered vertically",
        );
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        assert.equal(await page.locator("dialog").isVisible(), false);
      }
      if (state === "codes") {
        const next = page.getByRole("button", {
          name: "Continue",
          exact: true,
        });
        assert.ok(await next.isDisabled());
        await page.getByRole("checkbox").check();
        assert.ok(await next.isEnabled());
      }
      if (capture && width === 1440) {
        if (state === "devices")
          await page
            .getByRole("button", {
              name: "Sign out other devices",
              exact: true,
            })
            .click();
        await page.addStyleTag({
          content:
            'ai-dev-toolbar,nextjs-portal{display:none!important}html{--workspace-top-offset:0px!important}body{padding-top:0!important}[class*="auth-module"][class*="preview"]{display:none!important}',
        });
        await page.screenshot({
          path: resolve(`dev/thumbnails/auth-${state}.jpg`),
          type: "jpeg",
          quality: 78,
        });
      }
    }
  }
  // Exercise actual forms, code-save gating, recovery and revocation against a stateful API simulator.
  await page.setViewportSize({ width: 1440, height: 900 });
  let state = {
    email: "owner@example.test",
    verified: false,
    enrolled: false,
    recoveryOnly: false,
    factors: [],
    passkeys: [],
    passkeysEnabled: true,
    sessions: [],
    remaining: 0,
    destination: "/account",
  };
  let credentialId = "";
  const calls = [];
  const cdp = await context.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  await page.route("**/api/account/auth", async (route) => {
    let response = state;
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      calls.push(body.action);
      if (process.argv.includes("--flows")) console.log(body.action);
      response = { ok: true };
      if (body.action === "totp-enroll")
        response = {
          id: "totp",
          totp: {
            secret: "EXAMPLE",
            qr_code:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"/%3E',
          },
        };
      if (body.action === "totp-verify") {
        assert.equal(body.code, "123456");
        state = {
          ...state,
          verified: true,
          enrolled: true,
          factors: [{ id: "totp", name: "Authenticator app" }],
          sessions: [
            {
              id: "current",
              label: "Chrome on Mac",
              current: true,
              created_at: new Date().toISOString(),
            },
            {
              id: "other",
              label: "Safari on iPhone",
              current: false,
              created_at: new Date().toISOString(),
            },
          ],
        };
      }
      if (body.action === "recovery-generate") {
        response = {
          codes: Array.from({ length: 10 }, (_, n) => `EXAMPLE-${n}-CODE`),
        };
        state.remaining = 10;
      }
      if (body.action === "sessions-revoke")
        state.sessions = state.sessions.filter((s) => s.current);
      if (body.action === "passkey-register-options")
        response = {
          challenge_id: "register",
          options: {
            challenge: Buffer.from(
              "example-registration-challenge-1234",
            ).toString("base64url"),
            rp: { name: "AI Receptionist", id: "localhost" },
            user: {
              id: Buffer.from("example-user").toString("base64url"),
              name: "owner@example.test",
              displayName: "Example owner",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: {
              residentKey: "required",
              userVerification: "required",
            },
            attestation: "none",
            timeout: 60000,
          },
        };
      if (body.action === "passkey-register") {
        assert.ok(body.credential.response.attestationObject);
        credentialId = body.credential.rawId;
        state.passkeys = [{ id: "passkey", friendly_name: "Virtual test key" }];
      }
      if (body.action === "passkey-options")
        response = {
          challenge_id: "signin",
          options: {
            challenge: Buffer.from(
              "example-authentication-challenge-123",
            ).toString("base64url"),
            rpId: "localhost",
            userVerification: "required",
            allowCredentials: [{ type: "public-key", id: credentialId }],
            timeout: 60000,
          },
        };
      if (body.action === "passkey-signin") {
        assert.ok(body.credential.response.signature);
        state.verified = true;
      }
    }
    await route.fulfill({ json: response });
  });
  await page.goto(`${origin}/account/security`);
  await page.getByRole("button", { name: "Use an authenticator app" }).click();
  await page.getByLabel("6-digit code").fill("123456");
  await page.getByRole("button", { name: "Verify and enable" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Sign out other devices", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sign out devices", exact: true })
    .click();
  await page.getByText("Other devices have been signed out.").waitFor();
  assert.equal(state.sessions.length, 1);
  await page
    .getByRole("button", { name: "Add a passkey", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continue on this device", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Use my passkey", exact: true })
    .click();
  await page.getByRole("heading", { name: "Sign-in & security." }).waitFor();
  assert.ok(
    calls.includes("passkey-register") && calls.includes("passkey-signin"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 48 responsive screens; TOTP, recovery-code save, session revocation and native WebAuthn UI ceremonies (simulated server).",
  );
} catch (error) {
  await page.screenshot({ path: "/tmp/auth-flow-failure.png", fullPage: true });
  console.log(await page.locator("main").innerText());
  throw error;
} finally {
  await browser.close();
}
