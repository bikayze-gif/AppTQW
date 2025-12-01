import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { AddMenu } from "@/components/add-menu";
import { MaterialForm, type MaterialFormData } from "@/components/material-form";
import { AIChat } from "@/components/ai-chat";
import { ChatReporte } from "@/components/chat-reporte";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PeriodInfo from "@/pages/period-info";
import Analytics from "@/pages/analytics";
import Activity from "@/pages/activity";
import SupervisorHome from "@/pages/supervisor/home";
import SupervisorNotes from "@/pages/supervisor/notes";
import SupervisorMessenger from "@/pages/supervisor/messenger";
import ScrumBoard from "@/pages/scrumboard";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/supervisor" component={SupervisorNotes} />
      <Route path="/supervisor/home" component={SupervisorHome} />
      <Route path="/supervisor/messenger" component={SupervisorMessenger} />
      <Route path="/scrumboard" component={ScrumBoard} />
      <Route path="/" component={PeriodInfo} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/activity" component={Activity} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [currentPath] = useLocation();
  const isSupervisorRoute = currentPath.startsWith("/supervisor");
  
  // Don't show the technician layout components on login or supervisor pages
  if (currentPath === "/login" || isSupervisorRoute) {
    return <Router />;
  }

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isReportChatOpen, setIsReportChatOpen] = useState(false);

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
      {currentPath !== "/login" && (
        <BottomNav onAddClick={() => setIsAddMenuOpen(!isAddMenuOpen)} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
