import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Search, X, ArrowUp, ArrowDown, ChevronLeft, FileText, Sheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { useAuth } from "@/lib/auth-context";
import { formatDecimal } from "@/lib/utils";



const getStatusColor = (status: string) => {
  switch (status) {
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
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(2);
  return `${day}-${month}-${year}`;
};

const ITEMS_PER_PAGE = 10;

// Componente para mostrar detalles de órdenes
function OrderDetailsList({ selectedDate }: { selectedDate: string | null }) {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['/api/activity/details', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await fetch(`/api/activity/details/${selectedDate}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      return response.json();
    },
    enabled: !!selectedDate,
  });

  if (!selectedDate) return null;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-6">
          <p className="text-slate-400 text-xs">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  const details = orderDetails?.detalles || [];

  if (details.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-6">
          <p className="text-slate-400 text-xs">No hay órdenes para este día</p>
        </div>
      </div>
    );
  }

  // Calcular resúmenes por tipo de red
  let totalPuntosHFC = 0;
  let totalRguFTTH = 0;
  let countHFC = 0;
  let countFTTH = 0;

  details.forEach((order: any) => {
    if (order.TipoRed_rank === 'HFC' && order.Ptos_referencial) {
      totalPuntosHFC += parseFloat(order.Ptos_referencial) || 0;
      countHFC++;
    }
    if (order.TipoRed_rank === 'FTTH' && order.Q_SSPP) {
      totalRguFTTH += parseFloat(order.Q_SSPP) || 0;
      countFTTH++;
    }
  });

  const tipoRedPredominante = countHFC > countFTTH ? 'HFC' : 'FTTH';

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Resumen de Métricas */}
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-xs font-semibold text-white mb-3">Resumen de Métricas</h3>
        <div className="grid grid-cols-2 gap-3">
          {countHFC > 0 && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#06b6d4]/5 rounded-lg p-3 border border-[#06b6d4]/30">
              <p className="text-xs text-slate-400 mb-1">Puntos HFC</p>
              <p className="text-xl font-bold text-[#06b6d4]">{Math.round(totalPuntosHFC)}</p>
              <p className="text-xs text-slate-400 mt-1">{countHFC} órdenes</p>
            </div>
          )}
          {countFTTH > 0 && (
            <div className="bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 rounded-lg p-3 border border-[#f59e0b]/30">
              <p className="text-xs text-slate-400 mb-1">RGU FTTH</p>
              <p className="text-xl font-bold text-[#f59e0b]">{formatDecimal(totalRguFTTH.toFixed(2))}</p>
              <p className="text-xs text-slate-400 mt-1">{countFTTH} órdenes</p>
            </div>
          )}
        </div>
        <div className="mt-3 p-2 bg-white/5 rounded-lg">
          <p className="text-xs text-slate-400">Tipo de red predominante:</p>
          <p className={`text-sm font-semibold ${tipoRedPredominante === 'HFC' ? 'text-[#06b6d4]' : 'text-[#f59e0b]'}`}>
            {tipoRedPredominante}
          </p>
        </div>
      </div>

      {/* Tabla de Órdenes Detalladas */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-white mb-3">
          Detalle de Órdenes ({details.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-2 py-2 text-center font-semibold text-slate-300 whitespace-nowrap">Tipo Red</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-300 whitespace-nowrap">RGU</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-300 whitespace-nowrap">Puntos</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Orden</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Dirección Cliente</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Actividad</th>
                <th className="px-2 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Trabajo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.map((order: any, idx: number) => {
                const isHFC = order.TipoRed_rank === 'HFC';
                const isFTTH = order.TipoRed_rank === 'FTTH';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-white/5 transition-colors ${isHFC ? 'bg-[#06b6d4]/5' : 'bg-[#f59e0b]/5'
                      }`}
                  >
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${isHFC
                        ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/30'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                        }`}>
                        {order.TipoRed_rank || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">
                      {isFTTH ? (
                        <span className="text-[#f59e0b]">
                          {formatDecimal((parseFloat(order.Q_SSPP) || 0).toFixed(2))}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">
                      {isHFC ? (
                        <span className="text-[#06b6d4]">
                          {Math.round(parseFloat(order.Ptos_referencial) || 0)}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-white font-medium whitespace-nowrap">
                      {order.Orden || 'N/A'}
                    </td>
                    <td className="px-2 py-2 text-slate-300 max-w-xs truncate">
                      {order['Dir# cliente'] || 'N/A'}
                    </td>
                    <td className="px-2 py-2 text-slate-300 max-w-xs truncate">
                      {order.Actividad || 'N/A'}
                    </td>
                    <td className="px-2 py-2 text-slate-300 max-w-xs truncate">
                      {order.Trabajo || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Activity() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<7 | 15 | 30>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("12"); // Default to December 2025
  const { user } = useAuth();

  const chartConfig = {
    puntos_hfc: {
      label: "Puntos HFC",
      color: "#06b6d4",
    },
    q_rgu_ftth: {
      label: "RGU FTTH",
      color: "#f59e0b",
    },
  } satisfies ChartConfig

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

  // Import xlsx dynamically or at the top level? 
  // Since environment seems to support ES modules, we'll try dynamic import or assume global availability if script tag, 
  // but better to add import at top if installed.
  // Ideally, I should add `import * as XLSX from 'xlsx';` at the top of the file.
  // For now, let's modify the function assuming imports will be fixed in next step or use require if appropriate (but this is vite).
  // Wait, I should add the import line first, or I can update the whole file part.

  const handleDownloadExcel = async () => {
    if (!selectedMonth) return;

    try {
      const period = `2025${selectedMonth}`;

      const response = await fetch(`/api/activity/export-excel?period=${period}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch export data');

      const data = await response.json();

      if (data.length === 0) {
        alert("No hay datos para exportar en este periodo");
        return;
      }

      const formattedData = data.map((row: any) => {
        const newRow: any = {};
        Object.entries(row).forEach(([key, val]) => {
          newRow[key] = formatDecimal(val);
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Actividades");
      XLSX.writeFile(workbook, `Actividad_${period}.xlsx`);

    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Error al descargar el archivo Excel");
    }
  };

  // Fetch chart data
  const { data: chartDataApi, isLoading: isLoadingChart } = useQuery({
    queryKey: ['/api/activity/chart', dayFilter, selectedMonth, user?.rut],
    queryFn: async () => {
      const response = await fetch(`/api/activity/chart?days=${dayFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
    enabled: !!user, // Enable only when user is authenticated
  });

  // Transform API data for chart
  const chartData = useMemo(() => {
    if (!chartDataApi) return [];
    return chartDataApi.map((item: any) => ({
      day: new Date(item.fecha).getDate().toString().padStart(2, '0'),
      puntos_hfc: item.puntos_hfc,
      q_rgu_ftth: item.q_rgu_ftth,
    }));
  }, [chartDataApi]);

  // Fetch table data
  const { data: tableDataApi, isLoading: isLoadingTable } = useQuery({
    queryKey: ['/api/activity/table', dayFilter, selectedMonth, user?.rut],
    queryFn: async () => {
      const response = await fetch(`/api/activity/table?days=${dayFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch table data');
      return response.json();
    },
    enabled: !!user, // Enable only when user is authenticated
  });

  const filteredAndSortedData = useMemo(() => {
    let data = tableDataApi || [];

    // Filter by search text
    if (searchText) {
      data = data.filter((row: any) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Sort
    if (sortColumn) {
      data = [...data].sort((a: any, b: any) => {
        const aVal = String(a[sortColumn as keyof typeof a]);
        const bVal = String(b[sortColumn as keyof typeof b]);
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return data;
  }, [tableDataApi, searchText, sortColumn, sortDirection]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans pb-20">
      <main className="px-2 md:px-5 space-y-5 max-w-6xl mx-auto pt-5">

        {/* Chart Card */}
        <Card className="bg-slate-800/50 border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
          <CardContent className="p-2 md:p-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-bold text-white">Gráfico de Actividades</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDayFilter(7)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${dayFilter === 7
                    ? "bg-[#06b6d4] text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  data-testid="filter-7days"
                >
                  7 días
                </button>
                <button
                  onClick={() => setDayFilter(15)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${dayFilter === 15
                    ? "bg-[#06b6d4] text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  data-testid="filter-15days"
                >
                  15 días
                </button>
                <button
                  onClick={() => setDayFilter(30)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${dayFilter === 30
                    ? "bg-[#06b6d4] text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  data-testid="filter-30days"
                >
                  Mes completo
                </button>
              </div>
            </div>
            <div className="h-56 md:h-72 w-full">
              {/* Leyenda personalizada - Superior */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-[#06b6d4]"></div>
                  <span className="text-xs text-slate-300">Puntos HFC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-[#f59e0b]"></div>
                  <span className="text-xs text-slate-300">RGU FTTH</span>
                </div>
              </div>

              <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    label={{ value: 'Días', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                    dy={5}
                  />
                  {/* Eje Y izquierdo para Puntos HFC */}
                  <YAxis
                    yAxisId="left"
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#06b6d4', fontSize: 9 }}
                    domain={[0, 'auto']}
                    width={40}
                  />
                  {/* Eje Y derecho para RGU FTTH */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#f59e0b', fontSize: 9 }}
                    domain={[0, 'auto']}
                    width={40}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="puntos_hfc"
                    stroke="var(--color-puntos_hfc)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="q_rgu_ftth"
                    stroke="var(--color-q_rgu_ftth)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filter and Download Section */}
        <div className="flex flex-row gap-2 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-xs"
              data-testid="search-input"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                data-testid="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Month Select & Download Buttons */}
          <div className="relative flex flex-row gap-2 items-center">
            {/* Controls Container */}
            <div className="flex flex-row gap-2 items-center">
              {/* Month Select */}
              <select
                className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#06b6d4] transition-colors cursor-pointer whitespace-nowrap"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="" className="bg-slate-900">
                  Seleccionar mes
                </option>
                {months.map((month) => (
                  <option key={month.value} value={month.value} className="bg-slate-900">
                    {month.label}
                  </option>
                ))}
              </select>

              {/* Download Buttons */}
              <button
                className="flex items-center justify-center p-1.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg transition-colors flex-shrink-0 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownloadPDF}
                disabled={!selectedMonth}
                title="Descargar PDF"
              >
                <FileText size={14} />
              </button>
              <button
                className="flex items-center justify-center p-1.5 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg transition-colors flex-shrink-0 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownloadExcel}
                disabled={!selectedMonth}
                title="Descargar Excel"
              >
                <Sheet size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-slate-800/50 border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th
                      onClick={() => handleSort("fecha")}
                      className="px-2 md:px-4 py-2 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {sortColumn === "fecha" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={12} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("tipoRed")}
                      className="px-2 md:px-4 py-2 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Tipo Red
                        {sortColumn === "tipoRed" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={12} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("puntos")}
                      className="px-2 md:px-4 py-2 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Puntos
                        {sortColumn === "puntos" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={12} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("rgu")}
                      className="px-2 md:px-4 py-2 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        RGU
                        {sortColumn === "rgu" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-[#06b6d4]" />
                            ) : (
                              <ArrowDown size={12} className="text-[#06b6d4]" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr
                      key={row.id || idx}
                      onClick={async () => {
                        // Extract only the date portion (YYYY-MM-DD)
                        const dateOnly = row.fecha.split('T')[0];
                        setSelectedDate(dateOnly);
                        setShowDrawer(true);
                      }}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`activity-row-${idx}`}
                    >
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-slate-400" data-testid={`activity-date-${idx}`}>{formatDate(row.fecha)}</td>
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-slate-200" data-testid={`activity-tipoRed-${idx}`}>{row.tipoRed}</td>
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-slate-200" data-testid={`activity-puntos-${idx}`}>
                        {row.tipoRed === 'HFC' ? row.puntos : 0}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#06b6d4] font-semibold" data-testid={`activity-rgu-${idx}`}>
                        {row.tipoRed === 'FTTH' ? row.rgu : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-white/5 px-3 md:px-5 py-3 flex items-center justify-between bg-white/5">
              <div className="text-xs md:text-sm text-slate-400">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)} de {filteredAndSortedData.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                  data-testid="pagination-prev"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${currentPage === page
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
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
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
              className="fixed right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[60%] bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
              data-testid="drawer-panel"
            >
              {/* Header */}
              <div className="border-b border-white/5 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Detalles del Día</h2>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(selectedDate)}</p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="button-close-drawer"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* Order Details List */}
              <OrderDetailsList selectedDate={selectedDate} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}