import type { Metadata } from "next";
import { LEGAL_GROUPS, SOCIAL_NAMES } from "@/components/marketing/legal-topics";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Legal & trust — draft placeholders", robots: { index: false, follow: false } };
export default function LegalPlaceholders() {
  return <main className={styles.page}>
    <a className={styles.back} href="/#colophon">← Back to the website</a>
    <header><span className={styles.badge}>Temporary · pending review</span><h1>Legal &amp; trust.</h1><p>These are placeholders for documents and information being prepared for legal and operational review. They are not approved policies, contractual terms or evidence of compliance.</p></header>
    <nav className={styles.index} aria-label="Legal topics">{LEGAL_GROUPS.map(group => <a href={`#group-${group.title.split(" ")[0].toLowerCase()}`} key={group.title}>{group.title}</a>)}<a href="#social">Social channels</a></nav>
    {LEGAL_GROUPS.map(group => <section key={group.title} id={`group-${group.title.split(" ")[0].toLowerCase()}`}><h2>{group.title}</h2><div className={styles.grid}>{group.items.map(item => <article id={item.id} key={item.id}><span className={styles.status}>Draft placeholder</span><h3>{item.title}</h3><p>{item.detail}</p><small>Final wording, applicability and supporting evidence: pending review.</small></article>)}</div></section>)}
    <section id="social"><h2>Social channels</h2><p>Official profiles have not been added yet. These placeholders do not link to third-party accounts.</p><div className={styles.social}>{SOCIAL_NAMES.map(name=><span key={name} id={`social-${name.toLowerCase()}`}>{name} <small>Coming soon</small></span>)}</div></section>
    <p className={styles.note}>No certification, audit status, regulatory approval or guaranteed availability is implied. Privacy controls and reporting channels must be connected before these placeholders become operational.</p>
  </main>;
}
