"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PHONE_PROVIDERS, type PhoneProvider } from "@/lib/platform/phone-provider";
import { nextStep, type InterviewAnswers } from "@/lib/platform/setup-interview";
import { bookingSlug, forwardingSteps, greetingScript, openingsPreview } from "@/lib/platform/setup-journey";
import { SetupConversation, V2_DRAFT_KEY } from "./setup-conversation";
import styles from "./setup-v2.module.css";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "talk", label: "Tell Bubs about your business" },
  { id: "hear", label: "Hear how Bubs answers" },
  { id: "live", label: "Go live" },
] as const;
type StepKey = (typeof STEPS)[number]["id"];

const readHash = (): StepKey => {
  const h = typeof location !== "undefined" ? location.hash.slice(1) : "";
  return (STEPS.some(s => s.id === h) ? h : "welcome") as StepKey;
};

/**
 * The whole version-2 setup, start to finish. One data source (the interview
 * answers, saved in this browser) drives every screen. Steps 3 and 4 show the
 * real derived output; the parts that need voice or provisioning say so.
 */
export function SetupJourney() {
  const [step, setStep] = useState<StepKey>("welcome");
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [provider, setProvider] = useState<PhoneProvider>("unknown");
  const done = nextStep(answers) === "done";

  useEffect(() => {
    try { const raw = localStorage.getItem(V2_DRAFT_KEY); if (raw) setAnswers(JSON.parse(raw).answers ?? {}); } catch {}
    setStep(readHash());
    const onHash = () => setStep(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: StepKey) {
    history.replaceState(null, "", `#${next}`);
    setStep(next);
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  const index = STEPS.findIndex(s => s.id === step);
  const unlocked = (i: number) => i <= 1 || done;

  return <div className={styles.journey}>
    <nav className={styles.stepper} aria-label="Setup steps">
      <ol>
        {STEPS.map((s, i) => <li key={s.id} data-state={i < index ? "done" : i === index ? "current" : "todo"}>
          <button type="button" disabled={!unlocked(i)} aria-current={i === index ? "step" : undefined} onClick={() => go(s.id)}><span>{i + 1}</span>{s.label}</button>
        </li>)}
      </ol>
      <Link href="/account?preview=confirmation" className={styles.compare}>Compare with current setup</Link>
    </nav>

    {step === "welcome" && <Welcome onStart={() => go("talk")} />}
    {step === "talk" && <SetupConversation onChange={setAnswers} onDone={() => go("hear")} />}
    {step === "hear" && <Hear answers={answers} onBack={() => go("talk")} onNext={() => go("live")} />}
    {step === "live" && <Live answers={answers} provider={provider} onProvider={setProvider} onBack={() => go("hear")} />}
  </div>;
}

function Welcome({ onStart }: { onStart: () => void }) {
  return <section className={styles.welcome} aria-labelledby="v2-welcome">
    <div>
      <span className={styles.badge}><span aria-hidden="true">✓</span> Payment confirmed</span>
      <h2 id="v2-welcome">Welcome, Bubs.</h2>
      <p className={styles.lede}>Your front desk is about two minutes away. No forms to fill in; Bubs asks, you answer, and everything it learns stays on screen for you to change.</p>
      <ol className={styles.plan}>
        <li><strong>Tell Bubs about your business.</strong> Start with your phone number; Bubs finds the rest where it can.</li>
        <li><strong>Hear how Bubs answers.</strong> Your greeting, your booking page, your hours.</li>
        <li><strong>Go live.</strong> Get your Bubs number, forward your line, and Bubs proves it rang through.</li>
      </ol>
      <button type="button" className={styles.primary} onClick={onStart}>Start with Bubs →</button>
      <p className={styles.fine}>Busy plan · change it any time from your account.</p>
    </div>
    <Image src="/marketing/happy-mascot-pointed.png" alt="" width={260} height={260} className={styles.welcomeMascot} priority />
  </section>;
}

function Hear({ answers, onBack, onNext }: { answers: InterviewAnswers; onBack: () => void; onNext: () => void }) {
  const openings = openingsPreview(answers.weeklyHours, answers.minutes);
  const slug = bookingSlug(answers.businessName);
  return <section className={styles.stage} aria-labelledby="v2-hear">
    <header className={styles.stageHead}><h2 id="v2-hear">Hear how Bubs answers.</h2><p>Everything below comes from what you just told Bubs. Change anything in the previous step and it updates.</p></header>
    <div className={styles.cards}>
      <article className={styles.stageCard}>
        <h3>What callers hear first</h3>
        <blockquote className={styles.script}>{greetingScript(answers)}</blockquote>
        <button type="button" className={styles.secondary} disabled aria-describedby="v2-voice-note">▶ Play greeting</button>
        <p id="v2-voice-note" className={styles.note}>Voice is switched off in this build, so there’s no audio yet. When it’s on, this plays in Bubs’s voice; nothing is pre-recorded.</p>
      </article>
      <article className={styles.stageCard}>
        <h3>Your booking page</h3>
        <p className={styles.url}>bubs.ai/b/<strong>{slug}</strong></p>
        {openings.length ? <ul className={styles.openings}>{openings.map(o => <li key={o.label}><span>{o.label}</span><span>{o.slots} openings</span></li>)}</ul> : <p className={styles.note}>Set your hours and appointment length to see openings.</p>}
        <p className={styles.note}>Callers who book by phone land here too, so you see everything in one place.</p>
      </article>
      <article className={`${styles.stageCard} ${styles.stageCardWide}`}>
        <h3>You be the caller</h3>
        <p>This is the part that makes it real: you ring Bubs, ask for an appointment, and watch it appear on your booking page. It needs voice, which isn’t on in this build.</p>
        <button type="button" className={styles.secondary} disabled>Call me now</button>
      </article>
    </div>
    <div className={styles.stageActions}>
      <button type="button" className={styles.secondary} onClick={onBack}>← Back to Bubs</button>
      <button type="button" className={styles.primary} onClick={onNext}>Next: Go live →</button>
    </div>
  </section>;
}

function Live({ answers, provider, onProvider, onBack }: { answers: InterviewAnswers; provider: PhoneProvider; onProvider: (p: PhoneProvider) => void; onBack: () => void }) {
  const area = answers.phone?.replace(/\D/g, "").slice(0, 3) ?? "";
  const fwd = forwardingSteps(provider, area ? `your (${area}) Bubs number` : undefined);
  return <section className={styles.stage} aria-labelledby="v2-live">
    <header className={styles.stageHead}><h2 id="v2-live">Go live.</h2><p>Three things happen here, in order. Each one is checked before the next.</p></header>
    <ol className={styles.liveSteps}>
      <li>
        <h3>1. Your Bubs number</h3>
        <p>{area ? <>A local <strong>({area})</strong> number, reserved the moment you go live. Callers see your business, not a call centre.</> : "A local number in your area code, reserved when you go live."}</p>
        <p className={styles.note}>Number provisioning isn’t wired in this build.</p>
      </li>
      <li>
        <h3>2. Forward your line</h3>
        <label className={styles.fieldbox}><span>Your phone provider</span>
          <select value={provider} onChange={e => onProvider(e.target.value as PhoneProvider)}>{(Object.keys(PHONE_PROVIDERS) as PhoneProvider[]).map(k => <option key={k} value={k}>{PHONE_PROVIDERS[k]}</option>)}</select>
        </label>
        <h4>{fwd.title}</h4>
        <ol className={styles.fwd}>{fwd.steps.map(s => <li key={s}>{s}</li>)}</ol>
        {fwd.off && <p className={styles.note}>{fwd.off}</p>}
        {fwd.note && <p className={styles.note}>{fwd.note}</p>}
        <p className={styles.note}>When you go live, Bubs checks your carrier from the number itself, so this dropdown becomes optional.</p>
      </li>
      <li>
        <h3>3. Prove it works</h3>
        <p>Bubs calls your business line. If the call reaches Bubs, forwarding is confirmed and your front desk is live.</p>
        <button type="button" className={styles.secondary} disabled>Test forwarding</button>
        <p className={styles.note}>Needs voice; not on in this build.</p>
      </li>
    </ol>
    <div className={styles.stageActions}>
      <button type="button" className={styles.secondary} onClick={onBack}>← Back</button>
      <button type="button" className={styles.primary} disabled title="Preview only">Go live</button>
      <p className={styles.note}>Preview: nothing here is activated or sent.</p>
    </div>
  </section>;
}
