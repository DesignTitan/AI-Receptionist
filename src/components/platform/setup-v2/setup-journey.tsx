"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PHONE_PROVIDERS, type PhoneProvider } from "@/lib/platform/phone-provider";
import { ANSWERING_CHIPS, nextStep, TRADE_LABELS, type InterviewAnswers } from "@/lib/platform/setup-interview";
import { bookingSlug, confirmationScript, forwardingSteps, greetingScript, openingsPreview, spokenHours } from "@/lib/platform/setup-journey";
import { ScriptEditor } from "./script-editor";
import { SetupCard } from "./setup-card";
import { ChatPanel, useSetupChat, V2_DRAFT_KEY } from "./setup-chat";
import styles from "./setup-v2.module.css";

/** The numbered steps. Welcome sits before them: payment confirmed, one button, no stepper. */
const STEPS = [
  { id: "talk", label: "Tell us about your business" },
  { id: "hear", label: "Preview your front desk" },
  { id: "live", label: "Go live" },
] as const;
type StepKey = "welcome" | "home" | (typeof STEPS)[number]["id"];

const readHash = (): StepKey => {
  const h = typeof location !== "undefined" ? location.hash.slice(1) : "";
  return (STEPS.some(s => s.id === h) || h === "home" ? h : "welcome") as StepKey;
};

/**
 * The whole version-2 setup, start to finish. One data source (the interview
 * answers, saved in this browser) drives every screen. Steps 3 and 4 show the
 * real derived output; the parts that need voice or provisioning say so.
 */
const LEAVE_MS = 150;

export function SetupJourney() {
  const [step, setStep] = useState<StepKey>("welcome");
  const [leaving, setLeaving] = useState(false);
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [provider, setProvider] = useState<PhoneProvider>("unknown");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const stepper = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = nextStep(answers) === "done";
  const chat = useSetupChat(answers, setAnswers, step === "hear" ? "hear" : "talk", loaded);

  useEffect(() => {
    try { const raw = localStorage.getItem(V2_DRAFT_KEY); if (raw) setAnswers(JSON.parse(raw).answers ?? {}); } catch {}
    setStep(readHash());
    setLoaded(true);
    const onHash = () => setStep(readHash());
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("hashchange", onHash); clearTimeout(timer.current); };
  }, []);

  // Autosave the answers (never the transcript) to this browser.
  useEffect(() => {
    if (!loaded) return;
    setStatus("Saving…");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(V2_DRAFT_KEY, JSON.stringify({ answers })); setStatus("Saved on this device"); }
      catch { setStatus("Not saved — this browser blocks storage"); }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [answers, loaded]);

  /**
   * One transition, in order: the current step fades out, then the next one
   * slides in under the stepper, which never moves. The window only scrolls
   * if the reader was below the stepper, and then it snaps rather than glides,
   * so the eye has exactly one thing to follow.
   */
  function go(next: StepKey) {
    if (next === step || leaving) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const swap = () => {
      history.replaceState(null, "", `#${next}`);
      const top = stepper.current?.getBoundingClientRect().top ?? 0;
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--workspace-top-offset")) || 0;
      if (top < offset) window.scrollBy({ top: top - offset - 12, behavior: "instant" });
      setStep(next);
      setLeaving(false);
    };
    if (reduced) { swap(); return; }
    setLeaving(true);
    timer.current = setTimeout(swap, LEAVE_MS);
  }

  const index = STEPS.findIndex(s => s.id === step);
  const unlocked = (i: number) => i === 0 || done;

  return <div className={styles.journey}>
    {step !== "welcome" && step !== "home" && <nav ref={stepper} className={styles.stepper} aria-label="Setup steps">
      <ol>
        {STEPS.map((s, i) => <li key={s.id} data-state={i < index ? "done" : i === index ? "current" : "todo"}>
          <button type="button" disabled={!unlocked(i)} aria-current={i === index ? "step" : undefined} onClick={() => go(s.id)}><span>{i + 1}</span>{s.label}</button>
        </li>)}
      </ol>
      <Link href="/account?preview=confirmation" className={styles.compare}>Compare with current setup</Link>
    </nav>}
    {index >= 0 && <p className={styles.srOnly} aria-live="polite">Step {index + 1} of {STEPS.length}: {STEPS[index].label}</p>}

    <div key={step} className={styles.stagePane} data-leaving={leaving || undefined}>
      {step === "welcome" && <Welcome answers={answers} complete={done} onContinue={() => go("talk")} />}
      {step === "talk" && <div className={styles.layout} data-loaded={loaded}><ChatPanel chat={chat} /><SetupCard answers={answers} prompt={chat.prompt} status={status} onEdit={chat.edit} onRestart={chat.restart} onDone={() => go("hear")} /></div>}
      {step === "hear" && <div className={styles.layout} data-loaded={loaded} data-stage="hear"><ChatPanel chat={chat} /><Hear answers={answers} onEdit={chat.edit} onBack={() => go("talk")} onNext={() => go("live")} /></div>}
      {step === "live" && <Live answers={answers} provider={provider} onProvider={setProvider} onBack={() => go("hear")} onGoLive={() => { setAnswers({ ...answers, liveAt: new Date().toISOString() }); go("home"); }} />}
      {step === "home" && <Home answers={answers} provider={provider} onEdit={s => go(s)} />}
    </div>
  </div>;
}

/** Continue always goes to step 2. The copy changes with what we already know; the destination never does. */
function Welcome({ answers, complete, onContinue }: { answers: InterviewAnswers; complete: boolean; onContinue: () => void }) {
  const started = Object.keys(answers).length > 0;
  return <section className={styles.welcome} aria-labelledby="v2-welcome">
    <div>
      <span className={styles.badge}><span aria-hidden="true">✓</span> Payment confirmed</span>
      <h2 id="v2-welcome">{started ? "Welcome back, Bubs." : "Welcome, Bubs."}</h2>
      {complete ? <>
        <p className={styles.lede}>You’ve told us about {answers.businessName ?? "your business"}. Next, preview your front desk, then go live.</p>
        <button type="button" className={styles.primary} onClick={onContinue}>Continue</button>
      </> : started ? <>
        <p className={styles.lede}>You’d started telling us about your business. Your answers are saved; carry on from where you stopped.</p>
        <button type="button" className={styles.primary} onClick={onContinue}>Continue</button>
      </> : <>
        <p className={styles.lede}>Setting up takes about two minutes. Bubs™ asks a few questions, you answer, and everything stays on screen for you to change.</p>
        <button type="button" className={styles.primary} onClick={onContinue}>Continue</button>
      </>}
    </div>
    <Image src="/marketing/happy-mascot-pointed.png" alt="" width={260} height={260} className={styles.welcomeMascot} priority />
  </section>;
}

function Hear({ answers, onEdit, onBack, onNext }: { answers: InterviewAnswers; onEdit: (patch: Partial<InterviewAnswers>) => void; onBack: () => void; onNext: () => void }) {
  const openings = openingsPreview(answers.weeklyHours, answers.minutes);
  const slug = bookingSlug(answers.businessName);
  const business = { name: answers.businessName ?? "", trade: answers.trade ? (answers.trade === "other" ? answers.customTrade : TRADE_LABELS[answers.trade]) : undefined, hours: answers.weeklyHours ? spokenHours(answers.weeklyHours) : undefined, minutes: answers.minutes };
  return <section className={styles.stage} aria-labelledby="v2-hear">
    <header className={styles.stageHead}><h2 id="v2-hear">Preview your front desk.</h2><p>This is what your callers and customers will get, built from what you told us. Change the wording here, or go back and change your answers.</p></header>
    <ol className={styles.liveSteps}>
      <li>
        <h3>1. When a customer calls you</h3>
        <p>The first thing callers hear. Bubs™ takes it from there: booking, questions, messages.</p>
        <ScriptEditor kind="incoming" label="Greeting" generated={greetingScript(answers)} custom={answers.greeting} business={business} onChange={greeting => onEdit({ greeting })} />
        <div className={styles.scriptActions}><button type="button" className={styles.secondary} disabled aria-describedby="v2-voice-note">▶ Play greeting</button></div>
        <p id="v2-voice-note" className={styles.note}>Voice is switched off in this build, so there’s no audio yet. When it’s on, this plays in Bubs™’s voice; nothing is pre-recorded.</p>
      </li>
      <li>
        <h3>2. When Bubs™ calls a customer</h3>
        <p>Appointment confirmations. Bubs™ rings the customer the day before and fills in their name, day and time.</p>
        <ScriptEditor kind="outgoing" label="Confirmation call" generated={confirmationScript(answers)} custom={answers.confirmation} business={business} onChange={confirmation => onEdit({ confirmation })} />
        <p className={styles.note}>Keep {"{customer}"}, {"{day}"} and {"{time}"} in the script; Bubs™ swaps in the real details on each call.</p>
      </li>
      <li>
        <h3>3. Your booking page</h3>
        <p className={styles.url}>bubs.ai/b/<strong>{slug}</strong></p>
        {openings.length ? <ul className={styles.openings}>{openings.map(o => <li key={o.label}><span>{o.label}</span><span>{o.slots} openings</span></li>)}</ul> : <p className={styles.note}>Set your hours and appointment length to see openings.</p>}
        <p className={styles.note}>Callers who book by phone land here too, so you see everything in one place.</p>
      </li>
      <li>
        <h3>4. You be the caller</h3>
        <p>This is the part that makes it real: you ring Bubs™, ask for an appointment, and watch it appear on your booking page. It needs voice, which isn’t on in this build.</p>
        <div className={styles.scriptActions}><button type="button" className={styles.secondary} disabled>Call me now</button></div>
      </li>
    </ol>
    <div className={styles.stageActions}>
      <button type="button" className={styles.secondary} onClick={onBack}>← Back: Tell us about your business</button>
      <button type="button" className={styles.primary} onClick={onNext}>Continue: Go live →</button>
    </div>
  </section>;
}

function Live({ answers, provider, onProvider, onBack, onGoLive }: { answers: InterviewAnswers; provider: PhoneProvider; onProvider: (p: PhoneProvider) => void; onBack: () => void; onGoLive: () => void }) {
  const area = answers.phone?.replace(/\D/g, "").slice(0, 3) ?? "";
  const fwd = forwardingSteps(provider, area ? `your (${area}) Bubs™ number` : undefined);
  return <section className={styles.stage} aria-labelledby="v2-live">
    <header className={styles.stageHead}><h2 id="v2-live">Go live.</h2><p>Three things happen here, in order. Each one is checked before the next.</p></header>
    <ol className={styles.liveSteps}>
      <li>
        <h3>1. Your Bubs™ number</h3>
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
        <p className={styles.note}>When you go live, Bubs™ checks your carrier from the number itself, so this dropdown becomes optional.</p>
      </li>
      <li>
        <h3>3. Prove it works</h3>
        <p>Bubs™ calls your business line. If the call reaches Bubs™, forwarding is confirmed and your front desk is live.</p>
        <button type="button" className={styles.secondary} disabled>Test forwarding</button>
        <p className={styles.note}>Needs voice; not on in this build.</p>
      </li>
    </ol>
    <div className={styles.stageActions}>
      <button type="button" className={styles.secondary} onClick={onBack}>← Back: Preview your front desk</button>
      <button type="button" className={styles.primary} onClick={onGoLive}>Go live →</button>
      <p className={styles.note}>Preview: nothing is provisioned, forwarded or charged. This shows the screen you land on next.</p>
    </div>
  </section>;
}

/**
 * The screen after Go live: the owner's front desk, day to day. Real numbers
 * would come from calls and bookings; in this preview every count is zero and
 * says so, and the parts that need provisioning say they aren't wired.
 */
function Home({ answers, provider, onEdit }: { answers: InterviewAnswers; provider: PhoneProvider; onEdit: (step: "talk" | "hear" | "live") => void }) {
  const name = answers.businessName || "Your business";
  const area = answers.phone?.replace(/\D/g, "").slice(0, 3) ?? "";
  const slug = bookingSlug(answers.businessName);
  const openings = openingsPreview(answers.weeklyHours, answers.minutes);
  const answering = ANSWERING_CHIPS.find(c => c.value === answers.answering);
  const since = answers.liveAt ? new Date(answers.liveAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  return <section className={styles.home} aria-labelledby="v2-home">
    <header className={styles.homeHead}>
      <div>
        <span className={styles.badge}><span aria-hidden="true">●</span> Live{since ? ` since ${since}` : ""}</span>
        <h2 id="v2-home">{name} is open.</h2>
        <p className={styles.lede}>Bubs™ is answering{answering ? ` (${answering.label.replace("Bubs™ ", "").toLowerCase()})` : ""}. Calls, bookings and messages land here.</p>
      </div>
      <Image src="/marketing/happy-mascot-pointed.png" alt="" width={120} height={120} className={styles.homeMascot} />
    </header>

    <div className={styles.homeGrid}>
      <article className={`${styles.homeCard} ${styles.homeWide}`}>
        <h3>Today</h3>
        <div className={styles.stats}>
          <div><strong>0</strong><span>calls answered</span></div>
          <div><strong>0</strong><span>appointments booked</span></div>
          <div><strong>0</strong><span>messages taken</span></div>
        </div>
        <p className={styles.note}>Nothing yet. The first call shows up here the moment it ends, with what the caller wanted and what Bubs™ did.</p>
      </article>

      <article className={styles.homeCard}>
        <h3>Your Bubs™ number</h3>
        <p className={styles.bigNumber}>({area || "___"}) ___-____</p>
        <p>Forwarding: <strong>not verified</strong>{provider !== "unknown" ? ` · ${PHONE_PROVIDERS[provider]}` : ""}</p>
        <div className={styles.scriptActions}><button type="button" className={styles.secondary} disabled>Test forwarding</button><button type="button" className={styles.secondary} onClick={() => onEdit("live")}>Forwarding steps</button></div>
        <p className={styles.note}>Number provisioning and the test call aren’t wired in this build; this is where they appear.</p>
      </article>

      <article className={styles.homeCard}>
        <h3>Your booking page</h3>
        <p className={styles.url}>bubs.ai/b/<strong>{slug}</strong></p>
        {openings.length ? <ul className={styles.openings}>{openings.map(o => <li key={o.label}><span>{o.label}</span><span>{o.slots} openings</span></li>)}</ul> : <p className={styles.note}>Set hours and appointment length to see openings.</p>}
        <div className={styles.scriptActions}><button type="button" className={styles.secondary} disabled>Copy link</button><button type="button" className={styles.secondary} disabled>Open ↗</button></div>
      </article>

      <article className={`${styles.homeCard} ${styles.homeWide}`}>
        <h3>Recent calls</h3>
        <p className={styles.note}>No calls yet. Each one will show who called, when, what they wanted, and a transcript.</p>
      </article>

      <article className={styles.homeCard}>
        <h3>How Bubs™ answers</h3>
        <p><strong>{answering?.label ?? "Not set"}.</strong> {answering?.hint ?? ""}</p>
        <blockquote className={styles.quote}>{greetingScript(answers) === (answers.greeting ?? greetingScript(answers)) ? greetingScript(answers) : answers.greeting}</blockquote>
        <div className={styles.scriptActions}><button type="button" className={styles.secondary} onClick={() => onEdit("hear")}>Change the greeting</button><button type="button" className={styles.secondary} onClick={() => onEdit("talk")}>Change hours or details</button></div>
      </article>

      <article className={styles.homeCard}>
        <h3>Ask Bubs™</h3>
        <p>“Close on Friday.” “Move my appointments to an hour.” “Who called this morning?”</p>
        <p className={styles.note}>The same Bubs™ from setup lives here. Not wired into this preview yet.</p>
      </article>
    </div>
  </section>;
}
