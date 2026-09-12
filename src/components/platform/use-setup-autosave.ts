"use client";
import {useEffect,useRef,useState} from 'react';
import type {SetupDraft} from '@/lib/platform/setup-draft';
export const PREVIEW_DRAFT_KEY='receptionist-setup-preview-v1';
export function useSetupAutosave(draft:SetupDraft,preview:boolean,enabled:boolean){
 const [status,setStatus]=useState('');const current=useRef(draft);current.current=draft;const queue=useRef(Promise.resolve());const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const generation=useRef(0);const last=useRef('');
 function save(){clearTimeout(timer.current);const payload=JSON.stringify(current.current);const version=++generation.current;setStatus('Saving…');const task=queue.current.catch(()=>{}).then(async()=>{if(preview)localStorage.setItem(PREVIEW_DRAFT_KEY,payload);else{const r=await fetch('/api/account/setup-draft',{method:'PATCH',headers:{'Content-Type':'application/json'},body:payload,keepalive:true});if(!r.ok)throw Error('Your draft could not be saved.');}last.current=payload;});queue.current=task;task.then(()=>{if(version===generation.current)setStatus(preview?'Saved on this device':'Saved');},()=>{if(version===generation.current)setStatus('Not saved — please try again');});return task;}
 const saveRef=useRef(save);saveRef.current=save;
 useEffect(()=>{if(!enabled)return;const flush=()=>{if(!Object.keys(current.current.details).length||JSON.stringify(current.current)===last.current)return;if(preview){clearTimeout(timer.current);try{localStorage.setItem(PREVIEW_DRAFT_KEY,JSON.stringify(current.current));}catch{}}else void saveRef.current().catch(()=>{});};const hidden=()=>{if(document.visibilityState==="hidden")flush();};window.addEventListener("pagehide",flush);document.addEventListener("visibilitychange",hidden);return()=>{window.removeEventListener("pagehide",flush);document.removeEventListener("visibilitychange",hidden);};},[enabled,preview]);
 const serialized=JSON.stringify(draft);
 useEffect(()=>{if(!enabled||!Object.keys(draft.details).length||serialized===last.current)return;setStatus('Saving…');timer.current=setTimeout(()=>{void save().catch(()=>{});},650);return()=>clearTimeout(timer.current);},[serialized,enabled]);
 return {status,flush:save};
}
