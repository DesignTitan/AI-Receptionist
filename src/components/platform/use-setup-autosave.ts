"use client";
import {useEffect,useRef,useState} from 'react';
import type {SetupDraft} from '@/lib/platform/setup-draft';
export const PREVIEW_DRAFT_KEY='receptionist-setup-preview-v1';
export function useSetupAutosave(draft:SetupDraft,preview:boolean,enabled:boolean){
 const [status,setStatus]=useState('');const current=useRef(draft);current.current=draft;const queue=useRef(Promise.resolve());const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const generation=useRef(0);const last=useRef('');
 function save(){clearTimeout(timer.current);const payload=JSON.stringify(current.current);const version=++generation.current;setStatus('Saving…');const task=queue.current.catch(()=>{}).then(async()=>{if(preview)localStorage.setItem(PREVIEW_DRAFT_KEY,payload);else{const r=await fetch('/api/account/setup-draft',{method:'PATCH',headers:{'Content-Type':'application/json'},body:payload,keepalive:true});if(!r.ok)throw Error('Your draft could not be saved.');}last.current=payload;});queue.current=task;task.then(()=>{if(version===generation.current)setStatus(preview?'Saved on this device':'Saved');},()=>{if(version===generation.current)setStatus('Not saved — please try again');});return task;}
 const serialized=JSON.stringify(draft);
 useEffect(()=>{if(!enabled||!Object.keys(draft.details).length||serialized===last.current)return;setStatus('Saving…');timer.current=setTimeout(()=>{void save().catch(()=>{});},650);return()=>clearTimeout(timer.current);},[serialized,enabled]);
 return {status,flush:save};
}
