import { useState, useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { TechnicianDailyMatrix } from "@/components/supervisor/technician-daily-matrix";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Download, Copy, Search, X, ArrowUpDown, Users, LayoutDashboard, TrendingUp, Award, Zap, AlertCircle, Calendar, CheckCircle2, Construction, PieChart as PieChartIcon } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

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

import { Skeleton } from "@/components/ui/skeleton";

import * as XLSX from "xlsx";

import { TqwComisionRenew } from "@shared/schema";

import { cn, formatDecimal } from "@/lib/utils";

import { GaugeChart } from "@/components/supervisor/gauge-chart";

import { KpiCard } from "@/components/supervisor/kpi-card";

import { PieChart } from "@/components/supervisor/pie-chart";

import { BarChart } from "@/components/supervisor/bar-chart";
import { StackedBarChart } from "@/components/supervisor/stacked-bar-chart";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";



export default function SupervisorKPI() {

  const [periodo, setPeriodo] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{ key: keyof TqwComisionRenew | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const [activeTab, setActiveTab] = useState<'monitor' | 'mes' | 'benchmark' | 'comisiones' | 'detalleOt'>('monitor');

  const [mesContable, setMesContable] = useState("");

  const [detalleOtSearchTerm, setDetalleOtSearchTerm] = useState("");

  const [detalleOtCurrentPage, setDetalleOtCurrentPage] = useState(1);

  const [detalleOtSortConfig, setDetalleOtSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const [mesActualEquipmentType, setMesActualEquipmentType] = useState<string>("TODOS");

  const rowsPerPage = 15;

  const queryClient = useQueryClient();

  const { toast } = useToast();



  // Real-time WebSocket connection

  useEffect(() => {

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const wsUrl = `${protocol}//${window.location.host}/ws`;



    let ws: WebSocket | null = null;

    let reconnectTimeout: any;

    let reconnectAttempts = 0;

    const maxReconnectAttempts = 5;

    let isMounted = true;



    const connect = () => {

      if (!isMounted || reconnectAttempts >= maxReconnectAttempts) {

        console.log("[WS] Max reconnect attempts reached, stopping reconnection");

        return;

      }



      try {

        ws = new WebSocket(wsUrl);



        ws.onopen = () => {

          // console.log("[WS] Connected successfully");

          reconnectAttempts = 0; // Reset on successful connection

        };



        ws.onmessage = (event) => {

          try {

            const data = JSON.parse(event.data);

            if (data.type === "refresh" && data.target === "monitor-diario") {

              // console.log("[WS] Refresh signal received, invalidating dashboard query...");

              queryClient.invalidateQueries({ queryKey: ["monitor-diario-dashboard"] });

            }

          } catch (e) {

            console.error("Error parsing WS message:", e);

          }

        };



        ws.onclose = () => {

          if (isMounted && reconnectAttempts < maxReconnectAttempts) {

            reconnectAttempts++;

            const delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000); // Exponential backoff, max 30s

            // console.log(`[WS] Connection closed, reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);

            reconnectTimeout = setTimeout(connect, delay);

          }

        };



        ws.onerror = () => {

          // Don't log error, onclose will handle reconnection

          if (ws) ws.close();

        };

      } catch (e) {

        console.error("[WS] Failed to create WebSocket:", e);

      }

    };



    connect();



    return () => {

      isMounted = false;

      if (ws) ws.close();

      clearTimeout(reconnectTimeout);

    };

  }, [queryClient]);



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

      const response = await fetch(`/api/supervisor/monitor-diario?t=${Date.now()}`, {

        credentials: "include",

      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      return response.json();

    },

    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos

    enabled: activeTab === 'monitor',

    retry: 3, // Reintentar 3 veces antes de fallar

    retryDelay: 1000, // Esperar 1 segundo entre reintentos

    staleTime: 0, // Datos siempre considerados obsoletos, permitiendo refetch automático

    refetchOnWindowFocus: true, // Refrescar al volver a la pestaña

    refetchOnReconnect: true, // Refrescar al reconectar internet

  });



  // Reset page when filter changes

  useEffect(() => {

    setDetalleOtCurrentPage(1);

  }, [mesContable, detalleOtSearchTerm]);



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



  // Fetch Detalle OT periods

  const { data: detalleOtPeriods = [] } = useQuery<string[]>({

    queryKey: ["detalle-ot-periods"],

    queryFn: async () => {

      const response = await fetch("/api/detalle-ot-periods");

      if (!response.ok) throw new Error("Failed to fetch Detalle OT periods");

      return response.json();

    },

  });



  // Fetch Detalle OT data

  const { data: detalleOtData = [], isLoading: isDetalleOtLoading } = useQuery<any[]>({

    queryKey: ["detalle-ot", mesContable],

    queryFn: async () => {

      if (!mesContable) return [];

      const response = await fetch(`/api/detalle-ot?mesContable=${mesContable}`);

      if (!response.ok) throw new Error("Failed to fetch Detalle OT data");

      return response.json();

    },

    enabled: !!mesContable,
  });

  const { data: mesActualData, isLoading: isMesActualLoading } = useQuery({
    queryKey: ["kpi-mes-actual", mesActualEquipmentType],
    queryFn: async () => {
      const url = new URL("/api/supervisor/kpi-mes-actual", window.location.origin);
      if (mesActualEquipmentType && mesActualEquipmentType !== "TODOS") {
        url.searchParams.append("equipmentType", mesActualEquipmentType);
      }
      const response = await fetch(url.toString());
      return response.json();
    },
    enabled: activeTab === 'mes',
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

    const formattedData = filteredData.map(row => {

      const newRow: any = {};

      Object.entries(row).forEach(([key, val]) => {

        newRow[key] = formatDecimal(val);

      });

      return newRow;

    });

    const ws = XLSX.utils.json_to_sheet(formattedData);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "KPI Data");

    XLSX.writeFile(wb, `KPI_${periodo || "all"}.xlsx`);

  };



  const handleCopyDetalleOt = () => {

    const filteredDetalleOt = detalleOtData.filter((item) =>

      Object.values(item).some(

        (val) =>

          val &&

          val.toString().toLowerCase().includes(detalleOtSearchTerm.toLowerCase())

      )

    ).sort((a, b) => {

      if (!detalleOtSortConfig.key) return 0;

      const valA = parseValue(a[detalleOtSortConfig.key]);

      const valB = parseValue(b[detalleOtSortConfig.key]);

      if (valA < valB) return detalleOtSortConfig.direction === 'asc' ? -1 : 1;

      if (valA > valB) return detalleOtSortConfig.direction === 'asc' ? 1 : -1;

      return 0;

    });



    if (filteredDetalleOt.length === 0) {

      toast({

        title: "Sin datos",

        description: "No hay datos para copiar",

        variant: "destructive"

      });

      return;

    }



    // Get headers

    const headers = Object.keys(filteredDetalleOt[0]);

    const headerRow = headers.map(h => h.replace(/_/g, ' ').toUpperCase()).join('\t');



    // Get rows

    const rows = filteredDetalleOt.map(row =>

      headers.map(header => {

        const val = row[header];

        return val !== null && val !== undefined ? val.toString().replace(/\t/g, ' ') : '';

      }).join('\t')

    );



    const content = [headerRow, ...rows].join('\n');

    navigator.clipboard.writeText(content).then(() => {

      toast({

        title: "Copiado",

        description: `${filteredDetalleOt.length} registros copiados al portapapeles`,

      });

    }).catch(err => {

      console.error('Error al copiar: ', err);

      toast({

        title: "Error",

        description: "No se pudo copiar al portapapeles",

        variant: "destructive"

      });

    });

  };



  return (

    <SupervisorLayout>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

        {/* Header Section */}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">

                Gestión de Producción

              </h1>

              <p className="text-slate-500 dark:text-slate-400 mt-1">

                Dashboard de rendimiento y comisiones de técnicos

              </p>

            </div>

          </div>



          {/* Tabs Navigation */}

          <div className="flex gap-1 mt-8 border-b border-slate-200 dark:border-white/10">

            <button

              onClick={() => setActiveTab('monitor')}

              className={cn(

                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",

                activeTab === 'monitor'

                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border-b-2 border-blue-600 dark:border-blue-400"

                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"

              )}

            >

              <LayoutDashboard className="w-4 h-4 inline-block mr-2" />

              Monitor Diario

            </button>

            <button

              onClick={() => setActiveTab('mes')}

              className={cn(

                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",

                activeTab === 'mes'

                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 border-b-2 border-purple-600 dark:border-purple-400"

                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"

              )}

            >

              <TrendingUp className="w-4 h-4 inline-block mr-2" />

              Mes Actual

            </button>

            <button

              onClick={() => setActiveTab('benchmark')}

              className={cn(

                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",

                activeTab === 'benchmark'

                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-slate-800 border-b-2 border-green-600 dark:border-green-400"

                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"

              )}

            >

              <Award className="w-4 h-4 inline-block mr-2" />

              Benchmark

            </button>

            <button

              onClick={() => setActiveTab('comisiones')}

              className={cn(

                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",

                activeTab === 'comisiones'

                  ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-slate-800 border-b-2 border-orange-600 dark:border-orange-400"

                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"

              )}

            >

              <Zap className="w-4 h-4 inline-block mr-2" />

              Comisiones

            </button>

            <button

              onClick={() => setActiveTab('detalleOt')}

              className={cn(

                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",

                activeTab === 'detalleOt'

                  ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-slate-800 border-b-2 border-teal-600 dark:border-teal-400"

                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"

              )}

            >

              <Zap className="w-4 h-4 inline-block mr-2" />

              Detalle OT

            </button>

          </div>

        </div>



        {activeTab === 'monitor' && (

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Fila 1: Gauge y Tarjetas de Info */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Columna Izquierda: Stacked Info Cards */}

              <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[240px]">

                {/* Fecha de Integración */}

                <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center text-center">

                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-1">

                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />

                  </div>

                  <h3 className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">

                    Fecha de Integración

                  </h3>

                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">

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

                  <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">

                    {dashboardData?.supervisorStats?.reduce((acc: number, curr: any) => acc + (curr.technicianCount || 0), 0) || 0}

                  </div>

                </div>



                {/* Total PX0 Technicians */}

                <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center text-center">

                  <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-full mb-1">

                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />

                  </div>

                  <h3 className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">

                    Técnicos PX0

                  </h3>

                  <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">

                    {dashboardData?.supervisorStats?.reduce((acc: number, curr: any) => acc + (curr.px0Count || 0), 0) || 0}

                  </div>

                </div>



                {/* Total Orders Gestionadas */}

                <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center text-center">

                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-full mb-1">

                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />

                  </div>

                  <h3 className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">

                    Total Órdenes

                  </h3>

                  <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">

                    {dashboardData?.statusDistribution?.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) || 0}

                  </div>

                </div>

              </div>



              {/* Columna Derecha: Global Completion Gauge */}

              <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm p-2 justify-center items-center h-[240px]">

                <GaugeChart
                  value={dashboardData?.globalCompletionRate || 0}
                  label="Finalización Global"
                  size={220}
                  color="#22c55e"
                  showPercentage={true}
                />

              </div>

            </div>



            {/* Fila 2: Gráficos de Torta */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Pie Chart: Activity Type */}

              {isDashboardLoading ? (
                <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">
                    Distribución tipo de actividad
                  </h3>
                  <div className="flex-1">
                    <PieChart
                      title=""
                      data={dashboardData?.activityTypeCounts || []}
                      height={260}
                    />
                  </div>
                </div>
              )}



              {/* Pie Chart: Status Distribution */}

              {isDashboardLoading ? (
                <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">
                    % Distribución por Estado
                  </h3>
                  <div className="flex-1">
                    <PieChart
                      title=""
                      data={dashboardData?.statusDistribution || []}
                      height={260}
                    />
                  </div>
                </div>
              )}



              {/* Pie Chart: Closing Code */}

              {isDashboardLoading ? (
                <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                  <div className="text-slate-500 dark:text-slate-400 text-sm">Cargando datos...</div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">
                    Motivos de no finalización
                  </h3>
                  <div className="flex-1">
                    <PieChart
                      title=""
                      data={dashboardData?.closingCodeDistribution || []}
                      height={260}
                    />
                  </div>
                </div>
              )}

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

                  <div className="grid grid-cols-2 gap-3 p-4 bg-white dark:bg-slate-900/50">
                    <KpiCard
                      value={supervisor.technicianCount || 0}
                      label="Técnicos Operativos"
                      variant="default"
                      className="p-4 shadow-none border-slate-100 dark:border-slate-800 h-[100px]"
                    />
                    <KpiCard
                      value={supervisor.px0Count || 0}
                      label="Q tecnicos PX0"
                      variant="danger"
                      className="p-4 shadow-none border-slate-100 dark:border-slate-800 h-[100px]"
                    />
                  </div>

                  <div className="p-4 flex justify-center items-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[160px]">
                    <GaugeChart
                      value={supervisor.completionRate || 0}
                      label="Eficiencia"
                      size={140}
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

                      <div key={supervisor} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-[624px] flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-700 pb-2">
                          {supervisor}
                        </h3>
                        <div className="flex-1">
                          <StackedBarChart
                            title=""
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
                            height={542}
                          />
                        </div>
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

                      <div key={supervisor} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-[524px] flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-700 pb-2">
                          {supervisor}
                        </h3>
                        <div className="flex-1">
                          <StackedBarChart
                            title=""
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
                            height={440}
                          />
                        </div>
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

                      <div key={supervisor} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-[460px] flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-700 pb-2">
                          {supervisor}
                        </h3>
                        <div className="flex-1">
                          <StackedBarChart
                            title=""
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
                            height={380}
                          />
                        </div>
                      </div>

                    );

                  })

                )}

              </div>

            </div>

          </div>

        )}



        {activeTab === 'comisiones' && (

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

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



            {/* Top 10 Commissions Chart */}

            {periodo && kpiData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6 flex flex-col h-[500px] w-full lg:w-1/2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                  Top 10 Técnicos por Comisión FTTH (Ponderada vs Real)
                </h3>
                <div className="flex-1">
                  <StackedBarChart
                    title=""
                    data={[...kpiData]
                      .map(item => ({
                        ...item,
                        parsedFtth: parseValue(item.Comision_FTTH) as number || 0,
                        parsedFtthPond: parseValue(item.Comision_FTTH_Ponderada) as number || 0
                      }))
                      .filter(item => item.parsedFtth > 0 || item.parsedFtthPond > 0)
                      .sort((a, b) => b.parsedFtthPond - a.parsedFtthPond)
                      .slice(0, 10)
                      .map(item => ({
                        name: item.NombreTecnico || "Sin Nombre",
                        ftth: item.parsedFtth,
                        ftthPond: item.parsedFtthPond
                      }))}
                    xAxisKey="name"
                    stacked={false}
                    bars={[
                      { key: "ftth", name: "Comisión FTTH", color: "#3b82f6" },
                      { key: "ftthPond", name: "Comisión FTTH Ponderada", color: "#8b5cf6" }
                    ]}
                    height={380}
                    yAxisWidth={180}
                    showBarLabels={true}
                    valueFormatter={(val) => `$${formatDecimal(val)}`}
                  />
                </div>
              </div>
            )}



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

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_HFC')}>

                      <div className="flex items-center justify-end gap-2">Comisión HFC <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_FTTH')}>

                      <div className="flex items-center justify-end gap-2">Comisión FTTH <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_HFC_Ponderada')}>

                      <div className="flex items-center justify-end gap-2">Comisión HFC Pond. <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Comision_FTTH_Ponderada')}>

                      <div className="flex items-center justify-end gap-2">Comisión FTTH Pond. <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('modelo_turno')}>

                      <div className="flex items-center gap-2">Modelo Turno <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('categoria')}>

                      <div className="flex items-center gap-2">Categoría <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('Original_RUT_TECNICO')}>

                      <div className="flex items-center gap-2">RUT Técnico <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('DIAS_BASE_DRIVE')}>

                      <div className="flex items-center justify-end gap-2">Días Base Drive <ArrowUpDown className="h-4 w-4" /></div>

                    </TableHead>

                    <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => handleSort('SUM_OPERATIVO')}>

                      <div className="flex items-center justify-end gap-2">Sum Operativo <ArrowUpDown className="h-4 w-4" /></div>

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

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Comision_HFC)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Comision_FTTH)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Comision_HFC_Ponderada)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Comision_FTTH_Ponderada)}</TableCell>

                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.modelo_turno}</TableCell>

                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.categoria}</TableCell>

                        <TableCell className="whitespace-nowrap text-slate-700 dark:text-slate-300">{row.Original_RUT_TECNICO}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.DIAS_BASE_DRIVE)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.SUM_OPERATIVO)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Puntos)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Promedio_HFC)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Q_RGU)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Promedio_RGU)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row._CumplimientoProduccionHFC)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row._cumplimientoProduccionRGU)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Ratio_CalidadHFC)}</TableCell>

                        <TableCell className="whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{formatDecimal(row.Ratio_CalidadFTTH)}</TableCell>

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

          </div>

        )}



        {activeTab === 'benchmark' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center min-h-[500px] flex flex-col items-center justify-center overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src="/under-construction.png"
                  alt="En construcción"
                  className="relative rounded-2xl shadow-2xl w-full max-w-[320px] mx-auto transform transition duration-500 hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-500 dark:text-emerald-400 mb-2">
                  <Construction className="w-5 h-5 animate-bounce" />
                  <span className="text-sm font-bold uppercase tracking-widest">Próximamente</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">Benchmark</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  Estamos preparando comparativas avanzadas de rendimiento para analizar el mercado.
                </p>
              </div>
              <div className="pt-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-sm font-medium">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  En construcción
                </div>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'mes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera y Filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-start gap-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análisis de Operación Mensual</h2>
                <p className="text-slate-500">Métricas acumuladas del mes actual en tiempo real</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setMesActualEquipmentType('TODOS')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    mesActualEquipmentType === 'TODOS'
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Todos
                </button>
                <button
                  onClick={() => setMesActualEquipmentType('RESIDENCIAL')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    mesActualEquipmentType === 'RESIDENCIAL'
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Residencial
                </button>
                <button
                  onClick={() => setMesActualEquipmentType('SME')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    mesActualEquipmentType === 'SME'
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  SME
                </button>
              </div>
            </div>

            {isMesActualLoading ? (
              <div className="space-y-8">
                {/* Skeleton de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-24" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-xl" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>

                {/* Skeleton de Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-[420px]">
                    <div className="flex items-center justify-between mb-8">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-[280px] w-full" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-[420px]">
                    <div className="flex items-center justify-between mb-8">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <div className="flex items-center justify-center pt-10">
                      <Skeleton className="h-56 w-56 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Skeleton de Tablas/Gráficos Inferiores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-[450px]">
                    <Skeleton className="h-6 w-56 mb-8" />
                    <Skeleton className="h-[320px] w-full" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-[450px]">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 items-center border-b pb-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-5 flex-1" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (mesActualData && mesActualData.summary) ? (
              <>
                {/* Resumen Ejecutivo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KpiCard
                    title="Total RGU Mensual"
                    value={mesActualData.summary.totalRGU.toLocaleString()}
                    icon={<Zap className="w-5 h-5" />}
                    trend={{ value: mesActualData.summary.rguPerActivity, label: "RGU/Actividad", isPositive: true }}
                    variant="indigo"
                  />
                  <KpiCard
                    title="Eficiencia Global"
                    value={`${mesActualData.summary.avgCompletionRate}%`}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    trend={{
                      value: mesActualData.summary.totalActivities.toLocaleString(),
                      label: "Actividades Totales",
                      isPositive: true
                    }}
                    description={`${mesActualData.summary.completedActivities.toLocaleString()} Completadas | ${mesActualData.summary.notCompletedActivities.toLocaleString()} No Realizadas`}
                    variant="emerald"
                  />
                  <KpiCard
                    title="Técnicos Activos"
                    value={mesActualData.summary.activeTechnicians.toString()}
                    icon={<Users className="w-5 h-5" />}
                    trend={{ value: mesActualData.summary.workingDays, label: "Días Operativos", isPositive: true }}
                    description={`Residencial: ${mesActualData.summary.techResidencial} | SME: ${mesActualData.summary.techSme}`}
                    variant="blue"
                  />
                </div>

                {/* Gráfico de Tendencia de Producción RGU */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tendencia de Producción RGU</h3>
                      <p className="text-sm text-slate-500">Evolución diaria del mes en curso con técnicos distintos por día</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="h-[322px] w-full mt-2">
                    <BarChart
                      title="Producción Diaria"
                      data={mesActualData.dailyTrend.map((d: any) => ({
                        name: new Date(d.date).getUTCDate().toString(),
                        rgu: d.rgu,
                        technicians: d.technicians
                      }))}
                      bars={[
                        { key: "rgu", name: "Producción RGU", color: "#6366f1", yAxisId: "left" },
                        { key: "technicians", name: "Técnicos Distintos/Día", color: "#10b981", yAxisId: "right" }
                      ]}
                      height={322}
                      secondaryYAxis={{ label: "Técnicos" }}
                      showBarLabels={true}
                    />
                  </div>
                </div>

                {/* Gráfico de Evolutivo Diario por Zona - Multi-Chart Facetado */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Evolutivo Diario por Zona</h3>
                      <p className="text-sm text-slate-500">Producción RGU distribuida por zona de facturación</p>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  {/* Grid de gráficos facetados por zona */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                    {(() => {
                      // Definir colores específicos por zona
                      const zoneColors: Record<string, string> = {
                        'ZCEN': '#6366f1', // Indigo
                        'ZMSU': '#f59e0b', // Amber
                        'ZMOR': '#10b981', // Emerald
                        'ZMPO': '#ec4899', // Pink
                        'ZNOR': '#8b5cf6', // Purple
                        'ZSUR': '#06b6d4', // Cyan
                      };

                      // Agrupar datos por zona
                      const zoneData: Record<string, { date: string; rgu: number; technicians: number }[]> = {};
                      let zoneTotals: Record<string, number> = {};

                      mesActualData.dailyTrendByZone?.forEach((item: any) => {
                        const zona = item.zona;
                        if (!zoneData[zona]) {
                          zoneData[zona] = [];
                          zoneTotals[zona] = 0;
                        }
                        const day = new Date(item.date).getUTCDate().toString();
                        zoneData[zona].push({
                          date: day,
                          rgu: item.rgu,
                          technicians: item.technicians || 0
                        });
                        zoneTotals[zona] += item.rgu;
                      });

                      // Ordenar zonas por total RGU (descendente)
                      const sortedZones = Object.keys(zoneData).sort((a, b) =>
                        zoneTotals[b] - zoneTotals[a]
                      );

                      return sortedZones.map((zona) => {
                        const data = zoneData[zona];
                        const totalRGU = zoneTotals[zona];
                        const avgRGU = Math.round(totalRGU / data.length);
                        const color = zoneColors[zona] || '#64748b'; // Slate como fallback

                        return (
                          <div
                            key={zona}
                            className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                          >
                            {/* Header con nombre y promedio */}
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                {zona}
                              </h4>
                              <div
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{
                                  backgroundColor: `${color}20`,
                                  color: color
                                }}
                              >
                                {avgRGU} RGU/día
                              </div>
                            </div>

                            {/* Mini LineChart */}
                            <div className="h-[159px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <RLineChart
                                  data={data}
                                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                    strokeOpacity={0.3}
                                  />
                                  <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    yAxisId="left"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    width={30}
                                  />
                                  <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#f59e0b"
                                    fontSize={9}
                                    tickLine={false}
                                    width={25}
                                    domain={[0, 'auto']}
                                    allowDecimals={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      fontSize: '12px'
                                    }}
                                    labelFormatter={(value) => `Día ${value}`}
                                    formatter={(value: any, name: string) => {
                                      if (name === 'rgu') return [`${value} RGU`, 'Producción'];
                                      if (name === 'technicians') return [`${value} Téc.`, 'Técnicos'];
                                      return [value, name];
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="rgu"
                                    stroke={color}
                                    strokeWidth={2}
                                    dot={{ fill: color, r: 3 }}
                                    activeDot={{ r: 5 }}
                                    yAxisId="left"
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="technicians"
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    dot={{ fill: "#f59e0b", r: 2 }}
                                    activeDot={{ r: 4 }}
                                    yAxisId="right"
                                    strokeDasharray="3 3"
                                  />
                                </RLineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Footer con total */}
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Total: <span className="font-bold text-slate-900 dark:text-white">{totalRGU} RGU</span>
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Comparativa Supervisores y Tipos de Equipo */}
                {/* Rendimiento por Supervisor */}
                {/* Detalle Diario por Técnico (Matriz) */}

                {/* Comparativa Técnicos: Mejores vs Peores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 10 Técnicos (RGU) */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Top 10 Técnicos (Mejor RGU)
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px] text-xs font-bold">Rank</TableHead>
                            <TableHead className="text-xs font-bold">Técnico</TableHead>
                            <TableHead className="text-right text-xs font-bold">Días</TableHead>
                            <TableHead className="text-right text-xs font-bold">RGU/Día</TableHead>
                            <TableHead className="text-right text-xs font-bold">Total RGU</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mesActualData.topPerformers.map((t: any) => (
                            <TableRow key={t.rut} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <TableCell className="font-bold text-purple-600 text-xs">#{t.rank || mesActualData.topPerformers.indexOf(t) + 1}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="font-medium text-slate-900 dark:text-white text-xs">{t.name}</div>
                                  <div className="text-xs text-slate-500 uppercase">{t.supervisor}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium text-xs">{t.daysWorked}</TableCell>
                              <TableCell className="text-right font-medium text-xs">{t.rguPerDay}</TableCell>
                              <TableCell className="text-right font-bold text-slate-900 dark:text-white text-xs">{t.totalRGU}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Top 10 Técnicos (Menor RGU) */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      Top 10 Técnicos (Menor RGU)
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px] text-xs font-bold">Rank</TableHead>
                            <TableHead className="text-xs font-bold">Técnico</TableHead>
                            <TableHead className="text-right text-xs font-bold">Días</TableHead>
                            <TableHead className="text-right text-xs font-bold">RGU/Día</TableHead>
                            <TableHead className="text-right text-xs font-bold">Total RGU</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mesActualData.lowPerformers.slice(0, 10).map((t: any, index: number) => (
                            <TableRow key={t.rut} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <TableCell className="font-bold text-slate-400 text-xs">#{index + 1}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="font-medium text-slate-900 dark:text-white text-xs">{t.name}</div>
                                  <div className="text-xs text-slate-500 uppercase">{t.supervisor}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium text-xs">{t.daysWorked}</TableCell>
                              <TableCell className="text-right font-medium text-xs">{t.rguPerDay}</TableCell>
                              <TableCell className="text-right font-bold text-slate-900 dark:text-white text-xs">{t.totalRGU}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Detalle Diario por Técnico (Matriz) */}
                <TechnicianDailyMatrix
                  data={mesActualData.technicianDailyDetail || []}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sin datos disponibles</h3>
                <p className="text-slate-500">No se encontraron registros de KPI para el mes actual.</p>
              </div>
            )}
          </div>
        )}



        {activeTab === 'detalleOt' && (

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Filters */}

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Mes Contable Filter */}

                <div>

                  <Select value={mesContable} onValueChange={setMesContable}>

                    <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">

                      <SelectValue placeholder="Seleccionar Mes Contable" />

                    </SelectTrigger>

                    <SelectContent>

                      {detalleOtPeriods.map((p) => (

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

                    value={detalleOtSearchTerm}

                    onChange={(e) => setDetalleOtSearchTerm(e.target.value)}

                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500"

                  />

                </div>



                {/* Actions */}

                <div className="flex gap-2">

                  <Button

                    variant="outline"

                    className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"

                    onClick={() => {

                      setDetalleOtSearchTerm("");

                      setMesContable("");

                    }}

                  >

                    <X className="w-4 h-4" />

                    Limpiar

                  </Button>

                  <Button

                    variant="outline"

                    className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"

                    onClick={handleCopyDetalleOt}

                    disabled={detalleOtData.length === 0}

                  >

                    <Copy className="w-4 h-4" />

                    Copiar Contenido

                  </Button>

                  <Button

                    variant="outline"

                    className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"

                    onClick={() => {

                      const filteredDetalleOt = detalleOtData.filter((item) =>

                        Object.values(item).some(

                          (val) =>

                            val &&

                            val.toString().toLowerCase().includes(detalleOtSearchTerm.toLowerCase())

                        )

                      );

                      const formattedDetalleOt = filteredDetalleOt.map(row => {

                        const newRow: any = {};

                        Object.entries(row).forEach(([key, val]) => {

                          newRow[key] = formatDecimal(val);

                        });

                        return newRow;

                      });

                      const ws = XLSX.utils.json_to_sheet(formattedDetalleOt);

                      const wb = XLSX.utils.book_new();

                      XLSX.utils.book_append_sheet(wb, ws, "Detalle OT");

                      XLSX.writeFile(wb, `Detalle_OT_${mesContable || "all"}.xlsx`);

                    }}

                    disabled={detalleOtData.length === 0}

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

                    {detalleOtData.length > 0 && Object.keys(detalleOtData[0]).map((key) => (

                      <TableHead

                        key={key}

                        className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"

                        onClick={() => {

                          let direction: 'asc' | 'desc' = 'asc';

                          if (detalleOtSortConfig.key === key && detalleOtSortConfig.direction === 'asc') {

                            direction = 'desc';

                          }

                          setDetalleOtSortConfig({ key, direction });

                        }}

                      >

                        <div className="flex items-center gap-2">

                          {key.replace(/_/g, ' ').toUpperCase()}

                          <ArrowUpDown className="h-4 w-4" />

                        </div>

                      </TableHead>

                    ))}

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {isDetalleOtLoading ? (

                    <TableRow>

                      <TableCell colSpan={100} className="h-24 text-center text-slate-600 dark:text-slate-400">

                        Cargando datos...

                      </TableCell>

                    </TableRow>

                  ) : (() => {

                    const filteredDetalleOt = detalleOtData.filter((item) =>

                      Object.values(item).some(

                        (val) =>

                          val &&

                          val.toString().toLowerCase().includes(detalleOtSearchTerm.toLowerCase())

                      )

                    ).sort((a, b) => {

                      if (!detalleOtSortConfig.key) return 0;

                      const valA = parseValue(a[detalleOtSortConfig.key]);

                      const valB = parseValue(b[detalleOtSortConfig.key]);

                      if (valA < valB) return detalleOtSortConfig.direction === 'asc' ? -1 : 1;

                      if (valA > valB) return detalleOtSortConfig.direction === 'asc' ? 1 : -1;

                      return 0;

                    });



                    const paginatedDetalleOt = filteredDetalleOt.slice(

                      (detalleOtCurrentPage - 1) * rowsPerPage,

                      detalleOtCurrentPage * rowsPerPage

                    );



                    const totalDetalleOtPages = Math.ceil(filteredDetalleOt.length / rowsPerPage);



                    return paginatedDetalleOt.length > 0 ? (

                      <>

                        {paginatedDetalleOt.map((row, idx) => (

                          <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700">

                            {Object.values(row).map((val, i) => (

                              <TableCell key={i} className="whitespace-nowrap text-slate-700 dark:text-slate-300">

                                {val !== null && val !== undefined ? formatDecimal(val) : ''}

                              </TableCell>

                            ))}

                          </TableRow>

                        ))}

                      </>

                    ) : (

                      <TableRow>

                        <TableCell colSpan={100} className="h-24 text-center text-slate-500 dark:text-slate-400">

                          {mesContable ? "No se encontraron registros para el mes contable seleccionado" : "Seleccione un mes contable para ver los datos"}

                        </TableCell>

                      </TableRow>

                    );

                  })()}

                </TableBody>

              </Table>

            </div>



            {/* Footer with pagination */}

            {(() => {

              const filteredDetalleOt = detalleOtData.filter((item) =>

                Object.values(item).some(

                  (val) =>

                    val &&

                    val.toString().toLowerCase().includes(detalleOtSearchTerm.toLowerCase())

                )

              );

              const totalDetalleOtPages = Math.ceil(filteredDetalleOt.length / rowsPerPage);



              return filteredDetalleOt.length > 0 ? (

                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-100 dark:bg-slate-800 mt-4 rounded-b-lg">

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-700 dark:text-slate-200">

                      Mostrando <span className="font-semibold">{Math.min((detalleOtCurrentPage - 1) * rowsPerPage + 1, filteredDetalleOt.length)}</span> a{" "}

                      <span className="font-semibold">{Math.min(detalleOtCurrentPage * rowsPerPage, filteredDetalleOt.length)}</span> de{" "}

                      <span className="font-semibold">{filteredDetalleOt.length}</span> registros

                    </p>



                    {totalDetalleOtPages > 1 && (

                      <Pagination>

                        <PaginationContent>

                          <PaginationItem>

                            <PaginationPrevious

                              onClick={() => setDetalleOtCurrentPage(prev => Math.max(1, prev - 1))}

                              className={cn(

                                "cursor-pointer border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",

                                detalleOtCurrentPage === 1 && "pointer-events-none opacity-50"

                              )}

                            />

                          </PaginationItem>



                          {Array.from({ length: Math.min(5, totalDetalleOtPages) }, (_, i) => {

                            let pageNum;

                            if (totalDetalleOtPages <= 5) {

                              pageNum = i + 1;

                            } else if (detalleOtCurrentPage <= 3) {

                              pageNum = i + 1;

                            } else if (detalleOtCurrentPage >= totalDetalleOtPages - 2) {

                              pageNum = totalDetalleOtPages - 4 + i;

                            } else {

                              pageNum = detalleOtCurrentPage - 2 + i;

                            }



                            return (

                              <PaginationItem key={pageNum}>

                                <PaginationLink

                                  onClick={() => setDetalleOtCurrentPage(pageNum)}

                                  isActive={detalleOtCurrentPage === pageNum}

                                  className={cn(

                                    "cursor-pointer border transition-colors",

                                    detalleOtCurrentPage === pageNum

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

                              onClick={() => setDetalleOtCurrentPage(prev => Math.min(totalDetalleOtPages, prev + 1))}

                              className={cn(

                                "cursor-pointer border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",

                                detalleOtCurrentPage === totalDetalleOtPages && "pointer-events-none opacity-50"

                              )}

                            />

                          </PaginationItem>

                        </PaginationContent>

                      </Pagination>

                    )}

                  </div>

                </div>

              ) : null;

            })()}

          </div>

        )}

      </div>

    </SupervisorLayout >

  );

}

