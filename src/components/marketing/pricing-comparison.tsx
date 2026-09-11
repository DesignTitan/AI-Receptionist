import { COMMON_FEATURES, OVERAGE_CENTS, PILOT_SETUP_CENTS, PLANS, SETUP_CENTS, SETUP_OFFER, SETUP_SCOPE, type Plan } from "@/lib/platform/pricing";
import styles from "./pricing-comparison.module.css";

const plans = Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][];
const extra = `$${(OVERAGE_CENTS / 100).toFixed(2)}`;

export function PricingComparison() {
  return (
    <section id="terms" className={styles.section} data-sc-act="flow" aria-labelledby="pricing-title">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <h2 id="pricing-title">Plans for every stage.</h2>
          <p>Simple, transparent pricing. Room to grow when you’re ready.</p>
        </header>
        <div className={styles.cards}>
          {plans.map(([id, plan]) => <article className={styles.card} key={id} data-featured={id === "busy"} aria-labelledby={`plan-${id}`}>
            <h3 id={`plan-${id}`} className={styles.plan}>{plan.name}</h3>
            <p className={styles.who}>{plan.who}</p>
            <p className={styles.rate}><strong className={styles.price}>${plan.monthly}</strong><span className={styles.month}> / month</span></p>
            <dl className={styles.metrics}>
              <div><dt>Monthly minutes</dt><dd>{plan.minutes.toLocaleString()}</dd></div>
              <div><dt>Team members</dt><dd>Up to {plan.teamLimit}</dd></div>
              <div><dt>Additional minutes</dt><dd>{extra} / minute</dd></div>
            </dl>
            <a className={styles.cta} href={`/start?plan=${id}`}>Choose {plan.name}<span aria-hidden="true"> ↗</span></a>
          </article>)}
        </div>
        <div className={styles.included}>
          <h3>All plans include</h3>
          <ul>{COMMON_FEATURES.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
        </div>
        <div className={styles.details}>
          <div><h3>One-time setup</h3><p>{SETUP_OFFER}</p><p className={styles.small}>{SETUP_SCOPE}</p>
            <p className={styles.small}>First month including setup, before tax:</p>
            <ul className={styles.totals}>{plans.map(([id, plan]) => <li key={id}>{plan.name}: <b>${(plan.monthly + PILOT_SETUP_CENTS / 100).toLocaleString()}</b> with pilot setup; <b>${(plan.monthly + SETUP_CENTS / 100).toLocaleString()}</b> standard.</li>)}</ul>
          </div>
          <div><h3>Overage &amp; spending controls</h3><p>Additional minutes are {extra} each, only within a spending limit you choose.</p><p>Extra spending starts at <strong>$0</strong>. Track your usage and manage your limit from your dashboard.</p></div>
        </div>
        <p className={styles.footnote}>One business location per plan. Minutes round up separately for each call and unused minutes expire at renewal. Setup does not repeat on renewal. Calendar sync and multiple locations are not included. Month to month. Before tax.</p>
        <a className={styles.roadmap} href="/features#coming-soon">Need a calendar or booking-software connection? Explore the roadmap ↗</a>
      </div>
    </section>
  );
}
