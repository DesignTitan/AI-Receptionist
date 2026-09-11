"use client";
import { useRef, useState } from "react";
import { INDUSTRY_BENCHMARKS } from "@/lib/platform/industry-benchmarks";
import { PLANS, recommendPlan, estimateOverage, MAX_BUDGET_CENTS, SETUP_OFFER } from "@/lib/platform/pricing";
import styles from "./appointment-value.module.css";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export function AppointmentValue({ onRequestCustom }: { onRequestCustom?: () => void }) {
  const [industry, setIndustry] = useState(3);
  const [ticket, setTicket] = useState<number | "">(77);
  const [bookings, setBookings] = useState(5);
  const [step, setStep] = useState<"value" | "plan">("value");
  const [team, setTeam] = useState("");
  const [minutes, setMinutes] = useState("");
  const [locations, setLocations] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = INDUSTRY_BENCHMARKS[industry];
  const ready = ticket !== "" && ticket > 0;
  const matched = team !== "" && minutes !== "" && locations !== "";
  const recommended = recommendPlan(Number(minutes), Number(team));
  const plan = PLANS[recommended];
  const custom = Number(team) > 20 || Number(locations) > 1 || estimateOverage(Number(minutes), recommended) > MAX_BUDGET_CENTS;
  const cost = plan.monthly + estimateOverage(Number(minutes), recommended) / 100;
  function changeStep(next: "value" | "plan") {
    setStep(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); });
  }
  return <div className={styles.value}>
    <header className={styles.intro}><span className={styles.eyebrow}>{step === "value" ? "1 · Your business value" : "2 · Your plan fit"}</span><h3 ref={heading} tabIndex={-1}>{step === "value" ? "What could a few more bookings mean?" : "Find the plan that fits."}</h3><p>{step === "value" ? "Start with your industry. Adjust two numbers to see the potential sales value." : "Your sales estimate doesn’t determine your plan. Your team and call usage do."}</p></header>
    {step === "value" ? <>
      <label className={styles.industry}>Your industry<select value={industry} onChange={e => { const i = Number(e.target.value); setIndustry(i); setTicket(INDUSTRY_BENCHMARKS[i].ticket ?? ""); }}>{INDUSTRY_BENCHMARKS.map((v, i) => <option key={v.name} value={i}>{v.name}</option>)}</select></label>
      <div className={styles.benchmark}><strong>{selected.basis}</strong><p>{selected.context}</p>{selected.source && <a href={selected.url} target="_blank" rel="noreferrer">{selected.source} ↗</a>}</div>
      <div className={styles.controls}>
        <label>Average sale value ($)<input type="number" min="0" max="100000" value={ticket} placeholder="Your actual average" onChange={e => setTicket(e.target.value === "" ? "" : Math.max(0, Math.min(100000, Number(e.target.value))))}/><small>{selected.ticket === null ? "Enter your own collected sale value." : "Prefilled from the benchmark; use your own if known."}</small></label>
        <label>Extra completed bookings / month<input type="number" min="0" max="10000" step="1" value={bookings} onChange={e => setBookings(Math.max(0, Math.min(10000, Math.floor(Number(e.target.value)))))}/><small>A what-if scenario, not a predicted recovery rate.</small></label>
      </div>
      <div className={styles.result} aria-live="polite"><strong>{ready ? money(Number(ticket) * bookings) : "—"}</strong><span>potential additional monthly sales</span><p>{ready ? `${bookings} extra completed bookings × ${money(Number(ticket))} per sale` : "Enter your average sale to see the estimate."}</p></div>
      <p className={styles.note}>Sales, not profit. Before service costs, subscription, usage, setup and tax. Count only new paid bookings; exclude reschedules and money already retained. Results are scenarios, not guaranteed returns. All amounts are USD.</p>
      <button type="button" className={styles.primary} disabled={!ready} onClick={() => changeStep("plan")}>Find my plan <span aria-hidden="true">→</span></button>
    </> : <>
      <p className={styles.scenario}>Your scenario: <strong>{money(Number(ticket) * bookings)} / month</strong> in additional sales, before costs.</p>
      <div className={styles.planControls}>
        <label>Bookable team members<select value={team} onChange={e => setTeam(e.target.value)}><option value="" disabled>Select your team size</option><option value="3">1–3</option><option value="10">4–10</option><option value="20">11–20</option><option value="21">21 or more</option></select></label>
        <label>Expected monthly call minutes<input type="number" min="0" max="100000" value={minutes} placeholder="e.g. 300" onChange={e => setMinutes(e.target.value === "" ? "" : String(Math.max(0, Math.min(100000, Math.ceil(Number(e.target.value))))))}/><small>For example, 150 calls × 2 minutes = 300 minutes.</small></label>
        <label>Business locations<select value={locations} onChange={e => setLocations(e.target.value)}><option value="" disabled>Select locations</option><option value="1">One location</option><option value="2">Multiple locations</option></select></label>
      </div>
      {matched ? <section className={styles.recommendation} aria-live="polite"><span className={styles.eyebrow}>Your suggested next step</span><h4>{custom ? "A custom conversation." : `${plan.name} · ${money(cost)} / month`}</h4><p>{custom ? "Your requirements need a tailored scope and quote." : `Lowest estimated monthly cost among plans fitting your team and entered usage. Includes ${plan.minutes.toLocaleString()} minutes; estimated additional usage is ${money(estimateOverage(Number(minutes), recommended) / 100)}.`}</p>{!custom && <p className={styles.note}>{SETUP_OFFER} {estimateOverage(Number(minutes), recommended) > 0 && "Additional usage needs an enabled spending limit."} Before tax.</p>}<a className={styles.primary} href={custom ? "#hear" : `/start?plan=${recommended}`} onClick={custom ? onRequestCustom : undefined}>{custom ? "Discuss a custom plan ↗" : `Review ${plan.name} & sign up ↗`}</a><p className={styles.note}>Confirm your business details and exact charges before payment.</p></section> : <p className={styles.note}>Complete these three details to see a plan suggestion. No plan has been selected yet.</p>}
      <button type="button" className={styles.back} onClick={() => changeStep("value")}>← Adjust my sales estimate</button>
    </>}
  </div>;
}
