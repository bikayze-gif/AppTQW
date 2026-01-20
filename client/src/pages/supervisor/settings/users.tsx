import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search,
    UserCog,
    Info,
    Settings,
    Shield,
    User as UserIcon,
    Mail,
    ArrowUpDown,
    Download,
    Filter,
    Users as UsersIcon
} from "lucide-react";
import { utils, writeFile } from "xlsx";

import SettingsLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(15);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User | null; direction: 'asc' | 'desc' }>({
        key: 'nombre',
        direction: 'asc'
    });

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ["users-tqw"],
        queryFn: async () => {
            const response = await fetch("/api/users-tqw");
            if (!response.ok) throw new Error("Failed to fetch users");
            return response.json();
        },
    });

    const handleSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        if (!processedData.length) return;

        const dataToExport = processedData.map(user => ({
            ID: user.id,
            Nombre: user.nombre || '',
            Email: user.email || '',
            Supervisor: user.supervisor || '',
            RUT: user.rut || '',
            Perfil: user.PERFIL || '',
            Area: user.area || '',
            Estado: user.vigente === "Si" ? "Activo" : "Inactivo"
        }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Usuarios");
        writeFile(wb, `usuarios_tqw_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const parseValue = (value: any) => {
        if (value === null || value === undefined) return "";
        if (typeof value === 'string') return value.toLowerCase();
        return value;
    };

    const processedData = useMemo(() => {
        let filtered = users.filter(user =>
            (statusFilter === 'all' ||
                (statusFilter === 'active' && user.vigente === 'Si') ||
                (statusFilter === 'inactive' && user.vigente !== 'Si')) &&
            (user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.rut?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const valA = parseValue(a[sortConfig.key!]);
                const valB = parseValue(b[sortConfig.key!]);

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [users, searchTerm, statusFilter, sortConfig]);

    const paginatedData = useMemo(() => {
        return processedData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        );
    }, [processedData, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(processedData.length / rowsPerPage);

    const getRoleBadge = (perfil: string | null) => {
        if (!perfil) return <Badge variant="outline">N/A</Badge>;
        const p = perfil.toLowerCase();
        if (p.includes("admin")) return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
        if (p.includes("gerencia")) return <Badge className="bg-blue-600 hover:bg-blue-700">Gerencia</Badge>;
        if (p.includes("supervisor")) return <Badge className="bg-indigo-500 hover:bg-indigo-600">Supervisor</Badge>;
        if (p.includes("tecnico")) return <Badge className="bg-emerald-500 hover:bg-emerald-600">Técnico</Badge>;
        return <Badge variant="secondary">{perfil}</Badge>;
    };

    return (
        <SettingsLayout>
            <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950">
                <div className="p-6 pb-4 space-y-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <UsersIcon className="w-6 h-6 text-blue-500" />
                                Gestión de Usuarios TQW
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Visualización y administración de la tabla maestra de usuarios.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="h-9 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Download className="w-4 h-4 mr-2 text-slate-500" />
                                Exportar
                            </Button>
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                    Total: {processedData.length} usuarios
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Buscar por nombre, email o RUT..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="w-[180px]">
                            <Select value={statusFilter} onValueChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-slate-500" />
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" className="gap-2 h-11 px-5 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hidden md:flex">
                            <Shield className="w-4 h-4 text-purple-500" />
                            Roles y Permisos
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6 pt-4">
                    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[140px] font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12">Acciones</TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('nombre')}
                                            >
                                                <div className="flex items-center gap-2">Nombre <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('email')}
                                            >
                                                <div className="flex items-center gap-2">Email / Login <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('supervisor')}
                                            >
                                                <div className="flex items-center gap-2">Supervisor <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('rut')}
                                            >
                                                <div className="flex items-center gap-2">RUT <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('PERFIL')}
                                            >
                                                <div className="flex items-center gap-2">Perfil <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('area')}
                                            >
                                                <div className="flex items-center gap-2">Area / Zona <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                            <TableHead
                                                className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider h-12 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                                                onClick={() => handleSort('vigente')}
                                            >
                                                <div className="flex items-center justify-center gap-2">Estado <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 15 }).map((_, i) => (
                                                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                                                    <TableCell><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-40 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell> {/* Supervisor Skeleton */}
                                                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <Search className="w-12 h-12 opacity-10 mb-4" />
                                                        <p className="text-lg font-medium">No se encontraron resultados</p>
                                                        <p className="text-sm opacity-60">Prueba con otros términos de búsqueda</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border-slate-100 dark:border-slate-800 group h-16">
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                                                title="Editar Configuración"
                                                            >
                                                                <UserCog className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg transition-all"
                                                                title="Información Detallada"
                                                            >
                                                                <Info className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"
                                                                title="Ajustes de Sistema"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        <div className="flex flex-col py-1">
                                                            <span className="text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.nombre || 'Sin nombre'}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{user.nombre_short}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                            <Mail className="w-3.5 h-3.5 opacity-40" />
                                                            <span className="text-sm font-medium">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">{user.supervisor || 'N/A'}</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold font-mono text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md w-fit">
                                                        {user.rut}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getRoleBadge(user.PERFIL)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col py-1">
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.area || 'Sin área'}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.ZONA_GEO || 'Sin zona'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={user.vigente === "Si" ? "default" : "secondary"}
                                                            className={cn(
                                                                "h-6 px-3 rounded-full font-bold text-[10px] uppercase",
                                                                user.vigente === "Si"
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                                            )}
                                                        >
                                                            {user.vigente === "Si" ? "Activo" : "Inactivo"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>

                        {/* Pagination Footer */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Mostrando <span className="text-slate-900 dark:text-slate-200 font-bold">{Math.min((currentPage - 1) * rowsPerPage + 1, processedData.length)}</span> a{" "}
                                <span className="text-slate-900 dark:text-slate-200 font-bold">{Math.min(currentPage * rowsPerPage, processedData.length)}</span> de{" "}
                                <span className="text-slate-900 dark:text-slate-200 font-bold">{processedData.length}</span> usuarios
                            </div>

                            {totalPages > 1 && (
                                <Pagination className="w-auto">
                                    <PaginationContent className="gap-1">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                className={cn(
                                                    "h-9 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all font-semibold cursor-pointer",
                                                    currentPage === 1 && "pointer-events-none opacity-40"
                                                )}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;

                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        isActive={currentPage === pageNum}
                                                        className={cn(
                                                            "h-9 w-9 rounded-lg border transition-all font-bold text-xs cursor-pointer",
                                                            currentPage === pageNum
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                        )}
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                className={cn(
                                                    "h-9 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all font-semibold cursor-pointer",
                                                    currentPage === totalPages && "pointer-events-none opacity-40"
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
