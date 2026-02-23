import { useState, useRef, useEffect, RefObject } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Flag, X, Plus, Minus, ChevronLeft, ChevronRight,
  Loader2, FileText, Users, Briefcase, CheckSquare, Flag as FlagIcon,
  User, Users2, Edit3
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface NoteLabel {
  id: number;
  userId: number;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

// Active sub-panel
type ActivePanel = "none" | "reminder" | "label";

// ============================================
// CONSTANTS
// ============================================

const defaultLabels = [
  { name: "Family", icon: Users },
  { name: "Work", icon: Briefcase },
  { name: "Tasks", icon: CheckSquare },
  { name: "Priority", icon: FlagIcon },
  { name: "Personal", icon: User },
  { name: "Friends", icon: Users2 },
];

const iconMap: { [key: string]: any } = {
  FileText, Bell, Users, Briefcase, CheckSquare, Flag: FlagIcon, User, Users2, Edit3,
};

const categoryBadgeColors: { [key: string]: string } = {
  Work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Family: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Tasks: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Priority: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Personal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Friends: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

// ============================================
// PROPS
// ============================================

interface QuickNoteDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement>;
}

// ============================================
// COMPONENT
// ============================================

export function QuickNoteDropdown({ isOpen, onClose, anchorRef }: QuickNoteDropdownProps) {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({ title: "", content: "", category: "Notes" });
  const [reminder, setReminder] = useState({ date: "", time: "" });
  const [tempReminderDate, setTempReminderDate] = useState("");

  // Which inline sub-panel is open
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Panel position
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // ============================================
  // POSITION CALCULATION
  // ============================================

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  // ============================================
  // CLICK OUTSIDE
  // ============================================

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // ============================================
  // KEYBOARD SHORTCUT
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isOpen) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape" && isOpen) {
        if (activePanel !== "none") {
          setActivePanel("none");
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, formData, reminder, activePanel]);

  // ============================================
  // QUERIES
  // ============================================

  const { data: userLabelsRaw = [] } = useQuery<NoteLabel[]>({
    queryKey: ["/api/notes/labels/list"],
    queryFn: async () => {
      const res = await fetch("/api/notes/labels/list", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar etiquetas");
      return res.json();
    },
    enabled: isOpen,
  });

  const labelCategories = userLabelsRaw.length > 0
    ? userLabelsRaw.map(l => ({ name: l.name, icon: iconMap[l.icon] || FileText }))
    : defaultLabels;

  // ============================================
  // MUTATIONS
  // ============================================

  const createNoteMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string | null;
      category: string;
      reminderDate?: string | null;
    }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear nota");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast.success("Nota creada exitosamente");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    const reminderDate = reminder.date
      ? `${reminder.date}T${reminder.time || "00:00"}:00`
      : null;

    createNoteMutation.mutate({
      title: formData.title,
      content: formData.content || null,
      category: formData.category,
      reminderDate,
    });
  };

  const handleClose = () => {
    setFormData({ title: "", content: "", category: "Notes" });
    setReminder({ date: "", time: "" });
    setTempReminderDate("");
    setActivePanel("none");
    onClose();
  };

  const togglePanel = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setActivePanel("none");
    } else {
      if (panel === "reminder") setTempReminderDate(reminder.date);
      setActivePanel(panel);
    }
  };

  // ============================================
  // CALENDAR HELPERS
  // ============================================

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: panelPos.top,
            right: panelPos.right,
            transformOrigin: "top right",
            zIndex: 200,
          }}
          className="w-[380px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Header strip */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Nueva nota
            </span>
            <button
              onClick={handleClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Form fields */}
          <div className="px-5 py-4 space-y-3">
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-base font-medium bg-transparent border-none focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
              autoFocus
            />

            <textarea
              placeholder="Escribe algo..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 resize-none"
            />

            {/* Active tags */}
            {(reminder.date || (formData.category && formData.category !== "Notes")) && (
              <div className="flex gap-2 flex-wrap">
                {reminder.date && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-700/50">
                    <span className="text-xs font-medium">
                      {new Date(reminder.date).toLocaleDateString("es-CL", { month: "short", day: "numeric" })}
                      {reminder.time && `, ${reminder.time}`}
                    </span>
                    <button
                      onClick={() => setReminder({ date: "", time: "" })}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {formData.category && formData.category !== "Notes" && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${categoryBadgeColors[formData.category] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"} border-current border-opacity-30`}>
                    <span className="text-xs font-medium">{formData.category}</span>
                    <button
                      onClick={() => setFormData({ ...formData, category: "Notes" })}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inline sub-panel: Reminder */}
          <AnimatePresence>
            {activePanel === "reminder" && (
              <motion.div
                key="reminder-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
              >
                <div className="flex gap-4 px-5 pt-4 pb-2">
                  {/* Calendar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <ChevronLeft size={15} className="text-slate-600 dark:text-slate-300" />
                      </button>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {currentMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <ChevronRight size={15} className="text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
                        <div key={`h-${idx}`} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wide py-1">
                          {day}
                        </div>
                      ))}
                      {generateCalendarDays().map((day, i) => {
                        const dateStr = day
                          ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                          : "";
                        const isSelected = !!day && tempReminderDate === dateStr;
                        return (
                          <button
                            key={i}
                            onClick={() => { if (day) setTempReminderDate(dateStr); }}
                            disabled={!day}
                            className={`text-[11px] py-1.5 rounded-md font-medium transition-all ${!day ? "invisible" : ""} ${isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-slate-100 dark:bg-slate-700 self-stretch" />

                  {/* Time picker */}
                  <div className="flex flex-col items-center justify-center min-w-[72px] gap-1">
                    <button
                      onClick={() => {
                        const h = parseInt(reminder.time.split(":")[0] || "0");
                        setReminder({ ...reminder, time: `${String(h === 23 ? 0 : h + 1).padStart(2, "0")}:${reminder.time.split(":")[1] || "00"}` });
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <div className="text-xl font-bold text-slate-800 dark:text-white font-mono tracking-wider">
                      {(reminder.time.split(":")[0] || "00").padStart(2, "0")}
                      <span className="text-slate-300 dark:text-slate-600">:</span>
                      {(reminder.time.split(":")[1] || "00").padStart(2, "0")}
                    </div>
                    <button
                      onClick={() => {
                        const h = parseInt(reminder.time.split(":")[0] || "0");
                        setReminder({ ...reminder, time: `${String(h === 0 ? 23 : h - 1).padStart(2, "0")}:${reminder.time.split(":")[1] || "00"}` });
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                </div>

                {/* Reminder actions */}
                <div className="flex gap-2 px-5 py-3">
                  <button
                    onClick={() => { setReminder({ date: "", time: "" }); setTempReminderDate(""); setActivePanel("none"); }}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => { setReminder({ ...reminder, date: tempReminderDate }); setActivePanel("none"); }}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline sub-panel: Labels */}
          <AnimatePresence>
            {activePanel === "label" && (
              <motion.div
                key="label-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
              >
                <div className="px-5 py-3">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Etiqueta
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {labelCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = formData.category === cat.name;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setFormData({ ...formData, category: isActive ? "Notes" : cat.name });
                            setActivePanel("none");
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${isActive
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                        >
                          <Icon size={14} />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Reminder toggle button */}
              <button
                onClick={() => togglePanel("reminder")}
                className={`p-2 rounded-lg transition-colors ${activePanel === "reminder"
                  ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                  : reminder.date
                    ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                title="Recordatorio"
              >
                <Bell size={16} />
              </button>

              {/* Label toggle button */}
              <button
                onClick={() => togglePanel("label")}
                className={`p-2 rounded-lg transition-colors ${activePanel === "label"
                  ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                  : formData.category !== "Notes"
                    ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                title="Etiqueta"
              >
                <Flag size={16} />
              </button>
            </div>

            {/* Create button */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:block">Ctrl+Enter</span>
              <button
                onClick={handleSave}
                disabled={createNoteMutation.isPending || !formData.title.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {createNoteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Crear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
