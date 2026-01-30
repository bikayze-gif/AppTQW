import mysql from "mysql2/promise";
import { dbConfig } from "../config";

async function createNotesTables() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    });

    try {
        console.log("Creating notes tables...");

        // Table 1: Main notes table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_supervisor_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'Notes',
        image_url VARCHAR(500),
        is_archived TINYINT(1) NOT NULL DEFAULT 0,
        is_pinned TINYINT(1) NOT NULL DEFAULT 0,
        reminder_date DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_category (category),
        INDEX idx_is_archived (is_archived),
        INDEX idx_is_pinned (is_pinned),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✓ Created tb_supervisor_notes table");

        // Table 2: User-customizable labels
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_supervisor_note_labels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        icon VARCHAR(50) DEFAULT 'FileText',
        color VARCHAR(100) DEFAULT 'bg-slate-100 text-slate-800',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        UNIQUE KEY unique_label (user_id, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("✓ Created tb_supervisor_note_labels table");

        console.log("\n✅ All notes tables created successfully!");

        // Show table structure
        const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'tb_supervisor_note%'
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

// Run directly
createNotesTables()
    .then(() => {
        console.log("\nMigration completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nMigration failed:", error);
        process.exit(1);
    });

export { createNotesTables };
