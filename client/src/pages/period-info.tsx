
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Parámetros globales según documentación
const GLOBAL_RUT = "14777223-8";
const GLOBAL_PERIODO = "202510";

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

function StatCard({ icon, label, value, unit = "" }: { icon: string; label: string; value: string; unit?: string }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{icon}</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</span>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">
          {value}{unit}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PeriodInfo() {
  const [data, setData] = useState<TqwData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/tqw-comision/${GLOBAL_RUT}/${GLOBAL_PERIODO}`);
        if (!response.ok) {
          throw new Error("No se encontraron datos para este RUT y período");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper functions para formateo según documentación
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Cargando datos...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header - Información del Técnico */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                👤
              </div>
              <div>
                <h1 className="text-2xl font-bold">{data.NombreTecnico || "Sin datos"}</h1>
                <p className="text-blue-100">RUT: {GLOBAL_RUT}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-blue-100 text-sm">Zona</p>
                <p className="font-semibold">{data.Zona_Factura23 || "N/A"}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Modelo Turno</p>
                <p className="font-semibold">{data.modelo_turno || "N/A"}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Categoría</p>
                <p className="font-semibold">{data.categoria || "N/A"}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Supervisor</p>
                <p className="font-semibold">{data.Supervisor || ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comisiones */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">💰 Comisiones</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="📊" label="Cálculo HFC" value={formatMoney(data.Comision_HFC)} />
              <StatCard icon="📊" label="Cálculo FTTH" value={formatMoney(data.Comision_FTTH)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="💵" label="Comisión HFC Ponderada" value={formatMoney(data.Comision_HFC_Ponderada)} />
              <StatCard icon="💵" label="Comisión FTTH Ponderada" value={formatMoney(data.Comision_FTTH_Ponderada)} />
            </div>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold">Comisión Total</span>
                  <span className="text-2xl font-bold">{calcularComisionTotal()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Producción */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">📈 Producción</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="🎯" label="Puntos HFC" value={formatNumber(data.Puntos)} />
              <StatCard icon="📅" label="Días HFC" value={formatNumber(data.Dias_Cantidad_HFC)} />
              <StatCard icon="📊" label="Promedio HFC" value={formatNumber(data.Promedio_HFC, 2)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📡" label="RGU FTTH" value={formatNumber(data.Q_RGU)} />
              <StatCard icon="📅" label="Días FTTH" value={formatNumber(data.Dias_Cantidad_FTTH)} />
              <StatCard icon="📊" label="Promedio RGU" value={formatNumber(data.Promedio_RGU, 2)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Metas y Cumplimiento */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">🎯 Metas y Cumplimiento</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="🎯" label="Meta HFC" value={formatNumber(data.Meta_Produccion_HFC)} />
              <StatCard icon="✅" label="Cumplimiento HFC" value={formatPercent(data._CumplimientoProduccionHFC)} unit="%" />
              <StatCard icon="🎯" label="Meta FTTH" value={formatNumber(data.Meta_Produccion_FTTH, 1)} />
            </div>
            <StatCard icon="✅" label="Cumplimiento FTTH" value={formatPercent(data._cumplimientoProduccionRGU)} unit="%" />
          </div>
        </div>

        <Separator />

        {/* Indicadores de Calidad */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">⭐ Calidad</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📊" label="KPI Calidad HFC" value={formatPercent(data.Ratio_CalidadHFC)} unit="%" />
              <StatCard icon="🎯" label="Meta Calidad HFC" value={formatPercent(data.Meta_Calidad_HFC)} unit="%" />
              <StatCard icon="✅" label="Cumpl. Calidad HFC" value={formatPercent(data._cumplimientoMeta_Calidad_HFC)} unit="%" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📊" label="KPI Calidad FTTH" value={formatPercent(data.Ratio_CalidadFTTH)} unit="%" />
              <StatCard icon="🎯" label="Meta Calidad FTTH" value={formatPercent(data.Meta_Calidad_FTTH)} unit="%" />
              <StatCard icon="✅" label="Cumpl. Calidad FTTH" value={formatPercent(data._cumplimientoMeta_Calidad_FTTH)} unit="%" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Asistencia */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">📅 Asistencia</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📅" label="Días Operativos" value={formatNumber(data.Q_OPERATIVO_TURNO)} />
              <StatCard icon="📅" label="Días Ausente" value={formatNumber(data.Q_AUSENTE_TURNO)} />
              <StatCard icon="📅" label="Días Vacaciones" value={formatNumber(data.Q_VACACIONES_TURNO)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="📅" label="Días Licencia" value={formatNumber(data.Q_LICENCIA_TURNO)} />
              <StatCard icon="📊" label="Factor Ausencia" value={formatPercent(data.FACTOR_AUSENCIA)} unit="%" />
              <StatCard icon="📊" label="Factor Vacaciones" value={formatPercent(data.FACTOR_VACACIONES)} unit="%" />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
