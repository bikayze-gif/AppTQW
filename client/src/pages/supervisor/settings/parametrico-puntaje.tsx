import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type PuntosParameter } from "@shared/schema";
import SettingsLayout from "./layout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, FileSpreadsheet, Pencil, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatDecimal } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from "xlsx";

type SortConfig = {
    key: keyof PuntosParameter | null;
    direction: 'asc' | 'desc';
};

export default function ParametricoPuntaje() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState<PuntosParameter | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const itemsPerPage = 10;

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: puntos, isLoading, error } = useQuery<PuntosParameter[]>({
        queryKey: ["/api/points-parameters"],
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<PuntosParameter>) => {
            if (!editingItem) return;
            return apiRequest("PATCH", `/api/points-parameters/${editingItem.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/points-parameters"] });
            toast({
                title: "Registro actualizado",
                description: "Los cambios se han guardado correctamente.",
            });
            setEditingItem(null);
        },
        onError: (error) => {
            toast({
                title: "Error al actualizar",
                description: "No se pudieron guardar los cambios. Intente nuevamente.",
                variant: "destructive",
            });
        }
    });

    const processedData = useMemo(() => {
        if (!puntos) return [];

        let result = puntos.filter((punto) => {
            const searchLower = searchTerm.toLowerCase();
            const includes = (text: string | null | undefined) =>
                text ? text.toLowerCase().includes(searchLower) : false;

            return (
                includes(punto.llave) ||
                includes(punto.trabajo) ||
                includes(punto.producto) ||
                includes(punto.tipoRed) ||
                includes(punto.id?.toString()) ||
                includes(punto.segmento) ||
                includes(punto.clasifFinal)
            );
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue === bValue) return 0;
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                const comparison = aValue < bValue ? -1 : 1;
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [puntos, searchTerm, sortConfig]);

    // Calculate pagination
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = processedData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSort = (key: keyof PuntosParameter) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof PuntosParameter }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="ml-2 h-4 w-4" /> :
            <ChevronDown className="ml-2 h-4 w-4" />;
    };

    const handleExport = () => {
        if (!puntos) return;

        // Format data for export - matching readable headers
        const dataToExport = puntos.map(p => ({
            "ID": p.id,
            "Llave": p.llave,
            "Tipo Red": p.tipoRed,
            "Trabajo": p.trabajo,
            "Producto": p.producto,
            "Clase Vivienda": p.claseVivienda,
            "Tipo Vivienda": p.tipoVivienda,
            "Puntos VTR (Oct 23)": formatDecimal(p.puntosVTROct2023),
            "Puntos TQW (Oct 23)": formatDecimal(p.puntosTQWOct23),
            "Q Act. SSPP": formatDecimal(p.qActividadSSPP),
            "Q Act. Servicio": formatDecimal(p.qActServicio),
            "RGU": formatDecimal(p.rgu),
            "Clasificación Final": p.clasifFinal,
            "Segmento": p.segmento
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Parametrico Puntaje");

        // Generate timestamp for filename
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Parametrico_Puntaje_${date}.xlsx`);
    };

    const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem) return;

        const formData = new FormData(e.currentTarget);
        const updates = {
            puntosVTROct2023: formData.get("puntosVTROct2023"),
            puntosTQWOct23: formData.get("puntosTQWOct23"),
            qActividadSSPP: formData.get("qActividadSSPP"),
            qActServicio: formData.get("qActServicio"),
            rgu: formData.get("rgu"),
            clasifFinal: formData.get("clasifFinal"),
            segmento: formData.get("segmento"),
        };

        // Simple validation/conversion if needed or let standard FormData handle strings
        // The Schema defines these as decimal/int but API usually receives JSON and inserts them
        // Drizzle/MySQL adapter typically handles string->number for decimals, but let's be safe if we want numeric types

        updateMutation.mutate(updates as any);
    };


    return (
        <SettingsLayout>
            <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Paramétrico Puntaje
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Vista completa de la tabla maestra de puntos (TP_PTOS_23_NEW).
                        </p>
                    </div>
                    <Button
                        onClick={handleExport}
                        disabled={!puntos || puntos.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>

                {/* Filters & Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar en todos los campos..."
                            className="pl-9 bg-white dark:bg-slate-800"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        Mostrando {currentItems?.length} de {totalItems} registros (Total DB: {puntos?.length})
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                No se pudieron cargar los datos de puntajes.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <TableHead className="w-[50px]">Acción</TableHead>
                                                <TableHead
                                                    className="w-[60px] whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('id')}
                                                >
                                                    <div className="flex items-center">ID <SortIcon columnKey="id" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="min-w-[200px] whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('llave')}
                                                >
                                                    <div className="flex items-center">Llave <SortIcon columnKey="llave" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('tipoRed')}
                                                >
                                                    <div className="flex items-center">T. Red <SortIcon columnKey="tipoRed" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="min-w-[150px] whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('trabajo')}
                                                >
                                                    <div className="flex items-center">Trabajo <SortIcon columnKey="trabajo" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="min-w-[150px] whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('producto')}
                                                >
                                                    <div className="flex items-center">Producto <SortIcon columnKey="producto" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('claseVivienda')}
                                                >
                                                    <div className="flex items-center">Clase Viv. <SortIcon columnKey="claseVivienda" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('tipoVivienda')}
                                                >
                                                    <div className="flex items-center">Tipo Viv. <SortIcon columnKey="tipoVivienda" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="text-right whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('puntosVTROct2023')}
                                                >
                                                    <div className="flex items-center justify-end">Pts VTR <SortIcon columnKey="puntosVTROct2023" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="text-right whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('puntosTQWOct23')}
                                                >
                                                    <div className="flex items-center justify-end">Pts TQW <SortIcon columnKey="puntosTQWOct23" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="text-right whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('qActividadSSPP')}
                                                >
                                                    <div className="flex items-center justify-end">Q SSPP <SortIcon columnKey="qActividadSSPP" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="text-right whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('qActServicio')}
                                                >
                                                    <div className="flex items-center justify-end">Q Serv. <SortIcon columnKey="qActServicio" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="text-right whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('rgu')}
                                                >
                                                    <div className="flex items-center justify-end">RGU <SortIcon columnKey="rgu" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('clasifFinal')}
                                                >
                                                    <div className="flex items-center">Clasificación <SortIcon columnKey="clasifFinal" /></div>
                                                </TableHead>
                                                <TableHead
                                                    className="whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => handleSort('segmento')}
                                                >
                                                    <div className="flex items-center">Segmento <SortIcon columnKey="segmento" /></div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems?.map((punto) => (
                                                <TableRow key={punto.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                            onClick={() => setEditingItem(punto)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="font-medium whitespace-nowrap">{punto.id}</TableCell>
                                                    <TableCell className="max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis" title={punto.llave || ""}>
                                                        {punto.llave}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                ${punto.tipoRed === 'FTTH' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                punto.tipoRed === 'HFC' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            {punto.tipoRed}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{punto.trabajo}</TableCell>
                                                    <TableCell className="whitespace-nowrap">{punto.producto}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-xs text-slate-500">{punto.claseVivienda}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-xs text-slate-500">{punto.tipoVivienda}</TableCell>

                                                    <TableCell className="text-right whitespace-nowrap text-slate-500">{formatDecimal(punto.puntosVTROct2023)}</TableCell>
                                                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                        {formatDecimal(punto.puntosTQWOct23)}
                                                    </TableCell>
                                                    <TableCell className="text-right whitespace-nowrap text-xs">{formatDecimal(punto.qActividadSSPP)}</TableCell>
                                                    <TableCell className="text-right whitespace-nowrap text-xs">{formatDecimal(punto.qActServicio)}</TableCell>
                                                    <TableCell className="text-right whitespace-nowrap font-medium">{formatDecimal(punto.rgu)}</TableCell>

                                                    <TableCell className="whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                                            {punto.clasifFinal}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-xs text-slate-500">{punto.segmento}</TableCell>
                                                </TableRow>
                                            ))}
                                            {currentItems?.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={15} className="h-24 text-center">
                                                        No se encontraron resultados.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage > 1) handlePageChange(currentPage - 1);
                                                }}
                                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let displayPage = i + 1;
                                            if (totalPages > 5) {
                                                if (currentPage > 3) {
                                                    displayPage = currentPage - 2 + i;
                                                }
                                                if (displayPage > totalPages) {
                                                    displayPage = totalPages - (4 - i);
                                                }
                                            }

                                            return (
                                                <PaginationItem key={displayPage}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === displayPage}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(displayPage);
                                                        }}
                                                    >
                                                        {displayPage}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                                }}
                                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        <li className="text-sm text-slate-500 ml-4">
                                            Pg. {currentPage} de {totalPages}
                                        </li>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>

                <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Puntos</DialogTitle>
                            <DialogDescription>
                                Modifique los valores para el registro ID: {editingItem?.id}
                                <br />
                                <span className="text-xs text-slate-500">{editingItem?.llave}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSave}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="puntosVTROct2023" className="text-right">
                                        Pts VTR
                                    </Label>
                                    <Input id="puntosVTROct2023" name="puntosVTROct2023" defaultValue={editingItem?.puntosVTROct2023 as any} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="puntosTQWOct23" className="text-right">
                                        Pts TQW
                                    </Label>
                                    <Input id="puntosTQWOct23" name="puntosTQWOct23" defaultValue={editingItem?.puntosTQWOct23 as any} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="qActividadSSPP" className="text-right">
                                        Q SSPP
                                    </Label>
                                    <Input id="qActividadSSPP" name="qActividadSSPP" defaultValue={editingItem?.qActividadSSPP as any} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="qActServicio" className="text-right">
                                        Q Serv.
                                    </Label>
                                    <Input id="qActServicio" name="qActServicio" defaultValue={editingItem?.qActServicio as any} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rgu" className="text-right">
                                        RGU
                                    </Label>
                                    <Input id="rgu" name="rgu" defaultValue={editingItem?.rgu as any} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="clasifFinal" className="text-right">
                                        Clasificación
                                    </Label>
                                    <Input id="clasifFinal" name="clasifFinal" defaultValue={editingItem?.clasifFinal || ""} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="segmento" className="text-right">
                                        Segmento
                                    </Label>
                                    <Input id="segmento" name="segmento" defaultValue={editingItem?.segmento || ""} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </SettingsLayout>
    );
}
