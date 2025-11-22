import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Search, X, ArrowUp, ArrowDown, Eye, ChevronLeft, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const chartDataFull = [
  { day: "01", actividad1: 45, actividad2: 30 },
  { day: "02", actividad1: 52, actividad2: 45 },
  { day: "03", actividad1: 48, actividad2: 50 },
  { day: "04", actividad1: 61, actividad2: 55 },
  { day: "05", actividad1: 55, actividad2: 65 },
  { day: "06", actividad1: 67, actividad2: 58 },
  { day: "07", actividad1: 72, actividad2: 70 },
  { day: "08", actividad1: 68, actividad2: 75 },
  { day: "09", actividad1: 75, actividad2: 68 },
  { day: "10", actividad1: 82, actividad2: 72 },
  { day: "11", actividad1: 79, actividad2: 80 },
  { day: "12", actividad1: 85, actividad2: 76 },
  { day: "13", actividad1: 78, actividad2: 82 },
  { day: "14", actividad1: 88, actividad2: 85 },
  { day: "15", actividad1: 92, actividad2: 88 },
  { day: "16", actividad1: 86, actividad2: 90 },
  { day: "17", actividad1: 89, actividad2: 84 },
  { day: "18", actividad1: 94, actividad2: 91 },
  { day: "19", actividad1: 87, actividad2: 93 },
  { day: "20", actividad1: 95, actividad2: 89 },
  { day: "21", actividad1: 91, actividad2: 92 },
  { day: "22", actividad1: 96, actividad2: 94 },
  { day: "23", actividad1: 98, actividad2: 96 },
  { day: "24", actividad1: 93, actividad2: 95 },
  { day: "25", actividad1: 97, actividad2: 98 },
  { day: "26", actividad1: 99, actividad2: 97 },
  { day: "27", actividad1: 94, actividad2: 99 },
  { day: "28", actividad1: 100, actividad2: 100 },
  { day: "29", actividad1: 96, actividad2: 101 },
  { day: "30", actividad1: 102, actividad2: 98 },
];

const tableData = [
  { id: 1, fecha: "2025-01-15", tipoRed: "FTTH", puntos: 45, rgu: 4.75 },
  { id: 2, fecha: "2025-01-15", tipoRed: "HFC", puntos: 0, rgu: 2.30 },
  { id: 3, fecha: "2025-01-14", tipoRed: "FTTH", puntos: 52, rgu: 5.10 },
  { id: 4, fecha: "2025-01-14", tipoRed: "HFC", puntos: 15, rgu: 1.85 },
  { id: 5, fecha: "2025-01-13", tipoRed: "FTTH", puntos: 48, rgu: 4.90 },
  { id: 6, fecha: "2025-01-13", tipoRed: "HFC", puntos: 0, rgu: 3.20 },
  { id: 7, fecha: "2025-01-12", tipoRed: "FTTH", puntos: 61, rgu: 5.50 },
  { id: 8, fecha: "2025-01-12", tipoRed: "HFC", puntos: 8, rgu: 2.15 },
  { id: 9, fecha: "2025-01-11", tipoRed: "FTTH", puntos: 55, rgu: 4.80 },
  { id: 10, fecha: "2025-01-11", tipoRed: "HFC", puntos: 22, rgu: 2.75 },
  { id: 11, fecha: "2025-01-10", tipoRed: "FTTH", puntos: 67, rgu: 5.60 },
  { id: 12, fecha: "2025-01-10", tipoRed: "HFC", puntos: 0, rgu: 1.95 },
  { id: 13, fecha: "2025-01-09", tipoRed: "FTTH", puntos: 72, rgu: 6.10 },
  { id: 14, fecha: "2025-01-09", tipoRed: "HFC", puntos: 5, rgu: 2.40 },
  { id: 15, fecha: "2025-01-08", tipoRed: "FTTH", puntos: 68, rgu: 5.85 },
];

const dayDetailsData: Record<string, { summary: string; count: number; completed: number; inProgress: number; items: Array<{ code: string; value: number | string; type: "puntos" | "rgu" }>; activities: Array<{ name: string; responsible: string; status: string; time: string }> }> = {
  "2025-01-15": { summary: "4 actividades completadas, 0 pendientes", count: 4, completed: 2, inProgress: 0, items: [{ code: "ACT-001", value: 150, type: "puntos" }, { code: "ACT-002", value: "rgu", type: "rgu" }, { code: "ACT-003", value: 200, type: "puntos" }], activities: [{ name: "Tarea A", responsible: "Juan", status: "Completado", time: "09:30" }] },
  "2025-01-14": { summary: "3 actividades procesadas, 1 en progreso", count: 3, completed: 2, inProgress: 1, items: [{ code: "ACT-004", value: 120, type: "puntos" }, { code: "ACT-005", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea B", responsible: "María", status: "En Progreso", time: "10:15" }] },
  "2025-01-13": { summary: "2 tareas completadas hoy", count: 2, completed: 2, inProgress: 0, items: [{ code: "ACT-006", value: 180, type: "puntos" }, { code: "ACT-007", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea C", responsible: "Carlos", status: "Completado", time: "08:45" }] },
  "2025-01-12": { summary: "Actividades pendientes: 1", count: 2, completed: 0, inProgress: 0, items: [{ code: "ACT-008", value: 90, type: "puntos" }], activities: [{ name: "Tarea D", responsible: "Ana", status: "Pendiente", time: "14:20" }] },
  "2025-01-11": { summary: "Día productivo: 3 completadas", count: 3, completed: 3, inProgress: 0, items: [{ code: "ACT-009", value: 250, type: "puntos" }, { code: "ACT-010", value: "rgu", type: "rgu" }, { code: "ACT-011", value: 175, type: "puntos" }], activities: [{ name: "Tarea E", responsible: "Pedro", status: "Completado", time: "11:00" }] },
  "2025-01-10": { summary: "2 tareas en progreso", count: 2, completed: 0, inProgress: 2, items: [{ code: "ACT-012", value: 140, type: "puntos" }], activities: [{ name: "Tarea F", responsible: "Laura", status: "En Progreso", time: "15:30" }] },
  "2025-01-09": { summary: "3 tareas completadas", count: 3, completed: 3, inProgress: 0, items: [{ code: "ACT-013", value: 210, type: "puntos" }, { code: "ACT-014", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea G", responsible: "Luis", status: "Completado", time: "09:00" }] },
  "2025-01-08": { summary: "2 tareas exitosas", count: 2, completed: 2, inProgress: 0, items: [{ code: "ACT-015", value: 165, type: "puntos" }, { code: "ACT-016", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea H", responsible: "Sandra", status: "Completado", time: "13:45" }] },
  "2025-01-07": { summary: "1 en progreso, actividades continúan", count: 2, completed: 1, inProgress: 1, items: [{ code: "ACT-017", value: 110, type: "puntos" }], activities: [{ name: "Tarea I", responsible: "Roberto", status: "En Progreso", time: "10:30" }] },
  "2025-01-06": { summary: "Día completamente productivo", count: 2, completed: 2, inProgress: 0, items: [{ code: "ACT-018", value: 195, type: "puntos" }, { code: "ACT-019", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea J", responsible: "Mónica", status: "Completado", time: "12:15" }] },
  "2025-01-05": { summary: "1 tarea pendiente por revisar", count: 2, completed: 0, inProgress: 0, items: [{ code: "ACT-020", value: 85, type: "puntos" }], activities: [{ name: "Tarea K", responsible: "Fernando", status: "Pendiente", time: "16:00" }] },
  "2025-01-04": { summary: "Tarea completada satisfactoriamente", count: 1, completed: 1, inProgress: 0, items: [{ code: "ACT-021", value: 220, type: "puntos" }, { code: "ACT-022", value: "rgu", type: "rgu" }], activities: [{ name: "Tarea L", responsible: "Beatriz", status: "Completado", time: "14:00" }] },
  "2025-01-03": { summary: "En progreso: tareas del día", count: 2, completed: 0, inProgress: 1, items: [{ code: "ACT-023", value: 130, type: "puntos" }], activities: [{ name: "Tarea M", responsible: "Diego", status: "En Progreso", time: "11:20" }] },
  "2025-01-02": { summary: "1 tarea completada", count: 1, completed: 1, inProgress: 0, items: [{ code: "ACT-024", value: "rgu", type: "rgu" }, { code: "ACT-025", value: 160, type: "puntos" }], activities: [{ name: "Tarea N", responsible: "Cristina", status: "Completado", time: "10:00" }] },
  "2025-01-01": { summary: "Inicio del mes productivo", count: 1, completed: 1, inProgress: 0, items: [{ code: "ACT-026", value: 200, type: "puntos" }], activities: [{ name: "Tarea O", responsible: "Rodrigo", status: "Completado", time: "09:30" }] },
};

const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload, value } = props;
  if (value === undefined) return null;
  
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#1e293b" stroke={stroke} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={3} fill={stroke} stroke="none" />
    </g>
  );
};

const getStatusColor = (status: string) => {
  switch(status) {
    case "Completado":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "En Progreso":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Pendiente":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
};

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month.toLowerCase()}-${year.slice(2)}`;
};

const ITEMS_PER_PAGE = 10;

export default function Activity() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<7 | 15 | 30>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("01");

  const months = [
    { value: "01", label: "Enero 2025" },
    { value: "02", label: "Febrero 2025" },
    { value: "03", label: "Marzo 2025" },
    { value: "04", label: "Abril 2025" },
    { value: "05", label: "Mayo 2025" },
    { value: "06", label: "Junio 2025" },
    { value: "07", label: "Julio 2025" },
    { value: "08", label: "Agosto 2025" },
    { value: "09", label: "Septiembre 2025" },
    { value: "10", label: "Octubre 2025" },
    { value: "11", label: "Noviembre 2025" },
    { value: "12", label: "Diciembre 2025" },
  ];

  const handleDownloadPDF = () => {
    console.log(`Descargando reporte en PDF del mes ${selectedMonth}`);
  };

  const handleDownloadExcel = () => {
    console.log(`Descargando reporte en Excel del mes ${selectedMonth}`);
  };

  const chartData = useMemo(() => {
    if (dayFilter === 7) return chartDataFull.slice(-7);
    if (dayFilter === 15) return chartDataFull.slice(-15);
    return chartDataFull;
  }, [dayFilter]);

  const filteredAndSortedData = useMemo(() => {
    let data = [...tableData];
    
    // Filter by day range
    const today = new Date("2025-01-15");
    let startDate = new Date(today);
    if (dayFilter === 7) {
      startDate.setDate(today.getDate() - 6);
    } else if (dayFilter === 15) {
      startDate.setDate(today.getDate() - 14);
    } else {
      startDate.setDate(today.getDate() - 29);
    }
    
    data = data.filter((row) => {
      const rowDate = new Date(row.fecha);
      return rowDate >= startDate && rowDate <= today;
    });
    
    // Filter by search text
    if (searchText) {
      data = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    // Sort
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = String(a[sortColumn as keyof typeof a]);
        const bVal = String(b[sortColumn as keyof typeof b]);
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    
    return data;
  }, [searchText, sortColumn, sortDirection, dayFilter]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Actividad</h1>
      </header>

      <main className="px-4 md:px-6 space-y-6 max-w-6xl mx-auto pt-4">
        
        {/* Chart Card */}
        <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
          <CardContent className="p-3 md:p-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-bold text-white">Gráfico de Actividades</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDayFilter(7)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dayFilter === 7
                      ? "bg-[#06b6d4] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  data-testid="filter-7days"
                >
                  7 días
                </button>
                <button
                  onClick={() => setDayFilter(15)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dayFilter === 15
                      ? "bg-[#06b6d4] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  data-testid="filter-15days"
                >
                  15 días
                </button>
                <button
                  onClick={() => setDayFilter(30)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dayFilter === 30
                      ? "bg-[#06b6d4] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  data-testid="filter-30days"
                >
                  Mes completo
                </button>
              </div>
            </div>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Días', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }}
                    dy={5}
                  />
                  <YAxis 
                    type="number"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(value) => `${value}`}
                    label={{ value: 'Actividad', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 10 }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#06b6d4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actividad1" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actividad2" 
                    stroke="#0891b2" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filter and Download Section */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar actividades..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
              data-testid="search-input"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                data-testid="clear-search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Month Select */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#06b6d4] transition-colors cursor-pointer"
            data-testid="month-select"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value} className="bg-slate-900">
                {month.label}
              </option>
            ))}
          </select>

          {/* Download Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
              data-testid="download-pdf"
            >
              <Download size={16} />
              <span className="hidden md:inline">PDF</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
              data-testid="download-excel"
            >
              <Download size={16} />
              <span className="hidden md:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th 
                      onClick={() => handleSort("fecha")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Fecha
                        {sortColumn === "fecha" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={14} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("tipoRed")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Tipo Red
                        {sortColumn === "tipoRed" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={14} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("puntos")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Puntos
                        {sortColumn === "puntos" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={14} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("rgu")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        RGU
                        {sortColumn === "rgu" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={14} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedData.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setSelectedDate(row.fecha);
                        setShowDrawer(true);
                      }}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`activity-row-${idx}`}
                    >
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-400" data-testid={`activity-date-${idx}`}>{formatDate(row.fecha)}</td>
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`activity-tipoRed-${idx}`}>{row.tipoRed}</td>
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`activity-puntos-${idx}`}>{row.puntos}</td>
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-[#06b6d4] font-semibold" data-testid={`activity-rgu-${idx}`}>{row.rgu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-white/5 px-4 md:px-6 py-4 flex items-center justify-between bg-white/5">
              <div className="text-xs md:text-sm text-slate-400">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)} de {filteredAndSortedData.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  data-testid="pagination-prev"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === page
                          ? "bg-[#06b6d4] text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                      data-testid={`pagination-page-${page}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  data-testid="pagination-next"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Details Drawer */}
      <AnimatePresence>
        {showDrawer && selectedDate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              data-testid="drawer-backdrop"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
              data-testid="drawer-panel"
            >
              {/* Header */}
              <div className="border-b border-white/5 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Detalles del Día</h2>
                  <p className="text-sm text-slate-400 mt-1">{formatDate(selectedDate)}</p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="button-close-drawer"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Summary */}
              {dayDetailsData[selectedDate] && (
                <div className="p-6 border-b border-white/5">
                  <p className="text-sm text-slate-300">{dayDetailsData[selectedDate].summary}</p>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#06b6d4]">{dayDetailsData[selectedDate].count}</p>
                      <p className="text-xs text-slate-400 mt-1">Total</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-400">{dayDetailsData[selectedDate].completed}</p>
                      <p className="text-xs text-slate-400 mt-1">Completadas</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-blue-400">{dayDetailsData[selectedDate].inProgress}</p>
                      <p className="text-xs text-slate-400 mt-1">En Progreso</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              {dayDetailsData[selectedDate] && dayDetailsData[selectedDate].items && dayDetailsData[selectedDate].items.length > 0 && (
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-3">Entregas del Día</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-2 text-slate-300 font-medium">Código</th>
                          <th className="text-right py-2 px-2 text-slate-300 font-medium">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dayDetailsData[selectedDate].items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 px-2 text-slate-300" data-testid={`item-code-${idx}`}>{item.code}</td>
                            <td className="py-2 px-2 text-right">
                              <span 
                                className={`font-semibold ${item.type === 'puntos' ? 'text-[#06b6d4]' : 'text-violet-400'}`}
                                data-testid={`item-value-${idx}`}
                              >
                                {item.type === 'puntos' ? `${item.value} pts` : item.value}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Activities List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {tableData
                  .filter((item) => item.fecha === selectedDate)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#06b6d4]/30 transition-colors"
                      data-testid={`detail-activity-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-white flex-1">{item.actividad}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(item.estado)}`}>
                          {item.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Por: {item.responsable}</p>
                      <p className="text-xs text-slate-500">Registrado: 10:00 AM</p>
                    </div>
                  ))}
                {tableData.filter((item) => item.fecha === selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No hay actividades para este día</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
