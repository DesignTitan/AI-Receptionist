import styles from "./happy-paws-film.module.css";

export function HappyPawsFilm() {
  return (
    <section id="turn" className={styles.section} data-sc-act="flow" aria-labelledby="happy-paws-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Your business keeps going. So can you.</p>
        <h2 id="happy-paws-title">Hands full? We’ve got the call.</h2>
        <p>See how an AI receptionist helps a busy groomer take a booking—and get back to her day.</p>
      </div>
      <figure className={styles.film}>
        <video controls playsInline preload="none" poster="/marketing/happy-paws-poster.png" aria-label="Happy Paws: an AI receptionist handles a booking while the groomer works">
          <source src="/marketing/happy-paws.mp4" type="video/mp4" />
          <track kind="captions" src="/marketing/happy-paws.vtt" srcLang="en" label="English" />
          Your browser cannot play this video. <a href="/marketing/happy-paws.mp4">Watch the film.</a>
        </video>
        <figcaption><span>Watch the story · 70 seconds · Sound on</span><span>Illustrative scenario. Incoming AI booking requires a connected pilot.</span></figcaption>
      </figure>
    </section>
  );
}
