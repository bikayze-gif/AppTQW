import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";

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
  { id: 1, actividad: "Tarea A", responsable: "Juan", estado: "Completado", fecha: "2025-01-15" },
  { id: 2, actividad: "Tarea B", responsable: "María", estado: "En Progreso", fecha: "2025-01-14" },
  { id: 3, actividad: "Tarea C", responsable: "Carlos", estado: "Completado", fecha: "2025-01-13" },
  { id: 4, actividad: "Tarea D", responsable: "Ana", estado: "Pendiente", fecha: "2025-01-12" },
  { id: 5, actividad: "Tarea E", responsable: "Pedro", estado: "Completado", fecha: "2025-01-11" },
  { id: 6, actividad: "Tarea F", responsable: "Laura", estado: "En Progreso", fecha: "2025-01-10" },
];

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

export default function Activity() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<7 | 15 | 30>(30);

  const chartData = useMemo(() => {
    if (dayFilter === 7) return chartDataFull.slice(-7);
    if (dayFilter === 15) return chartDataFull.slice(-15);
    return chartDataFull;
  }, [dayFilter]);

  const filteredAndSortedData = useMemo(() => {
    let data = [...tableData];
    
    // Filter
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
  }, [searchText, sortColumn, sortDirection]);

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
                    dot={<CustomDot />}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actividad2" 
                    stroke="#0891b2" 
                    strokeWidth={3}
                    dot={<CustomDot />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="relative">
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
                      onClick={() => handleSort("actividad")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Actividad
                        {sortColumn === "actividad" && (
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
                      onClick={() => handleSort("responsable")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Responsable
                        {sortColumn === "responsable" && (
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
                      onClick={() => handleSort("estado")}
                      className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Estado
                        {sortColumn === "estado" && (
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
                  {filteredAndSortedData.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-white/5 transition-colors"
                      data-testid={`activity-row-${idx}`}
                    >
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-400" data-testid={`activity-date-${idx}`}>{formatDate(row.fecha)}</td>
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`activity-name-${idx}`}>{row.actividad}</td>
                      <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`activity-responsible-${idx}`}>{row.responsable}</td>
                      <td className="px-3 md:px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.estado)}`} data-testid={`activity-status-${idx}`}>
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
