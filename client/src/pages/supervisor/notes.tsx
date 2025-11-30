import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { FileText, Bell, Archive, Users, Briefcase, CheckSquare, Flag, User, Users2, Edit3, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  timestamp: string;
  image?: string;
}

const categories = [
  { name: "Notes", icon: FileText },
  { name: "Reminders", icon: Bell },
  { name: "Archive", icon: Archive },
  { name: "Family", icon: Users },
  { name: "Work", icon: Briefcase },
  { name: "Tasks", icon: CheckSquare },
  { name: "Priority", icon: Flag },
  { name: "Personal", icon: User },
  { name: "Friends", icon: Users2 },
];

const categoryColors: { [key: string]: string } = {
  Work: "bg-blue-50 border-blue-200",
  Family: "bg-purple-50 border-purple-200",
  Tasks: "bg-green-50 border-green-200",
  Priority: "bg-red-50 border-red-200",
  Personal: "bg-yellow-50 border-yellow-200",
  Friends: "bg-pink-50 border-pink-200",
  Notes: "bg-slate-50 border-slate-200",
  Reminders: "bg-orange-50 border-orange-200",
  Archive: "bg-gray-50 border-gray-200",
};

const categoryBadgeColors: { [key: string]: string } = {
  Work: "bg-blue-100 text-blue-800",
  Family: "bg-purple-100 text-purple-800",
  Tasks: "bg-green-100 text-green-800",
  Priority: "bg-red-100 text-red-800",
  Personal: "bg-yellow-100 text-yellow-800",
  Friends: "bg-pink-100 text-pink-800",
  Notes: "bg-slate-100 text-slate-800",
  Reminders: "bg-orange-100 text-orange-800",
  Archive: "bg-gray-100 text-gray-800",
};

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Find a new company name",
    content: "",
    category: "Work",
    color: "bg-blue-50",
    timestamp: "Mar 10",
  },
  {
    id: "2",
    title: "Update the design of the theme",
    content: "",
    category: "Priority",
    color: "bg-red-50",
    timestamp: "Mar 10 22, 6:34",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Send the photos of last summer to John",
    content: "",
    category: "Personal",
    color: "bg-yellow-50",
    timestamp: "",
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "Shopping list",
    content: "Bread\nMilk\nOnions\nCoffee\nToilet-Paper",
    category: "Tasks",
    color: "bg-green-50",
    timestamp: "Dec 15 22, 4:44",
  },
  {
    id: "5",
    title: "Organize the dad's surprise retirement party",
    content: "",
    category: "Family",
    color: "bg-purple-50",
    timestamp: "Dec 25 22, 8:56",
  },
  {
    id: "6",
    title: "Theming support for all apps",
    content: "",
    category: "Work",
    color: "bg-blue-50",
    timestamp: "Mar 10 22, 6:34",
  },
  {
    id: "7",
    title: "Keynote Schedule",
    content: "Breakfast\nOpening ceremony\nTalk 1: How we did it!\nTalk 2: How you can\nLunch break",
    category: "Tasks",
    color: "bg-green-50",
    timestamp: "Jan 05 22, 5:27",
  },
  {
    id: "8",
    title: "Office Address",
    content: "933 8th Street Stamford,\nCT 06902",
    category: "Work",
    color: "bg-blue-50",
    timestamp: "",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
  },
];

export default function SupervisorNotes() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedCategory, setSelectedCategory] = useState("Notes");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "Notes" });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleSaveNote = () => {
    if (formData.title.trim()) {
      if (editingNoteId) {
        // Update existing note
        setNotes(notes.map(note => 
          note.id === editingNoteId 
            ? { ...note, title: formData.title, content: formData.content, category: formData.category }
            : note
        ));
        // Automatically select the category of the updated note so it's visible
        setSelectedCategory(formData.category);
      } else {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          title: formData.title,
          content: formData.content,
          category: formData.category,
          color: categoryColors[formData.category] || "bg-slate-50",
          timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
        setNotes([newNote, ...notes]);
        // Automatically select the category of the new note so it's visible
        setSelectedCategory(formData.category);
      }
      setFormData({ title: "", content: "", category: "Notes" });
      setIsFormExpanded(false);
      setEditingNoteId(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setFormData({ title: note.title, content: note.content, category: note.category });
    setEditingNoteId(note.id);
    setIsFormExpanded(true);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", content: "", category: "Notes" });
    setIsFormExpanded(false);
    setEditingNoteId(null);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span>Apps</span>
          <span>/</span>
          <span>Notes</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">All</span>
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
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </nav>
            
            <button className="w-full mt-6 flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors border-t border-slate-200 dark:border-slate-700 pt-6">
              <Edit3 size={18} />
              <span>Edit Labels</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Create Note Form - Inline Expandable */}
            <motion.div 
              className="mb-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
              animate={{ minHeight: isFormExpanded ? "auto" : "auto" }}
            >
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onFocus={() => setIsFormExpanded(true)}
                className="w-full text-lg font-medium bg-transparent border-none focus:outline-none text-slate-800 dark:text-white placeholder-slate-400 mb-4"
              />
              
              <AnimatePresence>
                {!isFormExpanded ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFormExpanded(true)}
                    className="w-full text-slate-500 bg-transparent border-none focus:outline-none placeholder-slate-400 cursor-pointer min-h-12 flex items-center"
                  >
                    Take a note...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <textarea
                      placeholder="Take a note..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full min-h-24 bg-transparent border-none focus:outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 resize-none"
                    />
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex gap-3">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                          <Bell size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                          <FileText size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                          <Flag size={18} />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleSaveNote}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                          {editingNoteId ? "Update" : "Create"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleEditNote(note)}
                    className={`rounded-2xl border-2 p-6 cursor-pointer hover:shadow-lg transition-shadow ${categoryColors[note.category] || "bg-slate-50 border-slate-200"} ${editingNoteId === note.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {note.image && (
                      <div className="mb-4 -mx-6 -mt-6">
                        <img src={note.image} alt="" className="w-full h-40 object-cover rounded-t-xl" />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{note.title}</h3>
                    {note.content && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryBadgeColors[note.category] || "bg-slate-100 text-slate-800"}`}>
                        {note.category}
                      </span>
                      {note.timestamp && <span className="text-xs text-slate-500">{note.timestamp}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </SupervisorLayout>
  );
}