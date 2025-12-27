import { useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
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
import SupervisorMessenger from "@/pages/supervisor/messenger";
import SupervisorScrumboard from "@/pages/supervisor/scrumboard";
import SupervisorMonitoring from "@/pages/supervisor/monitoring";
import SupervisorBilling from "@/pages/supervisor/billing";
import SupervisorKPI from "@/pages/supervisor/kpi";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Protected supervisor routes */}
      <Route path="/supervisor">
        <ProtectedRoute><SupervisorNotes /></ProtectedRoute>
      </Route>
      <Route path="/supervisor/home">
        <ProtectedRoute><SupervisorHome /></ProtectedRoute>
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

  const handleSettingsClick = () => {
    console.log("Configuración clicked");
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
    <div className="min-h-screen bg-background">
      <Router />
      <AddMenu
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onMaterialClick={handleMaterialClick}
        onReportClick={handleReportClick}
        onSettingsClick={handleSettingsClick}
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
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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