import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { ArrowUpDown, Search, Loader2 } from "lucide-react";
import type { MaestroToaPaso } from "@shared/schema";

export function ManualAssignmentTable() {
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["maestro-toa-paso", page, limit, search, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                sortBy,
                sortOrder,
            });
            const res = await fetch(`/api/supervisor/logistica/maestro-toa-paso?${params}`);
            if (!res.ok) throw new Error("Failed to fetch data");
            return res.json() as Promise<{ data: MaestroToaPaso[]; total: number }>;
        },
        placeholderData: (previousData) => previousData,
    });

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    const renderSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} />;
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "sistemaLegado", label: "Sistema Legado" },
        { key: "sociedad", label: "Sociedad" },
        { key: "rutTecnico", label: "RUT Técnico" },
        { key: "centro", label: "Centro" },
        { key: "almacen", label: "Almacén" },
        { key: "material", label: "Material" },
        { key: "numeroDeSerie", label: "N° Serie" },
        { key: "cantidad", label: "Cant." },
        { key: "fechaEntrega", label: "F. Entrega" },
        { key: "nombreTecnico", label: "Nombre Técnico" },
        { key: "fechaInstalacion", label: "F. Instalación" },
        { key: "nOrden", label: "N° Orden" },
        { key: "rutCliente", label: "RUT Cliente" },
        { key: "familiaMaterial", label: "Familia" },
        { key: "resultadoCargaEnSap", label: "Carga SAP" },
        { key: "fechaCarga", label: "F. Carga" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total registros: {data?.total || 0}
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="cursor-pointer whitespace-nowrap bg-muted/50"
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center">
                                        {col.label}
                                        {renderSortIcon(col.key)}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Cargando datos...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                                    Error al cargar datos.
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    {columns.map(col => (
                                        <TableCell key={`${row.id}-${col.key}`} className="whitespace-nowrap">
                                            {col.key === 'fechaCarga' && row.fechaCarga
                                                ? new Date(row.fechaCarga).toLocaleString()
                                                : String(row[col.key as keyof MaestroToaPaso] || "")
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <span className="px-4 text-sm font-medium">
                                Página {page} de {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Siguiente
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
