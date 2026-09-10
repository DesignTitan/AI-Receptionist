"use client";

import { useRef, useState, type PointerEvent } from "react";
import styles from "./happy-paws-film.module.css";

export function HappyPawsFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(false);
  const playbackButton = useRef<HTMLButtonElement>(null);
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  const [error, setError] = useState("");

  function followPointer(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const button = event.currentTarget;
    const bounds = button.getBoundingClientRect();
    const pill = button.firstElementChild as HTMLElement | null;
    const halfWidth = (pill?.offsetWidth ?? 160) / 2 + 12;
    const halfHeight = (pill?.offsetHeight ?? 68) / 2 + 12;
    const x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, event.clientX - bounds.left));
    const y = Math.max(halfHeight, Math.min(bounds.height - halfHeight, event.clientY - bounds.top));
    button.style.setProperty("--play-x", `${x}px`);
    button.style.setProperty("--play-y", `${y}px`);
    button.dataset.following = "true";
  }

  async function play() {
    if (!video.current) return;
    setError("");
    setStarted(true);
    try {
      await video.current.play();
      playbackButton.current?.focus();
    } catch {
      setStarted(false);
      setError("The film couldn’t start. Please try again.");
    }
  }

  return (
    <div className={styles.frame}>
    <section id="turn" className={styles.section} data-playing={started} data-sc-act="flow" aria-label="Hands full? We’ve got the call.">
      <video ref={video} className={styles.video} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onVolumeChange={(event) => setMuted(event.currentTarget.muted)} playsInline preload="none" tabIndex={started ? 0 : -1} poster="/marketing/happy-paws-poster.png" onEnded={() => setStarted(false)} aria-label="Happy Paws: an AI receptionist handles a booking while the groomer works">
        <source src="/marketing/happy-paws.mp4" type="video/mp4" />
        <track kind="captions" src="/marketing/happy-paws.vtt" srcLang="en" label="English" />
        Your browser cannot play this video. <a href="/marketing/happy-paws.mp4">Watch the film.</a>
      </video>
      {started && (
        <div className={styles.controls} role="group" aria-label="Video controls">
          <button ref={playbackButton} type="button" aria-label={paused ? "Resume film" : "Pause film"} onClick={() => { if (paused) void video.current?.play().catch(() => setError("Please try playing again.")); else video.current?.pause(); }}>
            {paused ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3v14l12-7z" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h4v14H5zM12 3h4v14h-4z" /></svg>}
          </button>
          <span className={styles.time}>{formatTime(time)} / {formatTime(duration)}</span>
          <input className={styles.scrubber} type="range" min="0" max={duration || 1} step="0.1" value={time} aria-label="Seek video" aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`} onChange={(event) => { if (video.current) { video.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); } }} />
          <button type="button" aria-label={muted ? "Unmute film" : "Mute film"} aria-pressed={muted} onClick={() => { if (video.current) video.current.muted = !video.current.muted; }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9z" />{muted ? <path d="m16 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="2" /> : <path d="M16 8q5 4 0 8" fill="none" stroke="currentColor" strokeWidth="2" />}</svg></button>
          <button type="button" aria-label="Captions" aria-pressed={captions} onClick={() => { const track = video.current?.textTracks[0]; if (track) { track.mode = captions ? "hidden" : "showing"; setCaptions(!captions); } }}>CC</button>
          <button type="button" aria-label="Full screen" onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { const element = video.current?.parentElement; if (element?.requestFullscreen) await element.requestFullscreen(); else (video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.(); } } catch { setError("Full screen is unavailable in this browser."); } }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg></button>
        </div>
      )}
      {started && error && <p className={styles.error} role="alert">{error}</p>}
      {!started && (
        <>
          <div className={styles.overlay}>
            <div className={styles.heading}>
              <p className={styles.eyebrow}>Your business keeps going. So can you.</p>
              <h2>Hands full?<br />We’ve got the call.</h2>
              <p>See how an AI receptionist helps a busy groomer take a booking—and get back to her day.</p>
            </div>
            <div className={styles.caption}>
              <span>70 seconds · Sound on</span>
              <span>Illustrative scenario. Incoming AI booking requires a connected pilot.</span>
            </div>
          </div>
          <button type="button" className={styles.play} onClick={play} onPointerEnter={followPointer} onPointerMove={followPointer} onPointerLeave={(event) => { delete event.currentTarget.dataset.following; }} onBlur={(event) => { delete event.currentTarget.dataset.following; }} aria-label="Play the Happy Paws film with sound">
            <span className={styles.prompt}><svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true"><path d="M2 1.5v15L15 9z" /></svg>Play me</span>
          </button>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </>
      )}
    </section>
    </div>
  );
}
