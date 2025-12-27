import { useState } from "react";
import { Plus, MoreHorizontal, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailModal } from "@/components/task-detail-modal";

interface Task {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  icon: React.ReactNode;
}

const mockTasks = {
  todo: [
    {
      id: "1",
      title: "Diseñar interfaz de usuario",
      description: "Crear wireframes y mockups",
      assignees: ["María", "Juan"],
      priority: "high" as const,
      dueDate: "2025-12-05",
      tags: ["Diseño", "UI"],
    },
    {
      id: "2",
      title: "Investigar librerías de gráficos",
      description: "Evaluar opciones para visualización",
      assignees: ["Carlos"],
      priority: "medium" as const,
      tags: ["Investigación"],
    },
  ],
  inProgress: [
    {
      id: "3",
      title: "Implementar autenticación",
      description: "Configurar sistema de login seguro",
      assignees: ["Alex", "Sarah"],
      priority: "high" as const,
      dueDate: "2025-12-03",
      tags: ["Backend", "Seguridad"],
    },
    {
      id: "4",
      title: "Crear base de datos",
      description: "Esquema y migraciones iniciales",
      assignees: ["David"],
      priority: "high" as const,
      dueDate: "2025-12-02",
      tags: ["Database"],
    },
  ],
  done: [
    {
      id: "5",
      title: "Configurar proyecto base",
      description: "Inicializar repositorio y dependencias",
      assignees: ["Elena"],
      priority: "low" as const,
      tags: ["Setup"],
    },
    {
      id: "6",
      title: "Documentar especificaciones",
      description: "Crear documento de requisitos",
      assignees: ["Miguel"],
      priority: "medium" as const,
      tags: ["Documentación"],
    },
  ],
};

export default function SupervisorScrumboard() {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: {
      id: "todo",
      title: "Por Hacer",
      color: "bg-blue-50 dark:bg-blue-900/20",
      tasks: mockTasks.todo,
      icon: <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    inProgress: {
      id: "inProgress",
      title: "En Progreso",
      color: "bg-amber-50 dark:bg-amber-900/20",
      tasks: mockTasks.inProgress,
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    done: {
      id: "done",
      title: "Completado",
      color: "bg-green-50 dark:bg-green-900/20",
      tasks: mockTasks.done,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
    },
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50";
      case "low":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Scrumboard</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Scrum Board</h1>
            <p className="text-slate-500">Sprint 42 - Diciembre 2025</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
            data-testid="button-create-task"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(columns).map((column) => (
            <div
              key={column.id}
              className="flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Column Header */}
              <div className={`${column.color} border-b border-slate-200 dark:border-slate-700 px-4 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {column.icon}
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-lg">{column.title}</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{column.tasks.length} tareas</p>
                    </div>
                  </div>
                  <span className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-600">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div
                className="flex-1 overflow-y-auto space-y-3 p-4 min-h-96"
                data-testid={`column-${column.id}`}
              >
                {column.tasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-slate-400">
                    <p className="text-center">No hay tareas</p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md cursor-pointer transition-all duration-200 group"
                      data-testid={`card-task-${task.id}`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 pr-2">
                          {task.title}
                        </h3>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                              data-testid={`tag-${tag}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Priority and Due Date */}
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs border ${getPriorityColor(task.priority)}`}>
                          {task.priority === "high"
                            ? "Alta"
                            : task.priority === "medium"
                              ? "Media"
                              : "Baja"}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{task.dueDate}</span>
                        )}
                      </div>

                      {/* Assignees */}
                      {task.assignees.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center gap-2">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {task.assignees.join(", ")}
                          </span>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>

              {/* Add Task Button */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <Button
                  variant="outline"
                  className="w-full text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  data-testid={`button-add-task-${column.id}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir tarea
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} open={!!selectedTask} />
    </SupervisorLayout>
  );
}
