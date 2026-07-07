# Build CSS de Tailwind para CONCASAYA
# Uso:
#   .\scripts\build-css.ps1            # compila una vez
#   .\scripts\build-css.ps1 -Watch     # recompila al detectar cambios
#   npm run build:css                  # equivalente al primero (PowerShell o bash)
#   npm run build:css:watch            # equivalente al segundo
#
# Pre-requisito: node_modules con tailwindcss instalado. Si no existe, ejecutar:
#   npm install
#
# El output se genera en assets/css/tailwind.css (versionado en git).
# Despues de modificar HTML/JS que use clases Tailwind nuevas, correr este script
# y commit el CSS regenerado.

param(
    [switch]$Watch = $false
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path "node_modules\tailwindcss")) {
    Write-Host "tailwindcss no esta instalado. Ejecutando npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install fallo" -ForegroundColor Red
        exit 1
    }
}

$input  = Join-Path $root "src\tailwind\input.css"
$output = Join-Path $root "assets\css\tailwind.css"

if (-not (Test-Path $input)) {
    Write-Host "ERROR: no existe $input" -ForegroundColor Red
    exit 1
}

if ($Watch) {
    Write-Host "Modo watch: Ctrl+C para detener" -ForegroundColor Cyan
    & node node_modules\tailwindcss\lib\cli.js --input "$input" --output "$output" --watch
} else {
    Write-Host "Compilando Tailwind..." -ForegroundColor Cyan
    & node node_modules\tailwindcss\lib\cli.js --input "$input" --output "$output" --minify
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: compilacion fallo" -ForegroundColor Red
        exit 1
    }
    $size = (Get-Item $output).Length
    Write-Host "OK: $output ($([math]::Round($size / 1KB, 1)) KB)" -ForegroundColor Green
}
