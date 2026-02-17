import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, AlertCircle, X, Package, ChevronRight, Check, X as XIcon, RotateCcw, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface MaterialItem {
    id: number;
    material: string;
    cantidad: number;
    campo_item: string;
}

interface SolicitudLogistica {
    TICKET: string;
    fecha: string;
    tecnico: string;
    tecnicoOrigen: string | null;
    id_tecnico_traspaso: number | null;
    tecnicoDestino: string | null;
    flag_regiones: string | null;
    flag_gestion_supervisor: number | null;
    flag_gestion_bodega: string | null;
    ESTADO_BODEGA: string;
    total_items: number;
    total_cantidad: number;
    items: MaterialItem[];
}

export default function SupervisorModuloLogistico() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTicket, setSelectedTicket] = useState<SolicitudLogistica | null>(null);

    const todayStr = new Date().toISOString().split("T")[0];
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

    const [startDate, setStartDate] = useState<string>(twoDaysAgoStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof SolicitudLogistica | null;
        direction: "asc" | "desc";
    }>({ key: "fecha", direction: "desc" });

    const { data: solicitudes, isLoading, error } = useQuery<SolicitudLogistica[]>({
        queryKey: ["/api/supervisor/logistica/materiales", startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const response = await fetch(`/api/supervisor/logistica/materiales?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch logistics materials");
            return response.json();
        },
        refetchInterval: 5000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
            await apiRequest("POST", `/api/supervisor/logistica/materiales/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/supervisor/logistica/materiales"] });
            toast({
                title: "Éxito",
                description: "Estado actualizado correctamente",
            });
        },
        onError: (error) => {
            console.error("Failed to update status", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al actualizar el estado",
            });
        }
    });

    const handleSort = (key: keyof SolicitudLogistica) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof SolicitudLogistica) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    const filteredAndSortedSolicitudes = solicitudes
        ? solicitudes
            .filter((s) => {
                const searchStr = searchTerm.toLowerCase();
                return (
                    s.TICKET.toLowerCase().includes(searchStr) ||
                    (s.tecnicoOrigen?.toLowerCase() || "").includes(searchStr) ||
                    (s.tecnicoDestino?.toLowerCase() || "").includes(searchStr) ||
                    s.ESTADO_BODEGA.toLowerCase().includes(searchStr) ||
                    (s.flag_regiones?.toLowerCase() || "").includes(searchStr)
                );
            })
            .sort((a, b) => {
                if (!sortConfig.key) return 0;
                const { key, direction } = sortConfig;
                let aValue = a[key];
                let bValue = b[key];

                if (aValue === null) aValue = "";
                if (bValue === null) bValue = "";

                if (aValue < bValue) return direction === "asc" ? -1 : 1;
                if (aValue > bValue) return direction === "asc" ? 1 : -1;
                return 0;
            })
        : [];

    const handleRowClick = (solicitud: SolicitudLogistica) => {
        setSelectedTicket(solicitud);
    };

    const closePanel = () => {
        setSelectedTicket(null);
    };

    const handleApprove = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        updateStatusMutation.mutate({ id, status: 'approved' });
    };

    const handleReject = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        updateStatusMutation.mutate({ id, status: 'rejected' });
    };

    return (
        <SupervisorLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Main Table Section */}
                <div
                    className={`transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-700 ${selectedTicket ? 'w-[55%]' : 'w-full'
                        } overflow-y-auto`}
                >
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Módulo Logístico
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Solicitudes y Asignación de Material - Agrupadas por Ticket
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Solicitudes Pendientes</p>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                {filteredAndSortedSolicitudes.filter(s => s.ESTADO_BODEGA !== "OK").length}
                                            </h3>
                                        </div>
                                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                            <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Solicitudes Procesadas (OK)</p>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                {filteredAndSortedSolicitudes.filter(s => s.ESTADO_BODEGA === "OK").length}
                                            </h3>
                                        </div>
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Solicitudes Rechazadas</p>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                {filteredAndSortedSolicitudes.filter(s => s.flag_gestion_supervisor === 2).length}
                                            </h3>
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                                            <XIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Solicitudes</p>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                {filteredAndSortedSolicitudes.length}
                                            </h3>
                                        </div>
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Desde:</span>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 text-xs w-[160px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Hasta:</span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-9 text-xs w-[160px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex items-center gap-2 ml-4 flex-1 max-w-sm">
                                    <div className="relative w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Buscar ticket, técnico..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 pl-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setStartDate(twoDaysAgoStr);
                                        setEndDate(todayStr);
                                        setSearchTerm("");
                                    }}
                                    className="h-9 text-xs gap-2 ml-auto"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Restablecer
                                </Button>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Solicitudes de Material
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : error ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-red-500">
                                            <AlertCircle className="h-10 w-10 mb-2" />
                                            <p>Error al cargar los datos</p>
                                        </div>
                                    ) : !solicitudes?.length ? (
                                        <div className="text-center py-12 text-slate-500">
                                            No se encontraron registros.
                                        </div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                                        <TableHead className="w-[120px] cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("TICKET")}>
                                                            <div className="flex items-center">
                                                                Ticket {getSortIcon("TICKET")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("fecha")}>
                                                            <div className="flex items-center">
                                                                Fecha {getSortIcon("fecha")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("tecnicoOrigen")}>
                                                            <div className="flex items-center">
                                                                Origen {getSortIcon("tecnicoOrigen")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("tecnicoDestino")}>
                                                            <div className="flex items-center">
                                                                Destino {getSortIcon("tecnicoDestino")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("flag_regiones")}>
                                                            <div className="flex items-center">
                                                                Región {getSortIcon("flag_regiones")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="text-center cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("total_items")}>
                                                            <div className="flex items-center justify-center">
                                                                Items {getSortIcon("total_items")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="text-center cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("total_cantidad")}>
                                                            <div className="flex items-center justify-center">
                                                                Cant. Total {getSortIcon("total_cantidad")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead>Gest. Sup</TableHead>
                                                        <TableHead className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("ESTADO_BODEGA")}>
                                                            <div className="flex items-center justify-end">
                                                                Estado {getSortIcon("ESTADO_BODEGA")}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredAndSortedSolicitudes.map((solicitud) => (
                                                        <TableRow
                                                            key={solicitud.TICKET}
                                                            onClick={() => handleRowClick(solicitud)}
                                                            className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedTicket?.TICKET === solicitud.TICKET
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                                                                : ''
                                                                }`}
                                                        >
                                                            <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                                {solicitud.TICKET}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-xs">
                                                                {solicitud.fecha
                                                                    ? format(new Date(solicitud.fecha), "dd/MM/yyyy HH:mm", {
                                                                        locale: es,
                                                                    })
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {solicitud.tecnicoOrigen || `ID: ${solicitud.tecnico}`}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {solicitud.tecnicoDestino || (solicitud.id_tecnico_traspaso === 0 ? "Bodega" : "-")}
                                                            </TableCell>
                                                            <TableCell>
                                                                {solicitud.flag_regiones || "-"}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="secondary" className="font-mono">
                                                                    {solicitud.total_items}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center font-semibold">
                                                                {solicitud.total_cantidad}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {solicitud.flag_gestion_supervisor === 1 ? "✅" : solicitud.flag_gestion_supervisor === 0 ? "⏳" : "-"}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${solicitud.ESTADO_BODEGA === "OK"
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        }`}
                                                                >
                                                                    {solicitud.ESTADO_BODEGA}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                <div
                    className={`transition-all duration-300 ease-in-out overflow-y-auto bg-white dark:bg-slate-900 ${selectedTicket ? 'w-[45%]' : 'w-0'
                        }`}
                >
                    {selectedTicket && (
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between sticky top-0 bg-white dark:bg-slate-900 pb-4 border-b border-slate-200 dark:border-slate-700 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Detalle de Solicitud
                                    </h2>
                                    <p className="text-sm text-slate-500 font-mono mt-1">
                                        {selectedTicket.TICKET}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={closePanel}
                                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Combined Header Info Row */}
                            <div className="grid grid-cols-12 gap-4 items-stretch">
                                {/* KPI Items */}
                                <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-center">
                                    <p className="text-[11px] uppercase tracking-tight font-bold text-slate-500 mb-1">Items</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                        {selectedTicket.total_items}
                                    </p>
                                </div>

                                {/* KPI Total */}
                                <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-center">
                                    <p className="text-[11px] uppercase tracking-tight font-bold text-slate-500 mb-1">Total</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                        {selectedTicket.total_cantidad}
                                    </p>
                                </div>

                                {/* Metadata & Flow */}
                                <div className="col-span-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-900/20 flex flex-col justify-between overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] uppercase font-bold text-slate-400">Fecha:</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {format(new Date(selectedTicket.fecha), "dd/MM/yy HH:mm", { locale: es })}
                                            </span>
                                        </div>
                                        <Badge className={`h-5 px-2 text-[10px] uppercase font-black border-none ${selectedTicket.ESTADO_BODEGA === "OK"
                                            ? "bg-green-500 text-white"
                                            : "bg-amber-500 text-white"
                                            }`}>
                                            {selectedTicket.ESTADO_BODEGA}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 pt-2 border-t border-blue-100/50 dark:border-blue-900/20">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 truncate">Origen</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {selectedTicket.tecnicoOrigen || `ID: ${selectedTicket.tecnico}`}
                                            </p>
                                        </div>
                                        <div className="text-slate-400 text-sm font-bold">→</div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 truncate">Destino</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {selectedTicket.tecnicoDestino || "Bodega"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials List Table */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Materiales Solicitados
                                </h3>
                                <div key={selectedTicket.TICKET} className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>Material</TableHead>
                                                <TableHead className="text-center w-[80px]">Cant.</TableHead>
                                                <TableHead className="text-right w-[100px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedTicket.items.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs text-slate-500">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                                                                {item.material}
                                                            </span>
                                                            {item.campo_item && (
                                                                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit text-slate-500">
                                                                    ID: {item.campo_item}
                                                                </code>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {item.cantidad}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={(e) => handleApprove(e, item.id)}
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:border-green-800 dark:hover:bg-green-900/20"
                                                                title="Aprobar"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={(e) => handleReject(e, item.id)}
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-800 dark:hover:bg-red-900/20"
                                                                title="Rechazar"
                                                            >
                                                                <XIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SupervisorLayout>
    );
}
