import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimelineTask {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  filePath: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  category: "meeting" | "deadline" | "reminder" | "personal";
  status: "completed" | "upcoming" | "cancelled";
  taskDate: string;
  taskTime: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  attendees?: string[];
  category: "meeting" | "deadline" | "reminder" | "personal";
  status?: "completed" | "upcoming" | "cancelled";
  description?: string;
}

// Convertir TimelineTask a TimelineEvent para el componente Timeline
function taskToEvent(task: TimelineTask): TimelineEvent {
  return {
    id: task.id.toString(),
    title: task.title,
    date: task.taskDate,
    time: task.taskTime,
    category: task.category,
    status: task.status,
    description: task.description || undefined,
  };
}

export function useTimelineTasks(options?: { date?: string; category?: string; status?: string }) {
  const queryClient = useQueryClient();

  // Obtener tareas del timeline
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timelineTasks", options],
    queryFn: async (): Promise<TimelineTask[]> => {
      const params = new URLSearchParams();
      if (options?.date) params.append("date", options.date);
      if (options?.category) params.append("category", options.category);
      if (options?.status) params.append("status", options.status);

      const response = await fetch(`/api/timeline/tasks?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener tareas");
      }

      return response.json();
    },
  });

  // Convertir tareas a eventos del Timeline
  const events: TimelineEvent[] = tasks.map(taskToEvent);

  // Obtener URL del archivo adjunto
  const getFileUrl = (task: TimelineTask) => {
    if (!task.filePath) return null;
    // La ruta del archivo es relativa a la carpeta uploads
    return `/uploads/timeline/${task.userId}/${task.filePath.split('/').pop()}`;
  };

  // Crear tarea
  const createTaskMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      category: "meeting" | "deadline" | "reminder" | "personal";
      taskDate: string;
      taskTime: string;
      file?: File;
    }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("taskDate", data.taskDate);
      formData.append("taskTime", data.taskTime);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await fetch("/api/timeline/tasks", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear tarea");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
    },
  });

  // Actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      taskDate?: string;
      taskTime?: string;
    }) => {
      const response = await fetch(`/api/timeline/tasks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar tarea");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
    },
  });

  // Eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/timeline/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar tarea");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
    },
  });

  return {
    events,
    tasks,
    isLoading,
    isError,
    error,
    getFileUrl,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}
