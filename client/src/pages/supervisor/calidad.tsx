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
    Filter,
    CheckCircle2,
    AlertCircle,
    FileSpreadsheet,
    Calendar
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

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
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [redFilter, setRedFilter] = useState<string>("all");
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

    const { data: qualityData = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/calidad-tqw/data", selectedPeriod],
        enabled: !!selectedPeriod,
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        let data = [...qualityData];

        // Status Filter
        if (statusFilter !== "all") {
            data = data.filter(item => item.CALIDAD_30 === statusFilter);
        }

        // Red Filter
        if (redFilter !== "all") {
            data = data.filter(item => item.TIPO_RED_CALCULADO === redFilter);
        }

        // Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        // Sorting
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
    }, [qualityData, searchTerm, statusFilter, redFilter, sortConfig]);

    const stats = useMemo(() => {
        if (!filteredData.length) return { total: 0, cumple: 0, noCumple: 0, rate: 0 };
        const total = filteredData.length;
        const cumple = filteredData.filter(d => d.CALIDAD_30 === '0').length;
        return {
            total,
            cumple,
            noCumple: total - cumple,
            rate: (cumple / total) * 100
        };
    }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleExport = () => {
        if (!filteredData.length) return;

        const exportData = filteredData.map(row => ({
            'Estado': row.CALIDAD_30 === '0' ? 'CUMPLE' : 'NO CUMPLE',
            'N° Pedido': row.num_pedido,
            'Fecha Ejecución': formatDate(row.FECHA_EJECUCION),
            'Red': row.TIPO_RED_CALCULADO,
            'Actividad': row.ACTIVIDAD,
            'RUT Técnico': row.RUT_TECNICO_FS,
            'Nombre Técnico': row.NOMBRE_TECNICO || '',
            'Comuna': row.Comuna,
            'Zona': row.ZONA,
            'Descripción Cierre': row.DESCRIPCION_CIERRE
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Calidad");

        // Auto-size columns
        const wscols = [
            { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 30 },
            { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Reporte_Calidad_${selectedPeriod.substring(0, 7)}.xlsx`);
    };

    return (
        <SupervisorLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">Calidad</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Calidad</h1>
                        <p className="text-slate-500 text-sm">Monitor de cumplimiento y auditoría de pedidos</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <SelectValue placeholder="Periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods?.map((p) => (
                                    <SelectItem key={p} value={p}>{formatPeriod(p)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Evaluaciones</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Cumplimiento</p>
                                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.cumple}</h3>
                                </div>
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Incumplimiento</p>
                                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.noCumple}</h3>
                                </div>
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">% Eficiencia</p>
                                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.rate.toFixed(1)}%</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <ArrowUpDown className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Table Card */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar pedido, técnico, comuna..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 h-10"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="0">Cumple</SelectItem>
                                            <SelectItem value="1">No Cumple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500 font-medium">Red:</span>
                                    <Select value={redFilter} onValueChange={setRedFilter}>
                                        <SelectTrigger className="w-[120px] h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="FTTH">FTTH</SelectItem>
                                            <SelectItem value="HFC">HFC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(searchTerm || statusFilter !== "all" || redFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setRedFilter("all"); }}
                                        className="h-9 px-2 text-slate-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-transparent">
                                    <TableHead className="w-[100px] text-center cursor-pointer" onClick={() => handleSort('CALIDAD_30')}>
                                        Status <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('num_pedido')}>
                                        Pedido <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('FECHA_EJECUCION')}>
                                        Fecha <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </TableHead>
                                    <TableHead>Red</TableHead>
                                    <TableHead>Actividad</TableHead>
                                    <TableHead>Técnico</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead className="max-w-[200px]">Cierre</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                                <p className="text-sm text-slate-500">Cargando datos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-48 text-center text-slate-500">
                                            No se encontraron registros que coincidan con los filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((row, idx) => (
                                        <TableRow key={row.id_actividad || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <TableCell className="text-center">
                                                {row.CALIDAD_30 === '0' ? (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">
                                                        CUMPLE
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none">
                                                        NO CUMPLE
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">{row.num_pedido}</TableCell>
                                            <TableCell className="whitespace-nowrap text-xs text-slate-500">
                                                {formatDate(row.FECHA_EJECUCION)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] font-bold",
                                                    row.TIPO_RED_CALCULADO === 'FTTH' ? "border-orange-200 text-orange-600 bg-orange-50" : "border-blue-200 text-blue-600 bg-blue-50"
                                                )}>
                                                    {row.TIPO_RED_CALCULADO}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="truncate text-xs">{row.ACTIVIDAD}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{row.NOMBRE_TECNICO || 'S/N'}</span>
                                                    <span className="text-[10px] text-slate-400">{row.RUT_TECNICO_FS}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs">{row.Comuna}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">{row.ZONA}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="text-[11px] text-slate-500 italic truncate group-hover:whitespace-normal">
                                                    {row.DESCRIPCION_CIERRE}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Mostrando <span className="font-bold">{(currentPage - 1) * rowsPerPage + 1}</span> a <span className="font-bold">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> de <span className="font-bold">{filteredData.length}</span> registros
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8"
                                >
                                    Anterior
                                </Button>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-md p-0.5">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "h-7 w-7 text-[11px] font-bold rounded transition-colors",
                                                    currentPage === pageNum
                                                        ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </SupervisorLayout>
    );
}
