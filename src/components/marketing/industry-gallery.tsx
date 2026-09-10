"use client";

import { useEffect, useRef, useState } from "react";

const INDUSTRIES = [
  { key: "medical", title: "Doctors’ offices", detail: "Primary care · specialists · clinics", line: "More time for your patients.", quote: "Hi, Alex! I’m calling to confirm your appointment with Dr. Lee tomorrow at ten.", pilot: false },
  { key: "dental", title: "Dental practices", detail: "Dentists · orthodontists · hygienists", line: "Keep your day running smoothly.", quote: "Hi, Jordan! Just confirming your dental cleaning on Thursday at two. Does that still work for you?", pilot: false },
  { key: "healthcare", title: "Healthcare & wellness", detail: "Physio · mental health · chiropractic", line: "Give care your full attention.", quote: "Hello, Sam! I’m calling to confirm your physiotherapy session tomorrow at eleven.", pilot: false },
  { key: "fitness", title: "Fitness & movement", detail: "Gyms · personal trainers · yoga · Pilates", line: "Stay with the session.", quote: "Your first training session? Lovely. What days tend to work for you?", pilot: true },
  { key: "care", title: "Personal care", detail: "Salons · barbers · spas · nail studios", line: "More time with your clients.", quote: "A haircut and colour? Of course. Do you have a stylist you usually see?", pilot: true },
  { key: "retail", title: "Retail & shops", detail: "Boutiques · showrooms · specialist shops", line: "Look after the customer in front of you.", quote: "You’d like to visit the showroom? I can help arrange an appointment. What day suits you?", pilot: true },
  { key: "pets", title: "Pet services", detail: "Groomers · vets · trainers · boarding", line: "Busy hands. Bookings covered.", quote: "Let’s get Milo booked in. Is he coming for a bath or a full groom?", pilot: true },
  { key: "studio", title: "Creative studios", detail: "Photography · video · design studios", line: "Stay focused on the shoot.", quote: "I’d love to help you book a portrait session. What did you have in mind?", pilot: true },
  { key: "trades", title: "Home & auto services", detail: "Trades · cleaning · landscaping · mechanics", line: "Keep your attention on the job.", quote: "Hi, Taylor! I’m confirming your service appointment for Friday morning. Will you be available?", pilot: false },
  { key: "professional", title: "Professional services", detail: "Accountants · lawyers · consultants", line: "Make room for the conversation.", quote: "Hi, Morgan! Just confirming your consultation on Tuesday at three. Does that still suit you?", pilot: false },
  { key: "lessons", title: "Lessons & coaching", detail: "Tutors · music · driving · coaching", line: "Keep the lesson flowing.", quote: "Your first piano lesson? Lovely. What days tend to work for you?", pilot: true },
];

export function IndustryGallery() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = section.current!, windowEl = viewport.current!, track = rail.current!;
    const native = matchMedia("(max-width: 860px), (prefers-reduced-motion: reduce)");
    let frame = 0;
    function update() {
      frame = 0;
      const cards = Array.from(track.children) as HTMLElement[];
      const travel = Math.max(0, track.scrollWidth - windowEl.clientWidth);
      const rect = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, root.offsetHeight - innerHeight)));
      const position = native.matches ? windowEl.scrollLeft : progress * travel;
      track.style.transform = native.matches ? "none" : `translate3d(${-position}px,0,0)`;
      // Follow the leading card, including the last cards as they approach the rail end.
      const nearest = native.matches
        ? cards.reduce((best, card, i) => Math.abs(card.offsetLeft - position) < Math.abs(cards[best].offsetLeft - position) ? i : best, 0)
        : Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
      setActive(nearest);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    windowEl.addEventListener("scroll", schedule, { passive: true });
    native.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root); observer.observe(windowEl);
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      removeEventListener("scroll", schedule); removeEventListener("resize", schedule);
      windowEl.removeEventListener("scroll", schedule); native.removeEventListener("change", schedule);
    };
  }, []);

  function go(index: number) {
    const next = Math.max(0, Math.min(INDUSTRIES.length - 1, index));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduced ? "instant" : "smooth";
    if (matchMedia("(max-width: 860px), (prefers-reduced-motion: reduce)").matches) {
      viewport.current!.scrollTo({ left: (rail.current!.children[next] as HTMLElement).offsetLeft, behavior });
    } else {
      const root = section.current!;
      window.scrollTo({ top: scrollY + root.getBoundingClientRect().top + next / (INDUSTRIES.length - 1) * (root.offsetHeight - innerHeight), behavior });
    }
  }
  const item = INDUSTRIES[active];

  return (
    <section ref={section} id="industries" className="rc-industries" data-sc-act="flow" aria-labelledby="industry-title">
      <div className="rc-industries__sticky">
        <div className="rc-industries__intro">
          <p className="rc-industries__eyebrow">Your industry</p>
          <h2 id="industry-title">Your business.<br />Your kind of busy.</h2>
          <p>Keep bookings and confirmation calls moving while you focus on your customers.</p>
          <a href="/demos">Explore example businesses <span aria-hidden="true">↗</span></a>
          <div className="rc-industries__controls" aria-label="Browse industries">
            <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous industry">←</button>
            <span>{String(active + 1).padStart(2, "0")} / {INDUSTRIES.length}</span>
            <button type="button" onClick={() => go(active + 1)} disabled={active === INDUSTRIES.length - 1} aria-label="Next industry">→</button>
          </div>
        </div>
        <div className="rc-industries__gallery">
          <div ref={viewport} className="rc-industries__viewport" tabIndex={0} aria-label="Industry gallery. Use left and right arrow keys to browse." onKeyDown={event => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(active + (event.key === "ArrowRight" ? 1 : -1)); }
          }}>
            <div ref={rail} className="rc-industries__rail">
              {INDUSTRIES.map((industry, index) => (
                <article className="rc-industry" key={industry.key} data-active={index === active}>
                  <img src={`/marketing/industries/${industry.key}.webp`} alt="" width={900} height={1200} loading="lazy" />
                  <div className="rc-industry__copy"><h3>{industry.title}</h3><p>{industry.line}</p><small>{industry.detail}</small></div>
                </article>
              ))}
            </div>
          </div>
          <div className="rc-industry-conversation" key={item.key}>
            <img className="rc-industry-conversation__mascot" src="/marketing/industries/mascot.webp" width={600} height={600} alt="" />
            <div>
              <div className="rc-industry-conversation__card">
                <p className="rc-industry-conversation__label"><span aria-hidden="true" />Example conversation <span className="rc-industry-conversation__industry"> · {item.title}</span></p>
                <p className="rc-industry-conversation__quote">“{item.quote}”</p>
              </div>
              <p className="rc-industry-conversation__note">{item.pilot ? "Incoming-call booking requires a connected pilot." : "Confirmation calls require completed setup and available minutes."}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
