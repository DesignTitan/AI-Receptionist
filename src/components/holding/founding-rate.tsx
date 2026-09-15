"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "sending" | "done" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile in "interaction-only" mode: invisible for a real person, a small
 * checkbox when Cloudflare is unsure, a wall for scripts. The token means nothing until
 * /api/waitlist verifies it with Cloudflare.
 */
function HumanCheck({ siteKey, widgetId, onError }: { siteKey: string; widgetId: React.MutableRefObject<string | null>; onError: (message: string) => void }) {
  const host = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    function render() {
      if (cancelled || !host.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(host.current, {
        sitekey: siteKey, size: "flexible", appearance: "interaction-only", theme: "light",
        "error-callback": () => { onError("The security check couldn't load. Refresh the page or try another browser."); return true; },
        "expired-callback": () => { if (widgetId.current) window.turnstile?.reset(widgetId.current); },
      });
    }
    const loadError = () => onError("The security check couldn't load. Check your connection and try again.");
    let script: HTMLScriptElement | null = null;
    if (window.turnstile) render();
    else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) { script = document.createElement("script"); script.src = TURNSTILE_SRC; script.async = true; document.head.appendChild(script); }
      script.addEventListener("load", render); script.addEventListener("error", loadError);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render); script?.removeEventListener("error", loadError);
      if (widgetId.current && window.turnstile) { try { window.turnstile.remove(widgetId.current); } catch { /* gone */ } }
      widgetId.current = null;
    };
  }, [siteKey, widgetId, onError]);
  return <div ref={host} className="hold-human" />;
}

/**
 * The one action on the holding page: join the list, keep the founding rate.
 * A button opens a dialog with an email and an optional mobile number; the
 * form posts to /api/waitlist, which subscribes the person in Klaviyo.
 */
export function FoundingRate({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const widgetBroken = useRef(false);
  const [opened, setOpened] = useState(false);
  // The widget failing to load is not the visitor's problem: the server has a second bot check.
  const onHumanError = () => { widgetBroken.current = true; };
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  function open() { setOpened(true); dialog.current?.showModal(); setTimeout(() => dialog.current?.querySelector<HTMLInputElement>("input[name=email]")?.focus(), 30); }
  function close() { dialog.current?.close(); }
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    const onClick = (e: MouseEvent) => { if (e.target === d) close(); };
    d.addEventListener("click", onClick); return () => d.removeEventListener("click", onClick);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (turnstileSiteKey && !widgetBroken.current) {
      const token = window.turnstile?.getResponse(widgetId.current ?? undefined) ?? "";
      if (!token) { setError("One moment while we check you're a person, then try again."); setState("error"); return; }
      data.turnstileToken = token;
    }
    setState("sending"); setError(null);
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) { setError(body.error ?? "That didn't go through. Try again in a moment."); setState("error"); if (widgetId.current) window.turnstile?.reset(widgetId.current); return; }
      setState("done");
    } catch { setError("Couldn't reach the server. Try again in a moment."); setState("error"); }
  }

  return (
    <div className="hold-offer">
      <button type="button" className="hold-button" onClick={open}>I want in</button>
      <p className="hold-offer__line">Sign up before launch and lock in the founding rate for your first six months. Terms at launch.</p>

      <dialog ref={dialog} className="hold-dialog" aria-labelledby="founding-title">
        <div className="hold-dialog__panel">
          <button type="button" className="hold-dialog__close" aria-label="Close" onClick={close}>×</button>
          {state === "done" ? (
            <div className="hold-dialog__done">
              <p className="hold-pill"><span aria-hidden="true" />You're on the list</p>
              <h2 id="founding-title">Founding rate, saved for you.</h2>
              <p>We'll message you the moment bubs opens, with your founding rate for the first six months. Nothing else until then.</p>
              <button type="button" className="hold-button" onClick={close}>Done</button>
            </div>
          ) : (
            <form className="hold-form" onSubmit={submit}>
              <p className="hold-pill"><span aria-hidden="true" />Founding rate</p>
              <h2 id="founding-title">Be first through the door.</h2>
              <p className="hold-form__lede">Leave an email or a mobile number. When bubs launches you'll hear first, with the founding rate locked for your first six months.</p>
              <label className="hold-field"><span>Email</span><input name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@yourbusiness.com" maxLength={120} /></label>
              <label className="hold-field"><span>Mobile number <em>optional</em></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(415) 555 0142" maxLength={24} value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label className="hold-field"><span>Your business <em>optional</em></span><input name="business" type="text" placeholder="Solstice Salon" maxLength={80} /></label>
              {phone.trim() && (
                <label className="hold-consent"><input name="sms_consent" type="checkbox" value="yes" /><span>Text me about the launch and the founding rate. Message and data rates may apply; reply STOP to opt out.</span></label>
              )}
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hold-hp" aria-hidden="true" />
              {turnstileSiteKey && opened && <HumanCheck siteKey={turnstileSiteKey} widgetId={widgetId} onError={onHumanError} />}
              <button type="submit" className="hold-button hold-button--wide" disabled={state === "sending"}>{state === "sending" ? "Saving your spot" : "Save my spot"}</button>
              {error && <p className="hold-form__error" role="alert">{error}</p>}
              <p className="hold-form__note">One email or text when we open. No newsletters, no sharing your details.</p>
              <p className="hold-form__legal">By saving your spot you agree to receive one launch message from bubs and to the founding-rate terms, which will be published at launch and apply for your first six months on the plan you choose. Your details are stored securely and never sold. Unsubscribe any time. bubs is a product of Manifest Studios and Conjure.ai.</p>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
