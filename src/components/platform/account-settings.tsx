"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessPreferencesForm } from "./business-preferences-form";
import type { BusinessPreferences } from "@/lib/platform/business-preferences";
import { AccountShell } from "./account-shell";
import { RemoteAction } from "./remote-action";
import { PLANS, type Plan } from "@/lib/platform/pricing";
import styles from "./account-settings.module.css";

export function AccountSettings({name:initialName,email,plan,billingAvailable,contactEmail,preview=false,preferences,revision}:{preferences?:BusinessPreferences;revision?:string;name:string;email:string;plan:Plan;billingAvailable:boolean;contactEmail?:string;preview?:boolean}) {
  const [name,setName]=useState(initialName),[savedName,setSavedName]=useState(initialName),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[failed,setFailed]=useState(false);
  const router=useRouter();
  const requestLink=(subject:string)=>contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}` : "/#hear";
  return <AccountShell name={savedName} billingAvailable={billingAvailable} preview={preview}>
    <header className={styles.heading}><h1>Account settings</h1><p>Your business, availability and account, in one place.</p></header>
    <div className={styles.layout}>
      <nav className={styles.sections} aria-label="Settings sections">{[...(preferences||preview?[["business-details","Business details"],["hours-availability","Hours & availability"],["phone-preferences","Phone preferences"]]:[]),["profile","Profile"],["security","Sign-in & security"],["billing","Billing"],["notifications","Notifications"],["privacy","Privacy & account"]].map(([id,label])=><a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <div className={styles.panels}>
        {preferences||preview?<BusinessPreferencesForm initial={preferences} initialRevision={revision} preview={preview}/>:<Link href="/account#business-details">Continue your business setup →</Link>}
        <section id="profile" className={styles.panel}><h2>Profile</h2><p>The name you’ll see across your workspace.</p>
          <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");setFailed(false);try{if(preview){setSavedName(name.trim());setMessage("Preview updated. Changes aren’t saved to an account.");return;}const r=await fetch("/api/account/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});const data=await r.json();if(!r.ok)throw Error(data.error);setSavedName(data.name);setMessage("Your profile is saved.");router.refresh();}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Could not save.");}finally{setBusy(false);}}}>
            <div className={styles.profileRow}><span className={styles.avatar} aria-hidden="true">{savedName.trim().split(/\s+/).filter(Boolean).map(n=>n[0]).slice(0,2).join("").toUpperCase() || "?"}</span><span>Your avatar uses your initials.</span></div>
            <label htmlFor="profile-name">Full name</label><input id="profile-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)} />
            <label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={email} readOnly aria-describedby="email-help"/><p id="email-help" className={styles.hint}>Used for sign-in links and account messages. <a href={requestLink("Change my account email")}>Contact us to change it</a>.</p>
            <button className={styles.primary} disabled={busy || !name.trim() || name.trim()===savedName}>{busy?"Saving…":"Save changes"}</button>
            <p role={failed?"alert":"status"} className={styles.feedback}>{message}</p>
          </form>
        </section>
        <section id="security" className={styles.panel}><h2>Sign-in &amp; security</h2><div className={styles.row}><div><h3>Your sign-in methods and devices</h3><p>Manage passkeys, your authenticator, recovery codes and active sessions.</p></div><Link className={styles.secondary} href={preview?"/account/login?preview=settings":"/account/security"}>Manage security</Link></div></section>
        <section id="billing" className={styles.panel}><h2>Billing</h2><div className={styles.row}><div><h3>{PLANS[plan].name}</h3><p>Review your subscription, invoices and payment details in the secure billing portal.</p></div>{billingAvailable?<RemoteAction url="/api/account/billing" label="Manage billing ↗" className={styles.secondary}/>:<span className={styles.badge}>{preview?"Example plan":"Available after checkout"}</span>}</div><p className={styles.hint}>For cancellation or changes unavailable in the portal, <a href={requestLink("Help with my subscription")}>contact support</a>.</p></section>
        <section id="notifications" className={styles.panel}><h2>Notifications</h2><div className={styles.row}><div><h3>Account & billing emails</h3><p>Receipts, sign-in links and important account notices go to your account email.</p></div><span className={styles.badge}>Essential</span></div><p className={styles.hint}>Essential service messages stay enabled. For help with booking or call notifications, <a href={requestLink("Help with notification preferences")}>contact support</a>.</p></section>
        <section id="privacy" className={styles.panel}><h2>Privacy & account</h2><div className={styles.row}><div><h3>Your information</h3><p>Request a copy of your account information.</p></div><a className={styles.secondary} href={requestLink("Request a copy of my account data")}>Request my data</a></div><div className={styles.row}><div><h3>Close your account</h3><p>Contact us to arrange account closure and discuss any active subscription.</p></div><a className={styles.secondary} href={requestLink("Request account closure")}>Request account closure</a></div><p className={styles.hint}>Requests are reviewed by support. <Link href="/legal#privacy">Privacy</Link> · <Link href="/legal#terms">Terms</Link></p></section>
      </div>
    </div>
  </AccountShell>;
}
