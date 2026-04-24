# ============================================================
# git-push.ps1 — BocamOS ERP
# Uso:  .\git-push.ps1 "mensaje del commit"
# Hace: add -A → commit → push a main
# ============================================================

param(
  [Parameter(Mandatory=$false)]
  [string]$Message = ""
)

Set-Location $PSScriptRoot

# Mensaje por defecto con timestamp si no se pasa uno
if ([string]::IsNullOrWhiteSpace($Message)) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $Message = "chore: actualizacion $timestamp"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BocamOS ERP - Git Push" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Mostrar estado
Write-Host "[1/3] Archivos modificados:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Add y commit
Write-Host "[2/3] Commit: $Message" -ForegroundColor Yellow
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host "      Nada nuevo que commitear." -ForegroundColor Gray
}

# Push
Write-Host ""
Write-Host "[3/3] Push a origin/main..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Push fallido. Verifica tu conexion o autenticacion de GitHub." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Push exitoso!" -ForegroundColor Green
Write-Host "  GitHub Actions iniciara el deploy al VPS" -ForegroundColor Green
Write-Host "  https://github.com/GRojas-n8n/ERP-Modular-Bocam/actions" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
