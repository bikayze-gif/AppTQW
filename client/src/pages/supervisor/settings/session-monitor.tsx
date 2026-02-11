import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
    Users, LogIn, ShieldAlert, CheckCircle, RefreshCw, Clock,
    Monitor, Globe, AlertTriangle, Activity, Wifi, WifiOff, XCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import SettingsLayout from "./layout";
import { KpiCard } from "@/components/supervisor/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const PROFILE_COLORS: Record<string, string> = {
    "administrador": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "GERENCIA": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Supervisor Tecnico": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "SME": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "LOGISTICA": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Generico Bodega": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function getProfileBadge(perfil: string | null) {
    if (!perfil) return <Badge variant="secondary" className="text-[10px]">Sin perfil</Badge>;
    const colorClass = PROFILE_COLORS[perfil] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    return <Badge className={`text-[10px] border-none font-medium ${colorClass}`}>{perfil}</Badge>;
}

function getStatusIndicator(minutesActive: number) {
    if (minutesActive <= 15) {
        return <div className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-xs text-emerald-600 dark:text-emerald-400">Activo</span></div>;
    } else if (minutesActive <= 60) {
        return <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-amber-500" /><span className="text-xs text-amber-600 dark:text-amber-400">Inactivo</span></div>;
    }
    return <div className="flex items-center gap-1.5"><WifiOff className="w-3 h-3 text-slate-400" /><span className="text-xs text-slate-500">Idle</span></div>;
}

function formatDuration(minutes: number | null): string {
    if (!minutes && minutes !== 0) return "-";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

// Parse MySQL DATE_FORMAT strings as-is (no timezone conversion)
function parseLocalDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    // Handle "2026-02-11 14:34:05" format (already in local time from server)
    const d = new Date(dateStr.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(dateStr: string | null, includeDate = true): string {
    if (!dateStr) return '-';
    const d = parseLocalDate(dateStr);
    if (!d) return dateStr;
    if (includeDate) {
        return format(d, "dd/MM/yyyy HH:mm:ss", { locale: es });
    }
    return format(d, "HH:mm:ss", { locale: es });
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function SessionMonitor() {
    const [activeTab, setActiveTab] = useState("overview");
    const queryClient = useQueryClient();

    // Kill session mutation
    const killSession = useMutation({
        mutationFn: async (sessionId: number) => {
            const res = await fetch(`/api/supervisor/session-monitor/sessions/${sessionId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to kill session");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session-monitor"] });
        },
    });

    // Main dashboard data - auto-refresh every 30 seconds
    const { data: monitorData, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ["session-monitor"],
        queryFn: async () => {
            const res = await fetch("/api/supervisor/session-monitor");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        refetchInterval: 30000,
    });

    // Stats data (last 30 days)
    const { data: statsData } = useQuery({
        queryKey: ["session-monitor-stats"],
        queryFn: async () => {
            const res = await fetch("/api/supervisor/session-monitor/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
        refetchInterval: 60000,
    });

    const stats = monitorData?.stats || {
        totalLoginsToday: 0,
        failedAttemptsToday: 0,
        activeSessionsCount: 0,
        uniqueUsersToday: 0,
        avgSessionDuration: '0m',
        successRate: 100,
    };

    // Prepare hourly chart data
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const found = statsData?.hourlyDistribution?.find((h: any) => h.hour === i);
        return { hour: HOUR_LABELS[i], count: found?.count || 0 };
    });

    return (
        <SettingsLayout>
            <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-blue-500" />
                            Monitor de Sesiones
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Monitoreo en tiempo real de inicios de sesión y accesos al sistema.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {dataUpdatedAt > 0 && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(dataUpdatedAt), "HH:mm:ss")}
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Sesiones Activas"
                        value={stats.activeSessionsCount}
                        icon={<Users className="w-5 h-5" />}
                        variant="emerald"
                        description="Hoy"
                    />
                    <KpiCard
                        title="Logins Hoy"
                        value={stats.totalLoginsToday}
                        icon={<LogIn className="w-5 h-5" />}
                        variant="blue"
                        description={`${stats.uniqueUsersToday} usuarios únicos`}
                    />
                    <KpiCard
                        title="Intentos Fallidos"
                        value={stats.failedAttemptsToday}
                        icon={<ShieldAlert className="w-5 h-5" />}
                        variant="rose"
                        description="Hoy"
                    />
                    <KpiCard
                        title="Tasa de Éxito"
                        value={`${stats.successRate}%`}
                        icon={<CheckCircle className="w-5 h-5" />}
                        variant="purple"
                        description={`Duración prom: ${stats.avgSessionDuration}`}
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Sesiones Activas</TabsTrigger>
                        <TabsTrigger value="log">Log de Accesos</TabsTrigger>
                        <TabsTrigger value="failed">Intentos Fallidos</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>

                    {/* Active Sessions Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                                    <TableRow>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Área</TableHead>
                                        <TableHead>Fecha/Hora Login</TableHead>
                                        <TableHead>Duración</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!monitorData?.activeSessions?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                No hay sesiones activas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        monitorData.activeSessions.map((session: any) => (
                                            <TableRow key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <TableCell>{getStatusIndicator(session.minutesActive ?? 0)}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-sm">{session.nombre || session.usuario}</div>
                                                        <div className="text-[11px] text-slate-400">{session.email || session.usuario}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getProfileBadge(session.perfil)}</TableCell>
                                                <TableCell className="text-sm text-slate-600 dark:text-slate-400">{session.area || '-'}</TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDateTime(session.fecha_conexion)}
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">
                                                    {formatDuration(session.minutesActive ?? 0)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Globe className="w-3 h-3" />
                                                        {session.ip}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 gap-1 h-7 px-2"
                                                        disabled={killSession.isPending}
                                                        onClick={() => {
                                                            if (confirm(`¿Cerrar la sesión de ${session.nombre || session.usuario}?`)) {
                                                                killSession.mutate(session.id);
                                                            }
                                                        }}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        <span className="text-xs">Cerrar</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Recent Logins Tab */}
                    <TabsContent value="log" className="space-y-4 mt-4">
                        <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha Conexión</TableHead>
                                        <TableHead>Fecha Desconexión</TableHead>
                                        <TableHead>Duración</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!monitorData?.recentLogins?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                <LogIn className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                No hay registros de acceso
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        monitorData.recentLogins.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-sm">{log.nombre || log.usuario}</div>
                                                        <div className="text-[11px] text-slate-400">{log.email || log.usuario}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getProfileBadge(log.perfil)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-[10px] border-none ${
                                                        log.estado === 'ACTIVE'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        {log.estado}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDateTime(log.fecha_conexion)}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {formatDateTime(log.fecha_desconexion)}
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">
                                                    {log.duracion ? formatDuration(Math.floor(log.duracion / 60)) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Globe className="w-3 h-3" />
                                                        {log.ip}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Failed Attempts Tab */}
                    <TabsContent value="failed" className="space-y-4 mt-4">
                        <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Razón</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>User Agent</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!monitorData?.failedAttempts?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20 text-emerald-500" />
                                                No hay intentos fallidos hoy
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        monitorData.failedAttempts.map((attempt: any) => (
                                            <TableRow key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <TableCell className="font-medium text-sm">{attempt.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        {attempt.failure_reason || 'Credenciales inválidas'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Globe className="w-3 h-3" />
                                                        {attempt.ip_address}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-400 max-w-[200px] truncate">
                                                    {attempt.user_agent || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDateTime(attempt.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Insights Tab */}
                    <TabsContent value="insights" className="space-y-6 mt-4">
                        {/* Hourly Distribution Chart */}
                        <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm p-6">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                                Distribución Horaria de Logins (últimos 30 días)
                            </h4>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                            formatter={(value: number) => [`${value} logins`, 'Cantidad']}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {hourlyData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index >= 8 && index <= 18 ? '#3b82f6' : '#94a3b8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Top Users */}
                            <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm p-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                                    Top Usuarios por Frecuencia
                                </h4>
                                <div className="space-y-3">
                                    {statsData?.topUsers?.map((user: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium truncate">{user.nombre || user.email}</div>
                                                    <div className="text-[11px] text-slate-400">{user.perfil || '-'}</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="shrink-0">{user.loginCount} logins</Badge>
                                        </div>
                                    )) || (
                                        <p className="text-sm text-slate-400 text-center py-4">Cargando...</p>
                                    )}
                                </div>
                            </div>

                            {/* Top IPs */}
                            <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm p-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                                    IPs más Frecuentes
                                </h4>
                                <div className="space-y-3">
                                    {statsData?.topIPs?.map((ip: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm font-mono">{ip.ip_address}</span>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="shrink-0">{ip.count} accesos</Badge>
                                        </div>
                                    )) || (
                                        <p className="text-sm text-slate-400 text-center py-4">Cargando...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Success Rate Over Time */}
                        {statsData?.successRateOverTime?.length > 0 && (
                            <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm p-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
                                    Tasa de Éxito Diaria (últimos 30 días)
                                </h4>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statsData.successRateOverTime.map((d: any) => ({
                                            date: format(new Date(d.date), "dd/MM"),
                                            exitosos: d.successful,
                                            fallidos: d.failed,
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                            <Bar dataKey="exitosos" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Exitosos" />
                                            <Bar dataKey="fallidos" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fallidos" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </SettingsLayout>
    );
}
