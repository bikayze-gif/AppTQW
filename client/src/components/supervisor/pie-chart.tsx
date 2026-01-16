"use client"

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DataItem {
    name: string;
    value: number;
    color?: string;
}

interface PieChartProps {
    data: DataItem[];
    title: string;
    height?: number;
}

export function PieChart({ data, title, height = 300 }: PieChartProps) {
    // Default colors if not provided in data
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#82ca9d'];

    const chartConfig = data.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: item.color || COLORS[index % COLORS.length],
        }
        return acc
    }, {} as ChartConfig)

    return (
        <div className="w-full h-full" style={{ height }}>
            <ChartContainer config={chartConfig} className="mx-auto h-full w-full aspect-auto">
                <RechartsPieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="55%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="70%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            if (percent < 0.05) return null;

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-[11px] font-bold pointer-events-none"
                                >
                                    {value}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={1} />
                        ))}
                    </Pie>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend
                        layout="vertical"
                        align="left"
                        verticalAlign="middle"
                        content={<ChartLegendContent nameKey="name" className="items-start flex-col gap-1 py-0 text-[10px] ml-4" />}
                    />
                </RechartsPieChart>
            </ChartContainer>
        </div>
    );
}
