import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";

export interface AuthUser {
  id: number;
  email: string;
  rut: string;
  nombre: string;
  perfil: string;
  area: string | null;
  zona: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_PING_INTERVAL = 5 * 60 * 1000; // 5 minutos
const INACTIVITY_WARNING_MS = 25 * 60 * 1000; // 25 minutos → mostrar advertencia
const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000;  // 30 minutos → auto-logout
const ACTIVITY_THROTTLE_MS = 30 * 1000;        // Throttle de detección: cada 30s

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(300); // 5 minutos en segundos
  const [, setLocation] = useLocation();
  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<boolean>(false);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showInactivityWarning) {
      setShowInactivityWarning(false);
      setWarningCountdown(300);
    }
  }, [showInactivityWarning]);

  const checkSession = useCallback(async () => {
    console.log("[AUTH] checkSession iniciado", new Date().toISOString());
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[AUTH] Sesión válida encontrada para: ${data.user.email}`);
        setUser(data.user);
      } else {
        console.warn(`[AUTH] checkSession falló: ${response.status} ${response.statusText}`);
        setUser(null);
      }
    } catch (error) {
      console.error("[AUTH] Error checking session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log("[AUTH] checkSession completado");
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Error al iniciar sesión",
        };
      }

      setUser(data.user);
      lastActivityRef.current = Date.now();
      return {
        success: true,
        redirectTo: data.redirectTo,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Error de conexión. Intente nuevamente.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setShowInactivityWarning(false);
      setUser(null);
      setLocation("/login");
    }
  };

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Cerrar sesión al cerrar pestaña/browser
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      // sendBeacon es fire-and-forget: envía el request aunque el tab se cierre
      navigator.sendBeacon("/api/auth/logout");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Ping de sesión periódico para mantenerla activa
  useEffect(() => {
    if (!user) {
      console.log("[AUTH] Session ping deshabilitado - no hay usuario");
      return;
    }

    console.log(`[AUTH] Session ping habilitado para: ${user.email} (intervalo: ${SESSION_PING_INTERVAL / 1000}s)`);

    const pingSession = async () => {
      try {
        console.log(`[AUTH] Enviando ping de sesión para: ${user.email}`);
        const response = await fetch("/api/auth/session-ping", {
          credentials: "include",
        });
        const data = await response.json();

        if (data.sessionKicked) {
          console.warn("[AUTH] Sesión cerrada por inicio en otro dispositivo");
          setShowInactivityWarning(false);
          setUser(null);
          setLocation("/login");
          alert("Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.");
        } else if (data.sessionExpired) {
          console.warn("[AUTH] Sesión expirada detectada por ping, redirigiendo a login");
          setUser(null);
          setLocation("/login");
        } else if (data.sessionActive) {
          console.log("[AUTH] Ping exitoso - sesión activa");
        } else {
          console.warn("[AUTH] Ping retornó sessionActive=false");
        }
      } catch (error) {
        console.error("[AUTH] Session ping error:", error);
      }
    };

    const interval = setInterval(pingSession, SESSION_PING_INTERVAL);
    return () => {
      console.log("[AUTH] Session ping cleanup");
      clearInterval(interval);
    };
  }, [user, setLocation]);

  // Detección de actividad del usuario (throttled)
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      if (throttleRef.current) return;
      throttleRef.current = true;
      lastActivityRef.current = Date.now();

      if (showInactivityWarning) {
        setShowInactivityWarning(false);
        setWarningCountdown(300);
        console.log("[AUTH] Actividad detectada, advertencia de inactividad cancelada");
      }

      setTimeout(() => { throttleRef.current = false; }, ACTIVITY_THROTTLE_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user, showInactivityWarning]);

  // Timer de inactividad: revisa cada 30s
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= INACTIVITY_LOGOUT_MS) {
        console.log(`[AUTH] Auto-logout por inactividad (${Math.floor(elapsed / 60000)}min)`);
        logout();
        return;
      }

      if (elapsed >= INACTIVITY_WARNING_MS && !showInactivityWarning) {
        console.log(`[AUTH] Mostrando advertencia de inactividad (${Math.floor(elapsed / 60000)}min)`);
        setShowInactivityWarning(true);
        setWarningCountdown(Math.max(0, Math.floor((INACTIVITY_LOGOUT_MS - elapsed) / 1000)));
      }
    };

    const interval = setInterval(checkInactivity, 30000);
    return () => clearInterval(interval);
  }, [user, showInactivityWarning]);

  // Countdown del modal de advertencia
  useEffect(() => {
    if (!showInactivityWarning) return;

    const countdown = setInterval(() => {
      setWarningCountdown(prev => {
        if (prev <= 1) {
          console.log("[AUTH] Countdown expirado, ejecutando auto-logout");
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showInactivityWarning]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession,
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Modal de advertencia de inactividad */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Sesión por expirar
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Tu sesión se cerrará automáticamente por inactividad en:
              </p>
              <div className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400 mb-6">
                {formatCountdown(warningCountdown)}
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    resetInactivityTimer();
                    console.log("[AUTH] Usuario confirmó continuar sesión");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continuar Sesión
                </button>
                <button
                  onClick={() => logout()}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[ProtectedRoute] Usuario no autenticado, redirigiendo a /login");
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Mostrar loading mientras se verifica sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Verificando sesión...</div>
      </div>
    );
  }

  // No renderizar children si no está autenticado
  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Bloqueando render - no autenticado");
    return null;
  }

  console.log(`[ProtectedRoute] Renderizando contenido protegido para: ${user?.email}`);
  return <>{children}</>;
}
