import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { insertBillingSchema, loginSchema, materialSolicitudRequestSchema } from "@shared/schema";
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

      // Check if user exists
      const userExists = await storage.getUserEmailExists(email);

      // Always return success to prevent email enumeration
      if (!userExists) {
        console.log(`[PASSWORD RESET] Email not found: ${email}`);
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

      // Log the code to console (for testing - replace with email service later)
      console.log(`\n========================================`);
      console.log(`[PASSWORD RESET] Código para ${email}: ${code}`);
      console.log(`[PASSWORD RESET] Expira en: 15 minutos`);
      console.log(`========================================\n`);

      res.json({
        success: true,
        message: "Si el correo existe, recibirás un código de verificación",
        // For testing only - remove in production
        ...(process.env.NODE_ENV === 'development' && { testCode: code })
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

      const isValid = await storage.validatePasswordResetCode(email, code);

      if (!isValid) {
        return res.status(400).json({
          error: "Código inválido o expirado",
          valid: false
        });
      }

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

      // Verify code is still valid
      const isValid = await storage.validatePasswordResetCode(email, code);

      if (!isValid) {
        return res.status(400).json({ error: "Código inválido o expirado" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const updated = await storage.updateUserPassword(email, hashedPassword);

      if (!updated) {
        return res.status(400).json({ error: "No se pudo actualizar la contraseña" });
      }

      // Mark code as used
      await storage.markPasswordResetCodeUsed(email, code);

      // Invalidate all other reset tokens for this email
      await storage.invalidateAllPasswordResetTokens(email);

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
      const endDate = new Date();
      let startDate = new Date();

      // Si es mes completo (30 días), ajustar para que sea desde día 25 del mes anterior
      if (daysNum === 30) {
        const currentDay = endDate.getDate();
        const currentMonth = endDate.getMonth();
        const currentYear = endDate.getFullYear();

        // Si estamos antes del día 25, el mes completo es desde 25 del mes antepasado
        if (currentDay < 25) {
          startDate = new Date(currentYear, currentMonth - 1, 25);
          endDate.setDate(24);
        } else {
          // Si estamos después del día 25, el mes completo es desde 25 del mes pasado
          startDate = new Date(currentYear, currentMonth, 25);
          endDate.setMonth(currentMonth + 1);
          endDate.setDate(24);
        }
      } else {
        startDate.setDate(endDate.getDate() - daysNum);
      }

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

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
      const endDate = new Date();
      let startDate = new Date();

      // Si es mes completo (30 días), ajustar para que sea desde día 25 del mes anterior
      if (daysNum === 30) {
        const currentDay = endDate.getDate();
        const currentMonth = endDate.getMonth();
        const currentYear = endDate.getFullYear();

        // Si estamos antes del día 25, el mes completo es desde 25 del mes antepasado
        if (currentDay < 25) {
          startDate = new Date(currentYear, currentMonth - 1, 25);
          endDate.setDate(24);
        } else {
          // Si estamos después del día 25, el mes completo es desde 25 del mes pasado
          startDate = new Date(currentYear, currentMonth, 25);
          endDate.setMonth(currentMonth + 1);
          endDate.setDate(24);
        }
      } else {
        startDate.setDate(endDate.getDate() - daysNum);
      }

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

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
      const period = req.query.period as string;
      if (!period) {
        return res.status(400).json({ error: "Period parameter is required" });
      }

      console.log(`[Export API] Requesting export data for period: ${period}`);
      const data = await storage.getExportData(period);
      console.log(`[Export API] Found ${data.length} records`);

      res.json(data);
    } catch (error) {
      console.error("Error fetching export data:", error);
      res.status(500).json({ error: "Error al obtener datos para exportación" });
    }
  });

  // POST create material solicitud
  app.post("/api/materials/solicitud", requireAuth, async (req, res) => {
    try {
      const validatedData = materialSolicitudRequestSchema.parse(req.body);
      const { id_destino, id_supervisor, items } = validatedData;

      // Obtener el ID del usuario desde la sesión autenticada (más seguro que confiar en el cliente)
      const id_usuario = req.session.user?.id;

      if (!id_usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // Validar permisos del usuario
      const userPerfil2 = await storage.getUserPerfil2(id_usuario);

      // Validar permisos del supervisor si se proporciona
      let supervisorPerfil2: string | null = null;
      if (id_supervisor) {
        supervisorPerfil2 = await storage.getUserPerfil2(id_supervisor);
      }

      // Determinar flags basados en perfil2
      const flag_regiones = userPerfil2 ? "flag_regiones" : "No";
      const flag_gestion_supervisor = userPerfil2 ? 1 : 0;

      // Generar ticket único de 8 caracteres
      const ticket = crypto.randomBytes(4).toString('hex');

      const insertedIds: number[] = [];

      // Insertar cada item del carrito
      for (const item of items) {
        // Obtener el código del item
        let campo_item = item.item || item.itemCode || "";

        // Si no tiene código, intentar buscarlo por descripción
        if (!campo_item && item.material) {
          const foundCode = await storage.getItemCodeByDescription(item.material);
          if (foundCode) {
            campo_item = foundCode;
          }
        }

        // Asegurarse de que id_usuario es un número válido
        const tecnicoId = Number(id_usuario);
        if (isNaN(tecnicoId) || tecnicoId <= 0) {
          throw new Error(`ID de usuario inválido: ${id_usuario}`);
        }

        const insertId = await storage.createMaterialSolicitud({
          material: item.material,
          cantidad: item.cantidad,
          tecnico: tecnicoId,
          id_tecnico_traspaso: id_destino || 0,
          ticket,
          flag_regiones,
          flag_gestion_supervisor,
          campo_item,
        });

        insertedIds.push(insertId);
      }

      res.status(201).json({
        success: true,
        message: `Solicitud creada exitosamente con ${insertedIds.length} items`,
        ticket,
        insertedIds,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Datos de solicitud inválidos",
          details: error.errors
        });
      }
      console.error("Error creating material solicitud:", error);
      res.status(500).json({ error: "Error al crear la solicitud de materiales" });
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

  const httpServer = createServer(app);

  return httpServer;
}