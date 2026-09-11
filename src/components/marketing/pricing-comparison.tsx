"use client";
import { useEffect, useRef, useState } from "react";
import { COMMON_FEATURES, OVERAGE_CENTS, PILOT_SETUP_CENTS, PLANS, SETUP_CENTS, SETUP_OFFER, SETUP_SCOPE, type Plan } from "@/lib/platform/pricing";
import { PlanCheckoutLink } from "./plan-checkout-link";
import { AppointmentValue } from "./appointment-value";
import styles from "./pricing-comparison.module.css";

const plans = Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][];
const extra = `$${(OVERAGE_CENTS / 100).toFixed(2)}`;

export function PricingComparison() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [valueOpen, setValueOpen] = useState(false);
  useEffect(() => {
    if (!valueOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [valueOpen]);
  function openValue() {
    dialog.current?.showModal();
    setValueOpen(true);
  }
  const valueLink = <button type="button" className={styles.valueLink} onClick={openValue} aria-haspopup="dialog">See the value behind the price</button>;
  return (
    <section id="terms" className={styles.section} data-sc-act="flow" aria-labelledby="pricing-title">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <h2 id="pricing-title">Plans for every stage.</h2>
          <p>Simple, transparent pricing. Room to grow when you’re ready.</p>
        </header>
        <div className={styles.cards}>
          {plans.map(([id, plan]) => <article id={`plan-card-${id}`} tabIndex={-1} className={styles.card} key={id} data-featured={id === "busy"} aria-labelledby={`plan-${id}`}>
            <h3 id={`plan-${id}`} className={styles.plan}>{plan.name}</h3>
            <p className={styles.who}>{plan.who}</p>
            <p className={styles.rate}><strong className={styles.price}>${plan.monthly}</strong><span className={styles.month}> / month</span></p>
            <p className={styles.setup}>Plus ${PILOT_SETUP_CENTS / 100} pilot setup or ${SETUP_CENTS / 100} standard, once.<br />First month: ${(plan.monthly + PILOT_SETUP_CENTS / 100).toLocaleString()} pilot / ${(plan.monthly + SETUP_CENTS / 100).toLocaleString()} standard, before usage and tax.</p>
            <dl className={styles.metrics}>
              <div><dt>Monthly minutes</dt><dd>{plan.minutes.toLocaleString()}</dd></div>
              <div><dt>Team members</dt><dd>Up to {plan.teamLimit}</dd></div>
              <div><dt>Additional minutes</dt><dd>{extra} / minute</dd></div>
            </dl>
            <PlanCheckoutLink className={styles.cta} plan={id}>Choose {plan.name}<span aria-hidden="true"> ↗</span></PlanCheckoutLink>
            {valueLink}
          </article>)}
          <article className={`${styles.card} ${styles.custom}`} aria-labelledby="plan-custom">
            <h3 id="plan-custom" className={styles.plan}>Custom / Enterprise</h3>
            <p className={styles.who}>A conversation around your specific business requirements.</p>
            <p className={styles.rate}><strong className={styles.customPrice}>Let’s talk.</strong><span className={styles.month}> Pricing by scope</span></p>
            <p className={styles.customNote}>Tell us about your volume, workflow, integrations and support needs. We’ll confirm what’s possible and prepare a tailored proposal.</p>
            <p className={styles.customNote}>Features, capacity, service commitments and pricing are agreed in writing.</p>
            <a className={styles.cta} href="#hear">Discuss your needs <span aria-hidden="true">↗</span></a>
            {valueLink}
          </article>
        </div>
        <div className={styles.included}>
          <h3>All plans include</h3>
          <ul>{COMMON_FEATURES.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
        </div>
        <div className={styles.details}>
          <div><h3>Overage &amp; spending controls</h3><p>Additional minutes are {extra} each, only within a spending limit you choose.</p><p>Extra spending starts at <strong>$0</strong>. Track your usage and manage your limit from your dashboard.</p></div>
        </div>
        <p className={styles.footnote}>{SETUP_OFFER} {SETUP_SCOPE}</p>
        <p className={styles.footnote}>One business location per plan. Minutes round up separately for each call and unused minutes expire at renewal. Setup does not repeat on renewal. Calendar sync and multiple locations are not included. Month to month. Before tax.</p>
        <a className={styles.roadmap} href="/features#coming-soon">Need a calendar or booking-software connection? Explore the roadmap ↗</a>
      </div>
      <dialog ref={dialog} className={styles.valueDialog} aria-label="See the value behind the price" onClose={() => setValueOpen(false)} onClick={event => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
        }
      }}>
        <div className={styles.dialogBar}><span>Explore your potential return</span><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close value calculator">Close ×</button></div>
        <div className={styles.dialogContent} data-lenis-prevent><AppointmentValue onRequestCustom={() => dialog.current?.close()} /></div>
      </dialog>
    </section>
  );
}
