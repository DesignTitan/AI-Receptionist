"use client";
import { useId, useRef } from "react";
import { PLANS, COMMON_FEATURES, OVERAGE_CENTS, setupCents, type Plan } from "@/lib/platform/pricing";
import pricing from "@/components/marketing/pricing-comparison.module.css";
import styles from "./auth.module.css";

export function PlanPicker({ value, onChange }: { value: Plan | ""; onChange: (plan: Plan) => void }) {
  const requirementId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className={styles.planPicker}>
    <span id={requirementId}>Your plan <span className={styles.required}>(required)</span></span>
    <button type="button" className={styles.planTrigger} aria-haspopup="dialog" aria-describedby={requirementId} onClick={() => dialog.current?.showModal()}>
      <span>{value ? `${PLANS[value].name} · $${PLANS[value].monthly}/month` : "Choose a plan"}</span>
      <span aria-hidden="true">{value ? "Change →" : "Explore →"}</span>
    </button>
    <dialog ref={dialog} className={styles.planDialog} aria-labelledby="plan-picker-title" onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
    }}>
      <header className={styles.planHeader}>
        <div><h2 id="plan-picker-title">Find your front desk.</h2><p>Choose the plan that fits your business.</p></div>
        <button type="button" className={styles.planClose} aria-label="Close plans" onClick={() => dialog.current?.close()}>×</button>
      </header>
      <div className={styles.planGrid}>
        {(Object.keys(PLANS) as Plan[]).map((plan) => <article key={plan} className={`${pricing.card} ${value === plan ? styles.selectedPlan : ""}`} data-featured={plan === "busy"}>
          <h3 className={pricing.plan}>{PLANS[plan].name}</h3>
          <p className={pricing.who}>{PLANS[plan].who}</p>
          <p className={pricing.rate}><strong className={pricing.price}>${PLANS[plan].monthly}</strong><span className={pricing.month}> / month</span></p>
          <p className={pricing.setup}>One-time setup: ${setupCents(plan) / 100}.<br />First payment: ${(PLANS[plan].monthly + setupCents(plan) / 100).toLocaleString()}, before tax.</p>
          <dl className={pricing.metrics}>
            <div><dt>Monthly minutes</dt><dd>{PLANS[plan].minutes.toLocaleString()}</dd></div>
            <div><dt>Team members</dt><dd>Up to {PLANS[plan].teamLimit}</dd></div>
            <div><dt>Additional minutes</dt><dd>${(OVERAGE_CENTS / 100).toFixed(2)} / minute</dd></div>
          </dl>
          <button type="button" className={pricing.cta} aria-pressed={value === plan} onClick={() => { onChange(plan); dialog.current?.close(); }}>
            {value === plan ? "Keep" : "Choose"} {PLANS[plan].name}<span aria-hidden="true"> ↗</span>
          </button>
        </article>)}
      </div>
      <div className={pricing.included}><h3>All plans include</h3><ul>{COMMON_FEATURES.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul></div>
      <p className={styles.planDisclaimer}>USD, before applicable tax. No payment is taken here. You’ll review your purchase before checkout.</p>
    </dialog>
  </div>;
}
