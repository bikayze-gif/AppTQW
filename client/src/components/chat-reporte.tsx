import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
}

interface ChatReporteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatReporte({ isOpen, onClose }: ChatReporteProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "¡Hola! ¿En qué puedo ayudarte con tu reporte?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        "Entendido. ¿Puedes proporcionar más detalles sobre esto?",
        "Gracias por la información. ¿Hay algo más que agregar?",
        "Perfecto, he tomado nota. ¿Necesitas ayuda con algo específico?",
        "Interesante. ¿Cuándo ocurrió esto?",
        "De acuerdo. ¿Hay algo urgente que deba saber?",
        "Entiendo la situación. ¿Qué resultado esperas?",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "support",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-md bg-black/30"
            data-testid="chat-reporte-backdrop"
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:right-4 md:left-auto md:bottom-24 md:w-96 md:inset-auto md:h-[600px] bg-gradient-to-br from-[#0f1419] via-[#1A1F33] to-[#0f1419] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
            data-testid="chat-reporte-container"
          >
            {/* Header - WhatsApp Style */}
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Soporte - Nuevo Reporte
                  </h3>
                  <p className="text-xs text-white/80">Activo ahora</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  data-testid="button-phone-chat"
                >
                  <Phone size={16} className="text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  data-testid="button-close-chat-reporte"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0f1419]/50 to-[#1A1F33]/50 scrollbar-hide">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white rounded-br-none"
                        : "bg-white/10 text-white/90 rounded-bl-none border border-white/10"
                    }`}
                    data-testid={`chat-message-${message.id}`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-60 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 border border-white/10 text-white/90 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-[#06b6d4] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#0f1419]/80">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribe tu reporte..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#06b6d4]"
                  data-testid="input-chat-reporte"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#06b6d4]/80 hover:to-[#0891b2]/80 text-white"
                  data-testid="button-send-chat-reporte"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
