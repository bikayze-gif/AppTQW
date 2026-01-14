import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, AlertCircle, X, Package, ChevronRight } from "lucide-react";
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
    const [selectedTicket, setSelectedTicket] = useState<SolicitudLogistica | null>(null);

    const { data: solicitudes, isLoading, error } = useQuery<SolicitudLogistica[]>({
        queryKey: ["/api/supervisor/logistica/materiales"],
    });

    const handleRowClick = (solicitud: SolicitudLogistica) => {
        setSelectedTicket(solicitud);
    };

    const closePanel = () => {
        setSelectedTicket(null);
    };

    return (
        <SupervisorLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Main Table Section */}
                <div
                    className={`transition-all duration-300 ease-in-out ${selectedTicket ? 'w-[70%]' : 'w-full'
                        } overflow-y-auto border-r border-slate-200 dark:border-slate-700`}
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
                                                        <TableHead className="w-[120px]">Ticket</TableHead>
                                                        <TableHead>Fecha</TableHead>
                                                        <TableHead>Origen</TableHead>
                                                        <TableHead>Destino</TableHead>
                                                        <TableHead>Región</TableHead>
                                                        <TableHead className="text-center">Items</TableHead>
                                                        <TableHead className="text-center">Cant. Total</TableHead>
                                                        <TableHead>Gest. Sup</TableHead>
                                                        <TableHead className="text-right">Estado</TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {solicitudes.map((solicitud) => (
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
                    className={`transition-all duration-300 ease-in-out overflow-y-auto bg-white dark:bg-slate-900 ${selectedTicket ? 'w-[30%]' : 'w-0'
                        }`}
                >
                    {selectedTicket && (
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between sticky top-0 bg-white dark:bg-slate-900 pb-4 border-b border-slate-200 dark:border-slate-700">
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

                            {/* Summary Info */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Items</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {selectedTicket.total_items}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cantidad Total</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {selectedTicket.total_cantidad}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Fecha de Solicitud</p>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                        {format(new Date(selectedTicket.fecha), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                            locale: es,
                                        })}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Origen:</span>
                                        <span className="text-sm font-medium">{selectedTicket.tecnicoOrigen || `ID: ${selectedTicket.tecnico}`}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">Destino:</span>
                                        <span className="text-sm font-medium">{selectedTicket.tecnicoDestino || "Bodega"}</span>
                                    </div>
                                    {selectedTicket.flag_regiones && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">Región:</span>
                                            <span className="text-sm font-medium">{selectedTicket.flag_regiones}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Materials List */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Materiales Solicitados
                                </h3>
                                <div className="space-y-2">
                                    {selectedTicket.items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-xs font-mono text-slate-400">#{index + 1}</span>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {item.cantidad} unid.
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mb-2 leading-tight">
                                                {item.material}
                                            </p>
                                            {item.campo_item && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">Código Oracle:</span>
                                                    <code className="text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                        {item.campo_item}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SupervisorLayout>
    );
}
