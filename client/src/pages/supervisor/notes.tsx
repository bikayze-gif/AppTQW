import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import {
  FileText, Bell, Archive, Users, Briefcase, CheckSquare, Flag, User, Users2,
  Edit3, Search, X, Calendar, Clock, ChevronLeft, ChevronRight, Plus, Minus,
  Pin, PinOff, Trash2, ArchiveRestore, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface Note {
  id: number;
  userId: number;
  title: string;
  content: string | null;
  category: string;
  imageUrl: string | null;
  isArchived: number;
  isPinned: number;
  reminderDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Alias from DB column names
  user_id?: number;
  image_url?: string | null;
  is_archived?: number;
  is_pinned?: number;
  reminder_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface NoteLabel {
  id: number;
  userId: number;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

// Normalize DB snake_case to camelCase
function normalizeNote(note: any): Note {
  return {
    id: note.id,
    userId: note.userId ?? note.user_id,
    title: note.title,
    content: note.content,
    category: note.category,
    imageUrl: note.imageUrl ?? note.image_url,
    isArchived: note.isArchived ?? note.is_archived ?? 0,
    isPinned: note.isPinned ?? note.is_pinned ?? 0,
    reminderDate: note.reminderDate ?? note.reminder_date,
    createdAt: note.createdAt ?? note.created_at,
    updatedAt: note.updatedAt ?? note.updated_at,
  };
}

// ============================================
// CONSTANTS
// ============================================

const defaultCategories = [
  { name: "Notes", icon: FileText },
  { name: "Reminders", icon: Bell },
  { name: "Archive", icon: Archive },
];

const defaultLabels = [
  { name: "Family", icon: Users },
  { name: "Work", icon: Briefcase },
  { name: "Tasks", icon: CheckSquare },
  { name: "Priority", icon: Flag },
  { name: "Personal", icon: User },
  { name: "Friends", icon: Users2 },
];

const iconMap: { [key: string]: any } = {
  FileText, Bell, Archive, Users, Briefcase, CheckSquare, Flag, User, Users2, Edit3,
};

const categoryColors: { [key: string]: string } = {
  Work: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  Family: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  Tasks: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  Priority: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  Personal: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  Friends: "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800",
  Notes: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
  Reminders: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  Archive: "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800",
};

const categoryBadgeColors: { [key: string]: string } = {
  Work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Family: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Tasks: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Priority: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Personal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Friends: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Notes: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  Reminders: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Archive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

// ============================================
// COMPONENT
// ============================================

export default function SupervisorNotes() {
  const queryClient = useQueryClient();

  // UI State
  const [selectedCategory, setSelectedCategory] = useState("Notes");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "Notes" });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [reminder, setReminder] = useState({ date: "", time: "" });
  const [tempReminderDate, setTempReminderDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  // Refs
  const formRef = useRef<HTMLDivElement>(null);
  const labelButtonRef = useRef<HTMLButtonElement>(null);
  const reminderButtonRef = useRef<HTMLButtonElement>(null);
  const reminderPopoverRef = useRef<HTMLDivElement>(null);
  const [labelPopoverPos, setLabelPopoverPos] = useState({ top: 0, left: 0 });
  const [reminderPopoverPos, setReminderPopoverPos] = useState({ top: 0, left: 0 });

  // ============================================
  // QUERIES
  // ============================================

  const { data: notesRaw = [], isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "Notes" && selectedCategory !== "All") {
        params.set("category", selectedCategory);
      }
      if (selectedCategory !== "Archive") {
        params.set("archived", "false");
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      const res = await fetch(`/api/notes?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar notas");
      return res.json();
    },
  });

  const notes = notesRaw.map(normalizeNote);

  const { data: userLabelsRaw = [] } = useQuery<NoteLabel[]>({
    queryKey: ["/api/notes/labels/list"],
    queryFn: async () => {
      const res = await fetch("/api/notes/labels/list", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar etiquetas");
      return res.json();
    },
  });

  // Build label categories from user's custom labels + defaults
  const labelCategories = userLabelsRaw.length > 0
    ? userLabelsRaw.map(l => ({
        name: l.name,
        icon: iconMap[l.icon] || FileText,
      }))
    : defaultLabels;

  const allCategories = [...defaultCategories, ...labelCategories];

  // ============================================
  // MUTATIONS
  // ============================================

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string | null; category: string; reminderDate?: string | null }) => {
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
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar nota");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast.success("Nota actualizada");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar nota");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast.success("Nota eliminada");
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notes/${id}/archive`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al archivar nota");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      const note = normalizeNote(data);
      toast.success(note.isArchived ? "Nota archivada" : "Nota restaurada");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notes/${id}/pin`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al fijar nota");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      const note = normalizeNote(data);
      toast.success(note.isPinned ? "Nota fijada" : "Nota desfijada");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: async (data: { name: string; icon?: string }) => {
      const res = await fetch("/api/notes/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear etiqueta");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/labels/list"] });
      toast.success("Etiqueta creada");
      setNewLabelName("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notes/labels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar etiqueta");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/labels/list"] });
      toast.success("Etiqueta eliminada");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (formData.title.trim() && !editingNoteId) {
          handleSaveNote();
        }
        setIsFormExpanded(false);
      }
    };

    if (isFormExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isFormExpanded, formData, editingNoteId]);

  useEffect(() => {
    const handleClickOutsideReminder = (event: MouseEvent) => {
      if (reminderPopoverRef.current && !reminderPopoverRef.current.contains(event.target as Node) &&
        !reminderButtonRef.current?.contains(event.target as Node)) {
        setIsReminderOpen(false);
      }
    };

    if (isReminderOpen) {
      document.addEventListener("mousedown", handleClickOutsideReminder);
      return () => document.removeEventListener("mousedown", handleClickOutsideReminder);
    }
  }, [isReminderOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && (isFormExpanded || isEditModalOpen)) {
        event.preventDefault();
        handleSaveNote();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFormExpanded, isEditModalOpen, formData, editingNoteId]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaveNote = () => {
    if (!formData.title.trim()) return;

    const reminderDate = reminder.date
      ? `${reminder.date}T${reminder.time || "00:00"}:00`
      : null;

    if (editingNoteId) {
      updateNoteMutation.mutate({
        id: editingNoteId,
        data: {
          title: formData.title,
          content: formData.content || null,
          category: formData.category,
          reminderDate,
        },
      });
      setSelectedCategory(formData.category === "Notes" ? "Notes" : formData.category);
      setIsEditModalOpen(false);
    } else {
      createNoteMutation.mutate({
        title: formData.title,
        content: formData.content || null,
        category: formData.category,
        reminderDate,
      });
      if (formData.category !== "Notes") {
        setSelectedCategory(formData.category);
      }
    }
    setFormData({ title: "", content: "", category: "Notes" });
    setIsFormExpanded(false);
    setEditingNoteId(null);
    setReminder({ date: "", time: "" });
  };

  const handleEditNote = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content || "",
      category: note.category,
    });
    setEditingNoteId(note.id);
    if (note.reminderDate) {
      const d = new Date(note.reminderDate);
      setReminder({
        date: d.toISOString().split("T")[0],
        time: d.toTimeString().slice(0, 5),
      });
    } else {
      setReminder({ date: "", time: "" });
    }
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", content: "", category: "Notes" });
    setIsEditModalOpen(false);
    setEditingNoteId(null);
    setIsReminderOpen(false);
    setIsLabelOpen(false);
    setReminder({ date: "", time: "" });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CL", { month: "short", day: "numeric", year: "numeric" });
  };

  // Count notes per category for badge
  const getNotesCount = (category: string) => {
    return notes.filter(n => {
      if (category === "Notes" || category === "All") return !n.isArchived;
      if (category === "Reminders") return n.reminderDate && !n.isArchived;
      if (category === "Archive") return n.isArchived;
      return n.category === category && !n.isArchived;
    }).length;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto" style={{ zoom: "85%" }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span>Apps</span>
          <span>/</span>
          <span>Notes</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedCategory}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-1">Notes</h1>
            <p className="text-slate-500">Capture and organize your thoughts and ideas</p>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search note"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 sticky top-8 h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <nav className="space-y-1 mb-8">
              {defaultCategories.map((cat) => {
                const Icon = cat.icon;
                const count = getNotesCount(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${selectedCategory === cat.name
                      ? "bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{cat.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Labels</h3>
            </div>
            <nav className="space-y-1">
              {labelCategories.map((cat) => {
                const Icon = cat.icon;
                const count = getNotesCount(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${selectedCategory === cat.name
                      ? "bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{cat.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => setIsEditLabelsOpen(true)}
              className="w-full mt-6 flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors border-t border-slate-200 dark:border-slate-700 pt-6"
            >
              <Edit3 size={18} />
              <span>Edit Labels</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Create Note Form - Inline Expandable */}
            <div
              ref={formRef}
              className={`mb-8 rounded-xl transition-all duration-300 ${isFormExpanded
                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-md"
                : "bg-transparent border-b-2 border-slate-200 dark:border-slate-600"
                }`}
            >
              <AnimatePresence mode="wait">
                {!isFormExpanded ? (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsFormExpanded(true)}
                    className="w-full flex items-center justify-between gap-4 py-4 cursor-pointer"
                  >
                    <span className="text-slate-500 dark:text-slate-400 text-base">
                      Take a note...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full text-lg font-medium bg-transparent border-none focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                      autoFocus
                    />

                    <textarea
                      placeholder="Take a note..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full min-h-24 bg-transparent border-none focus:outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 resize-none"
                    />

                    {/* Tags Section */}
                    <div className="flex gap-2 flex-wrap">
                      {reminder.date && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-700/50">
                          <span className="text-sm font-medium">
                            {new Date(reminder.date).toLocaleDateString("es-CL", { month: "short", day: "numeric" })}
                            {reminder.time && `, ${reminder.time}`}
                          </span>
                          <button
                            onClick={() => setReminder({ ...reminder, date: "" })}
                            className="text-current opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {formData.category && formData.category !== "Notes" && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${categoryBadgeColors[formData.category] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"} border-current border-opacity-30`}>
                          <span className="text-sm font-medium">{formData.category}</span>
                          <button
                            onClick={() => setFormData({ ...formData, category: "Notes" })}
                            className="text-current opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex gap-1 relative">
                        {/* Reminder Button */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (!isReminderOpen) setTempReminderDate(reminder.date);
                              setIsReminderOpen(!isReminderOpen);
                              if (!isReminderOpen) setIsLabelOpen(false);
                            }}
                            className={`p-2 rounded transition-colors ${reminder.date ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                          >
                            <Bell size={18} />
                          </button>

                          {/* Reminder Popover for inline form */}
                          <AnimatePresence>
                            {isReminderOpen && !editingNoteId && (
                              <motion.div
                                ref={reminderPopoverRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-[380px] z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                              >
                                {renderCalendarPopover()}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Label/Category Button */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              setIsLabelOpen(!isLabelOpen);
                              if (!isLabelOpen) setIsReminderOpen(false);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          >
                            <Flag size={18} />
                          </button>

                          {/* Label Popover for inline form */}
                          <AnimatePresence>
                            {isLabelOpen && !editingNoteId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-64 z-50"
                              >
                                {renderLabelPopover()}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveNote}
                          disabled={createNoteMutation.isPending}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {createNoteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          Create
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reminder & Label Popovers (fixed position for modal) */}
            <AnimatePresence>
              {isReminderOpen && editingNoteId && (
                <motion.div
                  ref={reminderPopoverRef}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  style={{ position: 'fixed', top: `${reminderPopoverPos.top}px`, left: `${reminderPopoverPos.left}px` }}
                  className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-[380px] z-[100] overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                >
                  {renderCalendarPopover()}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isLabelOpen && editingNoteId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  style={{ position: 'fixed', top: `${labelPopoverPos.top}px`, left: `${labelPopoverPos.left}px` }}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-64 z-[100]"
                >
                  {renderLabelPopover()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
              {isEditModalOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleCancelEdit}
                    className="fixed inset-0 bg-black/50 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50"
                  >
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Note</h2>

                      <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full text-lg font-medium bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none text-slate-800 dark:text-white placeholder-slate-400 pb-2"
                      />

                      <textarea
                        placeholder="Take a note..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full min-h-32 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 dark:text-slate-300 placeholder-slate-400 resize-none p-3"
                      />

                      <div className="flex gap-2 flex-wrap">
                        {reminder.date && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-700/50">
                            <span className="text-sm font-medium">
                              {new Date(reminder.date).toLocaleDateString("es-CL", { month: "short", day: "numeric" })}
                              {reminder.time && `, ${reminder.time}`}
                            </span>
                            <button
                              onClick={() => setReminder({ ...reminder, date: "" })}
                              className="text-current opacity-70 hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        {formData.category && formData.category !== "Notes" && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${categoryBadgeColors[formData.category] || "bg-slate-100 text-slate-800"} border-current border-opacity-30`}>
                            <span className="text-sm font-medium">{formData.category}</span>
                            <button
                              onClick={() => setFormData({ ...formData, category: "Notes" })}
                              className="text-current opacity-70 hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 pt-4 border-t border-slate-100 dark:border-slate-700">
                        {/* Reminder Button */}
                        <button
                          ref={reminderButtonRef}
                          onClick={() => {
                            if (!isReminderOpen) {
                              const rect = reminderButtonRef.current?.getBoundingClientRect();
                              if (rect) {
                                setReminderPopoverPos({ top: rect.top - 10, left: rect.left + rect.width / 2 - 210 });
                              }
                            }
                            if (!isReminderOpen) setTempReminderDate(reminder.date);
                            setIsReminderOpen(!isReminderOpen);
                            if (!isReminderOpen) setIsLabelOpen(false);
                          }}
                          className={`p-2 rounded transition-colors ${reminder.date ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                        >
                          <Bell size={18} />
                        </button>

                        {/* Label/Category Button */}
                        <button
                          ref={labelButtonRef}
                          onClick={() => {
                            if (!isLabelOpen) {
                              const rect = labelButtonRef.current?.getBoundingClientRect();
                              if (rect) {
                                setLabelPopoverPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 - 128 });
                              }
                            }
                            setIsLabelOpen(!isLabelOpen);
                            if (!isLabelOpen) setIsReminderOpen(false);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <Flag size={18} />
                        </button>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNote}
                          disabled={updateNoteMutation.isPending}
                          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {updateNoteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          Update
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
              {deleteConfirmId !== null && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setDeleteConfirmId(null)}
                    className="fixed inset-0 bg-black/50 z-[60]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full z-[61]"
                  >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Eliminar nota</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">Esta acción no se puede deshacer. ¿Estás seguro?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => deleteNoteMutation.mutate(deleteConfirmId)}
                        disabled={deleteNoteMutation.isPending}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {deleteNoteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Edit Labels Modal */}
            <AnimatePresence>
              {isEditLabelsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsEditLabelsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full z-50"
                  >
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Manage Labels</h2>

                    {/* Create new label */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="New label name..."
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newLabelName.trim()) {
                            createLabelMutation.mutate({ name: newLabelName.trim() });
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (newLabelName.trim()) {
                            createLabelMutation.mutate({ name: newLabelName.trim() });
                          }
                        }}
                        disabled={!newLabelName.trim() || createLabelMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Existing labels */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userLabelsRaw.length === 0 && (
                        <p className="text-sm text-slate-500 py-4 text-center">
                          No custom labels yet. Default labels are shown.
                        </p>
                      )}
                      {userLabelsRaw.map((label) => (
                        <div key={label.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const Icon = iconMap[label.icon] || FileText;
                              return <Icon size={16} className="text-slate-500" />;
                            })()}
                            <span className="text-sm text-slate-700 dark:text-slate-300">{label.name}</span>
                          </div>
                          <button
                            onClick={() => deleteLabelMutation.mutate(label.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setIsEditLabelsOpen(false)}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoadingNotes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingNotes && notes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <FileText size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {selectedCategory === "Archive" ? "No hay notas archivadas" : "No hay notas"}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  {selectedCategory === "Archive"
                    ? "Las notas que archives aparecerán aquí"
                    : "Crea tu primera nota haciendo clic en el campo de arriba"
                  }
                </p>
              </div>
            )}

            {/* Notes Grid */}
            {!isLoadingNotes && notes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                <AnimatePresence>
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative rounded-2xl border-2 p-6 cursor-pointer hover:shadow-lg transition-shadow ${categoryColors[note.category] || "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"}`}
                    >
                      {/* Pin indicator */}
                      {note.isPinned === 1 && (
                        <div className="absolute top-3 right-3">
                          <Pin size={14} className="text-blue-500 fill-blue-500" />
                        </div>
                      )}

                      {/* Main click area */}
                      <div onClick={() => handleEditNote(note)}>
                        {note.imageUrl && (
                          <div className="mb-4 -mx-6 -mt-6">
                            <img src={note.imageUrl} alt="" className="w-full h-40 object-cover rounded-t-xl" />
                          </div>
                        )}
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 pr-6">{note.title}</h3>
                        {note.content && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                        )}
                        {note.reminderDate && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-3">
                            <Clock size={12} />
                            <span>{new Date(note.reminderDate).toLocaleDateString("es-CL", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryBadgeColors[note.category] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"}`}>
                            {note.category}
                          </span>
                          {note.createdAt && <span className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(note.createdAt)}</span>}
                        </div>
                      </div>

                      {/* Action buttons - visible on hover */}
                      <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePinMutation.mutate(note.id); }}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
                          title={note.isPinned ? "Desfijar" : "Fijar"}
                        >
                          {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleArchiveMutation.mutate(note.id); }}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-amber-600 transition-colors shadow-sm"
                          title={note.isArchived ? "Restaurar" : "Archivar"}
                        >
                          {note.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(note.id); }}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-red-600 transition-colors shadow-sm"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );

  // ============================================
  // SHARED RENDER HELPERS
  // ============================================

  function renderCalendarPopover() {
    return (
      <>
        <div className="flex gap-6 p-6">
          {/* Left: Calendar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {currentMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
                <div key={`day-${idx}`} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-2 uppercase tracking-wide">
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((day, i) => {
                const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                const isSelected = day && tempReminderDate === dateStr;
                return (
                  <button
                    key={i}
                    onClick={() => { if (day) setTempReminderDate(dateStr); }}
                    disabled={!day}
                    className={`text-xs py-1.5 rounded-lg font-medium transition-all ${!day ? "invisible" : ""} ${isSelected ? "bg-blue-600 text-white shadow-md font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-slate-200 dark:bg-slate-800 my-2" />

          {/* Right: Time Picker */}
          <div className="flex flex-col items-center justify-center min-w-[100px] px-2">
            <button
              onClick={() => {
                const h = parseInt(reminder.time.split(":")[0] || "0");
                const newH = h === 23 ? 0 : h + 1;
                setReminder({ ...reminder, time: `${String(newH).padStart(2, "0")}:${reminder.time.split(":")[1] || "00"}` });
              }}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-2"
            >
              <Plus size={16} />
            </button>
            <div className="text-3xl font-bold text-slate-800 dark:text-white font-mono my-2 tracking-wider">
              {(reminder.time.split(":")[0] || "00").padStart(2, "0")}
              <span className="text-slate-300 dark:text-slate-600 animate-pulse">:</span>
              {(reminder.time.split(":")[1] || "00").padStart(2, "0")}
            </div>
            <button
              onClick={() => {
                const h = parseInt(reminder.time.split(":")[0] || "0");
                const newH = h === 0 ? 23 : h - 1;
                setReminder({ ...reminder, time: `${String(newH).padStart(2, "0")}:${reminder.time.split(":")[1] || "00"}` });
              }}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
          <button
            onClick={() => { setReminder({ date: "", time: "" }); setTempReminderDate(""); }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => { setReminder({ ...reminder, date: tempReminderDate }); setIsReminderOpen(false); }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-md"
          >
            Save
          </button>
        </div>
      </>
    );
  }

  function renderLabelPopover() {
    return (
      <>
        <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Labels</h4>
        <div className="space-y-2">
          {labelCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setFormData({ ...formData, category: cat.name });
                  setIsLabelOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded transition-colors ${formData.category === cat.name ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              >
                <Icon size={16} />
                <span className="text-sm">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  }
}
