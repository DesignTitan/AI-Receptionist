"use client";

import { useEffect, useRef, useState } from "react";

const INDUSTRIES = [
  { key: "medical", problem: "A patient needs your full attention.", outcome: "Stay with your patient.", title: "Medical & dental", detail: "Doctors · dentists · clinics", line: "More time for your patients.", quote: "Hi Alex, does tomorrow at 10 still work for your appointment?", pilot: false },
  { key: "healthcare", problem: "You’re supporting every movement.", outcome: "Keep the session uninterrupted.", title: "Healthcare & wellness", detail: "Physio · mental health · chiropractic", line: "Give care your full attention.", quote: "Hi Sam, can you confirm your physio appointment tomorrow at 11?", pilot: false },
  { key: "fitness", problem: "You can’t stop halfway through a set.", outcome: "Focus on the person you’re training.", title: "Fitness & movement", detail: "Gyms · personal trainers · yoga · Pilates", line: "Stay with the session.", quote: "Let’s book your first session. What day works for you?", pilot: true },
  { key: "care", problem: "Both hands. One customer. No interruptions.", outcome: "Keep your hands on the job.", title: "Personal care", detail: "Salons · barbers · spas · nail studios", line: "More time with your clients.", quote: "A haircut and colour? Which stylist would you like?", pilot: true },
  { key: "retail", problem: "There’s a customer at the counter.", outcome: "Help the customer in front of you.", title: "Retail & shops", detail: "Boutiques · showrooms · specialist shops", line: "Look after the customer in front of you.", quote: "Let’s arrange your showroom visit. What day suits you?", pilot: true },
  { key: "pets", problem: "Wet paws. Full hands. A ringing phone.", outcome: "Finish the groom. Take the next booking.", title: "Pet services", detail: "Groomers · vets · trainers · boarding", line: "Busy hands. Bookings covered.", quote: "A bath or a full groom for Milo?", pilot: true },
  { key: "studio", problem: "The perfect moment won’t wait.", outcome: "Stay behind the camera.", title: "Creative studios", detail: "Photography · video · design studios", line: "Stay focused on the shoot.", quote: "A portrait session? Let’s find a time for you.", pilot: true },
  { key: "trades", problem: "You’re in the middle of a repair.", outcome: "Finish the job without phone tag.", title: "Home & auto services", detail: "Trades · cleaning · landscaping · mechanics", line: "Keep your attention on the job.", quote: "Hi Taylor, are you still available for Friday’s service appointment?", pilot: false },
  { key: "professional", problem: "You’re deep in a consultation.", outcome: "Give the meeting your full attention.", title: "Professional services", detail: "Accountants · lawyers · consultants", line: "Make room for the conversation.", quote: "Hi Morgan, does Tuesday at 3 still work for your consultation?", pilot: false },
  { key: "lessons", problem: "Your student needs you right now.", outcome: "Teach without interruptions.", title: "Lessons & coaching", detail: "Tutors · music · driving · coaching", line: "Keep the lesson flowing.", quote: "Your first piano lesson? What day works for you?", pilot: true },
  { key: "more", title: "And many more.", problem: "Built around appointments?", outcome: "Let’s find where AI could give you time back.", detail: "Your business could be next.", line: "", quote: "", pilot: false },
];

export function IndustryGallery() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
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
      if (intro.current) intro.current.style.transform = native.matches ? "none" : `translate3d(${-position}px,0,0)`;
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

  return (
    <section ref={section} id="industries" className="rc-industries" data-sc-act="flow" aria-labelledby="industry-title">
      <div className="rc-industries__sticky">
        <div ref={intro} className="rc-industries__intro">
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
                <article className="rc-industry" key={industry.key} data-active={index === active} data-more={industry.key === "more"}>
                  {industry.key !== "more" && <img src={`/marketing/industries/${industry.key}.webp`} alt="" width={900} height={1200} loading="lazy" />}
                  {industry.key === "more" && <p className="rc-industry__problem">{industry.problem}</p>}
                  {industry.key !== "more" && <div className="rc-industry__moment" aria-hidden={index !== active}>
                    <img src={industry.pilot ? "/marketing/happy-pillow-listening.png" : "/marketing/happy-pillow-mascot.png"} width={600} height={600} alt="" />
                    <div className="rc-industry__bubble">
                      <p>“{industry.quote}”</p>
                    </div>
                  </div>
                  }
                  <div className="rc-industry__copy"><h3>{industry.title}</h3><p>{industry.outcome}</p>{industry.key === "more" && <a href="#hear">Let’s talk <span aria-hidden="true">↗</span></a>}</div>
                </article>
              ))}
            </div>
          </div>
          <p className="rc-industries__availability">Illustrative scenarios. Incoming-call booking requires a connected pilot. Confirmation calls require completed setup and available minutes.</p>
        </div>
      </div>
    </section>
  );
}
