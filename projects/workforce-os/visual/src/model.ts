export type Worker = { [key:string]: string | number };
export const fields = [
 ['id','Workday ID','string'],['snapshot','Snapshot_Date','dateTime'],['name','Worker Display Name','string'],['status','Worker Status','string'],['fte','Full Time Equivalent (FTE)','double'],['exclude','Exclude from Headcount','string'],['type','Worker Type','string'],['employeeType','Employee Type','string'],['hire','Latest Hire Date','dateTime'],['originalHire','Original Hire Date','dateTime'],['positionDate','Effective Date for Current Position','dateTime'],['manager','Is Manager','string'],['family','Job Family','string'],['title','Job Title','string'],['country','Work Country','string'],['region','Global Region','string'],['city','Work City','string'],['cost','Cost Center - Name','string'],['costId','Cost Center - ID','string'],['time','Time Type','string'],['grade','Job Grade - Number','string'],['managerId','Manager ID','string'],['level','Management Level according to Job Profile','string'],['entity','Government Reporting Entity','string']
];
export const bands=['<3 months','3–6 months','6–12 months','1–2 years','2–5 years','5–10 years','10+ years','Unknown'];
export function tenure(w:Worker):number { const d=(Date.parse(String(w.snapshot))-Date.parse(String(w.hire)))/86400000; return Number.isFinite(d)&&d>=0?d/365.25:NaN; }
export function band(w:Worker):string {const y=tenure(w);return !Number.isFinite(y)?'Unknown':bands[y<.25?0:y<.5?1:y<1?2:y<2?3:y<5?4:y<10?5:6];}
export function eligible(w:Worker):boolean {return !['yes','true','1'].includes(String(w.exclude).trim().toLowerCase()) && ['active','on leave'].includes(String(w.status).trim().toLowerCase());}
export function snapshotRows(rows:Worker[],date:string):{rows:Worker[],duplicates:number,conflicts:number} {
 const map=new Map<string,Worker>();let duplicates=0,conflicts=0;
 for(const w of rows.filter(r=>r.snapshot===date)){const id=String(w.id);if(!id)continue;if(map.has(id)){duplicates++;if(JSON.stringify(map.get(id))!==JSON.stringify(w))conflicts++;}else map.set(id,w);}
 return {rows:[...map.values()],duplicates,conflicts};
}
export function stats(rows:Worker[]) {const r=rows.filter(eligible),ys=r.map(tenure).filter(Number.isFinite);return {hc:r.length,fte:r.reduce((s,w)=>s+(Number.isFinite(Number(w.fte))?Number(w.fte):0),0),employees:r.filter(w=>w.type==='Employee').length,contingent:r.filter(w=>w.type==='Contingent Worker').length,managers:r.filter(w=>w.manager==='Yes').length,leave:r.filter(w=>w.status==='On Leave').length,tenure:ys.length?ys.reduce((a,b)=>a+b,0)/ys.length:0,new90:r.filter(w=>tenure(w)>=0&&tenure(w)<=90/365.25).length};}
export function groups(rows:Worker[],key:string,fte=false):[string,number][] {const m=new Map<string,number>();rows.filter(eligible).forEach(w=>{const k=key==='tenure'?band(w):String(w[key]||'Not specified');m.set(k,(m.get(k)||0)+(fte?Number(w.fte)||0:1));});return [...m].sort((a,b)=>b[1]-a[1]);}
