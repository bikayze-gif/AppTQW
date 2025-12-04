import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertBillingSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// Middleware para verificar autenticación
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado", code: "UNAUTHORIZED" });
  }
  // Actualizar última actividad
  req.session.lastActivity = Date.now();
  next();
}

// Middleware para verificar rol específico
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "No autenticado", code: "UNAUTHORIZED" });
    }
    const userRole = req.session.user.perfil?.toLowerCase() || "";
    const hasRole = roles.some(role => userRole.includes(role.toLowerCase()));
    if (!hasRole) {
      return res.status(403).json({ error: "No autorizado para esta acción", code: "FORBIDDEN" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  // POST /api/auth/login - Iniciar sesión
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validar datos de entrada
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Verificar si la cuenta está bloqueada (rate limiting)
      const isLocked = await storage.isAccountLocked(email, ip);
      if (isLocked) {
        await storage.recordLoginAttempt({
          email,
          ip_address: ip,
          user_agent: userAgent,
          success: 0,
          failure_reason: "account_locked",
        });
        return res.status(429).json({
          error: "Cuenta bloqueada temporalmente por múltiples intentos fallidos",
          code: "ACCOUNT_LOCKED",
          retryAfter: 15 * 60, // 15 minutos en segundos
        });
      }

      // Validar credenciales
      const user = await storage.validateCredentials(email, password);

      if (!user) {
        // Registrar intento fallido
        await storage.recordLoginAttempt({
          email,
          ip_address: ip,
          user_agent: userAgent,
          success: 0,
          failure_reason: "invalid_credentials",
        });
        return res.status(401).json({
          error: "Credenciales incorrectas",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Registrar intento exitoso
      await storage.recordLoginAttempt({
        email,
        ip_address: ip,
        user_agent: userAgent,
        success: 1,
        failure_reason: null,
      });

      // Crear token de sesión
      const sessionToken = crypto.randomBytes(32).toString("hex");
      
      // Guardar sesión en base de datos
      await storage.createSession(user.rut, sessionToken);

      // Registrar conexión
      const connectionId = await storage.logConnection(user.rut, "/login", ip);

      // Regenerar ID de sesión para prevenir session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }

        // Guardar datos del usuario en la sesión
        req.session.user = user;
        req.session.loginTime = Date.now();
        req.session.lastActivity = Date.now();
        req.session.connectionId = connectionId;

        // Determinar redirección basada en perfil
        let redirectTo = "/supervisor"; // Por defecto, redirigir a supervisor
        const perfil = user.perfil?.toLowerCase() || "";
        
        // Solo los técnicos residenciales van a period-info
        if (perfil.includes("tecnico") && perfil.includes("residencial")) {
          redirectTo = "/";
        }

        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            rut: user.rut,
            nombre: user.nombre,
            perfil: user.perfil,
            area: user.area,
            zona: user.zona,
          },
          redirectTo,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          details: error.errors,
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // POST /api/auth/logout - Cerrar sesión
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const connectionId = req.session.connectionId;
      
      // Cerrar registro de conexión
      if (connectionId) {
        await storage.closeConnection(connectionId);
      }

      // Destruir sesión
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Error al cerrar sesión" });
        }
        res.clearCookie("tqw_session");
        res.json({ success: true, message: "Sesión cerrada correctamente" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // GET /api/auth/me - Obtener usuario actual
  app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "No autenticado", code: "UNAUTHORIZED" });
    }

    // Actualizar última actividad
    req.session.lastActivity = Date.now();

    res.json({
      user: req.session.user,
      loginTime: req.session.loginTime,
      lastActivity: req.session.lastActivity,
    });
  });

  // GET /api/auth/session-ping - Mantener sesión activa
  app.get("/api/auth/session-ping", (req, res) => {
    if (!req.session.user) {
      return res.json({
        success: true,
        sessionActive: false,
        sessionExpired: true,
      });
    }

    // Actualizar última actividad
    req.session.lastActivity = Date.now();

    // Regenerar ID de sesión periódicamente
    req.session.regenerate((err) => {
      if (err) {
        console.error("Error regenerating session on ping:", err);
      }
    });

    res.json({
      success: true,
      sessionActive: true,
      sessionExpired: false,
      lastActivity: req.session.lastActivity,
    });
  });

  // ============================================
  // TQW COMMISSION ROUTES
  // ============================================

  // TQW Commission API route
  app.get("/api/tqw-comision/:rut/:periodo", async (req, res) => {
    try {
      const { rut, periodo } = req.params;
      const data = await storage.getTqwComisionData(rut, periodo);
      if (!data) {
        return res.status(404).json({ error: "No data found for this RUT and period" });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching TQW commission data:", error);
      res.status(500).json({ error: "Failed to fetch TQW commission data" });
    }
  });

  // Billing API routes
  
  // GET all billing records
  app.get("/api/billing", async (req, res) => {
    try {
      const billing = await storage.getAllBilling();
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing:", error);
      res.status(500).json({ error: "Failed to fetch billing records" });
    }
  });

  // GET single billing record
  app.get("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const billing = await storage.getBillingById(id);
      if (!billing) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing record:", error);
      res.status(500).json({ error: "Failed to fetch billing record" });
    }
  });

  // POST create new billing record
  app.post("/api/billing", async (req, res) => {
    try {
      // Parse and validate the incoming data
      const validatedData = insertBillingSchema.parse(req.body);
      
      // Ensure fecha_gestion is in correct format (YYYY-MM-DD) or null
      const dataToInsert = {
        ...validatedData,
        fecha_gestion: validatedData.fecha_gestion 
          ? validatedData.fecha_gestion.split('T')[0] 
          : null,
      };
      
      const billing = await storage.createBilling(dataToInsert);
      res.status(201).json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid billing data", details: error.errors });
      }
      console.error("Error creating billing:", error);
      res.status(500).json({ error: "Failed to create billing record" });
    }
  });

  // PATCH update billing record
  app.patch("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBillingSchema.partial().parse(req.body);
      
      // Ensure fecha_gestion is in correct format (YYYY-MM-DD) or null
      const dataToUpdate = {
        ...validatedData,
        fecha_gestion: validatedData.fecha_gestion 
          ? validatedData.fecha_gestion.split('T')[0] 
          : validatedData.fecha_gestion === null 
          ? null 
          : undefined,
      };
      
      const billing = await storage.updateBilling(id, dataToUpdate);
      if (!billing) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid billing data", details: error.errors });
      }
      console.error("Error updating billing:", error);
      res.status(500).json({ error: "Failed to update billing record" });
    }
  });

  // DELETE billing record
  app.delete("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBilling(id);
      if (!deleted) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting billing:", error);
      res.status(500).json({ error: "Failed to delete billing record" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
