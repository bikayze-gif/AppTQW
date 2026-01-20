# Configuración del Servidor del Dashboard de Operaciones TQW

## Tabla de Contenidos
1. [Visión General de la Arquitectura](#visión-general-de-la-arquitectura)
2. [Pila Tecnológica](#pila-tecnológica)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Autenticación & Autorización](#autenticación--autorización)
5. [Gestión de Sesiones](#gestión-de-sesiones)
6. [Características de Seguridad](#características-de-seguridad)
7. [Endpoints de API](#endpoints-de-api)
8. [Configuración del Entorno](#configuración-del-entorno)
9. [Despliegue](#despliegue)

---

## Visión General de la Arquitectura

El Dashboard de Operaciones TQW es una aplicación web full‑stack construida con:
- **Frontend**: React 19 con TypeScript, Vite, TailwindCSS
- **Backend**: Node.js 20 con Express.js
- **Base de datos**: MySQL 8.0 para datos operacionales
- **Almacenamiento de Sesiones**: Sesiones basadas en MySQL
- **Tiempo Real**: Soporte WebSocket para actualizaciones en vivo

### Flujo de la Aplicación
```
Cliente (React) → Servidor Express → Base de datos MySQL
                ↓
            Servidor WebSocket (actualizaciones en tiempo real)
                ↓
            Almacenamiento de Sesiones (MySQL)
```
---

## Pila Tecnológica

### Dependencias del Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express 4.21.2
- **ORM**: Drizzle ORM 0.39.1
- **Driver de Base de datos**: mysql2 3.15.3
- **Autenticación**: bcrypt 6.0.0, passport 0.7.0
- **Sesión**: express-session 1.18.1, express-mysql-session 3.0.3
- **Validación**: Zod 3.25.76
- **Email**: nodemailer 7.0.12
- **WebSocket**: ws 8.18.0

### Dependencias del Frontend
- **Framework**: React 19.2.0
- **Router**: Wouter 3.3.5
- **Gestión de Estado**: @tanstack/react-query 5.60.5
- **Componentes UI**: Radix UI, Recharts 2.15.4
- **Estilos**: TailwindCSS 4.1.14
- **Formularios**: react-hook-form 7.66.0

---

## Configuración de la Base de Datos

### Base de Datos Primaria (MySQL)
**Propósito**: Almacenamiento de datos operacionales

**Configuración de Conexión**:
```typescript
{
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "operaciones_tqw",
  timezone: "-03:00",
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
}
```

### Tablas Clave
- **`tb_user_tqw`**: Cuentas de usuario y perfil
- **`tb_claves_usuarios`**: Historial y credenciales de contraseñas
- **`tb_log_app`**: Tokens de sesión activos
- **`login_attempts`**: Seguimiento de intentos de login para limitación de velocidad
- **`tb_conexiones_log`**: Auditoría de conexiones
- **`sessions`**: Almacenamiento de sesiones de Express (creada automáticamente)
- **Tablas de Negocio**: `tb_tqw_comision_renew`, `tb_facturacion_bitacora`, `tp_logistica_mat_oracle`, etc.

---

## Autenticación & Autorización

### Flujo de Autenticación
1. **Solicitud de Login** (`POST /api/auth/login`)
   - Validación con Zod
   - Límite de intentos (5 por 15 min)
   - Verificación contra la base de datos (bcrypt y soporte legado en texto plano)
   - Regeneración de sesión para prevenir fijación
   - Creación de token de sesión y registro de conexión
2. **Restablecimiento de Contraseña**
   - Código de verificación de 6 dígitos, expiración 15 min, máximo 5 intentos
   - Protección contra enumeración de emails

### Middleware de Autorización
- `requireAuth`: Verifica que `req.session.user` exista.
- `requireRole(...roles)`: Verifica que el rol del usuario incluya alguno de los especificados.
- `validateSessionTimeout`: Cierra sesión tras 6 horas de inactividad.

---

## Gestión de Sesiones

### Configuración
```typescript
{
  secret: process.env.SESSION_SECRET || generateDefaultSecret(),
  resave: false,
  saveUninitialized: false,
  name: "tqw_session",
  cookie: {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: "strict",
    maxAge: 6 * 60 * 60 * 1000
  },
  store: MySQLStore
}
```

- **Persistencia**: Almacenamiento en MySQL, sobrevive reinicios del servidor.
- **Ciclo de Vida**: Creación al login, actualización de `lastActivity` en cada petición, expiración automática cada 15 min, destrucción al logout o timeout.

---

## Características de Seguridad

### 1. Encabezados HTTP de Seguridad
```typescript
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "DENY");
res.setHeader("X-XSS-Protection", "1; mode=block");
res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
```

### 2. Limitación de Velocidad
- **Login**: 5 intentos fallidos por IP/email, bloqueo 15 min.
- **Restablecimiento de Contraseña**: 3 peticiones por 15 min.

### 3. Seguridad de Contraseñas
- **Hashing**: bcrypt con 10 rondas.
- **Requisitos**: Mínimo 8 caracteres, mayúsculas, minúsculas y número.
- **Soporte Legado**: Contraseñas en texto plano (para migración).

### 4. Seguridad de Red
- **HTTPS/TLS**: *Pendiente de implementar* (certbot + Nginx).
- **CORS**: No configurado (vulnerable a ataques cross‑origin).
- **Política CSP**: No implementada.
- **Límites de Tamaño de Petición**: Sólo límite de Nginx (50 MB).

---

## Endpoints de API

### Endpoints de Autenticación (Públicos)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/auth/session-ping`

### Endpoints Protegidos (Requieren Autenticación)
- KPI & Comisión: `GET /api/kpi-periods`, `GET /api/kpi?period=`, `GET /api/tqw-comision/:rut/:periodo`
- Gestión de Materiales: `GET /api/materials/solicitudes`, `POST /api/materials/solicitud`
- Operaciones SME, Notificaciones, Configuraciones, etc.

---

## Configuración del Entorno

### Variables de Entorno Requeridas
#### Producción
```env
# Base de datos
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=apptqw_user
MYSQL_PASSWORD=<contraseña_segura>
MYSQL_DATABASE=operaciones_tqw

# Seguridad
SESSION_SECRET=<cadena_aleatoria_64+_caracteres>

# Aplicación
NODE_ENV=production
PORT=5000

# Email (Opcional)
SMTP_HOST=mail.telqway.cl
SMTP_PORT=465
SMTP_USER=nicolas.cornejo@telqway.cl
SMTP_PASS=<contraseña>
SMTP_FROM=nicolas.cornejo@telqway.cl
SMTP_SECURE=true
```

#### Desarrollo
```env
NODE_ENV=development
PORT=5000
# Credenciales de DB para desarrollo
```

### Validación de Configuración
Al iniciar, la aplicación valida que `MYSQL_HOST`, `MYSQL_PASSWORD` y `SESSION_SECRET` estén definidos en producción; de lo contrario, aborta con error.

---

## Despliegue

### Configuración Actual en Producción (VPS)
- **Servidor**: Ubuntu 22.04 LTS
- **IP**: 170.239.85.233
- **Dominio**: appoperaciones.telqway.cl
- **Puerto**: 5000 (interno), 80/443 (externo vía Nginx)
- **Stack**: Node.js 20, MySQL 8.0, Nginx 1.18, PM2 6.0.14

### PM2 (`ecosystem.config.cjs`)
```javascript
module.exports = {
  apps: [{
    name: 'apptqw',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      ...process.env
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Nginx
```nginx
server {
    listen 80;
    server_name appoperaciones.telqway.cl;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Proceso de Construcción
1. **Instalar dependencias**: `npm ci --production=false`
2. **Compilar cliente**: `vite build` → `dist/public/`
3. **Compilar servidor**: `esbuild server/index-prod.ts` → `dist/index.js`
4. **Iniciar**: `pm2 start ecosystem.config.cjs`

---

## Monitoreo & Mantenimiento

### Comandos PM2
```bash
pm2 status              # Ver estado
pm2 logs apptqw         # Ver logs
pm2 restart apptqw      # Reiniciar
pm2 monit               # Monitoreo en tiempo real
pm2 save                # Guardar lista de procesos
```

### Mantenimiento de Base de Datos
```bash
# Contar sesiones
mysql> SELECT COUNT(*) FROM sessions;
# Limpieza de sesiones expiradas (automática cada 15 min)
```

### Backups
```bash
mysqldump -u apptqw_user -p operaciones_tqw > backup.sql
```

---

## Implementación de WebSocket

**Endpoint**: `/ws`
**Propósito**: Actualizaciones en tiempo real para el tablero "Monitor Diario".
**Seguridad**: Actualmente sin autenticación (se basa en cookies de sesión).

---

## Manejo de Errores

### Middleware Global
```typescript
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
```

### Registro de Errores
- Registro en consola para todos los errores.
- Mensajes detallados en desarrollo, genéricos en producción.

---

## Notas
- **Soporte de Contraseña Legada**: Permite contraseñas en texto plano para migración.
- **Persistencia de Sesión**: Las sesiones sobreviven reinicios del servidor.
- **Zona Horaria**: Configurada a UTC‑3 (Chile).
- **CORS**: No configurado explícitamente (política same‑origin).
- **Subidas de Archivos**: Límite de cuerpo 50 MB (configuración Nginx).

---

*Última actualización*: 2026-01-20
*Versión*: 1.0.0
