import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft, User, Mail, MessageSquare, Radio, AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

interface Message {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
}

export default function SupervisorMessenger() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth(); // Destructure logout from useAuth
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"online" | "away" | "disturb">("online");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "me",
      content: "Thanks, man! It was good catching up with you.",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      sender: "them",
      content: "Yeah dude. Hit me again next week so we can grab a coffee, remotely of course :)",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      sender: "me",
      content: "Hey! Are you available right now? How about if we grab that coffee today? Remotely, of course :)",
      timestamp: "10:35 AM",
    },
    {
      id: "4",
      sender: "them",
      content: "See you later!",
      timestamp: "10:36 AM",
    },
    {
      id: "5",
      sender: "me",
      content: "Sure thing! I'm gonna call you in 5, is it okay?",
      timestamp: "10:38 AM",
    },
    {
      id: "6",
      sender: "them",
      content: "Awesome! Call me in 5 minutes.",
      timestamp: "10:40 AM",
    },
  ]);

  const chats: Chat[] = [
    {
      id: "1",
      name: "Bernard Langley",
      avatar: "https://i.pravatar.cc/150?img=12",
      initials: "BL",
      lastMessage: "See you tomorrow!",
      timestamp: "Jan 5, 2022",
      unread: true,
    },
    {
      id: "2",
      name: "Nunez Faulkner",
      avatar: "https://i.pravatar.cc/150?img=14",
      initials: "NF",
      lastMessage: "See you tomorrow!",
      timestamp: "Jan 5, 2022",
    },
    {
      id: "3",
      name: "Edwards Mckenzie",
      avatar: "https://i.pravatar.cc/150?img=15",
      initials: "EM",
      lastMessage: "See you tomorrow!",
      timestamp: "Jan 5, 2022",
    },
    {
      id: "4",
      name: "Elsie Melendez",
      avatar: "https://i.pravatar.cc/150?img=16",
      initials: "EM",
      lastMessage: "See you tomorrow!",
      timestamp: "Jan 5, 2022",
    },
    {
      id: "5",
      name: "Mcleod Wagner",
      avatar: "https://i.pravatar.cc/150?img=17",
      initials: "MW",
      lastMessage: "See you tomorrow!",
      timestamp: "Jan 5, 2022",
    },
  ];

  const contacts: Chat[] = [
    {
      id: "c1",
      name: "Dejesus Michael",
      avatar: "https://i.pravatar.cc/150?img=18",
      initials: "DM",
      lastMessage: "",
      timestamp: "",
    },
    {
      id: "c2",
      name: "Dena Molina",
      avatar: "https://i.pravatar.cc/150?img=19",
      initials: "DM",
      lastMessage: "",
      timestamp: "",
    },
    {
      id: "c3",
      name: "Bernard Langley",
      avatar: "https://i.pravatar.cc/150?img=12",
      initials: "BL",
      lastMessage: "",
      timestamp: "",
    },
  ];

  const selectedChatData = chats.find((c) => c.id === selectedChat);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: "me",
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setMessageInput("");
    }
  };

  return (
    <SupervisorLayout>
      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Left Sidebar - Chats */}
        <div className="w-72 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Brian Hughes
              </h2>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <MoreVertical size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                data-testid="input-search-chat"
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Chats Section */}
            <div>
              <h3 className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Chats
              </h3>
              <div className="px-3 space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    data-testid={`button-chat-${chat.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${selectedChat === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.initials}</AvatarFallback>
                      </Avatar>
                      {chat.unread && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-[#1e293b]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className={`text-sm font-semibold truncate ${selectedChat === chat.id
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-800 dark:text-white"
                          }`}
                        data-testid={`text-chat-name-${chat.id}`}
                      >
                        {chat.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                      {chat.timestamp}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts Section */}
            <div>
              <h3 className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide border-t border-slate-100 dark:border-slate-800 mt-2">
                Contacts
              </h3>
              <div className="px-3 space-y-2 pb-4">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    data-testid={`button-contact-${contact.id}`}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {contact.name}
                    </p>
                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 ml-auto"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          {selectedChatData && (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChatData.avatar} />
                    <AvatarFallback>{selectedChatData.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {selectedChatData.name}
                    </p>
                    <p className="text-xs text-slate-500">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Phone size={18} className="text-slate-500" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Video size={18} className="text-slate-500" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical size={18} className="text-slate-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsProfileOpen(true)} data-testid="menu-profile">
                        <User size={16} className="mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} data-testid="menu-logout"> {/* Changed to call logout */}
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-2xl ${msg.sender === "me"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${msg.sender === "me"
                          ? "text-blue-100"
                          : "text-slate-500 dark:text-slate-400"
                          }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-end gap-3">
                  <button
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    data-testid="button-emoji"
                  >
                    <Smile size={20} className="text-slate-500" />
                  </button>
                  <button
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    data-testid="button-attach"
                  >
                    <Paperclip size={20} className="text-slate-500" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    data-testid="input-message"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    data-testid="button-send"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Drawer */}
        <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <SheetContent side="left" className="w-full sm:w-96 p-0">
            {/* Header */}
            <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-6">
              <SheetClose asChild>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors -ml-2">
                  <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </SheetClose>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white ml-4">
                Profile
              </h2>
            </div>

            {/* Profile Content */}
            <div className="overflow-y-auto h-[calc(100vh-64px)]">
              {/* Avatar Section */}
              <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="https://i.pravatar.cc/150?img=33" />
                    <AvatarFallback>BH</AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-4 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-[#1e293b] ${profileStatus === "online" ? "bg-green-500" :
                    profileStatus === "away" ? "bg-yellow-500" : "bg-red-500"
                    }`}></div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Name
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <User size={18} className="text-slate-500" />
                    <input
                      type="text"
                      defaultValue="Brian Hughes"
                      className="flex-1 bg-transparent text-slate-800 dark:text-white focus:outline-none text-sm"
                      data-testid="input-name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Mail size={18} className="text-slate-500" />
                    <input
                      type="email"
                      defaultValue="hughes.brian@company.com"
                      className="flex-1 bg-transparent text-slate-800 dark:text-white focus:outline-none text-sm"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    About
                  </label>
                  <div className="flex gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <MessageSquare size={18} className="text-slate-500 mt-0.5 shrink-0" />
                    <textarea
                      defaultValue="Hi there! I'm using FuseChat."
                      className="flex-1 bg-transparent text-slate-800 dark:text-white focus:outline-none text-sm resize-none"
                      rows={3}
                      data-testid="input-about"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Status
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="status"
                        checked={profileStatus === "online"}
                        onChange={() => setProfileStatus("online")}
                        className="w-4 h-4 accent-green-500"
                        data-testid="radio-online"
                      />
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Online</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="status"
                        checked={profileStatus === "away"}
                        onChange={() => setProfileStatus("away")}
                        className="w-4 h-4 accent-yellow-500"
                        data-testid="radio-away"
                      />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Away</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="status"
                        checked={profileStatus === "disturb"}
                        onChange={() => setProfileStatus("disturb")}
                        className="w-4 h-4 accent-red-500"
                        data-testid="radio-disturb"
                      />
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Do not disturb</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </SupervisorLayout>
  );
}