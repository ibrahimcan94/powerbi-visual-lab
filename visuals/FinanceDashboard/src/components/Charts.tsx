import React,{useId,useMemo,useState} from "react";
import * as d3 from "d3";
import {Trend} from "../finance/model";
import {Icon} from "./Icons";
export interface Series { key:"ar"|"cash"|"billings"|"dso"|"overdueRate"|"cashTarget"|"cei";name:string;color:string }
interface ChartProps{title:string;subtitle:string;points:Trend[];series:Series[];tone?:"blue"|"green"|"ink";format:(value:number|null)=>string;onMonth:(date:string)=>void;kind?:"line"|"bar"}
export const TimeChart:React.FC<ChartProps>=({title,subtitle,points,series,tone,format,onMonth,kind="line"})=>{
    const [active,setActive]=useState<number|null>(null),uid=useId().replace(/[^a-zA-Z0-9]/g,"");
    const geometry=useMemo(()=>{
        const vals=points.flatMap(p=>series.map(s=>p[s.key])).filter((v):v is number=>v!==null);
        const max=d3.max(vals)??1,min=Math.min(0,d3.min(vals)??0),span=Math.max(max-min,1);
        const x=d3.scaleLinear().domain([0,Math.max(points.length-1,1)]).range([42,574]);
        const y=d3.scaleLinear().domain([min,max+span*.14]).nice().range([155,12]);
        const line=(s:Series)=>d3.line<Trend>().defined(p=>p[s.key]!==null).x((_,i)=>x(i)).y(p=>y(p[s.key]??0)).curve(d3.curveMonotoneX)(points)??"";
        return {x,y,line,ticks:y.ticks(4)};
    },[points,series]);
    const current=active!==null?points[active]:null;
    return <section className={"fd-chart-card "+(tone?"raised "+tone:"")} aria-label={title}>
        <div className="fd-plot">
        <svg viewBox="0 0 600 182" role="group" aria-label={title+". Select a period to update the dashboard."}>
            <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={series[0].color} stopOpacity=".16"/><stop offset="100%" stopColor={series[0].color} stopOpacity="0"/></linearGradient></defs>
            {geometry.ticks.map(t=><g key={t}><line x1="42" x2="574" y1={geometry.y(t)} y2={geometry.y(t)} className="fd-grid"/><text x="35" y={geometry.y(t)+3} textAnchor="end" className="fd-axis">{Math.abs(t)>=1e6?(t/1e6).toFixed(1)+"m":Math.abs(t)>=1000?(t/1000).toFixed(0)+"k":t.toFixed(t>0&&t<1?1:0)}</text></g>)}
            {series.map((s,si)=>kind==="bar"?<g key={s.key}>{points.map((p,i)=>{const v=p[s.key];return v===null?null:<rect key={p.date} x={geometry.x(i)-10+si*10} y={Math.min(geometry.y(v),geometry.y(0))} width={8} height={Math.max(1,Math.abs(geometry.y(0)-geometry.y(v)))} rx="2" fill={tone?(si?"#ffffff70":"#ffffff"):s.color}/>;})}</g>:<path key={s.key} d={geometry.line(s)} stroke={tone?(si?"#ffffff70":"#ffffff"):s.color} fill="none" strokeWidth={si?2:3} strokeDasharray={si?"5 4":undefined}/>)}
            {current&&active!==null&&<line x1={geometry.x(active)} x2={geometry.x(active)} y1="12" y2="155" className="fd-crosshair"/>}
            {points.map((p,i)=><g key={p.date}>
                <text x={geometry.x(i)} y="177" textAnchor="middle" className="fd-axis">{p.label}</text>
                <rect className="fd-hit" x={geometry.x(i)-18} y="10" width="36" height="148" fill="transparent" role="button" tabIndex={0} aria-label={p.label+" "+p.date.slice(0,4)+", "+series.map(s=>s.name+" "+format(p[s.key])).join(", ")+". Filter to this month."} onPointerEnter={()=>setActive(i)} onPointerLeave={()=>setActive(null)} onFocus={()=>setActive(i)} onBlur={()=>setActive(null)} onClick={()=>onMonth(p.date)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onMonth(p.date);}}}/>
            </g>)}
        </svg>
        {current&&<div className="fd-chart-tooltip" role="tooltip"><strong>{current.date}</strong>{series.map(s=><span key={s.key}>{s.name}<b>{format(current[s.key])}</b></span>)}</div>}
        </div>
        <div className="fd-chart-caption"><h3>{title}</h3><p>{subtitle}</p><div className="fd-chart-foot"><Icon name="trend" size={14}/>{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.name}</span>)}<span className="fd-chart-hint">Select a month to explore</span></div></div>
    </section>;
};
export const BarList:React.FC<{items:{name:string;value:number}[];format:(v:number)=>string;color?:string;onSelect?:(name:string)=>void;empty?:string}>=({items,format,color="var(--fd-accent)",onSelect,empty="No balances for these filters."})=>{
    const max=Math.max(...items.map(i=>Math.abs(i.value)),1);
    return items.length?<div className="fd-bar-list">{items.map((item,i)=><button type="button" className="fd-bar-row" key={item.name} disabled={!onSelect} onClick={()=>onSelect?.(item.name)} aria-label={item.name+", "+format(item.value)+(onSelect?". Filter results.":"")}><span className="fd-bar-label">{item.name}</span><span className="fd-bar-track"><span style={{width:(Math.abs(item.value)/max*100)+"%",background:color,opacity:1-i*.07}}/></span><strong>{format(item.value)}</strong>{onSelect&&<Icon name="chevron" size={13}/>}</button>)}</div>:<p className="fd-empty">{empty}</p>;
};
