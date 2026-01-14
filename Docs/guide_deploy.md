# Guía de Despliegue - AppTQW

## 📋 Información del Servidor

| Parámetro | Valor |
|-----------|-------|
| **Alias SSH** | `telqway` |
| **Hostname** | gestarservicios-dev.cl |
| **IP** | 45.236.128.91 |
| **Puerto SSH** | 35988 |
| **Usuario** | root |
| **Directorio del Proyecto** | `/var/www/AppTQW` |
| **Rama de Producción** | `main` |
| **Proceso PM2** | `apptqw` |

---

## 🚀 Proceso de Despliegue

### 1. Preparación Local

Antes de desplegar, asegúrate de tener todos los cambios comprometidos y pusheados:

```bash
# En tu máquina local (Windows)
cd C:\Users\pc\Documents\GitHub\AppTQW

# Verificar estado de Git
git status

# Agregar cambios
git add -A

# Hacer commit
git commit -m "feat: descripción de los cambios"

# Push a la rama main
git push origin main
```

### 2. Conexión al Servidor

```bash
# Conectarse al servidor usando el alias SSH configurado
ssh telqway
```

### 3. Actualizar Código desde GitHub

```bash
# Navegar al directorio del proyecto
cd /var/www/AppTQW

# Verificar rama actual
git status

# Hacer pull de los últimos cambios
git pull origin main
```

### 4. Instalar Dependencias

```bash
# Instalar nuevas dependencias (si las hay)
npm install
```

### 5. Compilar el Proyecto

```bash
# Configurar límite de memoria para Node.js (evita errores de memoria)
export NODE_OPTIONS=--max-old-space-size=1536

# Compilar el proyecto para producción
npm run build
```

**Nota:** El proceso de build puede tomar entre 1-2 minutos. Verás:
- `vite v7.1.12 building for production...`
- `✓ 4155 modules transformed.`
- `dist/index.js 84.1kb`

### 6. Reiniciar la Aplicación

```bash
# Reiniciar el proceso PM2
pm2 restart apptqw
```

### 7. Verificar el Estado

```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Ver información detallada
pm2 info apptqw

# Ver logs en tiempo real (opcional)
pm2 logs apptqw
```

---

## 🔧 Comandos Útiles

### Gestión de PM2

```bash
# Ver todos los procesos
pm2 list

# Ver logs
pm2 logs apptqw

# Ver logs con filtro
pm2 logs apptqw --lines 100

# Detener la aplicación
pm2 stop apptqw

# Iniciar la aplicación
pm2 start apptqw

# Reiniciar la aplicación
pm2 restart apptqw

# Ver métricas en tiempo real
pm2 monit
```

### Gestión de Git

```bash
# Ver historial de commits
git log --oneline -10

# Ver diferencias
git diff

# Descartar cambios locales
git checkout -- .

# Cambiar de rama
git checkout nombre-rama
```

### Verificación del Sistema

```bash
# Ver uso de memoria
free -m

# Ver procesos de Node
ps aux | grep node

# Ver espacio en disco
df -h

# Ver uptime del servidor
uptime
```

---

## 🛠️ Despliegue Completo (Script de Una Línea)

Para un despliegue rápido, puedes ejecutar todos los comandos en una sola línea desde tu máquina local:

```bash
ssh telqway "cd /var/www/AppTQW && git pull origin main && npm install && export NODE_OPTIONS=--max-old-space-size=1536 && npm run build && pm2 restart apptqw && pm2 status"
```

---

## ⚠️ Solución de Problemas

### Error: "Out of Memory" durante el build

**Solución:**
```bash
# Aumentar el límite de memoria de Node.js
export NODE_OPTIONS=--max-old-space-size=2048
npm run build
```

### Error: La aplicación no inicia después del restart

**Diagnóstico:**
```bash
# Ver logs de errores
pm2 logs apptqw --err --lines 50

# Ver información del proceso
pm2 info apptqw
```

**Solución:**
```bash
# Detener y volver a iniciar
pm2 delete apptqw
pm2 start dist/index.js --name apptqw
pm2 save
```

### Error: Conflictos de Git durante el pull

**Solución:**
```bash
# Guardar cambios locales (si los hay)
git stash

# Hacer pull
git pull origin main

# Aplicar cambios guardados (si es necesario)
git stash pop
```

### Error: Puerto ya en uso

**Diagnóstico:**
```bash
# Ver qué proceso está usando el puerto (ejemplo: 5000)
lsof -i :5000
```

**Solución:**
```bash
# Matar el proceso
kill -9 [PID]

# O reiniciar PM2
pm2 restart apptqw
```

---

## 📝 Checklist de Despliegue

- [ ] Cambios locales comprometidos y pusheados a GitHub
- [ ] Conectado al servidor correcto (`telqway`)
- [ ] Pull exitoso desde `origin/main`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Build completado sin errores
- [ ] Aplicación reiniciada con PM2
- [ ] Estado verificado: `pm2 status` muestra "online"
- [ ] Logs revisados: sin errores críticos
- [ ] Aplicación accesible desde el navegador

---

## 🔐 Configuración SSH

El archivo de configuración SSH está en: `C:\Users\pc\.ssh\config`

```ssh-config
Host telqway
    HostName 45.236.128.91
    User root
    Port 35988
    IdentityFile ~/.ssh/gestar_ssh
    IdentitiesOnly yes
```

---

## 📞 Contacto y Soporte

- **Proyecto:** AppTQW
- **Repositorio:** https://github.com/bikayze-gif/AppTQW
- **Rama Principal:** `main`
- **Servidor:** gestarservicios-dev.cl (45.236.128.91)

---

## 📦 Cambios Pendientes de Despliegue (Enero 2026)

### 🚚 Módulo Logístico (Supervisor)
- **Panel de Detalle Optimizado:** Nueva vista lateral (45% ancho) con desglose de materiales en formato tabla.
- **Acciones Directas:** Implementación de botones de **Aprobar** y **Rechazar** por cada ítem de material, con actualización inmediata en base de datos.
- **KPIs Visuales:** Indicadores de "Total Items" y "Cantidad Total" integrados en una sola fila para maximizar espacio vertical.
- **Actualización Dinámica:** Sistema de sondeo (polling) cada 5 segundos para reflejar nuevas solicitudes en tiempo real sin recargar.
- **Legibilidad:** Incremento del 20% en el tamaño de fuente de los encabezados críticos.

### ⚙️ Backend y Seguridad
- **Validación de Sesión:** Nuevo middleware de timeout (6 horas) para cerrar sesiones inactivas automáticamente.
- **Logging Extendido:** Trazabilidad completa en la creación de solicitudes de material para depuración.
- **Corrección de Duplicidad:** Optimización de queries SQL con `GROUP BY` y agregaciones para evitar duplicados causados por inconsistencias en `tb_user_tqw`.
- **Compatibilidad SQL:** Ajuste de consultas para modo `ONLY_FULL_GROUP_BY`.
- **Estandarización:** Unificación de nombres de tablas a minúsculas (`tb_logis_tecnico_solicitud`) para compatibilidad Linux/Windows.

### 🧪 Pruebas Recomendadas (Post-Despliegue)
1. Verificar que el panel lateral de logística cargue los materiales correctamente sin duplicados.
2. Probar la aprobación de un ítem y confirmar que los flags en DB cambien a `164`, `APROBADO` y `1`.
3. Validar que la tabla se actualice sola cada 5 segundos al recibir un nuevo registro.

---

## 📅 Historial de Despliegues

| Fecha | Versión/Commit | Cambios Principales | Estado |
|-------|----------------|---------------------|--------|
| 2026-01-14 | PENDING | Módulo Logístico, Polling, Seguridad Sesiones | ⏳ Pendiente |
| 2026-01-08 | 7bd2d6f | Workflow updates, UI improvements | ✅ Exitoso |

---

**Última actualización:** 2026-01-14
