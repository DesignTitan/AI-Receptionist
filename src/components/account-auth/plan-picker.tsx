"use client";
import { useRef } from "react";
import { PLANS, planFeatures, setupCents, type Plan } from "@/lib/platform/pricing";
import styles from "./auth.module.css";

export function PlanPicker({ value, onChange }: { value: Plan | ""; onChange: (plan: Plan) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className={styles.planPicker}>
    <span>Your plan</span>
    <button type="button" className={styles.planTrigger} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
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
        {(Object.keys(PLANS) as Plan[]).map((plan) => <article key={plan} className={`${styles.planCard} ${value === plan ? styles.selectedPlan : ""}`}>
          <h3>{PLANS[plan].name}</h3>
          <p>{PLANS[plan].who}</p>
          <div className={styles.planPrice}>${PLANS[plan].monthly}<span>/ month</span></div>
          <p className={styles.planSetup}>${setupCents(plan) / 100} one-time setup</p>
          <ul>{planFeatures(plan).map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <button type="button" className={styles.primary} aria-pressed={value === plan} onClick={() => { onChange(plan); dialog.current?.close(); }}>
            {value === plan ? "Keep" : "Choose"} {PLANS[plan].name}
          </button>
        </article>)}
      </div>
      <p className={styles.planDisclaimer}>USD, before applicable tax. No payment is taken here. You’ll review your purchase before checkout.</p>
    </dialog>
  </div>;
}
