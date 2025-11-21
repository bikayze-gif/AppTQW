import { LayoutGrid, Activity, FileText, Ticket, Box, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1F33] border-t border-white/5 px-4 pb-4 pt-3 z-40">
      <div className="flex items-center justify-around max-w-4xl mx-auto">
        
        {/* Left Group - 2.5 icons */}
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setLocation("/period-info")}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" 
            data-testid="button-nav-grid"
          >
            <LayoutGrid size={22} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" data-testid="button-nav-activity">
            <Activity size={22} />
          </button>
          <button className="text-[#06b6d4] p-2 rounded-lg relative hover:bg-white/5" data-testid="button-nav-file">
            <FileText size={22} />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#06b6d4] rounded-full"></span>
          </button>
        </div>

        {/* Center FAB - Integrated */}
        <button 
          onClick={onAddClick}
          className="bg-[#06b6d4] hover:bg-[#0891b2] text-black rounded-full p-3 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 flex-shrink-0 flex items-center justify-center"
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
