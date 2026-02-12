import { useState, useMemo } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Trophy, AlertCircle, Loader2, Search, ChevronUp, ChevronDown, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesafioTecnicoRecord {
  estado_turno: string;
  supervisor: string;
  RUT_O_DNI: string;
  Nombre_Completo: string;
  Justificaciones: string;
  Motivo_Justificacion: string;
  Estado_Evaluacion: string;
  fecha_carga: string;
}

type SortField = keyof DesafioTecnicoRecord | null;
type SortOrder = "asc" | "desc";

export default function SupervisorDesafioTecnico() {
  const { data: records, isLoading, error } = useQuery<DesafioTecnicoRecord[]>({
    queryKey: ["/api/supervisor/desafio-tecnico"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [supervisorFilter, setSupervisorFilter] = useState<string>("todos");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getEstadoColor = (estado: string, justificacion: string) => {
    const estadoLower = estado?.toLowerCase() || "";
    const justificacionLower = justificacion?.toLowerCase() || "";

    // Check "no realizado" FIRST before checking "realizado"
    if (estadoLower.includes("no realizado")) {
      // Sub-estado: Justificado o No Justificado
      if (justificacionLower === "no" || !justificacion) {
        return {
          badge: <Badge className="bg-red-100 text-red-800 hover:bg-red-200">No Realizado - Sin Justificar</Badge>,
          bg: "bg-red-50 dark:bg-red-900/10",
        };
      } else {
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">No Realizado - Justificado</Badge>,
          bg: "bg-yellow-50 dark:bg-yellow-900/10",
        };
      }
    }
    if (estadoLower.includes("realizado")) {
      return {
        badge: <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Realizado</Badge>,
        bg: "bg-green-50 dark:bg-green-900/10",
      };
    }
    return {
      badge: <Badge variant="outline">{estado}</Badge>,
      bg: "",
    };
  };

  // Get unique estados with sub-estados
  const uniqueEstados = useMemo(() => {
    if (!records) return [];
    const estados = new Set<string>();

    records.forEach((r) => {
      const estadoLower = r.Estado_Evaluacion?.toLowerCase() || "";
      const justificacionLower = r.Justificaciones?.toLowerCase() || "";

      if (estadoLower.includes("realizado") && !estadoLower.includes("no realizado")) {
        estados.add("Realizado");
      } else if (estadoLower.includes("no realizado")) {
        if (justificacionLower === "no" || !r.Justificaciones) {
          estados.add("No Realizado - Sin Justificar");
        } else {
          estados.add("No Realizado - Justificado");
        }
      }
    });

    return Array.from(estados).sort();
  }, [records]);

  // Get unique supervisors
  const uniqueSupervisors = useMemo(() => {
    if (!records) return [];
    const supervisors = new Set<string>();
    records.forEach((r) => {
      if (r.supervisor) {
        supervisors.add(r.supervisor);
      }
    });
    return Array.from(supervisors).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];

    return records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        record.supervisor?.toLowerCase().includes(searchLower) ||
        record.RUT_O_DNI?.toLowerCase().includes(searchLower) ||
        record.Nombre_Completo?.toLowerCase().includes(searchLower) ||
        record.estado_turno?.toLowerCase().includes(searchLower) ||
        record.Estado_Evaluacion?.toLowerCase().includes(searchLower);

      // Match supervisor filter
      const matchesSupervisor =
        supervisorFilter === "todos" ||
        record.supervisor === supervisorFilter;

      // Match estado with sub-estados
      let matchesEstado = true;
      if (estadoFilter !== "todos") {
        const estadoLower = record.Estado_Evaluacion?.toLowerCase() || "";
        const justificacionLower = record.Justificaciones?.toLowerCase() || "";

        let recordEstado = "";
        if (estadoLower.includes("realizado") && !estadoLower.includes("no realizado")) {
          recordEstado = "Realizado";
        } else if (estadoLower.includes("no realizado")) {
          if (justificacionLower === "no" || !record.Justificaciones) {
            recordEstado = "No Realizado - Sin Justificar";
          } else {
            recordEstado = "No Realizado - Justificado";
          }
        }
        matchesEstado = recordEstado === estadoFilter;
      }

      return matchesSearch && matchesSupervisor && matchesEstado;
    });
  }, [records, searchTerm, supervisorFilter, estadoFilter]);

  const sortedRecords = useMemo(() => {
    if (!sortField || !filteredRecords) return filteredRecords;

    const sorted = [...filteredRecords].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === "fecha_carga") {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle string sorting
      const aStr = (aValue || "").toString();
      const bStr = (bValue || "").toString();

      return sortOrder === "asc"
        ? aStr.localeCompare(bStr, "es-CL")
        : bStr.localeCompare(aStr, "es-CL");
    });

    return sorted;
  }, [filteredRecords, sortField, sortOrder]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((sortedRecords?.length || 0) / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-0 w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Download function
  const handleDownload = () => {
    if (!sortedRecords || sortedRecords.length === 0) return;

    // Prepare data for Excel
    const excelData = sortedRecords.map((record) => {
      const estadoLower = record.Estado_Evaluacion?.toLowerCase() || "";
      const justificacionLower = record.Justificaciones?.toLowerCase() || "";
      let estadoEvaluacion = record.Estado_Evaluacion || "";

      // Add sub-estado to Estado Evaluación
      if (estadoLower.includes("realizado") && !estadoLower.includes("no realizado")) {
        estadoEvaluacion = "Realizado";
      } else if (estadoLower.includes("no realizado")) {
        if (justificacionLower === "no" || !record.Justificaciones) {
          estadoEvaluacion = "No Realizado - Sin Justificar";
        } else {
          estadoEvaluacion = "No Realizado - Justificado";
        }
      }

      const fechaCarga = record.fecha_carga
        ? new Date(record.fecha_carga).toLocaleString("es-CL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return {
        "Estado Turno": record.estado_turno || "",
        "Supervisor": record.supervisor || "",
        "RUT/DNI": record.RUT_O_DNI || "",
        "Nombre Completo": record.Nombre_Completo || "",
        "Justificaciones": record.Justificaciones || "",
        "Motivo Justificación": record.Motivo_Justificacion || "",
        "Estado Evaluación": estadoEvaluacion,
        "Fecha Carga": fechaCarga,
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Desafío Técnico");

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Estado Turno
      { wch: 20 }, // Supervisor
      { wch: 12 }, // RUT/DNI
      { wch: 30 }, // Nombre Completo
      { wch: 15 }, // Justificaciones
      { wch: 30 }, // Motivo Justificación
      { wch: 30 }, // Estado Evaluación
      { wch: 18 }, // Fecha Carga
    ];
    worksheet["!cols"] = columnWidths;

    // Generate and download file
    const fileName = `desafio-tecnico-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // KPIs - Based on original records, not filtered
  const kpis = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        total: 0,
        realizados: 0,
        noRealizadosJustificados: 0,
        noRealizadosSinJustificar: 0,
        realizadosPercentage: 0,
      };
    }

    const realizados = records.filter((r) => {
      const estadoLower = r.Estado_Evaluacion?.toLowerCase() || "";
      return estadoLower.includes("realizado") && !estadoLower.includes("no realizado");
    }).length;

    const noRealizadosJustificados = records.filter((r) => {
      const estadoLower = r.Estado_Evaluacion?.toLowerCase() || "";
      const justificacionLower = r.Justificaciones?.toLowerCase() || "";
      return (
        estadoLower.includes("no realizado") &&
        justificacionLower !== "no" &&
        r.Justificaciones
      );
    }).length;

    const noRealizadosSinJustificar = records.filter((r) => {
      const estadoLower = r.Estado_Evaluacion?.toLowerCase() || "";
      const justificacionLower = r.Justificaciones?.toLowerCase() || "";
      return (
        estadoLower.includes("no realizado") &&
        (justificacionLower === "no" || !r.Justificaciones)
      );
    }).length;

    return {
      total: records.length,
      realizados,
      noRealizadosJustificados,
      noRealizadosSinJustificar,
      realizadosPercentage: Math.round((realizados / records.length) * 100),
    };
  }, [records]);

  // Distribution by Supervisor with sub-estados
  const supervisorStats = useMemo(() => {
    if (!records || records.length === 0) return [];

    const stats = new Map<
      string,
      { total: number; realizados: number; noRealizadosJustificados: number; noRealizadosSinJustificar: number }
    >();

    records.forEach((record) => {
      const supervisor = record.supervisor || "Sin Supervisor";
      if (!stats.has(supervisor)) {
        stats.set(supervisor, {
          total: 0,
          realizados: 0,
          noRealizadosJustificados: 0,
          noRealizadosSinJustificar: 0,
        });
      }

      const supervisorStat = stats.get(supervisor)!;
      supervisorStat.total++;

      const estadoLower = record.Estado_Evaluacion?.toLowerCase() || "";
      const justificacionLower = record.Justificaciones?.toLowerCase() || "";

      if (estadoLower.includes("realizado") && !estadoLower.includes("no realizado")) {
        supervisorStat.realizados++;
      } else if (estadoLower.includes("no realizado")) {
        if (justificacionLower === "no" || !record.Justificaciones) {
          supervisorStat.noRealizadosSinJustificar++;
        } else {
          supervisorStat.noRealizadosJustificados++;
        }
      }
    });

    return Array.from(stats.entries())
      .map(([supervisor, data]) => ({
        supervisor,
        ...data,
        porcentajeRealizados: Math.round((data.realizados / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  return (
    <SupervisorLayout>
      <div className="max-w-[1800px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span>Supervisor</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Desafío Técnico</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Desafío Técnico</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestión y seguimiento de desafíos técnicos del equipo
            </p>
          </div>
        </div>

        {/* KPIs and Supervisor Distribution */}
        {!isLoading && !error && records && records.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* KPIs - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Registros</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{kpis.total}</p>
              </div>
              <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Realizados</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-600">{kpis.realizados}</p>
                  <span className="text-sm text-green-600 font-semibold">{kpis.realizadosPercentage}%</span>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">No Realizado - Justificado</p>
                <p className="text-3xl font-bold text-yellow-600">{kpis.noRealizadosJustificados}</p>
              </div>
              <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">No Realizado - Sin Justificar</p>
                <p className="text-3xl font-bold text-red-600">{kpis.noRealizadosSinJustificar}</p>
              </div>
            </div>

            {/* Supervisor Distribution Table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Distribución por Supervisor
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">Supervisor</th>
                      <th className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">Total</th>
                      <th className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">✓</th>
                      <th className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">⚠ Just.</th>
                      <th className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">✗ S/J</th>
                      <th className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-xs">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisorStats.map((stat, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
                          {stat.supervisor}
                        </td>
                        <td className="text-center py-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                          {stat.total}
                        </td>
                        <td className="text-center py-2 text-green-600 font-semibold text-sm">
                          {stat.realizados}
                        </td>
                        <td className="text-center py-2 text-yellow-600 font-semibold text-sm">
                          {stat.noRealizadosJustificados}
                        </td>
                        <td className="text-center py-2 text-red-600 font-semibold text-sm">
                          {stat.noRealizadosSinJustificar}
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${stat.porcentajeRealizados}%` }}
                              />
                            </div>
                            <span className="text-slate-600 dark:text-slate-400 font-medium text-xs w-8 text-right">
                              {stat.porcentajeRealizados}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Search Box and Filters */}
        {!isLoading && !error && records && records.length > 0 && (
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por supervisor, RUT, nombre, estado..."
                  className="pl-10 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={supervisorFilter}
                onValueChange={(value) => {
                  setSupervisorFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-56 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Filtrar por supervisor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los supervisores</SelectItem>
                  {uniqueSupervisors.map((supervisor) => (
                    <SelectItem key={supervisor} value={supervisor}>
                      {supervisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={estadoFilter}
                onValueChange={(value) => {
                  setEstadoFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-56 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Filtrar por estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {uniqueEstados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleDownload}
                disabled={!sortedRecords || sortedRecords.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Descargar Excel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-500">Cargando datos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12 text-red-500">
              <AlertCircle className="w-8 h-8 mr-3" />
              <span>Error al cargar los datos</span>
            </div>
          ) : !records || records.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <span>No hay registros disponibles</span>
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <span>No se encontraron registros con los criterios de búsqueda</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("estado_turno")}
                      >
                        <div className="flex items-center gap-2">
                          Estado Turno
                          <SortIcon field="estado_turno" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("supervisor")}
                      >
                        <div className="flex items-center gap-2">
                          Supervisor
                          <SortIcon field="supervisor" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("RUT_O_DNI")}
                      >
                        <div className="flex items-center gap-2">
                          RUT/DNI
                          <SortIcon field="RUT_O_DNI" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("Nombre_Completo")}
                      >
                        <div className="flex items-center gap-2">
                          Nombre Completo
                          <SortIcon field="Nombre_Completo" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("Justificaciones")}
                      >
                        <div className="flex items-center gap-2">
                          Justificaciones
                          <SortIcon field="Justificaciones" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("Motivo_Justificacion")}
                      >
                        <div className="flex items-center gap-2">
                          Motivo Justificación
                          <SortIcon field="Motivo_Justificacion" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("Estado_Evaluacion")}
                      >
                        <div className="flex items-center gap-2">
                          Estado Evaluación
                          <SortIcon field="Estado_Evaluacion" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort("fecha_carga")}
                      >
                        <div className="flex items-center gap-2">
                          Fecha Carga
                          <SortIcon field="fecha_carga" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record, index) => {
                      const { badge, bg } = getEstadoColor(record.Estado_Evaluacion, record.Justificaciones);
                      return (
                        <TableRow key={index} className={bg}>
                          <TableCell>{record.estado_turno || "-"}</TableCell>
                          <TableCell className="font-medium">{record.supervisor || "-"}</TableCell>
                          <TableCell>{record.RUT_O_DNI || "-"}</TableCell>
                          <TableCell>{record.Nombre_Completo || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate" title={record.Justificaciones}>
                            {record.Justificaciones || "-"}
                          </TableCell>
                          <TableCell
                            className="max-w-xs truncate"
                            title={record.Motivo_Justificacion}
                          >
                            {record.Motivo_Justificacion || "-"}
                          </TableCell>
                          <TableCell>{badge}</TableCell>
                          <TableCell>
                            {record.fecha_carga
                              ? new Date(record.fecha_carga).toLocaleString("es-CL", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Mostrando {sortedRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{" "}
                    {Math.min(currentPage * itemsPerPage, sortedRecords.length)} de{" "}
                    {sortedRecords.length} registros
                  </div>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / pág</SelectItem>
                      <SelectItem value="25">25 / pág</SelectItem>
                      <SelectItem value="50">50 / pág</SelectItem>
                      <SelectItem value="100">100 / pág</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                    Página {currentPage} de {totalPages || 1}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SupervisorLayout>
  );
}
