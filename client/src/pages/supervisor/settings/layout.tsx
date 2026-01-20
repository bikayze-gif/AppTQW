import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { useLocation } from "wouter";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
    children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const [location, setLocation] = useLocation();

    const settingsMenu = [
        { label: "Parametrico Puntaje", path: "/supervisor/settings/parametros" },
        { label: "Permisos de Menú", path: "/supervisor/settings/permissions" },
        { label: "Notificaciones", path: "/supervisor/settings/notifications" },
        { label: "Usuarios TQW", path: "/supervisor/settings/users" },
    ];

    return (
        <SupervisorLayout>
            <div className="flex h-full gap-6">
                {/* Secondary Sidebar */}
                <aside className="w-64 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Configuración</h2>
                        <p className="text-xs text-slate-500 mt-1">Ajustes del sistema</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                        {settingsMenu.map((item) => {
                            const isActive = location === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => setLocation(item.path)}
                                    className={cn(
                                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    {children}
                </div>
            </div>
        </SupervisorLayout>
    );
}
