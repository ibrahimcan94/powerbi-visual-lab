
import React from "react";
import { TrendChart, TrendPoint } from "./TrendChart";

interface KpiCardProps {
    title: string;
    value: number;
    unit?: string;
    trendData: TrendPoint[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    unit = "",
    trendData
}) => {
    return (
        <div className="kpi-card">
            <div className="kpi-title">{title}</div>

            <div className="kpi-value">
                {value.toLocaleString()} {unit}
            </div>

            <TrendChart data={trendData} />
        </div>
    );
};
