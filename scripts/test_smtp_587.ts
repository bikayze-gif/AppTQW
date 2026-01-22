
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpConfig = {
    host: "mail.telqway.cl",
    port: 587,
    secure: false, // TLS 
    auth: {
        user: "soporte.gestion@telqway.cl",
        pass: "zHkAob(y(6CH)",
    },
    tls: {
        rejectUnauthorized: false // Ignorar problemas de certificado para la prueba
    }
};

console.log(`Intentando conectar a ${smtpConfig.host}:${smtpConfig.port} (STARTTLS) como ${smtpConfig.auth.user}...`);

const transporter = nodemailer.createTransport(smtpConfig);

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error de autenticación SMTP (Port 587):");
        console.error(error);
        process.exit(1);
    } else {
        console.log("✅ Servidor SMTP está listo para enviar mensajes via puerto 587.");
        process.exit(0);
    }
});
