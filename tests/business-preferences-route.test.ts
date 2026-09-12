import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {applyBusinessPreferences,businessPreferences} from '../src/lib/platform/business-preferences.ts';
import {phoneSettingsRevision} from '../src/lib/platform/phone-settings-revision.ts';
const code=ts.transpileModule(readFileSync(new URL('../src/app/api/account/business-preferences/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const c={id:'customer-1',business_name:'Studio',config:{trade:'salon' as const,timezone:'UTC',days:[1,2,3,4,5],opens:'09:00',closes:'17:00',color:'#123456',areaCode:'313',address:'123 Example Street',phone:'+13135550142',team:[{id:'provider-42',name:'Studio',service:'Appointment',minutes:60}]}};
function harness({user=true,conflict=false,origin=true}={}){
 const filters:Array<[string,unknown]>=[];let update:any;
 const query={select(){return this;},eq(key:string,value:unknown){filters.push([key,value]);return this;},update(value:unknown){update=value;return this;},async maybeSingle(){return {data:update?(conflict?null:update):c,error:null};}};
 const modules:Record<string,unknown>={'next/server':{NextResponse:{json:(value:unknown,init?:ResponseInit)=>Response.json(value,init)}},'@/lib/platform/server':{owner:async()=>user?{id:'owner-1'}:null,checkOrigin:()=>{if(!origin)throw Error();}},'@/lib/supabase':{serviceClient:()=>({from:()=>query})},'@/lib/platform/business-preferences':{applyBusinessPreferences,businessPreferences},'@/lib/platform/phone-settings-revision':{phoneSettingsRevision}};
 const exports:any={};new Function('require','exports',code)((name:string)=>modules[name],exports);
 return {call:(body:unknown)=>exports.PATCH(new Request('http://localhost/api/account/business-preferences',{method:'PATCH',body:JSON.stringify(body)})) as Promise<Response>,filters,get update(){return update;}};
}
const payload=()=>({revision:phoneSettingsRevision({business_name:c.business_name,config:c.config}),preferences:{...businessPreferences(c),business_name:'Updated Studio'}});
test('settings endpoint rejects unsigned-in and cross-origin requests',async()=>{assert.equal((await harness({user:false}).call(payload())).status,401);assert.equal((await harness({origin:false}).call(payload())).status,403);});
test('settings endpoint scopes writes to owner and preserves record identity',async()=>{const h=harness();const response=await h.call({...payload(),status:'live',slug:'replace-me'});assert.equal(response.status,200);const result=await response.json();assert.equal(result.preferences.business_name,'Updated Studio');assert.equal(h.update.config.team[0].id,'provider-42');assert.deepEqual(Object.keys(h.update).sort(),['business_name','config']);assert.ok(h.filters.some(([k,v])=>k==='owner_id'&&v==='owner-1'));assert.ok(h.filters.some(([k,v])=>k==='config'&&v===JSON.stringify(c.config)));assert.notEqual(result.revision,payload().revision);});
test('stale revisions and concurrent updates do not overwrite changes',async()=>{const stale=harness();assert.equal((await stale.call({...payload(),revision:'old'})).status,409);assert.equal(stale.update,undefined);assert.equal((await harness({conflict:true}).call(payload())).status,409);});
