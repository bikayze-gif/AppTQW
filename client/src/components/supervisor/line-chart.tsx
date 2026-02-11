import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LineChartProps {
    data: any[];
    title: string;
    xAxisKey?: string;
    height?: number;
    lines?: {
        key: string;
        name: string;
        color: string;
    }[];
}

export function LineChart({
    data,
    title,
    xAxisKey = "name",
    height = 300,
    lines = []
}: LineChartProps) {

    // Construct chart config
    const chartConfig = lines.reduce((acc, line) => {
        acc[line.key] = {
            label: line.name,
            color: line.color,
        }
        return acc
    }, {} as ChartConfig)

    return (
        <div className="w-full h-full" style={{ height }}>
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[150px]">
                <RechartsLineChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        top: 20,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                    {lines.length > 1 && <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2 text-[10px]" />}
                    {lines.map((lineInfo) => (
                        <Line
                            key={lineInfo.key}
                            type="monotone"
                            dataKey={lineInfo.key}
                            stroke={lineInfo.color}
                            strokeWidth={2}
                            dot={{ fill: lineInfo.color, r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </RechartsLineChart>
            </ChartContainer>
        </div>
    );
}
