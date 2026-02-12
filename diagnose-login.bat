@echo off
title Diagnóstico de Login - AppTQW
color 0E
echo.
echo ========================================
echo    DIAGNÓSTICO DE LOGIN
echo ========================================
echo.
echo Ejecutando script de diagnóstico...
echo.

npx tsx server/diagnose-login.ts

echo.
echo ========================================
echo.
pause
