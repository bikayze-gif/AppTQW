import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar, MessageSquare, Users, ShoppingCart, Folder,
  HelpCircle, Mail, FileText, Trello, CheckSquare,
  User, Bell, Settings, Menu, ChevronRight,
  LogOut, NotebookPen, BarChart3, Receipt, Sun, Moon,
  AlertCircle, CheckCircle2, Package, Briefcase, Truck
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
  const { user } = useAuth();
  const profile = user?.perfil || "user";

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
    { icon: BarChart3, label: "KPI", hasSubmenu: false },
    { icon: CheckSquare, label: "Calidad", hasSubmenu: false },
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
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                  <Bell size={20} />
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center justify-between">
                    Notificaciones
                  </SheetTitle>
                  <SheetDescription>
                    Mantente al día con las últimas actividades del equipo.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-3">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No tienes notificaciones nuevas
                    </p>
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

            <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {user?.nombre || "Usuario"}
              </span>
            </div>
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
