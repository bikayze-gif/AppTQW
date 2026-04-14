@echo off
setlocal enabledelayedexpansion
title Iniciando Ambiente de Desarrollo - AppTQW
color 0A
echo.
echo ========================================
echo    INICIANDO AMBIENTE DE DESARROLLO
echo ========================================
echo.
echo [INFO] Frontend + Backend en puerto 5001
echo.

REM ========================================
REM  PASO 1: Watchdog SSH (auto-reconexion)
REM ========================================
echo [SSH] Iniciando watchdog SSH con auto-reconexion...

REM Matar watchdog previo si existe
taskkill /FI "WINDOWTITLE eq SSH Watchdog - AppTQW" /F >nul 2>&1

REM Capturar ruta del script antes de entrar en contexto cmd anidado
set "WATCHDOG_SCRIPT=%~dp0ssh-tunnel-watchdog.ps1"

REM Lanzar watchdog en ventana separada (se mantiene vivo todo el tiempo)
start "SSH Watchdog - AppTQW" cmd /k "title SSH Watchdog - AppTQW && color 0E && powershell -ExecutionPolicy Bypass -NoProfile -File ""%WATCHDOG_SCRIPT%"""

REM Esperar a que el tunel este listo (max 20s)
echo [SSH] Esperando tunel SSH en localhost:3307...
set TUNNEL_OK=0
for /L %%i in (1,1,20) do (
    if !TUNNEL_OK!==0 (
        timeout /t 1 /nobreak >nul
        netstat -an | findstr "127.0.0.1:3307" | findstr "LISTENING" >nul 2>&1
        if !errorlevel!==0 (
            set TUNNEL_OK=1
            echo [SSH] Tunel activo.
        )
    )
)

if !TUNNEL_OK!==0 (
    echo.
    echo [WARN] Tunel SSH no disponible aun.
    echo [WARN] El watchdog seguira intentando en segundo plano.
    echo [WARN] La app puede tardar en conectar a MySQL.
    echo.
)

echo.

REM ========================================
REM  PASO 2: Servidor de desarrollo
REM ========================================
echo [DEV] Iniciando servidor de desarrollo...
timeout /t 2 /nobreak >nul

start "AppTQW Dev Server" cmd /k "cd /d \"%~dp0\" && color 0B && title AppTQW Dev Server (Puerto 5001) && echo. && echo ========================================== && echo    SERVIDOR DE DESARROLLO - AppTQW && echo ========================================== && echo. && echo Frontend + Backend en puerto 5001 && echo. && npm run dev"

echo.
echo ========================================
echo    AMBIENTE INICIADO
echo ========================================
echo.
echo [OK] Watchdog SSH activo (auto-reconexion)
echo [OK] Servidor de desarrollo corriendo
echo.
echo Ventanas abiertas:
echo   - SSH Watchdog - AppTQW  (tunel con auto-reconexion)
echo   - AppTQW Dev Server      (servidor en puerto 5001)
echo.
echo Accede en: http://localhost:5001
echo.
echo Esta ventana puede cerrarse de forma segura.
echo Para detener todo, cierra las dos ventanas mencionadas.
echo.
pause
