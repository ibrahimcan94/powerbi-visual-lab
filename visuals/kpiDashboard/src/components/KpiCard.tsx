import React, { useEffect, useState } from "react";
import { DashboardData, variance, performanceDirection } from "../data/model";
import { formatNumber } from "../utils/format";
import { VisualFormattingSettingsModel } from "../settings";
import { TrendChart } from "./TrendChart";
export interface DashboardProps {
    data: DashboardData;
    settings: VisualFormattingSettingsModel;
    locale: string;
    width: number;
    height: number;
    foreground?: string;
    background?: string;
    keys: string[];
    select: (index: number, multi: boolean) => Promise<string[]>;
    clear: () => Promise<void>;
    context: (index: number, x: number, y: number) => void;
    finished: () => void;
}
export const KpiCard: React.FC<DashboardProps> = props => {
    const { data, settings, locale } = props, d = settings.dashboard, c = settings.chart;
    const [selected, setSelected] = useState<string[]>([]);
    useEffect(() => { props.finished(); }, [props.finished]);
    useEffect(() => { setSelected([]); }, [data]);
    const fmt = (v: number | null) => formatNumber(v, locale, d.decimals.value, d.prefix.value, d.suffix.value, d.percent.value);
    const delta = variance(data.value, data.comparison);
    const direction = delta ? performanceDirection(delta.absolute, d.lowerIsBetter.value) : 0;
    const style = { width: props.width, height: props.height, background: props.background ?? (d.light.value ? "#ffffff" : d.background.value.value), color: props.foreground ?? (d.light.value ? "#111827" : d.text.value.value), "--accent": props.foreground ?? d.accent.value.value } as React.CSSProperties;
    return <section className={"kpi-card " + (c.animation.value ? "animated" : "") + (props.height < 260 ? " compact" : "")} style={style} aria-label={d.title.value || data.title}>
 <header>{d.showTitle.value && <div className="kpi-title">{d.title.value || data.title}</div>}{selected.length > 0 && <button className="clear-selection" onClick={() => void props.clear().then(() => setSelected([]))}>Clear selection</button>}</header>
 <div className="kpi-value" style={{ fontSize: Math.max(12, Math.min(96, d.fontSize.value)) }}>{fmt(data.value)}</div>
 {data.value === null && <div className="trend-empty">Bind an independent headline measure. For category-independent totals, use a DAX measure that removes the trend axis filter.</div>}
 {d.showComparison.value && delta && <div className="kpi-variance" style={{ color: props.foreground ?? (direction > 0 ? "#10b981" : direction < 0 ? "#fb7185" : "inherit") }}>{delta.absolute > 0 ? "↑" : delta.absolute < 0 ? "↓" : "→"} {fmt(delta.absolute)} · {delta.percent === null ? "Percentage unavailable (zero baseline)" : formatNumber(delta.percent, locale, 1, "", "", true)} vs {fmt(data.comparison)}</div>}
 {c.show.value && <TrendChart data={data.points} settings={c} color={props.foreground ?? c.lineColor.value.value} format={fmt} selected={selected} keys={props.keys} select={(i, m) => void props.select(i, m).then(setSelected)} context={props.context}/>}
 </section>;
};
