import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BarChartProps {
    data: any[];
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    height?: number;
    barColor?: string;
    bars?: {
        key: string;
        name: string;
        color: string;
        yAxisId?: "left" | "right";
    }[];
    secondaryYAxis?: {
        label?: string;
        orientation?: "left" | "right";
    };
    showBarLabels?: boolean;
    valueFormatter?: (value: number) => string;
}

export function BarChart({
    data,
    title,
    xAxisKey = "name",
    yAxisKey = "value",
    height = 300,
    barColor = "hsl(var(--chart-1))",
    bars,
    secondaryYAxis,
    showBarLabels = false,
    valueFormatter
}: BarChartProps) {

    // Construct chart config
    const chartConfig = (bars || [
        { key: yAxisKey, name: title, color: barColor }
    ]).reduce((acc, bar) => {
        acc[bar.key] = {
            label: bar.name,
            color: bar.color,
        }
        return acc
    }, {} as ChartConfig)

    const barList = bars || [{ key: yAxisKey, name: title, color: barColor }];

    // Check if we need secondary Y-axis
    const hasSecondaryAxis = barList.some(bar => bar.yAxisId === "right");

    // Calculate domain for right axis
    const getRightAxisDomain = () => {
        const rightAxisBars = barList.filter(b => b.yAxisId === "right");
        const rightAxisKey = rightAxisBars[0]?.key;
        if (rightAxisKey) {
            const allValues = data.flatMap(d => {
                const val = d[rightAxisKey];
                return typeof val === 'number' ? [val] : [];
            }).filter(v => typeof v === 'number' && !isNaN(v));
            if (allValues.length === 0) return undefined;
            const max = Math.max(...allValues);
            // Start from 0 for better visualization and add 20% padding at the top
            const padding = max * 0.2;
            return [0, max + padding];
        }
        return undefined;
    };

    return (
        <div className="w-full h-full" style={{ height }}>
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[150px]">
                <RechartsBarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        top: 20,
                        right: hasSecondaryAxis ? 35 : 10,
                        left: -20,
                        bottom: 0,
                    }}
                    barGap={8}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey={xAxisKey}
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                        interval={0}
                    />
                    <YAxis
                        yAxisId="left"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                    />
                    {hasSecondaryAxis && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: barList.find(b => b.yAxisId === "right")?.color || "#10b981", fontWeight: 600 }}
                            stroke={barList.find(b => b.yAxisId === "right")?.color || "#10b981"}
                            strokeOpacity={0.8}
                            width={50}
                            domain={getRightAxisDomain()}
                            label={secondaryYAxis?.label ? {
                                value: secondaryYAxis.label,
                                angle: -90,
                                position: 'insideRight',
                                style: {
                                    fontSize: 11,
                                    fill: barList.find(b => b.yAxisId === "right")?.color || "#10b981",
                                    fontWeight: 600
                                }
                            } : undefined}
                            allowDecimals={false}
                        />
                    )}
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    {bars && <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2 text-[10px]" />}
                    {barList.map((barInfo) => (
                        <Bar
                            key={barInfo.key}
                            dataKey={barInfo.key}
                            fill={barInfo.color}
                            yAxisId={barInfo.yAxisId || "left"}
                            radius={[4, 4, 0, 0]}
                        >
                            {showBarLabels && (
                                <LabelList
                                    dataKey={barInfo.key}
                                    position="top"
                                    offset={10}
                                    style={{ fontSize: '10px', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }}
                                    formatter={valueFormatter}
                                />
                            )}
                        </Bar>
                    ))}
                </RechartsBarChart>
            </ChartContainer>
        </div>
    );
}
