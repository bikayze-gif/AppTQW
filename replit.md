# TQW Operations Dashboard

## Overview

This is a full-stack web application for managing and visualizing operational metrics for TQW technicians and supervisors. The system provides dashboards for tracking KPIs including production metrics (HFC/FTTH), commissions, quality ratios, and attendance data. It features role-based access control with separate interfaces for technicians and supervisors.

The application is built with React/TypeScript on the frontend, Express.js on the backend, and connects to a MySQL database containing operational data. It includes authentication, session management, and real-time data visualization through charts and tables.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**Routing**: Wouter (lightweight routing library) with protected routes based on user roles

**State Management**: 
- React Query (@tanstack/react-query) for server state management
- React Context API for authentication state
- Local component state with React hooks

**UI Framework**: 
- Shadcn UI components (Radix UI primitives)
- Tailwind CSS v4 for styling
- Custom design system with dark mode as default
- Framer Motion removed (noted in package.json)

**Key UI Patterns**:
- Bottom navigation for mobile-first design
- Modal/sheet overlays for forms and details
- Responsive charts using Recharts
- Toast notifications for user feedback

**Route Structure**:
- Public: `/login`
- Technician routes: `/`, `/dashboard`, `/activity`, `/analytics`
- Supervisor routes: `/supervisor/*` (home, notes, messenger, scrumboard, monitoring, billing)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Session Management**:
- Express-session with MemoryStore (development) or connect-pg-simple (production capable)
- 6-hour session timeout with activity tracking
- HTTP-only cookies with secure flags in production
- CSRF protection via sameSite: "strict"

**Security Features**:
- Bcrypt password hashing (10 rounds)
- Rate limiting on login attempts (5 max attempts, 15-minute lockout)
- Login attempt tracking in database
- IP-based account lockout
- Role-based access control (RBAC) middleware

**Authentication Flow**:
1. User submits credentials to `/api/auth/login`
2. System validates against `tb_user_tqw` table
3. Password verified using bcrypt against `tb_claves_usuarios` table
4. Session created with user profile data
5. Client redirected based on role (technician → `/`, supervisor → `/supervisor`)

**API Architecture**:
- RESTful endpoints under `/api/*`
- Authentication required for all protected routes via `requireAuth` middleware
- Role verification via `requireRole` middleware
- JSON request/response format
- Comprehensive error handling with specific error codes

**Development vs Production**:
- Development: Vite dev server with HMR
- Production: Static file serving from dist/public
- Environment-based configuration from `server/config.ts`

### Data Storage

**Database**: MySQL 8.x

**ORM**: Drizzle ORM with mysql2 driver

**Connection Configuration**:
- Host: Configurable via environment variables
- Connection pooling enabled
- Credentials stored in `drizzle.config.ts` (currently hardcoded - should be moved to env vars)

**Key Tables**:

1. **tb_user_tqw** - User accounts
   - Stores user profile, role (PERFIL), area, supervisor, zone
   - Primary authentication lookup table

2. **tb_claves_usuarios** - User credentials
   - Stores hashed passwords
   - Password change history
   - Linked to users via RUT or email

3. **tb_tqw_comision_renew** - Commission and KPI data
   - Production metrics (HFC points, FTTH RGUs)
   - Commission calculations (base and weighted)
   - Quality ratios and compliance percentages
   - Attendance factors (absences, vacations, sick leave)
   - Filtered by RUT and period (YYYYMM format)

4. **tb_login_attempts** - Security tracking
   - Failed login attempts
   - IP addresses and user agents
   - Lockout mechanism data

5. **tb_log_app** - Active sessions (legacy, possibly unused)

**Data Access Pattern**:
- Single technician lookup by RUT + period
- Period defaults to "202509" if not specified
- All KPI queries scoped to specific user and time period

### External Dependencies

**Database Connection**:
- MySQL Server at 170.239.85.233:3306
- Database: operaciones_tqw
- Credentials hardcoded in drizzle.config.ts (security risk - should use environment variables)

**Third-Party Services**:
- None currently integrated
- Placeholder for AI chat functionality (not implemented)

**Key NPM Packages**:
- Authentication: bcrypt, express-session
- Database: drizzle-orm, mysql2
- Validation: zod, @hookform/resolvers
- UI: @radix-ui/* (20+ component packages), recharts
- Development: vite, tsx, esbuild

**Security Considerations**:
1. Database credentials exposed in repository files
2. Session secret should be environment variable
3. MySQL connection should use SSL in production
4. Consider migrating from MemoryStore to Redis/PostgreSQL store for production scalability

**Configuration Management**:
- Centralized in `server/config.ts`
- Supports environment variables with fallback defaults
- Separate configs for database, sessions, security, and business logic
- VPS-ready with .env file support