import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, FileText, ArrowUpDown, RotateCcw, Package, Check, X as XIcon } from "lucide-react";
import { MaterialRequest, useMaterialRequest } from "./context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequestDetailSheet } from "./request-detail-sheet";

// Mock Data
const MOCK_REQUESTS: MaterialRequest[] = [
    { id: 1, ticketToken: "A1B2C3D4", date: "2023-12-28T10:00:00", materialName: "CABLE UTP CAT6", quantity: 150, originTechnician: "Juan Perez", destinationTechnician: "Bodega", status: "PENDIENTE" },
    { id: 2, ticketToken: "E5F6G7H8", date: "2023-12-28T11:30:00", materialName: "ONT HUAWEI", quantity: 4, originTechnician: "Maria Gonzalez", destinationTechnician: "Pedro Soto", status: "APROBADO" },
    { id: 3, ticketToken: "I9J0K1L2", date: "2023-12-27T16:45:00", materialName: "DECODIFICADOR 4K", quantity: 2, originTechnician: "Carlos Ruiz", destinationTechnician: "Bodega", status: "RECHAZADO" },
    { id: 4, ticketToken: "M3N4O5P6", date: "2023-12-29T09:15:00", materialName: "CONECTOR RJ45", quantity: 50, originTechnician: "Ana Lopez", destinationTechnician: "Miguel Angel", status: "PENDIENTE" },
    { id: 5, ticketToken: "A1B2C3D4", date: "2023-12-28T10:00:00", materialName: "ROUTER WIFI 6", quantity: 10, originTechnician: "Juan Perez", destinationTechnician: "Bodega", status: "PENDIENTE" },
];

import { useQuery } from "@tanstack/react-query";

export function RequestTable() {
    const { dispatch } = useMaterialRequest();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDIENTE" | "APROBADO" | "RECHAZADO">("ALL");
    const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const { data: solicitudes = [], isLoading } = useQuery<MaterialRequest[]>({
        queryKey: ["/api/materials/solicitudes"],
    });

    // States for sorting, pagination, supervisor filter and date filter
    const [supervisorFilter, setSupervisorFilter] = useState<string>("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: keyof MaterialRequest; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Date filter matching SME.tsx style
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<string>(formatDate(yesterday));
    const [endDate, setEndDate] = useState<string>(formatDate(today));

    const pageSize = 10;

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setSupervisorFilter("ALL");
        setStartDate(formatDate(yesterday));
        setEndDate(formatDate(today));
        setCurrentPage(1);
    };

    // 1. Filter
    const filteredData = solicitudes.filter(req => {
        const matchesSearch =
            req.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.ticketToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.originTechnician || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
        const matchesSupervisor = supervisorFilter === "ALL" || req.supervisorName === supervisorFilter;

        // Date Range filtering using string comparison (Lexicographical)
        let matchesDate = true;
        if (req.date) {
            const reqDateStr = req.date.split('T')[0];
            if (startDate && endDate) {
                matchesDate = reqDateStr >= startDate && reqDateStr <= endDate;
            } else if (startDate) {
                matchesDate = reqDateStr >= startDate;
            } else if (endDate) {
                matchesDate = reqDateStr <= endDate;
            }
        }

        return matchesSearch && matchesStatus && matchesSupervisor && matchesDate;
    });

    // Get unique supervisors for the filter (from ALL solicitudes to keep the list consistent)
    const uniqueSupervisors = Array.from(new Set(solicitudes.map(s => s.supervisorName).filter(Boolean))).sort();

    // 2. Sort
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valA = a[key];
        let valB = b[key];

        if (key === 'date') {
            valA = new Date(valA as string).getTime();
            valB = new Date(valB as string).getTime();
        }

        if (valA! < valB!) return direction === 'asc' ? -1 : 1;
        if (valA! > valB!) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // 3. Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key: keyof MaterialRequest) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APROBADO": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">Aprobado</Badge>;
            case "RECHAZADO": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">Rechazado</Badge>;
            default: return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">Pendiente</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Solicitudes Pendientes</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {filteredData.filter(s => s.status === "PENDIENTE").length}
                        </h3>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>

                <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Solicitudes Aprobadas</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {filteredData.filter(s => s.status === "APROBADO").length}
                        </h3>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Solicitudes Rechazadas</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {filteredData.filter(s => s.status === "RECHAZADO").length}
                        </h3>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                        <XIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Solicitudes</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {filteredData.length}
                        </h3>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-3 items-center flex-1 w-full">
                    {/* Status Filters */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        {(["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === status
                                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                            >
                                {status === "ALL" ? "Todos" : status}
                            </button>
                        ))}
                    </div>

                    {/* Supervisor Filter */}
                    <Select value={supervisorFilter} onValueChange={(val) => {
                        setSupervisorFilter(val);
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-xs">
                            <div className="flex items-center">
                                <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <SelectValue placeholder="Supervisor" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                            <SelectItem value="ALL">Todos los Supers</SelectItem>
                            {uniqueSupervisors.map(name => (
                                <SelectItem key={name} value={name!}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date Filters matching SME style */}
                    <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Desde:</span>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-8 text-[11px] w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Hasta:</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-8 text-[11px] w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    {(searchTerm || statusFilter !== "ALL" || supervisorFilter !== "ALL" || startDate !== formatDate(yesterday) || endDate !== formatDate(today)) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2 h-9 text-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Limpiar
                        </Button>
                    )}

                    {/* Search Input (Moved to end) */}
                    <div className="relative flex-1 min-w-[200px] max-w-md ml-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar ticket, material..."
                            className="pl-10 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={() => dispatch({ type: 'SET_SHEET_OPEN', payload: true })} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Solicitud
                </Button>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('ticketToken')}>
                                <div className="flex items-center gap-1">Ticket <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-1">Fecha <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('materialName')}>
                                <div className="flex items-center gap-1">Material <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('quantity')}>
                                <div className="flex items-center justify-end gap-1">Cant. <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('originTechnician')}>
                                <div className="flex items-center gap-1">Origen <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('supervisorName')}>
                                <div className="flex items-center gap-1">Supervisor <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead>Región</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('destinationTechnician')}>
                                <div className="flex items-center gap-1">Destino <ArrowUpDown className="w-3 h-3" /></div>
                            </TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        Cargando solicitudes...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((req, i) => (
                                <TableRow key={`${req.id}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell className="font-medium font-mono text-xs">{req.ticketToken}</TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {format(new Date(req.date), "dd MMM yyyy HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                                        <div className="whitespace-normal leading-tight break-words">
                                            {req.materialName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{req.quantity}</TableCell>
                                    <TableCell className="text-sm">{req.originTechnician || 'Sistema'}</TableCell>
                                    <TableCell className="text-sm text-slate-500">{req.supervisorName || '-'}</TableCell>
                                    <TableCell className="text-xs font-semibold">
                                        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50">
                                            {req.flagRegiones || 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {req.destinationTechnician === "Bodega" ? (
                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Bodega</span>
                                        ) : (
                                            req.destinationTechnician
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setDetailOpen(true);
                                            }}
                                        >
                                            <span className="sr-only">Ver detalles</span>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                    No se encontraron solicitudes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500">
                    Mostrando {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)} a {Math.min(sortedData.length, currentPage * pageSize)} de {sortedData.length} resultados
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800">
                        {currentPage}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        <RequestDetailSheet
            request={selectedRequest}
            open={detailOpen}
            onClose={() => {
                setDetailOpen(false);
                setSelectedRequest(null);
            }}
        />
    );
}
