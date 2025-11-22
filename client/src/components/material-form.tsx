import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ShoppingCart, Trash2 } from "lucide-react";

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

  const handleRemoveFromCart = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
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
                <motion.div 
                  className="mt-8 pt-8 border-t border-[#06b6d4]/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart size={18} className="text-[#06b6d4]" />
                    <h3 className="text-sm font-bold text-white">CARRITO DE MATERIALES</h3>
                    <span className="ml-auto bg-[#06b6d4] text-black text-xs font-bold px-2.5 py-1 rounded-full">
                      {cartItems.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group bg-gradient-to-br from-[#06b6d4]/15 to-[#0891b2]/5 border border-[#06b6d4]/40 rounded-lg p-3.5 hover:border-[#06b6d4]/70 transition-all hover:shadow-lg hover:shadow-[#06b6d4]/10"
                        data-testid={`cart-item-${idx}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-slate-100 font-semibold text-sm">
                              <span className="text-[#06b6d4]">{item.tipo}</span>
                              <span className="text-slate-400 mx-1.5">•</span>
                              <span className="text-slate-300">{item.familia}</span>
                            </div>
                            <div className="text-slate-400 text-xs mt-1.5">
                              {item.subfamilia} • {item.material}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="flex-shrink-0 ml-2 p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            data-testid={`button-remove-item-${idx}`}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#06b6d4]/20">
                          <span className="text-[#06b6d4] text-xs font-bold">Cantidad:</span>
                          <span className="bg-[#06b6d4]/20 text-[#06b6d4] text-xs font-bold px-2.5 py-1 rounded">
                            {item.cantidad}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#06b6d4]/20 bg-[#06b6d4]/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-semibold text-sm">Total de unidades:</span>
                      <span className="bg-[#06b6d4] text-black font-bold text-lg px-3 py-1 rounded-lg">
                        {cartItems.reduce((sum, item) => sum + item.cantidad, 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
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
