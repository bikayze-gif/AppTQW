import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar, MessageSquare, Users, ShoppingCart, Folder,
  HelpCircle, Mail, FileText, Trello, CheckSquare,
  User, Bell, Settings, Menu, ChevronRight, Search,
  LogOut, NotebookPen, BarChart3, Receipt, Sun, Moon,
  AlertCircle, CheckCircle2, Package
} from "lucide-react";
import { useTheme } from "next-themes";
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

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (label: string) => {
    if (label === "Notes") {
      setLocation("/supervisor");
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
    { icon: BarChart3, label: "KPI", hasSubmenu: false },
    { icon: CheckSquare, label: "Calidad", hasSubmenu: false },
    // { icon: CheckSquare, label: "Tasks", badge: "12 remaining tasks", hasSubmenu: false },
    // { icon: User, label: "Profile", hasSubmenu: false },
    { icon: Bell, label: "Notifications", hasSubmenu: false },
    // { icon: Settings, label: "Settings", hasSubmenu: false },
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
            {menuItems.map((item, index) => (
              <div key={index} className="group">
                <button onClick={() => handleNavigation(item.label)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
            className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
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
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="ml-4 hidden md:flex items-center relative">
              <Search size={18} className="text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Mail size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center justify-between">
                    Notificaciones
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                      3 Nuevas
                    </Badge>
                  </SheetTitle>
                  <SheetDescription>
                    Mantente al día con las últimas actividades del equipo.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-4 pr-4">
                    {[
                      {
                        title: "Nuevo Reporte de Calidad",
                        description: "Se ha generado el reporte mensual de calidad para la zona Sur.",
                        time: "Hace 5 minutos",
                        type: "info",
                        icon: FileText
                      },
                      {
                        title: "Alerta de Productividad",
                        description: "El técnico Juan Pérez ha superado el tiempo límite en una actividad.",
                        time: "Hace 20 minutos",
                        type: "warning",
                        icon: AlertCircle
                      },
                      {
                        title: "Tarea Completada",
                        description: "La revisión de facturación de diciembre ha concluido.",
                        time: "Hace 1 hora",
                        type: "success",
                        icon: CheckCircle2
                      },
                      {
                        title: "Nuevo Mensaje",
                        description: "Tienes un mensaje pendiente de la administración.",
                        time: "Hace 3 horas",
                        type: "info",
                        icon: MessageSquare
                      }
                    ].map((notification, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${notification.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500' :
                          notification.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500'
                          }`}>
                          <notification.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notification.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {notification.description}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-2 block font-medium uppercase tracking-wider">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Alternar modo oscuro"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                    <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">Nicolas Cornejo</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] dark:bg-[#0f172a] p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
