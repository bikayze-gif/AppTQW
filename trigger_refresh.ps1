# Script para disparar actualizacion en tiempo real del Monitor Diario
# Ejecutar este script despues de que tu proceso ETL actualice la base de datos

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DISPARANDO ACTUALIZACION EN TIEMPO REAL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/monitor/refresh" -Method Post
    
    if ($response.success) {
        Write-Host "OK - Senal enviada exitosamente" -ForegroundColor Green
        Write-Host "   Mensaje: $($response.message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Los dashboards conectados se actualizaran INMEDIATAMENTE" -ForegroundColor Yellow
    } else {
        Write-Host "ADVERTENCIA - Respuesta inesperada del servidor" -ForegroundColor Yellow
        Write-Host $response
    }
} catch {
    Write-Host "ERROR - No se pudo enviar senal de actualizacion" -ForegroundColor Red
    Write-Host "   Detalles: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Verifica que el servidor este corriendo en http://localhost:5000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
