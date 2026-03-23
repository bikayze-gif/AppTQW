import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Route, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Loader2, Calendar, Package, Truck, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SapPage {
  data: Record<string, any>[];
  total: number;
  fechaCarga?: string | null;
}

// ─── Generic SAP Table ────────────────────────────────────────────────────────

interface SapTableProps {
  endpoint: string;
  columns: { key: string; label: string }[];
  defaultSort?: string;
  exportFilename?: string;
  aliadoFilter?: boolean;
  onFechaCargaChange?: (fecha: string | null) => void;
}

function SapTable({ endpoint, columns, defaultSort = "", exportFilename = "export", aliadoFilter = false, onFechaCargaChange }: SapTableProps) {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortBy, setSortBy] = useState(defaultSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [goToPage, setGoToPage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [aliadoValue, setAliadoValue] = useState<string>("todos");

  const { data, isLoading, isError } = useQuery<SapPage>({
    queryKey: [endpoint, page, limit, search, sortBy, sortOrder, aliadoValue],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      });
      if (aliadoFilter && aliadoValue !== "todos") {
        params.append("aliado", aliadoValue);
      }
      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error("Error fetching data");
      return res.json();
    },
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Notificar cambios en fechaCarga
  useEffect(() => {
    if (data?.fechaCarga && onFechaCargaChange) {
      onFechaCargaChange(data.fechaCarga);
    }
  }, [data?.fechaCarga, onFechaCargaChange]);

  const handleSearch = () => {
    setSearch(inputValue);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setInputValue("");
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleLimitChange = (val: string) => {
    setLimit(Number(val));
    setPage(1);
  };

  const handleGoToPage = () => {
    const n = parseInt(goToPage);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      setPage(n);
    }
    setGoToPage("");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "99999",
        search,
        sortBy,
        sortOrder,
      });
      if (aliadoFilter && aliadoValue !== "todos") {
        params.append("aliado", aliadoValue);
      }
      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error("Error fetching data");
      const json: SapPage = await res.json();

      const header = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(",");
      const rowLines = json.data.map(row =>
        columns.map(c => {
          const val = row[c.key] != null ? String(row[c.key]) : "";
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(",")
      );

      const csv = [header, ...rowLines].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortOrder === "asc"
      ? <ArrowUp className="w-3 h-3 text-blue-500" />
      : <ArrowDown className="w-3 h-3 text-blue-500" />;
  };

  const fechaCargaStr = data?.fechaCarga
    ? new Date(data.fechaCarga).toLocaleDateString("es-CL")
    : null;

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={handleSearch}>
          Buscar
        </Button>
        {search && (
          <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-500 px-3" onClick={clearSearch}>
            Limpiar
          </Button>
        )}

        {aliadoFilter && (
          <Select value={aliadoValue} onValueChange={(val) => { setAliadoValue(val); setPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="TELQWAY">TELQWAY</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={String(limit)} onValueChange={handleLimitChange}>
          <SelectTrigger className="h-8 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 / pág</SelectItem>
            <SelectItem value="50">50 / pág</SelectItem>
            <SelectItem value="100">100 / pág</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-slate-400 ml-auto">
          {total.toLocaleString()} registros
          {fechaCargaStr && (
            <span className="ml-2 text-slate-300">— Carga: {fechaCargaStr}</span>
          )}
        </span>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs px-3 gap-1.5 shrink-0"
          onClick={handleExport}
          disabled={exporting || total === 0}
          title="Exportar a CSV"
        >
          {exporting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Download className="h-3.5 w-3.5" />}
          {exporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                {columns.map(col => (
                  <TableHead
                    key={col.key}
                    className="text-xs font-semibold cursor-pointer select-none whitespace-nowrap px-3 py-2"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map(col => (
                      <TableCell key={col.key} className="px-3 py-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-sm text-red-500 py-8">
                    Error al cargar datos.
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-sm text-slate-400 py-8">
                    Sin resultados.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                    {columns.map(col => (
                      <TableCell
                        key={col.key}
                        className="px-3 py-1.5 max-w-[220px] truncate"
                        title={String(row[col.key] ?? "")}
                      >
                        {row[col.key] != null ? String(row[col.key]) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">
          {total > 0
            ? `${((page - 1) * limit + 1).toLocaleString()} – ${Math.min(page * limit, total).toLocaleString()} de ${total.toLocaleString()}`
            : "Sin resultados"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="sm" className="h-7 w-7 p-0"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 min-w-[3rem] text-center">
            {page} / {totalPages}
          </span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={e => setGoToPage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGoToPage()}
            placeholder="Ir a..."
            className="h-7 w-16 text-xs text-center px-1"
          />
          <Button
            variant="outline" size="sm" className="h-7 w-7 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Definición de columnas por tabla ─────────────────────────────────────────

const COLS_STOCK_ALL = [
  { key: "ALIADO",                  label: "Aliado" },
  { key: "Denominación-almacén",    label: "Almacén" },
  { key: "Nombre_Zona",             label: "Zona" },
  { key: "Material",                label: "Material" },
  { key: "Texto breve de material", label: "Descripción" },
  { key: "Centro",                  label: "Centro" },
  { key: "Almacén",                 label: "Cod. Alm." },
  { key: "Stock SAP DISPONIBLE",    label: "Disp. SAP" },
  { key: "Stock SAP TECNICO",       label: "Téc. SAP" },
  { key: "Stock Bodega",            label: "Bodega" },
  { key: "Stock tecnico",           label: "Téc. Local" },
  { key: "Stock Total",             label: "Total" },
];

const COLS_MAESTRO = [
  { key: "SKU",            label: "SKU" },
  { key: "ITEM_CODE_FROM", label: "Código FROM" },
  { key: "ITEM_DESC_FROM", label: "Descripción FROM" },
  { key: "ITEM_CODE_TO",   label: "Código TO" },
  { key: "ITEM_DESC_TO",   label: "Descripción TO" },
  { key: "UDM_FROM",       label: "UDM FROM" },
  { key: "UDM_TO",         label: "UDM TO" },
  { key: "SERIADO_FROM",   label: "Seriado FROM" },
  { key: "SERIADO_TO",     label: "Seriado TO" },
  { key: "ITEM_ID_FROM",   label: "ID FROM" },
  { key: "ITEM_ID_TO",     label: "ID TO" },
];

const COLS_VALORIZADO = [
  { key: "Material",                label: "Material" },
  { key: "Texto breve de material", label: "Descripción" },
  { key: "Centro",                  label: "Centro" },
  { key: "Almacén",                 label: "Almacén" },
  { key: "Nombre 1",                label: "Nombre" },
  { key: "Denominación-almacén",    label: "Denom. Alm." },
  { key: "Unidad medida base",      label: "UDM" },
  { key: "Moneda",                  label: "Moneda" },
  { key: "Libre utilización",       label: "Libre Util." },
  { key: "Valor libre util.",       label: "Valor Libre" },
  { key: "Trans./Trasl.",           label: "Trans/Trasl" },
  { key: "En control calidad",      label: "Ctrl Cal." },
  { key: "Stock no libre",          label: "No Libre" },
  { key: "Bloqueado",               label: "Bloqueado" },
  { key: "Devoluciones",            label: "Devoluc." },
  { key: "Val.trans.c/cond.",       label: "Val. Trans" },
  { key: "Valor en insp.cal.",      label: "Val. Insp." },
  { key: "Valor no libre",          label: "Val. No Lib." },
  { key: "Valor stock bloq.",       label: "Val. Bloq." },
  { key: "Val.stock bl.dev.",       label: "Val. Bl.Dev" },
];

const COLS_ASIGNACION = [
  { key: "RUT Técnico",          label: "RUT Técnico" },
  { key: "Nombre 1",             label: "Nombre" },
  { key: "Apellido",             label: "Apellido" },
  { key: "Material",             label: "Material" },
  { key: "Texto breve material", label: "Descripción" },
  { key: "Centro",               label: "Centro" },
  { key: "Almacén",              label: "Almacén" },
  { key: "Equipo",               label: "Equipo" },
  { key: "Número de serie",      label: "N° Serie" },
  { key: "Denominación equipo",  label: "Denom. Equipo" },
  { key: "Estado",               label: "Estado" },
  { key: "Libre utilización",    label: "Libre Util." },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FlujoLogistico() {
  const [fechaCargaValorizado, setFechaCargaValorizado] = useState<string | null>(null);

  // Generar datos de timeline con fechas relativas a hoy
  const getMockLogisticTimeline = (): TimelineEvent[] => {
    const today = new Date();
    today.setHours(15, 25, 0, 0); // Aproximadamente a las 15:25

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

    // Eventos basados en los 8 archivos Excel modificados
    const excelEvents: TimelineEvent[] = [
      {
        id: "excel-1",
        title: "Inventario Móviles 10-03-2026 V2 RM",
        date: formatDate(today),
        time: "15:27",
        category: "personal",
        status: "completed",
        description: "Archivo Excel modificado: Actualización de inventario de móviles V2",
      },
      {
        id: "excel-2",
        title: "Series Antofa 11-03",
        date: formatDate(today),
        time: "15:27",
        category: "deadline",
        status: "completed",
        description: "Archivo Excel modificado: Actualización de series Antofa",
      },
      {
        id: "excel-3",
        title: "Inventario Móviles 10-03-2026 RM",
        date: formatDate(today),
        time: "15:27",
        category: "personal",
        status: "completed",
        description: "Archivo Excel modificado: Inventario de móviles versión original",
      },
      {
        id: "excel-4",
        title: "Inventario Móviles 11-03-2026 RM",
        date: formatDate(today),
        time: "15:27",
        category: "personal",
        status: "completed",
        description: "Archivo Excel modificado: Inventario de móviles día 11",
      },
      {
        id: "excel-5",
        title: "Inventario Seriado 05-03 RM",
        date: formatDate(today),
        time: "15:26",
        category: "personal",
        status: "completed",
        description: "Archivo Excel modificado: Inventario seriado del día 5",
      },
      {
        id: "excel-6",
        title: "Base Seriados por Bodegas - Inventario 04-03",
        date: formatDate(today),
        time: "15:26",
        category: "meeting",
        status: "completed",
        description: "Archivo Excel modificado: Base de datos de seriados por bodega",
      },
      {
        id: "excel-7",
        title: "Inventario Los Andes 12-03",
        date: formatDate(today),
        time: "15:25",
        category: "personal",
        status: "completed",
        description: "Archivo Excel modificado: Copia de inventario Los Andes",
      },
      {
        id: "excel-8",
        title: "Stock Ferretería RM 18-03",
        date: formatDate(today),
        time: "11:47",
        category: "deadline",
        status: "completed",
        description: "Archivo Excel modificado: Inventario de stock ferretería",
      },
    ];

    // Eventos existentes del sistema
    const systemEvents: TimelineEvent[] = [
      {
        id: "sys-1",
        title: "Stock Claro Día 0 Sincronizado",
        date: formatDate(today),
        time: "08:00",
        duration: "5min",
        category: "meeting",
        status: "completed",
        description: "Sincronización completada: 2,600 registros de stock SAP actualizados",
      },
      {
        id: "sys-2",
        title: "Alerta: Stock Crítico Material 45002001",
        date: formatDate(today),
        time: "09:30",
        category: "deadline",
        status: "upcoming",
        description: "Material 'CABLE ACERO 3/8' bajo stock mínimo (5 unidades en bodega)",
      },
      {
        id: "sys-3",
        title: "Asignación de Técnicos Pendiente",
        date: formatDate(new Date(today.getTime() + 86400000)),
        time: "10:00",
        duration: "1h",
        category: "reminder",
        status: "upcoming",
        description: "Revisar asignación de equipos para 44 técnicos activos",
      },
    ];

    // Combinar y ordenar por tiempo
    return [...excelEvents, ...systemEvents].sort((a, b) => {
      const timeA = a.date + 'T' + a.time;
      const timeB = b.date + 'T' + b.time;
      return timeB.localeCompare(timeA);
    });
  };

  const mockLogisticTimeline = getMockLogisticTimeline();

  return (
    <SupervisorLayout>
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 p-6 space-y-5 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Route className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Flujo Logístico</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datos SAP sincronizados — última carga disponible
            </p>
          </div>
        </div>

        {/* Tabs de todas las tablas SAP */}
        <div>
          <Tabs defaultValue="stock-all">
            <TabsList className="h-9">
              <TabsTrigger value="stock-all" className="text-xs">Stock Claro Día 0</TabsTrigger>
              <TabsTrigger value="valorizado" className="text-xs">Stock Valorizado</TabsTrigger>
              <TabsTrigger value="asignacion" className="text-xs">Asignación Técnicos</TabsTrigger>
              <TabsTrigger value="maestro" className="text-xs">Maestro Códigos</TabsTrigger>
            </TabsList>

              <TabsContent value="stock-all" className="mt-4 data-[state=inactive]:hidden" forceMount>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">sap_stock_all</h2>
                    <Badge variant="outline" className="text-xs font-normal">~2,600 registros / carga</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <SapTable key="stock-all-table" endpoint="/api/sap/stock-all" columns={COLS_STOCK_ALL} defaultSort="ALIADO" exportFilename="stock_claro_dia0" aliadoFilter={true} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="valorizado" className="mt-4 data-[state=inactive]:hidden" forceMount>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">

                  {/* KPI de Fecha de Carga */}
                  {fechaCargaValorizado && (
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Fecha de Carga:
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {new Date(fechaCargaValorizado).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">sap_stock_valorizado</h2>
                    <Badge variant="outline" className="text-xs font-normal">~22,600 registros / carga</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <SapTable
                      key="valorizado-table"
                      endpoint="/api/sap/stock-valorizado"
                      columns={COLS_VALORIZADO}
                      defaultSort="Material"
                      exportFilename="stock_valorizado"
                      onFechaCargaChange={setFechaCargaValorizado}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="asignacion" className="mt-4 data-[state=inactive]:hidden" forceMount>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">TB_SAP_ASIGNACION_TECNICOS</h2>
                    <Badge variant="outline" className="text-xs font-normal">~44,000 registros / carga</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <SapTable key="asignacion-table" endpoint="/api/sap/asignacion-tecnicos" columns={COLS_ASIGNACION} defaultSort="Nombre 1" exportFilename="asignacion_tecnicos" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="maestro" className="mt-4 data-[state=inactive]:hidden" forceMount>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Maestro Códigos</h2>
                    <Badge variant="outline" className="text-xs font-normal">680 SKUs únicos</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <SapTable key="maestro-table" endpoint="/api/sap/maestro-codigos" columns={COLS_MAESTRO} defaultSort="SKU" exportFilename="maestro_codigos" />
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="w-96 shrink-0 p-6">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                    Actividad Logística
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Eventos y sincronizaciones
                  </p>
                </div>
              </div>
              <Timeline events={mockLogisticTimeline} />
            </div>

            {/* Stats Summary */}
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Resumen del Día
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Sincronizaciones</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Alertas Stock</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Registros Procesados</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">25.2K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
