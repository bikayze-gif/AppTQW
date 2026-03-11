# Skills Técnicos de AppTQW

Catálogo de expertos especializados disponibles para el desarrollo del proyecto.

**Fecha de migración:** 2026-02-25
**Total de skills:** 14

---

## Cómo Usar

Invoca un skill en Craft Agent usando:

```
[skill:slug] [tu solicitud]
```

**Ejemplo:**
```
[skill:frontend-dev] Crea un componente de tarjeta de producto con imagen, título, precio y botón de compra
```

---

## Skills Disponibles

### 🏗️ Diseño y Arquitectura

#### `architect` - Arquitecto de Software
Diseña arquitectura de sistemas, crea diagramas Mermaid, toma decisiones técnicas y evalúa trade-offs.

**Úsalo cuando necesites:**
- Diseñar la arquitectura de un módulo nuevo
- Crear diagramas de flujo, ER, secuencia
- Evaluar opciones tecnológicas (pros/contras)
- Documentar decisiones arquitectónicas (ADR style)

**Ejemplo:**
```
[skill:architect] Diseña la arquitectura para un sistema de notificaciones push en tiempo real
```

---

#### `api-designer` - Diseñador de APIs
Diseña APIs REST con contratos claros, documentación OpenAPI, versionado y mejores prácticas.

**Úsalo cuando necesites:**
- Diseñar endpoints REST para una feature
- Definir schemas de request/response
- Documentar contratos de API
- Implementar validación con Zod

**Ejemplo:**
```
[skill:api-designer] Diseña los endpoints REST para un módulo de gestión de clientes (CRUD completo)
```

---

#### `ui-ux` - Diseñador UI/UX
Diseña interfaces, flujos de usuario, sistemas de diseño, accesibilidad y responsive design.

**Úsalo cuando necesites:**
- Diseñar la interfaz de una página o componente
- Definir flujos de usuario (user flows)
- Mejorar accesibilidad (WCAG 2.1 AA)
- Crear design system consistente

**Ejemplo:**
```
[skill:ui-ux] Diseña la interfaz y flujo de usuario para un formulario de registro con validación en tiempo real
```

---

### 💻 Desarrollo

#### `frontend-dev` - Desarrollador Frontend
Desarrolla componentes React, TypeScript, Tailwind CSS, hooks personalizados y páginas responsive.

**Úsalo cuando necesites:**
- Implementar componentes React
- Crear custom hooks
- Integrar formularios con React Hook Form + Zod
- Implementar estado con React Query/Zustand

**Ejemplo:**
```
[skill:frontend-dev] Implementa un componente ProductCard con imagen, título, precio y botón "Agregar al carrito"
```

**Archivos que maneja:**
- `client/**/*.tsx`
- `client/**/*.ts`
- `client/**/*.css`

---

#### `backend-dev` - Desarrollador Backend
Desarrolla APIs REST, lógica de negocio, middleware, validación y manejo de errores.

**Úsalo cuando necesites:**
- Implementar endpoints REST
- Crear middleware de autenticación/autorización
- Validar datos con Zod
- Manejar lógica de negocio compleja

**Ejemplo:**
```
[skill:backend-dev] Implementa el endpoint POST /api/clientes con validación Zod y manejo de errores
```

**Archivos que maneja:**
- `server/**/*.ts`
- `shared/schema.ts`

---

#### `dba` - Administrador de Base de Datos
Diseña esquemas MySQL, crea migraciones Drizzle ORM, optimiza queries y gestiona índices.

**Úsalo cuando necesites:**
- Crear tablas y relaciones nuevas
- Escribir migraciones Drizzle ORM
- Optimizar queries lentas (EXPLAIN ANALYZE)
- Diseñar índices para mejorar performance

**Ejemplo:**
```
[skill:dba] Crea el schema para un módulo de pedidos con relaciones a clientes, productos y estados de envío
```

**Archivos que maneja:**
- `shared/schema.ts`
- `db/**`
- `migrations/**`

---

### 🔒 Calidad y Seguridad

#### `qa-tester` - QA / Tester
Crea estrategias de testing, tests unitarios (Vitest), tests E2E (Playwright) y mide cobertura.

**Úsalo cuando necesites:**
- Escribir tests unitarios para funciones/componentes
- Crear tests E2E para flujos críticos
- Diseñar estrategia de testing
- Mejorar cobertura de tests

**Ejemplo:**
```
[skill:qa-tester] Crea tests E2E para el flujo de checkout completo (carrito → pago → confirmación)
```

---

#### `security-auditor` - Auditor de Seguridad
Analiza vulnerabilidades OWASP Top 10, revisa autenticación, hardening y mejores prácticas de seguridad.

**Úsalo cuando necesites:**
- Auditoría de seguridad de un módulo
- Revisar autenticación/autorización
- Detectar vulnerabilidades (XSS, SQLi, CSRF, etc.)
- Validar headers de seguridad

**Ejemplo:**
```
[skill:security-auditor] Audita el módulo de autenticación y detecta vulnerabilidades OWASP Top 10
```

---

#### `code-reviewer` - Revisor de Código
Realiza code reviews exhaustivos enfocándose en calidad, patrones SOLID, seguridad y rendimiento.

**Úsalo cuando necesites:**
- Review de código antes de mergear
- Detectar code smells
- Validar patrones de diseño
- Sugerencias de refactoring

**Ejemplo:**
```
[skill:code-reviewer] Revisa el código del módulo de reportes y sugiere mejoras de calidad
```

---

### ⚙️ Operaciones

#### `devops` - Ingeniero DevOps
Gestiona deployment, servidores, Nginx, PM2, Docker, CI/CD pipelines y monitoreo.

**Úsalo cuando necesites:**
- Configurar deployment en VPS
- Crear scripts de CI/CD (GitHub Actions)
- Configurar Nginx como reverse proxy
- Gestionar PM2 para apps Node.js
- Crear Dockerfiles

**Ejemplo:**
```
[skill:devops] Crea un plan de deployment para la app en un VPS con Nginx + PM2
```

---

#### `perf-engineer` - Ingeniero de Performance
Optimiza Core Web Vitals, bundle size, queries lentas, implementa caching y lazy loading.

**Úsalo cuando necesites:**
- Optimizar rendimiento de la app
- Reducir bundle size
- Mejorar Core Web Vitals (LCP, FID, CLS)
- Optimizar queries MySQL lentas
- Implementar estrategias de caching

**Ejemplo:**
```
[skill:perf-engineer] Analiza y optimiza el bundle size de la app React (actualmente 2.5 MB)
```

---

### 📚 Documentación

#### `tech-writer` - Escritor Técnico
Crea documentación clara: READMEs, guías de uso, ADRs, changelogs y documentación de APIs.

**Úsalo cuando necesites:**
- Escribir README de un módulo
- Documentar decisiones técnicas (ADR)
- Crear changelog de versión
- Documentar APIs y endpoints

**Ejemplo:**
```
[skill:tech-writer] Crea un README completo para el módulo de autenticación con ejemplos de uso
```

---

### 🛠️ Utilidades

#### `ui-describer` - UI Describer
Analiza screenshots o diseños visuales y genera prompts estructurados para implementarlos con código.

**Úsalo cuando necesites:**
- Convertir un screenshot en especificación técnica
- Generar prompt de implementación desde un mockup
- Analizar un diseño de Figma/XD como imagen

**Ejemplo:**
```
[skill:ui-describer] [Adjunta screenshot] Analiza esta interfaz y genera el prompt de implementación
```

---

#### `orchestrator` - Orquestador de Desarrollo (⭐ MUY IMPORTANTE)
Coordina múltiples skills para implementar features completas. Analiza requisitos, diseña plan de ejecución y delega tareas.

**Úsalo cuando necesites:**
- Implementar una feature completa (frontend + backend + DB + tests)
- Coordinar múltiples especialistas
- Proyectos complejos que requieren varios pasos

**Formato de invocación:**
```
[skill:orchestrator] [descripción de la feature completa]
```

**Ejemplo:**
```
[skill:orchestrator] Implementa un módulo completo de gestión de clientes con CRUD, autenticación, reportes y tests E2E
```

**Qué hace el orchestrator:**
1. Presenta un **Resumen Ejecutivo** con tabla de especialistas y beneficios
2. Espera tu confirmación
3. Coordina la ejecución en fases:
   - Fase 1: Diseño (architect, api-designer, ui-ux)
   - Fase 2: Implementación (dba, backend-dev, frontend-dev)
   - Fase 3: Calidad (qa-tester, security-auditor, code-reviewer)
   - Fase 4: Deploy y Docs (devops, tech-writer)

---

## Patrones de Uso Recomendados

### Pattern 1: Feature Nueva Completa (USA ORCHESTRATOR)

```
[skill:orchestrator] Necesito implementar un sistema de notificaciones push en tiempo real
```

El orchestrator coordinará todos los skills necesarios automáticamente.

---

### Pattern 2: Implementación Directa (Single Skill)

Si ya sabes exactamente qué necesitas:

```
[skill:frontend-dev] Crea el componente NotificationBell con badge de contador y dropdown de notificaciones
```

---

### Pattern 3: Diseño Primero, Implementación Después

**Paso 1 - Diseño:**
```
[skill:architect] Diseña la arquitectura para el módulo de reportes
```

**Paso 2 - Implementación:**
```
[skill:backend-dev] Implementa los endpoints según la arquitectura propuesta
[skill:frontend-dev] Implementa la UI de reportes según el diseño
```

---

### Pattern 4: Bug Fix

```
[skill:code-reviewer] Identifica el problema en el componente CartTotal
[skill:frontend-dev] Implementa el fix sugerido por el code-reviewer
[skill:qa-tester] Crea tests de regresión para este bug
```

---

### Pattern 5: Optimización

```
[skill:perf-engineer] Analiza el rendimiento de la página de inventario (es muy lenta)
[skill:dba] Optimiza las queries identificadas por el performance engineer
[skill:frontend-dev] Implementa lazy loading en los componentes pesados
```

---

## Stack Tecnológico Cubierto

Los skills están diseñados para este stack:

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend:** Node.js + Express + TypeScript
- **ORM:** Drizzle ORM
- **Database:** MySQL 8.0+
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** PM2 + Nginx
- **CI/CD:** GitHub Actions

Si tu proyecto usa un stack diferente, los skills pueden adaptarse, pero considera ajustar las guidelines en cada `SKILL.md`.

---

## Validación de Skills

Para verificar que un skill funciona correctamente:

```
[skill:architect] ¿Quién eres y qué haces?
```

Debe responder como "Arquitecto de Software Senior con más de 15 años de experiencia..."

---

## Troubleshooting

### Skill no responde como esperado
- Verifica que el archivo `SKILL.md` existe en `skills/[slug]/SKILL.md`
- Verifica que el frontmatter YAML es válido
- Lee el `SKILL.md` directamente para entender sus capabilities

### Quiero modificar un skill
- Edita el archivo `skills/[slug]/SKILL.md`
- Modifica las guidelines, examples, o anti-patterns según necesites
- Los cambios se aplican inmediatamente

### Quiero agregar un skill nuevo
1. Crea `skills/[nuevo-slug]/SKILL.md`
2. Agrega frontmatter YAML:
   ```yaml
   ---
   name: "Nombre del Skill"
   description: "Descripción corta de qué hace"
   ---
   ```
3. Escribe las guidelines y ejemplos
4. Actualiza este README con el nuevo skill

---

## Recursos Adicionales

- **Plan de Migración:** `sessions/260225-coral-zinc/plans/SKILLS_MIGRATION_PLAN.md`
- **Documentación de Skills (Craft Agent):** `~/.craft-agent/docs/skills.md`
- **Skill Template (ProyectoLaboralTata):** `SKILLS-TEMPLATE.md` (si existe)

---

## Contribuir

Si mejoras un skill o agregas uno nuevo:
1. Documenta el cambio en el `SKILL.md`
2. Actualiza este README
3. Crea un commit descriptivo
4. Comparte la mejora con el equipo

---

**Migración realizada:** 2026-02-25
**Skills activos:** 14
**Última actualización:** 2026-02-25
