import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, Plus, Trash2, Calendar, Users, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import SettingsLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { PROFILES } from "./permissions";

export default function NotificationsSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState<string>("info");
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [expiresAt, setExpiresAt] = useState("");

    // Fetch notifications
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["admin-notifications"],
        queryFn: async () => {
            const response = await fetch("/api/notifications?includeInactive=true");
            if (!response.ok) throw new Error("Failed to fetch notifications");
            return response.json();
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to create notification");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
            setIsCreateOpen(false);
            resetForm();
            toast({
                title: "Notificación creada",
                description: "La notificación ha sido enviada a los usuarios seleccionados.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudo crear la notificación.",
                variant: "destructive",
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api/notifications/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete notification");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
            toast({
                title: "Notificación eliminada",
                description: "La notificación ha sido eliminada correctamente.",
            });
        },
    });

    const resetForm = () => {
        setTitle("");
        setContent("");
        setPriority("info");
        setSelectedProfiles([]);
        setExpiresAt("");
    };

    const handleSubmit = () => {
        if (!title || !content || selectedProfiles.length === 0) {
            toast({
                title: "Campos requeridos",
                description: "Por favor complete título, contenido y seleccione al menos un perfil.",
                variant: "destructive",
            });
            return;
        }

        createMutation.mutate({
            title,
            content,
            priority,
            profiles: selectedProfiles,
            expiresAt: expiresAt || null,
        });
    };

    const toggleProfile = (profile: string) => {
        setSelectedProfiles(prev =>
            prev.includes(profile)
                ? prev.filter(p => p !== profile)
                : [...prev, profile]
        );
    };

    const toggleAllProfiles = () => {
        if (selectedProfiles.length === PROFILES.length) {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles([...PROFILES]);
        }
    };

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case "error": return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Error</Badge>;
            case "warning": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Warning</Badge>;
            case "success": return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Success</Badge>;
            default: return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Info</Badge>;
        }
    };

    return (
        <SettingsLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Notificaciones</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Administra las notificaciones enviadas a los usuarios del sistema.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Notificación
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Crear Nueva Notificación</DialogTitle>
                                <DialogDescription>
                                    Envía una notificación a los perfiles seleccionados. Aparecerá en tiempo real.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="title" className="text-sm font-medium">Título</label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Mantenimiento Programado"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="content" className="text-sm font-medium">Contenido</label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Escribe el mensaje de la notificación..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Prioridad</label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Información</SelectItem>
                                                <SelectItem value="success">Éxito</SelectItem>
                                                <SelectItem value="warning">Advertencia</SelectItem>
                                                <SelectItem value="error">Error/Crítico</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Expiración (Opcional)</label>
                                        <Input
                                            type="datetime-local"
                                            value={expiresAt}
                                            onChange={(e) => setExpiresAt(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">Perfiles Destino</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleAllProfiles}
                                            className="h-auto py-0 px-2 text-xs"
                                        >
                                            {selectedProfiles.length === PROFILES.length ? "Deseleccionar todos" : "Seleccionar todos"}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border rounded-md p-4 max-h-[150px] overflow-y-auto">
                                        {PROFILES.map((profile) => (
                                            <div key={profile} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`profile-${profile}`}
                                                    checked={selectedProfiles.includes(profile)}
                                                    onCheckedChange={() => toggleProfile(profile)}
                                                />
                                                <label
                                                    htmlFor={`profile-${profile}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {profile}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Enviando..." : "Enviar Notificación"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Historial de Notificaciones</h4>

                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border rounded-lg border-dashed">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay notificaciones registradas</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                                    <TableRow>
                                        <TableHead className="w-[80px]">Prioridad</TableHead>
                                        <TableHead className="w-[180px]">Fecha</TableHead>
                                        <TableHead>Notificación</TableHead>
                                        <TableHead>Perfiles</TableHead>
                                        <TableHead className="w-[150px]">Autor</TableHead>
                                        <TableHead className="text-right w-[80px]">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.map((notification: any) => (
                                        <TableRow key={notification.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {getPriorityBadge(notification.priority)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                                                </div>
                                                {notification.expiresAt && (
                                                    <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Expira: {format(new Date(notification.expiresAt), "dd/MM HH:mm", { locale: es })}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-slate-900 dark:text-white leading-none">
                                                        {notification.title}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                                        {notification.content}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {notification.profiles.map((p: string) => (
                                                        <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                                {notification.createdByName || "Desconocido"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => {
                                                        if (confirm("¿Estás seguro de eliminar esta notificación?")) {
                                                            deleteMutation.mutate(notification.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
}

// Utility to combine class names
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
