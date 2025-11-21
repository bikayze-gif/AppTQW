import { useState, useMemo } from "react";
import { ChevronLeft, Search, X, ArrowUp, ArrowDown } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const mockData1 = [
  { id: 1, nombre: "Técnico A", estado: "Activo", valor: "95%", fecha: "2025-01-15" },
  { id: 2, nombre: "Técnico B", estado: "Pendiente", valor: "78%", fecha: "2025-01-14" },
  { id: 3, nombre: "Técnico C", estado: "Activo", valor: "100%", fecha: "2025-01-13" },
  { id: 4, nombre: "Técnico D", estado: "Inactivo", valor: "45%", fecha: "2025-01-12" },
  { id: 5, nombre: "Técnico E", estado: "Activo", valor: "88%", fecha: "2025-01-11" },
];

const mockData2 = [
  { id: 1, proyecto: "Proyecto A", progreso: "85%", responsable: "Juan", fecha: "2025-01-15" },
  { id: 2, proyecto: "Proyecto B", progreso: "60%", responsable: "María", fecha: "2025-01-14" },
  { id: 3, proyecto: "Proyecto C", progreso: "100%", responsable: "Carlos", fecha: "2025-01-13" },
  { id: 4, proyecto: "Proyecto D", progreso: "40%", responsable: "Ana", fecha: "2025-01-12" },
  { id: 5, proyecto: "Proyecto E", progreso: "75%", responsable: "Pedro", fecha: "2025-01-11" },
];

const mockData3 = [
  { id: 1, servicio: "Servicio 1", clientes: "250", ingresos: "$12,500", estado: "Activo" },
  { id: 2, servicio: "Servicio 2", clientes: "180", ingresos: "$9,000", estado: "Activo" },
  { id: 3, servicio: "Servicio 3", clientes: "95", ingresos: "$4,750", estado: "Pausado" },
  { id: 4, servicio: "Servicio 4", clientes: "320", ingresos: "$16,000", estado: "Activo" },
  { id: 5, servicio: "Servicio 5", clientes: "140", ingresos: "$7,000", estado: "Activo" },
];

const mockData4 = [
  { id: 1, tarea: "Tarea 1", asignado: "Equipo A", prioridad: "Alta", vencimiento: "2025-01-20" },
  { id: 2, tarea: "Tarea 2", asignado: "Equipo B", prioridad: "Media", vencimiento: "2025-01-25" },
  { id: 3, tarea: "Tarea 3", asignado: "Equipo A", prioridad: "Baja", vencimiento: "2025-02-01" },
  { id: 4, tarea: "Tarea 4", asignado: "Equipo C", prioridad: "Alta", vencimiento: "2025-01-18" },
  { id: 5, tarea: "Tarea 5", asignado: "Equipo B", prioridad: "Media", vencimiento: "2025-01-30" },
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

interface Tab {
  id: string;
  label: string;
  data: any[];
  columns: string[];
}

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
    columns: ["proyecto", "progreso", "responsable", "fecha"],
  },
  {
    id: "directa",
    label: "DIRECTA",
    data: mockData3,
    columns: ["servicio", "clientes", "ingresos", "estado"],
  },
  {
    id: "reversa",
    label: "REVERSA",
    data: mockData4,
    columns: ["tarea", "asignado", "prioridad", "vencimiento"],
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back-to-dashboard"
        >
          <ChevronLeft size={24} className="text-slate-400" />
        </button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Análitica</h1>
        <div className="w-6" />
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      {activeTabData.columns.map((col) => (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          className="px-4 md:px-6 py-4 text-left font-semibold text-slate-300 text-xs md:text-sm capitalize cursor-pointer hover:bg-white/10 transition-colors"
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
                              className="px-4 md:px-6 py-4 text-xs md:text-sm"
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
