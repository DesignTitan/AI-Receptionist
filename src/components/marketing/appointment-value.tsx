"use client";
import { useRef, useState } from "react";
import { INDUSTRY_BENCHMARKS } from "@/lib/platform/industry-benchmarks";
import { PLANS, recommendPlan, estimateOverage, MAX_BUDGET_CENTS, SETUP_OFFER } from "@/lib/platform/pricing";
import styles from "./appointment-value.module.css";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export function AppointmentValue({ onRequestCustom }: { onRequestCustom?: () => void }) {
  const [industry, setIndustry] = useState<number | "">("");
  const [ticket, setTicket] = useState("");
  const [bookings, setBookings] = useState("");
  const [step, setStep] = useState<"value" | "plan">("value");
  const [team, setTeam] = useState("");
  const [minutes, setMinutes] = useState("");
  const [locations, setLocations] = useState("");
  const heading = useRef<HTMLElement>(null);
  const selected = industry === "" ? null : INDUSTRY_BENCHMARKS[industry];
  const ready = selected !== null && ticket.trim() !== "" && Number.isFinite(Number(ticket)) && Number(ticket) > 0 && Number(ticket) <= 100000 && bookings.trim() !== "" && Number.isInteger(Number(bookings)) && Number(bookings) >= 0 && Number(bookings) <= 10000;
  const matched = team !== "" && minutes.trim() !== "" && Number.isInteger(Number(minutes)) && Number(minutes) >= 0 && Number(minutes) <= 100000 && locations !== "";
  const recommended = recommendPlan(Number(minutes), Number(team));
  const plan = PLANS[recommended];
  const custom = Number(team) > 20 || Number(locations) > 1 || estimateOverage(Number(minutes), recommended) > MAX_BUDGET_CENTS;
  const cost = plan.monthly + estimateOverage(Number(minutes), recommended) / 100;
  function changeStep(next: "value" | "plan") {
    setStep(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); });
  }
  return <div className={styles.value}>
    <div className={styles.flow}>
      <ol className={styles.steps} aria-label="Value and plan steps">
        <li className={styles.step} data-active="true">
          <header className={styles.intro}><h3>Your business value</h3></header>
      <label className={styles.industry}>Your industry<select value={industry} onChange={e => { const i = Number(e.target.value); setIndustry(i); setTicket(""); }}><option value="" disabled>Choose your industry</option>{INDUSTRY_BENCHMARKS.map((v, i) => <option key={v.name} value={i}>{v.name}</option>)}</select></label>
      {selected && <div className={styles.benchmark} role="note" aria-label="Industry context"><span className={styles.noteIcon} aria-hidden="true">i</span><div><strong>{selected.basis}</strong><p>{selected.context}</p>{selected.source && <a href={selected.url} target="_blank" rel="noreferrer">{selected.source} ↗</a>}</div></div>}
      <div className={styles.controls}>
        <label>Average sale value ($)<input type="text" inputMode="decimal" value={ticket} placeholder={selected?.ticket != null ? `e.g. ${selected.ticket}` : "e.g. 100"} onChange={e => setTicket(e.target.value)}/><small>For example, $550 collected from 10 completed sales = $55 per sale.</small></label>
        <label>Extra completed bookings / month<input type="text" inputMode="numeric" value={bookings} placeholder="e.g. 5" onChange={e => setBookings(e.target.value)}/><small>For example, 5 additional paid bookings completed in a month. A scenario, not a prediction.</small></label>
      </div>
        </li>
        <li className={styles.step} data-active="true">
          <header className={styles.intro}><h3>Your plan fit</h3><p>We match your plan to your team and call usage.</p></header>
      <div className={styles.planControls}>
        <label>Bookable team members<select value={team} onChange={e => setTeam(e.target.value)}><option value="" disabled>Select your team size</option><option value="3">1–3</option><option value="10">4–10</option><option value="20">11–20</option><option value="21">21 or more</option></select></label>
        <label>Expected monthly call minutes<input type="text" inputMode="numeric" value={minutes} placeholder="e.g. 300" onChange={e => setMinutes(e.target.value)}/><small>For example, 150 calls × 2 minutes = 300 minutes.</small></label>
        <label>Business locations<select value={locations} onChange={e => setLocations(e.target.value)}><option value="" disabled>Select locations</option><option value="1">One location</option><option value="2">Multiple locations</option></select></label>
      </div>
        </li>
      </ol>
      <aside className={styles.previewColumn} ref={heading} tabIndex={-1} aria-label="Live value and plan preview">
        <div className={styles.preview}>
        <div className={styles.previewHeader}><span className={styles.previewIcon} aria-hidden="true">↗</span><div><strong>Your business, with more room to grow.</strong><span>{selected?.name ?? "Choose your industry to get started"}</span></div></div>
        <div className={styles.result} aria-live="polite"><span>Potential additional monthly sales</span><strong>{ready ? money(Number(ticket) * Number(bookings)) : "—"}</strong><p>{ready ? `${bookings} extra completed bookings × ${money(Number(ticket))} per sale` : selected ? "Enter your average sale and extra bookings to see the estimate." : "Choose your industry to start your estimate."}</p></div>
        <p className={styles.note}>Sales, not profit. Before service costs, subscription, usage, setup and tax. Count only new paid bookings; exclude reschedules and money already retained. Scenarios, not guaranteed returns. USD.</p>
        {step === "plan" ? <>
      {matched && ready ? <section className={styles.recommendation} aria-live="polite"><span className={styles.eyebrow}>Your suggested next step</span><h4>{custom ? "A custom conversation." : `${plan.name} · ${money(cost)} / month`}</h4><p>{custom ? "Your requirements need a tailored scope and quote." : `Lowest estimated monthly cost among plans fitting your team and entered usage. Includes ${plan.minutes.toLocaleString()} minutes; estimated additional usage is ${money(estimateOverage(Number(minutes), recommended) / 100)}.`}</p>{!custom && <p className={styles.note}>{SETUP_OFFER} {estimateOverage(Number(minutes), recommended) > 0 && "Additional usage needs an enabled spending limit."} Before tax.</p>}<a className={styles.primary} href={custom ? "#hear" : `/start?plan=${recommended}`} onClick={custom ? onRequestCustom : undefined}>{custom ? "Discuss a custom plan ↗" : `Review ${plan.name} & sign up ↗`}</a><p className={styles.note}>Confirm your business details and exact charges before payment.</p></section> : <p className={styles.note}>Complete your sales estimate and plan-fit details to update the suggestion.</p>}
        </> : <div className={styles.previewNext}><span className={styles.eyebrow}>Your plan</span><p>We’ll suggest a fit once you share your team and call needs.</p></div>}
        </div>
        {step === "value" && <div className={styles.previewAction}>
          <button type="button" className={styles.primary} disabled={!ready || !matched} onClick={() => changeStep("plan")}>Find my plan <span aria-hidden="true">→</span></button>
          {(!ready || !matched) && <p className={styles.note}>Complete your sales estimate and plan-fit questions first.</p>}
        </div>}
      </aside>
    </div>
  </div>;
}
