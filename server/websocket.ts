import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { log } from "./app";
import mysql, { RowDataPacket } from "mysql2/promise";
import { dbConfig } from "./config";

// Create a separate pool for the watcher to avoid circular dependencies
const watcherPool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});

let wss: WebSocketServer | null = null;
let lastIntegrationDate: string | null = null;
let watcherInterval: NodeJS.Timeout | null = null;

export function setupWebSockets(server: Server) {
    // Use noServer mode to handle upgrades manually and avoid conflicts with Vite
    wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws) => {
        log("New client connected to WebSockets", "ws");

        ws.on("close", () => {
            log("Client disconnected from WebSockets", "ws");
        });

        // Send a welcome message
        ws.send(JSON.stringify({ type: "connection", message: "Connected to TQW Real-time updates" }));
    });

    // Start the database watcher
    startDatabaseWatcher();

    return wss;
}

// Database watcher - checks for changes every 10 seconds
async function startDatabaseWatcher() {
    log("Starting database watcher (checking every 10 seconds)", "ws");

    watcherInterval = setInterval(async () => {
        try {
            const [rows] = await watcherPool.execute<RowDataPacket[]>(
                "SELECT MAX(fecha_integracion) as last_integration FROM tb_toa_reporte_diario_mysql"
            );

            const currentDate = rows[0]?.last_integration?.toString() || null;

            // If this is the first check, just store the value
            if (lastIntegrationDate === null) {
                lastIntegrationDate = currentDate;
                log(`[Watcher] Initial fecha_integracion: ${currentDate}`, "ws");
                return;
            }

            // If the date changed, broadcast to all clients
            if (currentDate && currentDate !== lastIntegrationDate) {
                log(`[Watcher] CHANGE DETECTED! ${lastIntegrationDate} -> ${currentDate}`, "ws");
                lastIntegrationDate = currentDate;
                broadcast({ type: "refresh", target: "monitor-diario" });
            }
        } catch (error) {
            console.error("[Watcher] Error checking database:", error);
        }
    }, 10000); // Check every 10 seconds
}

export function stopDatabaseWatcher() {
    if (watcherInterval) {
        clearInterval(watcherInterval);
        watcherInterval = null;
        log("Database watcher stopped", "ws");
    }
}

export function broadcast(message: any) {
    if (!wss) return;

    const payload = JSON.stringify(message);
    let clientCount = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            clientCount++;
        }
    });

    if (clientCount > 0) {
        log(`[Broadcast] Sent refresh signal to ${clientCount} client(s)`, "ws");
    }
}
