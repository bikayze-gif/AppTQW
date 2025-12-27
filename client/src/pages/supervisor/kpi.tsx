import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, X, ArrowUpDown, Users } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as XLSX from "xlsx";
import { TqwComisionRenew } from "@shared/schema";
import { cn } from "@/lib/utils";
import { GaugeChart } from "@/components/supervisor/gauge-chart";
import { KpiCard } from "@/components/supervisor/kpi-card";
import { PieChart } from "@/components/supervisor/pie-chart";
import { BarChart } from "@/components/supervisor/bar-chart";
import { StackedBarChart } from "@/components/supervisor/stacked-bar-chart";

export default function SupervisorKPI() {
  const [periodo, setPeriodo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TqwComisionRenew | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [activeTab, setActiveTab] = useState<'monitor' | 'mes' | 'benchmark' | 'comisiones'>('monitor');
  const rowsPerPage = 15;

  // Helpers
  const desiredOrder = ['ARIAS', 'ARJONA', 'CORROTEA', 'GOMEZ'];

  const formatDecimalToTime = (decimalHours: any) => {
    if (typeof decimalHours !== 'number') return decimalHours;
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Fetch available periods
  const { data: periods = [] } = useQuery<string[]>({
    queryKey: ["kpi-periods"],
    queryFn: async () => {
      const response = await fetch("/api/kpi-periods");
      if (!response.ok) throw new Error("Failed to fetch periods");
      return response.json();
    },
  });

  // Fetch Monitor Diario dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery({
    queryKey: ["monitor-diario-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/supervisor/monitor-diario", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
    enabled: activeTab === 'monitor',
  });

  // Fetch KPI data
  const { data: kpiData = [], isLoading, error } = useQuery<TqwComisionRenew[]>({
    queryKey: ["kpi", periodo],
    queryFn: async () => {
      if (!periodo) return [];
      const response = await fetch(`/api/kpi?period=${periodo}`);
      if (!response.ok) throw new Error("Failed to fetch KPI data");
      return response.json();
    },
    enabled: !!periodo,
  });

  const handleSort = (key: keyof TqwComisionRenew) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const parseValue = (value: any) => {
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleanValue);
      return isNaN(num) ? value.toLowerCase() : num;
    }
    return value;
  };

  const filteredData = kpiData.filter((item) =>
    Object.values(item).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valA = parseValue(a[sortConfig.key]);
    const valB = parseValue(b[sortConfig.key]);

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPI Data");
    XLSX.writeFile(wb, `KPI_${periodo || "all"}.xlsx`);
  };

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Producción
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Dashboard de rendimiento y comisiones de técnicos
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-200">
            <Button
              variant={activeTab === 'monitor' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('monitor')}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all",
                activeTab === 'monitor' ? "shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              Monitor Diario
            </Button>
            <Button
              variant={activeTab === 'mes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('mes')}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all",
                activeTab === 'mes' ? "shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              Mes Actual
            </Button>
            <Button
              variant={activeTab === 'benchmark' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('benchmark')}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all",
                activeTab === 'benchmark' ? "shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              Benchmark
            </Button>
            <Button
              variant={activeTab === 'comisiones' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('comisiones')}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all",
                activeTab === 'comisiones' ? "shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              Comisiones
            </Button>
          </div>
        </div>

        {activeTab === 'monitor' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Fila 1: Gauge y Tarjetas de Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda: Global Completion Gauge */}
              <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center h-[240px]">
                <GaugeChart
                  value={dashboardData?.globalCompletionRate || 0}
                  label="% de ordenes finalizadas GLOBAL"
                  size={240}
                  color="#22c55e"
                  showPercentage={true}
                />
              </div>

              {/* Columna Derecha: Stacked Info Cards */}
              <div className="grid grid-rows-2 gap-3 h-[240px]">
                {/* Fecha de Integración */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center text-center">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-1">
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                    Fecha de Integración
                  </h3>
                  <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {dashboardData?.lastIntegration || "Sin datos"}
                  </div>
                </div>

                {/* Total Technicians Summary */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center text-center">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-1">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                    Capacidad Técnica Total
                  </h3>
                  <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {dashboardData?.supervisorStats?.reduce((acc: number, curr: any) => acc + (curr.technicianCount || 0), 0) || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2: Gráficos de Torta */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart: Activity Type */}
              <div className="h-[340px]">
                {isDashboardLoading ? (
                  <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                  </div>
                ) : (
                  <PieChart
                    title="Distribución por tipo de actividad"
                    data={dashboardData?.activityTypeCounts || []}
                    height={300}
                  />
                )}
              </div>

              {/* Pie Chart: Status Distribution */}
              <div className="h-[340px]">
                {isDashboardLoading ? (
                  <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                  </div>
                ) : (
                  <PieChart
                    title="% Distribución por Estado"
                    data={dashboardData?.statusDistribution || []}
                    height={300}
                  />
                )}
              </div>

              {/* Pie Chart: Closing Code */}
              <div className="h-[340px]">
                {isDashboardLoading ? (
                  <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                  </div>
                ) : (
                  <PieChart
                    title="% de ordenes no finalizadas"
                    data={dashboardData?.closingCodeDistribution || []}
                    height={300}
                  />
                )}
              </div>
            </div>

            {/* Supervisor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {(isDashboardLoading ? [] : dashboardData?.supervisorStats || []).map((supervisor: any, index: number) => (
                <div key={index} className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                  <div className="bg-slate-100 dark:bg-slate-900 py-1.5 px-3 text-center border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wider uppercase">
                      {supervisor.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2 bg-white dark:bg-slate-900/50">
                    <KpiCard
                      value={supervisor.technicianCount || 0}
                      label="Técnicos Operativos"
                      variant="default"
                      className="h-20"
                    />
                    <KpiCard
                      value={supervisor.px0Count || 0}
                      label="Q tecnicos PX0"
                      variant="danger"
                      className="h-20"
                    />
                  </div>
                  <div className="p-2 flex justify-center items-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[160px]">
                    <GaugeChart
                      value={supervisor.completionRate || 0}
                      label="% de ordenes finalizadas"
                      size={150}
                      color="#3b82f6"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PX0 Technicians by Supervisor */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-l-4 border-blue-500 pl-3">
                Técnicos PX0 por Supervisor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isDashboardLoading ? (
                  <div className="col-span-full py-8 text-center text-slate-500">Cargando datos...</div>
                ) : !dashboardData?.px0TechsByStatusBySupervisor ? (
                  <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    No se encontraron datos de técnicos PX0.
                  </div>
                ) : (
                  desiredOrder.map((supervisor) => {
                    const data = dashboardData?.px0TechsByStatusBySupervisor?.[supervisor] || [];
                    return (
                      <div key={supervisor} className="h-[400px]">
                        <StackedBarChart
                          title={supervisor}
                          data={data}
                          xAxisKey="name"
                          legendFontSize={12}
                          yAxisWidth={120}
                          yAxisFontSize={10}
                          bars={[
                            { key: "Cancelado", name: "Cancelado", color: "#000000" },
                            { key: "Iniciado", name: "Iniciado", color: "#f97316" },
                            { key: "No Realizada", name: "No Realizada", color: "#ef4444" },
                            { key: "Pendiente", name: "Pendiente", color: "#eab308" },
                            { key: "Completado", name: "Completado", color: "#22c55e" },
                            { key: "En ruta", name: "En ruta", color: "#94a3b8" },
                            { key: "Suspendido", name: "Suspendido", color: "#3b82f6" }
                          ]}
                          height={360}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* First Activity Time by Supervisor */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-l-4 border-purple-500 pl-3">
                Hora Inicio Actividad por Supervisor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isDashboardLoading ? (
                  <div className="col-span-full py-8 text-center text-slate-500">Cargando datos...</div>
                ) : !dashboardData?.technicianFirstActivityTime ? (
                  <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    No se encontraron datos de horarios de inicio.
                  </div>
                ) : (
                  desiredOrder.map((supervisor) => {
                    const data = dashboardData?.technicianFirstActivityTime?.[supervisor] || [];
                    return (
                      <div key={supervisor} className="h-[400px]">
                        <StackedBarChart
                          title={supervisor}
                          data={data}
                          xAxisKey="name"
                          xAxisTickFormatter={formatDecimalToTime}
                          valueFormatter={formatDecimalToTime}
                          yAxisWidth={120}
                          yAxisFontSize={10}
                          showBarLabels={true}
                          domain={['auto', 'auto']}
                          customLegend={[
                            { label: "Hasta 10:00", color: "#22c55e" },
                            { label: "10:01 - 10:15", color: "#eab308" },
                            { label: "Posterior", color: "#ef4444" }
                          ]}
                          bars={[
                            {
                              key: "horaDecimal",
                              name: "Hora de Inicio",
                              color: "#8b5cf6",
                              getColor: (val) => {
                                if (val <= 10.0) return "#22c55e"; // Verde hasta las 10:00
                                if (val <= 10.25) return "#eab308"; // Amarillo hasta las 10:15
                                return "#ef4444"; // Rojo después
                              }
                            }
                          ]}
                          height={360}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Technician Record Count by Supervisor */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-l-4 border-emerald-500 pl-3">
                Cantidad de Registros por Técnico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isDashboardLoading ? (
                  <div className="col-span-full py-8 text-center text-slate-500">Cargando datos...</div>
                ) : !dashboardData?.technicianRecordCount ? (
                  <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    No se encontraron datos de conteo de registros.
                  </div>
                ) : (
                  desiredOrder.map((supervisor) => {
                    const data = dashboardData?.technicianRecordCount?.[supervisor] || [];
                    return (
                      <div key={supervisor} className="h-[400px]">
                        <StackedBarChart
                          title={supervisor}
                          data={data}
                          xAxisKey="name"
                          yAxisWidth={120}
                          yAxisFontSize={10}
                          showBarLabels={true}
                          bars={[
                            {
                              key: "recordCount",
                              name: "Cantidad de Registros",
                              color: "#10b981"
                            }
                          ]}
                          height={360}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comisiones' && (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Periodo Filter */}
                <div>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Seleccionar Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar en resultados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    onClick={() => {
                      setSearchTerm("");
                      setPeriodo("");
                    }}
                  >
                    <X className="w-4 h-4" />
                    Limpiar
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    onClick={handleExportExcel}
                    disabled={filteredData.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Exportar Excel
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-700">
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('RutTecnicoOrig')}>
                      <div className="flex items-center gap-2">RUT Técnico <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('periodo')}>
                      <div className="flex items-center gap-2">Periodo <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('NombreTecnico')}>
                      <div className="flex items-center gap-2">Nombre <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Supervisor')}>
                      <div className="flex items-center gap-2">Supervisor <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Zona_Factura23')}>
                      <div className="flex items-center gap-2">Zona <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('modelo_turno')}>
                      <div className="flex items-center gap-2">Modelo Turno <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('categoria')}>
                      <div className="flex items-center gap-2">Categoría <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Original_RUT_TECNICO')}>
                      <div className="flex items-center gap-2">RUT Original <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('DIAS_BASE_DRIVE')}>
                      <div className="flex items-center justify-end gap-2">Días Base Drive <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('SUM_OPERATIVO')}>
                      <div className="flex items-center justify-end gap-2">Sum Operativo <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_HFC')}>
                      <div className="flex items-center justify-end gap-2">Com. HFC <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_FTTH')}>
                      <div className="flex items-center justify-end gap-2">Com. FTTH <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_HFC_Ponderada')}>
                      <div className="flex items-center justify-end gap-2">Total HFC Pond. <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_FTTH_Ponderada')}>
                      <div className="flex items-center justify-end gap-2">Total FTTH Pond. <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Puntos')}>
                      <div className="flex items-center justify-end gap-2">Puntos <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Promedio_HFC')}>
                      <div className="flex items-center justify-end gap-2">Promedio HFC <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Q_RGU')}>
                      <div className="flex items-center justify-end gap-2">Q RGU <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Promedio_RGU')}>
                      <div className="flex items-center justify-end gap-2">Promedio RGU <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('_CumplimientoProduccionHFC')}>
                      <div className="flex items-center justify-end gap-2">Cumpl. Prod HFC <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('_cumplimientoProduccionRGU')}>
                      <div className="flex items-center justify-end gap-2">Cumpl. Prod RGU <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Ratio_CalidadHFC')}>
                      <div className="flex items-center justify-end gap-2">Ratio Calidad HFC <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Ratio_CalidadFTTH')}>
                      <div className="flex items-center justify-end gap-2">Ratio Calidad FTTH <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('fecha_actualizacion')}>
                      <div className="flex items-center gap-2">Fecha Actualización <ArrowUpDown className="h-4 w-4" /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={43} className="h-24 text-center text-slate-600 dark:text-slate-400">
                        Cargando datos...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow key={`${row.RutTecnicoOrig}-${row.periodo}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700">
                        <TableCell className="whitespace-nowrap font-medium text-slate-900 dark:text-white">{row.RutTecnicoOrig}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.periodo}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.NombreTecnico}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.Supervisor}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.Zona_Factura23}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.modelo_turno}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.categoria}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.Original_RUT_TECNICO}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.DIAS_BASE_DRIVE}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.SUM_OPERATIVO}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Comision_HFC}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Comision_FTTH}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Comision_HFC_Ponderada}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Comision_FTTH_Ponderada}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Puntos}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Promedio_HFC}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Q_RGU}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Promedio_RGU}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row._CumplimientoProduccionHFC}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row._cumplimientoProduccionRGU}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Ratio_CalidadHFC}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{row.Ratio_CalidadFTTH}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.fecha_actualizacion}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={43} className="h-24 text-center text-slate-500 dark:text-slate-400">
                        {periodo ? "No se encontraron registros para el periodo seleccionado" : "Ingrese un periodo para ver los datos"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer with pagination */}
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-100 dark:bg-slate-800 mt-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Mostrando <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)}</span> a{" "}
                  <span className="font-semibold">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> de{" "}
                  <span className="font-semibold">{filteredData.length}</span> registros
                </p>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={cn(
                            "cursor-pointer border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",
                            currentPage === 1 && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
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
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className={cn(
                                "cursor-pointer border transition-colors",
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                              )}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={cn(
                            "cursor-pointer border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",
                            currentPage === totalPages && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'benchmark' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Benchmark</h2>
            <p className="text-slate-500 dark:text-slate-400">Contenido del Benchmark en desarrollo.</p>
          </div>
        )}

        {activeTab === 'mes' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Mes Actual</h2>
            <p className="text-slate-500 dark:text-slate-400">Contenido del Mes Actual en desarrollo.</p>
          </div>
        )}
      </div>
    </SupervisorLayout >
  );
}
