import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, Award, Zap, Package, Truck, RotateCcw, ClipboardList } from "lucide-react";
import { RequestDashboard } from "@/components/supervisor/logistica/solicitudes/request-dashboard";

export default function SupervisorLogistica() {
    const [activeTab, setActiveTab] = useState<'inventario' | 'despachos' | 'devoluciones' | 'solicitudes'>('solicitudes');

    return (
        <SupervisorLayout>
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Logística y Operaciones
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Gestión de inventario, despachos y devoluciones
                            </p>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-1 mt-8 border-b border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => setActiveTab('inventario')}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === 'inventario'
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 border-b-2 border-blue-600 dark:border-blue-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <Package className="w-4 h-4 inline-block mr-2" />
                            Inventario
                        </button>
                        <button
                            onClick={() => setActiveTab('despachos')}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === 'despachos'
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 border-b-2 border-purple-600 dark:border-purple-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <Truck className="w-4 h-4 inline-block mr-2" />
                            Despachos
                        </button>
                        <button
                            onClick={() => setActiveTab('devoluciones')}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === 'devoluciones'
                                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-slate-800 border-b-2 border-green-600 dark:border-green-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <RotateCcw className="w-4 h-4 inline-block mr-2" />
                            Devoluciones
                        </button>
                        <button
                            onClick={() => setActiveTab('solicitudes')}
                            className={cn(
                                "px-6 py-3 rounded-t-lg font-medium text-sm transition-all relative overflow-hidden",
                                activeTab === 'solicitudes'
                                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-slate-800 border-b-2 border-orange-600 dark:border-orange-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <ClipboardList className="w-4 h-4 inline-block mr-2" />
                            Solicitud de materiales
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'solicitudes' ? (
                        <RequestDashboard />
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center min-h-[400px] flex items-center justify-center">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 capitalize">{activeTab}</h2>
                                <p className="text-slate-500 dark:text-slate-400">Contenido de la sección {activeTab} en desarrollo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SupervisorLayout>
    );
}
