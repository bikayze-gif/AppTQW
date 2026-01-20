import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Filter, LayoutDashboard, Search, Eye, EyeOff, Trophy, Download, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface DailyDetailData {
    rut: string;
    name: string;
    supervisor: string;
    day: number;
    rgu: number;
}

interface TechnicianDailyMatrixProps {
    data: DailyDetailData[];
}

export function TechnicianDailyMatrix({ data }: TechnicianDailyMatrixProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDay, setSelectedDay] = useState<string>("ALL");
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    }>({ key: 'total', direction: 'desc' });

    // Get all unique days from the data, sorted
    const uniqueDays = useMemo(() => {
        return Array.from(new Set(data.map((d) => d.day)))
            .sort((a, b) => a - b);
    }, [data]);

    // Pivot data
    const pivotedData = useMemo(() => {
        const techMap = data.reduce((acc: any, curr) => {
            if (!acc[curr.rut]) {
                acc[curr.rut] = {
                    rut: curr.rut,
                    name: curr.name,
                    supervisor: curr.supervisor,
                    total: 0,
                    daily: {},
                    daysWorked: 0
                };
            }
            acc[curr.rut].daily[curr.day] = curr.rgu;
            acc[curr.rut].total += curr.rgu;
            acc[curr.rut].daysWorked += 1;
            return acc;
        }, {});

        // Calculate Average
        Object.values(techMap).forEach((tech: any) => {
            tech.average = tech.daysWorked > 0 ? Number((tech.total / tech.daysWorked).toFixed(1)) : 0;
        });

        const result = Object.values(techMap) as any[];

        // Add absolute rank based on total RGU descending
        // This ranking persists regardless of search/filter/sort in the table UI
        const sortedForRank = [...result].sort((a, b) => b.total - a.total);
        const rankMap = new Map();
        sortedForRank.forEach((tech, index) => {
            rankMap.set(tech.rut, index + 1);
        });

        result.forEach(tech => {
            tech.rank = rankMap.get(tech.rut);
        });

        return result;
    }, [data]);

    // Filter and Sort
    const processedData = useMemo(() => {
        let filtered = pivotedData;

        // 1. Search Filter (Name or Supervisor)
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter((t: any) =>
                t.name.toLowerCase().includes(lower) ||
                (t.supervisor && t.supervisor.toLowerCase().includes(lower))
            );
        }

        // 2. Sort
        filtered.sort((a: any, b: any) => {
            let valA, valB;

            if (sortConfig.key === 'name') {
                valA = a.name;
                valB = b.name;
            } else if (sortConfig.key === 'supervisor') {
                valA = a.supervisor || '';
                valB = b.supervisor || '';
            } else if (sortConfig.key === 'total') {
                valA = a.total;
                valB = b.total;
            } else if (sortConfig.key === 'average') {
                valA = a.average;
                valB = b.average;
            } else if (sortConfig.key.startsWith('day_')) {
                const day = parseInt(sortConfig.key.split('_')[1]);
                valA = a.daily[day] || 0;
                valB = b.daily[day] || 0;
            } else {
                return 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [pivotedData, searchTerm, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleExportExcel = () => {
        const rows = processedData.map((t: any) => {
            const row: any = {
                'Técnico': t.name,
                'Supervisor': t.supervisor || '-'
            };

            uniqueDays.forEach(day => {
                row[`Día ${day}`] = t.daily[day] || 0;
            });

            row['Total'] = t.total;
            row['Promedio'] = t.average;
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detalle Diario");
        XLSX.writeFile(wb, `Detalle_Diario_Tecnico_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleCopyToClipboard = () => {
        const headers = ['Técnico', 'Supervisor', ...uniqueDays.map(d => `Día ${d}`), 'Total', 'Promedio'];

        const rows = processedData.map((t: any) => {
            return [
                t.name,
                t.supervisor || '-',
                ...uniqueDays.map(day => t.daily[day] || 0),
                t.total,
                t.average
            ].join('\t');
        });

        const content = [headers.join('\t'), ...rows].join('\n');

        navigator.clipboard.writeText(content).then(() => {
            toast({
                title: "Copiado",
                description: "Tabla copiada al portapapeles",
            });
        }).catch(err => {
            console.error('Error al copiar: ', err);
            toast({
                title: "Error",
                description: "No se pudo copiar al portapapeles",
                variant: "destructive"
            });
        });
    };

    // Logic to determine invisible columns
    const visibleDays = uniqueDays.filter(day => selectedDay === 'ALL' || selectedDay === day.toString());

    if (processedData.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detalle Diario por Técnico</h3>
                        <p className="text-sm text-slate-500">
                            {processedData.length} técnicos encontrados
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={handleExportExcel}
                            title="Descargar Excel"
                        >
                            <Download className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={handleCopyToClipboard}
                            title="Copiar al portapapeles"
                        >
                            <Copy className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>

                    {/* Day Filter */}
                    <div className="w-[140px]">
                        <Select value={selectedDay} onValueChange={setSelectedDay}>
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 text-xs">
                                <SelectValue placeholder="Filtrar Día" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Días</SelectItem>
                                {uniqueDays.map(day => (
                                    <SelectItem key={day} value={day.toString()}>Día {day}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar técnico o supervisor..."
                            className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto border rounded-md border-slate-200 dark:border-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead
                                className="w-[200px] text-xs font-bold sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Técnico
                                    {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                                </div>
                            </TableHead>
                            <TableHead
                                className="w-[120px] text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort('supervisor')}
                            >
                                <div className="flex items-center gap-2">
                                    Supervisor
                                    {sortConfig.key === 'supervisor' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                                </div>
                            </TableHead>
                            {visibleDays.map(day => (
                                <TableHead
                                    key={day}
                                    className="text-center text-xs font-bold px-1 min-w-[40px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => handleSort(`day_${day}`)}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span>{day}</span>
                                        {sortConfig.key === `day_${day}` && <div className="h-1 w-1 rounded-full bg-indigo-500 mt-0.5"></div>}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead
                                className="text-right text-xs font-bold min-w-[70px] pr-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort('total')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Total
                                    {sortConfig.key === 'total' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-right text-xs font-bold min-w-[70px] pr-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => handleSort('average')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Prom.
                                    {sortConfig.key === 'average' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={visibleDays.length + 4} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <Search className="w-6 h-6 mb-2 opacity-50" />
                                        <p>No se encontraron técnicos</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedData.map((t: any) => (
                                <TableRow key={t.rut} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group">
                                    <TableCell className="font-medium text-xs sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-2 border-r border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            {t.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500 shrink-0 drop-shadow-sm" />}
                                            {t.rank === 2 && <Trophy className="w-4 h-4 text-slate-400 shrink-0 drop-shadow-sm" />}
                                            {t.rank === 3 && <Trophy className="w-4 h-4 text-amber-600 shrink-0 drop-shadow-sm" />}
                                            <span className="line-clamp-1 text-slate-900 dark:text-white" title={t.name}>{t.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 dark:text-slate-400 py-2">
                                        <div className="line-clamp-1" title={t.supervisor}>{t.supervisor || '-'}</div>
                                    </TableCell>
                                    {visibleDays.map(day => (
                                        <TableCell key={day} className="text-center text-xs px-1 py-1.5">
                                            {t.daily[day] ? (
                                                <div
                                                    className={cn(
                                                        "font-medium text-[11px] py-1 px-1.5 rounded",
                                                        t.daily[day] >= 5 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                            t.daily[day] >= 3 ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                                                                "text-slate-700 dark:text-slate-300"
                                                    )}
                                                >
                                                    {t.daily[day]}
                                                </div>
                                            ) : (
                                                <span className="text-slate-200 dark:text-slate-700 text-[10px]">-</span>
                                            )}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold text-xs text-indigo-600 dark:text-indigo-400 py-2 pr-4 bg-slate-50/50 dark:bg-slate-800/30">
                                        {t.total}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-xs text-emerald-600 dark:text-emerald-400 py-2 pr-4 bg-slate-50/50 dark:bg-slate-800/30">
                                        {t.average}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
