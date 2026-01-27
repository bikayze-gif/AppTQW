import { useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { AlertCircle } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { AddMenu } from "@/components/add-menu";
import { MaterialForm, type MaterialFormData } from "@/components/material-form";
import { AIChat } from "@/components/ai-chat";
import { ChatReporte } from "@/components/chat-reporte";
import { AuthProvider, ProtectedRoute, useAuth } from "@/lib/auth-context";
import { PermissionProtectedRoute } from "@/components/permission-protected-route";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import Calidad from "@/pages/calidad";
import PeriodInfo from "@/pages/period-info";
import Analytics from "@/pages/analytics";
import Activity from "@/pages/activity";
import Tickets from "@/pages/tickets";
import SupervisorHome from "@/pages/supervisor/home";
import SupervisorNotes from "@/pages/supervisor/notes";
import SupervisorLanding from "@/pages/supervisor/landing";
import SupervisorCalendar from "@/pages/supervisor/calendar";
import SupervisorMessenger from "@/pages/supervisor/messenger";
import SupervisorScrumboard from "@/pages/supervisor/scrumboard";
import SupervisorMonitoring from "@/pages/supervisor/monitoring";
import SupervisorBilling from "@/pages/supervisor/billing";
import SupervisorKPI from "@/pages/supervisor/kpi";
import SupervisorCalidad from "@/pages/supervisor/calidad";
import SupervisorLogistica from "@/pages/supervisor/logistica";
import SupervisorSME from "@/pages/supervisor/sme";
import SupervisorModuloLogistico from "@/pages/supervisor/modulo-logistico";
import SupervisorDesafioTecnico from "@/pages/supervisor/desafio-tecnico";
import ParametricoPuntaje from "@/pages/supervisor/settings/parametrico-puntaje";
import SidebarPermissions from "@/pages/supervisor/settings/permissions";
import NotificationsSettings from "@/pages/supervisor/settings/notifications";
import UserManagement from "@/pages/supervisor/settings/users";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Protected supervisor routes */}
      <Route path="/supervisor">
        <ProtectedRoute><SupervisorLanding /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/notes">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Notes">
            <SupervisorNotes />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/home">
        <ProtectedRoute><SupervisorHome /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/calendar">
        <ProtectedRoute><SupervisorCalendar /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/messenger">
        <ProtectedRoute><SupervisorMessenger /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/scrumboard">
        <ProtectedRoute><SupervisorScrumboard /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/monitoring">
        <ProtectedRoute><SupervisorMonitoring /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/billing">
        <ProtectedRoute><SupervisorBilling /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/kpi">
        <ProtectedRoute><SupervisorKPI /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/calidad">
        <ProtectedRoute><SupervisorCalidad /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/logistica">
        <ProtectedRoute><SupervisorLogistica /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/sme">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Formulario SME">
            <SupervisorSME />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/modulo-logistico">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Modulo Logistico">
            <SupervisorModuloLogistico />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/desafio-tecnico">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Desafío Técnico">
            <SupervisorDesafioTecnico />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/settings/parametros">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Configuración">
            <ParametricoPuntaje />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/settings/permissions">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Configuración">
            <SidebarPermissions />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/settings/notifications">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Notifications">
            <NotificationsSettings />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/supervisor/settings/users">
        <ProtectedRoute>
          <PermissionProtectedRoute requiredMenuItem="Configuración">
            <UserManagement />
          </PermissionProtectedRoute>
        </ProtectedRoute>
      </Route>

      {/* Protected technician routes */}
      <Route path="/">
        <ProtectedRoute><PeriodInfo /></ProtectedRoute>
      </Route>
      <Route path="/calidad">
        <ProtectedRoute><Calidad /></ProtectedRoute>
      </Route>
      <Route path="/activity">
        <ProtectedRoute><Activity /></ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute><Analytics /></ProtectedRoute>
      </Route>
      <Route path="/tickets">
        <ProtectedRoute><Tickets /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [currentPath] = useLocation();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isReportChatOpen, setIsReportChatOpen] = useState(false);

  const isSupervisorRoute = currentPath.startsWith("/supervisor");
  const isLoginPage = currentPath === "/login";
  const showTechnicianLayout = !isLoginPage && !isSupervisorRoute;

  const handleMaterialSubmit = (data: MaterialFormData) => {
    console.log("Material request submitted:", data);
    setIsMaterialFormOpen(false);
  };

  const handleReportClick = () => {
    setIsMaterialFormOpen(false);
    setIsAIChatOpen(false);
    setIsReportChatOpen(true);
  };


  const handleAIClick = () => {
    setIsMaterialFormOpen(false);
    setIsReportChatOpen(false);
    setIsAIChatOpen(true);
  };

  const handleMaterialClick = () => {
    setIsReportChatOpen(false);
    setIsAIChatOpen(false);
    setIsMaterialFormOpen(true);
  };

  if (!showTechnicianLayout) {
    return <Router />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Warning Banner para Perfil Técnico */}
      <div className="relative overflow-hidden bg-[#d97706] border-b border-amber-700 px-4 py-2 flex items-center gap-3 group transition-all duration-300 z-[60]">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse pointer-events-none" />

        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-white/20 rounded-lg shadow-sm border border-white/30 transition-transform group-hover:scale-105 duration-300">
          <AlertCircle className="text-white" size={16} />
        </div>

        <div className="flex flex-col gap-1 z-10 flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-[9px] uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded leading-none">
              Aviso Importante
            </span>
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          </div>
          <p className="text-white text-[11px] sm:text-xs font-bold leading-tight">
            El modulo de logistica para el perfil técnico se encuentra deshabilitado de forma temporal , se trabaja con alta prioridad para reestablecer las funciones principales
          </p>
        </div>
      </div>

      <div className="flex-1">
        <Router />
      </div>
      <AddMenu
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onMaterialClick={handleMaterialClick}
        onReportClick={handleReportClick}
        onAIClick={handleAIClick}
      />
      <MaterialForm
        isOpen={isMaterialFormOpen}
        onClose={() => setIsMaterialFormOpen(false)}
        onSubmit={handleMaterialSubmit}
      />
      <AIChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
      <ChatReporte
        isOpen={isReportChatOpen}
        onClose={() => setIsReportChatOpen(false)}
      />
      {currentPath !== "/login" && currentPath !== "/forgot-password" && <BottomNav onAddClick={() => setIsAddMenuOpen(!isAddMenuOpen)} />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppLayout />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;