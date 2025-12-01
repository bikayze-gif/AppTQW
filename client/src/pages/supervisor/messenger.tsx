import { useState } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
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
        <div className="w-80 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      selectedChat === chat.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.initials}</AvatarFallback>
                      </Avatar>
                      {chat.unread && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-[#1e293b]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className={`text-sm font-semibold truncate ${
                          selectedChat === chat.id
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
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-2xl ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-800 dark:bg-slate-700 text-white rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "me"
                            ? "text-blue-100"
                            : "text-slate-400"
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
      </div>
    </SupervisorLayout>
  );
}
