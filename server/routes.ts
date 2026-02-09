import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertBillingSchema, loginSchema, materialSolicitudRequestSchema, insertNoteSchema, insertNoteLabelSchema } from "@shared/schema";
import { z } from "zod";
import { broadcast } from "./websocket";
import { emailService } from "./services/email";


// Middleware para verificar autenticación
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    console.log(`[AUTH] Request sin autenticación: ${req.method} ${req.path}, Session ID: ${req.sessionID}`);
    return res.status(401).json({ error: "No autenticado", code: "UNAUTHORIZED" });
  }
  // Actualizar última actividad
  req.session.lastActivity = Date.now();
  console.log(`[AUTH] Request autenticado: ${req.session.user.email}, ${req.method} ${req.path}`);
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

// Middleware para validar timeout de inactividad
export function validateSessionTimeout(req: Request, res: Response, next: NextFunction) {
  // Solo validar si hay sesión activa
  if (!req.session.user) {
    return next();
  }

  const now = Date.now();
  const lastActivity = req.session.lastActivity || now;
  const inactiveTime = now - lastActivity;
  const maxInactiveTime = 6 * 60 * 60 * 1000; // 6 horas

  if (inactiveTime > maxInactiveTime) {
    console.log(`[AUTH] Sesión expirada por inactividad: ${req.session.user.email}, Inactivo por: ${Math.floor(inactiveTime / 1000 / 60)} minutos`);

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying expired session:", err);
      }
    });

    return res.status(401).json({
      error: "Sesión expirada por inactividad",
      code: "SESSION_TIMEOUT"
    });
  }

  next();
}

// Middleware para rotar sesión periódicamente (cada hora)
export function rotateSessionIfNeeded(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return next();
  }

  const now = Date.now();
  const lastRotation = req.session.lastRotation || req.session.loginTime || now;
  const rotationInterval = 60 * 60 * 1000; // 1 hora

  if (now - lastRotation > rotationInterval) {
    const oldSessionData = { ...req.session };

    req.session.regenerate((err) => {
      if (err) {
        console.error("Error rotating session:", err);
        return next();
      }

      // Restaurar datos de sesión
      Object.assign(req.session, oldSessionData);
      req.session.lastRotation = now;

      console.log(`[SESSION] Rotated session for user: ${req.session.user?.email || 'unknown'}`);
      next();
    });
  } else {
    next();
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Aplicar validación de timeout y rotación de sesión a todas las rutas API
  app.use('/api/*', validateSessionTimeout, rotateSessionIfNeeded);

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

      // TEMPORAL: Comentado por bloqueos en MySQL
      // Registrar intento exitoso (no bloqueante)
      storage.recordLoginAttempt({
        email,
        ip_address: ip,
        user_agent: userAgent,
        success: 1,
        failure_reason: null,
      }).catch(err => console.error('Error recording login attempt:', err));

      // Crear token de sesión (no bloqueante)
      const sessionToken = crypto.randomBytes(32).toString("hex");
      storage.createSession(user.rut, sessionToken).catch(err => console.error('Error creating session:', err));

      // Registrar conexión (no bloqueante)
      let connectionId = null;
      storage.logConnection(user.rut, "/login", ip).then(id => connectionId = id).catch(err => console.error('Error logging connection:', err));

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

        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session:", saveErr);
          }
          console.log(`[AUTH] Session saved for ${user.email}, ID: ${req.sessionID}`);

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

  // ============================================
  // PASSWORD RESET ROUTES
  // ============================================

  // POST /api/auth/forgot-password - Request password reset code
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email es requerido" });
      }

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Check rate limit (3 requests per 15 minutes)
      const rateLimitExceeded = await storage.checkPasswordResetRateLimit(email);
      if (rateLimitExceeded) {
        await storage.logPasswordResetAttempt(email, 'request_code', false, ip, 'Rate limit exceeded');
        return res.status(429).json({
          error: "Demasiados intentos. Por favor, espera 15 minutos antes de intentar nuevamente.",
          code: "RATE_LIMIT_EXCEEDED"
        });
      }

      // Check user status
      const userStatus = await storage.getUserStatusForReset(email);

      // Always return success to prevent email enumeration
      if (!userStatus.canReset) {
        const reason = !userStatus.exists
          ? 'Email not found'
          : `User not active (Vigente: ${userStatus.vigente})`;

        console.log(`[PASSWORD RESET] Failed for ${email}: ${reason}`);

        await storage.logPasswordResetAttempt(email, 'request_code', false, ip, reason);
        return res.json({
          success: true,
          message: "Si el correo existe, recibirás un código de verificación"
        });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save token to database
      await storage.createPasswordResetToken(email, code, expiresAt, ip, userAgent);

      // Send actual email
      try {
        await emailService.sendPasswordResetCode(email, code);
        console.log(`[PASSWORD RESET] Email enviado exitosamente a: ${email}`);
        await storage.logPasswordResetAttempt(email, 'request_code', true, ip, 'Email sent successfully');
      } catch (mailError) {
        console.error(`[PASSWORD RESET] Error enviando email a ${email}:`, mailError);
        await storage.logPasswordResetAttempt(email, 'request_code', false, ip, `Email send failed: ${mailError}`);
        // We continue because the code is still in the DB,
        // but the user won't receive it unless we log it or handle it.
      }

      // Log the code to console (for testing)
      console.log(`\n========================================`);
      console.log(`[PASSWORD RESET] Código para ${email}: ${code}`);
      console.log(`[PASSWORD RESET] Expira en: 15 minutos`);
      console.log(`========================================\n`);

      res.json({
        success: true,
        message: "Si el correo existe, recibirás un código de verificación"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // POST /api/auth/verify-reset-code - Verify the reset code
  app.post("/api/auth/verify-reset-code", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: "Email y código son requeridos" });
      }

      const ip = req.ip || req.socket.remoteAddress || "unknown";

      // Check current attempts before validation
      const currentAttempts = await storage.getResetCodeAttempts(email, code);

      // Check if max attempts exceeded
      if (currentAttempts >= 5) {
        await storage.invalidateAllPasswordResetTokens(email);
        await storage.logPasswordResetAttempt(email, 'verify_code', false, ip, 'Max attempts exceeded');
        return res.status(400).json({
          error: "Demasiados intentos fallidos. El código ha sido invalidado. Solicita uno nuevo.",
          valid: false,
          code: "MAX_ATTEMPTS_EXCEEDED"
        });
      }

      const isValid = await storage.validatePasswordResetCode(email, code);

      if (!isValid) {
        // Increment attempts on failed validation
        const newAttempts = await storage.incrementResetCodeAttempts(email, code);
        await storage.logPasswordResetAttempt(email, 'verify_code', false, ip, `Invalid code attempt ${newAttempts}/5`);

        const remainingAttempts = 5 - newAttempts;
        return res.status(400).json({
          error: remainingAttempts > 0
            ? `Código inválido o expirado. Te quedan ${remainingAttempts} intentos.`
            : "Código inválido o expirado",
          valid: false,
          remainingAttempts
        });
      }

      // Success - log it
      await storage.logPasswordResetAttempt(email, 'verify_code', true, ip, 'Code verified successfully');

      res.json({
        success: true,
        valid: true,
        message: "Código verificado correctamente"
      });
    } catch (error) {
      console.error("Verify reset code error:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // POST /api/auth/reset-password - Reset password with verified code
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
      }

      // Validate password strength (medium level)
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 8 caracteres",
          requirements: {
            minLength: false,
            hasUpperCase: /[A-Z]/.test(newPassword),
            hasLowerCase: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword)
          }
        });
      }

      const passwordRequirements = {
        minLength: newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(newPassword),
        hasLowerCase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword)
      };

      const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

      if (!allRequirementsMet) {
        return res.status(400).json({
          error: "La contraseña no cumple con los requisitos de seguridad",
          requirements: passwordRequirements
        });
      }

      // Verify code is still valid
      const isValid = await storage.validatePasswordResetCode(email, code);

      if (!isValid) {
        await storage.logPasswordResetAttempt(email, 'reset_password', false, ip, 'Invalid or expired code');
        return res.status(400).json({ error: "Código inválido o expirado" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const updated = await storage.updateUserPassword(email, hashedPassword);

      if (!updated) {
        await storage.logPasswordResetAttempt(email, 'reset_password', false, ip, 'Failed to update password');
        return res.status(400).json({ error: "No se pudo actualizar la contraseña" });
      }

      // Mark code as used
      await storage.markPasswordResetCodeUsed(email, code);

      // Invalidate all other reset tokens for this email
      await storage.invalidateAllPasswordResetTokens(email);

      // Log successful password reset
      await storage.logPasswordResetAttempt(email, 'reset_password', true, ip, 'Password reset successfully');

      console.log(`[PASSWORD RESET] Contraseña actualizada exitosamente para: ${email}`);

      res.json({
        success: true,
        message: "Contraseña actualizada correctamente"
      });
    } catch (error) {
      console.error("Reset password error:", error);
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

    res.json({
      success: true,
      sessionActive: true,
      sessionExpired: false,
      lastActivity: req.session.lastActivity,
    });
  });

  // ============================================
  // TQW COMMISSIONROUTES
  // ============================================

  console.log("[Routes] Registering KPI and Commission endpoints...");

  // KPI Periods API route
  app.get("/api/kpi-periods", async (req, res) => {
    try {
      const periods = await storage.getKpiPeriods();
      res.json(periods);
    } catch (error) {
      console.error("[KPI Periods API] Error:", error);
      res.status(500).json({ error: "Failed to fetch KPI periods" });
    }
  });

  // KPI API route
  app.get("/api/kpi", async (req, res) => {
    try {
      const { period } = req.query;
      console.log(`[KPI API] Request received for period: ${period}`);

      if (!period || typeof period !== "string") {
        return res.status(400).json({ error: "Period parameter is required" });
      }

      const data = await storage.getKpiData(period);
      console.log(`[KPI API] Sending ${data.length} records`);
      res.json(data);
    } catch (error) {
      console.error("[KPI API] Error:", error);
      res.status(500).json({ error: "Failed to fetch KPI data" });
    }
  });

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

  // Monitor Diario Dashboard API route - Trigger rebuild
  app.get("/api/supervisor/monitor-diario", async (req, res) => {
    try {
      console.log("[Monitor Diario API] Request received");
      const data = await storage.getMonitorDiarioDashboard();
      console.log("[Monitor Diario API] Sending dashboard data");
      res.json(data);
    } catch (error) {
      console.error("[Monitor Diario API] Error:", error);
      res.status(500).json({ error: "Failed to fetch monitor diario dashboard data" });
    }
  });

  // POST /api/monitor/refresh - Trigger a real-time refresh for all clients
  app.post("/api/monitor/refresh", async (req, res) => {
    try {
      console.log("[Monitor Refresh API] Received refresh signal");
      broadcast({ type: "refresh", target: "monitor-diario" });
      res.json({ success: true, message: "Broadcast sent" });
    } catch (error) {
      console.error("[Monitor Refresh API] Error:", error);
      res.status(500).json({ error: "Failed to broadcast refresh" });
    }
  });

  // Desafio Tecnico API route
  app.get("/api/supervisor/desafio-tecnico", requireAuth, async (req, res) => {
    try {
      console.log("[Desafio Tecnico API] Request received");
      const data = await storage.getDesafioTecnico();
      console.log("[Desafio Tecnico API] Sending data");
      res.json(data);
    } catch (error) {
      console.error("[Desafio Tecnico API] Error:", error);
      res.status(500).json({ error: "Failed to fetch desafio tecnico data" });
    }
  });

  // KPI Mes Actual Dashboard API route
  app.get("/api/supervisor/kpi-mes-actual", async (req, res) => {
    try {
      const { year, month, equipmentType } = req.query;
      console.log(`[KPI Mes Actual API] Request received for ${year}-${month}, filter: ${equipmentType}`);

      const data = await storage.getKpiMesActualDashboard(
        year ? parseInt(year as string) : undefined,
        month ? parseInt(month as string) : undefined,
        equipmentType as string
      );

      console.log("[KPI Mes Actual API] Sending dashboard data");
      res.json(data);
    } catch (error) {
      console.error("[KPI Mes Actual API] Error:", error);
      res.status(500).json({ error: "Failed to fetch monthly KPI dashboard data" });
    }
  });

  // Detalle OT API routes
  app.get("/api/detalle-ot-periods", async (req, res) => {
    try {
      const periods = await storage.getDetalleOtPeriods();
      res.json(periods);
    } catch (error) {
      console.error("[Detalle OT Periods API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Detalle OT periods" });
    }
  });

  app.get("/api/detalle-ot", async (req, res) => {
    try {
      const { mesContable } = req.query;
      console.log(`[Detalle OT API] Request received for mesContable: ${mesContable}`);

      if (!mesContable || typeof mesContable !== "string") {
        return res.status(400).json({ error: "mesContable parameter is required" });
      }

      const data = await storage.getDetalleOtData(mesContable);
      console.log(`[Detalle OT API] Sending ${data.length} records`);
      res.json(data);
    } catch (error) {
      console.error("[Detalle OT API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Detalle OT data" });
    }
  });

  // ============================================
  // SME ROUTES
  // ============================================

  app.get("/api/sme/activities", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await storage.getSmeActivities(
        startDate as string,
        endDate as string
      );
      res.json(data);
    } catch (error) {
      console.error("[SME Activities API] Error:", error);
      res.status(500).json({ error: "Failed to fetch SME activities" });
    }
  });

  app.get("/api/sme/activities/export", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await storage.getSmeActivities(
        startDate as string,
        endDate as string
      );
      res.json(data);
    } catch (error) {
      console.error("[SME Export API] Error:", error);
      res.status(500).json({ error: "Failed to fetch SME activities for export" });
    }
  });

  app.get("/api/sme/technicians", requireAuth, async (req, res) => {
    try {
      const data = await storage.getSmeTechnicians();
      res.json(data);
    } catch (error) {
      console.error("[SME Technicians API] Error:", error);
      res.status(500).json({ error: "Failed to fetch SME technicians" });
    }
  });

  app.post("/api/sme/activities", requireAuth, async (req, res) => {
    try {
      await storage.createSmeActivity(req.body);
      res.json({ success: true, message: "Activity saved successfully" });
    } catch (error) {
      console.error("[SME Create Activity API] Error:", error);
      res.status(500).json({ error: "Failed to create SME activity" });
    }
  });

  app.get("/api/sme/localidades/:zona", requireAuth, async (req, res) => {
    try {
      const { zona } = req.params;
      const data = await storage.getLocalidadesByZona(zona);
      res.json(data);
    } catch (error) {
      console.error("[SME Localidades API] Error:", error);
      res.status(500).json({ error: "Failed to fetch localidades" });
    }
  });

  // Points Parameters API Route
  app.get("/api/points-parameters", requireAuth, async (req, res) => {
    try {
      const data = await storage.getPointsParameters();
      res.json(data);
    } catch (error) {
      console.error("[Points Parameters API] Error:", error);
      res.status(500).json({ error: "Failed to fetch points parameters" });
    }
  });

  // Update Points Parameter
  app.patch("/api/points-parameters/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const updated = await storage.updatePointsParameter(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Record not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("[Points Parameters Update API] Error:", error);
      res.status(500).json({ error: "Failed to update points parameter" });
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

  // ============================================
  // SUPERVISOR LOGISTICS ROUTES
  // ============================================

  app.get("/api/supervisor/logistica/materiales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      console.log(`Fetching supervisor logistics materials for range: ${startDate} - ${endDate}...`);
      const materials = await storage.getSupervisorLogisticsMaterials(
        startDate as string,
        endDate as string
      );
      console.log(`Returning ${materials.length} grouped tickets`);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching supervisor logistics materials:", error);
      res.status(500).json({ error: "Failed to fetch supervisor logistics materials" });
    }
  });

  app.post("/api/supervisor/logistica/materiales/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(400).json({ error: "Invalid parameters. status must be 'approved' or 'rejected'." });
      }

      const success = await storage.updateLogisticsMaterialStatus(Number(id), status);

      if (success) {
        res.json({ success: true, message: `Status updated to ${status}` });
      } else {
        res.status(500).json({ error: "Failed to update status" });
      }
    } catch (error) {
      console.error("Error updating logistics material status:", error);
      res.status(500).json({ error: "Failed to update logistics material status" });
    }
  });

  // ============================================
  // MATERIALS ROUTES
  // ============================================

  // GET material tipos
  app.get("/api/materials/tipos", async (req, res) => {
    try {
      const tipos = await storage.getMaterialTipos();
      res.json(tipos);
    } catch (error) {
      console.error("Error fetching material tipos:", error);
      res.status(500).json({ error: "Failed to fetch material tipos" });
    }
  });

  // GET material familias filtered by tipo
  app.get("/api/materials/familias/:tipo", async (req, res) => {
    try {
      const { tipo } = req.params;
      const familias = await storage.getMaterialFamilias(decodeURIComponent(tipo));
      res.json(familias);
    } catch (error) {
      console.error("Error fetching material familias:", error);
      res.status(500).json({ error: "Failed to fetch material familias" });
    }
  });

  // GET material subfamilias filtered by tipo and familia
  app.get("/api/materials/subfamilias/:tipo/:familia", async (req, res) => {
    try {
      const { tipo, familia } = req.params;
      const subfamilias = await storage.getMaterialSubfamilias(
        decodeURIComponent(tipo),
        decodeURIComponent(familia)
      );
      res.json(subfamilias);
    } catch (error) {
      console.error("Error fetching material subfamilias:", error);
      res.status(500).json({ error: "Failed to fetch material subfamilias" });
    }
  });

  // GET material items filtered by tipo, familia, and subfamilia
  app.get("/api/materials/items/:tipo/:familia/:subfamilia", async (req, res) => {
    try {
      const { tipo, familia, subfamilia } = req.params;
      const items = await storage.getMaterialItems(
        decodeURIComponent(tipo),
        decodeURIComponent(familia),
        decodeURIComponent(subfamilia)
      );
      res.json(items);
    } catch (error) {
      console.error("Error fetching material items:", error);
      res.status(500).json({ error: "Failed to fetch material items" });
    }
  });

  // GET supervisor logistics material requests
  app.get("/api/supervisor/logistica/materiales", requireAuth, async (req, res) => {
    try {
      console.log("[API] GET /api/supervisor/logistica/materiales - Request received");
      const data = await storage.getSupervisorLogisticsMaterials();
      console.log(`[API] Returning ${data.length} records`);
      res.json(data);
    } catch (error) {
      console.error("[API] Error fetching supervisor logistics materials:", error);
      res.status(500).json({ error: "Failed to fetch supervisor logistics materials" });
    }
  });

  // ============================================
  // ACTIVITY ROUTES
  // ============================================

  // GET activity chart data
  app.get("/api/activity/chart", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      console.log(`[Activity Chart] User RUT from session: ${rut}, User email: ${req.session.user?.email}`);
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const daysNum = parseInt(req.query.days as string) || 30;
      const period = req.query.period as string;
      const endDate = new Date();
      let startDate = new Date();

      if (period && period.length === 6) {
        // Si hay un periodo específico (ej: 202601), calcular desde el 25 del mes anterior al 24 de ese mes
        const year = parseInt(period.substring(0, 4));
        const month = parseInt(period.substring(4, 6)) - 1; // 0-indexed

        startDate = new Date(year, month - 1, 25);
        endDate.setFullYear(year);
        endDate.setMonth(month);
        endDate.setDate(24);
      } else if (daysNum === 30) {
        // Lógica existente para "Mes completo" relativo a hoy
        const currentDay = endDate.getDate();
        const currentMonth = endDate.getMonth();
        const currentYear = endDate.getFullYear();

        if (currentDay < 25) {
          startDate = new Date(currentYear, currentMonth - 1, 25);
          endDate.setDate(24);
        } else {
          startDate = new Date(currentYear, currentMonth, 25);
          const nextDate = new Date(endDate);
          nextDate.setMonth(currentMonth + 1);
          nextDate.setDate(24);
          endDate.setTime(nextDate.getTime());
        }
      } else {
        startDate.setDate(endDate.getDate() - daysNum);
      }

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      console.log(`[Activity Chart] Range: ${formatDate(startDate)} to ${formatDate(endDate)} for RUT: ${rut}`);

      const data = await storage.getActivityChartData(
        rut,
        formatDate(startDate),
        formatDate(endDate)
      );

      res.json(data);
    } catch (error) {
      console.error("Error fetching activity chart data:", error);
      res.status(500).json({ error: "Error al obtener datos del gráfico" });
    }
  });

  // GET activity table data
  app.get("/api/activity/table", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      console.log(`[Activity Table] User RUT from session: ${rut}, User email: ${req.session.user?.email}`);
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const daysNum = parseInt(req.query.days as string) || 30;
      const period = req.query.period as string;
      const endDate = new Date();
      let startDate = new Date();

      if (period && period.length === 6) {
        // Periodo específico (25 del mes anterior al 24 del mes seleccionado)
        const year = parseInt(period.substring(0, 4));
        const month = parseInt(period.substring(4, 6)) - 1;

        startDate = new Date(year, month - 1, 25);
        endDate.setFullYear(year);
        endDate.setMonth(month);
        endDate.setDate(24);
      } else if (daysNum === 30) {
        const currentDay = endDate.getDate();
        const currentMonth = endDate.getMonth();
        const currentYear = endDate.getFullYear();

        if (currentDay < 25) {
          startDate = new Date(currentYear, currentMonth - 1, 25);
          endDate.setDate(24);
        } else {
          startDate = new Date(currentYear, currentMonth, 25);
          const nextDate = new Date(endDate);
          nextDate.setMonth(currentMonth + 1);
          nextDate.setDate(24);
          endDate.setTime(nextDate.getTime());
        }
      } else {
        startDate.setDate(endDate.getDate() - daysNum);
      }

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      console.log(`[Activity Table] Range: ${formatDate(startDate)} to ${formatDate(endDate)} for RUT: ${rut}`);

      const data = await storage.getActivityTableData(
        rut,
        formatDate(startDate),
        formatDate(endDate)
      );

      res.json(data);
    } catch (error) {
      console.error("Error fetching activity table data:", error);
      res.status(500).json({ error: "Error al obtener datos de la tabla" });
    }
  });

  // GET order details for a specific date
  app.get("/api/activity/details/:fecha", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { fecha } = req.params;
      const data = await storage.getOrderDetails(fecha, rut);

      res.json({
        success: true,
        fecha,
        totalRegistros: data.length,
        detalles: data,
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ error: "Error al obtener detalles de órdenes" });
    }
  });

  // GET activity export data for a specific period
  app.get("/api/activity/export-excel", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const period = req.query.period as string;
      if (!period) {
        return res.status(400).json({ error: "Period parameter is required" });
      }

      console.log(`[Export API] Requesting export data for RUT: ${rut}, period: ${period}`);
      const data = await storage.getExportData(rut, period);
      console.log(`[Export API] Found ${data.length} records`);

      res.json(data);
    } catch (error) {
      console.error("Error fetching export data:", error);
      res.status(500).json({ error: "Error al obtener datos para exportación" });
    }
  });

  // POST create material solicitud
  // GET material solicitudes
  app.get("/api/materials/solicitudes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      const solicitudes = await storage.getMaterialSolicitudes(userId);
      res.json(solicitudes);
    } catch (error) {
      console.error("Error fetching material solicitudes:", error);
      res.status(500).json({ error: "No se pudieron obtener las solicitudes" });
    }
  });

  app.get("/api/materials/technicians", requireAuth, async (req, res) => {
    try {
      const techs = await storage.getTechnicians();
      res.json(techs);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ error: "No se pudieron obtener los técnicos" });
    }
  });

  app.post("/api/materials/solicitud", requireAuth, async (req, res) => {
    try {
      console.log('[Material Solicitud API] ========== NEW REQUEST ==========');
      console.log('[Material Solicitud API] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Material Solicitud API] User session:', {
        id: req.session.user?.id,
        email: req.session.user?.email,
        rut: req.session.user?.rut
      });

      const validatedData = materialSolicitudRequestSchema.parse(req.body);
      console.log('[Material Solicitud API] Data validated successfully');

      const { id_destino, id_supervisor, items } = validatedData;

      // Obtener el ID del usuario desde la sesión autenticada (más seguro que confiar en el cliente)
      const id_usuario = req.session.user?.id;

      if (!id_usuario) {
        console.error('[Material Solicitud API] No user ID in session');
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      console.log('[Material Solicitud API] User ID from session:', id_usuario);

      // Validar permisos del usuario
      const userPerfil2 = await storage.getUserPerfil2(id_usuario);
      console.log('[Material Solicitud API] User perfil2:', userPerfil2);

      // Validar permisos del supervisor si se proporciona
      let supervisorPerfil2: string | null = null;
      if (id_supervisor) {
        supervisorPerfil2 = await storage.getUserPerfil2(id_supervisor);
        console.log('[Material Solicitud API] Supervisor perfil2:', supervisorPerfil2);
      }

      // Determinar flags basados en perfil2 según lógica PHP
      // Si existe perfil2 del usuario o del supervisor, se activa el flujo regional
      const effectivePerfil2 = userPerfil2 || supervisorPerfil2;
      const flag_regiones = effectivePerfil2 ? effectivePerfil2 : "No";
      const flag_gestion_supervisor = effectivePerfil2 ? 1 : 0;

      console.log('[Material Solicitud API] Flags calculated:', {
        flag_regiones,
        flag_gestion_supervisor
      });

      // Generar ticket único de 8 caracteres
      const ticket = crypto.randomBytes(4).toString('hex');
      console.log('[Material Solicitud API] Generated ticket:', ticket);

      const insertedIds: number[] = [];

      // Insertar cada item del carrito
      console.log(`[Material Solicitud API] Processing ${items.length} items...`);
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        console.log(`[Material Solicitud API] Processing item ${index + 1}/${items.length}:`, item);

        // Obtener el código del item
        let campo_item = item.item || item.itemCode || "";

        // Si no tiene código, intentar buscarlo por descripción
        if (!campo_item && item.material) {
          console.log(`[Material Solicitud API] No item code, searching by description: ${item.material}`);
          const foundCode = await storage.getItemCodeByDescription(item.material);
          if (foundCode) {
            campo_item = foundCode;
            console.log(`[Material Solicitud API] Found item code: ${foundCode}`);
          } else {
            console.log(`[Material Solicitud API] No item code found for description`);
          }
        }

        // Asegurarse de que id_usuario es un número válido
        const tecnicoId = Number(id_usuario);
        if (isNaN(tecnicoId) || tecnicoId <= 0) {
          console.error(`[Material Solicitud API] Invalid user ID: ${id_usuario}`);
          throw new Error(`ID de usuario inválido: ${id_usuario}`);
        }

        const insertData = {
          material: item.material,
          cantidad: item.cantidad,
          tecnico: tecnicoId,
          id_tecnico_traspaso: id_destino || 0,
          ticket,
          flag_regiones,
          flag_gestion_supervisor,
          campo_item,
        };

        console.log(`[Material Solicitud API] Attempting to insert item ${index + 1}:`, insertData);

        try {
          const insertId = await storage.createMaterialSolicitud(insertData);
          insertedIds.push(insertId);
          console.log(`[Material Solicitud API] Item ${index + 1} inserted successfully with ID: ${insertId}`);
        } catch (itemError: any) {
          console.error(`[Material Solicitud API] Failed to insert item ${index + 1}:`, itemError);
          throw itemError;
        }
      }

      console.log('[Material Solicitud API] All items inserted successfully:', insertedIds);

      res.status(201).json({
        success: true,
        message: `Solicitud creada exitosamente con ${insertedIds.length} items`,
        ticket,
        insertedIds,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[Material Solicitud API] Validation error:', error.errors);
        return res.status(400).json({
          error: "Datos de solicitud inválidos",
          details: error.errors
        });
      }
      console.error("[Material Solicitud API] Unexpected error:", error);
      console.error("[Material Solicitud API] Error stack:", (error as Error).stack);
      res.status(500).json({
        error: "Error al crear la solicitud de materiales",
        message: (error as Error).message
      });
    }
  });

  // ============================================
  // CALIDAD REACTIVA ENDPOINTS
  // ============================================

  // GET calidad reactiva summary (chart and table data)
  app.get("/api/calidad-reactiva/summary", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      console.log(`[Calidad API] User from session - RUT: ${rut}, Email: ${req.session.user?.email}, ID: ${req.session.user?.id}`);
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const months = parseInt(req.query.months as string) || 12;
      console.log(`[Calidad API] Querying data for RUT: ${rut}, months: ${months}`);
      const data = await storage.getCalidadReactivaSummary(rut, months);

      console.log(`[Calidad API] Summary requested for RUT: ${rut}, Records found: ${data.length}`);

      res.json({
        data,
        rut,
        debug_info: `Querying for RUT: ${rut}`
      });
    } catch (error) {
      console.error("Error fetching calidad reactiva summary:", error);
      res.status(500).json({ error: "Error al obtener datos de calidad reactiva" });
    }
  });

  // GET calidad reactiva details for a specific month
  app.get("/api/calidad-reactiva/details/:mesContable", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { mesContable } = req.params;
      const data = await storage.getCalidadReactivaDetails(rut, mesContable);

      const cumple = data.filter(d => d.CALIDAD_30 === '0').length;
      const noCumple = data.filter(d => d.CALIDAD_30 === '1').length;
      const hfc = data.filter(d => d.TIPO_RED === 'HFC');
      const ftth = data.filter(d => ['FTTH', 'DUAL'].includes(d.TIPO_RED));

      res.json({
        success: true,
        mesContable,
        totalRegistros: data.length,
        resumen: {
          total: data.length,
          cumple,
          noCumple,
          eficiencia: data.length > 0 ? Math.round((cumple / data.length) * 10000) / 100 : 0,
          hfc: {
            total: hfc.length,
            cumple: hfc.filter(d => d.CALIDAD_30 === '0').length,
            noCumple: hfc.filter(d => d.CALIDAD_30 === '1').length,
          },
          ftth: {
            total: ftth.length,
            cumple: ftth.filter(d => d.CALIDAD_30 === '0').length,
            noCumple: ftth.filter(d => d.CALIDAD_30 === '1').length,
          },
        },
        detalles: data,
      });
    } catch (error) {
      console.error("Error fetching calidad reactiva details:", error);
      res.status(500).json({ error: "Error al obtener detalles de calidad reactiva" });
    }
  });

  // GET calidad reactiva export data for Excel
  app.get("/api/calidad-reactiva/export-excel/:mesContable", requireAuth, async (req, res) => {
    try {
      const rut = req.session.user?.rut;
      if (!rut) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { mesContable } = req.params;
      console.log(`[Calidad Export] Requesting export data for RUT: ${rut}, Mes: ${mesContable}`);

      const data = await storage.getCalidadReactivaExportData(rut, mesContable);
      console.log(`[Calidad Export] Found ${data.length} records`);

      res.json(data);
    } catch (error) {
      console.error("Error fetching calidad reactiva export data:", error);
      res.status(500).json({ error: "Error al obtener datos para exportación" });
    }
  });

  // GET /api/calidad-tqw/periods
  app.get("/api/calidad-tqw/periods", requireAuth, async (req, res) => {
    try {
      const periods = await storage.getCalidadTqwPeriods();
      res.json(periods);
    } catch (error) {
      console.error("[Calidad TQW Periods API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Calidad TQW periods" });
    }
  });

  // GET /api/calidad-tqw/data/:mesContable
  app.get("/api/calidad-tqw/data/:mesContable", requireAuth, async (req, res) => {
    try {
      const { mesContable } = req.params;
      if (!mesContable) {
        return res.status(400).json({ error: "mesContable parameter is required" });
      }
      const data = await storage.getCalidadTqwData(mesContable);
      res.json(data);
    } catch (error) {
      console.error("[Calidad TQW Data API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Calidad TQW data" });
    }
  });

  // GET /api/calidad-tqw/monthly-stats
  app.get("/api/calidad-tqw/monthly-stats", requireAuth, async (req, res) => {
    try {
      const data = await storage.getCalidadMonthlyStats();
      res.json(data);
    } catch (error) {
      console.error("[Calidad TQW Monthly Stats API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Calidad TQW monthly stats" });
    }
  });

  // GET /api/calidad-tqw/evolution
  app.get("/api/calidad-tqw/evolution", requireAuth, async (req, res) => {
    try {
      const data = await storage.getCalidadEvolution2025();
      res.json(data);
    } catch (error) {
      console.error("[Calidad TQW Evolution API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Calidad TQW evolution data" });
    }
  });

  // GET /api/benchmark/data
  app.get("/api/benchmark/data", requireAuth, async (req, res) => {
    try {
      const data = await storage.getBenchmarkData();
      res.json(data);
    } catch (error) {
      console.error("[Benchmark Data API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Benchmark data" });
    }
  });


  // ============================================
  // SIDEBAR PERMISSIONS ROUTES
  // ============================================

  app.get("/api/sidebar-permissions", requireAuth, async (req, res) => {
    try {
      const permissions = await storage.getAllSidebarPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("[Sidebar Permissions API] Error:", error);
      res.status(500).json({ error: "Failed to fetch all permissions" });
    }
  });

  app.get("/api/sidebar-permissions/:profile", requireAuth, async (req, res) => {
    try {
      const { profile } = req.params;
      const permissions = await storage.getSidebarPermissions(profile);
      res.json(permissions);
    } catch (error) {
      console.error("[Sidebar Permissions API] Error:", error);
      res.status(500).json({ error: "Failed to fetch permissions for profile" });
    }
  });

  app.post("/api/sidebar-permissions", requireRole("admin", "supervisor", "logistica", "bodega", "gerencia"), async (req, res) => {
    try {
      const { profile, allowedItems } = req.body;
      if (!profile || !Array.isArray(allowedItems)) {
        return res.status(400).json({ error: "Invalid data" });
      }
      const updated = await storage.updateSidebarPermissions(profile, allowedItems);
      res.json(updated);
    } catch (error) {
      console.error("[Sidebar Permissions API] Error:", error);
      res.status(500).json({ error: "Failed to update permissions" });
    }
  });

  // ============================================
  // NOTIFICATION ROUTES
  // ============================================

  // GET all notifications (admin view)
  app.get("/api/notifications", requireRole("admin", "gerencia"), async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const notifications = await storage.getNotifications(includeInactive);
      res.json(notifications);
    } catch (error) {
      console.error("[Notifications API] Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // GET notifications for current user
  app.get("/api/notifications/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const profile = req.session.user?.perfil;

      if (!userId || !profile) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const notifications = await storage.getNotificationsByProfile(profile, userId);
      res.json(notifications);
    } catch (error) {
      console.error("[Notifications API] Error fetching user notifications:", error);
      res.status(500).json({ error: "Failed to fetch user notifications" });
    }
  });

  // GET unread count for current user
  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const count = await storage.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("[Notifications API] Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // POST create new notification
  app.post("/api/notifications", requireRole("admin", "gerencia"), async (req, res) => {
    try {
      const { title, content, priority, profiles, expiresAt } = req.body;
      const createdBy = req.session.user?.id;

      if (!createdBy) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (!title || !content || !profiles || !Array.isArray(profiles)) {
        return res.status(400).json({ error: "Datos inválidos. title, content y profiles son requeridos." });
      }

      const notificationId = await storage.createNotification({
        title,
        content,
        priority: priority || "info",
        profiles,
        expiresAt,
        createdBy,
      });

      // Broadcast notification to all connected clients
      const { broadcastNotification } = await import("./websocket");
      broadcastNotification({
        id: notificationId,
        title,
        content,
        priority: priority || "info",
        createdAt: new Date().toISOString(),
      }, profiles);

      res.status(201).json({ success: true, id: notificationId });
    } catch (error) {
      console.error("[Notifications API] Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // PUT update notification
  app.put("/api/notifications/:id", requireRole("admin", "gerencia"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const { title, content, priority, expiresAt, isActive } = req.body;

      const updated = await storage.updateNotification(id, {
        title,
        content,
        priority,
        expiresAt,
        isActive,
      });

      if (!updated) {
        return res.status(404).json({ error: "Notificación no encontrada" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Notifications API] Error updating notification:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // DELETE notification
  app.delete("/api/notifications/:id", requireRole("admin", "gerencia"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ error: "Notificación no encontrada" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Notifications API] Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // POST mark notification as read
  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.session.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (isNaN(notificationId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("[Notifications API] Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // POST mark all notifications as read
  app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      await storage.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("[Notifications API] Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // ============================================
  // USER MANAGEMENT ROUTES
  // ============================================

  app.get("/api/users-tqw", requireRole("admin", "gerencia", "supervisor"), async (req, res) => {
    try {
      const users = await storage.getUsersTQW();
      res.json(users);
    } catch (error) {
      console.error("[Users TQW API] Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ============================================
  // LOGISTICS ROUTES
  // ============================================

  app.get("/api/supervisor/logistica/maestro-toa-paso", requireRole("supervisor", "admin", "gerencia", "logistica"), async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "id";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const result = await storage.getMaestroToaPaso(page, limit, search, sortBy, sortOrder);
      res.json(result);
    } catch (error) {
      console.error("[Maestro Toa Paso API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Maestro Toa Paso data" });
    }
  });

  app.get("/api/supervisor/logistica/maestro-toa-paso/stats", requireRole("supervisor", "admin", "gerencia", "logistica"), async (req, res) => {
    try {
      const stats = await storage.getMaestroToaPasoStats();
      res.json(stats);
    } catch (error) {
      console.error("[Maestro Toa Paso Stats API] Error:", error);
      res.status(500).json({ error: "Failed to fetch Maestro Toa Paso stats" });
    }
  });

  // ============================================
  // NOTES ROUTES
  // ============================================

  // GET all notes for the authenticated user
  app.get("/api/notes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const { category, archived, search } = req.query;
      const notes = await storage.getNotesByUser(userId, {
        category: category as string,
        archived: archived === "true" ? true : archived === "false" ? false : undefined,
        search: search as string,
      });
      res.json(notes);
    } catch (error) {
      console.error("[Notes API] Error fetching notes:", error);
      res.status(500).json({ error: "Error al obtener notas" });
    }
  });

  // GET single note by ID
  app.get("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const note = await storage.getNoteById(id, userId);
      if (!note) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json(note);
    } catch (error) {
      console.error("[Notes API] Error fetching note:", error);
      res.status(500).json({ error: "Error al obtener nota" });
    }
  });

  // POST create new note
  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      console.log("[Notes API] POST body:", JSON.stringify(req.body));
      console.log("[Notes API] userId from session:", userId);

      const dataToValidate = {
        ...req.body,
        userId,
      };
      console.log("[Notes API] Data to validate:", JSON.stringify(dataToValidate));

      const validatedData = insertNoteSchema.parse(dataToValidate);
      console.log("[Notes API] Validated data:", JSON.stringify(validatedData));

      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[Notes API] Zod validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      console.error("[Notes API] Error creating note:", error);
      res.status(500).json({ error: "Error al crear nota" });
    }
  });

  // PATCH update note
  app.patch("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const validatedData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, userId, validatedData);
      if (!note) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      console.error("[Notes API] Error updating note:", error);
      res.status(500).json({ error: "Error al actualizar nota" });
    }
  });

  // DELETE note
  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const deleted = await storage.deleteNote(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Notes API] Error deleting note:", error);
      res.status(500).json({ error: "Error al eliminar nota" });
    }
  });

  // PATCH toggle archive note
  app.patch("/api/notes/:id/archive", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const note = await storage.toggleArchiveNote(id, userId);
      if (!note) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json(note);
    } catch (error) {
      console.error("[Notes API] Error toggling archive:", error);
      res.status(500).json({ error: "Error al archivar nota" });
    }
  });

  // PATCH toggle pin note
  app.patch("/api/notes/:id/pin", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const note = await storage.togglePinNote(id, userId);
      if (!note) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json(note);
    } catch (error) {
      console.error("[Notes API] Error toggling pin:", error);
      res.status(500).json({ error: "Error al fijar nota" });
    }
  });

  // GET user note labels
  app.get("/api/notes/labels/list", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const labels = await storage.getUserNoteLabels(userId);
      res.json(labels);
    } catch (error) {
      console.error("[Notes API] Error fetching labels:", error);
      res.status(500).json({ error: "Error al obtener etiquetas" });
    }
  });

  // POST create note label
  app.post("/api/notes/labels", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const validatedData = insertNoteLabelSchema.parse({
        ...req.body,
        userId,
      });

      const label = await storage.createNoteLabel(validatedData);
      res.status(201).json(label);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      console.error("[Notes API] Error creating label:", error);
      res.status(500).json({ error: "Error al crear etiqueta" });
    }
  });

  // DELETE note label
  app.delete("/api/notes/labels/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const deleted = await storage.deleteNoteLabel(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Etiqueta no encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Notes API] Error deleting label:", error);
      res.status(500).json({ error: "Error al eliminar etiqueta" });
    }
  });

  // ============================================
  // ENDPOINTS DE TURNOS (tb_turnos_py)
  // ============================================

  // Obtener meses disponibles
  app.get("/api/supervisor/turnos/meses", requireAuth, async (req, res) => {
    try {
      const meses = await storage.getTurnosPyMesesDisponibles();
      res.json(meses);
    } catch (error) {
      console.error("Error al obtener meses disponibles:", error);
      res.status(500).json({ error: "Error al obtener meses disponibles" });
    }
  });

  // Obtener turnos por mes
  app.get("/api/supervisor/turnos/:mes", requireAuth, async (req, res) => {
    try {
      const { mes } = req.params;

      // Validar formato del mes (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(mes)) {
        return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
      }

      const turnos = await storage.getTurnosPyPorMes(mes);
      res.json(turnos);
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      res.status(500).json({ error: "Error al obtener turnos" });
    }
  });

  // Obtener estadísticas de turnos por mes
  app.get("/api/supervisor/turnos/:mes/estadisticas", requireAuth, async (req, res) => {
    try {
      const { mes } = req.params;

      if (!/^\d{4}-\d{2}$/.test(mes)) {
        return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
      }

      const estadisticas = await storage.getTurnosPyEstadisticas(mes);
      res.json(estadisticas);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  // Obtener última actualización de turnos desde auditoría
  app.get("/api/supervisor/turnos/auditoria/ultima", requireAuth, async (req, res) => {
    try {
      const ultimaActualizacion = await storage.getUltimaActualizacionTurnos();
      res.json(ultimaActualizacion);
    } catch (error) {
      console.error("Error al obtener última actualización:", error);
      res.status(500).json({ error: "Error al obtener última actualización" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}