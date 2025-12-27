import { cn } from "@/lib/utils";

interface KpiCardProps {
    value: string | number;
    label: string;
    variant?: 'default' | 'success' | 'danger' | 'warning';
    className?: string;
}

export function KpiCard({
    value,
    label,
    variant = 'default',
    className
}: KpiCardProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return "bg-emerald-500 text-white border-emerald-600";
            case 'danger':
                return "bg-rose-500 text-white border-rose-600";
            case 'warning':
                return "bg-amber-500 text-white border-amber-600";
            case 'default':
            default:
                return "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700";
        }
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 rounded-none border shadow-sm h-full min-h-[100px]",
            getVariantStyles(),
            className
        )}>
            <span className="text-4xl font-bold mb-1 tracking-tight">
                {value}
            </span>
            <span className="text-xs font-medium text-center opacity-90 uppercase tracking-wide">
                {label}
            </span>
        </div>
    );
}
