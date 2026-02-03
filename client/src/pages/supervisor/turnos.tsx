import { useState, useMemo } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Users, MapPin, Activity, Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MesDisponible {
  mes: string;
  cantidad: number;
}

interface TurnoPy {
  diasTurno: number | null;
  mesCntb: string | null;
  fecha: string | null;
  zona: string | null;
  tipo: string | null;
  supervisor: string | null;
  patente: string | null;
  fono: string | null;
  codi: string | null;
  rut: string | null;
  nombre: string | null;
  turnoBase: string | null;
  tipo1: string | null;
  bucket: string | null;
  estado: string | null;
  observacion: string | null;
  tag: string | null;
  mesCron: number | null;
  semana: number | null;
  estacionamiento: number | null;
  turnoPmIncentivo: string | null;
  tipoTecnico: string | null;
}

type SortDirection = "asc" | "desc" | null;
type SortColumn = keyof TurnoPy | null;

const PAGE_SIZES = [10, 25, 50, 100];

// Colores para el gráfico de estados
const ESTADO_COLORS: Record<string, string> = {
  "LIBRE": "#22c55e",
  "LICENCIA": "#ef4444",
  "VACACIONES": "#f59e0b",
  "OPERATIVO": "#3b82f6",
  "PERMISO": "#8b5cf6",
  "N/A": "#94a3b8",
};

const getEstadoColor = (estado: string): string => {
  return ESTADO_COLORS[estado] || "#64748b";
};

export default function SupervisorTurnos() {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Obtener meses disponibles
  const { data: mesesDisponibles = [] } = useQuery<MesDisponible[]>({
    queryKey: ["/api/supervisor/turnos/meses"],
  });

  // Establecer el mes más reciente por defecto
  useMemo(() => {
    if (mesesDisponibles.length > 0 && !mesSeleccionado) {
      setMesSeleccionado(mesesDisponibles[0].mes);
    }
  }, [mesesDisponibles, mesSeleccionado]);

  // Obtener turnos del mes seleccionado
  const { data: turnos = [], isLoading: loadingTurnos } = useQuery<TurnoPy[]>({
    queryKey: [`/api/supervisor/turnos/${mesSeleccionado}`],
    enabled: !!mesSeleccionado,
  });

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return turnos;

    const term = searchTerm.toLowerCase();
    return turnos.filter((turno) => {
      return (
        turno.fecha?.toLowerCase().includes(term) ||
        turno.nombre?.toLowerCase().includes(term) ||
        turno.rut?.toLowerCase().includes(term) ||
        turno.zona?.toLowerCase().includes(term) ||
        turno.supervisor?.toLowerCase().includes(term) ||
        turno.estado?.toLowerCase().includes(term) ||
        turno.patente?.toLowerCase().includes(term) ||
        turno.observacion?.toLowerCase().includes(term) ||
        turno.turnoBase?.toLowerCase().includes(term)
      );
    });
  }, [turnos, searchTerm]);

  // Calcular estadísticas dinámicas basadas en datos filtrados
  const dynamicStats = useMemo(() => {
    const totalTurnos = filteredData.length;
    const uniqueRuts = new Set(filteredData.map(t => t.rut).filter(Boolean));
    const totalTecnicos = uniqueRuts.size;

    // Contar por zona
    const zonasMap = new Map<string, number>();
    filteredData.forEach(t => {
      const zona = t.zona || "Sin zona";
      zonasMap.set(zona, (zonasMap.get(zona) || 0) + 1);
    });
    const porZona = Array.from(zonasMap.entries()).map(([zona, cantidad]) => ({ zona, cantidad }));

    // Contar por estado
    const estadosMap = new Map<string, number>();
    filteredData.forEach(t => {
      const estado = t.estado || "N/A";
      estadosMap.set(estado, (estadosMap.get(estado) || 0) + 1);
    });
    const porEstado = Array.from(estadosMap.entries())
      .map(([estado, cantidad]) => ({ estado, cantidad, color: getEstadoColor(estado) }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return { totalTurnos, totalTecnicos, porZona, porEstado };
  }, [filteredData]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset página cuando cambia el filtro o mes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, mesSeleccionado, pageSize]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="ml-1 h-4 w-4 text-slate-400" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="ml-1 h-4 w-4 text-blue-600" />;
    }
    return <ChevronDown className="ml-1 h-4 w-4 text-blue-600" />;
  };

  const formatMes = (mes: string) => {
    const [year, month] = mes.split("-");
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  const getEstadoBadgeColor = (estado: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (!estado) return "default";
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("operativo")) return "default";
    if (estadoLower.includes("libre")) return "secondary";
    if (estadoLower.includes("licencia")) return "destructive";
    return "outline";
  };

  // Datos para el gráfico de torta
  const pieChartData = useMemo(() => {
    return dynamicStats.porEstado.map(item => ({
      name: item.estado,
      value: item.cantidad,
      color: item.color,
    }));
  }, [dynamicStats.porEstado]);

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Gestión de Turnos
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Consulta y administra los turnos del equipo técnico
            </p>
          </div>

          {/* Selector de Mes */}
          <div className="w-64">
            <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
              <SelectTrigger className="w-full">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Seleccione un mes" />
              </SelectTrigger>
              <SelectContent>
                {mesesDisponibles.map((mes) => (
                  <SelectItem key={mes.mes} value={mes.mes}>
                    {formatMes(mes.mes)} ({mes.cantidad} turnos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estadísticas dinámicas - Grid 2x2 + Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KPIs en grid 2x2 */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Turnos</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {dynamicStats.totalTurnos.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Técnicos</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {dynamicStats.totalTecnicos}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Zonas</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {dynamicStats.porZona.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Estados</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {dynamicStats.porEstado.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de torta */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Distribución por Estado
            </h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Cantidad"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-400">
                Sin datos
              </div>
            )}
            {/* Leyenda compacta */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {pieChartData.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Turnos */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="p-6">
            {/* Toolbar: Título y Controles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Turnos - {mesSeleccionado && formatMes(mesSeleccionado)}
                </h2>
                <span className="text-sm text-slate-500">
                  ({sortedData.length} registros)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* Input de búsqueda */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por fecha, nombre, RUT, zona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selector de registros por página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Mostrar</span>
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {loadingTurnos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedData.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                {searchTerm ? "No se encontraron resultados para la búsqueda" : "No hay turnos para este mes"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("fecha")}
                        >
                          <div className="flex items-center">
                            Fecha
                            <SortIcon column="fecha" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("nombre")}
                        >
                          <div className="flex items-center">
                            Técnico
                            <SortIcon column="nombre" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("rut")}
                        >
                          <div className="flex items-center">
                            RUT
                            <SortIcon column="rut" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("zona")}
                        >
                          <div className="flex items-center">
                            Zona
                            <SortIcon column="zona" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("turnoBase")}
                        >
                          <div className="flex items-center">
                            Turno Base
                            <SortIcon column="turnoBase" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("estado")}
                        >
                          <div className="flex items-center">
                            Estado
                            <SortIcon column="estado" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("supervisor")}
                        >
                          <div className="flex items-center">
                            Supervisor
                            <SortIcon column="supervisor" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none"
                          onClick={() => handleSort("patente")}
                        >
                          <div className="flex items-center">
                            Patente
                            <SortIcon column="patente" />
                          </div>
                        </TableHead>
                        <TableHead>Observación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((turno, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {turno.fecha}
                          </TableCell>
                          <TableCell>{turno.nombre}</TableCell>
                          <TableCell>{turno.rut}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{turno.zona}</Badge>
                          </TableCell>
                          <TableCell>{turno.turnoBase}</TableCell>
                          <TableCell>
                            <Badge variant={getEstadoBadgeColor(turno.estado)}>
                              {turno.estado || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>{turno.supervisor}</TableCell>
                          <TableCell>{turno.patente}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {turno.observacion || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="text-sm text-slate-500">
                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      Primera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Última
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
