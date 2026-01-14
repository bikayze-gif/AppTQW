import { type Server } from "node:http";

import express, { type Express, type Request, Response, NextFunction } from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
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

app.use(
  session({
    secret: sessionConfig.secret,
    resave: false,
    saveUninitialized: false,
    name: sessionConfig.cookieName,
    cookie: {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: "strict",
      maxAge: sessionConfig.maxAge,
    },
    store: sessionStore,
  })
);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

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
