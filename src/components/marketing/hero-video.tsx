/**
 * Ambient video behind the product hero: a slow, seamless colour drift in the
 * brand's own indigo and teal (public/hero-loop.mp4, rendered from ffmpeg's
 * gradient source, so there is nothing to license). A theme-aware wash keeps
 * the headline readable in both modes and is heaviest behind the text column.
 * Hidden entirely for people who prefer reduced motion — the aurora remains.
 */
export function HeroVideo() {
  return (
    <div aria-hidden className="absolute inset-0 -z-20 motion-reduce:hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        src="/hero-loop.mp4"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/75 to-bg/45 dark:from-bg/85 dark:via-bg/65 dark:to-bg/35" />
    </div>
  );
}
