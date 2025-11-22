import { LayoutGrid, Activity, FileText, Ticket, Box, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const [currentPath] = useLocation();
  const [, setLocation] = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isPeriodInfo = currentPath === "/";
  const isDashboard = currentPath === "/dashboard";
  const isActivity = currentPath === "/activity";
  const isAnalytics = currentPath === "/analytics";

  const handleLogout = () => {
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1F33] border-t border-white/5 px-4 pb-4 pt-3 z-40">
      <div className="flex items-center justify-center max-w-full mx-auto">
        
        {/* Left Group - 3 icons */}
        <div className="flex gap-4 items-center md:gap-6 lg:gap-8">
          <button 
            onClick={() => setLocation("/")}
            className={`p-2 rounded-lg relative hover:bg-white/5 transition-colors ${isPeriodInfo ? "text-[#06b6d4]" : "text-slate-400 hover:text-white"}`}
            data-testid="button-nav-grid"
          >
            <LayoutGrid size={22} />
          </button>
          <button 
            onClick={() => setLocation("/activity")}
            className={`p-2 rounded-lg relative hover:bg-white/5 transition-colors ${isActivity ? "text-[#06b6d4]" : "text-slate-400 hover:text-white"}`}
            data-testid="button-nav-activity"
          >
            <Activity size={22} />
          </button>
          <button 
            onClick={() => setLocation("/dashboard")}
            className={`p-2 rounded-lg relative hover:bg-white/5 transition-colors ${isDashboard ? "text-[#06b6d4]" : "text-slate-400 hover:text-white"}`}
            data-testid="button-nav-file"
          >
            <FileText size={22} />
          </button>
        </div>

        {/* Center FAB - Integrated */}
        <button 
          onClick={onAddClick}
          className="bg-[#06b6d4] hover:bg-[#0891b2] text-black rounded-full p-3 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 lg:mx-10"
          data-testid="button-add-material"
        >
          <Plus size={26} strokeWidth={3} />
        </button>

        {/* Right Group - 3 icons */}
        <div className="flex gap-4 items-center md:gap-6 lg:gap-8">
          <button 
            onClick={() => setLocation("/analytics")}
            className={`p-2 rounded-lg relative hover:bg-white/5 transition-colors ${isAnalytics ? "text-[#06b6d4]" : "text-slate-400 hover:text-white"}`}
            data-testid="button-nav-ticket"
          >
            <Ticket size={22} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-box">
            <Box size={22} />
          </button>
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" 
            data-testid="button-nav-logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              data-testid="logout-modal-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="bg-card border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full" data-testid="logout-modal">
                <h2 className="text-xl font-bold text-white mb-2">Cerrar Sesión</h2>
                <p className="text-slate-300 text-sm mb-6">¿Estás seguro de que deseas cerrar sesión?</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    data-testid="button-cancel-logout"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    data-testid="button-confirm-logout"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
