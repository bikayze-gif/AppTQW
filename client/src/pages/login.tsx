import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<"technician" | "supervisor">("technician");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success && result.redirectTo) {
        setLocation(result.redirectTo);
      } else if (!result.success) {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black font-sans flex">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 bg-transparent">
        {/* Logo */}
        <div className="mb-7 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45" />
          </div>
          <span className="text-base font-bold text-[#06b6d4]">TelqwayAPP</span>
        </div>

        {/* Sign In Title */}
        <div className="mb-5">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">Iniciar sesión</h1>
          <p className="text-slate-400 text-xs md:text-sm">
            ¿No tienes una cuenta?{" "}
            <button className="text-[#06b6d4] hover:text-[#0891b2] font-semibold transition-colors" data-testid="link-signup">
              Regístrate
            </button>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400" data-testid="error-message">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setRole("technician")}
              className={`py-1.5 rounded-md text-xs font-medium transition-all ${role === "technician"
                ? "bg-[#06b6d4] text-black shadow-lg"
                : "text-slate-400 hover:text-white"
                }`}
            >
              Técnico
            </button>
            <button
              type="button"
              onClick={() => setRole("supervisor")}
              className={`py-1.5 rounded-md text-xs font-medium transition-all ${role === "supervisor"
                ? "bg-[#06b6d4] text-black shadow-lg"
                : "text-slate-400 hover:text-white"
                }`}
            >
              Supervisor
            </button>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
              data-testid="input-email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all pr-10"
                data-testid="input-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border border-white/20 bg-white/5 accent-[#06b6d4] cursor-pointer"
                data-testid="checkbox-remember"
              />
              <span className="text-xs text-slate-400">Recuérdame</span>
            </label>
            <button
              type="button"
              onClick={() => setLocation("/forgot-password")}
              className="text-xs text-slate-400 hover:text-[#06b6d4] transition-colors font-medium"
              data-testid="link-forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 hover:shadow-xl hover:shadow-[#06b6d4]/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="button-signin"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden flex-col justify-center items-center px-12">
        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#06b6d4]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0891b2]/5 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-5 max-w-md">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
              Nueva experiencia, diseñada para ti
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Descubre la nueva versión de Telqway. Una interfaz más intuitiva y eficiente,
              creada pensando en hacerte el trabajo más fácil y el día a día más fluido.
            </p>
          </div>

          {/* Community Stats */}

        </div>
      </div>
    </div>
  );
}
