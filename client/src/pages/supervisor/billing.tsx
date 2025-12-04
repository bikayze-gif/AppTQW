import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download, Plus, Search, Edit, FileText, Mail, X, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BillingRecord {
  id: number;
  periodo: string;
  linea: string;
  proyecto: string;
  observacion: string | null;
  cantidad: number | null;
  valorizacion: number | string | null;
  fecha_gestion: string | null;
  responsable: string | null;
  estado: string | null;
  observacion_gestion: string | null;
  archivo_detalle: string | null;
  correo_enviado: string | null;
  correo_recepcionado: string | null;
}

// Mock data
const mockData: BillingRecord[] = [
  {
    id: 1,
    periodo: "2024-Q1",
    linea: "Línea A",
    proyecto: "Proyecto Alpha",
    observacion: "Facturable",
    cantidad: 5,
    valorizacion: 50000.00,
    fecha_gestion: "2024-01-15",
    responsable: "Juan García",
    estado: "Completado",
    observacion_gestion: "Enviado correctamente",
    archivo_detalle: "factura_001.pdf",
    correo_enviado: "juan@empresa.com",
    correo_recepcionado: "cliente@empresa.com",
  },
  {
    id: 2,
    periodo: "2024-Q1",
    linea: "Línea B",
    proyecto: "Proyecto Beta",
    observacion: "Pendiente de revisión",
    cantidad: 3,
    valorizacion: 35000.00,
    fecha_gestion: "2024-01-20",
    responsable: "María López",
    estado: "En Proceso",
    observacion_gestion: "Revisando detalles",
    archivo_detalle: "factura_002.pdf",
    correo_enviado: "maria@empresa.com",
    correo_recepcionado: "",
  },
  {
    id: 3,
    periodo: "2024-Q1",
    linea: "Línea C",
    proyecto: "Proyecto Gamma",
    observacion: "Requiere ajustes",
    cantidad: 8,
    valorizacion: 80000.00,
    fecha_gestion: "2024-01-25",
    responsable: "Carlos Rodríguez",
    estado: "Pendiente",
    observacion_gestion: "Aguardando confirmación del cliente",
    archivo_detalle: "factura_003.pdf",
    correo_enviado: "carlos@empresa.com",
    correo_recepcionado: "",
  },
  {
    id: 4,
    periodo: "2024-Q2",
    linea: "Línea A",
    proyecto: "Proyecto Delta",
    observacion: "Facturable",
    cantidad: 12,
    valorizacion: 120000.00,
    fecha_gestion: "2024-04-10",
    responsable: "Ana Martínez",
    estado: "Completado",
    observacion_gestion: "Factura enviada",
    archivo_detalle: "factura_004.pdf",
    correo_enviado: "ana@empresa.com",
    correo_recepcionado: "cliente2@empresa.com",
  },
  {
    id: 5,
    periodo: "2024-Q2",
    linea: "Línea B",
    proyecto: "Proyecto Epsilon",
    observacion: "En revisión interna",
    cantidad: 6,
    valorizacion: 65000.00,
    fecha_gestion: "2024-04-15",
    responsable: "Roberto Sánchez",
    estado: "En Proceso",
    observacion_gestion: "Validando con finanzas",
    archivo_detalle: "factura_005.pdf",
    correo_enviado: "roberto@empresa.com",
    correo_recepcionado: "",
  },
  {
    id: 6,
    periodo: "2024-Q2",
    linea: "Línea C",
    proyecto: "Proyecto Zeta",
    observacion: "Error en cálculo",
    cantidad: 4,
    valorizacion: 40000.00,
    fecha_gestion: "2024-04-20",
    responsable: "Isabel Torres",
    estado: "Rechazado",
    observacion_gestion: "Discrepancia en montos",
    archivo_detalle: "factura_006.pdf",
    correo_enviado: "isabel@empresa.com",
    correo_recepcionado: "",
  },
];

type SortField = keyof BillingRecord;
type SortOrder = "asc" | "desc";

// Modal para Nueva Factura
function NewBillingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BillingRecord, "id">) => void;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = useState<Omit<BillingRecord, "id">>({
    periodo: "",
    linea: "",
    proyecto: "",
    observacion: null,
    cantidad: null,
    valorizacion: null,
    fecha_gestion: null,
    responsable: null,
    estado: "Pendiente",
    observacion_gestion: null,
    archivo_detalle: null,
    correo_enviado: null,
    correo_recepcionado: null,
  });

  const handleSave = () => {
    // Validate required fields
    if (!formData.periodo.trim() || !formData.linea.trim() || !formData.proyecto.trim()) {
      return;
    }

    // Prepare data with proper null handling
    const dataToSubmit = {
      ...formData,
      observacion: formData.observacion?.trim() || null,
      cantidad: formData.cantidad || null,
      valorizacion: formData.valorizacion || null,
      fecha_gestion: formData.fecha_gestion || null,
      responsable: formData.responsable?.trim() || null,
      observacion_gestion: formData.observacion_gestion?.trim() || null,
      archivo_detalle: formData.archivo_detalle?.trim() || null,
      correo_enviado: formData.correo_enviado?.trim() || null,
      correo_recepcionado: formData.correo_recepcionado?.trim() || null,
    };

    onSubmit(dataToSubmit);
  };

  useEffect(() => {
    if (!isLoading && !isOpen) {
      setFormData({
        periodo: "",
        linea: "",
        proyecto: "",
        observacion: null,
        cantidad: null,
        valorizacion: null,
        fecha_gestion: null,
        responsable: null,
        estado: "Pendiente",
        observacion_gestion: null,
        archivo_detalle: null,
        correo_enviado: null,
        correo_recepcionado: null,
      });
    }
  }, [isLoading, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Nueva Factura</DialogTitle>
          <DialogDescription className="text-slate-600">
            Ingresa los detalles de la nueva factura
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Período */}
          <div>
            <Label htmlFor="new_periodo" className="text-slate-700">Período</Label>
            <Input
              id="new_periodo"
              value={formData.periodo}
              onChange={(e) =>
                setFormData({ ...formData, periodo: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-periodo"
            />
          </div>

          {/* Línea */}
          <div>
            <Label htmlFor="new_linea" className="text-slate-700">Línea</Label>
            <Input
              id="new_linea"
              value={formData.linea}
              onChange={(e) =>
                setFormData({ ...formData, linea: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-linea"
            />
          </div>

          {/* Proyecto */}
          <div className="col-span-2">
            <Label htmlFor="new_proyecto" className="text-slate-700">Proyecto</Label>
            <Input
              id="new_proyecto"
              value={formData.proyecto}
              onChange={(e) =>
                setFormData({ ...formData, proyecto: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-proyecto"
            />
          </div>

          {/* Observación */}
          <div className="col-span-2">
            <Label htmlFor="new_observacion" className="text-slate-700">Observación</Label>
            <Textarea
              id="new_observacion"
              value={formData.observacion || ""}
              onChange={(e) =>
                setFormData({ ...formData, observacion: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="textarea-new-observacion"
            />
          </div>

          {/* Cantidad */}
          <div>
            <Label htmlFor="new_cantidad" className="text-slate-700">Cantidad</Label>
            <Input
              id="new_cantidad"
              type="number"
              value={formData.cantidad ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: e.target.value ? parseInt(e.target.value) : null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-cantidad"
            />
          </div>

          {/* Valorización */}
          <div>
            <Label htmlFor="new_valorizacion" className="text-slate-700">Valorización</Label>
            <Input
              id="new_valorizacion"
              type="number"
              step="0.01"
              value={formData.valorizacion ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, valorizacion: e.target.value ? parseFloat(e.target.value) : null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-valorizacion"
            />
          </div>

          {/* Fecha Gestión */}
          <div>
            <Label htmlFor="new_fecha_gestion" className="text-slate-700">Fecha de Gestión</Label>
            <Input
              id="new_fecha_gestion"
              type="date"
              value={formData.fecha_gestion || ""}
              onChange={(e) =>
                setFormData({ ...formData, fecha_gestion: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-fecha_gestion"
            />
          </div>

          {/* Responsable */}
          <div>
            <Label htmlFor="new_responsable" className="text-slate-700">Responsable</Label>
            <Input
              id="new_responsable"
              value={formData.responsable || ""}
              onChange={(e) =>
                setFormData({ ...formData, responsable: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-new-responsable"
            />
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="new_estado" className="text-slate-700">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  estado: value as BillingRecord["estado"],
                })
              }
            >
              <SelectTrigger className="mt-1 bg-white border-slate-300 text-slate-900" data-testid="select-new-estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observación Gestión */}
          <div className="col-span-2">
            <Label htmlFor="new_observacion_gestion" className="text-slate-700">Observación de Gestión</Label>
            <Textarea
              id="new_observacion_gestion"
              value={formData.observacion_gestion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacion_gestion: e.target.value || null,
                })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="textarea-new-observacion_gestion"
            />
          </div>

          {/* Archivo Detalle - File Upload */}
          <div>
            <Label htmlFor="new_archivo_detalle" className="text-slate-700">Archivo Detalle</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.archivo_detalle || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="new_archivo_detalle"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, archivo_detalle: file.name });
                    }
                  }}
                  data-testid="input-new-archivo_detalle"
                />
              </label>
            </div>
          </div>

          {/* Correo Enviado - File Upload */}
          <div>
            <Label htmlFor="new_correo_enviado" className="text-slate-700">Correo Enviado</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.correo_enviado || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="new_correo_enviado"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, correo_enviado: file.name });
                    }
                  }}
                  data-testid="input-new-correo_enviado"
                />
              </label>
            </div>
          </div>

          {/* Correo Recepcionado - File Upload */}
          <div>
            <Label htmlFor="new_correo_recepcionado" className="text-slate-700">Correo Recepcionado</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.correo_recepcionado || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="new_correo_recepcionado"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, correo_recepcionado: file.name });
                    }
                  }}
                  data-testid="input-new-correo_recepcionado"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="btn-cancel-new"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            data-testid="btn-save-new"
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Crear Factura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Edición
function EditBillingModal({
  isOpen,
  onClose,
  record,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: BillingRecord | null;
  onSubmit: (data: BillingRecord) => void;
  isLoading?: boolean;
}) {
  const [formData, setFormData] = useState<BillingRecord | null>(record);

  useEffect(() => {
    if (record) {
      // Ensure fecha_gestion is in yyyy-MM-dd format
      const formattedRecord = {
        ...record,
        fecha_gestion: record.fecha_gestion 
          ? record.fecha_gestion.split('T')[0] 
          : null,
      };
      setFormData(formattedRecord);
    }
  }, [record, isOpen]);

  const handleSave = () => {
    if (!formData) return;

    // Validate required fields
    if (!formData.periodo.trim() || !formData.linea.trim() || !formData.proyecto.trim()) {
      return;
    }

    // Prepare data with proper null handling and date format
    const dataToSubmit = {
      ...formData,
      observacion: formData.observacion?.trim() || null,
      cantidad: formData.cantidad || null,
      valorizacion: formData.valorizacion || null,
      fecha_gestion: formData.fecha_gestion 
        ? formData.fecha_gestion.split('T')[0] 
        : null,
      responsable: formData.responsable?.trim() || null,
      observacion_gestion: formData.observacion_gestion?.trim() || null,
      archivo_detalle: formData.archivo_detalle?.trim() || null,
      correo_enviado: formData.correo_enviado?.trim() || null,
      correo_recepcionado: formData.correo_recepcionado?.trim() || null,
    };

    onSubmit(dataToSubmit);
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Editar Facturación - {formData.proyecto}</DialogTitle>
          <DialogDescription className="text-slate-600">
            Modifica los detalles de la factura y guarda los cambios
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Período */}
          <div>
            <Label htmlFor="periodo" className="text-slate-700">Período</Label>
            <Input
              id="periodo"
              value={formData.periodo}
              onChange={(e) =>
                setFormData({ ...formData, periodo: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-periodo"
            />
          </div>

          {/* Línea */}
          <div>
            <Label htmlFor="linea" className="text-slate-700">Línea</Label>
            <Input
              id="linea"
              value={formData.linea}
              onChange={(e) =>
                setFormData({ ...formData, linea: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-linea"
            />
          </div>

          {/* Proyecto */}
          <div className="col-span-2">
            <Label htmlFor="proyecto" className="text-slate-700">Proyecto</Label>
            <Input
              id="proyecto"
              value={formData.proyecto}
              onChange={(e) =>
                setFormData({ ...formData, proyecto: e.target.value })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-proyecto"
            />
          </div>

          {/* Observación */}
          <div className="col-span-2">
            <Label htmlFor="observacion" className="text-slate-700">Observación</Label>
            <Textarea
              id="observacion"
              value={formData.observacion || ""}
              onChange={(e) =>
                setFormData({ ...formData, observacion: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="textarea-observacion"
            />
          </div>

          {/* Cantidad */}
          <div>
            <Label htmlFor="cantidad" className="text-slate-700">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              value={formData.cantidad ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: e.target.value ? parseInt(e.target.value) : null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-cantidad"
            />
          </div>

          {/* Valorización */}
          <div>
            <Label htmlFor="valorizacion" className="text-slate-700">Valorización</Label>
            <Input
              id="valorizacion"
              type="number"
              step="0.01"
              value={formData.valorizacion ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, valorizacion: e.target.value ? parseFloat(e.target.value) : null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-valorizacion"
            />
          </div>

          {/* Fecha Gestión */}
          <div>
            <Label htmlFor="fecha_gestion" className="text-slate-700">Fecha de Gestión</Label>
            <Input
              id="fecha_gestion"
              type="date"
              value={formData.fecha_gestion || ""}
              onChange={(e) =>
                setFormData({ ...formData, fecha_gestion: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-fecha_gestion"
            />
          </div>

          {/* Responsable */}
          <div>
            <Label htmlFor="responsable" className="text-slate-700">Responsable</Label>
            <Input
              id="responsable"
              value={formData.responsable || ""}
              onChange={(e) =>
                setFormData({ ...formData, responsable: e.target.value || null })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="input-responsable"
            />
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="estado" className="text-slate-700">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  estado: value as BillingRecord["estado"],
                })
              }
            >
              <SelectTrigger className="mt-1 bg-white border-slate-300 text-slate-900" data-testid="select-estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observación Gestión */}
          <div className="col-span-2">
            <Label htmlFor="observacion_gestion" className="text-slate-700">Observación de Gestión</Label>
            <Textarea
              id="observacion_gestion"
              value={formData.observacion_gestion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacion_gestion: e.target.value || null,
                })
              }
              className="mt-1 bg-white border-slate-300 text-slate-900"
              data-testid="textarea-observacion_gestion"
            />
          </div>

          {/* Archivo Detalle - File Upload */}
          <div>
            <Label htmlFor="archivo_detalle" className="text-slate-700">Archivo Detalle</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.archivo_detalle || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="archivo_detalle"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, archivo_detalle: file.name });
                    }
                  }}
                  data-testid="input-archivo_detalle"
                />
              </label>
            </div>
          </div>

          {/* Correo Enviado - File Upload */}
          <div>
            <Label htmlFor="correo_enviado" className="text-slate-700">Correo Enviado</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.correo_enviado || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="correo_enviado"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, correo_enviado: file.name });
                    }
                  }}
                  data-testid="input-correo_enviado"
                />
              </label>
            </div>
          </div>

          {/* Correo Recepcionado - File Upload */}
          <div>
            <Label htmlFor="correo_recepcionado" className="text-slate-700">Correo Recepcionado</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formData.correo_recepcionado || "Seleccionar archivo"}
                  </span>
                </div>
                <input
                  id="correo_recepcionado"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, correo_recepcionado: file.name });
                    }
                  }}
                  data-testid="input-correo_recepcionado"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="btn-cancel"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            data-testid="btn-save"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modal para ver correo
function EmailViewModal({
  isOpen,
  onClose,
  title,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  email: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
          <p className="text-slate-900 dark:text-white break-all">{email}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="btn-close-email"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupervisorBilling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("fecha_gestion");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewBillingModalOpen, setIsNewBillingModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{ title: string; email: string } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Fetch billing data
  const { data: billingData = mockData, isLoading, error } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/billing");
        if (!response.ok) throw new Error("Failed to fetch billing data");
        return response.json();
      } catch {
        return mockData;
      }
    },
  });

  // Create billing mutation
  const createBillingMutation = useMutation({
    mutationFn: async (newBilling: Omit<BillingRecord, "id">) => {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBilling),
      });
      if (!response.ok) throw new Error("Failed to create billing record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      toast({ description: "Factura creada exitosamente" });
      setIsNewBillingModalOpen(false);
    },
    onError: () => {
      toast({ description: "Error al crear la factura", variant: "destructive" });
    },
  });

  // Update billing mutation
  const updateBillingMutation = useMutation({
    mutationFn: async (updatedBilling: BillingRecord) => {
      const { id, ...data } = updatedBilling;
      const response = await fetch(`/api/billing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update billing record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      toast({ description: "Factura actualizada exitosamente" });
    },
    onError: () => {
      toast({ description: "Error al actualizar la factura", variant: "destructive" });
    },
  });

  // Delete billing mutation
  const deleteBillingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/billing/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete billing record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      toast({ description: "Factura eliminada exitosamente" });
    },
    onError: () => {
      toast({ description: "Error al eliminar la factura", variant: "destructive" });
    },
  });

  const filteredAndSortedData = useMemo(() => {
    let filtered = billingData.filter((item: BillingRecord) => {
      const matchesSearch =
        item.proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.linea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        item.periodo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a: BillingRecord, b: BillingRecord) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (typeof aVal === "number") {
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      return 0;
    });

    return filtered;
  }, [billingData, searchTerm, statusFilter, sortField, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (estado: string | null) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "En Proceso":
      case "En proceso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Rechazado":
      case "Cancelado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditClick = (record: BillingRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleViewEmail = (title: string, email: string) => {
    setEmailModalData({ title, email });
    setIsEmailModalOpen(true);
  };

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      data-testid={`sort-${field}`}
    >
      {label}
      <ArrowUpDown
        className={`w-4 h-4 ${
          sortField === field ? "opacity-100 text-blue-600" : "opacity-50"
        }`}
      />
    </button>
  );

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Facturación
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona la bitácora de facturación y estados
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsNewBillingModalOpen(true)}
            data-testid="btn-new-bill"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6 text-[#0f40d4]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar proyecto, línea, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                data-testid="input-search"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" data-testid="select-status">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button variant="outline" className="gap-2" data-testid="btn-export">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-700">
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="periodo" label="Período" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="linea" label="Línea" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="proyecto" label="Proyecto" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="responsable" label="Responsable" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 text-right">
                    <SortableHeader field="cantidad" label="Cantidad" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 text-right">
                    <SortableHeader field="valorizacion" label="Valorización" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="fecha_gestion" label="Fecha" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    <SortableHeader field="estado" label="Estado" />
                  </TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((record: BillingRecord) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      data-testid={`row-record-${record.id}`}
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {record.periodo}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {record.linea}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {record.proyecto}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {record.responsable}
                      </TableCell>
                      <TableCell className="text-right text-slate-900 dark:text-white">
                        {record.cantidad ?? "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900 dark:text-white">
                        {record.valorizacion != null
                          ? `$${Number(record.valorizacion).toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {record.fecha_gestion
                          ? new Date(record.fecha_gestion).toLocaleDateString("es-ES")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            record.estado
                          )}`}
                          data-testid={`status-${record.id}`}
                        >
                          {record.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Botón Editar */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => handleEditClick(record)}
                            data-testid={`btn-edit-${record.id}`}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Botón Ver Archivo */}
                          {record.archivo_detalle && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                              data-testid={`btn-file-${record.id}`}
                              title="Ver archivo"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Botón Correo Enviado */}
                          {record.correo_enviado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              onClick={() =>
                                handleViewEmail("Correo Enviado", record.correo_enviado)
                              }
                              data-testid={`btn-email-sent-${record.id}`}
                              title="Ver correo enviado"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Botón Correo Recepcionado */}
                          {record.correo_recepcionado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              onClick={() =>
                                handleViewEmail("Correo Recepcionado", record.correo_recepcionado)
                              }
                              data-testid={`btn-email-received-${record.id}`}
                              title="Ver correo recepcionado"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-slate-500 dark:text-slate-400">
                        No se encontraron registros
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with pagination */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mostrando <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredAndSortedData.length)}</span> a{" "}
                <span className="font-semibold">{Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)}</span> de{" "}
                <span className="font-semibold">{filteredAndSortedData.length}</span> registros
              </p>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Primera página */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(1)}
                        isActive={currentPage === 1}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    
                    {/* Elipsis izquierda */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <span className="flex h-9 w-9 items-center justify-center text-slate-500">
                          ...
                        </span>
                      </PaginationItem>
                    )}
                    
                    {/* Páginas intermedias (antes y después de la actual) */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Mostrar páginas cercanas a la actual
                        if (page === 1 || page === totalPages) return false;
                        return Math.abs(page - currentPage) <= 1;
                      })
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    
                    {/* Elipsis derecha */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <span className="flex h-9 w-9 items-center justify-center text-slate-500">
                          ...
                        </span>
                      </PaginationItem>
                    )}
                    
                    {/* Última página */}
                    {totalPages > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modales */}
      <NewBillingModal
        isOpen={isNewBillingModalOpen}
        onClose={() => setIsNewBillingModalOpen(false)}
        onSubmit={(data) => createBillingMutation.mutate(data)}
        isLoading={createBillingMutation.isPending}
      />
      <EditBillingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={editingRecord}
        onSubmit={(data) => updateBillingMutation.mutate(data)}
        isLoading={updateBillingMutation.isPending}
      />
      <EmailViewModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title={emailModalData?.title || ""}
        email={emailModalData?.email || ""}
      />
    </SupervisorLayout>
  );
}
