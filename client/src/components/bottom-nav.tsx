import { LayoutGrid, Activity, FileText, Ticket, Box, LogOut, Plus, type LucideIcon } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface BottomNavProps {
  onAddClick?: () => void;
}

function NavButton({
  icon: Icon,
  label,
  href,
  isActive,
  iconSize = 18,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  iconSize?: number;
}) {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation(href)}
      className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all ${
        isActive
          ? "text-[#06b6d4]"
          : "text-slate-400 hover:text-white"
      }`}
    >
      <Icon size={iconSize} className={isActive ? "animate-bounce-subtle" : ""} />
      <span className="text-[9px] font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}


export function BottomNav({ onAddClick }: BottomNavProps) {
  const [currentPath] = useLocation();
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isPeriodInfo = currentPath === "/";
  const isCalidad = currentPath === "/calidad"; // Changed from isDashboard
  const isActivity = currentPath === "/activity";
  const isAnalytics = currentPath === "/analytics";
  const isTickets = currentPath === "/tickets";

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <div>
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-900/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="grid grid-cols-7 items-end gap-0.5 px-2 py-2.5 max-w-2xl mx-auto">
          <NavButton
            icon={LayoutGrid}
            label="Home"
            href="/"
            isActive={isPeriodInfo}
            iconSize={18}
          />
          <NavButton
            icon={Activity}
            label="Actividad"
            href="/activity"
            isActive={isActivity}
            iconSize={18}
          />
          <NavButton
            icon={Box}
            label="Calidad"
            href="/calidad"
            isActive={isCalidad}
            iconSize={18}
          />
          
          {/* Botón + Central */}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-12 h-12 -mt-4 mx-auto rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] shadow-lg shadow-[#06b6d4]/50 hover:shadow-xl hover:shadow-[#06b6d4]/60 transition-all hover:scale-110 active:scale-95"
            data-testid="button-add-menu"
          >
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </button>
          
          <NavButton
            icon={Ticket}
            label="Tickets"
            href="/tickets"
            isActive={isTickets}
            iconSize={18}
          />
          <NavButton
            icon={FileText}
            label="Analytics"
            href="/analytics"
            isActive={isAnalytics}
            iconSize={18}
          />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all text-slate-400 hover:text-white"
            data-testid="button-nav-logout"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-medium">Salir</span>
          </button>
        </div>
      </nav>

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
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    data-testid="button-cancel-logout"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
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