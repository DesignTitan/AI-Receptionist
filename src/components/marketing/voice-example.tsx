"use client";

import { useEffect, useRef, useState } from "react";

const VOICES = [
  { name: "Ainsley", src: "/audio/voice-ainsley.mp3" },
  { name: "Grady", src: "/audio/voice-grady.mp3" },
  { name: "Brielle", src: "/audio/voice-brielle.mp3" },
];
const TRANSCRIPT = "Thanks for calling. I'm the AI receptionist. I'd be happy to help you book an appointment. What day works best for you? Thursday afternoon? Let me check the available times. I have two thirty or four o'clock. Which would you prefer? Two thirty, perfect. May I have your name? Thanks, Alex. That's Thursday at two thirty. Shall I book that for you? You're all booked. We look forward to seeing you.";

export function VoiceExample() {
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState(false);
  const voice = VOICES[selected];
  useEffect(() => {
    const player = audio.current;
    return () => { player?.pause(); };
  }, [selected]);
  function close() {
    audio.current?.pause();
    if (audio.current) audio.current.currentTime = 0;
    dialog.current?.close();
    trigger.current?.focus();
  }
  function selectVoice(index: number) {
    audio.current?.pause();
    setError(false);
    setSelected(index);
  }
  async function replay() {
    if (!audio.current) return;
    setError(false);
    audio.current.currentTime = 0;
    try { await audio.current.play(); } catch { setError(true); }
  }
  return <>
    <button ref={trigger} className="rc-voice-trigger" onClick={() => { setError(false); dialog.current?.showModal(); }}>▷ Hear a voice example</button>
    <dialog ref={dialog} className="rc-voice-dialog" aria-labelledby="voice-example-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="rc-voice-dialog__content">
        <button className="rc-voice-close" aria-label="Close voice example" onClick={close}>×</button>
        <img src="/marketing/receptionist-mascot.png" width={96} height={96} alt="" />
        <p className="rc-benefit-eyebrow">Find your voice</p>
        <h2 id="voice-example-title">A voice that fits your business.</h2>
        <p>Turn your volume up. Choose a voice, then press play.</p>
        <div className="rc-voice-options" role="group" aria-label="Voice samples">
          {VOICES.map((option, index) => <button key={option.name} aria-pressed={index === selected} onClick={() => selectVoice(index)}>{option.name}<span aria-hidden="true">{index === selected ? " ✓" : ""}</span></button>)}
        </div>
        <p className="rc-voice-current" aria-live="polite">Listen to {voice.name}</p>
        <audio key={voice.src} ref={audio} controls preload="none" src={voice.src} onError={() => setError(true)} aria-label={`${voice.name} AI voice sample`} />
        <button className="rc-voice-replay" onClick={replay}>↻ Play from the start</button>
        {error && <p role="alert">This sample couldn’t play. Try another voice or check your connection and try again.</p>}
        <div className="rc-voice-choice-note"><strong>These are just a few possibilities.</strong><p>Explore more voice options during setup and choose the right fit for your business. Available voices depend on your voice service.</p></div>
        <details><summary>Read the sample script</summary><p>{TRANSCRIPT}</p></details>
        <p className="rc-voice-note">Scripted AI-generated examples of the receptionist’s side of a conversation, not customer recordings. These demo voices are illustrative; your final voice is confirmed during setup.</p>
      </div>
    </dialog>
  </>;
}
