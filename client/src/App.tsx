import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { AddMenu } from "@/components/add-menu";
import { MaterialForm, type MaterialFormData } from "@/components/material-form";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PeriodInfo from "@/pages/period-info";
import Analytics from "@/pages/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/period-info" component={PeriodInfo} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);

  const handleMaterialSubmit = (data: MaterialFormData) => {
    console.log("Material request submitted:", data);
    setIsMaterialFormOpen(false);
  };

  const handleReportClick = () => {
    console.log("Nuevo reporte clicked");
  };

  const handleSettingsClick = () => {
    console.log("Configuración clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <Router />
      <AddMenu
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onMaterialClick={() => setIsMaterialFormOpen(true)}
        onReportClick={handleReportClick}
        onSettingsClick={handleSettingsClick}
      />
      <MaterialForm
        isOpen={isMaterialFormOpen}
        onClose={() => setIsMaterialFormOpen(false)}
        onSubmit={handleMaterialSubmit}
      />
      <BottomNav onAddClick={() => setIsAddMenuOpen(!isAddMenuOpen)} />
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
