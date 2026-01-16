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
    }[];
}

export function BarChart({
    data,
    title,
    xAxisKey = "name",
    yAxisKey = "value",
    height = 300,
    barColor = "hsl(var(--chart-1))",
    bars
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

    return (
        <div className="w-full h-full" style={{ height }}>
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[150px]">
                <RechartsBarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        top: 20,
                        right: 10,
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
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                    />
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
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey={barInfo.key}
                                position="top"
                                offset={12}
                                className="fill-foreground font-bold"
                                fontSize={10}
                                fill="hsl(var(--foreground))"
                            />
                        </Bar>
                    ))}
                </RechartsBarChart>
            </ChartContainer>
        </div>
    );
}
