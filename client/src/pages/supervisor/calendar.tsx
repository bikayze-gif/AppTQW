import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    location?: string;
    attendees?: string[];
    category: "meeting" | "deadline" | "reminder" | "personal";
    color: string;
}

const mockEvents: Event[] = [
    {
        id: "1",
        title: "Reunión Equipo Técnico",
        date: "2026-01-15",
        time: "10:00",
        duration: "1h",
        location: "Sala de Conferencias A",
        attendees: ["Juan Pérez", "María González"],
        category: "meeting",
        color: "bg-blue-500",
    },
    {
        id: "2",
        title: "Entrega Proyecto Q1",
        date: "2026-01-20",
        time: "18:00",
        duration: "",
        category: "deadline",
        color: "bg-red-500",
    },
    {
        id: "3",
        title: "Revisión KPIs",
        date: "2026-01-18",
        time: "14:00",
        duration: "2h",
        location: "Virtual - Zoom",
        category: "meeting",
        color: "bg-blue-500",
    },
];

export default function SupervisorCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        time: "",
        duration: "",
        location: "",
        category: "meeting" as Event["category"],
    });

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const categoryColors = {
        meeting: "bg-blue-500",
        deadline: "bg-red-500",
        reminder: "bg-yellow-500",
        personal: "bg-purple-500",
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter(e => e.date === dateStr);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date || !newEvent.time) return;

        const event: Event = {
            id: Date.now().toString(),
            title: newEvent.title,
            date: newEvent.date,
            time: newEvent.time,
            duration: newEvent.duration,
            location: newEvent.location,
            category: newEvent.category,
            color: categoryColors[newEvent.category],
        };

        setEvents([...events, event]);
        setNewEvent({
            title: "",
            date: "",
            time: "",
            duration: "",
            location: "",
            category: "meeting",
        });
        setIsEventDialogOpen(false);
    };

    const upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    return (
        <SupervisorLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendario</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Organiza tu agenda y eventos importantes
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsEventDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        <Plus className="mr-2" size={18} />
                        Nuevo Evento
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                                    </button>
                                    <button
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Day Headers */}
                                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2"
                                    >
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar Days */}
                                {days.map((day, index) => {
                                    const dayEvents = day ? getEventsForDate(day) : [];
                                    const isToday =
                                        day === new Date().getDate() &&
                                        currentDate.getMonth() === new Date().getMonth() &&
                                        currentDate.getFullYear() === new Date().getFullYear();

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-24 p-2 rounded-lg border transition-all ${!day
                                                    ? "bg-transparent border-transparent"
                                                    : isToday
                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                                                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600"
                                                } cursor-pointer`}
                                            onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                        >
                                            {day && (
                                                <>
                                                    <div
                                                        className={`text-sm font-medium mb-1 ${isToday
                                                                ? "text-blue-600 dark:text-blue-400"
                                                                : "text-slate-700 dark:text-slate-300"
                                                            }`}
                                                    >
                                                        {day}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayEvents.slice(0, 2).map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className={`${event.color} text-white text-xs px-2 py-1 rounded truncate`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedEvent(event);
                                                                }}
                                                            >
                                                                {event.time} {event.title}
                                                            </div>
                                                        ))}
                                                        {dayEvents.length > 2 && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                                                                +{dayEvents.length - 2} más
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Próximos Eventos
                            </h3>
                            <div className="space-y-3">
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        No hay eventos próximos
                                    </p>
                                ) : (
                                    upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-1 h-full ${event.color} rounded-full`} />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                        {event.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <Clock size={12} />
                                                        {new Date(event.date).toLocaleDateString("es-ES", {
                                                            day: "numeric",
                                                            month: "short",
                                                        })}{" "}
                                                        - {event.time}
                                                    </div>
                                                    {event.location && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <MapPin size={12} />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Categorías
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Reuniones</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Fechas límite</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Recordatorios</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Personal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Event Dialog */}
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                    <DialogContent className="bg-white dark:bg-[#1e293b]">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white">Nuevo Evento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    placeholder="Título del evento"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Hora *
                                    </label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Duración
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.duration}
                                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    placeholder="ej: 1h, 30min"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    placeholder="Sala, Virtual, etc."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Categoría
                                </label>
                                <select
                                    value={newEvent.category}
                                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as Event["category"] })}
                                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                >
                                    <option value="meeting">Reunión</option>
                                    <option value="deadline">Fecha límite</option>
                                    <option value="reminder">Recordatorio</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsEventDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAddEvent}
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                Crear Evento
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Event Details Dialog */}
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent className="bg-white dark:bg-[#1e293b]">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white">
                                {selectedEvent?.title}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedEvent && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Clock size={18} />
                                    <span>
                                        {new Date(selectedEvent.date).toLocaleDateString("es-ES", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Clock size={18} />
                                    <span>
                                        {selectedEvent.time}
                                        {selectedEvent.duration && ` (${selectedEvent.duration})`}
                                    </span>
                                </div>
                                {selectedEvent.location && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <MapPin size={18} />
                                        <span>{selectedEvent.location}</span>
                                    </div>
                                )}
                                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                        <Users size={18} className="mt-1" />
                                        <div>
                                            {selectedEvent.attendees.map((attendee, i) => (
                                                <div key={i}>{attendee}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SupervisorLayout>
    );
}
