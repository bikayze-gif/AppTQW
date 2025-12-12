# TQW Operations Dashboard

## Overview

This is a full-stack web application for managing and visualizing operational metrics for TQW technicians and supervisors. The system provides dashboards for tracking KPIs including production metrics (HFC/FTTH), commissions, quality ratios, and attendance data. It features role-based access control with separate interfaces for technicians and supervisors.

The application is built with React/TypeScript on the frontend, Express.js on the backend, and connects to a MySQL database containing operational data. It includes authentication, session management using PostgreSQL, and real-time data visualization through charts and tables.

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

**Key UI Patterns**:
- Bottom navigation for mobile-first design
- Modal/sheet overlays for forms and details
- Responsive charts using Recharts
- Toast notifications for user feedback

**Route Structure**:
- Public: `/login`
- Technician routes: `/`, `/dashboard`, `/activity`, `/analytics`, `/calidad`
- Supervisor routes: `/supervisor/*` (home, notes, messenger, scrumboard, monitoring, billing)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Session Management**:
- Express-session with PostgreSQL backend (connect-pg-simple) for production persistence
- Fallback to MemoryStore in development if PostgreSQL is unavailable
- 6-hour session timeout with activity tracking
- HTTP-only cookies with secure flags in production
- CSRF protection via sameSite: "strict"
- Sessions stored in PostgreSQL table: `session`

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
4. Session created in PostgreSQL and user profile data stored
5. Client redirected based on role (technician → `/`, supervisor → `/supervisor`)

**API Architecture**:
- RESTful endpoints under `/api/*`
- Authentication required for all protected routes via `requireAuth` middleware
- Role verification via `requireRole` middleware
- JSON request/response format
- Comprehensive error handling with specific error codes

**Development vs Production**:
- Development: Vite dev server with HMR, PostgreSQL sessions
- Production: Static file serving from dist/public, PostgreSQL sessions
- Environment-based configuration from `server/config.ts`

### Data Storage

**Primary Database**: MySQL 8.x (Operaciones data)

**Session Database**: PostgreSQL (Replit built-in)

**ORM**: Drizzle ORM with mysql2 driver for MySQL operations

**Connection Configuration**:
- MySQL: Host 170.239.85.233, database operaciones_tqw
- PostgreSQL: Replit-managed instance with SSL enabled
- Connection pooling enabled for both databases

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

4. **TB_CALIDAD_NARANJA_BASE** - Quality (Calidad Reactiva) data
   - Compliance indicators (CALIDAD_30: '0'=cumple, '1'=no cumple)
   - Network type indicators (TIPO_RED_CALCULADO: HFC, FTTH, DUAL)
   - Technician RUT (RUT_TECNICO_FS) for filtering
   - Monthly compliance aggregation

5. **tb_login_attempts** - Security tracking
   - Failed login attempts
   - IP addresses and user agents
   - Lockout mechanism data

6. **session** - Express session storage (PostgreSQL)
   - Stores user session data
   - Automatic expiration handling

**Data Access Pattern**:
- Single technician lookup by RUT + period
- Period defaults to "202509" if not specified
- All KPI queries scoped to specific user and time period
- Session queries handled by connect-pg-simple middleware

### Recent Changes (December 12, 2025)

**Session Persistence Fix**:
- Changed from MemoryStore to PostgreSQL-backed sessions
- Created `session` table in PostgreSQL for persistent session storage
- Updated `server/app.ts` to use connect-pg-simple with SSL support
- Added pgConfig to `server/config.ts` for PostgreSQL connection settings
- Sessions now survive server restarts and horizontal scaling

**Calidad Reactiva Implementation**:
- Added `/api/calidad-reactiva/summary` endpoint for monthly efficiency metrics
- Added `/api/calidad-reactiva/details/:mes` endpoint for detailed compliance records
- Added `/api/calidad-reactiva/export-excel/:mes` endpoint for Excel downloads
- Created `calidad.tsx` page with efficiency charts and detailed compliance table
- Implemented dual-axis chart showing HFC vs FTTH efficiency trends

**Activity Page**:
- Chart endpoint: `/api/activity/chart` - daily metrics visualization
- Table endpoint: `/api/activity/table` - daily activity detail records
- Details endpoint: `/api/activity/details/:date` - order-level data
- Excel export endpoint: `/api/activity/export-excel` - bulk data downloads

### External Dependencies

**Database Connection**:
- MySQL Server at 170.239.85.233:3306, database operaciones_tqw
- PostgreSQL: Replit built-in, credentials via environment variables

**Third-Party Services**:
- None currently integrated
- Placeholder for AI chat functionality (not implemented)

**Key NPM Packages**:
- Authentication: bcrypt, express-session, connect-pg-simple
- Database: drizzle-orm, mysql2, pg
- Validation: zod, @hookform/resolvers
- UI: @radix-ui/* (20+ component packages), recharts
- Development: vite, tsx, esbuild

**Security Considerations**:
1. MySQL credentials hardcoded in drizzle.config.ts (should use environment variables)
2. PostgreSQL connection uses SSL with environment-based credentials
3. Session secret should be environment variable (currently has fallback)
4. Consider migrating MySQL credentials to environment variables for VPS deployment

**Configuration Management**:
- Centralized in `server/config.ts`
- Supports environment variables with fallback defaults
- Separate configs for MySQL, PostgreSQL, sessions, security, and business logic
- VPS-ready with .env file support
