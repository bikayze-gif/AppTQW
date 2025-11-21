import { Link, useLocation } from "wouter";
import { LayoutGrid, Activity, FileText, Ticket, Box, LogOut, Plus } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1F33] border-t border-white/5 px-4 pb-6 pt-2 z-50 rounded-t-3xl">
      <div className="flex items-end justify-between max-w-md mx-auto relative">
        
        {/* Left Group */}
        <div className="flex gap-6 items-center mb-2">
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <LayoutGrid size={24} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Activity size={24} />
          </button>
          <button className="text-[#06b6d4] p-2 relative">
            <FileText size={24} />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#06b6d4] rounded-full"></span>
          </button>
        </div>

        {/* Center FAB */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-12">
          <button className="bg-[#06b6d4] hover:bg-[#0891b2] text-black rounded-full p-4 shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Group */}
        <div className="flex gap-6 items-center mb-2">
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Ticket size={24} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <Box size={24} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2">
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
