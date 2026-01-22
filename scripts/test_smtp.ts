
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpConfig = {
    host: process.env.SMTP_HOST || "mail.telqway.cl",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

console.log(`Intentando conectar a ${smtpConfig.host}:${smtpConfig.port} como ${smtpConfig.auth.user}...`);

const transporter = nodemailer.createTransport(smtpConfig);

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error de autenticación SMTP:");
        console.error(error);
        process.exit(1);
    } else {
        console.log("✅ Servidor SMTP está listo para enviar mensajes.");
        process.exit(0);
    }
});
