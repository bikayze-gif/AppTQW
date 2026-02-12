import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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
  cantidad: number | string;
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
  const [materiales, setMateriales] = useState<Array<{ id: string, description: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; ticket?: string } | null>(null);

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

  const handleUpdateCartQuantity = (idx: number, newQuantity: number | string) => {
    setCartItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, cantidad: newQuantity } : item
    ));
  };

  const handleAddToCart = () => {
    const cantidadNum = typeof formData.cantidad === 'string' ? parseInt(formData.cantidad) : formData.cantidad;
    if (formData.tipo && formData.familia && formData.subfamilia && formData.material && cantidadNum > 0) {
      const selectedMaterial = materiales.find(m => m.id === formData.material);
      const cartItem: CartItem = {
        ...formData,
        cantidad: cantidadNum,
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

    setSubmitting(true);
    setSubmitResult(null);

    try {
      console.log('[MaterialForm] Submitting order with items:', cartItems);

      const response = await fetch("/api/materials/solicitud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id_destino: 0,
          id_supervisor: 0,
          items: cartItems.map(item => ({
            material: item.materialDescription,
            cantidad: typeof item.cantidad === 'string' ? (parseInt(item.cantidad) || 0) : item.cantidad,
            item: item.itemCode,
            itemCode: item.itemCode,
          })),
        }),
      });

      const data = await response.json();
      console.log('[MaterialForm] Response:', { status: response.status, data });

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
        // Construir mensaje de error detallado
        let errorMessage = data.error || "Error al crear la solicitud";

        // Si hay detalles de validación, agregarlos
        if (data.details && Array.isArray(data.details)) {
          errorMessage += ": " + data.details.map((d: any) => d.message).join(", ");
        }

        // Si hay un mensaje adicional del servidor
        if (data.message && data.message !== data.error) {
          errorMessage += " - " + data.message;
        }

        console.error('[MaterialForm] Error response:', errorMessage, data);

        setSubmitResult({
          success: false,
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error("[MaterialForm] Network/Connection error:", error);
      setSubmitResult({
        success: false,
        message: "Error de conexión al enviar la solicitud. Por favor, verifica tu conexión a internet.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
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
            className="absolute inset-y-0 right-0 w-full md:w-full max-w-md bg-[#0F172A] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden text-[0.9rem]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-none bg-[#0F172A]/95 backdrop-blur-md border-b border-white/10 px-5 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="text-[#06b6d4] bg-[#06b6d4]/10 p-1.5 rounded-lg">
                  <ShoppingCart size={18} />
                </div>
                <h2 className="text-base font-bold text-white uppercase tracking-tight">Solicitud de Materiales</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                data-testid="button-close-material-form"
              >
                <X size={22} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5 custom-scrollbar">
              {/* Tipo de Material */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Tipo de Material</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all cursor-pointer hover:border-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2306b6d4%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.8rem_center] bg-no-repeat"
                  data-testid="select-tipo-material"
                >
                  <option value="" className="bg-slate-900">Seleccione un tipo</option>
                  {tiposMaterial.map((tipo) => (
                    <option key={tipo} value={tipo} className="bg-slate-900">
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Familia */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Familia</label>
                <select
                  value={formData.familia}
                  onChange={(e) => handleChange("familia", e.target.value)}
                  disabled={!formData.tipo || loading}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2306b6d4%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.8rem_center] bg-no-repeat"
                  data-testid="select-familia"
                >
                  <option value="" className="bg-slate-900">
                    {loading ? "Cargando..." : "Seleccione familia"}
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
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Sub Familia</label>
                <select
                  value={formData.subfamilia}
                  onChange={(e) => handleChange("subfamilia", e.target.value)}
                  disabled={!formData.familia || loading}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2306b6d4%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.8rem_center] bg-no-repeat"
                  data-testid="select-subfamilia"
                >
                  <option value="" className="bg-slate-900">
                    {loading ? "Cargando..." : "Seleccione subfamilia"}
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
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Material</label>
                <select
                  value={formData.material}
                  onChange={(e) => handleChange("material", e.target.value)}
                  disabled={!formData.subfamilia || loading}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2306b6d4%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.8rem_center] bg-no-repeat"
                  data-testid="select-material"
                >
                  <option value="" className="bg-slate-900">
                    {loading
                      ? "Cargando..."
                      : materiales.length === 0 && formData.subfamilia
                        ? "No hay materiales disponibles para esta combinación"
                        : "Seleccione material"}
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
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Cantidad</label>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      const current = typeof formData.cantidad === 'string' ? (parseInt(formData.cantidad) || 0) : formData.cantidad;
                      if (current > 1) handleChange("cantidad", current - 1);
                    }}
                    className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => handleChange("cantidad", e.target.value)}
                    onBlur={() => {
                      if (!formData.cantidad || parseInt(formData.cantidad.toString()) < 1) {
                        handleChange("cantidad", 1);
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-center text-sm placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    data-testid="input-cantidad"
                  />
                  <button
                    onClick={() => {
                      const current = typeof formData.cantidad === 'string' ? (parseInt(formData.cantidad) || 0) : formData.cantidad;
                      handleChange("cantidad", current + 1);
                    }}
                    className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 text-xs uppercase tracking-wider active:scale-95 shadow-md shadow-[#06b6d4]/20"
                data-testid="button-add-to-cart"
              >
                <Plus size={16} />
                Agregar al Carrito
              </button>

              {/* Cart Items Area */}
              {cartItems.length > 0 && (
                <motion.div
                  className="mt-6 pt-6 border-t border-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <ShoppingCart size={16} className="text-[#06b6d4]" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Carrito de Solicitud</h3>
                    <span className="ml-auto bg-[#06b6d4] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {cartItems.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {cartItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-slate-900/40 border border-white/5 rounded-lg p-3 hover:border-[#06b6d4]/30 transition-all"
                        data-testid={`cart-item-${idx}`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-[#06b6d4] uppercase truncate">
                              {item.tipo} • {item.familia}
                            </div>
                            <div className="text-slate-100 font-medium text-[11px] leading-relaxed mt-1 line-clamp-2">
                              {item.materialDescription}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Cant:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const current = typeof item.cantidad === 'string' ? (parseInt(item.cantidad) || 0) : item.cantidad;
                                if (current > 1) handleUpdateCartQuantity(idx, current - 1);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-white min-w-[20px] text-center">{item.cantidad}</span>
                            <button
                              onClick={() => {
                                const current = typeof item.cantidad === 'string' ? (parseInt(item.cantidad) || 0) : item.cantidad;
                                handleUpdateCartQuantity(idx, current + 1);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* DYNAMIC CONFIRMATION BUTTON - Now inside the scrollable area */}
                  {!showConfirmation && (
                    <motion.div
                      className="mt-6 pb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => setShowConfirmation(true)}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-green-950/40 active:scale-95 text-xs uppercase tracking-[0.1em] border border-green-400/20"
                        data-testid="button-confirm-order"
                      >
                        🚀 Confirmar Solicitud ({cartItems.length})
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Confirmation Dialog inside scroll area */}
              {showConfirmation && (
                <motion.div
                  className="mt-6 p-4 rounded-xl bg-slate-900 border border-white/10 space-y-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {submitResult ? (
                    <div className="text-center py-2">
                      {submitResult.success ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-bold text-sm">{submitResult.message}</p>
                          {submitResult.ticket && (
                            <p className="text-slate-400 text-xs mt-1">Nº: {submitResult.ticket}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 font-bold text-sm">{submitResult.message}</p>
                          <button
                            onClick={() => setSubmitResult(null)}
                            className="mt-3 text-xs text-[#06b6d4] underline"
                          >
                            Volver a intentar
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-white font-bold text-sm uppercase tracking-tight">¿Enviar Solicitud?</p>
                        <p className="text-slate-400 text-xs mt-1">Esta acción no se puede deshacer</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowConfirmation(false)}
                          disabled={submitting}
                          className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                        >
                          CANCELAR
                        </button>
                        <button
                          onClick={handleConfirmOrder}
                          disabled={submitting}
                          className="py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : "ENVIAR"}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
