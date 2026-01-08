import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Search, X, ArrowUp, ArrowDown, ChevronLeft, CheckCircle, XCircle, Sheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { useAuth } from "@/lib/auth-context";
import { formatDecimal } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

// Función para parsear fechas en formato DD-MM-YYYY HH:MM
function parseDateDDMMYYYY(dateString: string): string {
  if (!dateString) return 'N/A';

  try {
    // Formato esperado: DD-MM-YYYY HH:MM
    const parts = dateString.trim().split(' ');
    if (parts.length < 1) return 'N/A';

    const datePart = parts[0].split('-');
    if (datePart.length !== 3) return 'N/A';

    const day = datePart[0].padStart(2, '0');
    const month = datePart[1].padStart(2, '0');
    const year = datePart[2];

    // Crear fecha en formato ISO para JavaScript
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);

    if (isNaN(date.getTime())) return 'N/A';

    // Formatear a DD/MM/YYYY
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return 'N/A';
  }
}

function CalidadDetailsList({ selectedMes, resumen, detalles }: {
  selectedMes: string | null;
  resumen: any;
  detalles: any[];
}) {
  const [filtroCalidad, setFiltroCalidad] = useState<'todos' | 'cumple' | 'no_cumple'>('todos');

  if (!selectedMes) return null;

  const cumple = detalles.filter(d => d.CALIDAD_30 === '0');
  const noCumple = detalles.filter(d => d.CALIDAD_30 === '1');

  const detallesFiltrados = detalles.filter(d => {
    if (filtroCalidad === 'cumple') return d.CALIDAD_30 === '0';
    if (filtroCalidad === 'no_cumple') return d.CALIDAD_30 === '1';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h3 className="text-sm font-semibold text-white mb-4">Resumen de Calidad</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-4 border border-green-500/30">
            <p className="text-xs text-slate-400 mb-1">Cumplen</p>
            <p className="text-2xl font-bold text-green-400">{resumen?.cumple || cumple.length}</p>
            <p className="text-xs text-slate-400 mt-1">{formatDecimal(resumen?.eficiencia || 0)}% eficiencia</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg p-4 border border-red-500/30">
            <p className="text-xs text-slate-400 mb-1">No Cumplen</p>
            <p className="text-2xl font-bold text-red-400">{resumen?.noCumple || noCumple.length}</p>
            <p className="text-xs text-slate-400 mt-1">{resumen?.total || detalles.length} total</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-[#06b6d4]/30">
            <p className="text-xs text-slate-400 mb-1">HFC</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#06b6d4]">{resumen?.hfc?.cumple || 0} ✓</span>
              <span className="text-sm font-semibold text-red-400">{resumen?.hfc?.noCumple || 0} ✗</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-[#f59e0b]/30">
            <p className="text-xs text-slate-400 mb-1">FTTH</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f59e0b]">{resumen?.ftth?.cumple || 0} ✓</span>
              <span className="text-sm font-semibold text-red-400">{resumen?.ftth?.noCumple || 0} ✗</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Detalle de Órdenes ({detallesFiltrados.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroCalidad('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroCalidad === 'todos'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroCalidad('cumple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroCalidad === 'cumple'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Cumple
            </button>
            <button
              onClick={() => setFiltroCalidad('no_cumple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroCalidad === 'no_cumple'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              No Cumple
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-3 py-2 text-center font-semibold text-slate-300 whitespace-nowrap">Estado</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Fecha</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-300 whitespace-nowrap">Tipo Red</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">ID Act. 1</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">ID Act. 2</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Desc. Cierre 1</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Desc. Cierre 2</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Desc. Act. 1</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300 whitespace-nowrap">Desc. Act. 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {detallesFiltrados.map((orden: any, idx: number) => {
                const cumpleOrden = orden.CALIDAD_30 === '0';
                const isHFC = orden.TIPO_RED === 'HFC';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-white/5 transition-colors ${cumpleOrden ? 'bg-green-500/5' : 'bg-red-500/5'
                      }`}
                  >
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {cumpleOrden ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                      {parseDateDDMMYYYY(orden.FECHA_EJECUCION)}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${isHFC
                        ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/30'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                        }`}>
                        {orden.TIPO_RED || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">
                      {orden.id_actividad || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">
                      {orden.id_actividad_2 || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">
                      {orden.DESCRIPCION_CIERRE || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">
                      {orden.DESCRIPCION_CIERRE_2 || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">
                      {orden.descripcion_actividad || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-slate-300 max-w-xs truncate">
                      {orden.descripcion_actividad_2 || 'N/A'}
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

export default function Calidad() {
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [monthsFilter, setMonthsFilter] = useState<3 | 6 | 12>(12);
  const [selectedMes, setSelectedMes] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDownloadMonth, setSelectedDownloadMonth] = useState<string>("");

  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/calidad-reactiva/summary', monthsFilter, user?.rut],
    queryFn: async () => {
      const response = await fetch(`/api/calidad-reactiva/summary?months=${monthsFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch calidad data');
      return response.json();
    },
    enabled: !!user,
  });

  // Handle both old format (array) and new format ({ data, rut })
  const summaryData = Array.isArray(summaryResponse) ? summaryResponse : summaryResponse?.data;
  const queriedRut = Array.isArray(summaryResponse) ? null : summaryResponse?.rut;

  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/calidad-reactiva/details', selectedMes],
    queryFn: async () => {
      if (!selectedMes) return null;
      const response = await fetch(`/api/calidad-reactiva/details/${encodeURIComponent(selectedMes)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch details');
      return response.json();
    },
    enabled: !!selectedMes,
  });

  const chartDataGeneral = useMemo(() => {
    if (!summaryData) return [];
    // Invertir el orden para que se muestre cronológicamente (de más antiguo a más reciente)
    return [...summaryData].reverse().map((item: any) => ({
      mes: `${MONTH_NAMES[item.mes - 1]} ${item.anio.toString().slice(2)}`,
      eficiencia: item.eficiencia_general,
    }));
  }, [summaryData]);

  const chartDataTecnologia = useMemo(() => {
    if (!summaryData) return [];
    // Invertir el orden para que se muestre cronológicamente (de más antiguo a más reciente)
    return [...summaryData].reverse().map((item: any) => ({
      mes: `${MONTH_NAMES[item.mes - 1]} ${item.anio.toString().slice(2)}`,
      hfc: item.eficiencia_hfc,
      ftth: item.eficiencia_ftth,
    }));
  }, [summaryData]);

  const filteredAndSortedData = useMemo(() => {
    let data = summaryData || [];

    if (searchText) {
      data = data.filter((row: any) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    if (sortColumn) {
      data = [...data].sort((a: any, b: any) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return data;
  }, [summaryData, searchText, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (mesContable: string) => {
    setSelectedMes(mesContable);
    setShowDrawer(true);
  };

  const formatMes = (mesContable: string) => {
    // Parsear en UTC para evitar desfase de zona horaria
    const [year, month] = mesContable.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${MONTH_NAMES[monthIndex]} ${year}`;
  };

  const handleDownloadExcel = async () => {
    if (!selectedDownloadMonth) {
      alert("Por favor selecciona un mes");
      return;
    }

    try {
      const response = await fetch(`/api/calidad-reactiva/export-excel/${encodeURIComponent(selectedDownloadMonth)}`, {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Calidad Reactiva");
      XLSX.writeFile(workbook, `Calidad_Reactiva_${selectedDownloadMonth}.xlsx`);

    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Error al descargar el archivo Excel");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-3 md:px-5 pt-5 pb-3 flex items-center justify-center">
        <h1 className="text-base md:text-lg font-bold tracking-tight text-white">Calidad Reactiva</h1>
      </header>

      <main className="px-2 md:px-5 space-y-5 max-w-6xl mx-auto pt-3">
        <Card className="bg-card border-none shadow-xl rounded-xl md:rounded-2xl overflow-hidden">
          <CardContent className="p-2 md:p-5 pt-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-bold text-white">Eficiencia General</h2>
              <div className="flex gap-1.5">
                {[3, 6, 12].map((months) => (
                  <button
                    key={months}
                    onClick={() => setMonthsFilter(months as 3 | 6 | 12)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${monthsFilter === months
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    data-testid={`filter-${months}months`}
                  >
                    {months} meses
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52 md:h-60 w-full">
              {isLoadingSummary ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Cargando...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartDataGeneral} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      dy={5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#a855f7', fontSize: 11 }}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', color: '#fff' }}
                      formatter={(value: number) => [`${value}%`, 'Eficiencia']}
                    />
                    <Line
                      type="monotone"
                      dataKey="eficiencia"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                      name="Eficiencia General"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-none shadow-xl rounded-xl md:rounded-2xl overflow-hidden">
          <CardContent className="p-2 md:p-5 pt-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-bold text-white">Eficiencia por Tecnología</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 bg-[#06b6d4]"></div>
                  <span className="text-xs text-slate-300">HFC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 bg-[#f59e0b]"></div>
                  <span className="text-xs text-slate-300">FTTH</span>
                </div>
              </div>
            </div>
            <div className="h-48 md:h-52 w-full">
              {isLoadingSummary ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Cargando...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartDataTecnologia} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      dy={5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                      formatter={(value: number, name: string) => [`${value}%`, name.toUpperCase()]}
                    />
                    <Line
                      type="monotone"
                      dataKey="hfc"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                      name="hfc"
                    />
                    <Line
                      type="monotone"
                      dataKey="ftth"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                      name="ftth"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
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

          <div className="flex gap-2 items-center">
            <select
              value={selectedDownloadMonth}
              onChange={(e) => setSelectedDownloadMonth(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="" className="bg-slate-900 text-white">Seleccionar mes</option>
              {filteredAndSortedData.map((row: any) => (
                <option key={row.mes_contable} value={row.mes_contable} className="bg-slate-900 text-white">
                  {formatMes(row.mes_contable)}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownloadExcel}
              disabled={!selectedDownloadMonth}
              className="flex items-center justify-center px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg transition-colors hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Descargar Excel"
            >
              <Sheet size={18} />
              <span className="ml-2 text-sm">Descargar</span>
            </button>
          </div>
        </div>

        <Card className="bg-card border-none shadow-xl rounded-xl md:rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b border-white/5 bg-white/5">
              <h2 className="text-sm md:text-base font-bold text-white">Detalle por mes contable</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th
                      onClick={() => handleSort("mes_contable")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Mes
                        {sortColumn === "mes_contable" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-purple-500" />
                            ) : (
                              <ArrowDown size={14} className="text-purple-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("total")}
                      className="px-3 md:px-6 py-3 text-right font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Total
                        {sortColumn === "total" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-purple-500" />
                            ) : (
                              <ArrowDown size={14} className="text-purple-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 md:px-6 py-3 text-right font-semibold text-slate-300 text-xs md:text-sm">
                      Cumplen
                    </th>
                    <th className="px-3 md:px-6 py-3 text-right font-semibold text-slate-300 text-xs md:text-sm">
                      No Cumplen
                    </th>
                    <th
                      onClick={() => handleSort("eficiencia_general")}
                      className="px-3 md:px-6 py-3 text-right font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Calidad Reactiva
                        {sortColumn === "eficiencia_general" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={14} className="text-purple-500" />
                            ) : (
                              <ArrowDown size={14} className="text-purple-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingSummary ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Cargando datos...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <p>No hay datos disponibles</p>
                          {queriedRut && (
                            <p className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">
                              Consultado para RUT: {queriedRut}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        onClick={() => handleRowClick(row.mes_contable)}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        data-testid={`row-calidad-${idx}`}
                      >
                        <td className="px-3 md:px-6 py-3 text-white font-medium">
                          {formatMes(row.mes_contable)}
                        </td>
                        <td className="px-3 md:px-6 py-3 text-right text-slate-300">
                          {row.total}
                        </td>
                        <td className="px-3 md:px-6 py-3 text-right text-green-400 font-medium">
                          {row.cumple}
                        </td>
                        <td className="px-3 md:px-6 py-3 text-right text-red-400 font-medium">
                          {row.no_cumple}
                        </td>
                        <td className="px-3 md:px-6 py-3 text-right">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${row.eficiencia_general >= 90
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : row.eficiencia_general >= 80
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {formatDecimal(row.eficiencia_general)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <span className="text-xs text-slate-400">
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedData.length)} de {filteredAndSortedData.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    data-testid="close-drawer"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white">Detalle de Calidad</h2>
                    <p className="text-sm text-slate-400">
                      {selectedMes ? formatMes(selectedMes) : ''}
                    </p>
                  </div>
                </div>
              </div>

              {isLoadingDetails ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400">Cargando detalles...</p>
                </div>
              ) : (
                <CalidadDetailsList
                  selectedMes={selectedMes}
                  resumen={detailsData?.resumen}
                  detalles={detailsData?.detalles || []}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
