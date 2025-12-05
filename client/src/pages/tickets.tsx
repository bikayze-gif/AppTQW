
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Search, X } from "lucide-react";

const mockDataTab1 = [
  { id: 1, columna1: "Dato 1-1", columna2: "Dato 1-2", columna3: "Dato 1-3", columna4: "Dato 1-4" },
  { id: 2, columna1: "Dato 2-1", columna2: "Dato 2-2", columna3: "Dato 2-3", columna4: "Dato 2-4" },
  { id: 3, columna1: "Dato 3-1", columna2: "Dato 3-2", columna3: "Dato 3-3", columna4: "Dato 3-4" },
  { id: 4, columna1: "Dato 4-1", columna2: "Dato 4-2", columna3: "Dato 4-3", columna4: "Dato 4-4" },
  { id: 5, columna1: "Dato 5-1", columna2: "Dato 5-2", columna3: "Dato 5-3", columna4: "Dato 5-4" },
];

const mockDataTab2 = [
  { id: 1, columna1: "Info A-1", columna2: "Info A-2", columna3: "Info A-3", columna4: "Info A-4" },
  { id: 2, columna1: "Info B-1", columna2: "Info B-2", columna3: "Info B-3", columna4: "Info B-4" },
  { id: 3, columna1: "Info C-1", columna2: "Info C-2", columna3: "Info C-3", columna4: "Info C-4" },
  { id: 4, columna1: "Info D-1", columna2: "Info D-2", columna3: "Info D-3", columna4: "Info D-4" },
];

const mockDataTab3 = [
  { id: 1, columna1: "Reg X-1", columna2: "Reg X-2", columna3: "Reg X-3", columna4: "Reg X-4" },
  { id: 2, columna1: "Reg Y-1", columna2: "Reg Y-2", columna3: "Reg Y-3", columna4: "Reg Y-4" },
  { id: 3, columna1: "Reg Z-1", columna2: "Reg Z-2", columna3: "Reg Z-3", columna4: "Reg Z-4" },
];

interface Tab {
  id: string;
  label: string;
  data: any[];
  columns: string[];
}

const tabs: Tab[] = [
  {
    id: "tab1",
    label: "SOLICITUD MATERIAL",
    data: mockDataTab1,
    columns: ["columna1", "columna2", "columna3", "columna4"],
  },
  {
    id: "tab2",
    label: "REVISIÓN SOPORTE",
    data: mockDataTab2,
    columns: ["columna1", "columna2", "columna3", "columna4"],
  },
  {
    id: "tab3",
    label: "NOTIFICACIONES",
    data: mockDataTab3,
    columns: ["columna1", "columna2", "columna3", "columna4"],
  },
];

export default function Tickets() {
  const [activeTab, setActiveTab] = useState("tab1");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 pt-6 pb-4 flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">Tickets</h1>
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
                    <tr className="border-b-2 border-[#06b6d4]/50 bg-gradient-to-r from-[#06b6d4]/20 to-[#06b6d4]/10">
                      {activeTabData.columns.map((col) => (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          className="px-4 md:px-6 py-4 text-left font-semibold text-[#06b6d4] text-xs uppercase cursor-pointer hover:bg-white/10 transition-colors tracking-wide"
                          data-testid={`header-${col}`}
                        >
                          <div className="flex items-center gap-2">
                            {col.replace('columna', 'Columna ')}
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
                          return (
                            <td
                              key={`${row.id}-${col}`}
                              className="px-4 md:px-6 py-4 text-xs"
                              data-testid={`cell-${col}-${idx}`}
                            >
                              <span className="text-slate-200">{value}</span>
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
