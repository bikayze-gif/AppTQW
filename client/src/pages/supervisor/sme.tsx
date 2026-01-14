import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Search,
    Plus,
    RotateCcw,
    Save,
    CheckCircle2,
    AlertCircle,
    FileText,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Download,
    Sheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// Form Schema
const smeFormSchema = z.object({
    nombre_tecnico: z.string().min(1, "Nombre de técnico es requerido"),
    nombre_coordinador: z.string().min(1, "Nombre de coordinador es requerido"),
    actividad: z.string().min(1, "Actividad es requerida"),
    fecha: z.string().min(1, "Fecha es requerida"),
    hora_inicio: z.string().min(1, "Hora de inicio es requerida"),
    hora_termino: z.string().min(1, "Hora de término es requerida"),
    zona: z.string().min(1, "Zona es requerida"),
    localidad: z.string().min(1, "Localidad es requerida"),
    nombre_cliente: z.string().min(1, "Nombre del cliente es requerido"),
    rut_cliente: z.string().min(1, "RUT del cliente es requerido"),
    direccion: z.string().min(1, "Dirección es requerida"),
    observacion: z.string().min(1, "Observación es requerida"),
});

type SmeFormValues = z.infer<typeof smeFormSchema>;

const COORDINATORS = [
    "Ana Inzunza",
    "Carlos Chacin",
    "Cristian Leyton",
    "Cristobal Valenzuela",
    "Daniela Olguin",
    "Francisco Cortes",
    "Nicolas Bustamante",
    "Rene Almonacid"
];

const ACTIVITIES = [
    "Reunión",
    "Capacitacion",
    "Viaje",
    "Factibilidad",
    "Actividad Instalación sin OT",
    "Actividad Reparación sin OT",
    "Sin actividad en la zona",
    "Visita Escuela",
    "Alta MyUC / FTTH",
    "Reparación HPBX / MyUC",
    "Permiso por retiro anticipado",
    "Condición climática",
    "Mantención de camioneta"
];

const ZONAS = ["Centro", "Norte", "Sur", "Metro"];

export default function SupervisorSME() {
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const form = useForm<SmeFormValues>({
        resolver: zodResolver(smeFormSchema),
        defaultValues: {
            nombre_tecnico: "",
            nombre_coordinador: "",
            actividad: "",
            fecha: new Date().toISOString().split("T")[0],
            hora_inicio: "",
            hora_termino: "",
            zona: "",
            localidad: "",
            nombre_cliente: "",
            rut_cliente: "",
            direccion: "",
            observacion: "",
        },
    });

    // Queries
    const { data: technicians, isLoading: isLoadingTechs } = useQuery({
        queryKey: ["/api/sme/technicians"],
        queryFn: async () => {
            const response = await fetch("/api/sme/technicians");
            if (!response.ok) throw new Error("Failed to fetch technicians");
            return response.json();
        }
    });

    const { data: localidades, isLoading: isLoadingLocalidades } = useQuery({
        queryKey: ["/api/sme/localidades", selectedZona],
        queryFn: async () => {
            if (!selectedZona) return [];
            const response = await fetch(`/api/sme/localidades/${selectedZona}`);
            if (!response.ok) throw new Error("Failed to fetch localidades");
            return response.json();
        },
        enabled: !!selectedZona,
    });

    const { data: activities, isLoading: isLoadingActivities } = useQuery({
        queryKey: ["/api/sme/activities", startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const response = await fetch(`/api/sme/activities?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch activities");
            return response.json();
        }
    });


    // Mutation
    const createActivityMutation = useMutation({
        mutationFn: async (data: SmeFormValues) => {
            const response = await fetch("/api/sme/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to save activity");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sme/activities"] });
            toast.success("Actividad guardada exitosamente");
            form.reset({
                ...form.getValues(),
                nombre_cliente: "",
                rut_cliente: "",
                direccion: "",
                observacion: "",
                hora_inicio: "",
                hora_termino: "",
            });
        },
        onError: (error) => {
            toast.error("Error al guardar la actividad: " + error.message);
        },
    });

    function onSubmit(data: SmeFormValues) {
        createActivityMutation.mutate(data);
    }

    // Sorting and Filtering Logic
    const filteredAndSortedData = useMemo(() => {
        let data = activities || [];

        // Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter((row: any) =>
                (row.technicianName?.toLowerCase() || "").includes(lowerSearch) ||
                (row.NombreTecnico?.toLowerCase() || "").includes(lowerSearch) ||
                (row.NombreCoordinador?.toLowerCase() || "").includes(lowerSearch) ||
                (row.Actividad?.toLowerCase() || "").includes(lowerSearch) ||
                (row.nombre_cliente?.toLowerCase() || "").includes(lowerSearch) ||
                (row.rut_cliente?.toLowerCase() || "").includes(lowerSearch)
            );
        }

        // Sort
        if (sortConfig) {
            data = [...data].sort((a, b) => {
                let aVal: any = a[sortConfig.key];
                let bVal: any = b[sortConfig.key];

                // Handle special fields
                if (sortConfig.key === 'technician') {
                    aVal = a.technicianName || a.NombreTecnico;
                    bVal = b.technicianName || b.NombreTecnico;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [activities, searchTerm, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleExport = () => {
        if (!filteredAndSortedData.length) {
            toast.error("No hay datos para exportar");
            return;
        }

        const exportData = filteredAndSortedData.map((row: any) => ({
            ID: row.ID,
            Técnico: row.technicianName || row.NombreTecnico,
            Coordinador: row.NombreCoordinador,
            Fecha: new Date(row.Fecha).toLocaleDateString(),
            Inicio: row.HoraInicio,
            Término: row.HoraTermino,
            Actividad: row.Actividad,
            Zona: row.zona,
            Localidad: row.localidad,
            'Nombre Cliente': row.nombre_cliente,
            'RUT Cliente': row.rut_cliente,
            Dirección: row.direccion,
            Observación: row.observacion
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SME_Activities");
        XLSX.writeFile(wb, `SME_Activities_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel generado correctamente");
    };

    // Handle Zona change to update Localidades
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "zona") {
                setSelectedZona(value.zona || "");
                form.setValue("localidad", "");
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <SupervisorLayout>
            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                <Wrench className="w-6 h-6" />
                            </div>
                            Formulario SME
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Registro de actividades para técnicos del área SME.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-slate-900 shadow-sm border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-medium">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Form Section */}
                    <Card className="lg:col-span-5 border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                Ingreso de Datos
                            </CardTitle>
                            <CardDescription>
                                Complete todos los campos marcados con (*)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nombre_tecnico"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5" /> Nombre Técnico *
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                                <SelectValue placeholder="Seleccionar técnico" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingTechs ? (
                                                                <div className="p-2 space-y-1">
                                                                    <Skeleton className="h-8 w-full" />
                                                                    <Skeleton className="h-8 w-full" />
                                                                </div>
                                                            ) : (
                                                                technicians?.filter((t: any) => !!t.rut).map((tech: any) => (
                                                                    <SelectItem key={tech.rut} value={tech.rut}>
                                                                        {tech.name} ({tech.rut})
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="nombre_coordinador"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre Coordinador *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                                <SelectValue placeholder="Seleccionar coordinador" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {COORDINATORS.map((name) => (
                                                                <SelectItem key={name} value={name}>
                                                                    {name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="actividad"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Actividad *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                            <SelectValue placeholder="Seleccionar actividad" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ACTIVITIES.map((act) => (
                                                            <SelectItem key={act} value={act}>
                                                                {act}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fecha"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fecha *</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="hora_inicio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" /> Inicio *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="hora_termino"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" /> Término *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="zona"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5" /> Zona *
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                                <SelectValue placeholder="Seleccionar zona" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ZONAS.map((z) => (
                                                                <SelectItem key={z} value={z}>{z}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="localidad"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Localidad *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={!selectedZona || isLoadingLocalidades}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                                <SelectValue placeholder={selectedZona ? "Seleccionar localidad" : "Primero elija zona"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {localidades?.filter((l: any) => !!l.COMUNA_1).map((loc: any) => (
                                                                <SelectItem key={loc.COMUNA_1} value={loc.COMUNA_1}>
                                                                    {loc.Comuna_2}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nombre_cliente"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre Cliente *</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ej: Juan Pérez" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="rut_cliente"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>RUT Cliente *</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ej: 12.345.678-9" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="direccion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Dirección completa" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="observacion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observación *</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Detalles adicionales de la actividad..."
                                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[80px]"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                                            disabled={createActivityMutation.isPending}
                                        >
                                            {createActivityMutation.isPending ? (
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" /> Guardando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Guardar Actividad
                                                </div>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-none px-4"
                                            onClick={() => {
                                                form.reset();
                                                setSelectedZona("");
                                            }}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Table Section */}
                    <Card className="lg:col-span-7 border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                        <CardHeader className="pb-4">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-emerald-500" />
                                            Registros SME
                                        </CardTitle>
                                        <CardDescription>
                                            Historial de actividades según rango seleccionado
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-[200px]">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Buscar registros..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-9 bg-slate-100/50 dark:bg-slate-800/50 border-none h-9 text-sm"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleExport}
                                            className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Excel
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">Desde:</span>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-8 text-xs w-[130px] bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">Hasta:</span>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="h-8 text-xs w-[130px] bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <ScrollArea className="h-[calc(100vh-320px)]">
                                <div className="min-w-[800px]">
                                    <Table>
                                        <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                            <TableRow>
                                                <TableHead
                                                    className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-500 transition-colors"
                                                    onClick={() => handleSort('technician')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Técnico/Coordinador
                                                        {sortConfig?.key === 'technician' && (
                                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-500 transition-colors"
                                                    onClick={() => handleSort('Actividad')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Actividad
                                                        {sortConfig?.key === 'Actividad' && (
                                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="font-bold text-slate-700 dark:text-slate-300 text-center cursor-pointer hover:text-blue-500 transition-colors"
                                                    onClick={() => handleSort('Fecha')}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Fecha/Hora
                                                        {sortConfig?.key === 'Fecha' && (
                                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-500 transition-colors"
                                                    onClick={() => handleSort('zona')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Zona/Localidad
                                                        {sortConfig?.key === 'zona' && (
                                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-500 transition-colors"
                                                    onClick={() => handleSort('nombre_cliente')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Cliente
                                                        {sortConfig?.key === 'nombre_cliente' && (
                                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-bold text-slate-700 dark:text-slate-300 max-w-[200px]">Obs</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingActivities ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                        <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /><Skeleton className="h-3 w-16 mt-1 mx-auto" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-20 mt-1" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (!activities || activities.length === 0) ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-64 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-400 italic">
                                                            <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                                                            No se encontraron registros activos.
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredAndSortedData.map((row: any) => (
                                                    <TableRow key={row.ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <TableCell>
                                                            <div className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate max-w-[150px]">
                                                                {row.technicianName || row.NombreTecnico}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                                Coord: {row.NombreCoordinador}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="font-normal text-[10px] py-0 px-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none shadow-none">
                                                                {row.Actividad}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-center">
                                                                <span className="font-mono text-[10px] block">
                                                                    {new Date(row.Fecha).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 block mt-1">
                                                                    {row.HoraInicio} - {row.HoraTermino}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs text-slate-700 dark:text-slate-300">{row.zona}</div>
                                                            <div className="text-[10px] text-slate-500">{row.localidad}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs font-medium">{row.nombre_cliente}</div>
                                                            <div className="text-[10px] text-slate-500">{row.rut_cliente}</div>
                                                            <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{row.direccion}</div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            <div className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 italic" title={row.observacion}>
                                                                "{row.observacion}"
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                                <div>Mostrando los últimos 100 registros</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Actualizado en tiempo real
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SupervisorLayout>
    );
}
