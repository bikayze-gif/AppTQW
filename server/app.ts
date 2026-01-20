import { type Server } from "node:http";

import express, { type Express, type Request, Response, NextFunction } from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import cors from "cors";
import { registerRoutes } from "./routes";
import type { AuthenticatedUser } from "./storage";
import { sessionConfig, appConfig, validateConfig, logConfig, dbConfig } from "./config";
import { setupWebSockets } from "./websocket";

// Validar y mostrar configuración al iniciar
validateConfig();
logConfig();

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    user: AuthenticatedUser | null;
    loginTime: number;
    lastActivity: number;
    lastRotation: number;
    connectionId: number;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

// Session configuration with security best practices
let sessionStore: any;


// Usar MySQL para almacenar sesiones (desarrollo y producción)
const MySQLStoreSession = MySQLStore(session);
sessionStore = new MySQLStoreSession({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  createDatabaseTable: true, // Crear tabla automáticamente si no existe
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  },
  checkExpirationInterval: 900000, // Limpiar sesiones expiradas cada 15 minutos
  expiration: 6 * 60 * 60 * 1000, // 6 horas
});

log("Session store: MySQL");

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://appoperaciones.telqway.cl',
  appConfig.isProduction ? '' : 'http://localhost:5173' // Dev only
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 horas
}));

// Debug middleware to check headers
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`[Headers Debug] ${req.method} ${req.path}`);
    console.log(`[Headers Debug] X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);
    console.log(`[Headers Debug] Host: ${req.headers['host']}`);
    console.log(`[Headers Debug] Secure: ${req.secure}`);
  }
  next();
});

app.set('trust proxy', 1);

app.use(
  session({
    secret: sessionConfig.secret,
    resave: false,
    saveUninitialized: false,
    name: sessionConfig.cookieName,
    cookie: {
      httpOnly: true,
      // TEMPORARY: Forcing secure:false because Nginx proxy sends X-Forwarded-Proto:http
      // TODO: Fix Nginx to send X-Forwarded-Proto:https, then change this back to true
      secure: false,
      sameSite: "lax", // 'lax' is safer/easier than 'none' for now unless we need cross-site
      maxAge: sessionConfig.maxAge,
    },
    store: sessionStore,
  })
);

// Enhanced Security Headers Middleware
app.use((req, res, next) => {
  // Existing headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React needs unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws://localhost:5173 wss://appoperaciones.telqway.cl",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader("Content-Security-Policy", cspDirectives);

  // HSTS (solo en producción con HTTPS)
  if (appConfig.isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Permissions Policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Request size limits to prevent DoS attacks
app.use(express.json({
  limit: '1mb',
  strict: true,
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({
  extended: false,
  limit: '1mb',
  parameterLimit: 1000
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly run the final setup after setting up all the other routes so
  // the catch-all route doesn't interfere with the other routes
  await setup(app, server);

  // Initialize WebSockets with manual upgrade handling
  const wss = setupWebSockets(server);

  server.on("upgrade", (request, socket, head) => {
    if (request.url?.startsWith("/ws")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
}
