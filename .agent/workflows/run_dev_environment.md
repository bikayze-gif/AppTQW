---
description: Ejecutar el ambiente de desarrollo para AppTQW
---

## Pasos para iniciar el entorno de desarrollo

1. **Instalar dependencias (si no están instaladas)**
   ```bash
// turbo
   npm install
   ```
   // turbo

2. **Iniciar el cliente (frontend) con Vite**
   ```bash
// turbo
   npm run dev:client
   ```
   // turbo

3. **Iniciar el servidor (backend) en modo desarrollo**
   ```bash
// turbo
   npm run dev
   ```
   // turbo

4. **Abrir el navegador**
   - Visita `http://localhost:5000` para el cliente.
   - El servidor escuchará en el puerto configurado en `server/index-dev.ts` (por defecto 3000).

## Notas
- Los pasos 2 y 3 deben ejecutarse en terminales separadas o usar una herramienta como `concurrently` para ejecutarlos simultáneamente.
- Si deseas detener los procesos, presiona `Ctrl+C` en cada terminal.
- Asegúrate de que el puerto 5000 esté libre; el script `predev` lo libera automáticamente.
