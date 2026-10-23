export interface MonthlyRow {month:string;stream:string;country:string;director:string;actual:number|null;target:number|null;}
export const streams=['I2P','I2C','R2R','MDM','ICO'];
export const countries=['Costa Rica','Poland'];
export function previousMonth(month:string):string {const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m-2,1)).toISOString().slice(0,7);}
export function percentage(value:number|null,base:number|null):number|null {return value===null||base===null||base===0?null:value/base;}
export function normalize(rows:MonthlyRow[]):MonthlyRow[]{const map=new Map<string,MonthlyRow>();for(const row of rows){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.month))throw new Error('Invalid reporting month.');for(const key of ['actual','target'] as const){const value=row[key];if(value!==null&&(!Number.isInteger(value)||value<0))throw new Error('Headcount and targets must be nonnegative whole numbers.');}const key=[row.month,row.stream,row.country].join('|'),prior=map.get(key);if(prior&&JSON.stringify(prior)!==JSON.stringify(row))throw new Error('Conflicting monthly workstream/country rows. Resolve duplicate keys before reporting.');map.set(key,row);}return [...map.values()];}
export function compare(rows:MonthlyRow[],month:string,stream='All',country='Both'){
 const pairs=streams.filter(s=>stream==='All'||s===stream).flatMap(s=>countries.filter(c=>country==='Both'||c===country).map(c=>[s,c]));
 const sum=(date:string,key:'actual'|'target'):number|null=>{let total=0;for(const [s,c] of pairs){const r=rows.find(r=>r.month===date&&r.stream===s&&r.country===c);if(!r||r[key]===null)return null;total+=r[key]!;}return total;};
 const priorMonth=previousMonth(month),actual=sum(month,'actual'),prior=sum(priorMonth,'actual'),target=sum(month,'target'),priorTarget=sum(priorMonth,'target');
 const sub=(a:number|null,b:number|null)=>a===null||b===null?null:a-b;
 const mom=sub(actual,prior),gap=sub(actual,target),priorGap=sub(prior,priorTarget),gapChange=sub(gap,priorGap),reduction=sub(prior,actual),plannedReduction=sub(priorTarget,target);
 const current=rows.filter(r=>r.month===month&&(stream==='All'||r.stream===stream)&&(country==='Both'||r.country===country));
 const met=actual===null||target===null?null:current.filter(r=>r.actual!==null&&r.target!==null&&r.actual<=r.target).length;
 const required=actual===null||target===null?null:current.reduce((n,r)=>n+Math.max(0,r.actual!-r.target!),0);
 return {actual,prior,target,priorTarget,mom,momPct:percentage(mom,prior),gap,gapPct:percentage(gap,target),priorGap,gapChange,reduction,plannedReduction,required,met,pairCount:pairs.length};
}
