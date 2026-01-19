import mysql from "mysql2/promise";
import { dbConfig } from "../config";

async function createNotificationsTables() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    });

    try {
        console.log("Creating notifications tables...");

        // Table 1: Main notifications table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        created_by INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_created_at (created_at),
        INDEX idx_is_active (is_active),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (created_by) REFERENCES tb_user_tqw(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✓ Created tb_notifications table");

        // Table 2: Maps notifications to profiles
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_notification_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id INT NOT NULL,
        profile VARCHAR(100) NOT NULL,
        INDEX idx_notification_id (notification_id),
        INDEX idx_profile (profile),
        FOREIGN KEY (notification_id) REFERENCES tb_notifications(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✓ Created tb_notification_profiles table");

        // Table 3: Tracks read status per user
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_notification_read_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id INT NOT NULL,
        user_id INT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notification_id (notification_id),
        INDEX idx_user_id (user_id),
        UNIQUE KEY unique_read_status (notification_id, user_id),
        FOREIGN KEY (notification_id) REFERENCES tb_notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES tb_user_tqw(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✓ Created tb_notification_read_status table");

        console.log("\n✅ All notification tables created successfully!");

        // Show table structure
        const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'tb_notification%'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);

        console.log("\nCreated tables:");
        console.table(tables);

    } catch (error) {
        console.error("Error creating tables:", error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if executed directly
if (require.main === module) {
    createNotificationsTables()
        .then(() => {
            console.log("\nMigration completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\nMigration failed:", error);
            process.exit(1);
        });
}

export { createNotificationsTables };
