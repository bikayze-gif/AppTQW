import { Clock, MapPin, Users, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    duration?: string;
    location?: string;
    attendees?: string[];
    category: string;
    status?: "completed" | "upcoming" | "cancelled";
    description?: string;
}

interface TimelineProps {
    events: TimelineEvent[];
    onEventClick?: (event: TimelineEvent) => void;
    className?: string;
}

const categoryConfig: Record<string, { color: string; lightColor: string; textColor: string; borderColor: string }> = {
    meeting: {
        color: "bg-blue-500",
        lightColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-200 dark:border-blue-800",
    },
    deadline: {
        color: "bg-red-500",
        lightColor: "bg-red-50 dark:bg-red-900/20",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-200 dark:border-red-800",
    },
    reminder: {
        color: "bg-yellow-500",
        lightColor: "bg-yellow-50 dark:bg-yellow-900/20",
        textColor: "text-yellow-600 dark:text-yellow-400",
        borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    personal: {
        color: "bg-purple-500",
        lightColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-200 dark:border-purple-800",
    },
};

const defaultCategoryConfig = {
    color: "bg-slate-500",
    lightColor: "bg-slate-50 dark:bg-slate-900/20",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-800",
};

const statusIcon = {
    completed: CheckCircle2,
    upcoming: Circle,
    cancelled: AlertCircle,
};

export function Timeline({ events, onEventClick, className }: TimelineProps) {
    // Sort events by date and time
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hoy";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Mañana";
        } else {
            return date.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
            });
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Línea de Tiempo
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    {events.length} eventos
                </span>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* Events */}
                <div className="space-y-4">
                    {sortedEvents.map((event, index) => {
                        const config = categoryConfig[event.category] || defaultCategoryConfig;
                        const StatusIcon = statusIcon[event.status || "upcoming"];
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={event.id}
                                className="relative flex items-start gap-4 group cursor-pointer"
                                onClick={() => onEventClick?.(event)}
                            >
                                {/* Timeline Dot */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2",
                                        event.status === "completed"
                                            ? "bg-green-100 dark:bg-green-900/30 border-green-500"
                                            : event.status === "cancelled"
                                                ? "bg-red-100 dark:bg-red-900/30 border-red-500"
                                                : `${config.lightColor} ${config.borderColor}`
                                    )}>
                                        <StatusIcon
                                            size={16}
                                            className={cn(
                                                event.status === "completed"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : event.status === "cancelled"
                                                        ? "text-red-600 dark:text-red-400"
                                                        : config.textColor
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Event Card */}
                                <div
                                    className={cn(
                                        "flex-1 p-4 rounded-xl border transition-all",
                                        "hover:shadow-md hover:scale-[1.02]",
                                        config.lightColor,
                                        config.borderColor,
                                        "bg-white dark:bg-slate-800"
                                    )}
                                >
                                    {/* Date Badge */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn(
                                            "text-xs font-semibold px-2 py-1 rounded-full",
                                            config.color,
                                            "text-white"
                                        )}>
                                            {formatDate(event.date)}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {event.time}
                                            {event.duration && ` · ${event.duration}`}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {event.title}
                                    </h4>

                                    {/* Description */}
                                    {event.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                            {event.description}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        {event.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {event.location}
                                            </div>
                                        )}
                                        {event.attendees && event.attendees.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Users size={12} />
                                                {event.attendees.length} {event.attendees.length === 1 ? "asistente" : "asistentes"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    {event.status && (
                                        <div className={cn(
                                            "absolute top-4 right-4",
                                            event.status === "completed"
                                                ? "text-green-600 dark:text-green-400"
                                                : event.status === "cancelled"
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-slate-400 dark:text-slate-500"
                                        )}>
                                            <StatusIcon size={16} />
                                        </div>
                                    )}
                                </div>

                                {/* Connector Line (for alternating layout) */}
                                {!isEven && (
                                    <div className="hidden lg:block w-8 flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {sortedEvents.length === 0 && (
                    <div className="text-center py-12">
                        <Clock
                            size={48}
                            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                        />
                        <p className="text-slate-500 dark:text-slate-400">
                            No hay eventos en la línea de tiempo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
