import { useState, useMemo } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download, Plus, Search } from "lucide-react";
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

export default function SupervisorBilling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("fecha_gestion");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          data-testid={`btn-view-${record.id}`}
                        >
                          Ver
                        </Button>
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
    </SupervisorLayout>
  );
}
