import { useState } from "react";
import { X, Calendar, Tag, User, Paperclip, CheckCircle2, MessageSquare, Activity, Plus, Trash2, Share2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
}

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  open: boolean;
}

const mockChecklistItems = [
  { id: "1", text: "Replace event colors with Material Design colors", completed: true },
  { id: "2", text: "Replace icons with Material Design icons", completed: false },
  { id: "3", text: "Use date-fns", completed: false },
];

const mockComments = [
  {
    id: "1",
    author: "Robbie Buckley",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "almost 4 years ago",
    text: "AngularCLI could be a nice alternative.",
  },
];

const mockAttachments = [
  { id: "1", name: "mail.jpg", date: "01/21/2022, 9:0..." },
  { id: "2", name: "calendar.jpg", date: "01/21/2022, 9:0..." },
];

const availableLabels = [
  "Research",
  "Wireframing",
  "Design",
  "Development",
  "Bug",
  "Feature",
  "Documentation",
];

const availableMembers = [
  { id: "1", name: "Angeline Vinson", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Roseann Greer", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Lorraine Barnett", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Middleton Bradford", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: "5", name: "Sue Hays", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "6", name: "Keith Neal", avatar: "https://i.pravatar.cc/150?img=6" },
  { id: "7", name: "Wilkins Gilmore", avatar: "https://i.pravatar.cc/150?img=7" },
  { id: "8", name: "Baldwin Stein", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "9", name: "Bobbie Cohen", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "10", name: "Melody Peters", avatar: "https://i.pravatar.cc/150?img=10" },
];

export function TaskDetailModal({ task, onClose, open }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [tags, setTags] = useState(task?.tags || []);
  const [assignees, setAssignees] = useState(task?.assignees || []);
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [comments, setComments] = useState(mockComments);
  const [attachments, setAttachments] = useState(mockAttachments);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleToggleLabel = (label: string) => {
    setTags(
      tags.includes(label)
        ? tags.filter((t) => t !== label)
        : [...tags, label]
    );
  };

  const handleToggleMember = (memberName: string) => {
    setAssignees(
      assignees.includes(memberName)
        ? assignees.filter((a) => a !== memberName)
        : [...assignees, memberName]
    );
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([
        ...checklistItems,
        {
          id: Date.now().toString(),
          text: newChecklistItem,
          completed: false,
        },
      ]);
      setNewChecklistItem("");
    }
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleSaveComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        author: "You",
        avatar: "https://i.pravatar.cc/150?img=33",
        time: "just now",
        text: newComment.trim(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleSaveComment();
    }
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;

  const sidebarIcons = [
    { id: "calendar", icon: Calendar, label: "Due Date" },
    { id: "labels", icon: Tag, label: "Labels" },
    { id: "members", icon: User, label: "Members" },
    { id: "attachments", icon: Paperclip, label: "Attachments" },
    { id: "checklist", icon: CheckCircle2, label: "Checklist" },
    { id: "comments", icon: MessageSquare, label: "Comments" },
    { id: "activity", icon: Activity, label: "Activity" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <span>Admin Dashboard</span>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">To do</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                  placeholder="Task title"
                  data-testid="input-task-title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white min-h-24"
                  placeholder="Add a description..."
                  data-testid="textarea-task-description"
                />
              </div>

              {/* Labels Display */}
              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                        data-testid={`label-${tag}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Display */}
              {assignees.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Members</h3>
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full"
                        data-testid={`member-${assignee}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
                          {assignee[0]}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Attachments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative"
                      data-testid={`attachment-${attachment.id}`}
                    >
                      <div className="h-24 bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center relative">
                        <Paperclip className="w-6 h-6 text-white" />
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          data-testid={`btn-delete-attachment-${attachment.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{attachment.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{attachment.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Checklist 2</h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {completedCount} / {totalCount}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      data-testid={`checklist-item-${item.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="w-5 h-5 rounded cursor-pointer"
                        data-testid={`checkbox-${item.id}`}
                      />
                      <input
                        type="text"
                        value={item.text}
                        readOnly
                        className={`flex-1 bg-transparent text-slate-900 dark:text-white outline-none ${
                          item.completed ? "line-through text-slate-500" : ""
                        }`}
                        data-testid={`item-text-${item.id}`}
                      />
                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                        data-testid={`btn-delete-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}

                  {/* Add New Item */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add an item"
                      className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      data-testid="input-new-checklist"
                    />
                    <Button
                      onClick={handleAddChecklistItem}
                      size="sm"
                      className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                      data-testid="btn-add-checklist"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Comment</h3>

                <div className="flex gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={handleCommentKeyDown}
                      placeholder="Add comment"
                      className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white mb-2"
                      data-testid="input-new-comment"
                    />
                    <Button
                      onClick={handleSaveComment}
                      className="bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 disabled:opacity-50 border border-slate-400 dark:border-slate-500"
                      disabled={!newComment.trim()}
                      data-testid="btn-save-comment"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Existing Comments */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {comment.author}{" "}
                            <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">
                              {comment.time}
                            </span>
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar with Icons and Panels */}
        <div className="w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Icon Bar */}
          <div className="flex flex-col gap-2 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {sidebarIcons.map((icon) => (
              <button
                key={icon.id}
                onClick={() => setActivePanel(activePanel === icon.id ? null : icon.id)}
                className={`p-3 rounded-lg transition-all ${
                  activePanel === icon.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                title={icon.label}
                data-testid={`btn-sidebar-${icon.id}`}
              >
                <icon.icon className="w-5 h-5 mx-auto" />
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Labels Panel */}
            {activePanel === "labels" && (
              <div className="p-4 space-y-2" data-testid="panel-labels">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Labels</h3>
                {availableLabels.map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                    data-testid={`label-option-${label}`}
                  >
                    <input
                      type="checkbox"
                      checked={tags.includes(label)}
                      onChange={() => handleToggleLabel(label)}
                      className="w-4 h-4 rounded"
                      data-testid={`checkbox-label-${label}`}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    <Tag className="w-3 h-3 text-slate-400 ml-auto" />
                  </label>
                ))}
              </div>
            )}

            {/* Members Panel */}
            {activePanel === "members" && (
              <div className="p-4 space-y-2" data-testid="panel-members">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Members</h3>
                {availableMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors"
                    data-testid={`member-option-${member.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={assignees.includes(member.name)}
                      onChange={() => handleToggleMember(member.name)}
                      className="w-4 h-4 rounded"
                      data-testid={`checkbox-member-${member.id}`}
                    />
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{member.name}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Attachments Panel */}
            {activePanel === "attachments" && (
              <div className="p-4" data-testid="panel-attachments">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Attachments</h3>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add File
                </Button>
                <div className="mt-4 space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      data-testid={`attachment-panel-${attachment.id}`}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{attachment.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{attachment.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="ml-2 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        data-testid={`btn-delete-attachment-panel-${attachment.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Panel */}
            {activePanel === "calendar" && (
              <div className="p-4" data-testid="panel-calendar">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Due Date</h3>
                <Input
                  type="date"
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  data-testid="input-due-date"
                />
              </div>
            )}

            {/* Empty State */}
            {!activePanel && (
              <div className="p-4 flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <p className="text-sm">Select an option</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
