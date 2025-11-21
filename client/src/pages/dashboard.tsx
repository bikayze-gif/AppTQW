"use client";

import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

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
  { id: 1, rut: "12.345.678-9", estado: "Activo", eficiencia: "95%", fecha: "2025-01-15" },
  { id: 2, rut: "23.456.789-0", estado: "Pendiente", eficiencia: "78%", fecha: "2025-01-14" },
  { id: 3, rut: "34.567.890-1", estado: "Activo", eficiencia: "100%", fecha: "2025-01-13" },
  { id: 4, rut: "45.678.901-2", estado: "Inactivo", eficiencia: "45%", fecha: "2025-01-12" },
  { id: 5, rut: "56.789.012-3", estado: "Activo", eficiencia: "88%", fecha: "2025-01-11" },
  { id: 6, rut: "67.890.123-4", estado: "Activo", eficiencia: "92%", fecha: "2025-01-10" },
  { id: 7, rut: "78.901.234-5", estado: "Pendiente", eficiencia: "65%", fecha: "2025-01-09" },
  { id: 8, rut: "89.012.345-6", estado: "Activo", eficiencia: "99%", fecha: "2025-01-08" },
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
    case "Activo":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "Pendiente":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Inactivo":
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
};

type TableRecord = typeof tableData[0];

function DetailPanel({ record, onClose }: { record: TableRecord; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Slide Panel */}
      <motion.div
        className="absolute inset-y-0 right-0 w-full md:w-96 bg-card shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Detalles del Registro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-detail"
          >
            <ChevronLeft size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* RUT Section */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RUT</label>
            <p className="text-xl font-bold text-white mt-2" data-testid="detail-rut">{record.rut}</p>
          </div>

          {/* Estado Section */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</label>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(record.estado)}`} data-testid="detail-estado">
                {record.estado}
              </span>
            </div>
          </div>

          {/* Eficiencia Section */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eficiencia</label>
            <div className="mt-2 bg-white/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-[#06b6d4]" data-testid="detail-eficiency">{record.eficiencia}</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"
                  initial={{ width: 0 }}
                  animate={{ width: record.eficiencia }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                />
              </div>
            </div>
          </div>

          {/* Fecha Section */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Registro</label>
            <p className="text-base text-slate-300 mt-2" data-testid="detail-fecha">{record.fecha}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold py-2.5 rounded-lg transition-colors" data-testid="button-edit-record">
              Editar Registro
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-colors" data-testid="button-delete-record">
              Eliminar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [selectedRecord, setSelectedRecord] = useState<TableRecord | null>(null);

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
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={3}
                      dot={<CustomDot />}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Chart Card */}
          <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-3 md:p-6 pt-4">
              <div className="h-48 md:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyData} margin={{ top: 20, right: 30, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      hide={true}
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
                    <Line 
                      type="monotone" 
                      dataKey="val1" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={3}
                      dot={<CustomDot />}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val2" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={3}
                      dot={<CustomDot />}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <div className="pt-4">
            <h3 className="text-base md:text-lg font-bold text-white mb-3 px-2">Registros</h3>
            
            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
              <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm">RUT</th>
                      <th className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm">Estado</th>
                      <th className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm">Eficiencia</th>
                      <th className="px-3 md:px-6 py-3 text-left font-semibold text-slate-300 text-xs md:text-sm">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableData.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRecord(row)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        data-testid={`table-row-${idx}`}
                      >
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`table-rut-${idx}`}>{row.rut}</td>
                        <td className="px-3 md:px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.estado)}`} data-testid={`table-status-${idx}`}>
                            {row.estado}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-200" data-testid={`table-eficiency-${idx}`}>{row.eficiencia}</td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-slate-400" data-testid={`table-date-${idx}`}>{row.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>

        </div>
      </main>

      {/* Detail Panel with Slide Animation */}
      <AnimatePresence>
        {selectedRecord && (
          <DetailPanel
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
