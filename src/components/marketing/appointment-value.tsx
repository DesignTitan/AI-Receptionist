"use client";
import { useState } from "react";
import { appointmentValue, INDUSTRY_VALUE_EXAMPLES } from "@/lib/platform/appointment-value";
import { PLANS, PILOT_SETUP_CENTS, SETUP_CENTS, OVERAGE_CENTS } from "@/lib/platform/pricing";
import styles from "./appointment-value.module.css";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export function AppointmentValue() {
  const [industry, setIndustry] = useState(3);
  const [ticket, setTicket] = useState(77);
  const [margin, setMargin] = useState(60);
  const [missed, setMissed] = useState(10);
  const [recovered, setRecovered] = useState(5);
  const [minutes, setMinutes] = useState(300);
  const [setup, setSetup] = useState(0);
  const selected = INDUSTRY_VALUE_EXAMPLES[industry];
  const example = appointmentValue({ ticket, margin, missed, recovered, monthlyCost: 0 });
  return <div className={styles.value}>
    <div className={styles.intro}><span className={styles.eyebrow}>What is a kept appointment worth?</span><h3>See the value behind the price.</h3><p>An unanswered call is not automatically a lost sale. The value comes from additional paid appointments that actually happen—or a cancelled slot your team successfully refills.</p></div>
    <div className={styles.controls}>
      <label>Your industry<select value={industry} onChange={e=>{const i=Number(e.target.value);setIndustry(i);setTicket(INDUSTRY_VALUE_EXAMPLES[i].ticket);}}>{INDUSTRY_VALUE_EXAMPLES.map((v,i)=><option value={i} key={v.name}>{v.name}</option>)}</select></label>
      <label>Average collected sale ($)<input type="number" min="0" max="100000" value={ticket} onChange={e=>setTicket(Math.max(0,Math.min(100000,Number(e.target.value))))}/></label>
      <label>Share left after service costs (%)<input type="number" min="0" max="100" value={margin} onChange={e=>setMargin(Math.max(0,Math.min(100,Number(e.target.value))))}/></label>
      <label>Unfilled missed bookings / month<input type="number" min="0" max="10000" step="1" value={missed} onChange={e=>setMissed(Math.max(0,Math.min(10000,Math.floor(Number(e.target.value)))))}/></label>
      <label>Additional bookings you might keep<input type="number" min="0" max={missed} step="1" value={Math.min(recovered,missed)} onChange={e=>setRecovered(Math.max(0,Math.min(missed,Math.floor(Number(e.target.value)))))}/></label>
      <label>Monthly billable call minutes<input type="number" min="0" max="100000" step="1" value={minutes} onChange={e=>setMinutes(Math.max(0,Math.min(100000,Math.ceil(Number(e.target.value)))))}/></label>
      <label>Cost period<select value={setup} onChange={e=>setSetup(Number(e.target.value))}><option value={0}>Ongoing month — no setup fee</option><option value={PILOT_SETUP_CENTS / 100}>First month — pilot setup</option><option value={SETUP_CENTS / 100}>First month — standard setup</option></select></label>
    </div>
    <p className={styles.note}>{selected.note} {industry===3 && <a href="https://www.zenoti.com/thecheckin/no-show-revenue-calculator" target="_blank" rel="noreferrer">Source ↗</a>} All other inputs are editable examples, not measured product results. Use the same currency as the plans (USD).</p>
    <div className={styles.summary} aria-live="polite"><p><strong>{money(example.revenueAtRisk)}</strong> monthly sales at risk</p><p><strong>{money(example.recoveredRevenue)}</strong> sales if {example.recovered} more bookings happen</p><p><strong>{money(example.recoveredContribution)}</strong> left after service costs, before the plan</p></div>
    <div className={styles.results} aria-live="polite">{Object.entries(PLANS).map(([id,plan])=>{const overage=Math.max(0,minutes-plan.minutes)*OVERAGE_CENTS/100;const cost=plan.monthly+setup+overage;const value=appointmentValue({ticket,margin,missed,recovered,monthlyCost:cost});return <div key={id}><h4>{plan.name}</h4><p className={styles.net}>{money(value.net)}</p><p>Estimated value after service and plan costs</p><dl><div><dt>Plan + usage{setup ? " + setup" : ""}</dt><dd>{money(cost)}</dd></div><div><dt>Extra bookings to cover that cost</dt><dd>{value.breakEven===null ? "Not reached at $0 contribution" : value.breakEven}</dd></div></dl></div>})}</div>
    <p className={styles.note}>Scenario only—not a return guarantee. Subtract deposits or cancellation fees already retained from losses; don’t count a reschedule twice. “Share left” should deduct costs of fulfilling an extra appointment. Taxes, other overhead, extra follow-up labor and future repeat purchases are excluded. Usage assumes the billable minutes you enter; setup availability and fees are confirmed at checkout. Custom / Enterprise is quoted separately.</p>
    <details className={styles.evidence}><summary>What the research says</summary><p>A randomized outpatient study published in 2010 found no-show rates of <strong>23.1% without reminders, 17.3% with automated phone reminders, and 13.6% with staff calls</strong>. These are healthcare findings—not a prediction for AI Receptionist or every industry. <a href="https://pubmed.ncbi.nlm.nih.gov/20569761/" target="_blank" rel="noreferrer">Read the study ↗</a></p><p>Zenoti’s 2026 vendor benchmarks report salon no-shows of 2% and a median ticket of $77; medspas were 4% and $216. Business types differ, and cancellations are not the same as unfilled lost appointments. <a href="https://www.zenoti.com/thecheckin/no-show-revenue-calculator" target="_blank" rel="noreferrer">Read the benchmarks ↗</a></p><p>Our product places confirmation calls and flags follow-up needs. It does not guarantee attendance, recover every missed call, or automatically refill every cancelled slot.</p></details>
    <details className={styles.evidence}><summary>Compare all ten industry examples</summary><p>Illustrative sale values except the cited salon median. Break-even below uses your {margin}% share after service costs and subscription fees only; setup and usage are excluded here.</p><div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Industry examples and subscription break-even"><table><thead><tr><th scope="col">Industry / sale basis</th><th scope="col">Sale value</th>{Object.values(PLANS).map(p=><th scope="col" key={p.name}>{p.name}<br/>extra bookings</th>)}</tr></thead><tbody>{INDUSTRY_VALUE_EXAMPLES.map(v=><tr key={v.name}><th scope="row">{v.name}<small>{v.unit} · {v.name==="Personal care" ? "cited median" : "illustrative"}</small></th><td>{money(v.ticket)}</td>{Object.values(PLANS).map(p=><td key={p.name}>{appointmentValue({ticket:v.ticket,margin,missed:0,recovered:0,monthlyCost:p.monthly}).breakEven??"—"}</td>)}</tr>)}</tbody></table></div></details>
  </div>;
}
