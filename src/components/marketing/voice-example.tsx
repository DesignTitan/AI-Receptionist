"use client";

import { useEffect, useRef, useState } from "react";
import type { WebSession } from "@omnidim-ai/client";

function VoiceIcon({ kind }: { kind: "mic" | "muted" | "end" }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "end" ? <path d="M3 15v-4c5-5 13-5 18 0v4l-5-1v-3a13 13 0 0 0-8 0v3z" /> : <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />{kind === "muted" && <path d="m3 3 18 18" />}</>}
  </svg>;
}

export function VoiceDemoTrigger({ className = "rc-voice-trigger" }: { className?: string }) {
  return <button className={className} onClick={event => window.dispatchEvent(new CustomEvent("open-receptionist-demo", { detail: event.currentTarget }))}>Meet your AI receptionist <span aria-hidden="true">↗</span></button>;
}

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
  const [captions, setCaptions] = useState({ user: "", agent: "" });
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
  useEffect(() => {
    const onOpen = (event: Event) => {
      trigger.current = (event as CustomEvent<HTMLButtonElement>).detail;
      void open();
    };
    window.addEventListener("open-receptionist-demo", onOpen);
    return () => window.removeEventListener("open-receptionist-demo", onOpen);
  }, []);
  async function open() {
    setError(""); setCaptions({ user: "", agent: "" }); setStatus("idle"); setAvailable(null);
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
    setError(""); setCaptions({ user: "", agent: "" }); setMuted(false);
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
        if (run === generation.current) setCaptions(previous => ({ ...previous, [value.role]: value.text }));
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
    <VoiceDemoTrigger />
    <dialog ref={dialog} className="rc-voice-dialog" aria-labelledby="voice-example-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="rc-voice-dialog__content">
        <button className="rc-voice-close" aria-label="Close voice example" onClick={close}>×</button>
        <header className="rc-voice-heading">
          <p className="rc-voice-eyebrow">Meet your AI receptionist</p>
          <h2 id="voice-example-title">Go ahead. <span>Say hello.</span></h2>
          <p>Ask a question. Try a booking.<span className="rc-voice-desktop-copy"> See how it responds.</span></p>
        </header>
        <div className="rc-voice-layout">
          <div className="rc-voice-visual">
            <div className="rc-voice-mascot" aria-hidden="true">
              <svg className="rc-voice-rays" viewBox="0 0 400 240" fill="none" stroke="#b2dccb" strokeWidth="9" strokeLinecap="round"><path d="m35 67 19 15M24 117h24m-13 50 19-15M365 67l-19 15m30 35h-24m13 50-19-15" /></svg>
              <img src={busy ? "/marketing/happy-pillow-listening.png" : "/marketing/happy-pillow-mascot.png"} width={300} height={300} alt="" />
              <div className="rc-voice-ripple" />
            </div>
            <div className="rc-voice-wave" data-active={status === "active" && !muted} aria-hidden="true">{[4,7,11,18,25,34,23,39,49,32,24,36,23,17,10,7,4].map((height, i) => <i key={i} style={{ height, animationDelay: `${i * -0.13}s` }} />)}</div>
            <p className="rc-voice-visual-status" role="status">{status === "connecting" ? "Connecting…" : status === "active" ? muted ? "Microphone muted" : "Microphone on" : status === "ended" ? "Conversation ended" : "A little hello. A lot of possibility."}</p>
          </div>
          <section className="rc-voice-conversation" aria-label="Live conversation">
            <p className="rc-voice-eyebrow rc-voice-live-label"><i data-live={status === "active"} aria-hidden="true" />{status === "active" ? "Live conversation" : status === "ended" ? "Your conversation" : "Try a live conversation"}</p>
            <div className="rc-voice-captions" aria-label="Live captions" tabIndex={0}>
              {!captions.user && !captions.agent ? <div className="rc-voice-empty"><h3>{status === "connecting" ? "Getting ready to listen." : status === "active" ? "You’re connected." : "What would you like to ask?"}</h3><p>{status === "active" ? "Your live conversation will appear here." : "Try booking an appointment, or ask how it could help your business."}</p></div> : <>
                {captions.user && <div className="rc-voice-message rc-voice-message--user"><span>You</span><p>{captions.user}</p></div>}
                {captions.agent && <div className="rc-voice-message rc-voice-message--agent"><img src="/marketing/happy-pillow-mascot.png" width={38} height={38} alt="" /><div><span>AI receptionist</span><p>{captions.agent}</p></div></div>}
              </>}
            </div>
            <div className="rc-voice-dock">
              {busy ? <>
                <button className="rc-voice-mute" disabled={status !== "active"} onClick={() => { session.current?.mute(!muted); setMuted(!muted); }} aria-pressed={muted}><VoiceIcon kind={muted ? "muted" : "mic"} /><span>{muted ? "Unmute" : "Mute"}</span></button>
                <span className="rc-voice-timer" aria-label="Time remaining">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
                <button className="rc-voice-primary rc-voice-end" onClick={stop}><VoiceIcon kind="end" /><span>End call</span></button>
              </> : <button className="rc-voice-primary rc-voice-start" disabled={!available} onClick={start}><VoiceIcon kind="mic" /><span>{available === null ? "Checking connection…" : available ? status === "ended" ? "Talk again" : "Let’s talk" : "Currently unavailable"}</span></button>}
            </div>
            {error ? <p className="rc-voice-help" role="alert">{error}</p> : <p className="rc-voice-help">{available === false ? "The live connection is unavailable. Please try again later." : busy ? "AI responds live. No real appointment is made." : status === "ended" ? "No real appointment was made. Ready for another hello?" : "Turn up your volume · Allow your microphone"}</p>}
          </section>
        </div>
        <footer className="rc-voice-footer"><p>90-second live demo · No signup<span> · Practice bookings only</span></p><small>Audio is processed by our voice provider. Please use fictional details.</small></footer>
      </div>
    </dialog>
  </>;
}
