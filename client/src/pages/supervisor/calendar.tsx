import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Edit2, FileDown, Tag, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { TimelineTaskDialog } from "@/components/supervisor/timeline-task-dialog";
import { useTimelineTasks } from "@/hooks/use-timeline-tasks";

export default function SupervisorCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const { tasks, isLoading, deleteTask, isDeleting, getFileUrl } = useTimelineTasks();

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

    // Generate a color based on category string
    const getCategoryColor = (category: string) => {
        const colors = [
            "bg-blue-500", "bg-red-500", "bg-yellow-500", "bg-purple-500",
            "bg-green-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
            "bg-orange-500", "bg-cyan-500",
        ];
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getCategoryDotColor = (category: string) => {
        return getCategoryColor(category).replace("bg-", "bg-");
    };

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getTasksForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return tasks.filter(t => {
            const taskDateStr = typeof t.taskDate === "string"
                ? t.taskDate.split("T")[0]
                : new Date(t.taskDate).toISOString().split("T")[0];
            return taskDateStr === dateStr;
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDeleteTask = async (id: number) => {
        try {
            await deleteTask(id);
            setDeleteConfirmId(null);
            setSelectedTaskId(null);
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

    // Timeline: all tasks sorted by date, most recent first
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.taskDate).getTime();
        const dateB = new Date(b.taskDate).getTime();
        return dateB - dateA;
    });

    // Unique categories for legend
    const uniqueCategories = Array.from(new Set(tasks.map(t => t.category)));

    return (
        <SupervisorLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendario & Timeline</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona tus tareas y visualízalas en la línea de tiempo
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        <Plus className="mr-2" size={18} />
                        Nueva Tarea
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
                                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2"
                                    >
                                        {day}
                                    </div>
                                ))}

                                {days.map((day, index) => {
                                    const dayTasks = day ? getTasksForDate(day) : [];
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
                                                        {dayTasks.slice(0, 2).map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className={`${getCategoryColor(task.category)} text-white text-xs px-2 py-1 rounded truncate`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTaskId(task.id);
                                                                }}
                                                            >
                                                                {task.title}
                                                            </div>
                                                        ))}
                                                        {dayTasks.length > 2 && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                                                                +{dayTasks.length - 2} más
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

                        {/* Timeline Section */}
                        <div className="mt-6 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                Línea de Tiempo
                            </h3>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-slate-500">Cargando tareas...</span>
                                </div>
                            ) : sortedTasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No hay tareas registradas</p>
                                    <p className="text-sm mt-1">Crea tu primera tarea con el botón "Nueva Tarea"</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                                    <div className="space-y-6">
                                        {sortedTasks.map((task) => {
                                            const taskDateStr = typeof task.taskDate === "string"
                                                ? task.taskDate.split("T")[0]
                                                : new Date(task.taskDate).toISOString().split("T")[0];
                                            const color = getCategoryColor(task.category);

                                            return (
                                                <div key={task.id} className="relative pl-10">
                                                    {/* Timeline dot */}
                                                    <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full ${color} ring-2 ring-white dark:ring-[#1e293b]`} />

                                                    <div
                                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer"
                                                        onClick={() => setSelectedTaskId(task.id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                                                    {task.title}
                                                                </h4>
                                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <CalendarIcon size={12} />
                                                                        {new Date(taskDateStr + "T12:00:00").toLocaleDateString("es-ES", {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color} text-white`}>
                                                                        <Tag size={10} />
                                                                        {task.category}
                                                                    </span>
                                                                    <span className={cn(
                                                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                                                        task.status === "completed"
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : task.status === "cancelled"
                                                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                                    )}>
                                                                        {task.status === "completed" ? "Completado" : task.status === "cancelled" ? "Cancelado" : "Pendiente"}
                                                                    </span>
                                                                </div>
                                                                {task.description && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {task.fileName && (
                                                                <div className="ml-3 flex-shrink-0">
                                                                    <a
                                                                        href={getFileUrl(task) || "#"}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-500 hover:text-blue-400"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        title={task.fileName}
                                                                    >
                                                                        <FileDown size={18} />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Tasks */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Próximas Tareas
                            </h3>
                            <div className="space-y-3">
                                {tasks
                                    .filter(t => {
                                        const d = typeof t.taskDate === "string" ? t.taskDate.split("T")[0] : t.taskDate;
                                        return new Date(d + "T23:59:59") >= new Date() && t.status !== "cancelled";
                                    })
                                    .sort((a, b) => new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime())
                                    .slice(0, 5)
                                    .map((task) => {
                                        const taskDateStr = typeof task.taskDate === "string"
                                            ? task.taskDate.split("T")[0]
                                            : new Date(task.taskDate).toISOString().split("T")[0];
                                        return (
                                            <div
                                                key={task.id}
                                                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedTaskId(task.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-1 self-stretch ${getCategoryColor(task.category)} rounded-full`} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                            {task.title}
                                                        </h4>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <Clock size={12} />
                                                            {new Date(taskDateStr + "T12:00:00").toLocaleDateString("es-ES", {
                                                                day: "numeric",
                                                                month: "short",
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                {tasks.filter(t => {
                                    const d = typeof t.taskDate === "string" ? t.taskDate.split("T")[0] : t.taskDate;
                                    return new Date(d + "T23:59:59") >= new Date() && t.status !== "cancelled";
                                }).length === 0 && (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        No hay tareas próximas
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Categories Legend */}
                        {uniqueCategories.length > 0 && (
                            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Categorías
                                </h3>
                                <div className="space-y-2">
                                    {uniqueCategories.map((cat) => (
                                        <div key={cat} className="flex items-center gap-2">
                                            <div className={`w-3 h-3 ${getCategoryColor(cat)} rounded-full`} />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{cat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Task Dialog */}
                <TimelineTaskDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                />

                {/* Task Detail Dialog */}
                <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTaskId(null)}>
                    <DialogContent className="bg-white dark:bg-[#1e293b]">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white">
                                {selectedTask?.title}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedTask && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <CalendarIcon size={18} />
                                    <span>
                                        {new Date(
                                            (typeof selectedTask.taskDate === "string"
                                                ? selectedTask.taskDate.split("T")[0]
                                                : selectedTask.taskDate) + "T12:00:00"
                                        ).toLocaleDateString("es-ES", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Tag size={18} className="text-slate-600 dark:text-slate-300" />
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedTask.category)} text-white`}>
                                        {selectedTask.category}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Estado:</span>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                        selectedTask.status === "completed"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : selectedTask.status === "cancelled"
                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    )}>
                                        {selectedTask.status === "completed" ? "Completado" : selectedTask.status === "cancelled" ? "Cancelado" : "Pendiente"}
                                    </span>
                                </div>

                                {selectedTask.description && (
                                    <div className="text-slate-600 dark:text-slate-300">
                                        <p className="text-sm font-medium mb-1">Comentarios:</p>
                                        <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            {selectedTask.description}
                                        </p>
                                    </div>
                                )}

                                {selectedTask.fileName && (
                                    <div className="flex items-center gap-2">
                                        <FileDown size={18} className="text-blue-500" />
                                        <a
                                            href={getFileUrl(selectedTask) || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:text-blue-400 underline"
                                        >
                                            {selectedTask.fileName}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => selectedTask && setDeleteConfirmId(selectedTask.id)}
                            >
                                <Trash2 size={14} className="mr-1" />
                                Eliminar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTaskId(null)}
                            >
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                    <DialogContent className="bg-white dark:bg-[#1e293b] max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white">
                                Confirmar eliminación
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-slate-600 dark:text-slate-300 text-sm py-2">
                            ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
                        </p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteConfirmId && handleDeleteTask(deleteConfirmId)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SupervisorLayout>
    );
}
