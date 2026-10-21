
import React, { useId, useMemo, useState } from "react";
import * as d3 from "d3";

export interface TrendPoint {
    label: string;
    value: number;
}

interface TrendChartProps {
    data: TrendPoint[];
}

interface HoverState {
    index: number;
    x: number;
    y: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const [hover, setHover] = useState<HoverState | null>(null);
    const gradientId = useId().replace(/:/g, "");

    const width = 600;
    const height = 160;
    const margin = { top: 18, right: 12, bottom: 12, left: 12 };

    const chart = useMemo(() => {
        const points = data.filter(d => Number.isFinite(d.value));

        const x = d3.scaleLinear()
            .domain([0, Math.max(points.length - 1, 1)])
            .range([margin.left, width - margin.right]);

        const extent = d3.extent(points, d => d.value);
        const min = extent[0] ?? 0;
        const max = extent[1] ?? 1;
        const padding = Math.max((max - min) * 0.15, 1);

        const y = d3.scaleLinear()
            .domain([min - padding, max + padding])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line<TrendPoint>()
            .x((_, i) => x(i))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        const area = d3.area<TrendPoint>()
            .x((_, i) => x(i))
            .y0(height - margin.bottom)
            .y1(d => y(d.value))
            .curve(d3.curveMonotoneX);

        return {
            points,
            x,
            y,
            linePath: line(points) ?? "",
            areaPath: area(points) ?? ""
        };
    }, [data]);

    if (chart.points.length < 2) {
        return (
            <div className="trend-empty">
                Add at least two periods to display a trend.
            </div>
        );
    }

    const active = hover ? chart.points[hover.index] : null;

    const handlePointerMove = (
        event: React.PointerEvent<SVGSVGElement>
    ) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const svgX = (event.clientX - rect.left) / rect.width * width;

        const index = Math.max(
            0,
            Math.min(
                chart.points.length - 1,
                Math.round(chart.x.invert(svgX))
            )
        );

        setHover({
            index,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
    };

    const previous = hover && hover.index > 0
        ? chart.points[hover.index - 1].value
        : null;

    const change = active && previous !== null && previous !== 0
        ? ((active.value - previous) / Math.abs(previous)) * 100
        : null;

    return (
        <div className="trend-container">
            <div className="trend-chart-area">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    className="trend-svg"
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => setHover(null)}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0" y1="0" x2="0" y2="1"
                        >
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <path d={chart.areaPath} fill={`url(#${gradientId})`} />

                    <path
                        d={chart.linePath}
                        fill="none"
                        stroke="#34d399"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />

                    {hover && active && (
                        <>
                            <line
                                x1={chart.x(hover.index)}
                                x2={chart.x(hover.index)}
                                y1={margin.top}
                                y2={height - margin.bottom}
                                stroke="#9ca3af"
                                strokeDasharray="4 4"
                                opacity={0.5}
                            />
                            <circle
                                cx={chart.x(hover.index)}
                                cy={chart.y(active.value)}
                                r={5}
                                fill="#34d399"
                                stroke="#111827"
                                strokeWidth={2}
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    )}
                </svg>

                {active && hover && (
                    <div
                        className="trend-tooltip"
                        style={{
                            left: `${hover.x}px`,
                            top: `${hover.y}px`
                        }}
                    >
                        <div className="tooltip-label">
                            {active.label}
                        </div>
                        <div className="tooltip-value">
                            {active.value.toLocaleString()}
                        </div>
                        {change !== null && (
                            <div className={
                                change >= 0
                                    ? "tooltip-change positive"
                                    : "tooltip-change negative"
                            }>
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(1)}% vs previous
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="trend-labels">
                <span>{chart.points[0].label}</span>
                <span>{chart.points[chart.points.length - 1].label}</span>
            </div>
        </div>
    );
};
