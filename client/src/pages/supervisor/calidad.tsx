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
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    Activity,
    CheckCircle,
    AlertTriangle,
    Clock,
    Construction
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDecimal } from "@/lib/utils";
import * as XLSX from "xlsx";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from "recharts";

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

        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        return dateStr;
    }
}

export default function SupervisorCalidad() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "benchmark" | "cubo_datos" | "telqway">("benchmark");
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
    const [benchmarkSearchTerm, setBenchmarkSearchTerm] = useState("");
    const [benchmarkSortConfig, setBenchmarkSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc'
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
        let data = qualityData.map(item => {
            let diff = item.DIFERENCIA_DIAS != null ? parseInt(item.DIFERENCIA_DIAS) : null;

            // Si el campo de la BD es nulo, intentamos calcularlo manualmente
            if (diff === null && item.FECHA_EJECUCION && item.fecha_ejecucion_2) {
                try {
                    // Parsear DD-MM-YYYY HH:mm
                    const parseDate = (dateStr: string) => {
                        if (!dateStr) return new Date(NaN);
                        if (dateStr.includes('-') && dateStr.indexOf('-') < 4) {
                            const [datePart, timePart] = dateStr.split(' ');
                            const [day, month, year] = datePart.split('-');
                            return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
                        }
                        return new Date(dateStr);
                    };

                    const d1 = parseDate(item.FECHA_EJECUCION);
                    const d2 = parseDate(item.fecha_ejecucion_2);

                    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
                        const timeDiff = d2.getTime() - d1.getTime();
                        diff = Math.floor(timeDiff / (1000 * 3600 * 24));
                    }
                } catch (e) {
                    console.error("Error parsing dates for diff:", e);
                }
            }
            return { ...item, diff_dias: diff };
        });

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

        const periods = Array.from(periodsSet)
            .filter(p => p.startsWith('2025'))
            .sort()
            .reverse(); // Solo periodos del año 2025 ordenados por fecha descendente
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

    const handleBenchmarkSort = (key: string) => {
        setBenchmarkSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedBenchmarkData = useMemo(() => {
        let { periods, companies, matrix } = benchmarkTableData;
        if (!companies || companies.length === 0) return { periods: [], companies: [], matrix: {} };

        // Filter
        let filteredCompanies = [...companies];
        if (benchmarkSearchTerm) {
            const lowerSearch = benchmarkSearchTerm.toLowerCase();
            filteredCompanies = filteredCompanies.filter(c => c.toLowerCase().includes(lowerSearch));
        }

        // Sort
        if (benchmarkSortConfig.key) {
            filteredCompanies.sort((a, b) => {
                let valA: string | number, valB: string | number;
                if (benchmarkSortConfig.key === 'company') {
                    valA = a;
                    valB = b;
                } else {
                    valA = matrix[a]?.[benchmarkSortConfig.key!] ?? -1;
                    valB = matrix[b]?.[benchmarkSortConfig.key!] ?? -1;
                }

                if (valA === valB) return 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return benchmarkSortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }
                return benchmarkSortConfig.direction === 'asc'
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });
        }

        return { periods, companies: filteredCompanies, matrix };
    }, [benchmarkTableData, benchmarkSearchTerm, benchmarkSortConfig]);

    // Procesar datos para gráficos múltiples por empresa
    const telqwayStats = useMemo(() => {
        if (!qualityData || qualityData.length === 0) return null;

        const total = qualityData.length;
        const complies = qualityData.filter(d => String(d.CALIDAD_30) === '0').length;
        const nonComplies = total - complies;
        const complianceRate = total > 0 ? (complies / total) * 100 : 0;

        // Segmentation by Supervisor
        const supervisorMap: Record<string, { total: number, complies: number }> = {};
        qualityData.forEach(d => {
            const sup = d.supervisor || "Sin Supervisor";
            if (!supervisorMap[sup]) supervisorMap[sup] = { total: 0, complies: 0 };
            supervisorMap[sup].total++;
            if (String(d.CALIDAD_30) === '0') supervisorMap[sup].complies++;
        });

        const supervisorStats = Object.entries(supervisorMap)
            .map(([name, stats]) => ({
                name,
                total: stats.total,
                complies: stats.complies,
                ratio: (stats.complies / stats.total) * 100,
                nonComplies: stats.total - stats.complies
            }))
            .sort((a, b) => b.total - a.total);

        // Daily trend
        const dailyMap: Record<string, { total: number, complies: number }> = {};
        qualityData.forEach(d => {
            if (d.FECHA_EJECUCION) {
                const dateObj = new Date(d.FECHA_EJECUCION);
                if (!isNaN(dateObj.getTime())) {
                    const date = dateObj.toISOString().split('T')[0];
                    if (!dailyMap[date]) dailyMap[date] = { total: 0, complies: 0 };
                    dailyMap[date].total++;
                    if (String(d.CALIDAD_30) === '0') dailyMap[date].complies++;
                }
            }
        });

        const dailyStats = Object.entries(dailyMap)
            .map(([date, stats]) => {
                const dObj = new Date(date + 'T12:00:00');
                return {
                    date,
                    displayDate: `${dObj.getDate()} ${MONTH_NAMES[dObj.getMonth()]}`,
                    ratio: (stats.complies / stats.total) * 100
                };
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        // Network split
        const networkMap: Record<string, { total: number, complies: number }> = {};
        qualityData.forEach(d => {
            const net = d.TIPO_RED_CALCULADO || "Otros";
            if (!networkMap[net]) networkMap[net] = { total: 0, complies: 0 };
            networkMap[net].total++;
            if (String(d.CALIDAD_30) === '0') networkMap[net].complies++;
        });

        const networkStats = Object.entries(networkMap).map(([name, stats]) => ({
            name,
            value: stats.total,
            ratio: (stats.complies / stats.total) * 100
        }));

        return {
            total,
            complies,
            nonComplies,
            complianceRate,
            supervisorStats,
            dailyStats,
            networkStats
        };
    }, [qualityData]);

    const facetedBenchmarkData = useMemo(() => {
        const { periods, companies, matrix } = benchmarkTableData;
        if (!companies.length || !periods.length) return [];

        // Los periodos en el eje X deben ir de antiguo a reciente
        const chronPeriods = [...periods].reverse();

        return companies.map(company => {
            const data = chronPeriods.map(p => ({
                periodo: p,
                // Formatear periodo para el eje X (ej: 202501 -> Ene)
                label: /^\d{6}$/.test(p) ? ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][parseInt(p.substring(4, 6)) - 1] : p,
                ratio: matrix[company]?.[p] ?? 0
            }));

            // Calcular promedio para mostrar como referencia
            const totalRatio = data.reduce((sum, d) => sum + d.ratio, 0);
            const avgRatio = data.length > 0 ? totalRatio / data.length : 0;

            return {
                company,
                avgRatio,
                data
            };
        }).sort((a, b) => b.avgRatio - a.avgRatio); // Ordenar por mayor promedio de incumplimiento
    }, [benchmarkTableData]);

    const telqwayVsNacionalData = useMemo(() => {
        if (!benchmarkData || !benchmarkData.length) return [];

        const monthlyStats: { [period: string]: { telqwayInc: number, telqwayTot: number, nacInc: number, nacTot: number } } = {};

        benchmarkData.forEach(item => {
            const p = item.periodo || item.PERIODO;
            const c = item.tp_desc_empresa || item.TP_DESC_EMPRESA;
            const inc = Number(item.INCUMPLE_CALIDAD || 0);
            const tot = Number(item.Total_actividad || 0);

            if (!p) return;

            if (!monthlyStats[p]) {
                monthlyStats[p] = { telqwayInc: 0, telqwayTot: 0, nacInc: 0, nacTot: 0 };
            }

            // Identificar Telqway (asumimos que el nombre contiene "TELQWAY")
            const isTelqway = c && c.toUpperCase().includes("TELQWAY");

            if (isTelqway) {
                monthlyStats[p].telqwayInc += inc;
                monthlyStats[p].telqwayTot += tot;
            }

            monthlyStats[p].nacInc += inc;
            monthlyStats[p].nacTot += tot;
        });

        // Ordenar periodos cronológicamente para el gráfico
        const periods = Object.keys(monthlyStats).sort();
        return periods.map(p => {
            const stats = monthlyStats[p];
            const monthValue = parseInt(p.substring(4, 6)) - 1;
            const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const year = p.substring(0, 4);
            const label = /^\d{6}$/.test(p) ? `${MONTHS[monthValue]} ${year}` : p;

            return {
                periodo: p,
                label,
                Telqway: stats.telqwayTot > 0 ? (stats.telqwayInc / stats.telqwayTot) * 100 : 0,
                Nacional: stats.nacTot > 0 ? (stats.nacInc / stats.nacTot) * 100 : 0
            };
        });
    }, [benchmarkData]);

    const handleBenchmarkExport = () => {
        const { periods, companies, matrix } = sortedBenchmarkData;
        if (!companies || companies.length === 0) return;

        const headers = ["Empresa", ...periods.map((p: string) => {
            if (/^\d{6}$/.test(p)) {
                const year = p.substring(0, 4);
                const monthValue = parseInt(p.substring(4, 6)) - 1;
                const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                return (MONTHS[monthValue] || p) + " " + year;
            }
            return p;
        })];

        const rows = companies.map((company: string) => [
            company,
            ...periods.map((p: string) => {
                const val = matrix[company]?.[p];
                return val !== undefined ? `${formatDecimal(val.toFixed(2))}%` : '-';
            })
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Benchmark");
        XLSX.writeFile(wb, `Benchmark_Calidad_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

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
            'Dif. Días',
            'Red',
            'Nombre Short',
            'Supervisor',
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
        const rows = filteredData.map((row: any) => [
            String(row.CALIDAD_30) === '0' ? 'CUMPLE' : 'NO CUMPLE',
            row.diff_dias !== null ? row.diff_dias : '',
            row.TIPO_RED_CALCULADO || '',
            row.Nombre_short || '',
            row.supervisor || '',
            row.Comuna || '',
            row.id_actividad || '',
            formatDate(row.FECHA_EJECUCION),
            formatDecimal(row.descripcion_actividad) || '',
            formatDecimal(row.DESCRIPCION_CIERRE) || '',
            row.id_actividad_2 || '',
            formatDecimal(row.descripcion_actividad_2) || '',
            formatDate(row.fecha_ejecucion_2),
            formatDecimal(row.DESCRIPCION_CIERRE_2) || ''
        ]);

        // Combinar cabeceras y filas
        const wsData = [headers, ...rows];

        // Crear worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Configurar ancho de columnas
        ws['!cols'] = [
            { wch: 12 },  // Calidad30
            { wch: 10 },  // Dif. Días
            { wch: 10 },  // Red
            { wch: 20 },  // Nombre Short
            { wch: 20 },  // Supervisor
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
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

                {/* Header Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Gestión de Calidad
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Monitor de cumplimiento y auditoría técnica
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Global filters moved inside Cubo Datos tab but could still be useful here or hidden */}
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-1 mt-8 border-b border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === "dashboard"
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border-b-2 border-blue-600 dark:border-blue-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 border-b-2 border-purple-600 dark:border-purple-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-slate-800 border-b-2 border-orange-600 dark:border-orange-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
                            Telqway
                        </button>
                        <button
                            onClick={() => setActiveTab("cubo_datos")}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === "cubo_datos"
                                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-slate-800 border-b-2 border-green-600 dark:border-green-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <Zap className="w-4 h-4 inline-block mr-2" />
                            Cubo Datos
                        </button>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Dashboard View (High Level Summary) */}
                    {activeTab === "dashboard" && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center min-h-[500px] flex flex-col items-center justify-center overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400" />
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <img
                                        src="/under-construction.png"
                                        alt="En construcción"
                                        className="relative rounded-2xl shadow-2xl w-full max-w-[320px] mx-auto transform transition duration-500 hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                                        <Construction className="w-5 h-5 animate-bounce" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Próximamente</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">Dashboard</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                        Estamos diseñando un panel de indicadores de calidad de alto nivel para tu gestión.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 text-sm font-medium">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                        En construcción
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Telqway View (Full Dashboard) */}
                    {activeTab === "telqway" && (
                        <TelqwayView
                            telqwayStats={telqwayStats}
                            isLoading={isLoading}
                            selectedPeriod={selectedPeriod}
                            setSelectedPeriod={setSelectedPeriod}
                            periods={periods}
                        />
                    )}






                    {/* Benchmark Tab */}
                    {activeTab === "benchmark" && (
                        <div className="space-y-6">
                            {/* Gráficos */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Gráfico 1: Telqway vs Nacional */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Telqway vs Nacional (% Inc.)</h3>
                                    {benchmarkLoading ? (
                                        <ChartSkeleton height={240} type="line" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <LineChart data={telqwayVsNacionalData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                                <XAxis
                                                    dataKey="label"
                                                    stroke="#94a3b8"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '12px'
                                                    }}
                                                    formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Telqway"
                                                    name="Telqway"
                                                    stroke="#22c55e"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Nacional"
                                                    name="Promedio Nacional"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Gráfico 2: Cumplimiento */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">% Cumplimiento</h3>
                                    {benchmarkLoading ? (
                                        <ChartSkeleton height={200} type="line" />
                                    ) : (
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
                                    )}
                                </div>

                                {/* Gráfico 3: Volumen */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Volumen de Actividades</h3>
                                    {benchmarkLoading ? (
                                        <ChartSkeleton height={200} type="line" />
                                    ) : (
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
                                    )}
                                </div>
                            </div>

                            {/* Faceted Charts Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tendencias Individuales por Empresa</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Evolución del % de Incumplimiento mensual (ordenado por promedio histórico)
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {benchmarkLoading ? (
                                        [...Array(8)].map((_, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                                <div className="flex justify-between items-start mb-4">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-12" />
                                                </div>
                                                <ChartSkeleton height={80} type="line" className="pt-2" />
                                            </div>
                                        ))
                                    ) : (
                                        facetedBenchmarkData.slice(0, 12).map((facet, idx) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={facet.company}>
                                                        {facet.company}
                                                    </h4>
                                                    <div className={cn(
                                                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                                        facet.avgRatio < 5 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                            facet.avgRatio < 10 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {facet.avgRatio.toFixed(1)}% Prom.
                                                    </div>
                                                </div>

                                                <div className="h-[120px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={facet.data}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.3} />
                                                            <XAxis
                                                                dataKey="label"
                                                                hide={false}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                fontSize={10}
                                                                tick={{ fill: '#94a3b8' }}
                                                            />
                                                            <YAxis hide={true} domain={[0, 'auto']} />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px'
                                                                }}
                                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                                                itemStyle={{ color: '#fff', padding: '0' }}
                                                                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Incumplimiento']}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="ratio"
                                                                stroke={facet.avgRatio < 8 ? "#3b82f6" : "#f43f5e"}
                                                                strokeWidth={2}
                                                                dot={false}
                                                                activeDot={{ r: 4, strokeWidth: 0 }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {facetedBenchmarkData.length > 12 && (
                                    <p className="text-center text-xs text-slate-400 mt-4 italic">
                                        Mostrando las 12 empresas con mayor volumen/incumplimiento.
                                    </p>
                                )}
                            </div>

                            {/* Tabla de Benchmark */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Matriz de Incumplimiento por Empresa</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Porcentaje de incumplimiento de calidad (Incumple / Total × 100)
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                placeholder="Filtrar empresa..."
                                                value={benchmarkSearchTerm}
                                                onChange={(e) => setBenchmarkSearchTerm(e.target.value)}
                                                className="pl-9 h-9 text-sm"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleBenchmarkExport}
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Excel
                                        </Button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto p-6">
                                    {benchmarkLoading ? (
                                        <div className="space-y-4">
                                            <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Skeleton key={i} className="h-4 w-full mx-2" />
                                                ))}
                                            </div>
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="flex gap-4">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Skeleton key={j} className="h-10 w-full" />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ) : sortedBenchmarkData.periods.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles para benchmark</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 dark:bg-white/5">
                                                    <TableHead
                                                        className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                        onClick={() => handleBenchmarkSort('company')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Empresa
                                                            <ArrowUpDown className={cn("w-3 h-3 text-slate-400", benchmarkSortConfig.key === 'company' && "text-blue-500")} />
                                                        </div>
                                                    </TableHead>
                                                    {sortedBenchmarkData.periods.map((period) => {
                                                        // Intentar formatear si viene como YYYYMM
                                                        let displayPeriod = period;
                                                        if (/^\d{6}$/.test(period)) {
                                                            const year = period.substring(0, 4);
                                                            const month = parseInt(period.substring(4, 6)) - 1;
                                                            const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                                                            if (MONTHS[month]) displayPeriod = `${MONTHS[month]} ${year}`;
                                                        }
                                                        return (
                                                            <TableHead
                                                                key={period}
                                                                className="text-center font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                                onClick={() => handleBenchmarkSort(period)}
                                                            >
                                                                <div className="flex items-center justify-center gap-1">
                                                                    {displayPeriod}
                                                                    <ArrowUpDown className={cn("w-3 h-3 text-slate-400", benchmarkSortConfig.key === period && "text-blue-500")} />
                                                                </div>
                                                            </TableHead>
                                                        );
                                                    })}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedBenchmarkData.companies.map((company) => (
                                                    <TableRow key={company} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                        <TableCell className="font-medium text-slate-700 dark:text-white">
                                                            {company}
                                                        </TableCell>
                                                        {sortedBenchmarkData.periods.map((period) => {
                                                            const value = sortedBenchmarkData.matrix[company]?.[period];
                                                            const displayValue = value !== undefined ? formatDecimal(value.toFixed(1)) : '-';
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

                    {/* Cubo Datos Tab (Detailed Data) */}
                    {activeTab === "cubo_datos" && (
                        <div className="space-y-6">
                            {/* KPI Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { title: "Evaluaciones", value: stats.total, icon: Calendar, color: "blue" },
                                    { title: "Cumplimiento", value: stats.cumple, icon: CheckCircle2, color: "green" },
                                    { title: "Incumplimiento", value: stats.noCumple, icon: AlertCircle, color: "red" },
                                    { title: "Eficiencia", value: `${formatDecimal(stats.rate.toFixed(1))}%`, icon: TrendingUp, color: "purple" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
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
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

                                {/* Filters Toolbar */}
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white shadow-sm">
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
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex flex-wrap items-center gap-2 flex-1">
                                            <div className="relative flex-1 max-w-md">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    placeholder="Buscar por pedido, técnico, comuna..."
                                                    value={searchTerm}
                                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                    className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                                />
                                            </div>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Estado: Todos</SelectItem>
                                                    <SelectItem value="0">Cumple</SelectItem>
                                                    <SelectItem value="1">No Cumple</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={redFilter} onValueChange={setRedFilter}>
                                                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                                    <SelectValue placeholder="Red" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Red: Todas</SelectItem>
                                                    <SelectItem value="FTTH">FTTH</SelectItem>
                                                    <SelectItem value="HFC">HFC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                                                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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
                                            <TableRow className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-700">
                                                <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('CALIDAD_30')}>
                                                    <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                        Calidad30 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('diff_dias')}>
                                                    <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                        Dif. Días <ArrowUpDown className="w-3 h-3 text-slate-400" />
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
                                                        className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-100 dark:border-slate-700 transition-colors"
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
                                                        <TableCell className="text-center font-mono font-medium">
                                                            {row.diff_dias !== null ? row.diff_dias : '-'}
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
                                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Mostrando <span className="font-semibold text-slate-900 dark:text-slate-200">{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> de <span className="font-semibold text-slate-900 dark:text-slate-200">{filteredData.length}</span>
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
            </div >
        </SupervisorLayout >
    );
}

function TelqwayView({
    telqwayStats,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    periods
}: {
    telqwayStats: any,
    isLoading: boolean,
    selectedPeriod: string,
    setSelectedPeriod: (val: string) => void,
    periods: string[] | undefined
}) {
    // Search state for evolution table
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch evolution data
    const { data: evolutionData = [], isLoading: evolutionLoading } = useQuery<any[]>({
        queryKey: ["/api/calidad-tqw/evolution"],
    });

    // Process evolution data for table
    const evolutionTableData = useMemo(() => {
        if (!evolutionData.length) return { months: [], technicians: [], matrix: {} };

        // Get unique months and sort them
        const monthsSet = new Set<string>();
        evolutionData.forEach(item => {
            if (item.mes) monthsSet.add(item.mes);
        });
        const months = Array.from(monthsSet).sort().reverse(); // Decending order

        // Group data by technician
        const techniciansMap = new Map<string, any>();

        evolutionData.forEach(item => {
            const key = item.rut; // Use RUT as unique key
            if (!techniciansMap.has(key)) {
                techniciansMap.set(key, {
                    rut: item.rut,
                    name: item.nombre_tecnico,
                    supervisor: item.supervisor_normalized
                });
            }
        });

        const technicians = Array.from(techniciansMap.values()).sort((a, b) =>
            (a.supervisor || "").localeCompare(b.supervisor || "") || (a.name || "").localeCompare(b.name || "")
        );

        // Build matrix [technician_rut][month] = { total: number, cumple: number, percent: number }
        const matrix: Record<string, Record<string, { total: number, cumple: number, percent: number }>> = {};

        evolutionData.forEach(item => {
            if (!matrix[item.rut]) matrix[item.rut] = {};

            const total = Number(item.total_ots);
            const cumple = Number(item.cumple_calidad);
            const percent = total > 0 ? (cumple / total) * 100 : 0;

            matrix[item.rut][item.mes] = { total, cumple, percent };
        });

        return { months, technicians, matrix };
    }, [evolutionData]);

    // Export to Excel function
    const exportToExcel = () => {
        // Prepare data for Excel
        const excelData = evolutionTableData.technicians.map(tech => {
            const row: any = {
                'Supervisor': tech.supervisor || '',
                'Técnico': tech.name || '',
                'RUT': tech.rut || ''
            };

            // Add month columns
            evolutionTableData.months.forEach(month => {
                const data = evolutionTableData.matrix[tech.rut]?.[month];
                row[month] = data ? `${data.percent.toFixed(0)}% (${data.cumple}/${data.total})` : '-';
            });

            // Calculate and add average
            let totalSum = 0;
            let cumpleSum = 0;
            evolutionTableData.months.forEach(month => {
                const data = evolutionTableData.matrix[tech.rut]?.[month];
                if (data) {
                    totalSum += data.total;
                    cumpleSum += data.cumple;
                }
            });
            const avgPercent = totalSum > 0 ? (cumpleSum / totalSum) * 100 : 0;
            row['Promedio'] = `${avgPercent.toFixed(1)}%`;

            return row;
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Evolución Mensual');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `Evolucion_Mensual_Tecnicos_${date}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);
    };

    // Filter technicians based on search term
    const filteredTechnicians = useMemo(() => {
        if (!searchTerm.trim()) return evolutionTableData.technicians;

        const term = searchTerm.toLowerCase();
        return evolutionTableData.technicians.filter(tech =>
            (tech.name || '').toLowerCase().includes(term) ||
            (tech.rut || '').toLowerCase().includes(term) ||
            (tech.supervisor || '').toLowerCase().includes(term)
        );
    }, [evolutionTableData.technicians, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Period Selection Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Estadísticas del Periodo</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {selectedPeriod ? formatPeriod(selectedPeriod) : "Seleccione un periodo"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            {periods?.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {formatPeriod(p)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total OT</p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : telqwayStats?.total.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cumple Calidad</p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : telqwayStats?.complies.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No Cumple</p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : telqwayStats?.nonComplies.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">% Calidad Global</p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : `${formatDecimal(telqwayStats?.complianceRate.toFixed(1))}%`}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolución Diaria */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Evolución Diaria de Calidad</h3>
                    {isLoading ? (
                        <ChartSkeleton height={300} type="line" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={telqwayStats?.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis
                                    dataKey="displayDate"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}%`}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val: number) => [`${val.toFixed(1)}%`, 'Calidad (%)']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ratio"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                    label={{
                                        position: 'top',
                                        formatter: (val: number) => `${val.toFixed(1)}%`,
                                        fontSize: 10,
                                        fill: '#64748b',
                                        offset: 10
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Calidad por Supervisor (Quick View) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Supervisores (Volumen)</h3>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-2 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {telqwayStats?.supervisorStats.sort((a: any, b: any) => b.ratio - a.ratio).slice(0, 6).map((sup: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate w-[120px]" title={sup.name}>
                                                {sup.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {sup.total} OTs • {sup.complies} Cumplen
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-sm font-bold",
                                            sup.ratio >= 90 ? "text-green-600 dark:text-green-400" :
                                                sup.ratio >= 80 ? "text-blue-600 dark:text-blue-400" :
                                                    "text-red-600 dark:text-red-400"
                                        )}>
                                            {sup.ratio.toFixed(1)}%
                                        </div>
                                        <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    sup.ratio >= 90 ? "bg-green-500" :
                                                        sup.ratio >= 80 ? "bg-blue-500" :
                                                            "bg-red-500"
                                                )}
                                                style={{ width: `${sup.ratio}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Top 10 y Bottom 10 Técnicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 Mejores Técnicos */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">🏆 Top 10 Mejores Técnicos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {evolutionTableData.months.includes(selectedPeriod?.substring(0, 7))
                                    ? `Ranking ${formatPeriod(selectedPeriod)}`
                                    : "Ranking Promedio Histórico"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold">
                            <Award className="w-3.5 h-3.5" />
                            Excelencia
                        </div>
                    </div>
                    {evolutionLoading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (() => {
                        // Determine months logic
                        const selectedMonth = selectedPeriod ? selectedPeriod.substring(0, 7) : "";
                        const isFiltered = evolutionTableData.months.includes(selectedMonth);

                        let monthsToDisplay: string[] = [];
                        if (isFiltered) {
                            const currentIndex = evolutionTableData.months.indexOf(selectedMonth);
                            // Get up to 2 previous months relative to selected
                            // Slice indices: start at current, end at current+3 (exclusive) to get 3 items
                            // Then reverse to show chronological order (Oldest -> Newest)
                            monthsToDisplay = evolutionTableData.months.slice(currentIndex, currentIndex + 3).reverse();
                        } else {
                            monthsToDisplay = [];
                        }

                        // Calculate stats for each technician
                        const techStats = evolutionTableData.technicians.map(tech => {
                            let comparisonBasis = 0;
                            if (isFiltered) {
                                // Specific month score
                                const data = evolutionTableData.matrix[tech.rut]?.[selectedMonth];
                                comparisonBasis = data?.total ? data.percent : (data?.cumple === 0 && data?.total > 0 ? 0 : -1);
                            } else {
                                // Historical avg
                                let totalSum = 0;
                                let cumpleSum = 0;
                                evolutionTableData.months.forEach(month => {
                                    const data = evolutionTableData.matrix[tech.rut]?.[month];
                                    if (data) {
                                        totalSum += data.total;
                                        cumpleSum += data.cumple;
                                    }
                                });
                                comparisonBasis = totalSum > 0 ? (cumpleSum / totalSum) * 100 : 0;
                            }

                            // Get history valid values
                            const history = monthsToDisplay.map(m => {
                                const data = evolutionTableData.matrix[tech.rut]?.[m];
                                return {
                                    month: m,
                                    percent: data && data.total > 0 ? data.percent : null
                                };
                            });

                            return { ...tech, rankingScore: comparisonBasis, history };
                        }).filter(t => {
                            if (isFiltered) {
                                const data = evolutionTableData.matrix[t.rut]?.[selectedMonth];
                                return data && data.total > 0;
                            } else {
                                return evolutionTableData.months.some(m => evolutionTableData.matrix[t.rut]?.[m]?.total > 0);
                            }
                        });


                        const top10 = techStats.sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 10);

                        if (top10.length === 0) {
                            return (
                                <div className="text-center py-8 text-slate-500">
                                    No hay datos registrados para este periodo.
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-2">
                                {isFiltered && (
                                    <div className="flex justify-end px-3 mb-2 text-xs font-semibold text-slate-400 gap-4">
                                        {monthsToDisplay.map(m => (
                                            <div key={m} className="w-12 text-center">{m.split('-')[1]}</div>
                                        ))}
                                    </div>
                                )}
                                {top10.map((tech, idx) => (
                                    <div key={tech.rut} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent border border-green-100 dark:border-green-900/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                                                idx === 0 ? "bg-yellow-400 text-yellow-900" :
                                                    idx === 1 ? "bg-gray-300 text-gray-700" :
                                                        idx === 2 ? "bg-orange-400 text-orange-900" :
                                                            "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {tech.name || tech.rut || 'Sin identificación'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {tech.supervisor || 'Sin supervisor'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isFiltered ? (
                                                <div className="flex gap-4">
                                                    {tech.history.map((h: any, hIdx: number) => {
                                                        const isLast = hIdx === tech.history.length - 1;
                                                        const prevVal = hIdx > 0 ? tech.history[hIdx - 1].percent : null;
                                                        const trend = (h.percent !== null && prevVal !== null) ? (h.percent >= prevVal ? 'up' : 'down') : 'flat';

                                                        return (
                                                            <div key={h.month} className={cn(
                                                                "flex flex-col items-center w-12",
                                                                isLast ? "opacity-100 scale-110 font-bold" : "opacity-60"
                                                            )}>
                                                                <span className={cn(
                                                                    "text-xs",
                                                                    h.percent !== null ? (h.percent >= 90 ? "text-green-600" : h.percent >= 80 ? "text-blue-600" : "text-red-500") : "text-slate-300"
                                                                )}>
                                                                    {h.percent !== null ? `${h.percent.toFixed(0)}%` : '-'}
                                                                </span>
                                                                {isLast && h.percent !== null && prevVal !== null && (
                                                                    <span className={cn("text-[10px]", trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-slate-400")}>
                                                                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-right ml-2">
                                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {tech.rankingScore.toFixed(1)}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Bottom 10 Peores Técnicos */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">⚠️ Bottom 10 Técnicos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {evolutionTableData.months.includes(selectedPeriod?.substring(0, 7))
                                    ? `Ranking ${formatPeriod(selectedPeriod)}`
                                    : "Ranking Promedio Histórico"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Atención
                        </div>
                    </div>
                    {evolutionLoading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (() => {
                        // Determine months logic (REUSED LOGIC for consistency)
                        const selectedMonth = selectedPeriod ? selectedPeriod.substring(0, 7) : "";
                        const isFiltered = evolutionTableData.months.includes(selectedMonth);

                        let monthsToDisplay: string[] = [];
                        if (isFiltered) {
                            const currentIndex = evolutionTableData.months.indexOf(selectedMonth);
                            monthsToDisplay = evolutionTableData.months.slice(currentIndex, currentIndex + 3).reverse();
                        } else {
                            monthsToDisplay = [];
                        }

                        // Calculate stats for each technician
                        const techStats = evolutionTableData.technicians.map(tech => {
                            let comparisonBasis = 0;
                            if (isFiltered) {
                                const data = evolutionTableData.matrix[tech.rut]?.[selectedMonth];
                                comparisonBasis = data?.total ? data.percent : (data?.cumple === 0 && data?.total > 0 ? 0 : 101); // 101 to push to bottom if sorted asc
                            } else {
                                let totalSum = 0;
                                let cumpleSum = 0;
                                evolutionTableData.months.forEach(month => {
                                    const data = evolutionTableData.matrix[tech.rut]?.[month];
                                    if (data) {
                                        totalSum += data.total;
                                        cumpleSum += data.cumple;
                                    }
                                });
                                comparisonBasis = totalSum > 0 ? (cumpleSum / totalSum) * 100 : 0;
                            }

                            const history = monthsToDisplay.map(m => {
                                const data = evolutionTableData.matrix[tech.rut]?.[m];
                                return {
                                    month: m,
                                    percent: data && data.total > 0 ? data.percent : null
                                };
                            });

                            return { ...tech, rankingScore: comparisonBasis, history };
                        }).filter(t => {
                            if (isFiltered) {
                                const data = evolutionTableData.matrix[t.rut]?.[selectedMonth];
                                return data && data.total > 0;
                            } else {
                                return evolutionTableData.months.some(m => evolutionTableData.matrix[t.rut]?.[m]?.total > 0);
                            }
                        });


                        const bottom10 = techStats.sort((a, b) => a.rankingScore - b.rankingScore).slice(0, 10);

                        if (bottom10.length === 0) {
                            return (
                                <div className="text-center py-8 text-slate-500">
                                    No hay datos registrados para este periodo.
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-2">
                                {isFiltered && (
                                    <div className="flex justify-end px-3 mb-2 text-xs font-semibold text-slate-400 gap-4">
                                        {monthsToDisplay.map(m => (
                                            <div key={m} className="w-12 text-center">{m.split('-')[1]}</div>
                                        ))}
                                    </div>
                                )}
                                {bottom10.map((tech, idx) => (
                                    <div key={tech.rut} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/10 dark:to-transparent border border-red-100 dark:border-red-900/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-700 dark:text-red-300 font-bold text-xs shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {tech.name || tech.rut || 'Sin identificación'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {tech.supervisor || 'Sin supervisor'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isFiltered ? (
                                                <div className="flex gap-4">
                                                    {tech.history.map((h: any, hIdx: number) => {
                                                        const isLast = hIdx === tech.history.length - 1;
                                                        const prevVal = hIdx > 0 ? tech.history[hIdx - 1].percent : null;
                                                        const trend = (h.percent !== null && prevVal !== null) ? (h.percent >= prevVal ? 'up' : 'down') : 'flat';

                                                        return (
                                                            <div key={h.month} className={cn(
                                                                "flex flex-col items-center w-12",
                                                                isLast ? "opacity-100 scale-110 font-bold" : "opacity-60"
                                                            )}>
                                                                <span className={cn(
                                                                    "text-xs",
                                                                    h.percent !== null ? (h.percent >= 90 ? "text-green-600" : h.percent >= 80 ? "text-blue-600" : "text-red-500") : "text-slate-300"
                                                                )}>
                                                                    {h.percent !== null ? `${h.percent.toFixed(0)}%` : '-'}
                                                                </span>
                                                                {isLast && h.percent !== null && prevVal !== null && (
                                                                    <span className={cn("text-[10px]", trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-slate-400")}>
                                                                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-right ml-2">
                                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                                        {tech.rankingScore.toFixed(1)}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Evolución Mensual 2025 Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Evolución Mensual por Técnico (2025+)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Seguimiento histórico del porcentaje de cumplimiento mensual de los técnicos.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar técnico, RUT o supervisor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-[280px]"
                                />
                            </div>
                            <Button
                                onClick={exportToExcel}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                disabled={evolutionTableData.technicians.length === 0}
                            >
                                <Download className="w-4 h-4" />
                                Exportar Excel
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto p-6">
                    {evolutionLoading ? (
                        <div className="space-y-4">
                            <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full mx-2" />
                                ))}
                            </div>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Skeleton key={j} className="h-10 w-full" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : evolutionTableData.technicians.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">No hay datos de evolución disponibles</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-white/5">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Supervisor</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Técnico</TableHead>
                                    {evolutionTableData.months.map(month => (
                                        <TableHead key={month} className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            {month}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Promedio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTechnicians.map((tech) => {
                                    // Calculate average over all displayed months
                                    let totalSum = 0;
                                    let cumpleSum = 0;

                                    evolutionTableData.months.forEach(month => {
                                        const data = evolutionTableData.matrix[tech.rut]?.[month];
                                        if (data) {
                                            totalSum += data.total;
                                            cumpleSum += data.cumple;
                                        }
                                    });

                                    const avgPercent = totalSum > 0 ? (cumpleSum / totalSum) * 100 : 0;

                                    return (
                                        <TableRow key={tech.rut} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="text-xs font-medium text-slate-500">{tech.supervisor}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900 dark:text-white text-sm">
                                                    {tech.name}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    {tech.rut}
                                                </div>
                                            </TableCell>
                                            {evolutionTableData.months.map(month => {
                                                const data = evolutionTableData.matrix[tech.rut]?.[month];
                                                return (
                                                    <TableCell key={month} className="text-center p-2">
                                                        {data ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-xs font-bold",
                                                                    data.percent >= 90 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                        data.percent >= 80 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {data.percent.toFixed(0)}%
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                                    {data.cumple}/{data.total}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-bold">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-sm",
                                                    avgPercent >= 90 ? "text-green-600" :
                                                        avgPercent >= 80 ? "text-blue-600" :
                                                            "text-red-600"
                                                )}>
                                                    {avgPercent.toFixed(1)}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
