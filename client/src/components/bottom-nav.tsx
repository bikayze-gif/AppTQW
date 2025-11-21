import { LayoutGrid, Activity, FileText, Ticket, Box, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const [currentPath] = useLocation();
  const [, setLocation] = useLocation();

  const isDashboard = currentPath === "/";
  const isPeriodInfo = currentPath === "/period-info";

  // Colores dinámicos según la página
  const accentColor = isDashboard ? "#06b6d4" : isPeriodInfo ? "#10b981" : "#06b6d4";
  const accentColorHover = isDashboard ? "#0891b2" : isPeriodInfo ? "#059669" : "#0891b2";
  const accentShadow = isDashboard ? "shadow-cyan-500/30" : isPeriodInfo ? "shadow-emerald-500/30" : "shadow-cyan-500/30";
  const borderColor = isDashboard ? "border-cyan-500/20" : isPeriodInfo ? "border-emerald-500/20" : "border-cyan-500/20";
  const bgHover = isDashboard ? "hover:bg-cyan-500/10" : isPeriodInfo ? "hover:bg-emerald-500/10" : "hover:bg-cyan-500/10";

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#1A1F33] border-t border-white/5 px-4 pb-4 pt-3 z-40 transition-colors duration-300`}>
      <div className="flex items-center justify-around max-w-4xl mx-auto">
        
        {/* Left Group - 2.5 icons */}
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setLocation("/period-info")}
            className={`text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 ${isPeriodInfo ? "text-white" : ""}`}
            data-testid="button-nav-grid"
          >
            <LayoutGrid size={22} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-activity">
            <Activity size={22} />
          </button>
          <button 
            onClick={() => setLocation("/")}
            className={`p-2 rounded-lg relative hover:bg-white/5 transition-colors`}
            style={{ color: isDashboard ? accentColor : "#94a3b8" }}
            data-testid="button-nav-file"
          >
            <FileText size={22} />
            {isDashboard && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }}></span>
            )}
          </button>
        </div>

        {/* Center FAB - Integrated */}
        <button 
          onClick={onAddClick}
          className={`text-black rounded-full p-3 shadow-lg transition-all active:scale-95 flex-shrink-0 flex items-center justify-center ${accentShadow}`}
          style={{ 
            backgroundColor: accentColor,
            borderColor: `${accentColor}40`
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentColorHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
          data-testid="button-add-material"
        >
          <Plus size={26} strokeWidth={3} />
        </button>

        {/* Right Group - 2.5 icons */}
        <div className="flex gap-3 items-center">
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-ticket">
            <Ticket size={22} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-box">
            <Box size={22} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-logout">
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
