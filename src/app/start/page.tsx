import { planReturnUrl } from "@/lib/platform/plan-navigation";
import Link from "next/link";
import { StartForm } from "@/components/platform/start-form";
import { owner, ownedCustomer } from "@/lib/platform/server";
import { planOf } from "@/lib/platform/model";
import { billingMode } from "@/lib/platform/billing-mode";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";
import styles from "@/components/platform/signup.module.css";
export const dynamic = "force-dynamic";
export default async function Start({ searchParams }: { searchParams: Promise<{ plan?: string; review?: string; returnTo?: string }> }) {
  const user = await owner();
  const c = user ? await ownedCustomer() : null;
  if (c && (c.status !== "draft" || c.checkout_attempt)) redirect("/account");
  const query = await searchParams;
  let plan: "front" | "busy" | "full" = "busy";
  try { plan = planOf(query.plan ?? c?.plan ?? "busy"); } catch {}
  const returnTo = planReturnUrl(query.returnTo, plan);
  if (!user) redirect(`/account/signup?plan=${plan}&returnTo=${encodeURIComponent(returnTo)}`);
  const contactName = c?.config.contactName ?? user?.user_metadata?.full_name;
  return <div className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><img src="/marketing/happy-pillow-mascot.png" alt="" width="42" height="42" />bubs</Link>
      <Link href={returnTo} className={styles.backToPlans} aria-label="Back to plans"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg><span>Back to plans</span></Link>
    </header>
    <main id="main" className={styles.main}>
      {billingMode() === "test" && <p className={styles.test} role="note">Test checkout · No real payment will be taken.</p>}
      <StartForm returnTo={returnTo} plan={plan} signedIn={!!user} initialEmail={user?.email ?? ""} initialName={typeof contactName === "string" ? contactName : ""} review={query.review === "1"} siteKey={env.turnstile.siteKey ?? ""} />
    </main>
    <footer className={styles.footer}><span>A little more time for what matters.</span><div><Link href="/legal#terms">Terms</Link><Link href="/legal#privacy">Privacy</Link><Link href="/#hear">Need a hand?</Link></div></footer>
  </div>;
}
