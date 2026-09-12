import { text, validateConfig, type BusinessConfig } from './model.ts';
import { weeklyHoursFor, validateWeeklyHours } from './weekly-hours.ts';
import { DEFAULT_PHONE_SETUP } from './phone-provider.ts';
export type BusinessRecord = {business_name:string;config:BusinessConfig};
export function businessPreferences(record:BusinessRecord) {
 const c=record.config;
 return {business_name:record.business_name,trade:c.trade,address:c.address,phone:c.phone,areaCode:c.areaCode,
  timezone:c.timezone,weeklyHours:weeklyHoursFor(c),appointmentMinutes:c.team[0]?.minutes??30,
  phoneSetup:c.phoneSetup??DEFAULT_PHONE_SETUP,answeringPreference:c.answeringPreference??'undecided'};
}
export type BusinessPreferences=ReturnType<typeof businessPreferences>;
/** Only owner-editable preferences may change. Never replace provisioning/billing data or provider IDs. */
export function applyBusinessPreferences(existing:BusinessRecord,input:unknown):BusinessRecord {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Check your business details.');
 const d=input as BusinessPreferences;
 const business_name=text(d.business_name,'business name',120);
 const weeklyHours=validateWeeklyHours(d.weeklyHours),open=weeklyHours.filter(day=>day.enabled);
 const config=validateConfig({...existing.config,trade:d.trade,address:d.address,phone:d.phone,areaCode:d.areaCode,
  timezone:d.timezone,weeklyHours,days:open.map(day=>day.day),opens:open[0].opens,closes:open[0].closes,
  phoneSetup:d.phoneSetup,answeringPreference:d.answeringPreference,
  team:existing.config.team.map((person,i)=>i?person:{...person,minutes:d.appointmentMinutes,
   name:existing.config.team.length===1&&person.name===existing.business_name?business_name:person.name})});
 return {business_name,config:{...existing.config,...config,team:config.team.map((person,i)=>({...person,id:existing.config.team[i].id}))}};
}
