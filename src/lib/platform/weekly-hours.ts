export type DayHours={day:number;enabled:boolean;opens:string;closes:string};
export const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const timeMinutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
export const minuteTime=(minutes:number)=>`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
export function weeklyHoursFor(config:{weeklyHours?:DayHours[];days:number[];opens:string;closes:string}):DayHours[]{return config.weeklyHours??Array.from({length:7},(_,day)=>({day,enabled:config.days.includes(day),opens:config.opens,closes:config.closes}));}
export function validateWeeklyHours(value:unknown,requireOpen=true):DayHours[]{
 if(!Array.isArray(value)||value.length!==7)throw Error('Include all seven days in your schedule.');
 const seen=new Set<number>();const result=value.map((d:DayHours)=>{if(!d||!Number.isInteger(d.day)||d.day<0||d.day>6||seen.has(d.day)||typeof d.enabled!=='boolean')throw Error('Check your weekly schedule.');seen.add(d.day);if(typeof d.opens!=='string'||typeof d.closes!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.opens)||!/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(d.closes)||timeMinutes(d.opens)>=timeMinutes(d.closes))throw Error(`${DAY_NAMES[d.day]}: closing time must be after opening time.`);return {day:d.day,enabled:d.enabled,opens:d.opens,closes:d.closes};});
 if(requireOpen&&!result.some(d=>d.enabled))throw Error('Choose at least one day for appointments.');return result.sort((a,b)=>a.day-b.day);
}
