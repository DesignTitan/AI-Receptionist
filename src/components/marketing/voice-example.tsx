"use client";

import { useEffect, useRef, useState } from "react";
import type { WebSession } from "@omnidim-ai/client";

export function VoiceExample() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const session = useRef<WebSession | null>(null);
  const generation = useRef(0);
  const deadline = useRef(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [seconds, setSeconds] = useState(90);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const busy = status === "connecting" || status === "active";

  function stop() {
    generation.current++;
    session.current?.stop();
    session.current = null;
    setStatus("ended");
    setMuted(false);
  }
  useEffect(() => {
    const onLeave = () => { generation.current++; session.current?.stop(); };
    window.addEventListener("pagehide", onLeave);
    return () => { onLeave(); window.removeEventListener("pagehide", onLeave); };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) stop();
    }, 250);
    return () => clearInterval(timer);
  }, [busy]);
  async function open() {
    setError(""); setCaption(""); setStatus("idle"); setAvailable(null);
    dialog.current?.showModal();
    try {
      const response = await fetch("/api/voice-demo/session", { cache: "no-store" });
      const data = await response.json();
      setAvailable(response.ok && data.available === true);
    } catch { setAvailable(false); }
  }
  function close() {
    stop();
    dialog.current?.close(); trigger.current?.focus();
  }
  async function start() {
    if (busy || !available) return;
    setError(""); setCaption(""); setMuted(false);
    setStatus("connecting"); setSeconds(90); deadline.current = Date.now() + 90_000;
    const run = ++generation.current;
    let current: WebSession | null = null;
    try {
      // Ask before reserving a paid session. Release this preflight stream immediately.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      if (run !== generation.current) return;
      const response = await fetch("/api/voice-demo/session", { method: "POST", signal: AbortSignal.timeout(15_000) });
      const data = await response.json();
      if (run !== generation.current) return;
      if (!response.ok) throw new Error(data.error);
      const { WebSession } = await import("@omnidim-ai/client");
      if (run !== generation.current) return;
      current = new WebSession(); session.current = current;
      current.on("status", value => {
        if (run !== generation.current) { if (value === "active") current?.stop(); return; }
        if (typeof value === "object") { setStatus("ended"); setMuted(false); }
        else setStatus(value);
      });
      current.on("transcript", value => {
        if (run === generation.current) setCaption(`${value.role === "agent" ? "Receptionist" : "You"}: ${value.text}`);
      });
      current.on("error", () => {
        if (run === generation.current) { stop(); setError("The conversation was interrupted. Please try again."); }
      });
      await current.start({ wsUrl: data.wsUrl });
      if (run !== generation.current) current.stop();
    } catch (reason) {
      current?.stop();
      if (run !== generation.current) return;
      setStatus("ended");
      setError(reason instanceof Error && reason.name === "NotAllowedError"
        ? "Microphone access is off. Allow it in your browser to talk, then try again."
        : "We couldn’t start the conversation. Check your microphone and connection, then try again.");
    }
  }
  return <>
    <button ref={trigger} className="rc-voice-trigger" onClick={open}>▷ Meet your AI receptionist</button>
    <dialog ref={dialog} className="rc-voice-dialog" aria-labelledby="voice-example-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="rc-voice-dialog__content">
        <button className="rc-voice-close" aria-label="Close voice example" onClick={close}>×</button>
        <div className="rc-voice-heading">
          <div><p className="rc-benefit-eyebrow">A little hello. A lot of possibility.</p>
          <h2 id="voice-example-title">Meet your<br />AI receptionist.</h2>
          <p>No prerecorded answers.<br />Just you and a receptionist that listens.</p></div>
          <div className="rc-voice-mascot" aria-hidden="true"><img src="/marketing/receptionist-mascot.png" width={160} height={160} alt="" /><span>✧</span></div>
        </div>
        <section className="rc-voice-live" aria-label="Practice conversation">
          <div><span className="rc-benefit-eyebrow">Try it for yourself · 90 seconds</span><h3>A real conversation. A practice booking.</h3>
          <p>Ask for an appointment. Change your mind. See how it responds.</p></div>
          <div className="rc-voice-live__actions">
            {busy ? <><span role="status">{status === "connecting" ? "Connecting…" : "Conversation in progress"}</span><span className="rc-voice-timer" aria-label="Time remaining">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
            {status === "active" && <button onClick={() => { session.current?.mute(!muted); setMuted(!muted); }} aria-pressed={muted}>{muted ? "Unmute" : "Mute"}</button>}
            <button onClick={stop}>End conversation</button></> : <button disabled={!available} onClick={start}>{available === null ? "Checking availability…" : available ? (status === "ended" ? "Talk again" : "Let’s talk") : "Live connection unavailable"}</button>}
          </div>
          <p className="rc-voice-note">Turn your volume up and allow your microphone when asked. No signup or phone number. Fictional appointments only.</p>
          {available === false && <p className="rc-voice-note">We’re connecting the live experience. The conversation will be available here once connected.</p>}
          {caption && <p className="rc-voice-caption">{caption}</p>}
          {status === "ended" && available && !error && <p role="status">Conversation ended. No appointment was created.</p>}
        </section>
        {error && <p role="alert">{error}</p>}
        <div className="rc-voice-prompts"><span className="rc-benefit-eyebrow">Not sure where to start?</span><p>“Do you have anything Thursday?”</p><p>“Actually, could we try a different time?”</p><p>“What happens if I need to speak to someone?”</p></div>
        <div className="rc-voice-choice-note"><strong>Your business. Your voice.</strong><p>This demo introduces one AI receptionist. Explore available voice options during setup to find the right fit for your business.</p></div>
        <p className="rc-voice-note">This is a live AI conversation, with responses generated as you speak. It demonstrates fictional bookings only. Your audio is processed by our voice provider; please use fictional details.</p>
      </div>
    </dialog>
  </>;
}
