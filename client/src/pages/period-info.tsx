import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { AlertCircle, ChevronUp, ChevronDown, Wrench, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { MaterialForm } from "@/components/material-form";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const GLOBAL_PERIODO = "202603";

interface TqwData {
  RutTecnicoOrig: string;
  periodo: string;
  NombreTecnico: string | null;
  Supervisor: string | null;
  Zona_Factura23: string | null;
  modelo_turno: string | null;
  categoria: string | null;
  Comision_HFC: string | null;
  Comision_FTTH: string | null;
  Comision_HFC_Ponderada: string | null;
  Comision_FTTH_Ponderada: string | null;
  Puntos: string | null;
  Dias_Cantidad_HFC: string | null;
  Promedio_HFC: string | null;
  Q_RGU: string | null;
  Dias_Cantidad_FTTH: string | null;
  Promedio_RGU: string | null;
  Meta_Produccion_HFC: string | null;
  _CumplimientoProduccionHFC: string | null;
  Meta_Produccion_FTTH: string | null;
  _cumplimientoProduccionRGU: string | null;
  Ratio_CalidadHFC: string | null;
  Meta_Calidad_HFC: string | null;
  _cumplimientoMeta_Calidad_HFC: string | null;
  Ratio_CalidadFTTH: string | null;
  Meta_Calidad_FTTH: string | null;
  _cumplimientoMeta_Calidad_FTTH: string | null;
  Q_OPERATIVO_TURNO: string | null;
  Q_AUSENTE_TURNO: string | null;
  Q_VACACIONES_TURNO: string | null;
  Q_LICENCIA_TURNO: string | null;
  FACTOR_AUSENCIA: string | null;
  FACTOR_VACACIONES: string | null;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  iconColor?: string;
}

function StatCard({ icon, label, value, unit = "", iconColor = "text-purple-400" }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 sm:p-3 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
      <div className="flex flex-col items-center text-center">
        <div className={`text-xl sm:text-2xl mb-1 ${iconColor}`}>{icon}</div>
        <div className="text-[10px] sm:text-xs text-slate-400 font-medium">{label}</div>
        <div className="text-base sm:text-lg font-bold text-white mt-0.5">
          {value}{unit}
        </div>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/30 backdrop-blur-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
      >
        <h2 className="text-base font-bold text-white">{title}</h2>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-300" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-300" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 border-t border-slate-700/50 space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

// Fecha fin de mantenimiento: 16 de marzo de 2026 a las 15:00 GMT-3
const MAINTENANCE_END = new Date("2026-03-16T18:00:00Z");

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setRemaining(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const expired = remaining === 0;

  return { hours, minutes, seconds, expired };
}

export default function PeriodInfo() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<TqwData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const countdown = useCountdown(MAINTENANCE_END);

  // 🔒 GUARDIA DE SESIÓN: Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!user?.rut) {
      console.log("[PeriodInfo] No hay usuario autenticado, redirigiendo a login");
      setLocation("/login");
      return;
    }
  }, [user, setLocation]);

  // Estado de secciones colapsables
  const [sections, setSections] = useState({
    tecnico: true,
    comisiones: true,
    produccion: true,
    calidad: true,
    asistencia: false,
  });

  useEffect(() => {
    async function fetchData() {
      if (!user?.rut) {
        console.warn("[PeriodInfo] Intento de fetch sin RUT de usuario");
        setError("No se pudo obtener el RUT del usuario");
        setLoading(false);
        return;
      }

      console.log(`[PeriodInfo] Fetching data for RUT: ${user.rut}, period: ${GLOBAL_PERIODO}`);

      try {
        const response = await fetch(`/api/tqw-comision/${user.rut}/${GLOBAL_PERIODO}`);
        if (!response.ok) {
          console.error(`[PeriodInfo] API error: ${response.status} ${response.statusText}`);
          throw new Error("No se encontraron datos para este RUT y período");
        }
        const result = await response.json();
        console.log(`[PeriodInfo] Data loaded successfully for ${user.rut}`);
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al cargar los datos";
        console.error(`[PeriodInfo] Error fetching data:`, err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.rut]);

  const formatMoney = (value: string | null) => {
    if (!value) return "$0";
    const num = parseInt(value);
    return `$${num.toLocaleString('es-CL')}`;
  };

  const formatNumber = (value: string | null, decimals: number = 0) => {
    if (!value) return "0";
    const num = parseFloat(value);
    return num.toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatPercent = (value: string | null, decimals: number = 1) => {
    if (!value) return "0.0";
    const num = parseFloat(value) * 100;
    return num.toFixed(decimals);
  };

  const calcularComisionTotal = () => {
    if (!data) return "$0";
    const hfc = parseInt(data.Comision_HFC_Ponderada || "0");
    const ftth = parseInt(data.Comision_FTTH_Ponderada || "0");
    return formatMoney(String(hfc + ftth));
  };

  const handleMaterialSubmit = () => {
    // El MaterialForm maneja completamente el envío de datos
    // Esta función se llama después de confirmar, así que solo cerramos el formulario
    setShowMaterialForm(false);
  };

  // 🔒 BLOQUEO DE RENDER: No renderizar nada si no hay usuario
  if (!user?.rut) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Cargando datos...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "No se encontraron datos"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-28">
      <div className="max-w-5xl mx-auto p-2 sm:p-3 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-xl">📅</div>
            <h1 className="text-2xl font-bold text-white">
              PERIODO {GLOBAL_PERIODO.slice(0, 4)}-{GLOBAL_PERIODO.slice(4)}
            </h1>
          </div>
          <p className="text-slate-300 text-xs">{user?.nombre || data.NombreTecnico || "Técnico: Sin datos"}</p>
          <p className="text-slate-400 text-[10px]">RUT: {user?.rut}</p>
        </div>

        {/* Información del Técnico */}
        <CollapsibleSection
          title="Información del Técnico"
          isOpen={sections.tecnico}
          onToggle={() => setSections(prev => ({ ...prev, tecnico: !prev.tecnico }))}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📍" label="Zona" value={data.Zona_Factura23 || "N/A"} iconColor="text-rose-400" />
            <StatCard icon="🔄" label="Modelo Turno" value={data.modelo_turno || "N/A"} iconColor="text-purple-400" />
            <StatCard icon="⭐" label="Categoría" value={data.categoria || "N/A"} iconColor="text-yellow-400" />
          </div>
        </CollapsibleSection>

        {/* Comisiones */}
        <CollapsibleSection
          title="Comisiones"
          isOpen={sections.comisiones}
          onToggle={() => setSections(prev => ({ ...prev, comisiones: !prev.comisiones }))}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard icon="💵" label="Cálculo HFC" value={formatMoney(data.Comision_HFC)} iconColor="text-green-400" />
            <StatCard icon="💵" label="Cálculo FTTH" value={formatMoney(data.Comision_FTTH)} iconColor="text-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard icon="💵" label="Comisión HFC Ponderada" value={formatMoney(data.Comision_HFC_Ponderada)} iconColor="text-green-400" />
            <StatCard icon="💵" label="Comisión FTTH Ponderada" value={formatMoney(data.Comision_FTTH_Ponderada)} iconColor="text-green-400" />
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-slate-300 text-xs mb-1">Comisión Total</p>
            <p className="text-xl font-bold text-green-400">{calcularComisionTotal()}</p>
          </div>
        </CollapsibleSection>

        {/* Producción */}
        <CollapsibleSection
          title="Producción"
          isOpen={sections.produccion}
          onToggle={() => setSections(prev => ({ ...prev, produccion: !prev.produccion }))}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📊" label="Puntos HFC" value={formatNumber(data.Puntos)} iconColor="text-blue-400" />
            <StatCard icon="📅" label="Cantidad Días HFC" value={formatNumber(data.Dias_Cantidad_HFC)} iconColor="text-orange-400" />
            <StatCard icon="📈" label="Promedio HFC" value={formatNumber(data.Promedio_HFC, 2)} iconColor="text-purple-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📡" label="RGU FTTH" value={formatNumber(data.Q_RGU)} iconColor="text-blue-400" />
            <StatCard icon="📅" label="Cantidad Días FTTH" value={formatNumber(data.Dias_Cantidad_FTTH)} iconColor="text-orange-400" />
            <StatCard icon="📈" label="Promedio RGU" value={formatNumber(data.Promedio_RGU, 2)} iconColor="text-purple-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard icon="🎯" label="Meta Producción HFC" value={formatNumber(data.Meta_Produccion_HFC)} iconColor="text-green-400" />
            <StatCard icon="✅" label="Cumplimiento HFC" value={formatPercent(data._CumplimientoProduccionHFC)} unit="%" iconColor="text-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard icon="🎯" label="Meta Producción FTTH" value={formatNumber(data.Meta_Produccion_FTTH, 1)} iconColor="text-green-400" />
            <StatCard icon="✅" label="Cumplimiento FTTH" value={formatPercent(data._cumplimientoProduccionRGU)} unit="%" iconColor="text-orange-400" />
          </div>
        </CollapsibleSection>

        {/* Indicadores de Calidad */}
        <CollapsibleSection
          title="Indicadores de Calidad"
          isOpen={sections.calidad}
          onToggle={() => setSections(prev => ({ ...prev, calidad: !prev.calidad }))}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📊" label="KPI Calidad HFC" value={formatPercent(data.Ratio_CalidadHFC)} unit="%" iconColor="text-green-400" />
            <StatCard icon="✅" label="Meta Calidad HFC" value={formatPercent(data.Meta_Calidad_HFC)} unit="%" iconColor="text-green-400" />
            <StatCard icon="%" label="Cumplimiento Calidad HFC" value={formatPercent(data._cumplimientoMeta_Calidad_HFC)} unit="%" iconColor="text-orange-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📊" label="KPI Calidad FTTH" value={formatPercent(data.Ratio_CalidadFTTH)} unit="%" iconColor="text-green-400" />
            <StatCard icon="✅" label="Meta Calidad FTTH" value={formatPercent(data.Meta_Calidad_FTTH)} unit="%" iconColor="text-green-400" />
            <StatCard icon="%" label="Cumplimiento Calidad FTTH" value={formatPercent(data._cumplimientoMeta_Calidad_FTTH)} unit="%" iconColor="text-orange-400" />
          </div>
        </CollapsibleSection>

        {/* Asistencia y Factores */}
        <CollapsibleSection
          title="Asistencia y Factores"
          isOpen={sections.asistencia}
          onToggle={() => setSections(prev => ({ ...prev, asistencia: !prev.asistencia }))}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📅" label="Días Operativos" value={formatNumber(data.Q_OPERATIVO_TURNO)} iconColor="text-blue-400" />
            <StatCard icon="📅" label="Días Ausente" value={formatNumber(data.Q_AUSENTE_TURNO)} iconColor="text-blue-400" />
            <StatCard icon="📅" label="Días Vacaciones" value={formatNumber(data.Q_VACACIONES_TURNO)} iconColor="text-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard icon="📅" label="Días Licencia" value={formatNumber(data.Q_LICENCIA_TURNO)} iconColor="text-blue-400" />
            <StatCard icon="📊" label="Factor Ausencia" value={formatPercent(data.FACTOR_AUSENCIA)} unit="%" iconColor="text-purple-400" />
            <StatCard icon="📊" label="Factor Vacaciones" value={formatPercent(data.FACTOR_VACACIONES)} unit="%" iconColor="text-purple-400" />
          </div>
        </CollapsibleSection>
      </div>

      <MaterialForm
        isOpen={showMaterialForm}
        onClose={() => setShowMaterialForm(false)}
        onSubmit={handleMaterialSubmit}
        userId={user?.id}
      />

      <BottomNav />

      {/* Modal de Mantenimiento — no se puede cerrar */}
      <>
        {/* Backdrop — z-[48] para no tapar el BottomNav (z-50) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[48]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 flex items-center justify-center z-[48] px-5 pb-20"
        >
              <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40 p-6 overflow-hidden">
                {/* Glow decorativo */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Ícono */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 mb-4 mx-auto">
                  <Wrench size={28} className="text-amber-400" />
                </div>

                {/* Título */}
                <h2 className="text-center text-lg font-bold text-white mb-1">
                  Módulo en Mantenimiento
                </h2>
                <p className="text-center text-slate-300 text-xs mb-5 leading-relaxed">
                  Esta página está siendo actualizada actualmente. Los datos de comisiones y producción del período están siendo procesados y pueden no estar disponibles de forma temporal.
                </p>

                {/* Fecha estimada */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
                  <Clock size={15} className="text-cyan-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Disponible estimado</p>
                    <p className="text-sm font-semibold text-white">Lunes 16 de marzo · 15:00 hrs</p>
                  </div>
                </div>

                {/* Countdown */}
                {!countdown.expired ? (
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { value: countdown.hours, label: "Horas" },
                      { value: countdown.minutes, label: "Minutos" },
                      { value: countdown.seconds, label: "Segundos" },
                    ].map(({ value, label }) => (
                      <div key={label} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl py-2.5">
                        <span className="text-2xl font-bold text-white tabular-nums">
                          {String(value).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-5 text-center">
                    <p className="text-green-400 text-sm font-semibold">✓ Mantenimiento finalizado</p>
                    <p className="text-slate-300 text-xs mt-0.5">Por favor recarga la página</p>
                  </div>
                )}

              </div>
        </motion.div>
      </>
    </div>
  );
}