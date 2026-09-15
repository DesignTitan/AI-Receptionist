"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "sending" | "done" | "error";

/**
 * The one action on the holding page: join the list, keep the founding rate.
 * A button opens a dialog with an email and an optional mobile number; the
 * form posts to /api/waitlist, which subscribes the person in Klaviyo.
 */
export function FoundingRate() {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  function open() { dialog.current?.showModal(); setTimeout(() => dialog.current?.querySelector<HTMLInputElement>("input[name=email]")?.focus(), 30); }
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
    setState("sending"); setError(null);
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) { setError(body.error ?? "That didn't go through. Try again in a moment."); setState("error"); return; }
      setState("done");
    } catch { setError("Couldn't reach the server. Try again in a moment."); setState("error"); }
  }

  return (
    <div className="hold-offer">
      <p className="hold-offer__line"><strong>Sign up before launch and keep the founding rate</strong> for as long as you stay with us.</p>
      <button type="button" className="hold-button" onClick={open}>Keep the founding rate <span aria-hidden="true">↗</span></button>

      <dialog ref={dialog} className="hold-dialog" aria-labelledby="founding-title">
        <div className="hold-dialog__panel">
          <button type="button" className="hold-dialog__close" aria-label="Close" onClick={close}>×</button>
          {state === "done" ? (
            <div className="hold-dialog__done">
              <p className="hold-pill"><span aria-hidden="true" />You're on the list</p>
              <h2 id="founding-title">Founding rate, saved for you.</h2>
              <p>We'll message you the moment bubs opens, with the rate you were promised. Nothing else until then.</p>
              <button type="button" className="hold-button" onClick={close}>Done</button>
            </div>
          ) : (
            <form className="hold-form" onSubmit={submit}>
              <p className="hold-pill"><span aria-hidden="true" />Founding rate</p>
              <h2 id="founding-title">Be first through the door.</h2>
              <p className="hold-form__lede">Leave an email or a mobile number. When bubs launches you'll hear first, and the founding rate is yours to keep.</p>
              <label className="hold-field"><span>Email</span><input name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@yourbusiness.com" maxLength={120} /></label>
              <label className="hold-field"><span>Mobile number <em>optional</em></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(415) 555 0142" maxLength={24} value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label className="hold-field"><span>Your business <em>optional</em></span><input name="business" type="text" placeholder="Solstice Salon" maxLength={80} /></label>
              {phone.trim() && (
                <label className="hold-consent"><input name="sms_consent" type="checkbox" value="yes" /><span>Text me about the launch and the founding rate. Message and data rates may apply; reply STOP to opt out.</span></label>
              )}
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hold-hp" aria-hidden="true" />
              <button type="submit" className="hold-button hold-button--wide" disabled={state === "sending"}>{state === "sending" ? "Saving your spot" : "Save my spot"}</button>
              {error && <p className="hold-form__error" role="alert">{error}</p>}
              <p className="hold-form__note">One email or text when we open. No newsletters, no sharing your details.</p>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}
