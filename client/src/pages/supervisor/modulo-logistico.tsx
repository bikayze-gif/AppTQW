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
    TICKET: string;
    Nombre_short: string;
    fecha: string;
    id_tecnico_traspaso: number | null;
    tecnicoDestino: string | null;
    ESTADO: string;
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
                        Solicitudes y Asignación de Material - Home Bodega New
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Solicitudes Pendientes</CardTitle>
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
                                No hay solicitudes pendientes.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ticket</TableHead>
                                            <TableHead>Técnico Origen</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Técnico Destino</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {solicitudes.map((solicitud, index) => (
                                            <TableRow key={`${solicitud.TICKET}-${index}`}>
                                                <TableCell className="font-medium text-slate-900 dark:text-white">
                                                    {solicitud.TICKET}
                                                </TableCell>
                                                <TableCell>{solicitud.Nombre_short}</TableCell>
                                                <TableCell>
                                                    {solicitud.fecha
                                                        ? format(new Date(solicitud.fecha), "dd MMM yyyy HH:mm", {
                                                            locale: es,
                                                        })
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {solicitud.tecnicoDestino || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${solicitud.ESTADO === "OK"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                            }`}
                                                    >
                                                        {solicitud.ESTADO}
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
