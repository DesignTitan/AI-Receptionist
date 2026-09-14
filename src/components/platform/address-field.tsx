"use client";
import { useEffect, useId, useRef, useState } from "react";
import { uniqueSuggestions, type AddressSuggestion } from "@/lib/platform/address-suggestions";
import styles from "./address-field.module.css";

// Photon searches worldwide by default; we only onboard US businesses, so keep results inside the US (incl. Alaska and Hawaii).
const US_BBOX = "-179.9,17.5,-65,71.5";
const IDLE_HINT = "Start typing to see suggestions. Choose one, edit it, or enter your full address manually.";

export function AddressField({defaultValue}:{defaultValue?:string}) {
 const id=useId();const input=useRef<HTMLInputElement>(null);const root=useRef<HTMLDivElement>(null);const chosen=useRef(defaultValue??"");
 const [query,setQuery]=useState("");const [results,setResults]=useState<AddressSuggestion[]>([]);const [status,setStatus]=useState("");const [open,setOpen]=useState(false);const [active,setActive]=useState(-1);
 useEffect(()=>{setResults([]);setActive(-1);if(query===chosen.current){setOpen(false);return;}if(query.trim().length<4){setStatus("");setOpen(false);return;}const controller=new AbortController();let timeout:ReturnType<typeof setTimeout>;const timer=setTimeout(async()=>{setStatus("Searching addresses…");timeout=setTimeout(()=>controller.abort(),5000);try{const r=await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6&lang=en&bbox=${US_BBOX}`,{signal:controller.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw Error();const data=await r.json();const list=uniqueSuggestions(data.features??[]);setResults(list);setOpen(list.length>0);setStatus(list.length?`${list.length} suggestion${list.length===1?"":"s"}. Use the arrow keys to pick one, or keep typing.`:"No match found. You can use the address you typed.");}catch{if(!controller.signal.aborted)setStatus("Address search is unavailable. You can still type your full address.");else setStatus("You can continue with your full address.");}finally{clearTimeout(timeout);}},450);return()=>{clearTimeout(timer);clearTimeout(timeout);controller.abort();};},[query]);
 useEffect(()=>{const away=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener("pointerdown",away);return()=>document.removeEventListener("pointerdown",away);},[]);
 function choose(s:AddressSuggestion){const el=input.current;if(!el)return;chosen.current=s.value;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;set?.call(el,s.value);el.dispatchEvent(new Event("input",{bubbles:true}));setOpen(false);setResults([]);setStatus("Address filled in. Edit it if anything needs changing.");el.focus();}
 function onKeyDown(e:React.KeyboardEvent<HTMLInputElement>){
  if(e.key==="Escape"){if(open){e.preventDefault();setOpen(false);}return;}
  if(!results.length)return;
  if(e.key==="ArrowDown"){e.preventDefault();setOpen(true);setActive(i=>(i+1)%results.length);}
  else if(e.key==="ArrowUp"){e.preventDefault();setOpen(true);setActive(i=>(i<=0?results.length:i)-1);}
  else if(e.key==="Enter"&&open&&active>=0){e.preventDefault();choose(results[active]);}
  else if(e.key==="Tab")setOpen(false);
 }
 const listId=`${id}-suggestions`;
 return <div ref={root} className={styles.field}>
  <div className={`${styles.combo} platform-fieldbox`} onClick={e=>{if(e.target===e.currentTarget)input.current?.focus();}}>
   <label htmlFor={id}>Business address</label>
   <input ref={input} id={id} name="address" required maxLength={300} autoComplete="off" placeholder="Start typing your street address" defaultValue={defaultValue} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open&&active>=0?`${listId}-${active}`:undefined} aria-describedby={`${id}-hint`} onChange={e=>setQuery(e.target.value)} onFocus={()=>{if(results.length)setOpen(true);}} onKeyDown={onKeyDown}/>
   <ul id={listId} role="listbox" aria-label="Address suggestions" className={styles.list} hidden={!open}>
    {results.map((s,i)=><li key={s.value} id={`${listId}-${i}`} role="option" aria-selected={i===active} className={styles.option} data-active={i===active||undefined} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(s)} onPointerMove={()=>setActive(i)}><span className={styles.primary}>{s.primary}</span>{s.secondary&&<span className={styles.secondary}>{s.secondary}</span>}</li>)}
   </ul>
  </div>
  <small id={`${id}-hint`} aria-live="polite">{status||IDLE_HINT}</small>
  <small>Search by <a href="https://photon.komoot.io" target="_blank" rel="noreferrer">Photon</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></small>
 </div>;
}
