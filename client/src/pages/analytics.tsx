import { useState, useMemo } from "react";
import { ChevronLeft, Search, X, ArrowUp, ArrowDown, Clock, Check, Trash2, MoreVertical, History, CheckSquare, Send, ArrowLeft, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

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
    { label: "Historial", icon: History, color: "blue-400" },
    { label: "Declarar Entrega", icon: CheckSquare, color: "amber-400" },
    { label: "Derivar", icon: Send, color: "purple-400" }
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
  const [isDeclareOpen, setIsDeclareOpen] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<string>("");
  const [workOrder, setWorkOrder] = useState("");
  const [rutCliente, setRutCliente] = useState("");
  const [observations, setObservations] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSerie, setTransferSerie] = useState<string>("");
  const [escalamientoSupervisor, setEscalamientoSupervisor] = useState<string | null>(null);
  const [escalamientoBodega, setEscalamientoBodega] = useState<string | null>(null);
  const [transferTecnico, setTransferTecnico] = useState<string>("");
  const [transferFoto, setTransferFoto] = useState<string | null>(null);
  const [transferMotivo, setTransferMotivo] = useState<string>("");

  const [isDeclareDeliveryOpen, setIsDeclareDeliveryOpen] = useState(false);
  const [deliverySerie, setDeliverySerie] = useState<string>("");
  const [deliveryFoto, setDeliveryFoto] = useState<string | null>(null);

  const [isDeriveOpen, setIsDeriveOpen] = useState(false);
  const [deriveSerie, setDeriveSerie] = useState<string>("");
  const [deriveRut, setDeriveRut] = useState("");
  const [deriveWorkOrder, setDeriveWorkOrder] = useState("");
  const [deriveMotivo, setDeriveMotivo] = useState("");
  const [deriveSerieFisica, setDeriveSerieFisica] = useState("");
  const [deriveObservations, setDeriveObservations] = useState("");
  const [deriveFoto, setDeriveFoto] = useState<string | null>(null);

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

  const handleDeclareClick = (serie: string) => {
    setSelectedSerie(serie);
    setWorkOrder("");
    setRutCliente("");
    setObservations("");
    setSelectedFile(null);
    setIsDeclareOpen(true);
  };

  const handleDeclareSubmit = () => {
    if (workOrder.trim()) {
      console.log("Declarar instalada:", { selectedSerie, workOrder, rutCliente, observations, selectedFile });
      setIsDeclareOpen(false);
    }
  };

  const handleTransferClick = (serie: string) => {
    setTransferSerie(serie);
    setEscalamientoSupervisor(null);
    setEscalamientoBodega(null);
    setTransferTecnico("");
    setTransferFoto(null);
    setTransferMotivo("");
    setIsTransferOpen(true);
  };

  const handleTransferSubmit = () => {
    if (transferMotivo.trim()) {
      const escalamiento = escalamientoSupervisor || escalamientoBodega;
      console.log("Transferencia:", {
        transferSerie,
        escalamiento,
        transferTecnico: escalamientoSupervisor ? null : transferTecnico,
        transferFoto,
        transferMotivo
      });
      setIsTransferOpen(false);
    }
  };

  const handleDeclareDeliveryClick = (serie: string) => {
    setDeliverySerie(serie);
    setDeliveryFoto(null);
    setIsDeclareDeliveryOpen(true);
  };

  const handleDeclareDeliverySubmit = () => {
    if (deliveryFoto) {
      console.log("Declarar entregada:", { deliverySerie, deliveryFoto });
      setIsDeclareDeliveryOpen(false);
    }
  };

  const handleDeriveClick = (serie: string) => {
    setDeriveSerie(serie);
    setDeriveRut("");
    setDeriveWorkOrder("");
    setDeriveMotivo("");
    setDeriveSerieFisica("");
    setDeriveObservations("");
    setDeriveFoto(null);
    setIsDeriveOpen(true);
  };

  const handleDeriveSubmit = () => {
    if (deriveWorkOrder.trim() && deriveMotivo && deriveObservations.trim()) {
      console.log("Derivar:", {
        deriveSerie,
        deriveRut,
        deriveWorkOrder,
        deriveMotivo,
        deriveSerieFisica,
        deriveObservations,
        deriveFoto
      });
      setIsDeriveOpen(false);
    }
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
                                    onClick={() => {
                                      if (action.label === "Declarar" && activeTab === "directa") {
                                        handleDeclareClick(row.serie);
                                      }
                                      if (action.label === "Transferir" && activeTab === "directa") {
                                        handleTransferClick(row.serie);
                                      }
                                      if (action.label === "Declarar Entrega" && activeTab === "reversa") {
                                        handleDeclareDeliveryClick(row.serie);
                                      }
                                      if (action.label === "Derivar" && activeTab === "reversa") {
                                        handleDeriveClick(row.serie);
                                      }
                                    }}
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

      {/* Derive Dialog */}
      <Sheet open={isDeriveOpen} onOpenChange={setIsDeriveOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 bg-slate-900 border-l border-white/10">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center px-6">
            <SheetClose asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </SheetClose>
            <h2 className="text-lg font-semibold text-white ml-4">
              Validación supervisor en reversa
            </h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-6 space-y-6">
              {/* Serie Seleccionada */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SERIE SELECCIONADA
                </label>
                <input
                  type="text"
                  value={deriveSerie}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none cursor-not-allowed"
                  data-testid="input-derive-serie"
                />
              </div>

              {/* RUT */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  RUT
                </label>
                <input
                  type="text"
                  placeholder="Ej. 12345678-9"
                  value={deriveRut}
                  onChange={(e) => setDeriveRut(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  data-testid="input-derive-rut"
                />
              </div>

              {/* Orden de trabajo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  ORDEN DE TRABAJO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingrese la orden de trabajo"
                  value={deriveWorkOrder}
                  onChange={(e) => setDeriveWorkOrder(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  data-testid="input-derive-work-order"
                />
              </div>

              {/* Transferencia supervisor */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  TRANSFERENCIA SUPERVISOR
                </label>
                <input
                  type="text"
                  value="Se asignará automáticamente"
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-slate-400 focus:outline-none cursor-not-allowed"
                  data-testid="input-derive-supervisor"
                />
              </div>

              {/* Seleccionar motivo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SELECCIONAR MOTIVO <span className="text-red-500">*</span>
                </label>
                <select
                  value={deriveMotivo}
                  onChange={(e) => setDeriveMotivo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  data-testid="select-derive-motivo"
                >
                  <option value="">SELECCIONAR</option>
                  <option value="defecto">Equipo con defecto</option>
                  <option value="serie-incorrecta">Serie incorrecta</option>
                  <option value="no-funciona">No funciona</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Serie fisica retirada */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SERIE FISICA RETIRADA
                </label>
                <input
                  type="text"
                  placeholder="Ingrese la serie física retirada (opcional)"
                  value={deriveSerieFisica}
                  onChange={(e) => setDeriveSerieFisica(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  data-testid="input-derive-serie-fisica"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  OBSERVACIONES <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describa los detalles de la transferencia reversa"
                  value={deriveObservations}
                  onChange={(e) => setDeriveObservations(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={5}
                  data-testid="input-derive-observations"
                />
              </div>

              {/* Cargar Archivo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Cargar Archivo
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".jpg,.png,.pdf,.doc,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setDeriveFoto(file.name);
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                    data-testid="button-derive-select-file"
                  >
                    Seleccionar archivo
                  </button>
                  <div className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 text-sm flex items-center">
                    {deriveFoto ? deriveFoto : "Ningún arc... eleccionado"}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Formatos permitidos: JPG, PNG, PDF, DOC, DOCX<br/>
                  Tamaño máximo: 5MB
                </p>
              </div>

              {/* Solicitar Button */}
              <button
                onClick={handleDeriveSubmit}
                disabled={!deriveWorkOrder.trim() || !deriveMotivo || !deriveObservations.trim()}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors mt-8"
                data-testid="button-solicitar-requerimiento"
              >
                Solicitar requerimiento
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Declare Delivery Dialog */}
      <Sheet open={isDeclareDeliveryOpen} onOpenChange={setIsDeclareDeliveryOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 bg-slate-900 border-l border-white/10">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center px-6">
            <SheetClose asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </SheetClose>
            <h2 className="text-lg font-semibold text-white ml-4">
              Declaración de entrega para reversa
            </h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-6 space-y-6">
              {/* Serie Seleccionada */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SERIE SELECCIONADA
                </label>
                <input
                  type="text"
                  value={deliverySerie}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none cursor-not-allowed"
                  data-testid="input-delivery-serie"
                />
              </div>

              {/* Cargar Archivo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Cargar Archivo <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".jpg,.png,.pdf,.doc,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setDeliveryFoto(file.name);
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                    data-testid="button-delivery-select-file"
                  >
                    Seleccionar archivo
                  </button>
                  <div className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 text-sm flex items-center">
                    {deliveryFoto ? deliveryFoto : "Ningún archi... seleccionado"}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Formatos permitidos: JPG, PNG, PDF, DOC, DOCX<br/>
                  Tamaño máximo: 5MB
                </p>
              </div>

              {/* Declarar Button */}
              <button
                onClick={handleDeclareDeliverySubmit}
                disabled={!deliveryFoto}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors mt-8"
                data-testid="button-declare-delivery"
              >
                Declarar entregada
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Transfer Dialog */}
      <Sheet open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 bg-slate-900 border-l border-white/10">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center px-6">
            <SheetClose asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </SheetClose>
            <h2 className="text-lg font-semibold text-white ml-4">
              Canal de requerimientos
            </h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-6 space-y-6">
              {/* Serie Seleccionada */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SERIE SELECCIONADA
                </label>
                <input
                  type="text"
                  value={transferSerie}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none cursor-not-allowed"
                  data-testid="input-transfer-serie"
                />
              </div>

              {/* Escalamiento a Supervisor */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3 uppercase">
                  Escalamiento a Supervisor
                </label>
                <div className="space-y-2">
                  {["Validación supervisor", "PROBLEMA SISTEMICO", "Equipo serie incorrecta"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setEscalamientoSupervisor(option);
                        setEscalamientoBodega(null);
                        setTransferTecnico("");
                      }}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-left ${
                        escalamientoSupervisor === option
                          ? "bg-cyan-500 text-black"
                          : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                      }`}
                      data-testid={`button-escalamiento-supervisor-${option.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Send size={18} />
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Escalamiento a Bodega */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3 uppercase">
                  Escalamiento a Bodega
                </label>
                <div className="space-y-2">
                  {["Equipo con desperfecto", "Serie no aparece en TOA", "Serie a regularizar por cierre de inventario", "Devuelto a bodega"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setEscalamientoBodega(option);
                        setEscalamientoSupervisor(null);
                        setTransferTecnico("");
                      }}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-left ${
                        escalamientoBodega === option
                          ? "bg-red-600 text-white"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                      data-testid={`button-escalamiento-bodega-${option.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Send size={18} />
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transferencia Entre Tecnicos */}
              {!escalamientoSupervisor && !escalamientoBodega && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 uppercase">
                    Transferencia Entre Tecnicos
                  </label>
                  <button className="w-full px-4 py-3 bg-amber-400 hover:bg-amber-500 text-black font-medium rounded-lg transition-colors flex items-center gap-2 justify-center">
                    <Send size={18} />
                    Transferencia a otro tecnico
                  </button>

                  {/* Tecnico a quien transfiere */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-white mb-3">
                      Técnico a quien transfiere <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={transferTecnico}
                      onChange={(e) => setTransferTecnico(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      data-testid="select-transfer-tecnico"
                    >
                      <option value="">Seleccione el técnico a transferir</option>
                      <option value="tecnico1">Técnico 1</option>
                      <option value="tecnico2">Técnico 2</option>
                      <option value="tecnico3">Técnico 3</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Cargar Foto */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Cargar Foto
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".jpg,.png,.pdf,.doc,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setTransferFoto(file.name);
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                    data-testid="button-transfer-select-file"
                  >
                    Seleccionar archivo
                  </button>
                  <div className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 text-sm flex items-center">
                    {transferFoto ? transferFoto : "Ningún arc... eleccionado"}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Formatos permitidos: JPG, PNG, PDF, DOC, DOCX<br/>
                  Tamaño máximo: 5MB
                </p>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  MOTIVO <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder=""
                  value={transferMotivo}
                  onChange={(e) => setTransferMotivo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                  data-testid="input-transfer-motivo"
                />
              </div>

              {/* Enviar Button */}
              <button
                onClick={handleTransferSubmit}
                disabled={!transferMotivo.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-8"
                data-testid="button-enviar-requerimiento"
              >
                Enviar requerimiento
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Declare Dialog */}
      <Sheet open={isDeclareOpen} onOpenChange={setIsDeclareOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0 bg-slate-900 border-l border-white/10">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center px-6">
            <SheetClose asChild>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </SheetClose>
            <h2 className="text-lg font-semibold text-white ml-4">
              declara la serie instalada
            </h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-6 space-y-6">
              {/* Serie Seleccionada */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  SERIE SELECCIONADA
                </label>
                <input
                  type="text"
                  value={selectedSerie}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none cursor-not-allowed"
                  data-testid="input-serie-selected"
                />
              </div>

              {/* Orden de trabajo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Orden de trabajo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingrese la orden de trabajo"
                  value={workOrder}
                  onChange={(e) => setWorkOrder(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  data-testid="input-work-order"
                />
              </div>

              {/* RUT cliente */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  RUT cliente
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={rutCliente}
                  onChange={(e) => setRutCliente(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  data-testid="input-rut-cliente"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Observaciones
                </label>
                <textarea
                  placeholder="Describa los detalles de la instalación (opcional)"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value.substring(0, 500))}
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  data-testid="input-observations"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Campo opcional, máximo 500 caracteres
                </p>
              </div>

              {/* Cargar Archivo */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Cargar Archivo
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".jpg,.png,.pdf,.doc,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setSelectedFile(file.name);
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                    data-testid="button-select-file"
                  >
                    Seleccionar archivo
                  </button>
                  <div className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 text-sm flex items-center">
                    {selectedFile ? selectedFile : "Ningún archi... seleccionado"}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Formatos permitidos: JPG, PNG, PDF, DOC, DOCX<br/>
                  Tamaño máximo: 5MB
                </p>
              </div>

              {/* Declarar Button */}
              <button
                onClick={handleDeclareSubmit}
                disabled={!workOrder.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-8"
                data-testid="button-declare"
              >
                Declarar instalada
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
