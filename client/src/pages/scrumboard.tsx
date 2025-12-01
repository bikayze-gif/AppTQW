import { useState } from "react";
import { Plus, MoreHorizontal, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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

export default function ScrumBoard() {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: {
      id: "todo",
      title: "Por Hacer",
      color: "bg-blue-50",
      tasks: mockTasks.todo,
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
    },
    inProgress: {
      id: "inProgress",
      title: "En Progreso",
      color: "bg-amber-50",
      tasks: mockTasks.inProgress,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
    },
    done: {
      id: "done",
      title: "Completado",
      color: "bg-green-50",
      tasks: mockTasks.done,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    },
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Scrum Board</h1>
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
        </div>
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(columns).map((column) => (
            <div
              key={column.id}
              className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              {/* Column Header */}
              <div className={`${column.color} border-b border-slate-200 px-4 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {column.icon}
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">{column.title}</h2>
                      <p className="text-xs text-slate-600 mt-1">{column.tasks.length} tareas</p>
                    </div>
                  </div>
                  <span className="bg-white text-slate-700 px-2 py-1 rounded-full text-xs font-semibold border border-slate-300">
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
                      className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                      data-testid={`card-task-${task.id}`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex-1 pr-2">
                          {task.title}
                        </h3>
                        <button className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{task.description}</p>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition-colors"
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
                          <span className="text-xs text-slate-500">{task.dueDate}</span>
                        )}
                      </div>

                      {/* Assignees */}
                      {task.assignees.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-600">
                            {task.assignees.join(", ")}
                          </span>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>

              {/* Add Task Button */}
              <div className="border-t border-slate-200 p-4">
                <Button
                  variant="outline"
                  className="w-full text-slate-700 border-slate-300 hover:bg-slate-50"
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
    </div>
  );
}
