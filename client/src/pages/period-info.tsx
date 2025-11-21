import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function PeriodInfo() {
  const [, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    tecnico: true,
    comisiones: true,
    produccion: false,
    indicadores: false,
    asistencia: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const StatCard = ({ icon, label, value, unit = "" }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
      {unit && <div className="text-xs text-slate-400 mb-1">{unit}</div>}
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back-to-dashboard"
        >
          <ChevronLeft size={24} className="text-slate-400" />
        </button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Información Técnica</h1>
        <div className="w-6" /> {/* Spacer for alignment */}
      </header>

      <main className="px-4 md:px-6 space-y-4 max-w-2xl mx-auto pt-4">
        
        {/* Period Header */}
        <Card className="bg-[#06b6d4]/20 border border-[#06b6d4]/30 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-center gap-2">
            <div className="text-[#06b6d4]">📅</div>
            <h2 className="text-lg font-bold text-white">PERÍODO 202511</h2>
          </CardContent>
        </Card>

        {/* Información del Técnico */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("tecnico")}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            data-testid="button-toggle-tecnico"
          >
            <h3 className="text-base font-bold text-white">Información del Técnico</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.tecnico ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.tecnico && (
            <div className="space-y-3 pl-2">
              <div className="text-sm text-slate-400">
                Técnico: <span className="text-slate-200 font-semibold">Jesús Ignacio Lepe Rojas</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="📍" label="Zona" value="ZMSU" />
                <StatCard icon="🔧" label="Modelo Turno" value="5x2" />
                <StatCard icon="👤" label="Categoría" value="Sénior" />
              </div>
            </div>
          )}
        </div>

        {/* Comisiones */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("comisiones")}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            data-testid="button-toggle-comisiones"
          >
            <h3 className="text-base font-bold text-white">Comisiones</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.comisiones ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.comisiones && (
            <div className="space-y-3 pl-2">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon="📊" label="Cálculo HFC" value="$0" />
                <StatCard icon="📊" label="Cálculo FTTH" value="$56.000" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="💚" label="Comisión HFC Ponderada" value="$0" />
                <StatCard icon="💚" label="Comisión FTTH Ponderada" value="$46.666" />
                <StatCard icon="💚" label="Comisión Total" value="$46.666" />
              </div>
            </div>
          )}
        </div>

        {/* Producción */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("produccion")}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            data-testid="button-toggle-produccion"
          >
            <h3 className="text-base font-bold text-white">Producción</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.produccion ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.produccion && (
            <div className="space-y-3 pl-2">
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="📈" label="Puntos HFC" value="0" />
                <StatCard icon="📁" label="Cantidad Días HFC" value="0" />
                <StatCard icon="🎯" label="Promedio HFC" value="0.00" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="📈" label="ROI FTTH" value="37" />
                <StatCard icon="📁" label="Cantidad Días FTTH" value="11" />
                <StatCard icon="🎯" label="Promedio ROI" value="3.39" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard icon="🎁" label="Meta Producción HFC" value="349" />
                <StatCard icon="📊" label="Cumplimiento HFC" value="0.0%" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard icon="🎁" label="Meta Producción FTTH" value="1.6" />
                <StatCard icon="📊" label="Cumplimiento FTTH" value="74.0%" />
              </div>
            </div>
          )}
        </div>

        {/* Indicadores de Calidad */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("indicadores")}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            data-testid="button-toggle-indicadores"
          >
            <h3 className="text-base font-bold text-white">Indicadores de Calidad</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.indicadores ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.indicadores && (
            <div className="space-y-3 pl-2">
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="✅" label="KPI Calidad HFC" value="92.7" unit="%" />
                <StatCard icon="✅" label="Meta Calidad HFC" value="90.8" unit="%" />
                <StatCard icon="✅" label="Cumplimiento Calidad HFC" value="102.0" unit="%" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="✅" label="KPI Calidad FTTH" value="100.0" unit="%" />
                <StatCard icon="✅" label="Meta Calidad FTTH" value="89.3" unit="%" />
                <StatCard icon="✅" label="Cumplimiento Calidad FTTH" value="112.0" unit="%" />
              </div>
            </div>
          )}
        </div>

        {/* Asistencia y Factores */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("asistencia")}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            data-testid="button-toggle-asistencia"
          >
            <h3 className="text-base font-bold text-white">Asistencia y Factores</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.asistencia ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.asistencia && (
            <div className="space-y-3 pl-2">
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="📅" label="Días Operativos" value="11" />
                <StatCard icon="📅" label="Días Ausencia" value="0" />
                <StatCard icon="📅" label="Días Vacaciones" value="5" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon="📅" label="Días Licencia" value="0" />
                <StatCard icon="📊" label="Factor Asistencia" value="100.0" unit="%" />
                <StatCard icon="📊" label="Factor Vacaciones" value="83.3" unit="%" />
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
