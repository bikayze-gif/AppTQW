import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Trend {
    value: number | string;
    label: string;
    isPositive?: boolean;
}

interface KpiCardProps {
    title?: string;
    label?: string; // Retrocompatibilidad
    value: string | number;
    icon?: ReactNode;
    trend?: Trend;
    variant?: 'default' | 'blue' | 'purple' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'orange' | 'teal' | 'success' | 'danger' | 'warning';
    className?: string;
    description?: string;
}

export function KpiCard({
    title,
    label,
    value,
    icon,
    trend,
    variant = 'default',
    className,
    description
}: KpiCardProps) {
    // Mapeo de variantes antiguas a nuevas
    const effectiveVariant = (() => {
        if (variant === 'success') return 'emerald';
        if (variant === 'danger') return 'rose';
        if (variant === 'warning') return 'amber';
        return variant;
    })();

    const displayTitle = title || label; // Usar label si title no existe

    const getVariantStyles = () => {
        switch (effectiveVariant) {
            case 'blue':
                return {
                    bg: "bg-blue-50 dark:bg-blue-900/10",
                    border: "border-blue-100 dark:border-blue-900/30",
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    iconColor: "text-blue-600 dark:text-blue-400",
                    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700"
                };
            case 'purple':
                return {
                    bg: "bg-purple-50 dark:bg-purple-900/10",
                    border: "border-purple-100 dark:border-purple-900/30",
                    iconBg: "bg-purple-100 dark:bg-purple-900/30",
                    iconColor: "text-purple-600 dark:text-purple-400",
                    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700"
                };
            case 'indigo':
                return {
                    bg: "bg-indigo-50 dark:bg-indigo-900/10",
                    border: "border-indigo-100 dark:border-indigo-900/30",
                    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
                    iconColor: "text-indigo-600 dark:text-indigo-400",
                    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700"
                };
            case 'emerald':
                return {
                    bg: "bg-emerald-50 dark:bg-emerald-900/10",
                    border: "border-emerald-100 dark:border-emerald-900/30",
                    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
                    iconColor: "text-emerald-600 dark:text-emerald-400",
                    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700"
                };
            case 'amber':
                return {
                    bg: "bg-amber-50 dark:bg-amber-900/10",
                    border: "border-amber-100 dark:border-amber-900/30",
                    iconBg: "bg-amber-100 dark:bg-amber-900/30",
                    iconColor: "text-amber-600 dark:text-amber-400",
                    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700"
                };
            case 'rose':
                return {
                    bg: "bg-rose-50 dark:bg-rose-900/10",
                    border: "border-rose-100 dark:border-rose-900/30",
                    iconBg: "bg-rose-100 dark:bg-rose-900/30",
                    iconColor: "text-rose-600 dark:text-rose-400",
                    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700"
                };
            default:
                return {
                    bg: "bg-white dark:bg-slate-800",
                    border: "border-slate-200 dark:border-slate-700",
                    iconBg: "bg-slate-100 dark:bg-slate-700",
                    iconColor: "text-slate-600 dark:text-slate-400",
                    hoverBorder: "hover:border-slate-300 dark:hover:border-slate-600"
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className={cn(
            "rounded-2xl border p-6 shadow-sm transition-all duration-200",
            styles.bg,
            styles.border,
            styles.hoverBorder,
            className
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {displayTitle}
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {value}
                    </h3>
                </div>
                {icon && (
                    <div className={cn("p-2 rounded-xl", styles.iconBg)}>
                        <div className={cn("w-5 h-5", styles.iconColor)}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>

            {(trend || description) && (
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 mt-2">
                    {trend ? (
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                                trend.isPositive === true ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                    trend.isPositive === false ? "text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400" :
                                        "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300"
                            )}>
                                {trend.isPositive === true && <TrendingUp className="w-3 h-3 mr-1" />}
                                {trend.isPositive === false && <TrendingDown className="w-3 h-3 mr-1" />}
                                {trend.isPositive === undefined && <Minus className="w-3 h-3 mr-1" />}
                                {trend.value}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]" title={trend.label}>
                                {trend.label}
                            </span>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
