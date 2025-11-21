import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

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

export default function Dashboard() {
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
      <main className="pb-32 md:pb-24">
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
                  <LineChart data={evolutionData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(value) => `${value}%`}
                      label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 5 }}
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
                  <LineChart data={efficiencyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      hide={true}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 120]}
                      ticks={[20, 40, 60, 80, 100]}
                      tickFormatter={(value) => `${value}%`}
                      label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 5 }}
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
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
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

      <BottomNav />
    </div>
  );
}
