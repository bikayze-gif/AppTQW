import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ShoppingCart, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialFormData) => void;
  userId?: number;
}

export interface MaterialFormData {
  tipo: string;
  familia: string;
  subfamilia: string;
  material: string;
  materialDescription?: string;
  itemCode?: string;
  cantidad: number;
}

interface CartItem extends MaterialFormData {
  itemCode: string;
  materialDescription: string;
}

export function MaterialForm({ isOpen, onClose, onSubmit, userId }: MaterialFormProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    tipo: "",
    familia: "",
    subfamilia: "",
    material: "",
    cantidad: 1,
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tiposMaterial, setTiposMaterial] = useState<string[]>([]);
  const [familias, setFamilias] = useState<string[]>([]);
  const [subfamilias, setSubfamilias] = useState<string[]>([]);
  const [materiales, setMateriales] = useState<Array<{id: string, description: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success: boolean; message: string; ticket?: string} | null>(null);

  // Load tipos on mount
  useEffect(() => {
    const loadTipos = async () => {
      try {
        const res = await fetch("/api/materials/tipos");
        if (res.ok) {
          const data = await res.json();
          setTiposMaterial(data);
        }
      } catch (error) {
        console.error("Error loading tipos:", error);
      }
    };
    loadTipos();
  }, []);

  // Load familias when tipo changes
  useEffect(() => {
    if (formData.tipo) {
      const loadFamilias = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/materials/familias/${encodeURIComponent(formData.tipo)}`);
          if (res.ok) {
            const data = await res.json();
            setFamilias(data);
            setFormData(prev => ({ ...prev, familia: "", subfamilia: "", material: "" }));
          }
        } catch (error) {
          console.error("Error loading familias:", error);
        } finally {
          setLoading(false);
        }
      };
      loadFamilias();
    }
  }, [formData.tipo]);

  // Load subfamilias when familia changes
  useEffect(() => {
    if (formData.tipo && formData.familia) {
      const loadSubfamilias = async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `/api/materials/subfamilias/${encodeURIComponent(formData.tipo)}/${encodeURIComponent(formData.familia)}`
          );
          if (res.ok) {
            const data = await res.json();
            setSubfamilias(data);
            setFormData(prev => ({ ...prev, subfamilia: "", material: "" }));
          }
        } catch (error) {
          console.error("Error loading subfamilias:", error);
        } finally {
          setLoading(false);
        }
      };
      loadSubfamilias();
    }
  }, [formData.tipo, formData.familia]);

  // Load items when subfamilia changes
  useEffect(() => {
    if (formData.tipo && formData.familia && formData.subfamilia) {
      const loadItems = async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `/api/materials/items/${encodeURIComponent(formData.tipo)}/${encodeURIComponent(formData.familia)}/${encodeURIComponent(formData.subfamilia)}`
          );
          if (res.ok) {
            const data = await res.json();
            setMateriales(data);
            setFormData(prev => ({ ...prev, material: "" }));
          }
        } catch (error) {
          console.error("Error loading items:", error);
        } finally {
          setLoading(false);
        }
      };
      loadItems();
    }
  }, [formData.tipo, formData.familia, formData.subfamilia]);

  const handleChange = (field: keyof MaterialFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddToCart = () => {
    if (formData.tipo && formData.familia && formData.subfamilia && formData.material && formData.cantidad > 0) {
      const selectedMaterial = materiales.find(m => m.id === formData.material);
      const cartItem: CartItem = {
        ...formData,
        itemCode: formData.material,
        materialDescription: selectedMaterial?.description || formData.material,
      };
      setCartItems((prev) => [...prev, cartItem]);
      setFormData({ tipo: "", familia: "", subfamilia: "", material: "", cantidad: 1 });
    }
  };

  const handleRemoveFromCart = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;
    
    console.log("handleConfirmOrder - userId received:", userId);
    
    if (!userId || userId <= 0) {
      console.error("Invalid userId:", userId);
      setSubmitResult({
        success: false,
        message: "Error: No se pudo identificar el usuario. Por favor, vuelva a iniciar sesión.",
      });
      return;
    }
    
    setSubmitting(true);
    setSubmitResult(null);
    
    try {
      const response = await fetch("/api/materials/solicitud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: userId,
          id_destino: 0,
          id_supervisor: 0,
          items: cartItems.map(item => ({
            material: item.materialDescription,
            cantidad: item.cantidad,
            item: item.itemCode,
            itemCode: item.itemCode,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: data.message || "Solicitud creada exitosamente",
          ticket: data.ticket,
        });
        
        setTimeout(() => {
          onSubmit(formData);
          setCartItems([]);
          setShowConfirmation(false);
          setSubmitResult(null);
          onClose();
        }, 2000);
      } else {
        setSubmitResult({
          success: false,
          message: data.error || "Error al crear la solicitud",
        });
      }
    } catch (error) {
      console.error("Error submitting solicitud:", error);
      setSubmitResult({
        success: false,
        message: "Error de conexión al enviar la solicitud",
      });
    } finally {
      setSubmitting(false);
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
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
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
                  disabled={!formData.tipo || loading}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="select-familia"
                >
                  <option value="" className="bg-slate-900">
                    {loading ? "Cargando..." : "Seleccione una familia"}
                  </option>
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
                  disabled={!formData.familia || loading}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="select-subfamilia"
                >
                  <option value="" className="bg-slate-900">
                    {loading ? "Cargando..." : "Seleccione una subfamilia"}
                  </option>
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
                  disabled={!formData.subfamilia || loading}
                  className="w-full bg-slate-900/50 border border-[#06b6d4]/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all cursor-pointer hover:border-[#06b6d4]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="select-material"
                >
                  <option value="" className="bg-slate-900">
                    {loading ? "Cargando..." : "Seleccione un material"}
                  </option>
                  {materiales.map((mat) => (
                    <option key={mat.id} value={mat.id} className="bg-slate-900">
                      {mat.description}
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
                  
                  <div className="space-y-2 pr-1">
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
                              {item.subfamilia} • {item.materialDescription}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="flex-shrink-0 ml-2 p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all"
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
                </motion.div>
              )}
            </div>

            {/* Footer Action */}
            {cartItems.length > 0 && !showConfirmation && (
              <div className="border-t border-white/10 bg-card/95 p-6">
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-3 rounded-lg transition-colors"
                  data-testid="button-confirm-order"
                >
                  Confirmar Solicitud ({cartItems.length} items)
                </button>
              </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmation && (
              <div className="border-t border-white/10 bg-card/95 p-6 space-y-3">
                {submitResult ? (
                  <div className="text-center py-2">
                    {submitResult.success ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-semibold">{submitResult.message}</p>
                        {submitResult.ticket && (
                          <p className="text-slate-400 text-sm mt-1">Ticket: {submitResult.ticket}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                        <p className="text-red-400 font-semibold">{submitResult.message}</p>
                        <button
                          onClick={() => setSubmitResult(null)}
                          className="mt-3 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          Intentar de nuevo
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-white font-semibold mb-1">¿Confirmar Solicitud?</p>
                      <p className="text-slate-400 text-sm">Se enviarán {cartItems.length} items</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={submitting}
                        className="w-full bg-slate-700/50 hover:bg-slate-700/70 text-white border border-slate-600/50 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                        data-testid="button-cancel-confirmation"
                      >
                        No
                      </button>
                      <button
                        onClick={handleConfirmOrder}
                        disabled={submitting}
                        className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        data-testid="button-confirm-yes"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Sí, Confirmar"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
