import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, FileText, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface AddMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialClick: () => void;
  onReportClick: () => void;
  onAIClick: () => void;
}

export function AddMenu({
  isOpen,
  onClose,
  onMaterialClick,
  onReportClick,
  onAIClick,
}: AddMenuProps) {
  const menuItems = [
    {
      id: "ai",
      label: "Asistente IA",
      icon: Bot,
      onClick: onAIClick,
      isUnderConstruction: true,
    },
    {
      id: "material",
      label: "Solicitud de Material",
      icon: ShoppingCart,
      onClick: onMaterialClick,
    },
    {
      id: "report",
      label: "Nuevo Reporte",
      icon: FileText,
      onClick: onReportClick,
      isUnderConstruction: true,
    },
  ];

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
            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/10"
            data-testid="menu-backdrop"
          />

          {/* Menu Container */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex flex-col gap-3 items-center"
            >
              <TooltipProvider>
                {/* Menu Items */}
                {menuItems.map((item, index) => {
                  const button = (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (!item.isUnderConstruction) {
                          item.onClick();
                          onClose();
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 bg-[#1A1F33] border border-white/10 rounded-lg transition-colors group ${item.isUnderConstruction ? "cursor-not-allowed opacity-80" : "hover:bg-white/5"
                        }`}
                      data-test-id={`menu-item-${item.id}`}
                    >
                      <item.icon
                        size={20}
                        className={`${item.isUnderConstruction ? "text-slate-500" : "text-[#06b6d4] group-hover:text-white"
                          } transition-colors`}
                      />
                      <span className={`text-sm font-medium whitespace-nowrap ${item.isUnderConstruction ? "text-slate-400" : "text-white"
                        }`}>
                        {item.label}
                      </span>
                    </motion.button>
                  );

                  if (item.isUnderConstruction) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          {button}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white font-medium">
                          <p>En construcción</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return button;
                })}
              </TooltipProvider>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
