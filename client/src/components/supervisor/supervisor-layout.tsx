import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar, MessageSquare, Users, ShoppingCart, Folder,
  HelpCircle, Mail, FileText, Trello, CheckSquare,
  User, Bell, Settings, Menu, ChevronRight,
  LogOut, NotebookPen, BarChart3, Receipt, Sun, Moon,
  AlertCircle, CheckCircle2, Package, Briefcase, Truck, Maximize, Minimize, Check, Trophy, CalendarDays, Route, PenLine
} from "lucide-react";
import { useTheme } from "next-themes";
import { QuickNoteDropdown } from "@/components/supervisor/quick-note-dropdown";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNotifications } from "@/hooks/use-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

export function SupervisorLayout({ children }: SupervisorLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const profile = user?.perfil || "user";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const quickNoteButtonRef = useRef<HTMLButtonElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const { data: allowedItems } = useQuery<string[]>({
    queryKey: ["/api/sidebar-permissions", profile],
    enabled: !!profile,
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (label: string) => {
    if (label === "Calendar") {
      setLocation("/supervisor/calendar");
    } else if (label === "Notes") {
      setLocation("/supervisor/notes");
    } else if (label === "Messenger") {
      setLocation("/supervisor/messenger");
    } else if (label === "Scrumboard") {
      setLocation("/supervisor/scrumboard");
    } else if (label === "Monitoring") {
      setLocation("/supervisor/monitoring");
    } else if (label === "Facturación") {
      setLocation("/supervisor/billing");
    } else if (label === "KPI") {
      setLocation("/supervisor/kpi");
    } else if (label === "Calidad") {
      setLocation("/supervisor/calidad");
    } else if (label === "Logística") {
      setLocation("/supervisor/logistica");
    } else if (label === "Formulario SME") {
      setLocation("/supervisor/sme");
    } else if (label === "Modulo Logistico") {
      setLocation("/supervisor/modulo-logistico");
    } else if (label === "Flujo Logístico") {
      setLocation("/supervisor/flujo-logistico");
    } else if (label === "Desafío Técnico") {
      setLocation("/supervisor/desafio-tecnico");
    } else if (label === "Turnos") {
      setLocation("/supervisor/turnos");
    } else if (label === "Configuración") {
      setLocation("/supervisor/settings/parametros");
    }
  };

  const menuItems = [
    { icon: Calendar, label: "Calendar", badge: "3 upcoming events", hasSubmenu: false },
    { icon: MessageSquare, label: "Messenger", hasSubmenu: false },
    // { icon: Users, label: "Contacts", hasSubmenu: false },
    // { icon: Mail, label: "Mail", badgeCount: 27, hasSubmenu: false },
    { icon: NotebookPen, label: "Notes", hasSubmenu: false },
    { icon: Trello, label: "Scrumboard", hasSubmenu: false },
    // { icon: BarChart3, label: "Monitoring", hasSubmenu: false },
    { icon: Receipt, label: "Facturación", hasSubmenu: false },
    { icon: Package, label: "Logística", hasSubmenu: false },
    { icon: Briefcase, label: "Formulario SME", hasSubmenu: false },
    { icon: Truck, label: "Modulo Logistico", hasSubmenu: false },
    { icon: Route, label: "Flujo Logístico", hasSubmenu: false },
    { icon: BarChart3, label: "KPI", hasSubmenu: false },
    { icon: CheckSquare, label: "Calidad", hasSubmenu: false },
    { icon: Trophy, label: "Desafío Técnico", hasSubmenu: false },
    { icon: CalendarDays, label: "Turnos", hasSubmenu: false },
    // { icon: CheckSquare, label: "Tasks", badge: "12 remaining tasks", hasSubmenu: false },
    // { icon: User, label: "Profile", hasSubmenu: false },
    { icon: Bell, label: "Notifications", hasSubmenu: false },
    { icon: Settings, label: "Configuración", hasSubmenu: false },
  ];

  return (
    <div className="flex bg-[#F1F5F9] dark:bg-[#0f172a] overflow-hidden" style={{
      width: '111.111111vw',
      height: '111.111111vh',
      transform: 'scale(0.9)',
      transformOrigin: 'top left',
      position: 'fixed'
    }}>

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-56" : "w-0 md:w-20"
          } bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20`}
      >
        {/* Logo Area */}
        <div className="h-14 flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
          </div>
          <span className={`font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap ${!isSidebarOpen && "hidden md:hidden"}`}>
            TELQWAY <span className="font-normal text-slate-500 text-xs ml-1">operaciones</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {menuItems.filter(item => {
              // If permissions haven't loaded yet, show all items
              if (!allowedItems) return true;
              // If permissions array is empty (no config for this profile), show all items
              if (allowedItems.length === 0) return true;
              // Otherwise, only show items that are in the allowedItems array
              return allowedItems.includes(item.label);
            }).map((item, index) => (
              <div key={index} className="group">
                <button onClick={() => handleNavigation(item.label)} className="w-full flex items-center px-3 py-2 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <item.icon size={20} className="shrink-0" />
                  <div className={`ml-4 flex-1 flex flex-col items-start ${!isSidebarOpen && "hidden md:hidden"}`}>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && <span className="text-[10px] text-slate-400">{item.badge}</span>}
                  </div>
                  {(item as any).badgeCount && (
                    <span className={`ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ${!isSidebarOpen && "hidden md:hidden"}`}>
                      {(item as any).badgeCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight size={16} className={`ml-auto text-slate-400 ${!isSidebarOpen && "hidden md:hidden"}`} />
                  )}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-slate-800 dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`ml-4 font-medium text-sm ${!isSidebarOpen && "hidden md:hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 lg:px-6 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-slate-800 dark:text-white hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-slate-800 dark:text-white hover:text-slate-600 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1e293b]" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center justify-between">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-normal text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                      >
                        <CheckSquare size={14} />
                        Marcar todo como leído
                      </button>
                    )}
                  </SheetTitle>
                  <SheetDescription>
                    Mantente al día con las últimas actividades del equipo.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-3">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        No tienes notificaciones
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-4">
                      {notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={`
                            relative p-4 rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50
                            ${!notification.isRead
                              ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                            }
                          `}
                        >
                          <div className="flex gap-3">
                            <div className={`
                              mt-1 w-2 h-2 rounded-full shrink-0
                              ${notification.priority === 'error' ? 'bg-red-500' :
                                notification.priority === 'warning' ? 'bg-amber-500' :
                                  notification.priority === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}
                            `} />

                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                                  {notification.title}
                                </h5>
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    title="Marcar como leída"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                {notification.content}
                              </p>
                              <div className="flex flex-col gap-0.5 pt-1">
                                {notification.createdByName && (
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {notification.createdByName}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">
                                  {format(new Date(notification.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <button
              ref={quickNoteButtonRef}
              onClick={() => setIsQuickNoteOpen(!isQuickNoteOpen)}
              className={`p-2 rounded-md transition-colors ${isQuickNoteOpen
                ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                : "text-slate-800 dark:text-white hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              title="Nueva nota rápida"
            >
              <PenLine size={20} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-800 dark:text-white hover:text-slate-600 transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-800 dark:text-white hover:text-slate-600 transition-colors"
              title="Alternar modo oscuro"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                {user?.nombre || "Usuario"}
              </span>
            </div>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="relative overflow-hidden bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-6 py-2 flex items-center gap-4 group transition-all duration-300">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent animate-pulse pointer-events-none" />

          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-amber-100 dark:bg-amber-900/60 rounded-lg shadow-sm border border-amber-200/50 dark:border-amber-700/50 transition-transform group-hover:scale-105 duration-300">
            <AlertCircle className="text-amber-600 dark:text-amber-400" size={18} />
          </div>

          <div className="flex flex-col gap-1 z-10 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-amber-900 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                Aviso Importante
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-amber-800 dark:text-amber-200 text-[13px] font-bold leading-snug">
              El modulo de logistica para el perfil técnico se encuentra deshabilitado de forma temporal , se trabaja con alta prioridad para reestablecer las funciones principales
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] dark:bg-[#0f172a] p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Quick Note Dropdown */}
      <QuickNoteDropdown
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        anchorRef={quickNoteButtonRef}
      />
    </div>
  );
}
