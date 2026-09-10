"use client";

import { useRef, useState } from "react";

export function VoiceExample({ src, transcript }: { src?: string; transcript?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState(false);
  function close() {
    audio.current?.pause();
    if (audio.current) audio.current.currentTime = 0;
    dialog.current?.close();
    trigger.current?.focus();
  }
  return <>
    <button ref={trigger} className="rc-voice-trigger" onClick={() => { setError(false); dialog.current?.showModal(); }}>▷ Hear a voice example</button>
    <dialog ref={dialog} className="rc-voice-dialog" aria-labelledby="voice-example-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="rc-voice-dialog__content">
        <button className="rc-voice-close" aria-label="Close voice example" onClick={close}>×</button>
        <img src="/marketing/receptionist-mascot.png" width={96} height={96} alt="" />
        <p className="rc-benefit-eyebrow">AI voice demonstration</p>
        <h2 id="voice-example-title">Hear your AI receptionist.</h2>
        {src ? <>
          <p>Turn your volume up, then press play.</p>
          <audio ref={audio} controls preload="none" src={src} onError={() => setError(true)} aria-label="AI receptionist voice example" />
          {error && <p role="alert">The audio couldn’t load. Please close this window and try again.</p>}
          <p className="rc-voice-note">A scripted AI-generated demonstration, not a customer call. Your voice is configured during setup.</p>
          {transcript && <details><summary>Read the transcript</summary><p>{transcript}</p></details>}
        </> : <>
          <p>The voice preview is being prepared.</p>
          <p className="rc-voice-note">We’ll add an approved voice sample here. You can explore how booking works below.</p>
          <a href="/features#incoming-calls">Explore phone booking ↗</a>
        </>}
      </div>
    </dialog>
  </>;
}
