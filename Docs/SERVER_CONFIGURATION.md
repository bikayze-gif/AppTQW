# TQW Operations Dashboard - Server Configuration Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Configuration](#database-configuration)
4. [Authentication & Authorization](#authentication--authorization)
5. [Session Management](#session-management)
6. [Security Features](#security-features)
7. [API Endpoints](#api-endpoints)
8. [Environment Configuration](#environment-configuration)
9. [Deployment](#deployment)

---

## Architecture Overview

The TQW Operations Dashboard is a full-stack web application built with:
- **Frontend**: React 19 with TypeScript, Vite build tool, TailwindCSS
- **Backend**: Node.js 20 with Express.js
- **Database**: MySQL 8.0 for operational data
- **Session Store**: MySQL-based session storage
- **Real-time**: WebSocket support for live updates

### Application Flow
```
Client (React) → Express Server → MySQL Database
                ↓
            WebSocket Server (Real-time updates)
                ↓
            Session Store (MySQL)
```

---

## Technology Stack

### Backend Dependencies
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express 4.21.2
- **ORM**: Drizzle ORM 0.39.1
- **Database Driver**: mysql2 3.15.3
- **Authentication**: bcrypt 6.0.0, passport 0.7.0
- **Session**: express-session 1.18.1, express-mysql-session 3.0.3
- **Validation**: Zod 3.25.76
- **Email**: nodemailer 7.0.12
- **WebSocket**: ws 8.18.0

### Frontend Dependencies
- **Framework**: React 19.2.0
- **Router**: Wouter 3.3.5
- **State Management**: @tanstack/react-query 5.60.5
- **UI Components**: Radix UI, Recharts 2.15.4
- **Styling**: TailwindCSS 4.1.14
- **Forms**: react-hook-form 7.66.0

---

## Database Configuration

### Primary Database (MySQL)
**Purpose**: Operational data storage

**Connection Configuration**:
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

### Key Tables

#### Authentication Tables
- **`tb_user_tqw`**: User accounts with profile information
- **`tb_claves_usuarios`**: Password history and credentials
- **`tb_log_app`**: Active session tokens
- **`login_attempts`**: Login attempt tracking for rate limiting
- **`tb_conexiones_log`**: Connection audit logs

#### Session Table
- **`sessions`**: Express session storage (auto-created)
  - `session_id`: Primary key
  - `expires`: Expiration timestamp
  - `data`: Serialized session data

#### Business Tables
- **`tb_tqw_comision_renew`**: Commission data
- **`tb_facturacion_bitacora`**: Billing records
- **`tp_logistica_mat_oracle`**: Materials catalog
- **`tb_logis_tecnico_solicitud`**: Material requests
- **`tp_ptos_23_new`**: Points parameters
- **`tb_toa_reporte_diario_mysql`**: Daily activity reports

#### Notification System
- **`tb_notifications`**: Notification messages
- **`tb_notification_profiles`**: Profile targeting
- **`tb_notification_read_status`**: Read tracking

---

## Authentication & Authorization

### Authentication Flow

1. **Login Request** (`POST /api/auth/login`)
   - Validates email/password via Zod schema
   - Checks rate limiting (5 attempts per 15 minutes per IP)
   - Validates credentials against database
   - Supports both bcrypt and legacy plaintext passwords
   - Regenerates session ID to prevent session fixation
   - Creates session token and logs connection

2. **Password Validation**
   ```typescript
   // Dual password support
   if (isBcrypt) {
     passwordValid = await bcrypt.compare(password, storedPassword);
   } else {
     passwordValid = storedPassword.trim() === password.trim();
   }
   ```

3. **Session Creation**
   - Generates cryptographically secure session token
   - Stores user data in session
   - Logs connection with IP and timestamp

### Authorization Middleware

#### `requireAuth`
Verifies user is authenticated:
```typescript
if (!req.session.user) {
  return res.status(401).json({ error: "No autenticado" });
}
req.session.lastActivity = Date.now(); // Update activity
```

#### `requireRole(...roles)`
Verifies user has specific role:
```typescript
const userRole = req.session.user.perfil?.toLowerCase() || "";
const hasRole = roles.some(role => userRole.includes(role.toLowerCase()));
if (!hasRole) {
  return res.status(403).json({ error: "No autorizado" });
}
```

#### `validateSessionTimeout`
Checks for session inactivity (6 hours):
```typescript
const inactiveTime = now - lastActivity;
const maxInactiveTime = 6 * 60 * 60 * 1000; // 6 hours
if (inactiveTime > maxInactiveTime) {
  req.session.destroy();
  return res.status(401).json({ code: "SESSION_TIMEOUT" });
}
```

### Password Reset Flow

1. **Request Code** (`POST /api/auth/forgot-password`)
   - Rate limited: 3 requests per 15 minutes
   - Generates 6-digit verification code
   - Sends email via nodemailer
   - Code expires in 15 minutes
   - Prevents email enumeration (always returns success)

2. **Verify Code** (`POST /api/auth/verify-reset-code`)
   - Maximum 5 attempts per code
   - Invalidates code after max attempts
   - Returns remaining attempts on failure

3. **Reset Password** (`POST /api/auth/reset-password`)
   - Validates password strength (8+ chars, uppercase, lowercase, number)
   - Hashes password with bcrypt (10 rounds)
   - Marks code as used
   - Invalidates all other reset tokens

---

## Session Management

### Configuration
```typescript
{
  secret: process.env.SESSION_SECRET || generateDefaultSecret(),
  resave: false,
  saveUninitialized: false,
  name: "tqw_session",
  cookie: {
    httpOnly: true,                    // Prevents XSS access
    secure: appConfig.isProduction,    // HTTPS only in production
    sameSite: "strict",                // CSRF protection
    maxAge: 6 * 60 * 60 * 1000        // 6 hours
  },
  store: MySQLStore                    // Persistent session storage
}
```

### Session Data Structure
```typescript
interface SessionData {
  user: AuthenticatedUser | null;
  loginTime: number;
  lastActivity: number;
  connectionId: number;
}
```

### Session Lifecycle
1. **Creation**: On successful login with `session.regenerate()`
2. **Activity Tracking**: Updated on each API request
3. **Timeout**: 6 hours of inactivity
4. **Cleanup**: MySQL store auto-cleans expired sessions every 15 minutes
5. **Destruction**: On logout or timeout

---

## Security Features

### 1. HTTP Security Headers
```typescript
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "DENY");
res.setHeader("X-XSS-Protection", "1; mode=block");
res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
```

### 2. Rate Limiting

**Login Attempts**:
- 5 failed attempts per email/IP combination
- 15-minute lockout period
- Tracked in `login_attempts` table

**Password Reset**:
- 3 requests per email per 15 minutes
- 5 code verification attempts per token
- Automatic token invalidation on max attempts

### 3. Password Security

**Hashing**:
- Algorithm: bcrypt
- Rounds: 10
- Legacy support: Plaintext passwords (migration path)

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### 4. Session Security

**Protection Mechanisms**:
- Session regeneration on login (prevents fixation)
- HttpOnly cookies (prevents XSS)
- SameSite=strict (prevents CSRF)
- Secure flag in production (HTTPS only)
- Inactivity timeout (6 hours)

### 5. Input Validation

**Zod Schemas**:
- `loginSchema`: Email and password validation
- `insertBillingSchema`: Billing data validation
- `materialSolicitudRequestSchema`: Material request validation
- `insertNotificationSchema`: Notification validation

### 6. SQL Injection Prevention

**Parameterized Queries**:
```typescript
await pool.execute(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

**Drizzle ORM**: Type-safe query builder prevents injection

### 7. Connection Logging

All connections tracked in `tb_conexiones_log`:
- User identifier
- IP address
- Connection/disconnection timestamps
- Session duration
- TCP state

---

## API Endpoints

### Authentication Endpoints (Public)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `GET /api/auth/session-ping` - Keep session alive

### Protected Endpoints (Require Authentication)

**KPI & Commission**:
- `GET /api/kpi-periods` - Get available periods
- `GET /api/kpi?period=` - Get KPI data
- `GET /api/tqw-comision/:rut/:periodo` - Get commission data
- `GET /api/supervisor/monitor-diario` - Daily monitor dashboard
- `GET /api/supervisor/kpi-mes-actual` - Monthly KPI dashboard

**Materials Management**:
- `GET /api/materials/solicitudes` - Get material requests
- `GET /api/materials/technicians` - Get technicians list
- `POST /api/materials/solicitud` - Create material request

**SME Operations**:
- `GET /api/sme/activities` - Get SME activities
- `GET /api/sme/technicians` - Get SME technicians
- `POST /api/sme/activities` - Create SME activity
- `GET /api/sme/localidades/:zona` - Get locations by zone

**Notifications**:
- `GET /api/notifications/user` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

**Settings**:
- `GET /api/sidebar-permissions` - Get sidebar permissions
- `GET /api/points-parameters` - Get points parameters
- `PATCH /api/points-parameters/:id` - Update points parameter

---

## Environment Configuration

### Required Environment Variables

**Production**:
```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=apptqw_user
MYSQL_PASSWORD=<secure_password>
MYSQL_DATABASE=operaciones_tqw

# Security
SESSION_SECRET=<64_char_random_string>

# Application
NODE_ENV=production
PORT=5000

# Email (Optional)
SMTP_HOST=mail.telqway.cl
SMTP_PORT=465
SMTP_USER=nicolas.cornejo@telqway.cl
SMTP_PASS=<password>
SMTP_FROM=nicolas.cornejo@telqway.cl
SMTP_SECURE=true
```

**Development**:
```env
NODE_ENV=development
PORT=5000
# Database credentials for dev environment
```

### Configuration Validation

On startup, the application validates:
- `MYSQL_HOST` (production only)
- `MYSQL_PASSWORD` (production only)
- `SESSION_SECRET` (production only)

Throws error and exits if production validation fails.

---

## Deployment

### Current Production Setup (VPS)

**Server**: Ubuntu 22.04 LTS
**IP**: 170.239.85.233
**Domain**: appoperaciones.telqway.cl
**Port**: 5000 (internal), 80/443 (external via Nginx)

**Stack**:
- Node.js 20.20.0
- MySQL 8.0.44
- Nginx 1.18.0 (reverse proxy)
- PM2 6.0.14 (process manager)

**PM2 Configuration** (`ecosystem.config.cjs`):
```javascript
module.exports = {
  apps: [{
    name: 'apptqw',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      ...process.env  // Loads from .env
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

**Nginx Configuration**:
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

### Build Process

1. **Install Dependencies**: `npm ci --production=false`
2. **Build Client**: `vite build` → `dist/public/`
3. **Build Server**: `esbuild server/index-prod.ts` → `dist/index.js`
4. **Start**: `pm2 start ecosystem.config.cjs`

### Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Generate secure `SESSION_SECRET` (64+ chars)
- [ ] Configure MySQL user with minimal privileges
- [ ] Run `npm run build`
- [ ] Start with PM2: `pm2 start ecosystem.config.cjs`
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/TLS certificate (certbot)
- [ ] Configure firewall (UFW): ports 80, 443, SSH only
- [ ] Disable SSH password authentication
- [ ] Set up log rotation
- [ ] Configure automated backups

---

## Monitoring & Maintenance

### PM2 Commands
```bash
pm2 status              # Check application status
pm2 logs apptqw         # View logs
pm2 restart apptqw      # Restart application
pm2 monit               # Real-time monitoring
pm2 save                # Save current process list
```

### Database Maintenance
```bash
# Check session table size
mysql> SELECT COUNT(*) FROM sessions;

# Clean expired sessions (automatic via express-mysql-session)
# Runs every 15 minutes

# Backup database
mysqldump -u apptqw_user -p operaciones_tqw > backup.sql
```

### Log Files
- **PM2 Logs**: `/var/www/apptqw/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`

---

## WebSocket Implementation

**Endpoint**: `/ws`

**Purpose**: Real-time updates for Monitor Diario dashboard

**Connection Flow**:
1. Client connects to `ws://domain/ws`
2. Server handles upgrade via `wss.handleUpgrade()`
3. Broadcasts updates via `broadcast({ type, target })`

**Security**: No authentication on WebSocket connection (relies on session cookies)

---

## Error Handling

### Global Error Handler
```typescript
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
```

### Error Logging
- Console logging for all errors
- Detailed error messages in development
- Generic messages in production (prevents information disclosure)

---

## Notes

- **Legacy Password Support**: System supports both bcrypt and plaintext passwords for migration purposes
- **Session Persistence**: Sessions survive server restarts (MySQL storage)
- **Timezone**: Server configured for Chile timezone (UTC-3)
- **CORS**: Not explicitly configured (same-origin policy)
- **File Uploads**: Max body size 50MB (Nginx configuration)

---

*Last Updated*: 2026-01-20
*Version*: 1.0.0
