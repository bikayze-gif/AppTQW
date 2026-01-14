import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SolicitudLogistica {
    id: number;
    material: string;
    cantidad: number;
    fecha: string;
    tecnico: string;
    TICKET: string;
    FLAG_BODEGA: number | null;
    id_tecnico_traspaso: number | null;
    id_material: number | null;
    flag_regiones: string | null;
    flag_gestion_supervisor: number | null;
    flag_gestion_bodega: string | null;
    campo_item: string | null;
    tecnicoOrigen: string | null;
    tecnicoDestino: string | null;
    ESTADO_BODEGA: string;
}

export default function SupervisorModuloLogistico() {
    const { data: solicitudes, isLoading, error } = useQuery<SolicitudLogistica[]>({
        queryKey: ["/api/supervisor/logistica/materiales"],
    });

    return (
        <SupervisorLayout>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Módulo Logístico
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Historial Completo de Solicitudes y Asignación de Material - Home Bodega New
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Todas las Solicitudes</CardTitle>
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
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Ticket</TableHead>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Item Oracle</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Origen</TableHead>
                                            <TableHead>Destino</TableHead>
                                            <TableHead>Región</TableHead>
                                            <TableHead>Gest. Sup</TableHead>
                                            <TableHead>Gest. Bodega</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {solicitudes.map((solicitud) => (
                                            <TableRow key={solicitud.id}>
                                                <TableCell className="text-slate-500 text-xs">
                                                    {solicitud.id}
                                                </TableCell>
                                                <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                                    {solicitud.TICKET}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={solicitud.material}>
                                                    {solicitud.material}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {solicitud.cantidad}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                                        {solicitud.campo_item || "-"}
                                                    </code>
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
                                                    {solicitud.flag_gestion_supervisor === 1 ? "✅" : solicitud.flag_gestion_supervisor === 0 ? "⏳" : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {solicitud.flag_gestion_bodega || "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${solicitud.ESTADO_BODEGA === "OK"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                                            }`}
                                                    >
                                                        {solicitud.ESTADO_BODEGA}
                                                    </span>
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
        </SupervisorLayout>
    );
}
