import multer from "multer";
import path from "path";
import fs from "fs";

// Whitelist de MIME types permitidos
const ALLOWED_MIME_TYPES = [
  // PDF
  "application/pdf",
  // Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  // Imágenes
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Tamaño máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Directorio de uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "timeline");

// Asegurar que el directorio existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req.session as any)?.user?.id;
    if (!userId) {
      return cb(new Error("Usuario no autenticado"), "");
    }

    // Crear subcarpeta por usuario
    const userDir = path.join(UPLOAD_DIR, String(userId));
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + nombre sanitizado
    const timestamp = Date.now();
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_");

    const uniqueName = `${timestamp}_${sanitizedName}`;
    cb(null, uniqueName);
  },
});

// Filtro de archivos permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Middleware de upload configurado
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware para manejar errores de upload
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Archivo demasiado grande. Máximo permitido: 5MB",
        code: "FILE_TOO_LARGE",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Demasiados archivos. Máximo permitido: 1",
        code: "TOO_MANY_FILES",
      });
    }
    return res.status(400).json({
      error: err.message,
      code: "UPLOAD_ERROR",
    });
  }

  if (err?.message?.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      error: err.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  next(err);
};

// Utilidades
export const getFileInfo = (file: Express.Multer.File) => ({
  path: file.path,
  filename: file.filename,
  originalname: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
});

export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Exportar constantes
export const UPLOAD_CONFIG = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
};
