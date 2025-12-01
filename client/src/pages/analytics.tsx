import { useState, useMemo } from "react";
import { ChevronLeft, Search, X, ArrowUp, ArrowDown, Clock, Check, Trash2, MoreVertical, History, CheckSquare, Send } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockData1 = [
  { id: 1, nombre: "Técnico A", estado: "Activo", valor: "95%", fecha: "2025-01-15" },
  { id: 2, nombre: "Técnico B", estado: "Pendiente", valor: "78%", fecha: "2025-01-14" },
  { id: 3, nombre: "Técnico C", estado: "Activo", valor: "100%", fecha: "2025-01-13" },
  { id: 4, nombre: "Técnico D", estado: "Inactivo", valor: "45%", fecha: "2025-01-12" },
  { id: 5, nombre: "Técnico E", estado: "Activo", valor: "88%", fecha: "2025-01-11" },
];

const mockData2 = [
  { id: 1, serie: "E77BZG252914571", estado: "PENDIENTE POR" },
  { id: 2, serie: "E77BZG252921412", estado: "PENDIENTE POR" },
  { id: 3, serie: "ZTFGDA1513B7", estado: "PENDIENTE POR" },
  { id: 4, serie: "ZTFGDA151378", estado: "PENDIENTE POR" },
  { id: 5, serie: "E77BZG252914999", estado: "PENDIENTE POR" },
];

const mockData3 = [
  { id: 1, serie: "DT-001-2025", estado: "PENDIENTE POR" },
  { id: 2, serie: "DT-002-2025", estado: "PENDIENTE POR" },
  { id: 3, serie: "DT-003-2025", estado: "PENDIENTE POR" },
  { id: 4, serie: "DT-004-2025", estado: "PENDIENTE POR" },
  { id: 5, serie: "DT-005-2025", estado: "PENDIENTE POR" },
];

const mockData4 = [
  { id: 1, serie: "RV-001-2025", estado: "PENDIENTE POR" },
  { id: 2, serie: "RV-002-2025", estado: "PENDIENTE POR" },
  { id: 3, serie: "RV-003-2025", estado: "PENDIENTE POR" },
  { id: 4, serie: "RV-004-2025", estado: "PENDIENTE POR" },
  { id: 5, serie: "RV-005-2025", estado: "PENDIENTE POR" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Activo":
    case "Alta":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "Pendiente":
    case "Media":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Inactivo":
    case "Baja":
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    case "Pausado":
      return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
};

interface TableAction {
  label: string;
  icon: any;
  color: string;
}

interface Tab {
  id: string;
  label: string;
  data: any[];
  columns: string[];
  isSpecialFormat?: boolean;
  actions?: TableAction[];
}

const tableActions: Record<string, TableAction[]> = {
  recepcion: [
    { label: "Pendiente", icon: Clock, color: "yellow-400" },
    { label: "Completado", icon: Check, color: "green-400" },
    { label: "Eliminar", icon: Trash2, color: "red-400" }
  ],
  directa: [
    { label: "Historial", icon: History, color: "blue-400" },
    { label: "Declarar", icon: CheckSquare, color: "green-400" },
    { label: "Transferir", icon: Send, color: "purple-400" }
  ],
  reversa: [
    { label: "Revisar", icon: Check, color: "green-400" },
    { label: "Rechazar", icon: X, color: "red-400" },
    { label: "Enviar", icon: Send, color: "blue-400" }
  ]
};

const tabs: Tab[] = [
  {
    id: "faltante",
    label: "FALTANTE",
    data: mockData1,
    columns: ["nombre", "estado", "valor", "fecha"],
  },
  {
    id: "recepcion",
    label: "RECEPCIÓN",
    data: mockData2,
    columns: ["serie", "estado"],
    isSpecialFormat: true,
    actions: tableActions.recepcion,
  },
  {
    id: "directa",
    label: "DIRECTA",
    data: mockData3,
    columns: ["serie", "estado"],
    isSpecialFormat: true,
    actions: tableActions.directa,
  },
  {
    id: "reversa",
    label: "REVERSA",
    data: mockData4,
    columns: ["serie", "estado"],
    isSpecialFormat: true,
    actions: tableActions.reversa,
  },
];

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("faltante");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const filteredAndSortedData = useMemo(() => {
    if (!activeTabData) return [];
    
    let data = [...activeTabData.data];
    
    // Filter
    if (searchText) {
      data = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    // Sort
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = String(a[sortColumn as keyof typeof a]);
        const bVal = String(b[sortColumn as keyof typeof b]);
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }
    
    return data;
  }, [activeTabData, searchText, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const shouldHighlight = (value: string) => {
    return (
      value.includes("%") ||
      ["Activo", "Pendiente", "Inactivo", "Pausado", "Alta", "Media", "Baja"].includes(value)
    );
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Análitica</h1>
      </header>

      <main className="px-4 md:px-6 space-y-4 max-w-6xl mx-auto pt-4">
        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#06b6d4]/20 text-[#06b6d4] border-b-2 border-[#06b6d4]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        {activeTabData && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar en tabla..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
              data-testid="search-input"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                data-testid="clear-search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {activeTabData && (
          <Card className="bg-card border-none shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {activeTabData.isSpecialFormat ? (
                // Special format for RECEPCIÓN, DIRECTA, REVERSA
                <div>
                  {/* Column Headers */}
                  <div className="bg-gradient-to-r from-[#06b6d4]/20 to-[#06b6d4]/10 border-b-2 border-[#06b6d4]/50 px-4 md:px-6 py-4 grid grid-cols-12 gap-4 items-center">
                    <button
                      onClick={() => handleSort("serie")}
                      className="col-span-6 text-left hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer"
                      data-testid="header-serie"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#06b6d4] uppercase tracking-wide">SERIE</p>
                        {sortColumn === "serie" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-white" />
                            ) : (
                              <ArrowDown size={12} className="text-white" />
                            )}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleSort("estado")}
                      className="col-span-3 text-left hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer"
                      data-testid="header-estado"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#06b6d4] uppercase tracking-wide">ESTADO</p>
                        {sortColumn === "estado" && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUp size={12} className="text-white" />
                            ) : (
                              <ArrowDown size={12} className="text-white" />
                            )}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="col-span-3">
                      <p className="text-xs font-bold text-[#06b6d4] uppercase text-center tracking-wide">ACCIONES</p>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-white/5">
                    {filteredAndSortedData.map((row, idx) => (
                      <div
                        key={row.id}
                        className="px-4 md:px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors"
                        data-testid={`row-${activeTab}-${idx}`}
                      >
                        <div className="col-span-6 overflow-hidden">
                          <span className="text-slate-200 text-xs whitespace-nowrap overflow-ellipsis">{row.serie}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-yellow-500 text-black" style={{fontSize: '0.65rem'}}>
                            {row.estado}
                          </span>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-2 border border-slate-500 rounded text-slate-300 hover:bg-white/10 hover:border-white/50 transition-colors"
                                data-testid={`action-menu-${idx}`}
                              >
                                <MoreVertical size={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {activeTabData?.actions?.map((action, actionIdx) => {
                                const ActionIcon = action.icon;
                                const colorClass = action.color === "red-400" ? "text-red-400" : 
                                                   action.color === "green-400" ? "text-green-400" :
                                                   action.color === "blue-400" ? "text-blue-400" :
                                                   action.color === "yellow-400" ? "text-yellow-400" :
                                                   action.color === "purple-400" ? "text-purple-400" : "text-slate-300";
                                const itemColorClass = action.color === "red-400" ? "text-red-400" : "";
                                return (
                                  <DropdownMenuItem
                                    key={actionIdx}
                                    className={`flex items-center gap-2 cursor-pointer ${itemColorClass}`}
                                    data-testid={`action-${action.label.toLowerCase()}-${idx}`}
                                  >
                                    <ActionIcon size={16} className={colorClass} />
                                    <span>{action.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Standard table format for FALTANTE
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#06b6d4]/50 bg-gradient-to-r from-[#06b6d4]/20 to-[#06b6d4]/10">
                        {activeTabData.columns.map((col) => (
                          <th
                            key={col}
                            onClick={() => handleSort(col)}
                            className="px-4 md:px-6 py-4 text-left font-semibold text-[#06b6d4] text-xs uppercase cursor-pointer hover:bg-white/10 transition-colors tracking-wide"
                            data-testid={`header-${col}`}
                          >
                            <div className="flex items-center gap-2">
                              {col}
                              {sortColumn === col && (
                                <span>
                                  {sortDirection === "asc" ? (
                                    <ArrowUp size={14} className="text-[#06b6d4]" />
                                  ) : (
                                    <ArrowDown size={14} className="text-[#06b6d4]" />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAndSortedData.map((row, idx) => (
                        <tr
                          key={row.id}
                          className="hover:bg-white/5 transition-colors"
                          data-testid={`row-${activeTab}-${idx}`}
                        >
                          {activeTabData.columns.map((col) => {
                            const value = row[col];
                            const isStatus = shouldHighlight(value);
                            return (
                              <td
                                key={`${row.id}-${col}`}
                                className="px-4 md:px-6 py-4 text-xs"
                                data-testid={`cell-${col}-${idx}`}
                              >
                                {isStatus && typeof value === "string" ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      value
                                    )}`}
                                  >
                                    {value}
                                  </span>
                                ) : (
                                  <span className="text-slate-200">{value}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
