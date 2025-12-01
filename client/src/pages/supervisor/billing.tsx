import { useState, useMemo, useEffect } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download, Plus, Search, Edit, FileText, Mail, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface BillingRecord {
  id: number;
  periodo: string;
  linea: string;
  proyecto: string;
  observacion: string;
  cantidad: number;
  valorizacion: number;
  fecha_gestion: string;
  responsable: string;
  estado: "Pendiente" | "Completado" | "En Proceso" | "Rechazado";
  observacion_gestion: string;
  archivo_detalle: string;
  correo_enviado: string;
  correo_recepcionado: string;
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

// Modal de Edición
function EditBillingModal({
  isOpen,
  onClose,
  record,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: BillingRecord | null;
}) {
  const [formData, setFormData] = useState<BillingRecord | null>(record);

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record, isOpen]);

  const handleSave = () => {
    console.log("Guardando:", formData);
    onClose();
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Facturación - {formData.proyecto}</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la factura y guarda los cambios
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Período */}
          <div>
            <Label htmlFor="periodo">Período</Label>
            <Input
              id="periodo"
              value={formData.periodo}
              onChange={(e) =>
                setFormData({ ...formData, periodo: e.target.value })
              }
              className="mt-1"
              data-testid="input-periodo"
            />
          </div>

          {/* Línea */}
          <div>
            <Label htmlFor="linea">Línea</Label>
            <Input
              id="linea"
              value={formData.linea}
              onChange={(e) =>
                setFormData({ ...formData, linea: e.target.value })
              }
              className="mt-1"
              data-testid="input-linea"
            />
          </div>

          {/* Proyecto */}
          <div className="col-span-2">
            <Label htmlFor="proyecto">Proyecto</Label>
            <Input
              id="proyecto"
              value={formData.proyecto}
              onChange={(e) =>
                setFormData({ ...formData, proyecto: e.target.value })
              }
              className="mt-1"
              data-testid="input-proyecto"
            />
          </div>

          {/* Observación */}
          <div className="col-span-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={formData.observacion}
              onChange={(e) =>
                setFormData({ ...formData, observacion: e.target.value })
              }
              className="mt-1"
              data-testid="textarea-observacion"
            />
          </div>

          {/* Cantidad */}
          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: parseInt(e.target.value) })
              }
              className="mt-1"
              data-testid="input-cantidad"
            />
          </div>

          {/* Valorización */}
          <div>
            <Label htmlFor="valorizacion">Valorización</Label>
            <Input
              id="valorizacion"
              type="number"
              step="0.01"
              value={formData.valorizacion}
              onChange={(e) =>
                setFormData({ ...formData, valorizacion: parseFloat(e.target.value) })
              }
              className="mt-1"
              data-testid="input-valorizacion"
            />
          </div>

          {/* Fecha Gestión */}
          <div>
            <Label htmlFor="fecha_gestion">Fecha de Gestión</Label>
            <Input
              id="fecha_gestion"
              type="date"
              value={formData.fecha_gestion}
              onChange={(e) =>
                setFormData({ ...formData, fecha_gestion: e.target.value })
              }
              className="mt-1"
              data-testid="input-fecha_gestion"
            />
          </div>

          {/* Responsable */}
          <div>
            <Label htmlFor="responsable">Responsable</Label>
            <Input
              id="responsable"
              value={formData.responsable}
              onChange={(e) =>
                setFormData({ ...formData, responsable: e.target.value })
              }
              className="mt-1"
              data-testid="input-responsable"
            />
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  estado: value as BillingRecord["estado"],
                })
              }
            >
              <SelectTrigger className="mt-1" data-testid="select-estado">
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
            <Label htmlFor="observacion_gestion">Observación de Gestión</Label>
            <Textarea
              id="observacion_gestion"
              value={formData.observacion_gestion}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacion_gestion: e.target.value,
                })
              }
              className="mt-1"
              data-testid="textarea-observacion_gestion"
            />
          </div>

          {/* Archivo Detalle */}
          <div>
            <Label htmlFor="archivo_detalle">Archivo Detalle</Label>
            <Input
              id="archivo_detalle"
              value={formData.archivo_detalle}
              onChange={(e) =>
                setFormData({ ...formData, archivo_detalle: e.target.value })
              }
              className="mt-1"
              data-testid="input-archivo_detalle"
            />
          </div>

          {/* Correo Enviado */}
          <div>
            <Label htmlFor="correo_enviado">Correo Enviado</Label>
            <Input
              id="correo_enviado"
              type="email"
              value={formData.correo_enviado}
              onChange={(e) =>
                setFormData({ ...formData, correo_enviado: e.target.value })
              }
              className="mt-1"
              data-testid="input-correo_enviado"
            />
          </div>

          {/* Correo Recepcionado */}
          <div>
            <Label htmlFor="correo_recepcionado">Correo Recepcionado</Label>
            <Input
              id="correo_recepcionado"
              type="email"
              value={formData.correo_recepcionado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  correo_recepcionado: e.target.value,
                })
              }
              className="mt-1"
              data-testid="input-correo_recepcionado"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="btn-cancel"
          >
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            data-testid="btn-save"
          >
            Guardar Cambios
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("fecha_gestion");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{ title: string; email: string } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockData.filter((item) => {
      const matchesSearch =
        item.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.linea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.periodo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
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
  }, [searchTerm, statusFilter, sortField, sortOrder]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Rechazado":
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
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="btn-new-bill"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
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
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((record) => (
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
                      <TableCell className="text-right font-semibold text-slate-900 dark:text-white">
                        ${record.valorizacion.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {new Date(record.fecha_gestion).toLocaleDateString("es-ES")}
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

          {/* Footer with info */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando <span className="font-semibold">{filteredAndSortedData.length}</span> de{" "}
              <span className="font-semibold">{mockData.length}</span> registros
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      <EditBillingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={editingRecord}
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
