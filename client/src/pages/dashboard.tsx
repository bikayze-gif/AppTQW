"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, ChevronLeft, Search, X, FileText, Sheet } from "lucide-react";

const evolutionData = [
  { month: "Dic 24", value: 88 },
  { month: "Mar 24", value: 100 },
  { month: "Abr 24", value: 100 },
  { month: "May 24", value: 100 },
  { month: "Jun 24", value: 100 },
  { month: "Jul 24", value: 100 },
];

const efficiencyData = [
  { month: "1", val1: 78, val2: 0 },
  { month: "2", val1: 20, val2: 100 },
  { month: "3", val1: 0, val2: 100 },
  { month: "4", val1: 100, val2: 100 },
  { month: "5", val1: 100, val2: 100 },
  { month: "6", val1: 95, val2: 100 },
  { month: "7", val1: 78, val2: 0 },
  { month: "8", val1: 85, val2: 0 },
  { month: "9", val1: 85, val2: 0 },
  { month: "10", val1: 20, val2: 100 },
  { month: "11", val1: 0, val2: 100 },
  { month: "12", val1: 0, val2: 100 },
];

const tableData = [
  { id: 1, mes: "12-24", totales: 73, cumple: 64, noCumple: 9 },
  { id: 2, mes: "03-24", totales: 23, cumple: 23, noCumple: 0 },
  { id: 3, mes: "04-24", totales: 41, cumple: 41, noCumple: 0 },
  { id: 4, mes: "05-24", totales: 55, cumple: 50, noCumple: 5 },
  { id: 5, mes: "06-24", totales: 67, cumple: 62, noCumple: 5 },
];

const detailData: Record<string, { todas: Array<{orden: string; estado: string; fecha: string}>; cumple: Array<{orden: string; estado: string; fecha: string}>; noCumple: Array<{orden: string; estado: string; fecha: string}> }> = {
  "12-24": { 
    todas: [
      { orden: "1-36KUTNFZ", estado: "CUMPLE", fecha: "2024-12-01" },
      { orden: "1-36KMLHXJ", estado: "CUMPLE", fecha: "2024-12-02" },
      { orden: "1-36IN099J", estado: "CUMPLE", fecha: "2024-12-03" },
      { orden: "1-36KHPGRE", estado: "CUMPLE", fecha: "2024-12-04" },
      { orden: "1-36KEP900", estado: "CUMPLE", fecha: "2024-12-05" },
      { orden: "1-36J9Z09S", estado: "NO CUMPLE", fecha: "2024-12-06" },
      { orden: "1-36HN04I7", estado: "CUMPLE", fecha: "2024-12-07" },
      { orden: "1-36I3AK9V", estado: "CUMPLE", fecha: "2024-12-08" },
      { orden: "1-36HWRONT", estado: "CUMPLE", fecha: "2024-12-09" },
      { orden: "1-36HJOQ9F", estado: "NO CUMPLE", fecha: "2024-12-10" },
    ],
    cumple: [
      { orden: "1-36KUTNFZ", estado: "CUMPLE", fecha: "2024-12-01" },
      { orden: "1-36KMLHXJ", estado: "CUMPLE", fecha: "2024-12-02" },
      { orden: "1-36IN099J", estado: "CUMPLE", fecha: "2024-12-03" },
      { orden: "1-36KHPGRE", estado: "CUMPLE", fecha: "2024-12-04" },
    ],
    noCumple: [
      { orden: "1-36J9Z09S", estado: "NO CUMPLE", fecha: "2024-12-06" },
      { orden: "1-36HJOQ9F", estado: "NO CUMPLE", fecha: "2024-12-10" },
    ]
  },
  "03-24": { 
    todas: [
      { orden: "1-36KUTNFZ", estado: "CUMPLE", fecha: "2024-03-01" },
      { orden: "1-36KMLHXJ", estado: "CUMPLE", fecha: "2024-03-02" },
      { orden: "1-36IN099J", estado: "CUMPLE", fecha: "2024-03-03" },
    ],
    cumple: [
      { orden: "1-36KUTNFZ", estado: "CUMPLE", fecha: "2024-03-01" },
      { orden: "1-36KMLHXJ", estado: "CUMPLE", fecha: "2024-03-02" },
    ],
    noCumple: []
  },
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

type TableRow = typeof tableData[0];

function DetailPanel({ record, onClose }: { record: TableRow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"todas" | "cumple" | "noCumple">("todas");
  const data = detailData[record.mes] || { todas: [], cumple: [], noCumple: [] };
  const currentData = data[activeTab];

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="absolute inset-y-0 right-0 w-full md:w-full lg:w-2/3 bg-card shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Detalle {record.mes}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-detail"
          >
            <ChevronLeft size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("todas")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "todas" ? "bg-[#06b6d4] text-black" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                data-testid="tab-todas"
              >
                Todas ({record.totales})
              </button>
              <button
                onClick={() => setActiveTab("cumple")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "cumple" ? "bg-green-500 text-black" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                data-testid="tab-cumple"
              >
                Cumplen ({record.cumple})
              </button>
              <button
                onClick={() => setActiveTab("noCumple")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "noCumple" ? "bg-red-500 text-black" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                data-testid="tab-noCumple"
              >
                No Cumple ({record.noCumple})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 text-xs">ORDEN</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 text-xs">ESTADO</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 text-xs">FECHA</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300 text-xs">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors" data-testid={`detail-row-${idx}`}>
                    <td className="px-4 py-3 text-xs text-slate-200" data-testid={`detail-orden-${idx}`}>{row.orden}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${row.estado === "CUMPLE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`} data-testid={`detail-estado-${idx}`}>
                        {row.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400" data-testid={`detail-fecha-${idx}`}>{row.fecha}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}



export default function Dashboard() {
  const [selectedRecord, setSelectedRecord] = useState<TableRow | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

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

  const sortedData = useMemo(() => {
    let data = [...tableData];
    
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];
        const comparison = Number(aVal) - Number(bVal);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    
    return data;
  }, [sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Calidad Reactiva <span className="text-slate-400 text-xs md:text-sm font-normal">(Reconstrucción)</span></h1>
        </div>
        <div className="text-slate-400 text-xs md:text-sm">
          RUT: 22064488-K
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="pb-24">
        <div className="px-3 md:px-6 space-y-4 max-w-4xl mx-auto">
          
          {/* Chart Section Title */}
          <div className="flex items-center justify-between px-2 pt-4">
            <h2 className="text-base md:text-lg font-bold text-white">Evolución de Calidad Reactiva</h2>
            <span className="text-slate-500 text-xs md:text-sm">2025</span>
          </div>

          {/* Top Chart Card */}
          <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-3 md:p-6 pt-4">
              <div className="h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={5}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(value) => `${value}%`}
                      label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 10 }}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#06b6d4' }}
                      formatter={(value) => [`${value}%`, 'Valor']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Chart Card */}
          <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-3 md:p-6 pt-4">
              <div className="h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyData} margin={{ top: 20, right: 30, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={5}
                    />
                    <YAxis 
                      type="number"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(value) => `${value}%`}
                      label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 10 }}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#06b6d4' }}
                      formatter={(value) => [`${value}%`, 'Eficiencia']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val1" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val2" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <div className="pt-4">
            <h3 className="text-base md:text-lg font-bold text-white mb-3 px-2">Detalle por Mes</h3>
            
            {/* Filter and Download Section */}
            <div className="flex flex-row gap-2 items-center mb-4">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-sm"
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
                className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs md:text-sm focus:outline-none focus:border-[#06b6d4] transition-colors cursor-pointer whitespace-nowrap"
                data-testid="month-select"
              >
                <option value="" disabled className="bg-slate-900">
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
                onClick={handleDownloadPDF}
                className="flex items-center justify-center p-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex-shrink-0"
                data-testid="download-pdf"
                title="Descargar en PDF"
              >
                <FileText size={16} />
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center justify-center p-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex-shrink-0"
                data-testid="download-excel"
                title="Descargar en Excel"
              >
                <Sheet size={16} />
              </button>
            </div>
            
            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
              <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th 
                        onClick={() => handleSort("mes")}
                        className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Mes
                          {sortColumn === "mes" && (
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
                        onClick={() => handleSort("totales")}
                        className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Totales
                          {sortColumn === "totales" && (
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
                        onClick={() => handleSort("cumple")}
                        className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Cumple
                          {sortColumn === "cumple" && (
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
                        onClick={() => handleSort("noCumple")}
                        className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          No Cumple
                          {sortColumn === "noCumple" && (
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
                    {sortedData.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRecord(row)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        data-testid={`table-row-${idx}`}
                      >
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`table-mes-${idx}`}>{row.mes}</td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`table-totales-${idx}`}>{row.totales}</td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-green-400 font-semibold" data-testid={`table-cumple-${idx}`}>{row.cumple}</td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-red-400 font-semibold" data-testid={`table-noCumple-${idx}`}>{row.noCumple}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>

        </div>
      </main>

      <AnimatePresence>
        {selectedRecord && (
          <DetailPanel
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
