import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ShoppingCart } from "lucide-react";

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialFormData) => void;
}

export interface MaterialFormData {
  tipo: string;
  familia: string;
  subfamilia: string;
  material: string;
  cantidad: number;
}

const tiposMaterial = ["Acero", "Aluminio", "Cobre", "Hierro", "Zinc"];
const familias = ["Estructural", "Acabado", "Especial", "Estándar"];
const subfamilias = ["Tipo A", "Tipo B", "Tipo C", "Tipo D"];
const materiales = ["Material 1", "Material 2", "Material 3", "Material 4"];

export function MaterialForm({ isOpen, onClose, onSubmit }: MaterialFormProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    tipo: "",
    familia: "",
    subfamilia: "",
    material: "",
    cantidad: 1,
  });

  const [cartItems, setCartItems] = useState<MaterialFormData[]>([]);

  const handleChange = (field: keyof MaterialFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddToCart = () => {
    if (formData.tipo && formData.familia && formData.subfamilia && formData.material && formData.cantidad > 0) {
      setCartItems((prev) => [...prev, { ...formData }]);
      setFormData({ tipo: "", familia: "", subfamilia: "", material: "", cantidad: 1 });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide Panel */}
          <motion.div
            className="absolute inset-y-0 right-0 w-full md:w-full max-w-md bg-card shadow-2xl flex flex-col overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-[#06b6d4] bg-[#06b6d4]/10 p-2 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">Solicitud de Materiales</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                data-testid="button-close-material-form"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {/* Tipo de Material */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Tipo de Material</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50"
                  data-testid="select-tipo-material"
                >
                  <option value="" className="bg-slate-900">Seleccione un tipo de material</option>
                  {tiposMaterial.map((tipo) => (
                    <option key={tipo} value={tipo} className="bg-slate-900">
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Familia */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Familia</label>
                <select
                  value={formData.familia}
                  onChange={(e) => handleChange("familia", e.target.value)}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50"
                  data-testid="select-familia"
                >
                  <option value="" className="bg-slate-900">Seleccione una familia</option>
                  {familias.map((fam) => (
                    <option key={fam} value={fam} className="bg-slate-900">
                      {fam}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Familia */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Sub Familia</label>
                <select
                  value={formData.subfamilia}
                  onChange={(e) => handleChange("subfamilia", e.target.value)}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50"
                  data-testid="select-subfamilia"
                >
                  <option value="" className="bg-slate-900">Seleccione una subfamilia</option>
                  {subfamilias.map((subfam) => (
                    <option key={subfam} value={subfam} className="bg-slate-900">
                      {subfam}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Material</label>
                <select
                  value={formData.material}
                  onChange={(e) => handleChange("material", e.target.value)}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50"
                  data-testid="select-material"
                >
                  <option value="" className="bg-slate-900">Seleccione un material</option>
                  {materiales.map((mat) => (
                    <option key={mat} value={mat} className="bg-slate-900">
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleChange("cantidad", parseInt(e.target.value) || 1)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-[#06b6d4] transition-colors"
                  data-testid="input-cantidad"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                data-testid="button-add-to-cart"
              >
                <Plus size={20} />
                Agregar al Carrito
              </button>

              {/* Cart Items */}
              {cartItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-[#06b6d4] mb-3 flex items-center gap-2">
                    <ShoppingCart size={16} />
                    CARRITO DE MATERIALES ({cartItems.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-3 text-sm hover:bg-[#06b6d4]/15 transition-colors"
                        data-testid={`cart-item-${idx}`}
                      >
                        <div className="text-slate-200 font-medium">
                          <span className="text-[#06b6d4]">{item.tipo}</span> • {item.familia}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          {item.material}
                        </div>
                        <div className="text-[#06b6d4] text-xs font-semibold mt-1.5">
                          Cantidad: {item.cantidad}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-slate-300 font-semibold">Total: {cartItems.length} unidades</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/10 bg-card/95 p-6">
                <button
                  onClick={() => {
                    onSubmit(formData);
                    setCartItems([]);
                    onClose();
                  }}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-3 rounded-lg transition-colors"
                  data-testid="button-confirm-order"
                >
                  Confirmar Solicitud ({cartItems.length} items)
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
