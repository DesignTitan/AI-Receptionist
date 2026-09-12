"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { PLANS, validateConfig, type Customer, type Plan } from "@/lib/platform/model";
import { PHONE_PROVIDERS } from "@/lib/platform/phone-provider";
import { PhoneProviderFields } from "./phone-provider-fields";
import { AccountShell } from "./account-shell";
import styles from "./business-setup-form.module.css";
const weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const zones=["America/New_York","America/Detroit","America/Chicago","America/Denver","America/Los_Angeles","America/Phoenix","America/Anchorage","Pacific/Honolulu"];
const clock=(value:string)=>{if(!value)return "—";const [h,m]=value.split(":").map(Number);return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;};
export function BusinessSetupForm({customer,plan,preview=false,initialStep=1}:{customer:Customer|null;plan:Plan;preview?:boolean;initialStep?:number}) {
 const chosen=customer?.plan??plan;
 const c=customer?.config.setupPending?undefined:customer?.config;
 const [step,setStep]=useState(initialStep),[team,setTeam]=useState(c?.team??(preview?[{id:"member-1",name:"Jordan Davis",service:"Haircut",minutes:45},{id:"member-2",name:"Morgan Lee",service:"Colour consultation",minutes:30}]:[{id:"member-1",name:"",service:"",minutes:30}]));
 const [days,setDays]=useState(c?.days??[1,2,3,4,5]),[opens,setOpens]=useState(c?.opens??"09:00"),[closes,setCloses]=useState(c?.closes??"17:00"),[timezone,setTimezone]=useState(c?.timezone??"America/New_York");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[saved,setSaved]=useState(false);
 const [details,setDetails]=useState<Record<string,string>>(preview?{business_name:"Willow Studio",trade:"salon",address:"123 Example Street, Detroit, MI",phone:"(313) 555-0142",areaCode:"313",color:"#1e3a34",phoneProvider:"unknown",phoneServiceType:"unknown",phoneServiceName:"",bookingSystem:"Paper calendar"}:{});
 const form=useRef<HTMLFormElement>(null),title=useRef<HTMLHeadingElement>(null);
 const move=(n:number)=>{setError("");setStep(n);window.scrollTo({top:0,behavior:"instant"});requestAnimationFrame(()=>title.current?.focus());};
 const readDetails=()=>Object.fromEntries(Array.from(new FormData(form.current!).entries()).map(([k,v])=>[k,String(v)]));
 const config=(d:Record<string,string>)=>({trade:d.trade,address:d.address,phone:d.phone,areaCode:d.areaCode,color:d.color,days,opens,closes,timezone,team,phoneSetup:{provider:d.phoneProvider,serviceType:d.phoneServiceType,serviceName:d.phoneServiceName,bookingSystem:d.bookingSystem}});
 const validateVisible=()=>{const inputs=form.current?.querySelectorAll<HTMLInputElement|HTMLSelectElement>(`[data-step="${step}"] input,[data-step="${step}"] select`)??[];for(const input of inputs){if(!input.reportValidity())return false;}return true;};
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;if(!validateVisible())return;const d=readDetails();setDetails(d);if(step===1){move(2);return;}try{validateConfig(config(d));if(team.length>PLANS[chosen].teamLimit)throw Error(`Your plan supports up to ${PLANS[chosen].teamLimit} people.`);if(step===2){move(3);return;}setBusy(true);setError("");if(preview){setSaved(true);return;}const r=await fetch("/api/account/business",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_name:d.business_name,config:config(d)})});const data=await r.json();if(!r.ok)throw Error(data.error??"We couldn’t save your setup.");location.assign("/account");}catch(e){setError(e instanceof Error?e.message:"Please check your details.");}finally{setBusy(false);}}
 const firstName=customer?.config.contactName?.trim().split(/\s+/)[0]??(preview?"Bubs":"");
 if(saved)return <AccountShell name={firstName} preview={preview} billingAvailable={!preview}><div className={styles.success}><img src="/marketing/happy-mascot-pointed.png" alt="" width="140" height="140"/><h1>Ready for setup.</h1><p>This is a local preview. Your example details have not been submitted.</p><button onClick={()=>setSaved(false)} className={styles.primary}>Back to review</button></div></AccountShell>;
 return <AccountShell name={firstName} preview={preview} billingAvailable={!preview}>
  <nav aria-label="Setup progress"><ol className={styles.progress}>{["Business details","Hours & team","Review & setup"].map((label,i)=><li key={label} aria-current={step===i+1?"step":undefined}><button type="button" disabled={busy||i+1>step} onClick={()=>move(i+1)}><span>{step>i+1?"✓":i+1}</span>{label}</button></li>)}</ol></nav>
  <header className={styles.heading}><h1 ref={title} tabIndex={-1}>{step===1?"Let’s meet your business.":step===2?"Make room for your customers.":`Looking good${firstName?`, ${firstName}`:""}.`}</h1><p>{step===1?"A few details to make your front desk feel like you.":step===2?"Set your opening hours and the people customers can book.":"Check the details below. We’ll take it from here."}</p></header>
  <form ref={form} onSubmit={submit} noValidate className={styles.form}>
   <div hidden={step!==1} data-step="1" className={styles.first}>
      <fieldset>
        <legend>01 — Meet your business</legend>
        <div className="platform-fields">
          <label>
            Business name
            <input
              name="business_name"
              required
              maxLength={120}
              defaultValue={preview?details.business_name:customer?.config.setupPending ? "" : customer?.business_name}
            />
          </label>
          <label>
            Business type
            <select name="trade" defaultValue={c?.trade ?? "salon"}>
              <option value="salon">Salon, spa or wellness</option>
              <option value="studio">Creative studio</option>
              <option value="other">Other appointment business</option>
            </select>
          </label>
          <label>
            Business address
            <input
              name="address"
              required
              maxLength={300}
              defaultValue={c?.address??details.address}
            />
          </label>
          <label>
            Existing business phone number
            <input name="phone" type="tel" required defaultValue={c?.phone??details.phone} />
          </label>
          <label>
            Preferred area code
            <input
              name="areaCode"
              required
              pattern="[2-9][0-9]{2}"
              placeholder="212"
              defaultValue={c?.areaCode??details.areaCode}
            />
          </label>
          <label>
            Brand colour
            <input
              type="color"
              name="color"
              defaultValue={c?.color ?? "#234d59"}
              className="mt-3 h-11 w-24"
            />
          </label>
        </div>
        <p className="platform-note">
          We start with non-medical businesses. Medical workflows need a
          separate review before onboarding.
        </p>
      </fieldset>
      <PhoneProviderFields initial={c?.phoneSetup??(preview?{provider:"unknown",serviceType:"unknown",serviceName:"",bookingSystem:"Paper calendar"}:undefined)} />
   </div>
   <div hidden={step!==2} data-step="2">
    <div className={styles.columns}>
     <div className={styles.stack}>
      <section className={styles.card}><div className={styles.cardHeader}><div><h2>When you’re open</h2><p>One schedule for your whole team.</p></div><label className={styles.zone}>Time zone<select aria-label="Time zone" value={timezone} onChange={e=>setTimezone(e.target.value)}>{Array.from(new Set([...zones,timezone])).map(z=><option key={z} value={z}>{z.replace("America/","").replaceAll("_"," ")}</option>)}</select></label></div>
       <div className={styles.days}>{[1,2,3,4,5,6,0].map(d=><label key={d}><input type="checkbox" checked={days.includes(d)} onChange={e=>setDays(e.target.checked?[...days,d]:days.filter(v=>v!==d))}/><span aria-hidden="true">{weekdays[d].slice(0,3)}</span><span className={styles.sr}>{weekdays[d]}</span></label>)}</div>
       <div className={styles.fields}><label>Opens<input type="time" required value={opens} onChange={e=>setOpens(e.target.value)}/></label><label>Closes<input type="time" required value={closes} onChange={e=>setCloses(e.target.value)}/></label></div><p className={styles.note}>These hours apply to every selected day and your whole team.</p>
      </section>
      <section className={styles.card}><div className={styles.cardHeader}><div><h2>Your team</h2><p>{team.length} of {PLANS[chosen].teamLimit} bookable people</p></div><button className={styles.secondary} type="button" disabled={team.length>=PLANS[chosen].teamLimit} onClick={()=>setTeam([...team,{id:crypto.randomUUID(),name:"",service:"",minutes:30}])}>＋ Add person</button></div>
       {team.map((member,i)=><div className={styles.member} key={member.id}><span className={styles.avatar} aria-hidden="true">{member.name.trim().split(/\s+/).filter(Boolean).map(n=>n[0]).slice(0,2).join("").toUpperCase()||i+1}</span><label>Name<input aria-label={`Team member ${i+1} name`} required maxLength={120} value={member.name} placeholder="Full name" onChange={e=>setTeam(team.map((m,n)=>n===i?{...m,name:e.target.value}:m))}/></label><label>Service<input aria-label={`Team member ${i+1} service`} required maxLength={120} placeholder="Haircut, consultation…" value={member.service} onChange={e=>setTeam(team.map((m,n)=>n===i?{...m,service:e.target.value}:m))}/></label><label>Duration<select aria-label={`Team member ${i+1} duration`} value={member.minutes} onChange={e=>setTeam(team.map((m,n)=>n===i?{...m,minutes:Number(e.target.value)}:m))}>{[15,30,45,60,90,120,180,240].map(n=><option key={n} value={n}>{n} min</option>)}</select></label>{team.length>1&&<button className={styles.remove} type="button" aria-label={`Remove ${member.name||`person ${i+1}`}`} onClick={()=>setTeam(team.filter((_,n)=>n!==i))}>×</button>}</div>)}
      </section>
     </div>
     <aside className={`${styles.card} ${styles.week}`}><h2>Your week, at a glance</h2><p>Here’s when customers can book.</p><div className={styles.weekBars}>{[1,2,3,4,5,6,0].map(d=><div key={d}><span>{weekdays[d].slice(0,3)}</span><div data-open={days.includes(d)}>{days.includes(d)?<>{clock(opens)}<br/>–<br/>{clock(closes)}</>:"Closed"}</div></div>)}</div><div className={styles.booking}><p>Booking preview</p><div><span className={styles.avatar} aria-hidden="true">◷</span><div><strong>{team[0]?.service||"Your service"} · {team[0]?.minutes} min</strong><p>with {team[0]?.name||"your team member"}</p></div></div></div><p className={styles.note}>Booking rules and availability still apply.</p></aside>
    </div>
   </div>
   <div hidden={step!==3} data-step="3"><div className={styles.columns}>
    <div className={styles.stack}>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Your business</h2><button type="button" className={styles.edit} onClick={()=>move(1)}>Edit business</button></div><h3>{details.business_name}</h3><p>{details.trade==='salon'?"Salon, spa or wellness":details.trade==='studio'?"Creative studio":"Appointment business"}</p><p>{details.address}</p><p>Business phone: {details.phone}</p></section>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Hours & team</h2><button type="button" className={styles.edit} onClick={()=>move(2)}>Edit hours & team</button></div><p>{[1,2,3,4,5,6,0].filter(d=>days.includes(d)).map(d=>weekdays[d].slice(0,3)).join(", ")} · {clock(opens)}–{clock(closes)}</p><p>{timezone.replaceAll("_"," ")}</p><div className={styles.summaryTeam}>{team.map(m=><div key={m.id}><span className={styles.avatar}>{m.name.trim().split(/\s+/).map(n=>n[0]).slice(0,2).join("")}</span><strong>{m.name}</strong><span>{m.service} · {m.minutes} min</span></div>)}</div></section>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Phone & appointment book</h2><button className={styles.edit} type="button" onClick={()=>move(1)}>Edit phone details</button></div><dl className={styles.summary}><dt>Phone provider</dt><dd>{PHONE_PROVIDERS[details.phoneProvider as keyof typeof PHONE_PROVIDERS]??"Not sure yet"}</dd><dt>Current booking</dt><dd>{details.bookingSystem||"Not specified"}</dd><dt>Preferred area code</dt><dd>{details.areaCode}</dd></dl><p className={styles.note}>We’ll confirm connection options with you.</p></section>
    </div>
    <aside className={`${styles.card} ${styles.next}`}><img src="/marketing/happy-mascot-pointed.png" alt="" width="96" height="96"/><h2>What happens next</h2><p>Here’s what we’ll do after you send this.</p><ol>{[["We prepare your front desk","Your booking page and phone setup."],["We test it together","We’ll contact you to arrange a test."],["You’re ready to welcome bookings","We’ll email you when it’s live."]].map(([h,p],i)=><li key={h}><span>{i+1}</span><div><h3>{h}</h3><p>{p}</p></div></li>)}</ol><p className={styles.callout}>Need to change something? You can edit before sending.</p></aside>
   </div></div>
   {error&&<p role="alert" className={styles.error}>{error}</p>}
   <div className={styles.actions}>{step===1?<Link href={preview?"/account?preview=confirmation":"/account"} className={styles.secondary}>← Back</Link>:<button type="button" className={styles.secondary} disabled={busy} onClick={()=>move(step-1)}>← Back</button>}<div><button className={styles.primary} disabled={busy}>{busy?"Sending…":step===1?"Hours & team →":step===2?"Review my setup →":"Send for setup →"}</button>{step===3&&<p>Your service is not live until setup and testing are complete.</p>}</div></div>
  </form>
 </AccountShell>;
}
