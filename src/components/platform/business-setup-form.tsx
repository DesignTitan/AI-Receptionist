"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLANS, validateConfig, type Customer, type Plan } from "@/lib/platform/model";
import { PHONE_PROVIDERS } from "@/lib/platform/phone-provider";
import { PhoneProviderFields } from "./phone-provider-fields";
import { ANSWERING_PREFERENCES, type AnsweringPreference } from "@/lib/platform/answering-preference";
import { validateSetupDraft, type SetupDraft } from "@/lib/platform/setup-draft";
import { useSetupAutosave, PREVIEW_DRAFT_KEY } from "./use-setup-autosave";
import {WeeklyHoursEditor} from "./weekly-hours-editor";
import {weeklyHoursFor} from "@/lib/platform/weekly-hours";
import { AddressField } from "./address-field";
import { AccountShell } from "./account-shell";
import styles from "./business-setup-form.module.css";
const sections=["business-details","hours-team","review-setup"];
const weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const zones=["America/New_York","America/Detroit","America/Chicago","America/Denver","America/Los_Angeles","America/Phoenix","America/Anchorage","Pacific/Honolulu"];
const clock=(value:string)=>{if(!value)return "—";const [h,m]=value.split(":").map(Number);return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;};
type SetupProps={customer:Customer|null;plan:Plan;preview?:boolean;initialStep?:number;embedded?:boolean};
export function BusinessSetupForm(props:SetupProps){
 const [loaded,setLoaded]=useState(!props.preview);const [draft,setDraft]=useState<SetupDraft|undefined>(props.customer?.config.setupDraft);
 useEffect(()=>{if(props.preview){try{const raw=localStorage.getItem(PREVIEW_DRAFT_KEY);if(raw)setDraft(validateSetupDraft(JSON.parse(raw)));}catch{}setLoaded(true);}},[props.preview]);
 return loaded?<SetupFields {...props} draft={draft}/>:<p>Loading your setup…</p>;
}
function SetupFields({customer,plan,preview=false,initialStep=1,embedded=false,draft}:{draft?:SetupDraft}&SetupProps) {
 const chosen=customer?.plan??plan;
 const c=customer?.config.setupPending?undefined:customer?.config;
 const [step,setStep]=useState(initialStep),[team,setTeam]=useState(draft?.team??c?.team??(preview?[{id:"member-1",name:"Jordan Davis",service:"Haircut",minutes:45},{id:"member-2",name:"Morgan Lee",service:"Colour consultation",minutes:30}]:[{id:"member-1",name:"",service:"",minutes:30}]));
 const [weeklyHours,setWeeklyHours]=useState(()=>weeklyHoursFor(draft??c??{days:[1,2,3,4,5],opens:"09:00",closes:"17:00"}));
 const days=weeklyHours.filter(d=>d.enabled).map(d=>d.day),opens=weeklyHours.find(d=>d.enabled)?.opens??"09:00",closes=weeklyHours.find(d=>d.enabled)?.closes??"17:00";
 const [timezone,setTimezone]=useState(draft?.timezone??c?.timezone??"America/New_York");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[saved,setSaved]=useState(false);
 const [details,setDetails]=useState<Record<string,string>>(draft?.details??(preview?{business_name:"Willow Studio",trade:"salon",address:"123 Example Street, Detroit, MI",phone:"(313) 555-0142",areaCode:"313",color:"#1e3a34",phoneProvider:"unknown",phoneServiceType:"unknown",phoneServiceName:"",bookingSystem:"Paper calendar"}:{}));
 const autosave=useSetupAutosave({details,weeklyHours,days,opens,closes,timezone,team},preview,!busy&&(preview||!!customer?.config.setupPending));
 const form=useRef<HTMLFormElement>(null),navigation=useRef<HTMLElement>(null);
 const readDetails=()=>Object.fromEntries(Array.from(new FormData(form.current!).entries()).map(([k,v])=>[k,String(v)]));
 const move=(n:number)=>{setStep(n);const section=document.getElementById(sections[n-1]);section?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});section?.focus({preventScroll:true});history.replaceState(null,"",`#${sections[n-1]}`);};
 useEffect(()=>{
  setDetails(readDetails());
  const update=()=>{const edge=(navigation.current?.getBoundingClientRect().bottom??160)+40;let active=1;sections.forEach((id,i)=>{if((document.getElementById(id)?.getBoundingClientRect().top??Infinity)<=edge)active=i+1;});setStep(active);};
  const frame=requestAnimationFrame(()=>{const hash=sections.indexOf(location.hash.slice(1));if(hash>=0||initialStep>1)move(hash>=0?hash+1:initialStep);else update();});
  window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
 },[initialStep]);
 const config=(d:Record<string,string>)=>({answeringPreference:d.answeringPreference,trade:d.trade,address:d.address,phone:d.phone,areaCode:d.areaCode,color:d.color,weeklyHours,days,opens,closes,timezone,team:[{id:"member-1",name:d.business_name,service:"Appointment",minutes:team[0]?.minutes??30}],phoneSetup:{provider:d.phoneProvider,serviceType:d.phoneServiceType,serviceName:d.phoneServiceName,bookingSystem:d.bookingSystem}});
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setError("");setSaved(false);
  const inputs=form.current?.querySelectorAll<HTMLInputElement|HTMLSelectElement>("input,select")??[];
  for(const input of inputs){if(!input.checkValidity()){move(Number(input.closest("[data-step]")?.getAttribute("data-step")??1));input.focus({preventScroll:true});input.reportValidity();return;}}
  const d=readDetails();setDetails(d);
  try{validateConfig(config(d));if(team.length>PLANS[chosen].teamLimit)throw Error(`Your plan supports up to ${PLANS[chosen].teamLimit} people.`);setBusy(true);if(preview||customer?.config.setupPending)await autosave.flush();if(preview){setSaved(true);return;}const r=await fetch("/api/account/business",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_name:d.business_name,config:config(d)})});const data=await r.json();if(!r.ok)throw Error(data.error??"We couldn’t save your setup.");location.assign("/account");}catch(e){setError(e instanceof Error?e.message:"Please check your details.");}finally{setBusy(false);}}
 const firstName=customer?.config.contactName?.trim().split(/\s+/)[0]??(preview?"Bubs":"");
 const content=<>
  {!embedded&&<header className={styles.heading}><h1>Set up your business</h1><p>Fill in your details, set your hours and review everything below.</p></header>}
  <nav ref={navigation} className={styles.sectionNav} aria-label="Setup sections"><ol className={styles.progress}>{["Business details","Hours & availability","Review & setup"].map((label,i)=><li key={label}><a href={`#${sections[i]}`} aria-current={step===i+1?"location":undefined} onClick={e=>{e.preventDefault();move(i+1);}}><span>{i+1}</span>{label}</a></li>)}</ol><p className={styles.saveStatus} role="status">{autosave.status}{autosave.status.startsWith("Not saved")&&<button type="button" onClick={()=>void autosave.flush().catch(()=>{})}>Retry</button>}</p></nav>
  <form ref={form} onChange={()=>{requestAnimationFrame(()=>setDetails(readDetails()));setSaved(false);setError("");}} onSubmit={submit} noValidate className={styles.form}>
   <section id="business-details" tabIndex={-1} aria-labelledby="business-title" data-step="1" className={`${styles.section} ${styles.first}`}>
    <h2 id="business-title" className={styles.sectionTitle}>Business details</h2>
      <fieldset>
        <legend>Your business</legend>
        <div className="platform-fields">
          <label>
            Business name
            <input
              name="business_name"
              required
              maxLength={120}
              defaultValue={draft?.details.business_name??(preview?details.business_name:customer?.config.setupPending ? "" : customer?.business_name)}
            />
          </label>
          <label>
            Business type
            <select name="trade" defaultValue={draft?.details.trade??c?.trade ?? "salon"}>
              <option value="salon">Salon, spa or wellness</option>
              <option value="studio">Creative studio</option>
              <option value="other">Other appointment business</option>
            </select>
          </label>
          <AddressField defaultValue={c?.address??details.address}/>
          <label>
            Business or contact phone number
            <input name="phone" type="tel" required defaultValue={c?.phone??details.phone} aria-describedby="phone-purpose"/><small id="phone-purpose">Use a number customers can reach you on, including a mobile if you don’t have a business line. It appears on your booking page.</small>
          </label>
          <label>
            Area code for your new AI number
            <input
              name="areaCode"
              required
              pattern="[2-9][0-9]{2}"
              placeholder="e.g. 313"
              inputMode="numeric"
              maxLength={3}
              defaultValue={c?.areaCode??details.areaCode}
              aria-describedby="area-purpose"
            /><small id="area-purpose">Your AI receptionist gets a dedicated number for confirmation calls. Choose its local area code; availability is confirmed during setup.</small>
          </label>
          <div><label>
            Brand color
            <input
              type="color"
              name="color"
              defaultValue={draft?.details.color??c?.color ?? "#234d59"}
              className="mt-3 h-11 w-24"
            />
          </label><small>This accent appears at the top of your business information card on the customer booking page.</small><div className={styles.colorPreview} style={{borderTopColor:details.color||c?.color||"#234d59"}} aria-label="Booking page color preview"><small>BOOKING PAGE PREVIEW</small><strong>We’ll see you soon.</strong><span>{details.business_name||"Your business"}</span><span>{details.address||"Your address and opening hours"}</span></div></div>
        </div>
        <p className="platform-note">
          We start with non-medical businesses. Medical workflows need a
          separate review before onboarding.
        </p>
      </fieldset>
      <PhoneProviderFields initial={draft?{provider:draft.details.phoneProvider as import("@/lib/platform/phone-provider").PhoneSetup["provider"],serviceType:draft.details.phoneServiceType as import("@/lib/platform/phone-provider").PhoneSetup["serviceType"],serviceName:draft.details.phoneServiceName,bookingSystem:draft.details.bookingSystem}:c?.phoneSetup??(preview?{provider:"unknown",serviceType:"unknown",serviceName:"",bookingSystem:"Paper calendar"}:undefined)} />
   <div className={styles.actions}><button type="button" className={styles.secondary} onClick={()=>move(2)}>Next: Hours & availability ↓</button></div>
   </section>
   <section id="hours-team" tabIndex={-1} aria-labelledby="hours-title" data-step="2" className={styles.section}><h2 id="hours-title" className={styles.sectionTitle}>Hours & availability</h2>
      <section className={styles.card}><div className={styles.cardHeader}><div><h2>Your week, at a glance</h2><p>Select your days. Drag the handles or enter the times below. All day means 24 hours.</p></div><label className={styles.zone}>Time zone<select aria-label="Time zone" value={timezone} onChange={e=>setTimezone(e.target.value)}>{Array.from(new Set([...zones,timezone])).map(z=><option key={z} value={z}>{z.replace("America/","").replaceAll("_"," ")}</option>)}</select></label></div><WeeklyHoursEditor value={weeklyHours} onChange={setWeeklyHours}/><p className={styles.note}>Times adjust in 15-minute steps. These are booking hours; AI call handling is separate.</p></section>
    <div className={styles.columns} style={{marginTop:20}}>
      <section className={styles.card}><h2>Appointment length</h2><p>One shared appointment schedule for your business.</p><label className={styles.answering}>How long is a typical appointment?<select aria-label="Appointment length" value={team[0]?.minutes??30} onChange={e=>setTeam([{id:"member-1",name:"",service:"Appointment",minutes:Number(e.target.value)}])}>{[15,30,45,60,90,120,180,240].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label></section>
      <section className={styles.card}><h2>How should AI handle calls?</h2><p>Your opening hours control when customers can book. This is a separate preference for answering the phone.</p><label className={styles.answering}>Your answering preference<select name="answeringPreference" defaultValue={draft?.details.answeringPreference||c?.answeringPreference||"undecided"}>{Object.entries(ANSWERING_PREFERENCES).map(([key,item])=><option key={key} value={key}>{item.label}</option>)}</select></label><p className={styles.note}>{ANSWERING_PREFERENCES[(details.answeringPreference||"undecided") as AnsweringPreference]?.description}</p><p className={styles.note}>This saves your preference only. We’ll confirm forwarding, staff availability, fallback behavior and testing before activating calls. Usage limits still apply.</p></section>
    </div>
   <div className={styles.actions}><button type="button" className={styles.secondary} onClick={()=>move(3)}>Next: Review & setup ↓</button></div>
   </section>
   <section id="review-setup" tabIndex={-1} aria-labelledby="review-title" data-step="3" className={styles.section}><h2 id="review-title" className={styles.sectionTitle}>Review & setup</h2><div className={styles.columns}>
    <div className={styles.stack}>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Your business</h2><button type="button" className={styles.edit} onClick={()=>move(1)}>Edit business</button></div><h3>{details.business_name}</h3><p>{details.trade==='salon'?"Salon, spa or wellness":details.trade==='studio'?"Creative studio":"Appointment business"}</p><p>{details.address}</p><p>Business phone: {details.phone}</p></section>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Hours & availability</h2><button type="button" className={styles.edit} onClick={()=>move(2)}>Edit hours</button></div><dl className={styles.summary}>{[1,2,3,4,5,6,0].map(day=>{const d=weeklyHours.find(h=>h.day===day)!;return <div key={day} style={{display:"contents"}}><dt>{weekdays[day]}</dt><dd>{d.enabled?d.opens==="00:00"&&d.closes==="24:00"?"All day":`${clock(d.opens)}–${d.closes==="24:00"?"Midnight":clock(d.closes)}`:"Closed"}</dd></div>})}</dl><p>{timezone.replaceAll("_"," ")}</p><p>Appointment length: {team[0]?.minutes??30} minutes · One shared schedule</p></section>
     <section className={styles.card}><div className={styles.cardHeader}><h2>Phone & appointment book</h2><button className={styles.edit} type="button" onClick={()=>move(1)}>Edit phone details</button></div><dl className={styles.summary}><dt>AI answering preference</dt><dd>{ANSWERING_PREFERENCES[(details.answeringPreference||"undecided") as AnsweringPreference]?.label}</dd><dt>Phone provider</dt><dd>{PHONE_PROVIDERS[details.phoneProvider as keyof typeof PHONE_PROVIDERS]??"Not sure yet"}</dd><dt>Current booking</dt><dd>{details.bookingSystem||"Not specified"}</dd><dt>Preferred area code</dt><dd>{details.areaCode}</dd></dl><p className={styles.note}>We’ll confirm connection options with you.</p></section>
    </div>
    <aside className={`${styles.card} ${styles.next}`}><img src="/marketing/happy-mascot-pointed.png" alt="" width="96" height="96"/><h2>What happens next</h2><p>Here’s what we’ll do after you send this.</p><ol>{[["We prepare your front desk","Your booking page and phone setup."],["We test it together","We’ll contact you to arrange a test."],["You’re ready to welcome bookings","We’ll email you when it’s live."]].map(([h,p],i)=><li key={h}><span>{i+1}</span><div><h3>{h}</h3><p>{p}</p></div></li>)}</ol><p className={styles.callout}>Need to change something? You can edit before sending.</p></aside>
   </div>
   {error&&<p role="alert" className={styles.error}>{error}</p>}
   {saved&&<p role="status" className={styles.callout}>Your example setup is ready. This local preview has not submitted any account data.</p>}
   <div className={styles.actions}><Link href={preview?"/account?preview=confirmation":"/account"} className={styles.secondary}>Back to overview</Link><div><button className={styles.primary} disabled={busy}>{busy?"Sending…":"Send for setup →"}</button><p>Your service is not live until setup and testing are complete.</p></div></div>
   </section>
  </form>
 </>;
 return embedded?content:<AccountShell name={firstName} preview={preview} billingAvailable={!preview}>{content}</AccountShell>;
}
