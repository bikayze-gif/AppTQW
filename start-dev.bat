@echo off
title Iniciando Ambiente de Desarrollo - AppTQW
color 0A
echo.
echo ========================================
echo    INICIANDO AMBIENTE DE DESARROLLO
echo ========================================
echo.
echo [INFO] Tu aplicación usa Vite en modo middleware
echo [INFO] El servidor backend sirve FRONTEND + BACKEND en un solo puerto
echo [INFO] Puerto: 5000
echo.
echo Abriendo servidor en 2 segundos...
timeout /t 2 /nobreak >nul

REM Iniciar el servidor de desarrollo (incluye frontend y backend)
start "AppTQW Dev Server" cmd /k "color 0B && title AppTQW Dev Server (Puerto 5000) && echo. && echo ========================================== && echo    SERVIDOR DE DESARROLLO - AppTQW && echo ========================================== && echo. && echo Frontend + Backend en puerto 5000 && echo. && npm run dev"

echo.
echo ========================================
echo    SERVIDOR INICIADO CORRECTAMENTE
echo ========================================
echo.
echo [OK] Servidor de desarrollo corriendo
echo.
echo Accede a tu aplicación en:
echo   http://localhost:5000
echo.
echo Puedes cerrar esta ventana de forma segura.
echo Los logs apareceran en la ventana abierta.
echo.
echo Para detener el servidor:
echo   - Presiona Ctrl+C en la ventana del servidor
echo   - O cierra directamente la ventana
echo.
pause
