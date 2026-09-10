"use client";

import { useRef, useState } from "react";
import styles from "./happy-paws-film.module.css";

export function HappyPawsFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  async function play() {
    if (!video.current) return;
    setError("");
    setStarted(true);
    try {
      await video.current.play();
      video.current.focus();
    } catch {
      setStarted(false);
      setError("The film couldn’t start. Please try again.");
    }
  }

  return (
    <section id="turn" className={styles.section} data-playing={started} data-sc-act="flow" aria-label="Hands full? We’ve got the call.">
      <video ref={video} className={styles.video} controls={started} playsInline preload="none" tabIndex={started ? 0 : -1} poster="/marketing/happy-paws-poster.png" onEnded={() => setStarted(false)} aria-label="Happy Paws: an AI receptionist handles a booking while the groomer works">
        <source src="/marketing/happy-paws.mp4" type="video/mp4" />
        <track kind="captions" src="/marketing/happy-paws.vtt" srcLang="en" label="English" />
        Your browser cannot play this video. <a href="/marketing/happy-paws.mp4">Watch the film.</a>
      </video>
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
          <button type="button" className={styles.play} onClick={play} aria-label="Play the Happy Paws film with sound">
            <span className={styles.prompt}><svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true"><path d="M2 1.5v15L15 9z" /></svg>Play me</span>
          </button>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </>
      )}
    </section>
  );
}
