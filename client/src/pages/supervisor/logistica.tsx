import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, Award, Zap, Package, Truck, RotateCcw, ClipboardList, Construction } from "lucide-react";
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center min-h-[500px] flex flex-col items-center justify-center overflow-hidden relative">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />

                            <div className="max-w-md mx-auto space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <img
                                        src="/under-construction.png"
                                        alt="En construcción"
                                        className="relative rounded-2xl shadow-2xl w-full max-w-[320px] mx-auto transform transition duration-500 hover:scale-105"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-orange-500 dark:text-orange-400 mb-2">
                                        <Construction className="w-5 h-5 animate-bounce" />
                                        <span className="text-sm font-bold uppercase tracking-widest">Próximamente</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                                        {activeTab}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                        Estamos trabajando duro para traerte la mejor experiencia en la gestión de <span className="text-slate-900 dark:text-white font-medium">{activeTab}</span>.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 text-sm font-medium">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                        </span>
                                        En construcción
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SupervisorLayout>
    );
}
