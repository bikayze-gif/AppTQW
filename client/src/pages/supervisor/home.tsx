import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { 
  MoreVertical, CheckCircle2, AlertCircle, Clock, 
  FileText, TrendingUp, Calendar, Bell, Settings
} from "lucide-react";

export default function SupervisorHome() {
  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span>Dashboards</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Project</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-4 border-white dark:border-slate-800 shadow-sm">
                <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back, Abbott Keitch!</h1>
                <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                  <span className="flex items-center gap-1"><Bell size={14} /> You have 2 new messages</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={14} /> 15 new tasks</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <FileText size={16} /> Messages
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
          <button className="px-4 py-2 bg-white dark:bg-[#1e293b] text-blue-600 border-b-2 border-blue-600 font-medium text-sm rounded-t-lg">Home</button>
          <button className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm">Budget</button>
          <button className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm">Team</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Due Tasks */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <button className="flex items-center gap-1 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                Today <MoreVertical size={14} />
              </button>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-slate-800 dark:text-white mb-1">25</h3>
              <p className="text-slate-500 font-medium">Due Tasks</p>
              <p className="text-slate-400 text-xs mt-4">Completed: 7</p>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Overdue</span>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-slate-800 dark:text-white mb-1">4</h3>
              <p className="text-slate-500 font-medium">Tasks</p>
              <p className="text-red-400 text-xs mt-4">Yesterday's overdue: 2</p>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Issues</span>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-slate-800 dark:text-white mb-1">32</h3>
              <p className="text-slate-500 font-medium">Open</p>
              <p className="text-slate-400 text-xs mt-4">Closed today: 0</p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-sm font-medium">Features</span>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-slate-800 dark:text-white mb-1">42</h3>
              <p className="text-slate-500 font-medium">Proposals</p>
              <p className="text-slate-400 text-xs mt-4">Implemented: 8</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Github Issues Summary</h2>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button className="px-3 py-1 text-sm font-medium bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white shadow-sm rounded-md">This Week</button>
              <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700">Last Week</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-sm text-slate-500 mb-4">New vs. Closed</p>
              {/* Placeholder for Chart */}
              <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-end justify-between px-4 pb-4 pt-8 gap-2">
                {[40, 30, 60, 45, 70, 35, 50].map((h, i) => (
                   <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-sm relative group">
                     <div 
                       className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600"
                       style={{ height: `${h}%` }}
                     ></div>
                   </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-2">Overview</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl flex flex-col items-center justify-center h-40">
                  <span className="text-4xl font-bold text-blue-600">214</span>
                  <span className="text-slate-500 text-sm">New Issues</span>
                </div>
              </div>
              <div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl flex flex-col items-center justify-center h-40">
                  <span className="text-4xl font-bold text-green-600">75</span>
                  <span className="text-slate-500 text-sm">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}