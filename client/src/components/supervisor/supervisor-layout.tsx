import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Calendar, MessageSquare, Users, ShoppingCart, Folder, 
  HelpCircle, Mail, FileText, Trello, CheckSquare, 
  User, Bell, Settings, Menu, ChevronRight, Search,
  LogOut, NotebookPen
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

export function SupervisorLayout({ children }: SupervisorLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    setLocation("/login");
  };

  const handleNavigation = (label: string) => {
    if (label === "Notes") {
      setLocation("/supervisor");
    } else if (label === "Messenger") {
      setLocation("/supervisor/messenger");
    }
  };

  const menuItems = [
    { icon: Calendar, label: "Calendar", badge: "3 upcoming events" },
    { icon: MessageSquare, label: "Messenger" },
    { icon: Users, label: "Contacts" },
    { icon: ShoppingCart, label: "E-Commerce", hasSubmenu: true },
    { icon: Folder, label: "File Manager" },
    { icon: HelpCircle, label: "Help Center", hasSubmenu: true },
    { icon: Mail, label: "Mail", badgeCount: 27 },
    { icon: NotebookPen, label: "Notes" },
    { icon: Trello, label: "Scrumboard" },
    { icon: CheckSquare, label: "Tasks", badge: "12 remaining tasks" },
    { icon: User, label: "Profile" },
    { icon: Bell, label: "Notifications" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] dark:bg-[#0f172a] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-72" : "w-0 md:w-20"
        } bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
          </div>
          <span className={`font-bold text-xl text-slate-800 dark:text-white whitespace-nowrap ${!isSidebarOpen && "hidden md:hidden"}`}>
            FUSE <span className="font-normal text-slate-500 text-sm ml-1">React</span>
          </span>
        </div>

        {/* User Profile Summary */}
        <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 mb-3">
            <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" />
          </div>
          <h3 className={`font-semibold text-slate-800 dark:text-white ${!isSidebarOpen && "hidden"}`}>Abbott Keitch</h3>
          <p className={`text-xs text-slate-500 ${!isSidebarOpen && "hidden"}`}>admin@fusetheme.com</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index} className="group">
                <button onClick={() => handleNavigation(item.label)} className="w-full flex items-center px-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <item.icon size={20} className="shrink-0" />
                  <div className={`ml-4 flex-1 flex flex-col items-start ${!isSidebarOpen && "hidden md:hidden"}`}>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && <span className="text-[10px] text-slate-400">{item.badge}</span>}
                  </div>
                  {item.badgeCount && (
                    <span className={`ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ${!isSidebarOpen && "hidden md:hidden"}`}>
                      {item.badgeCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight size={16} className={`ml-auto text-slate-400 ${!isSidebarOpen && "hidden md:hidden"}`} />
                  )}
                </button>
              </div>
            ))}
          </nav>
        </div>
        
        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`ml-4 font-medium text-sm ${!isSidebarOpen && "hidden md:hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <Menu size={20} />
            </button>
            
            {/* Search */}
            <div className="ml-4 hidden md:flex items-center relative">
              <Search size={18} className="text-slate-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Mail size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                    <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">Abbott Keitch</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] dark:bg-[#0f172a] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}