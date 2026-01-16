import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createPasswordResetTables() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log("✓ Connected to MySQL database");

    try {
        // 1. Check if password_reset_tokens table exists
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'password_reset_tokens'"
        );

        if ((tables as any[]).length === 0) {
            console.log("Creating table: password_reset_tokens...");
            await connection.query(`
        CREATE TABLE password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          reset_code VARCHAR(6) NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          used_at DATETIME NULL,
          attempts INT DEFAULT 0,
          max_attempts INT DEFAULT 5,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (reset_code),
          INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
            console.log("✓ Table 'password_reset_tokens' created successfully");
        } else {
            console.log("✓ Table 'password_reset_tokens' already exists");

            // Check if attempts and max_attempts columns exist
            const [columns] = await connection.query(
                "SHOW COLUMNS FROM password_reset_tokens LIKE 'attempts'"
            );

            if ((columns as any[]).length === 0) {
                console.log("Adding columns 'attempts' and 'max_attempts'...");
                await connection.query(`
          ALTER TABLE password_reset_tokens 
          ADD COLUMN attempts INT DEFAULT 0,
          ADD COLUMN max_attempts INT DEFAULT 5;
        `);
                console.log("✓ Columns added successfully");
            } else {
                console.log("✓ Columns 'attempts' and 'max_attempts' already exist");
            }
        }

        // 2. Check if tb_password_reset_audit table exists
        const [auditTables] = await connection.query(
            "SHOW TABLES LIKE 'tb_password_reset_audit'"
        );

        if ((auditTables as any[]).length === 0) {
            console.log("Creating table: tb_password_reset_audit...");
            await connection.query(`
        CREATE TABLE tb_password_reset_audit (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL COMMENT 'request_code, verify_code, reset_password',
          success BOOLEAN NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email_created (email, created_at),
          INDEX idx_action (action)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
            console.log("✓ Table 'tb_password_reset_audit' created successfully");
        } else {
            console.log("✓ Table 'tb_password_reset_audit' already exists");
        }

        // 3. Show table structures
        console.log("\n--- Table Structure: password_reset_tokens ---");
        const [structure1] = await connection.query(
            "DESCRIBE password_reset_tokens"
        );
        console.table(structure1);

        console.log("\n--- Table Structure: tb_password_reset_audit ---");
        const [structure2] = await connection.query(
            "DESCRIBE tb_password_reset_audit"
        );
        console.table(structure2);

        console.log("\n✓ All tables created/verified successfully!");
    } catch (error) {
        console.error("Error creating tables:", error);
        throw error;
    } finally {
        await connection.end();
        console.log("\n✓ Database connection closed");
    }
}

createPasswordResetTables()
    .then(() => {
        console.log("\n✓ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n✗ Script failed:", error);
        process.exit(1);
    });
