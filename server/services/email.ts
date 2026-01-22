import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// SMTP configuration from environment variables
const smtpConfig = {
  host: process.env.SMTP_HOST || "mail.telqway.cl",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Replicating Python script behavior: context.check_hostname = False, context.verify_mode = ssl.CERT_NONE
    rejectUnauthorized: false,
    checkServerIdentity: () => null // Disable hostname verification
  }
};

const transporter = nodemailer.createTransport(smtpConfig as any);

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("[Email Service] SMTP verification failed:", error);
  } else {
    console.log("[Email Service] SMTP server is ready to take our messages");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Service to handle different email instances
 */
export const emailService = {
  /**
   * Generic send email method
   */
  async sendEmail({ to, subject, text, html, from }: EmailOptions) {
    const mailOptions = {
      from: from || process.env.SMTP_FROM || smtpConfig.auth.user,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Message sent: %s`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[Email Service] Error sending email:", error);
      throw error;
    }
  },

  /**
   * Specific instance: Password Reset
   */
  async sendPasswordResetCode(email: string, code: string) {
    const subject = "Código de Recuperación de Contraseña - TQW";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
        </div>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">${code}</span>
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Este es un correo automático, por favor no lo respondas.<br>
          &copy; ${new Date().getFullYear()} Telqway. Todos los derechos reservados.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Tu código de recuperación es: ${code}. Expira en 15 minutos.`,
    });
  },

  /**
   * Specific instance: Welcome Email
   */
  async sendWelcomeEmail(email: string, name: string) {
    const subject = "Bienvenido a App TQW";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb;">¡Bienvenido, ${name}!</h2>
        <p>Tu cuenta ha sido creada exitosamente en App TQW.</p>
        <p>Ya puedes acceder a la plataforma utilizando tus credenciales corporativas.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.telqway.cl" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder a la Plataforma</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          &copy; ${new Date().getFullYear()} Telqway. Todos los derechos reservados.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `¡Bienvenido ${name} a App TQW! Tu cuenta ha sido creada con éxito.`,
    });
  }
};
