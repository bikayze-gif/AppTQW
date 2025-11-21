"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

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
  { id: 1, mes: "Dic 24", totales: 73, cumple: 64, noCumple: 9 },
  { id: 2, mes: "Mar 24", totales: 23, cumple: 23, noCumple: 0 },
  { id: 3, mes: "Abr 24", totales: 41, cumple: 41, noCumple: 0 },
  { id: 4, mes: "May 24", totales: 55, cumple: 50, noCumple: 5 },
  { id: 5, mes: "Jun 24", totales: 67, cumple: 62, noCumple: 5 },
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



export default function Dashboard() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
                        className="hover:bg-white/5 transition-colors"
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
    </div>
  );
}
