import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, KeyRound, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Circle } from "lucide-react";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testCode, setTestCode] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });

  const validatePassword = (password: string) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    });
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el código");
      }

      setStep("code");
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código inválido");
      }

      setStep("password");
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña");
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {["email", "code", "password"].map((s, idx) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s || (step === "success" && idx === 2)
              ? "bg-[#06b6d4] text-black"
              : idx < ["email", "code", "password"].indexOf(step)
                ? "bg-green-500 text-white"
                : "bg-white/10 text-slate-400"
              }`}
          >
            {idx < ["email", "code", "password"].indexOf(step) ? (
              <CheckCircle size={16} />
            ) : (
              idx + 1
            )}
          </div>
          {idx < 2 && (
            <div
              className={`w-8 h-0.5 mx-1 ${idx < ["email", "code", "password"].indexOf(step)
                ? "bg-green-500"
                : "bg-white/10"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black font-sans flex">
      {/* Left Side - Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 bg-transparent">
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 w-fit"
          data-testid="button-back-login"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver al login</span>
        </button>

        <div className="mb-7 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45" />
          </div>
          <span className="text-base font-bold text-[#06b6d4]">TelqwayAPP</span>
        </div>

        <div className="max-w-md">
          {renderStepIndicator()}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-4" data-testid="error-message">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {testCode && step === "code" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 mb-4" data-testid="test-code-message">
              <KeyRound size={18} />
              <span className="text-sm">Código de prueba: <strong>{testCode}</strong></span>
            </div>
          )}

          {step === "email" && (
            <>
              <div className="mb-5">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-slate-400 text-sm">
                  Ingresa tu correo electrónico y te enviaremos un código de verificación.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@ejemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                      data-testid="input-email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-send-code"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar código"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="mb-5">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">
                  Ingresa el código
                </h1>
                <p className="text-slate-400 text-sm">
                  Hemos enviado un código de 6 dígitos a <span className="text-[#06b6d4]">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Código de verificación</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all text-center tracking-widest font-mono text-lg"
                      data-testid="input-code"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-verify-code"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar código"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                  }}
                  className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
                  data-testid="button-resend-code"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <div className="mb-5">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5">
                  Nueva contraseña
                </h1>
                <p className="text-slate-400 text-sm">
                  Crea una nueva contraseña segura para tu cuenta.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                      data-testid="input-new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className={`flex items-center gap-2 transition-colors ${passwordRequirements.minLength ? 'text-green-400' : 'text-slate-400'
                        }`}>
                        {passwordRequirements.minLength ? <CheckCircle size={14} /> : <Circle size={14} />}
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-slate-400'
                        }`}>
                        {passwordRequirements.hasUpperCase ? <CheckCircle size={14} /> : <Circle size={14} />}
                        <span>Al menos una mayúscula</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordRequirements.hasLowerCase ? 'text-green-400' : 'text-slate-400'
                        }`}>
                        {passwordRequirements.hasLowerCase ? <CheckCircle size={14} /> : <Circle size={14} />}
                        <span>Al menos una minúscula</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-slate-400'
                        }`}>
                        {passwordRequirements.hasNumber ? <CheckCircle size={14} /> : <Circle size={14} />}
                        <span>Al menos un número</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                      data-testid="input-confirm-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs mt-2 transition-colors ${newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {newPassword === confirmPassword ? (
                        <>
                          <CheckCircle size={14} />
                          <span>Las contraseñas coinciden</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} />
                          <span>Las contraseñas no coinciden</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-reset-password"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="w-full py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#06b6d4] text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#06b6d4]/30 active:scale-95"
                data-testid="button-go-login"
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}
        </div>
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
              Recupera el acceso a tu cuenta
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Estamos aquí para ayudarte a volver. Sigue los simples pasos en pantalla
              para restablecer tu contraseña de forma segura y rápida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
