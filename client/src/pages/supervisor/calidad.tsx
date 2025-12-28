import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Download,
    X,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    Calendar,
    TrendingUp,
    Award,
    Zap,
    LayoutDashboard
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function formatPeriod(period: string) {
    if (!period) return "";
    const [year, month] = period.split("-");
    const monthIdx = parseInt(month) - 1;
    return `${MONTH_NAMES[monthIdx]} ${year}`;
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-CL');
    } catch (e) {
        return dateStr;
    }
}

export default function SupervisorCalidad() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "benchmark" | "telqway">("benchmark");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [redFilter, setRedFilter] = useState<string>("all");
    const [supervisorFilter, setSupervisorFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({
        key: 'FECHA_EJECUCION',
        direction: 'desc'
    });
    const rowsPerPage = 15;

    const { data: periods } = useQuery<string[]>({
        queryKey: ["/api/calidad-tqw/periods"],
    });

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriod) {
            setSelectedPeriod(periods[0]);
        }
    }, [periods, selectedPeriod]);

    const { data: qualityData = [], isLoading, error } = useQuery<any[]>({
        queryKey: ["/api/calidad-tqw/data", selectedPeriod],
        enabled: !!selectedPeriod,
    });

    const { data: benchmarkData = [], isLoading: benchmarkLoading } = useQuery<any[]>({
        queryKey: ["/api/benchmark/data"],
    });

    // Debugging logs


    useEffect(() => {
        if (qualityData.length > 0) {
            console.log("Quality Data loaded:", qualityData.length);
        }
        if (error) {
            console.error("Error loading quality data:", error);
        }
    }, [qualityData, error]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        let data = [...qualityData];

        if (statusFilter !== "all") {
            // Ensure specific string comparison for reliability
            data = data.filter(item => String(item.CALIDAD_30) === statusFilter);
        }

        if (redFilter !== "all") {
            data = data.filter(item => item.TIPO_RED_CALCULADO === redFilter);
        }

        if (supervisorFilter !== "all") {
            data = data.filter(item => item.supervisor === supervisorFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        if (sortConfig.key) {
            data.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];

                if (valA === valB) return 0;
                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }

                const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return data;
    }, [qualityData, searchTerm, statusFilter, redFilter, supervisorFilter, sortConfig]);

    const stats = useMemo(() => {
        if (!filteredData.length) return { total: 0, cumple: 0, noCumple: 0, rate: 0 };
        const total = filteredData.length;
        const cumple = filteredData.filter(d => String(d.CALIDAD_30) === '0').length;
        return {
            total,
            cumple,
            noCumple: total - cumple,
            rate: (cumple / total) * 100
        };
    }, [filteredData]);

    // Obtener lista única de supervisores
    const uniqueSupervisors = useMemo(() => {
        const supervisors = new Set<string>();
        qualityData.forEach(item => {
            if (item.supervisor) {
                supervisors.add(item.supervisor);
            }
        });
        return Array.from(supervisors).sort();
    }, [qualityData]);

    // Procesar datos de benchmark para la tabla
    const benchmarkTableData = useMemo(() => {
        if (!benchmarkData || !benchmarkData.length) {
            console.log("No benchmark data to process");
            return { periods: [], companies: [], matrix: {} };
        }

        // Obtener periodos únicos
        const periodsSet = new Set<string>();
        const companiesSet = new Set<string>();

        benchmarkData.forEach(item => {
            // Soporte para mayúsculas y minúsculas de la BD
            const p = item.periodo || item.PERIODO;
            const c = item.tp_desc_empresa || item.TP_DESC_EMPRESA;
            if (p) periodsSet.add(p);
            if (c) companiesSet.add(c);
        });

        const periods = Array.from(periodsSet).sort().reverse().slice(0, 6); // Últimos 6 periodos
        const companies = Array.from(companiesSet).sort();

        // Crear matriz de datos: empresas x periodos
        const matrix: { [key: string]: { [key: string]: number } } = {};

        benchmarkData.forEach(item => {
            const p = item.periodo || item.PERIODO;
            const c = item.tp_desc_empresa || item.TP_DESC_EMPRESA;
            const inc = Number(item.INCUMPLE_CALIDAD || 0);
            const tot = Number(item.Total_actividad || 0);

            const ratio = tot > 0 ? (inc / tot) * 100 : 0;

            if (c) {
                if (!matrix[c]) {
                    matrix[c] = {};
                }
                if (p) matrix[c][p] = ratio;
            }
        });

        console.log("Processed benchmark table data:", { periods, companies });
        return { periods, companies, matrix };
    }, [benchmarkData]);

    // Debugging logs (Moved here to be after benchmarkTableData definition)
    useEffect(() => {
        console.log("Current active tab:", activeTab);
        if (activeTab === "benchmark") {
            console.log("Benchmark data count:", benchmarkData?.length);
            console.log("Benchmark table data:", benchmarkTableData);
        }
    }, [activeTab, benchmarkData, benchmarkTableData]);

    // Datos ficticios para los 3 gráficos de línea
    const chartData1 = useMemo(() => [
        { month: 'Ene', Telqway: 15, EmpresaA: 18, EmpresaB: 12 },
        { month: 'Feb', Telqway: 12, EmpresaA: 16, EmpresaB: 14 },
        { month: 'Mar', Telqway: 10, EmpresaA: 14, EmpresaB: 11 },
        { month: 'Abr', Telqway: 8, EmpresaA: 12, EmpresaB: 10 },
        { month: 'May', Telqway: 7, EmpresaA: 11, EmpresaB: 9 },
        { month: 'Jun', Telqway: 6, EmpresaA: 10, EmpresaB: 8 },
    ], []);

    const chartData2 = useMemo(() => [
        { month: 'Ene', Telqway: 92, EmpresaA: 88, EmpresaB: 90 },
        { month: 'Feb', Telqway: 94, EmpresaA: 89, EmpresaB: 91 },
        { month: 'Mar', Telqway: 95, EmpresaA: 90, EmpresaB: 92 },
        { month: 'Abr', Telqway: 96, EmpresaA: 91, EmpresaB: 93 },
        { month: 'May', Telqway: 97, EmpresaA: 92, EmpresaB: 94 },
        { month: 'Jun', Telqway: 98, EmpresaA: 93, EmpresaB: 95 },
    ], []);

    const chartData3 = useMemo(() => [
        { month: 'Ene', Telqway: 450, EmpresaA: 420, EmpresaB: 380 },
        { month: 'Feb', Telqway: 480, EmpresaA: 430, EmpresaB: 400 },
        { month: 'Mar', Telqway: 520, EmpresaA: 450, EmpresaB: 420 },
        { month: 'Abr', Telqway: 580, EmpresaA: 480, EmpresaB: 450 },
        { month: 'May', Telqway: 620, EmpresaA: 500, EmpresaB: 480 },
        { month: 'Jun', Telqway: 680, EmpresaA: 530, EmpresaB: 510 },
    ], []);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleExport = () => {
        if (!filteredData.length) return;

        // Crear cabeceras
        const headers = [
            'Calidad30',
            'Red',
            'Nombre Short',
            'Supervisor',
            'Actividad',
            'Comuna',
            'ID Actividad',
            'Fecha Ejecución',
            'Descripción Actividad',
            'Descripción Cierre',
            'ID Actividad 2',
            'Descripción Actividad 2',
            'Fecha Ejecución 2',
            'Descripción Cierre 2'
        ];

        // Crear filas de datos
        const rows = filteredData.map(row => [
            String(row.CALIDAD_30) === '0' ? 'CUMPLE' : 'NO CUMPLE',
            row.TIPO_RED_CALCULADO || '',
            row.Nombre_short || '',
            row.supervisor || '',
            row.ACTIVIDAD || '',
            row.Comuna || '',
            row.id_actividad || '',
            formatDate(row.FECHA_EJECUCION),
            row.descripcion_actividad || '',
            row.DESCRIPCION_CIERRE || '',
            row.id_actividad_2 || '',
            row.descripcion_actividad_2 || '',
            formatDate(row.fecha_ejecucion_2),
            row.DESCRIPCION_CIERRE_2 || ''
        ]);

        // Combinar cabeceras y filas
        const wsData = [headers, ...rows];

        // Crear worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Configurar ancho de columnas
        ws['!cols'] = [
            { wch: 12 },  // Calidad30
            { wch: 10 },  // Red
            { wch: 20 },  // Nombre Short
            { wch: 20 },  // Supervisor
            { wch: 30 },  // Actividad
            { wch: 20 },  // Comuna
            { wch: 18 },  // ID Actividad
            { wch: 15 },  // Fecha Ejecución
            { wch: 40 },  // Descripción Actividad
            { wch: 50 },  // Descripción Cierre
            { wch: 18 },  // ID Actividad 2
            { wch: 40 },  // Descripción Actividad 2
            { wch: 15 },  // Fecha Ejecución 2
            { wch: 50 }   // Descripción Cierre 2
        ];

        // Crear workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Calidad");

        // Generar nombre de archivo
        const fileName = `Reporte_Calidad_${selectedPeriod.substring(0, 7)}.xlsx`;

        // Escribir archivo
        XLSX.writeFile(wb, fileName);
    };

    return (
        <SupervisorLayout>
            <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

                {/* Dark Mode Background Effects */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden dark:block">
                    <div className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-[40%] -left-[20%] w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

                    {/* Header Section */}
                    <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 dark:bg-clip-text">
                                    Gestión de Calidad
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Monitor de cumplimiento y auditoría técnica
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger className="w-[180px] bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                                        <SelectValue placeholder="Periodo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        {periods?.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {formatPeriod(p)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleExport}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 dark:shadow-emerald-500/20"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 mt-8 border-b border-slate-200 dark:border-white/10">
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={cn(
                                    "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                    activeTab === "dashboard"
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-b-2 border-blue-600 dark:border-blue-400"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab("benchmark")}
                                className={cn(
                                    "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                    activeTab === "benchmark"
                                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-b-2 border-purple-600 dark:border-purple-400"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <Award className="w-4 h-4 inline-block mr-2" />
                                Benchmark
                            </button>
                            <button
                                onClick={() => setActiveTab("telqway")}
                                className={cn(
                                    "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                    activeTab === "telqway"
                                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-b-2 border-orange-600 dark:border-orange-400"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <Zap className="w-4 h-4 inline-block mr-2" />
                                Telqway
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Dashboard View (High Level Summary) */}
                        {activeTab === "dashboard" && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resumen General</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        Aquí se mostrará un resumen ejecutivo de los indicadores de calidad y rendimiento global.
                                        La información detallada se encuentra en la pestaña Telqway.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Benchmark Tab */}
                        {activeTab === "benchmark" && (
                            <div className="space-y-6">
                                {/* Gráficos */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Gráfico 1: Incumplimiento */}
                                    <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">% Incumplimiento</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData1}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="Telqway" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaA" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaB" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Gráfico 2: Cumplimiento */}
                                    <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">% Cumplimiento</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData2}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="Telqway" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaA" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaB" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Gráfico 3: Volumen */}
                                    <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Volumen de Actividades</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData3}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="Telqway" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaA" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                                <Line type="monotone" dataKey="EmpresaB" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Tabla de Benchmark */}
                                <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-200 dark:border-white/10">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Matriz de Incumplimiento por Empresa</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Porcentaje de incumplimiento de calidad (Incumple / Total × 100)
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto p-6">
                                        {benchmarkLoading ? (
                                            <div className="flex flex-col items-center justify-center gap-3 py-12">
                                                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                                <span className="text-slate-500 text-sm">Cargando datos...</span>
                                            </div>
                                        ) : benchmarkTableData.periods.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles para benchmark</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50 dark:bg-white/5">
                                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Empresa</TableHead>
                                                        {benchmarkTableData.periods.map((period) => {
                                                            // Intentar formatear si viene como YYYYMM
                                                            let displayPeriod = period;
                                                            if (/^\d{6}$/.test(period)) {
                                                                const year = period.substring(0, 4);
                                                                const month = parseInt(period.substring(4, 6)) - 1;
                                                                const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                                                                if (MONTHS[month]) displayPeriod = `${MONTHS[month]} ${year}`;
                                                            }
                                                            return (
                                                                <TableHead key={period} className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                                                    {displayPeriod}
                                                                </TableHead>
                                                            );
                                                        })}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {benchmarkTableData.companies.map((company) => (
                                                        <TableRow key={company} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                            <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                                                                {company}
                                                            </TableCell>
                                                            {benchmarkTableData.periods.map((period) => {
                                                                const value = benchmarkTableData.matrix[company]?.[period];
                                                                const displayValue = value !== undefined ? value.toFixed(1) : '-';
                                                                return (
                                                                    <TableCell key={period} className="text-center">
                                                                        <span className={cn(
                                                                            "px-2 py-1 rounded text-xs font-medium",
                                                                            value === undefined
                                                                                ? "text-slate-400"
                                                                                : value < 5
                                                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                    : value < 10
                                                                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                        )}>
                                                                            {displayValue}%
                                                                        </span>
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Telqway Tab (Detailed Data) */}
                        {activeTab === "telqway" && (
                            <div className="space-y-6">
                                {/* KPI Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { title: "Evaluaciones", value: stats.total, icon: Calendar, color: "blue" },
                                        { title: "Cumplimiento", value: stats.cumple, icon: CheckCircle2, color: "green" },
                                        { title: "Incumplimiento", value: stats.noCumple, icon: AlertCircle, color: "red" },
                                        { title: "Eficiencia", value: `${stats.rate.toFixed(1)}%`, icon: TrendingUp, color: "purple" },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/20 rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                                            <div className={cn("absolute right-0 top-0 w-24 h-24  opacity-5 rotate-12 -mr-6 -mt-6 transition-transform group-hover:scale-110", `bg-${stat.color}-500`)}></div>
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                                    <h3 className={cn("text-2xl font-bold mt-1",
                                                        `text-${stat.color}-600 dark:text-${stat.color}-400`
                                                    )}>
                                                        {stat.value}
                                                    </h3>
                                                </div>
                                                <div className={cn("p-2 rounded-lg",
                                                    `bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`
                                                )}>
                                                    <stat.icon className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Data Table */}
                                <div className="bg-white dark:backdrop-blur-xl dark:bg-slate-900/10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">

                                    {/* Filters Toolbar */}
                                    <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                                <div className="relative flex-1 max-w-md">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Buscar por pedido, técnico, comuna..."
                                                        value={searchTerm}
                                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                        className="pl-10 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                                                    />
                                                </div>
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger className="w-[140px] bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                                                        <SelectValue placeholder="Estado" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Estado: Todos</SelectItem>
                                                        <SelectItem value="0">Cumple</SelectItem>
                                                        <SelectItem value="1">No Cumple</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select value={redFilter} onValueChange={setRedFilter}>
                                                    <SelectTrigger className="w-[140px] bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                                                        <SelectValue placeholder="Red" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Red: Todas</SelectItem>
                                                        <SelectItem value="FTTH">FTTH</SelectItem>
                                                        <SelectItem value="HFC">HFC</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                                                    <SelectTrigger className="w-[140px] bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                                                        <SelectValue placeholder="Supervisor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Sup: Todos</SelectItem>
                                                        {uniqueSupervisors.map((sup) => (
                                                            <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {(searchTerm || statusFilter !== "all" || redFilter !== "all" || supervisorFilter !== "all") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setRedFilter("all"); setSupervisorFilter("all"); }}
                                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                                    <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('CALIDAD_30')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Calidad30 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('TIPO_RED_CALCULADO')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Red <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('Nombre_short')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Nombre Short <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('supervisor')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Supervisor <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('ACTIVIDAD')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Actividad <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('Comuna')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Comuna <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('id_actividad')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            ID Actividad <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('FECHA_EJECUCION')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Fecha Ejec. <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('descripcion_actividad')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Desc. Actividad <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('DESCRIPCION_CIERRE')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Desc. Cierre <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('id_actividad_2')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            ID Act. 2 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('descripcion_actividad_2')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Desc. Act. 2 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('fecha_ejecucion_2')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Fecha Ejec. 2 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('DESCRIPCION_CIERRE_2')}>
                                                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            Desc. Cierre 2 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={15} className="h-48 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-3">
                                                                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                                                <span className="text-slate-500 text-sm">Cargando registros...</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : paginatedData.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={15} className="h-48 text-center text-slate-500">
                                                            No se encontraron registros para los filtros seleccionados
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedData.map((row, idx) => (
                                                        <TableRow
                                                            key={idx}
                                                            className="group hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5 transition-colors"
                                                        >
                                                            <TableCell>
                                                                {String(row.CALIDAD_30) === '0' ? (
                                                                    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30 shadow-none hover:bg-green-100">
                                                                        CUMPLE
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 shadow-none hover:bg-red-100">
                                                                        NO CUMPLE
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className={cn("text-xs font-semibold shadow-none",
                                                                    row.TIPO_RED_CALCULADO === 'FTTH'
                                                                        ? "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/30"
                                                                        : "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-500/10 dark:border-blue-500/30"
                                                                )}>
                                                                    {row.TIPO_RED_CALCULADO}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                {row.Nombre_short || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                {row.supervisor || '-'}
                                                            </TableCell>
                                                            <TableCell className="max-w-[120px]">
                                                                <div className="truncate text-sm text-slate-600 dark:text-slate-300" title={row.ACTIVIDAD}>
                                                                    {row.ACTIVIDAD}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                                                                {row.Comuna}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                                                {row.id_actividad || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                                                                {formatDate(row.FECHA_EJECUCION)}
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="truncate text-xs text-slate-600 dark:text-slate-300" title={row.descripcion_actividad}>
                                                                    {row.descripcion_actividad || '-'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="truncate text-xs text-slate-500 dark:text-slate-400 italic" title={row.DESCRIPCION_CIERRE}>
                                                                    {row.DESCRIPCION_CIERRE}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                                                {row.id_actividad_2 || '-'}
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="truncate text-xs text-slate-600 dark:text-slate-300" title={row.descripcion_actividad_2}>
                                                                    {row.descripcion_actividad_2 || '-'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                                                                {formatDate(row.fecha_ejecucion_2)}
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="truncate text-xs text-slate-500 dark:text-slate-400 italic" title={row.DESCRIPCION_CIERRE_2}>
                                                                    {row.DESCRIPCION_CIERRE_2 || '-'}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Mostrando <span className="font-semibold text-slate-900 dark:text-slate-200">{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> de <span className="font-semibold text-slate-900 dark:text-slate-200">{filteredData.length}</span>
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                                            >
                                                Anterior
                                            </Button>
                                            <div className="flex items-center px-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Página {currentPage} de {Math.max(1, totalPages)}
                                                </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === totalPages || totalPages === 0}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SupervisorLayout>
    );
}
