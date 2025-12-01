import { useState } from "react";
import { X, Eye, Link as LinkIcon, User, Paperclip, CheckCircle2, MessageSquare, Activity, Plus, Trash2, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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

export function TaskDetailModal({ task, onClose, open }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [tags, setTags] = useState(task?.tags || []);
  const [assignees, setAssignees] = useState(task?.assignees || []);
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");

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

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
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

          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Labels</h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 pl-3 pr-2 py-1 flex items-center gap-1"
                  data-testid={`label-${tag}`}
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Input
                type="text"
                placeholder="Select multiple Labels"
                className="flex-1 min-w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                data-testid="input-labels"
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Members</h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
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
                  <button
                    onClick={() => setAssignees(assignees.filter((a) => a !== assignee))}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <Input
                type="text"
                placeholder="Select ..."
                className="flex-1 min-w-32 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                data-testid="input-members"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Attachments</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {mockAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  data-testid={`attachment-${attachment.id}`}
                >
                  <div className="h-24 bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-white" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{attachment.date}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        data-testid={`btn-actions-${attachment.id}`}
                      >
                        Actions
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Checklist 2</h3>
            </div>

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
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Comment</h3>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add comment"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white mb-2"
                  data-testid="input-new-comment"
                />
                <Button
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  disabled={!newComment.trim()}
                  data-testid="btn-save-comment"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Existing Comments */}
            <div className="space-y-4">
              {mockComments.map((comment) => (
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

          {/* Activity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Activity</h3>
            </div>

            <div className="space-y-3">
              {mockComments.map((activity) => (
                <div key={activity.id} className="flex gap-3" data-testid={`activity-${activity.id}`}>
                  <img
                    src={activity.avatar}
                    alt={activity.author}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-white">{activity.author}</span>{" "}
                      {activity.time}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
