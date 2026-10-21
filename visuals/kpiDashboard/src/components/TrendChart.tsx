import React, { useId, useMemo, useState } from "react";
import * as d3 from "d3";
import { TrendPoint } from "../data/model";
import { VisualFormattingSettingsModel } from "../settings";
interface Props {
    data: TrendPoint[];
    settings: VisualFormattingSettingsModel["chart"];
    color: string;
    format: (v: number | null) => string;
    selected: string[];
    keys: string[];
    select: (i: number, multi: boolean) => void;
    context: (i: number, x: number, y: number) => void;
}
export const TrendChart: React.FC<Props> = ({ data, settings: s, color, format, selected, keys, select, context }) => {
    const [hover, setHover] = useState<number | null>(null), id = useId().replace(/[^a-zA-Z0-9]/g, "");
    const chart = useMemo(() => {
        const vals = data.flatMap(d => [d.value, d.comparison]).filter((v): v is number => v !== null);
        const min = d3.min(vals) ?? 0, max = d3.max(vals) ?? 1, pad = Math.max((max - min) * .15, Math.abs(max) * .05, .01);
        const y = d3.scaleLinear().domain([min - pad, max + pad]).range([146, 14]);
        const temporal = data.length > 1 && data.every(d => d.time !== null) && data[0].time !== data[data.length - 1].time;
        const x = d3.scaleLinear().domain(temporal ? [data[0].time ?? 0, data[data.length - 1].time ?? 1] : [0, Math.max(data.length - 1, 1)]).range([16, 584]);
        const px = (d: TrendPoint, i: number) => x(temporal ? d.time ?? i : i);
        const line = (field: "value" | "comparison") => d3.line<TrendPoint>().defined(d => d[field] !== null).x(px).y(d => y(d[field] ?? 0)).curve(d3.curveMonotoneX)(data) ?? "";
        const area = d3.area<TrendPoint>().defined(d => d.value !== null).x(px).y0(y(Math.max(min - pad, Math.min(max + pad, 0)))).y1(d => y(d.value ?? 0)).curve(d3.curveMonotoneX)(data) ?? "";
        return { y, px, line: line("value"), comparison: line("comparison"), area, ticks: y.ticks(4) };
    }, [data]);
    if (!data.length)
        return <div className="trend-empty">Add a trend axis and trend measure.</div>;
    const active = hover === null ? null : data[hover];
    return <div className="trend-container"><div className="trend-chart-area">
 <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="trend-svg" role="group" aria-label="Trend. Tab to points, Enter to select, Control or Command for multi-selection." onPointerLeave={() => setHover(null)}>
 <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={Math.max(0, Math.min(1, s.opacity.value))}/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
 {s.gridlines.value && chart.ticks.map(t => <line key={t} x1="16" x2="584" y1={chart.y(t)} y2={chart.y(t)} stroke="currentColor" opacity=".12"/>)}
 <path d={chart.area} fill={"url(#" + id + ")"}/><path d={chart.line} fill="none" stroke={color} strokeWidth={Math.max(1, Math.min(12, s.lineWidth.value))} vectorEffect="non-scaling-stroke"/>
 <path d={chart.comparison} fill="none" stroke="currentColor" strokeDasharray="5 4" opacity=".6" vectorEffect="non-scaling-stroke"/>
 {active && hover !== null && <line x1={chart.px(active, hover)} x2={chart.px(active, hover)} y1="10" y2="148" stroke="currentColor" opacity=".4" strokeDasharray="3 3"/>}
 {data.map((d, i) => d.value !== null && <g key={d.index}>
 <circle cx={chart.px(d, i)} cy={chart.y(d.value)} r={hover === i || selected.includes(keys[d.index]) ? 5 : 2.5} fill={color} opacity={selected.length && !selected.includes(keys[d.index]) ? .3 : 1}/>
 <circle className="point-target" cx={chart.px(d, i)} cy={chart.y(d.value)} r="10" fill="transparent" role="button" tabIndex={0} aria-label={d.label + ": " + format(d.value)} aria-pressed={selected.includes(keys[d.index])} onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={e => select(d.index, e.ctrlKey || e.metaKey)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(d.index, e.ctrlKey || e.metaKey);
        } if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            context(d.index, rect.x, rect.y);
        } }} onContextMenu={e => { e.preventDefault(); context(d.index, e.clientX, e.clientY); }}/>
 </g>)}
 </svg>
 {active && s.tooltips.value && <div className="trend-tooltip" role="tooltip" style={{ left: Math.max(18, Math.min(82, chart.px(active, hover ?? 0) / 6)) + "%", top: "12px", transform: "translateX(-50%)" }}><div className="tooltip-label">{active.label}</div><div>{format(active.value)}</div>{active.comparison !== null && <div>Comparison: {format(active.comparison)}</div>}</div>}
 </div><div className="trend-labels"><span>{data[0].label}</span><span>{data[data.length - 1].label}</span></div></div>;
};
