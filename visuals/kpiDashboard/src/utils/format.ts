export function formatNumber(v: number | null, locale: string, decimals: number, prefix = "", suffix = "", percent = false): string {
    return v === null || !Number.isFinite(v) ? "—" : prefix + new Intl.NumberFormat(locale, { style: percent ? "percent" : "decimal", minimumFractionDigits: Math.max(0, Math.min(10, decimals)), maximumFractionDigits: Math.max(0, Math.min(10, decimals)) }).format(v) + suffix;
}
