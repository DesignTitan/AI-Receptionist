"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLANS, type Plan } from "@/lib/platform/model";
import { HumanCheck } from "@/components/platform/human-check";
import { AuthShell } from "./auth-shell";
import { ceremony } from "./webauthn";
import styles from "./auth.module.css";
type Screen =
  | "signin"
  | "email"
  | "verify"
  | "enroll"
  | "recovery"
  | "settings"
  | "passkey"
  | "authenticator"
  | "codes"
  | "pending"
  | "expired"
  | "devices";
type State = {
  email: string;
  enrolled: boolean;
  verified: boolean;
  recoveryOnly: boolean;
  factors: { id: string; name: string }[];
  passkeys: { id: string; friendly_name?: string }[];
  passkeysEnabled: boolean;
  sessions: {
    id: string;
    label: string;
    created_at: string;
    current: boolean;
  }[];
  remaining: number;
  destination: string;
  recoveryRequest?: { id: string; status: string };
};
const sample: State = {
  email: "bubs@willowstudio.example",
  enrolled: true,
  verified: true,
  recoveryOnly: false,
  factors: [{ id: "example", name: "Authenticator app" }],
  passkeys: [{ id: "example", friendly_name: "My MacBook" }],
  passkeysEnabled: true,
  sessions: [
    {
      id: "this",
      label: "Chrome on Mac",
      created_at: "2026-09-12T12:00:00Z",
      current: true,
    },
    {
      id: "other",
      label: "Safari on iPhone",
      created_at: "2026-09-11T12:00:00Z",
      current: false,
    },
  ],
  remaining: 10,
  destination: "/account",
};
export function AuthFlow({
  signup: initialSignup,
  initial = "signin",
  siteKey = "",
  passkeysEnabled = false,
  preview = false,
}: {
  signup?: { plan: Plan; returnTo: string };
  initial?: Screen;
  siteKey?: string;
  passkeysEnabled?: boolean;
  preview?: boolean;
}) {
  const [signupMode, setSignupMode] = useState(!!initialSignup);
  const [selectedPlan, setSelectedPlan] = useState<Plan | "">(initialSignup?.plan ?? "");
  const signup = signupMode ? { plan: selectedPlan, returnTo: initialSignup?.returnTo ?? "/#terms" } : undefined;
  function switchAccess() {
    setSignupMode((value) => !value);
    setError(""); setMessage(""); setToken(""); setReset((value) => value + 1);
  }
  const [screen, setScreen] = useState<Screen>(initial),
    [state, setState] = useState<State | null>(preview ? sample : null),
    [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [token, setToken] = useState(""),
    [reset, setReset] = useState(0),
    [cooldown, setCooldown] = useState(0),
    [setup, setSetup] = useState<{ qr_code: string; secret: string } | null>(
      null,
    ),
    [showKey, setShowKey] = useState(false),
    [codes, setCodes] = useState<string[]>(
      preview ? Array(10).fill("EXAMPLE–NOT–A–REAL–CODE") : [],
    ),
    [saved, setSaved] = useState(false),
    [loading, setLoading] = useState(initial === "settings" && !preview);
  const heading = useRef<HTMLHeadingElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  function go(next: Screen) {
    setScreen(next);
    setError("");
    setMessage("");
    setCode("");
  }
  useEffect(() => {
    heading.current?.focus();
  }, [screen, signupMode]);
  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  useEffect(() => {
    if (screen === "devices") dialog.current?.showModal();
    else dialog.current?.close();
  }, [screen]);
  async function api(action: string, body: Record<string, unknown> = {}) {
    if (preview)
      throw Error("This is a design preview. Sign in to use account security.");
    const r = await fetch("/api/account/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await r.json();
    if (r.status === 401) {
      go("expired");
      throw Error(data.error);
    }
    if (r.status === 428) {
      go("verify");
      throw Error(data.error);
    }
    if (!r.ok) throw Error(data.error ?? "Please try again.");
    return data;
  }
  async function load(choose = true) {
    if (preview) return sample;
    const r = await fetch("/api/account/auth", { cache: "no-store" });
    const data = await r.json();
    if (!r.ok) {
      if (r.status === 401) {
        go("signin");
        return null;
      }
      throw Error(data.error);
    }
    setState(data);
    if (choose)
      go(
        data.recoveryOnly
          ? "recovery"
          : data.verified
            ? "settings"
            : data.enrolled
              ? "verify"
              : "enroll",
      );
    return data as State;
  }
  useEffect(() => {
    if (initial === "settings" && !preview)
      load()
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, []); // One server-authoritative bootstrap per visit.
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.name === "NotAllowedError"
            ? "The passkey prompt was closed. You can try again or use email."
            : e.message
          : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function passkey(register = false) {
    await run(async () => {
      const options = await api(
        register ? "passkey-register-options" : "passkey-options",
      );
      const credential = await ceremony(options.options, register);
      await api(register ? "passkey-register" : "passkey-signin", {
        credential,
      });
      if (register) {
        await load(false);
        go("verify");
        setMessage("Passkey added. Verify it once to finish setup.");
      } else {
        const current = await load(false);
        if (current?.verified && current.remaining === 0) {
          const data = await api("recovery-generate");
          setCodes(data.codes);
          setSaved(false);
          go("codes");
        } else go(current?.verified ? "settings" : "verify");
      }
    });
  }
  async function enrollTotp() {
    await run(async () => {
      const data = await api("totp-enroll");
      setSetup(data.totp);
      go("authenticator");
    });
  }
  async function generateCodes() {
    await run(async () => {
      const data = await api("recovery-generate");
      setCodes(data.codes);
      setSaved(false);
      go("codes");
    });
  }
  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    await run(async () => {
      if (signup && !signup.plan) throw Error("Choose your plan to continue.");
      if (preview) {
        go("email");
        return;
      }
      const r = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, ...(signup ? { name, plan: signup.plan, returnTo: signup.returnTo } : {}) }),
      });
      const data = await r.json();
      setToken("");
      setReset((n) => n + 1);
      if (!r.ok) throw Error(data.error);
      go("email");
      setCooldown(60);
    });
  }
  function download() {
    const blob = new Blob(
      [
        `AI Receptionist recovery codes\nKeep these private. Each code works once.\n\n${codes.join("\n")}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "ai-receptionist-recovery-codes.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const titles: Record<Screen, string> = {
    signin: signup ? "Create your account." : "Welcome back.",
    email: "Check your inbox.",
    verify: "Let’s make sure it’s you.",
    enroll: "Secure your account.",
    recovery: state?.recoveryOnly
      ? "Let’s restore your access."
      : "A way back in.",
    settings: "Sign-in & security.",
    passkey: "Add a passkey.",
    authenticator: "Connect your authenticator.",
    codes: "Keep a way back in.",
    pending: "Your recovery request is saved.",
    expired: "This link has expired.",
    devices: "Sign-in & security.",
  };
  const button = (label: string, fn: () => void, secondary = false) => (
    <button
      type="button"
      className={secondary ? styles.secondary : styles.primary}
      disabled={busy}
      onClick={fn}
    >
      {label}
    </button>
  );
  const emailForm = (
    <form onSubmit={emailLink}>
      {signup && !initialSignup && <label>Your plan<select required value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value as Plan | "")}><option value="" disabled>Choose a plan</option>{(Object.keys(PLANS) as Plan[]).map((plan) => <option key={plan} value={plan}>{PLANS[plan].name} · ${PLANS[plan].monthly}/month</option>)}</select></label>}
      {signup && <label>Your name<input required autoComplete="name" maxLength={120} pattern=".*\S.*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></label>}
      <label>
        Email address
        <input
          type="email"
          required
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          placeholder="you@yourbusiness.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {siteKey && (
        <HumanCheck siteKey={siteKey} onToken={setToken} reset={reset} />
      )}
      <button
        className={styles.primary}
        disabled={busy || cooldown > 0 || (signupMode && !selectedPlan) || (!preview && (!siteKey || !token))}
      >
        {busy
          ? "Sending…"
          : cooldown
            ? `Try again in ${cooldown}s`
            : signup ? "Create account with email" : "Email me a sign-in link"}
      </button>
      {!siteKey && !preview && (
        <p className={styles.fine}>
          Email sign-in is being prepared. Please try again later.
        </p>
      )}
    </form>
  );
  const verificationForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          await api("totp-verify", {
            code,
            factorId: state?.factors[0]?.id,
            enrollment: screen === "authenticator",
          });
          setSetup(null);
          const current = await load(false);
          if (current?.remaining === 0) {
            const data = await api("recovery-generate");
            setCodes(data.codes);
            setSaved(false);
            go("codes");
          } else go("settings");
        });
      }}
    >
      <label>
        6-digit code
        <input
          className={styles.codeInput}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
        />
      </label>
      <button disabled={busy || code.length !== 6} className={styles.primary}>
        {busy
          ? "Verifying…"
          : screen === "authenticator"
            ? "Verify and enable"
            : "Verify and continue"}
      </button>
    </form>
  );
  return (
    <AuthShell
      landing={screen === "signin"}
      signup={!!signup}
      wide={screen === "settings" || screen === "devices"}
      preview={preview}
    >
      {screen !== "signin" && <p className={styles.eyebrow}>Your account · Your peace of mind</p>}
      <h1 tabIndex={-1} ref={heading}>
        {loading ? "Opening your account…" : titles[screen]}
      </h1>
      {loading ? (
        <p role="status">Checking your sign-in securely.</p>
      ) : (
        <>
          {(screen === "signin" || screen === "expired") && (
            <>
              <p>
                {screen === "expired"
                  ? "Request a fresh link and open it in this browser."
                  : signup ? "A little more time for you starts here. Verify your email, secure your account, then review your plan." : "Your front desk is ready when you are."}
              </p>
              {signup && initialSignup && signup.plan && <p className={styles.note}>Your plan: <strong>{PLANS[signup.plan].name}</strong> · <Link href={signup.returnTo}>Change plan</Link></p>}
              {!signup && (passkeysEnabled || preview) &&
                button("Continue with a passkey", () => passkey())}
              {!signup && (passkeysEnabled || preview) && (
                <div className={styles.divider}>or use email</div>
              )}
              {emailForm}
              <p className={`${styles.fine} ${styles.status}`}>
                {signup ? "No payment is taken here. You’ll set up account security after verifying your email." : "Two-factor verification follows if you’ve secured your account."}
              </p>
              <div className={styles.divider} />
              <p className={styles.fine}>
                {signup ? "Already have an account? " : "Need an account? "}
                <button type="button" className={styles.textButton} disabled={busy} onClick={switchAccess}>
                  {signup ? "Log in" : "Sign up"}
                </button>
              </p>
            </>
          )}
          {screen === "email" && (
            <>
              <div className={styles.icon} aria-hidden="true">
                ✉
              </div>
              <p>
                {signup ? "We’ve requested a verification link for " : "If an account exists for "}
                <strong>{email || sample.email}</strong>{signup ? "." : ", a sign-in link is on its way."} Open the newest email in this browser to continue.
              </p>
              <div className={styles.note}>
                Check your spam folder too. The link is single use; requesting
                another replaces the previous browser sign-in attempt.
              </div>
              <div className={styles.actions}>
                {button(
                  cooldown
                    ? `Resend available in ${cooldown}s`
                    : "Resend sign-in link",
                  () => go("signin"),
                  true,
                )}
                <button
                  className={styles.textButton}
                  onClick={() => go("signin")}
                >
                  Use a different email
                </button>
              </div>
            </>
          )}
          {screen === "verify" && (
            <>
              <p>
                Confirm your identity to continue
                {state?.email ? ` as ${state.email}` : ""}.
              </p>
              {(state?.passkeysEnabled || preview) &&
                button("Use my passkey", () => passkey())}
              {!!state?.factors.length && (
                <>
                  <div className={styles.divider}>authenticator app</div>
                  {verificationForm}
                </>
              )}
              <div className={styles.actions}>
                {button("Use a recovery code", () => go("recovery"), true)}
              </div>
              <p className={`${styles.fine} ${styles.status}`}>
                Email alone cannot unlock your secured account.
              </p>
            </>
          )}
          {screen === "enroll" && (
            <>
              <p>
                Add a sign-in method before opening your account. Then save
                recovery codes so you have a way back in.
              </p>
              <div className={styles.actions}>
                {(state?.passkeysEnabled || preview) &&
                  button("Add a passkey", () => go("passkey"))}
                {button(
                  "Use an authenticator app",
                  enrollTotp,
                  !!state?.passkeysEnabled,
                )}
              </div>
              <div className={styles.note}>
                A passkey uses your device’s security. An authenticator app
                gives you a code that changes every 30 seconds.
              </div>
            </>
          )}
          {screen === "passkey" && (
            <>
              <p>
                Use your device, password manager or security key to sign in.
                Your fingerprint, face scan or device PIN stays on your device.
              </p>
              <div className={styles.note}>
                Your browser will open a secure prompt. Choose another device or
                security key there if you prefer.
              </div>
              <div className={styles.actions}>
                {button("Continue on this device", () => passkey(true))}
                {button(
                  "Back",
                  () => go(state?.verified ? "settings" : "enroll"),
                  true,
                )}
              </div>
            </>
          )}
          {screen === "authenticator" && (
            <>
              <p>1. Scan this code with your authenticator app.</p>
              {setup?.qr_code ? (
                <img
                  className={styles.qr}
                  src={setup.qr_code}
                  alt="Scan this QR code in your authenticator app"
                />
              ) : preview ? (
                <div className={styles.note}>
                  QR code appears here during real enrollment.
                </div>
              ) : (
                <div className={styles.actions}>
                  {button("Start authenticator setup", enrollTotp)}
                </div>
              )}
              {setup && (
                <>
                  <button
                    className={styles.textButton}
                    onClick={() => setShowKey(!showKey)}
                  >
                    Can’t scan? Enter the setup key
                  </button>
                  {showKey && <p className={styles.setupKey}>{setup.secret}</p>}
                </>
              )}
              <p className={styles.status}>
                2. Enter the current code from the app.
              </p>
              {verificationForm}
              <div className={styles.actions}>
                {button(
                  "Back",
                  () => {
                    setSetup(null);
                    go(state?.verified ? "settings" : "enroll");
                  },
                  true,
                )}
              </div>
            </>
          )}
          {screen === "codes" && (
            <>
              <p>
                Save these codes somewhere safe. Each works once, together with
                your email sign-in.
              </p>
              <div className={styles.codes}>
                {codes.map((c, index) => (
                  <code key={index}>{c}</code>
                ))}
              </div>
              <div className={`${styles.actions} ${styles.inline}`}>
                {button(
                  "Copy codes",
                  () =>
                    run(async () => {
                      await navigator.clipboard.writeText(codes.join("\n"));
                      setMessage("Recovery codes copied.");
                    }),
                  true,
                )}
                {button("Download", download, true)}
              </div>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={saved}
                  onChange={(e) => setSaved(e.target.checked)}
                />
                I’ve saved my recovery codes
              </label>
              <button
                className={styles.primary}
                disabled={!saved || busy}
                onClick={() => {
                  setCodes([]);
                  go("settings");
                  load(false).catch((e) => setError(e.message));
                }}
              >
                Continue
              </button>
              <p className={`${styles.fine} ${styles.status}`}>
                Keep these private. Support will never ask you to send them.
                They won’t be shown again.
              </p>
            </>
          )}
          {screen === "recovery" && (
            <>
              {state?.recoveryOnly ? (
                <>
                  <p>
                    Your recovery code has been accepted. Other sessions have
                    been signed out. Replace your lost sign-in methods to regain
                    access.
                  </p>
                  <div className={styles.note}>
                    This removes your existing passkeys, authenticators and
                    remaining recovery codes. You’ll add a new method next.
                    Finish setup before this session expires; keep your unused
                    recovery codes until then.
                  </div>
                  {button("Replace lost sign-in methods", () =>
                    run(async () => {
                      await api("recovery-reset");
                      await load();
                    }),
                  )}
                </>
              ) : (
                <>
                  <p>
                    Enter one of the recovery codes you saved when securing your
                    account.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(async () => {
                        await api("recovery-use", { code });
                        await load();
                      });
                    }}
                  >
                    <label>
                      Recovery code
                      <input
                        autoComplete="off"
                        spellCheck={false}
                        autoCapitalize="characters"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX"
                        maxLength={40}
                      />
                    </label>
                    <button
                      className={styles.primary}
                      disabled={busy || !code.trim()}
                    >
                      Verify recovery code
                    </button>
                  </form>
                  <div className={styles.divider} />
                  <p className={styles.fine}>
                    Lost all your sign-in methods? Request a manual review. Your
                    account stays locked while your identity is checked.
                  </p>
                  {button(
                    "Request account recovery",
                    () =>
                      run(async () => {
                        await api("recovery-request");
                        await load(false);
                        go("pending");
                      }),
                    true,
                  )}
                  <div className={styles.actions}>
                    {button("Back to verification", () => go("verify"), true)}
                  </div>
                </>
              )}
            </>
          )}
          {screen === "pending" && (
            <>
              <div className={styles.icon} aria-hidden="true">
                ↗
              </div>
              <p>
                Your request is waiting for a manual identity review. A request
                alone does not unlock your account.
              </p>
              <div className={styles.note}>
                Contact our team and quote request{" "}
                <strong>
                  {state?.recoveryRequest?.id ?? "shown after submitting"}
                </strong>
                . Never share your authenticator or recovery codes.
              </div>
              <div className={styles.actions}>
                <Link className={styles.primary} href="/#hear">
                  Contact support
                </Link>
                {button("Back to sign in", () => go("signin"), true)}
              </div>
            </>
          )}
          {(screen === "settings" || screen === "devices") && (
            <>
              <p>Manage how you sign in and where your account is open.</p>
              <section className={styles.panel}>
                <h2>Sign-in methods</h2>
                {state?.passkeys.map((key) => (
                  <div className={styles.row} key={key.id}>
                    <div>
                      <strong>{key.friendly_name || "Passkey"}</strong>
                      <small>Passkey · Device protected</small>
                    </div>
                    <button
                      className={styles.textButton}
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api("method-remove", {
                            kind: "passkey",
                            id: key.id,
                          });
                          await load(false);
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {state?.factors.map((f) => (
                  <div className={styles.row} key={f.id}>
                    <div>
                      <strong>{f.name}</strong>
                      <small>Two-factor verification enabled</small>
                    </div>
                    <button
                      className={styles.textButton}
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api("method-remove", {
                            kind: "totp",
                            id: f.id,
                          });
                          await load(false);
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className={`${styles.actions} ${styles.inline}`}>
                  {state?.passkeysEnabled &&
                    button("Add a passkey", () => go("passkey"), true)}
                  {button("Add authenticator", enrollTotp, true)}
                </div>
                {!!state?.passkeys.length && (
                  <details className={styles.status}>
                    <summary>Rename a passkey</summary>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(async () => {
                          await api("passkey-rename", {
                            id: state.passkeys[0].id,
                            name,
                          });
                          setName("");
                          await load(false);
                        });
                      }}
                    >
                      <label>
                        Name for{" "}
                        {state.passkeys[0].friendly_name ?? "your passkey"}
                        <input
                          value={name}
                          maxLength={80}
                          required
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <button className={styles.secondary} disabled={busy}>
                        Save name
                      </button>
                    </form>
                  </details>
                )}
              </section>
              <section className={styles.panel}>
                <h2>Recovery codes</h2>
                <p>
                  {state?.remaining ?? 0} unused codes. Creating a new set
                  replaces all existing codes.
                </p>
                {button(
                  state?.remaining
                    ? "Replace recovery codes"
                    : "Create recovery codes",
                  generateCodes,
                  true,
                )}
              </section>
              <section className={styles.panel}>
                <h2>Your devices</h2>
                {state?.sessions.map((s) => (
                  <div className={styles.row} key={s.id}>
                    <div>
                      <strong>{s.label}</strong>
                      <small>
                        {s.current
                          ? "This device"
                          : `Signed in ${new Date(s.created_at).toLocaleDateString()}`}
                      </small>
                    </div>
                    {!s.current && (
                      <button
                        className={styles.textButton}
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("sessions-revoke", { id: s.id });
                            await load(false);
                            setMessage("Device signed out.");
                          })
                        }
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                ))}
                <div className={styles.actions}>
                  {button("Sign out other devices", () => go("devices"), true)}
                </div>
                <p className={`${styles.fine} ${styles.status}`}>
                  Sessions expire within an hour. You’ll verify again before
                  sensitive changes.
                </p>
              </section>
              <div className={styles.actions}>
                <Link
                  className={styles.primary}
                  href={
                    preview
                      ? "/account/settings?preview=settings"
                      : (state?.destination ?? "/account")
                  }
                >
                  {state?.destination?.startsWith("/start")
                    ? "Continue to your plan"
                    : "Continue to my account"}
                </Link>
                <button
                  className={styles.textButton}
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      if (preview) return;
                      const r = await fetch("/api/account/session", {
                        method: "DELETE",
                      });
                      if (!r.ok)
                        throw Error("Could not sign out. Please try again.");
                      location.assign("/account/login");
                    })
                  }
                >
                  Sign out of this device
                </button>
              </div>
            </>
          )}
        </>
      )}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className={styles.note} role="status">
          {message}
        </div>
      )}
      {busy && (
        <span className={styles.sr} role="status">
          Working…
        </span>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="devices-dialog-title"
        className={styles.dialog}
        onCancel={() => go("settings")}
      >
        <h2 id="devices-dialog-title">Sign out other devices?</h2>
        <p>
          Other devices will need to sign in again. You’ll stay signed in here.
        </p>
        <div className={styles.actions}>
          {button("Cancel", () => go("settings"), true)}
          {button("Sign out devices", () =>
            run(async () => {
              await api("sessions-revoke");
              go("settings");
              await load(false);
              setMessage("Other devices have been signed out.");
            }),
          )}
        </div>
      </dialog>
    </AuthShell>
  );
}
export type { Screen };
