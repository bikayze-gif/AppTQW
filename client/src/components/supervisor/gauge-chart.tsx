import { motion } from "framer-motion";

interface GaugeChartProps {
    value: number;
    label?: string;
    size?: number;
    color?: string;
    min?: number;
    max?: number;
    showPercentage?: boolean;
    strokeWidth?: number;
}

export function GaugeChart({
    value,
    label = "% de ordenes finalizadas",
    size = 200,
    color = "#3b82f6",
    min = 0,
    max = 100,
    strokeWidth: customStrokeWidth,
}: GaugeChartProps) {
    // Constrain value between min and max
    const clampedValue = Math.min(Math.max(value, min), max);
    const percentage = (clampedValue - min) / (max - min);

    // SVG properties
    const strokeWidth = customStrokeWidth || size * 0.15;
    const radius = (size - strokeWidth) / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    // Calculate arc path (half circle)
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percentage);

    // Background arc path (full semi-circle)
    // M: Move to start (left)
    // A: Arc to end (right)
    const startX = centerX - radius;
    const endX = centerX + radius;

    // We want a semi-circle from left to right
    const d = `M ${startX} ${centerY} A ${radius} ${radius} 0 0 1 ${endX} ${centerY}`;

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            {label && (
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 text-center flex items-center justify-center w-full px-1 leading-tight">
                    {label}
                </p>
            )}
            <div className="relative" style={{ width: size, height: size / 2 + (size * 0.15) / 2 + 15 }}>
                <svg
                    width={size}
                    height={size / 2 + (size * 0.15) / 2 + 5}
                    className="overflow-visible"
                >
                    {/* Background Track */}
                    <path
                        d={d}
                        fill="none"
                        stroke="#e2e8f0" // slate-200
                        strokeWidth={strokeWidth}
                        className="dark:stroke-slate-700"
                        strokeLinecap="butt"
                    />

                    {/* Active Value Arc */}
                    <motion.path
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference} // Start empty
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="butt"
                    />
                </svg>

                {/* Value Text */}
                <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-end h-full pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value.toFixed(1)}%
                    </span>
                </div>

                {/* Min/Max Labels */}
                <div className="absolute bottom-0 w-full flex justify-between px-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium transform translate-y-full">
                    <span>{min.toFixed(1)} %</span>
                    <span>{max.toFixed(1)} %</span>
                </div>
            </div>
        </div>
    );
}
