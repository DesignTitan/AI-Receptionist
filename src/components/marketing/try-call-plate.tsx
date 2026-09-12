"use client";

import { useEffect, useRef, useState } from "react";
import type { CallOutcome, CallStatus } from "@/lib/types";

type Live = {
  status: CallStatus;
  outcome: CallOutcome;
  transcript: string | null;
  summary: string | null;
  durationSeconds: number | null;
};

type Started = { id: string; reference: string; simulated: boolean; name: string; opening: string };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
  }
}

const STAGES: { key: CallStatus; label: string; detail: string }[] = [
  { key: "queued", label: "Queued", detail: "Handing your number to the assistant" },
  { key: "ringing", label: "Calling you", detail: "Your phone should ring any second" },
  { key: "in_progress", label: "On the call", detail: "Ava is talking to you" },
  { key: "completed", label: "Done", detail: "Recorded, transcribed, summarised" },
];

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile, rendered explicitly so it survives the form being
 * unmounted and remounted ("ask again"). Always visible, so a person can see
 * they have been verified; a small interaction when Cloudflare is unsure. The token it yields is only worth
 * anything once the server verifies it, which the API does before dialling.
 */
function HumanCheck({ siteKey, widgetId, onError }: { siteKey: string; widgetId: React.MutableRefObject<string | null>; onError: (message: string) => void }) {
  const host = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    function render() {
      if (cancelled || !host.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(host.current, { sitekey: siteKey, size: "flexible", appearance: "always", theme: "auto", "error-callback": () => { onError("The security check couldn’t load. Refresh the page or try another browser."); return true; }, "expired-callback": () => { if (widgetId.current) window.turnstile?.reset(widgetId.current); } });
    }
    const loadError = () => onError("The security check couldn’t load. Check your connection and try again.");
    let script: HTMLScriptElement | null = null;
    if (window.turnstile) render();
    else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", loadError);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render); script?.removeEventListener("error", loadError);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
      }
      widgetId.current = null;
    };
  }, [siteKey, widgetId, onError]);
  return <div ref={host} className="rc-try__human" />;
}

/**
 * The signature move: type your name and number, the page places a real call,
 * and the plate mirrors it in the product's own stages, then shows the
 * transcript and the summary of your own call. On a deployment with no voice
 * line (or no human check) the server records the lead instead, and this plate
 * says so plainly: it never walks stages for a call that was not placed.
 * Publishes `data-sc-verify-state` on its root so the scroll harness can see
 * this bespoke stage change.
 */
export function TryCallPlate({ simulated, turnstileSiteKey, compact = false }: { simulated: boolean; turnstileSiteKey: string | null; compact?: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [sales, setSales] = useState(simulated);
  const [preferredTime, setPreferredTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [call, setCall] = useState<Started | null>(null);
  const [live, setLive] = useState<Live | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const widgetId = useRef<string | null>(null);
  // The check runs on every submission when keys exist, live call or callback request alike.
  const humanCheck = !!turnstileSiteKey;

  const terminal = live?.status === "completed" || live?.status === "failed";
  const state = !call ? "idle" : call.simulated ? "requested" : terminal ? `done:${live?.outcome ?? "none"}` : `dialing:${live?.status ?? "queued"}`;

  useEffect(() => {
    if (!call || call.simulated || terminal) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/try-call/${call.id}?ref=${encodeURIComponent(call.reference)}`, { cache: "no-store" });
        if (r.ok) setLive(await r.json());
      } catch {
        /* next tick */
      }
    }, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [call, terminal]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const hp = (e.currentTarget.elements.namedItem("company_website") as HTMLInputElement | null)?.value;
    const turnstileToken = humanCheck ? window.turnstile?.getResponse(widgetId.current ?? undefined) ?? "" : undefined;
    if (humanCheck && !turnstileToken) {
      setError("One moment: the check that you're a person hasn't finished. Try again in a second.");
      setBusy(false);
      return;
    }
    try {
      const r = await fetch("/api/try-call", {
        method: "POST",
        signal: AbortSignal.timeout(20_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, business, turnstileToken, company_website: hp, intent: sales ? "sales" : "demo", preferredTime: sales ? preferredTime : undefined }),
      });
      const data = await r.json().catch(() => ({ error: "We couldn’t save your request. Please try again." }));
      if (!r.ok) {
        setError(data.error ?? "That didn't work. Try again.");
        if (humanCheck && widgetId.current) window.turnstile?.reset(widgetId.current);
        return;
      }
      setCall({ id: data.id, reference: data.reference, simulated: !!data.simulated, name: data.name ?? name, opening: data.opening ?? "" });
      if (!data.simulated) setLive({ status: "queued", outcome: null, transcript: null, summary: null, durationSeconds: null });
    } catch {
      setError("We couldn’t confirm your request was saved. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  /** Back to the form with their details kept, for another call. */
  function again() {
    if (timer.current) clearInterval(timer.current);
    setCall(null);
    setLive(null);
    setError(null);
  }

  const activeIndex = Math.max(0, STAGES.findIndex((s) => s.key === (live?.status === "failed" ? "completed" : live?.status ?? "queued")));

  return (
    <div
      className={compact ? "rc-plate__inner rc-plate__inner--compact" : "rc-plate__inner"}
      // the scroll harness watches the chapter's own plate, not the copy in the nav
      data-sc-verify-state={compact ? undefined : state}
      data-sc-verify-hold={!compact && (terminal || call?.simulated) ? "true" : undefined}
    >
      {!call ? (
        <form className="rc-try" onSubmit={submit}>
          {!compact && !simulated && <label className="rc-try__field"><span>How would you like to connect?</span><select value={sales ? "sales" : "demo"} onChange={e => setSales(e.target.value === "sales")}><option value="demo">Try a real AI phone call now</option><option value="sales">Request a sales conversation</option></select></label>}
          <label className="rc-try__field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Nadia" maxLength={60} required />
          </label>
          <label className="rc-try__field">
            <span>Your number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(415) 555 0142"
              required
            />
          </label>
          <label className="rc-try__field">
            <span>What you run (optional)</span>
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="a salon, a dental practice, a studio"
              maxLength={80}
            />
          </label>
          {!compact && sales && <label className="rc-try__field"><span>Preferred day &amp; time (optional)</span><input value={preferredTime} onChange={e => setPreferredTime(e.target.value)} placeholder="Tuesday afternoon, Eastern time" maxLength={160} /><small>Include your time zone. We’ll confirm availability with you.</small></label>}
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="rc-hp" aria-hidden="true" />
          {humanCheck && <HumanCheck siteKey={turnstileSiteKey!} widgetId={widgetId} onError={setError} />}
          <button type="submit" className="rc-cta" disabled={busy}>
            {busy ? "Sending" : sales ? "Request a sales call" : "Call me now"}
          </button>
          {error && <p className="rc-try__error" role="alert">{error}</p>}
          <p className="rc-try__note">
            {sales
              ? "This requests a phone conversation with a person. Your preferred time is a request, not a confirmed booking."
              : "US and Canadian numbers. The call is recorded. Two calls per number a day. We check that you're a person before dialling."}
          </p>
        </form>
      ) : call.simulated ? (
        <div className="rc-track">
          <div className="rc-track__result">
            <p className="rc-track__summary">
              <span>Callback requested</span>
              Thanks, {call.name}. We’ve received your request.
            </p>
            <p className="rc-track__plain">
              {sales ? "Our team will follow up to arrange a time to speak. No call has been placed yet." : "The AI call is unavailable right now. Your callback request has been saved for our team."}
            </p>
            {!sales && call.opening && (
              <div className="rc-track__transcript">
                <p>
                  <span className="rc-track__who">Ava</span>
                  {call.opening}
                </p>
              </div>
            )}
            <div className="rc-track__actions">
              <button type="button" className="rc-cta rc-cta--ghost" onClick={again}>Ask again</button>
            </div>
            <p className="rc-track__ref">Reference {call.reference}</p>
          </div>
        </div>
      ) : (
        <div className="rc-track">
          <ol className="rc-track__stages">
            {STAGES.map((s, i) => {
              const done = i < activeIndex || terminal;
              const cur = i === activeIndex && !terminal;
              return (
                <li key={s.key} data-state={done ? "done" : cur ? "current" : "todo"}>
                  <span className="rc-track__dot" aria-hidden />
                  <span className="rc-track__label">{s.label}</span>
                  <span className="rc-track__detail">{s.detail}</span>
                </li>
              );
            })}
          </ol>
          {terminal && (
            <div className="rc-track__result">
              {live?.status === "failed" && !live.summary && (
                <p className="rc-track__plain">The call didn&rsquo;t connect. A person has your number and will call you back.</p>
              )}
              {live?.summary && (
                <p className="rc-track__summary">
                  <span>What Ava recorded</span>
                  {live.summary}
                </p>
              )}
              {live?.transcript && (
                <div className="rc-track__transcript">
                  {live.transcript.split("\n").map((line, i) => {
                    const [who, ...rest] = line.split(":");
                    return (
                      <p key={i}>
                        <span className="rc-track__who">{who.trim()}</span>
                        {rest.join(":").trim()}
                      </p>
                    );
                  })}
                </div>
              )}
              <div className="rc-track__actions">
                <button type="button" className="rc-cta" onClick={again}>Have it call you again</button>
              </div>
              <p className="rc-track__ref">Reference {call.reference}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
