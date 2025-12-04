import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
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
      setUser(null);
      setLocation("/login");
    }
  };

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Ping de sesión periódico para mantenerla activa
  useEffect(() => {
    if (!user) return;

    const pingSession = async () => {
      try {
        const response = await fetch("/api/auth/session-ping", {
          credentials: "include",
        });
        const data = await response.json();

        if (data.sessionExpired) {
          setUser(null);
          setLocation("/login");
        }
      } catch (error) {
        console.error("Session ping error:", error);
      }
    };

    const interval = setInterval(pingSession, SESSION_PING_INTERVAL);
    return () => clearInterval(interval);
  }, [user, setLocation]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Verificando sesión...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
