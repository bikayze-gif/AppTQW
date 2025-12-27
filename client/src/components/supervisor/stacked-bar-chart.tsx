import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface DataItem {
    name: string;
    [key: string]: string | number;
}

interface LegendItem {
    label: string;
    color: string;
}

interface StackedBarChartProps {
    data: DataItem[];
    title: string;
    xAxisKey?: string;
    bars: {
        key: string;
        color: string;
        name: string;
        getColor?: (value: any, entry: any) => string;
    }[];
    height?: number;
    legendFontSize?: number;
    xAxisTickFormatter?: (value: any) => string;
    valueFormatter?: (value: any) => string;
    yAxisWidth?: number;
    yAxisFontSize?: number;
    domain?: [number | string, number | string];
    ticks?: number[];
    customLegend?: LegendItem[];
    showBarLabels?: boolean;
}

export function StackedBarChart({
    data,
    title,
    xAxisKey = "name",
    bars,
    height = 300,
    legendFontSize = 12,
    xAxisTickFormatter,
    valueFormatter = (val: any) => val,
    yAxisWidth = 100,
    yAxisFontSize = 10,
    domain,
    ticks,
    customLegend,
    showBarLabels = false
}: StackedBarChartProps) {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evita errores de hidratación al esperar a que el componente se monte
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-900/50 py-2 px-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider truncate" title={title}>
                        {title}
                    </h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-4" style={{ height: height }}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sin datos para mostrar</p>
                </div>
            </div>
        )
    }

    const gridColor = isDark ? "#374151" : "#e2e8f0";
    const axisColor = isDark ? "#9ca3af" : "#64748b";
    const tooltipBg = isDark ? "#1f2937" : "#ffffff";
    const tooltipBorder = isDark ? "#374151" : "#e2e8f0";
    const tooltipColor = isDark ? "#f3f4f6" : "#1e293b";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2 px-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider truncate" title={title}>
                    {title}
                </h3>
            </div>
            <div className="flex-1 p-2 w-full" style={{ height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        layout="vertical"
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 10,
                            bottom: customLegend ? 20 : 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={gridColor} />
                        <XAxis
                            type="number"
                            stroke={axisColor}
                            fontSize={12}
                            tickLine={true}
                            axisLine={false}
                            tickFormatter={xAxisTickFormatter}
                            domain={domain}
                            ticks={ticks}
                        />
                        <YAxis
                            dataKey={xAxisKey}
                            type="category"
                            stroke={axisColor}
                            fontSize={yAxisFontSize + 2}
                            tickLine={false}
                            axisLine={false}
                            width={yAxisWidth}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                borderColor: tooltipBorder,
                                color: tooltipColor,
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: tooltipColor }}
                            cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                            formatter={valueFormatter}
                        />
                        {customLegend ? (
                            <Legend
                                content={() => (
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                                        {customLegend.map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: `${legendFontSize}px`,
                                                        color: isDark ? '#f3f4f6' : '#1e293b'
                                                    }}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            />
                        ) : (
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '10px',
                                    fontSize: `${legendFontSize}px`,
                                    color: isDark ? '#f3f4f6' : '#1e293b'
                                }}
                            />
                        )}
                        {bars.map((bar) => (
                            <Bar
                                key={bar.key}
                                dataKey={bar.key}
                                stackId="a"
                                fill={bar.color}
                                name={bar.name}
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            >
                                {showBarLabels && (
                                    <LabelList
                                        dataKey={bar.key}
                                        position="right"
                                        style={{
                                            fill: isDark ? '#f3f4f6' : '#1e293b',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}
                                        formatter={(val: any) => {
                                            if (val === undefined || val === null || val === 0) return '';
                                            return valueFormatter(val);
                                        }}
                                    />
                                )}
                                {bar.getColor && data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={bar.getColor!(entry[bar.key], entry)}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
