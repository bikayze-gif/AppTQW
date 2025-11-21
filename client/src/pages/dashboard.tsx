import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

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
  { month: "4", val1: 0, val2: 100 },
  { month: "5", val1: 100, val2: 100 },
  { month: "6", val1: 100, val2: 100 },
  { month: "7", val1: 95, val2: 100 },
  { month: "8", val1: 78, val2: 0 },
  { month: "9", val1: 85, val2: 0 },
  { month: "10", val1: 85, val2: 0 },
  { month: "11", val1: 20, val2: 100 },
  { month: "12", val1: 0, val2: 100 },
];

// Custom Dot for the chart to match the screenshot style
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
  return (
    <div className="min-h-screen bg-background pb-24 text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Calidad Reactiva <span className="text-slate-400 text-sm font-normal">(Reconstrucción)</span></h1>
        </div>
        <div className="text-slate-400 text-sm">
          RUT: 22064488-K
        </div>
      </header>

      <main className="px-4 space-y-4 max-w-md mx-auto">
        
        {/* Main Chart Section */}
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-white">Evolución de Calidad Reactiva</h2>
          <span className="text-slate-500 text-sm">2025</span>
        </div>

        {/* Top Chart Card */}
        <Card className="bg-card border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0 pt-6 pr-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 10 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={4}
                    dot={<CustomDot />}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Chart Card */}
        <Card className="bg-card border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0 pt-6 pr-4">
            <div className="h-[200px] w-full">
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
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 120]}
                    ticks={[20, 40, 60, 80, 100]}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' }, offset: 10 }}
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

      </main>

      <BottomNav />
    </div>
  );
}
