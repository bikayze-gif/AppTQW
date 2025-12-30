import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

interface ChartSkeletonProps {
    className?: string
    height?: number | string
    type?: "line" | "bar" | "pie"
}

export function ChartSkeleton({ className, height = 240, type = "line" }: ChartSkeletonProps) {
    return (
        <div className={cn("w-full space-y-4 animate-in fade-in duration-500", className)}>
            {/* Simulación del cuerpo del gráfico */}
            <div
                className="relative w-full border-b border-l border-slate-200/50 dark:border-slate-700/50"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                {type === "line" || type === "bar" ? (
                    <div className="absolute inset-0 flex items-end justify-around pb-2 px-4 gap-2">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className={cn(
                                    "w-full rounded-t-sm opacity-50",
                                    type === "line" ? "h-[2px] mb-[40%]" : ""
                                )}
                                style={{
                                    height: type === "bar" ? `${20 + Math.random() * 70}%` : "2px",
                                    marginBottom: type === "line" ? `${20 + Math.random() * 60}%` : "0"
                                }}
                            />
                        ))}

                        {/* Líneas de cuadrícula falsas */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="border-t border-slate-300 dark:border-slate-600 w-full h-0" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton className="h-32 w-32 rounded-full opacity-40" />
                    </div>
                )}
            </div>

            {/* Simulación de Leyenda */}
            <div className="flex justify-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-16" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-16" />
                </div>
            </div>
        </div>
    )
}
