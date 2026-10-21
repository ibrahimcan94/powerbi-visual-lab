import powerbi from "powerbi-visuals-api";
export interface TrendPoint {
    label: string;
    value: number | null;
    comparison: number | null;
    index: number;
    time: number | null;
}
export interface DashboardData {
    title: string;
    value: number | null;
    comparison: number | null;
    points: TrendPoint[];
}
export const finite = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) ? v : null;
export function variance(v: number | null, c: number | null): {
    absolute: number;
    percent: number | null;
} | null { return v === null || c === null ? null : { absolute: v - c, percent: c === 0 ? null : (v - c) / Math.abs(c) }; }
export function parseData(view?: powerbi.DataView, locale = "en-US"): DashboardData {
    const col = (role: string) => view?.categorical?.values?.find(c => c.source.roles?.[role]);
    const headline = col("headline"), trend = col("measure"), category = view?.categorical?.categories?.[0];
    const points = (category?.values ?? []).map((raw, index) => {
        const time = raw instanceof Date ? raw.getTime() : category?.source.type?.dateTime && typeof raw === "string" ? Date.parse(raw) : NaN;
        return { label: Number.isFinite(time) ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(time) : String(raw ?? "(Blank)"), time: Number.isFinite(time) ? time : null, index, value: finite(trend?.values[index]), comparison: finite(col("trendComparison")?.values[index]) };
    });
    if (points.length && points.every(d => d.time !== null))
        points.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
    return { title: headline?.source.displayName ?? trend?.source.displayName ?? "Performance", value: finite(headline?.values[0]), comparison: finite(col("comparison")?.values[0]), points };
}
