import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, FileText, Settings } from "lucide-react";

interface AddMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialClick: () => void;
  onReportClick: () => void;
  onSettingsClick: () => void;
}

export function AddMenu({
  isOpen,
  onClose,
  onMaterialClick,
  onReportClick,
  onSettingsClick,
}: AddMenuProps) {
  const menuItems = [
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
    },
    {
      id: "settings",
      label: "Configuración",
      icon: Settings,
      onClick: onSettingsClick,
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
            className="fixed inset-0 z-40"
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
              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-[#1A1F33] border border-white/10 rounded-lg hover:bg-white/5 transition-colors group"
                  data-testid={`menu-item-${item.id}`}
                >
                  <item.icon
                    size={20}
                    className="text-[#06b6d4] group-hover:text-white transition-colors"
                  />
                  <span className="text-sm font-medium text-white whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
