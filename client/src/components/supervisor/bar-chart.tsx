"use client"

import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DataItem {
    name: string;
    value: number;
}

interface BarChartProps {
    data: DataItem[];
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    height?: number;
    barColor?: string;
}

export function BarChart({
    data,
    title,
    xAxisKey = "name",
    yAxisKey = "value",
    height = 300,
    barColor = "hsl(var(--chart-1))"
}: BarChartProps) {

    const chartConfig = {
        [yAxisKey]: {
            label: title,
            color: barColor,
        },
    } satisfies ChartConfig

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-none border border-slate-300 dark:border-slate-600 overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-transparent py-1 px-3 border-b border-slate-300 dark:border-b-0">
                <h3 className="text-xs font-medium text-slate-900 dark:text-white truncate" title={title}>
                    {title}
                </h3>
            </div>
            <div className="flex-1 p-2 w-full" style={{ height: height }}>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
                    <RechartsBarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                            right: 10,
                            left: -20,
                            bottom: 25,
                        }}
                        barCategoryGap="20%"
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
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey={yAxisKey} fill={barColor} radius={[4, 4, 0, 0]}>
                            <LabelList
                                dataKey={yAxisKey}
                                position="top"
                                offset={12}
                                className="fill-foreground font-bold"
                                fontSize={11}
                                fill="hsl(var(--foreground))"
                            />
                        </Bar>
                    </RechartsBarChart>
                </ChartContainer>
            </div>
        </div>
    );
}
