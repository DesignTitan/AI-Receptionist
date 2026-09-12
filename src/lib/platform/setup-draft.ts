import {validateWeeklyHours,type DayHours} from "./weekly-hours.ts";
import type { TeamMember } from './model';
export type SetupDraft={weeklyHours?:DayHours[];details:Record<string,string>;days:number[];opens:string;closes:string;timezone:string;team:TeamMember[]};
export function validateSetupDraft(value:unknown):SetupDraft{
 if(!value||typeof value!=="object")throw Error("Invalid draft.");
 const d=value as SetupDraft;const keys=["business_name","trade","address","phone","areaCode","color","phoneProvider","phoneServiceType","phoneServiceName","bookingSystem","answeringPreference"];
 const details:Record<string,string>={};for(const key of keys){const v=d.details?.[key]??"";if(typeof v!=="string"||v.length>300)throw Error("Invalid draft field.");details[key]=v;}
 if(!Array.isArray(d.days)||d.days.length>7||d.days.some(n=>!Number.isInteger(n)||n<0||n>6))throw Error("Invalid days.");
 for(const k of ["opens","closes","timezone"] as const)if(typeof d[k]!=="string"||d[k].length>80)throw Error("Invalid schedule.");
 if(!Array.isArray(d.team)||d.team.length>20)throw Error("Invalid team.");
 const team=d.team.map(m=>{if(!m||typeof m.id!=="string"||m.id.length>80||typeof m.name!=="string"||m.name.length>120||typeof m.service!=="string"||m.service.length>120||!Number.isFinite(m.minutes)||m.minutes<0||m.minutes>240)throw Error("Invalid team member.");return {id:m.id,name:m.name,service:m.service,minutes:m.minutes};});
 return {...(d.weeklyHours?{weeklyHours:validateWeeklyHours(d.weeklyHours,false)}:{}),details,days:d.days,opens:d.opens,closes:d.closes,timezone:d.timezone,team};
}
