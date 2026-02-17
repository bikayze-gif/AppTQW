import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X, Package, User, ArrowRight, MapPin, UserCheck, Calendar, Hash } from "lucide-react";
import { MaterialRequest } from "./context";

interface RequestDetailSheetProps {
    request: MaterialRequest | null;
    open: boolean;
    onClose: () => void;
}

export function RequestDetailSheet({ request, open, onClose }: RequestDetailSheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const statusMutation = useMutation({
        mutationFn: async (status: "approved" | "rejected") => {
            await apiRequest("POST", `/api/supervisor/logistica/materiales/${request!.id}/status`, { status });
        },
        onSuccess: (_, status) => {
            queryClient.invalidateQueries({ queryKey: ["/api/materials/solicitudes"] });
            toast({
                title: "Éxito",
                description: status === "approved" ? "Solicitud aprobada correctamente" : "Solicitud rechazada correctamente",
            });
            onClose();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar el estado de la solicitud",
            });
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APROBADO":
                return <Badge className="bg-emerald-500 text-white border-none">Aprobado</Badge>;
            case "RECHAZADO":
                return <Badge className="bg-red-500 text-white border-none">Rechazado</Badge>;
            default:
                return <Badge className="bg-amber-500 text-white border-none">Pendiente</Badge>;
        }
    };

    if (!request) return null;

    return (
        <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Detalle de Solicitud
                    </SheetTitle>
                    <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                        {request.ticketToken}
                    </p>
                </SheetHeader>

                <div className="space-y-5 pt-5">
                    {/* Status + Date row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {format(new Date(request.date), "dd MMM yyyy HH:mm", { locale: es })}
                            </span>
                        </div>
                        {getStatusBadge(request.status)}
                    </div>

                    {/* Flow: Origen → Destino */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Origen</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {request.originTechnician || "—"}
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0 text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Destino</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {request.destinationTechnician || "Bodega"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-3">
                        {request.supervisorName && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                                    <UserCheck className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Supervisor</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{request.supervisorName}</p>
                                </div>
                            </div>
                        )}
                        {request.flagRegiones && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Región</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{request.flagRegiones}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Material detail */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Material
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {request.materialName}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Cantidad</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                    {request.quantity}
                                </p>
                            </div>
                            {request.itemCode && (
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 justify-end">
                                        <Hash className="h-3 w-3" /> Código
                                    </p>
                                    <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                        {request.itemCode}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions — only if PENDIENTE */}
                    {request.status === "PENDIENTE" && (
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 gap-2"
                                onClick={() => statusMutation.mutate("rejected")}
                                disabled={statusMutation.isPending}
                            >
                                <X className="h-4 w-4" />
                                Rechazar
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                onClick={() => statusMutation.mutate("approved")}
                                disabled={statusMutation.isPending}
                            >
                                <Check className="h-4 w-4" />
                                Aprobar
                            </Button>
                        </div>
                    )}

                    {/* Read-only message for non-pending */}
                    {request.status !== "PENDIENTE" && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
                            Esta solicitud ya fue gestionada y no puede modificarse.
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
