import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, FileSpreadsheet, Image, File } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const taskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  category: z.string().max(50, "Máximo 50 caracteres").default("general"),
  taskDate: z.string().min(1, "La fecha es requerida"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TimelineTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimelineTaskDialog({ open, onOpenChange }: TimelineTaskDialogProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      taskDate: new Date().toISOString().split("T")[0],
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData & { file?: File }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("taskDate", data.taskDate);
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
      handleClose();
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo permitido: 5MB");
        return;
      }

      // Validar tipo
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de archivo no permitido");
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    const type = selectedFile.type;
    if (type.includes("pdf")) return <FileText className="text-red-500" />;
    if (type.includes("sheet") || type.includes("excel")) return <FileSpreadsheet className="text-green-500" />;
    if (type.includes("image")) return <Image className="text-blue-500" />;
    return <File className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit = async (data: TaskFormData) => {
    createTaskMutation.mutate({ ...data, file: selectedFile || undefined });
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1e293b] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Nueva Tarea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
              Título *
            </Label>
            <Input
              id="title"
              placeholder="Ej: Revisión de stock"
              className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
              Comentarios
            </Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales..."
              rows={3}
              className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              {...register("description")}
            />
          </div>

          {/* Archivo adjunto */}
          <div>
            <Label className="text-slate-700 dark:text-slate-300">
              Archivo Adjunto (opcional)
            </Label>
            <div className="mt-1">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Click para subir archivo
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, Excel, Word, Imágenes (máx. 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-shrink-0">{getFileIcon()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
              Categoría
            </Label>
            <Input
              id="category"
              placeholder="Ej: Reunión, Seguimiento, Logística..."
              className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              {...register("category")}
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <Label htmlFor="taskDate" className="text-slate-700 dark:text-slate-300">
              Fecha *
            </Label>
            <Input
              id="taskDate"
              type="date"
              className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              {...register("taskDate")}
            />
            {errors.taskDate && (
              <p className="text-red-500 text-xs mt-1">{errors.taskDate.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting ? "Creando..." : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>

        {createTaskMutation.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {createTaskMutation.error.message}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
