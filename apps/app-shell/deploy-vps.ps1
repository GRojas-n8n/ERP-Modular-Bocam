# ============================================================
# deploy-vps.ps1  -  BocamOS ERP - Deploy al VPS Hostinger
# Uso:  .\deploy-vps.ps1
# ============================================================

$VPS_IP     = "72.60.114.12"
$VPS_USER   = "root"
$REMOTE_DIR = "/var/www/bocam-erp/dist"
$LOCAL_DIST = "$PSScriptRoot\dist"
$LOCAL_CONF = "$PSScriptRoot\bocam-erp.conf"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BocamOS ERP - Deploy al VPS              " -ForegroundColor Cyan
Write-Host "  Destino: $VPS_USER@$VPS_IP               " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# -- PASO 1: Build limpio ------------------------------------
Write-Host "[1/5] Build de produccion..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm run build:clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: El build fallo. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "      Build OK" -ForegroundColor Green

# -- PASO 2: Crear directorios en el VPS --------------------
Write-Host ""
Write-Host "[2/5] Preparando directorios en el VPS..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $REMOTE_DIR && chown -R www-data:www-data /var/www/bocam-erp && chmod -R 755 /var/www/bocam-erp"
Write-Host "      Directorios OK" -ForegroundColor Green

# -- PASO 3: Subir archivos dist ----------------------------
Write-Host ""
Write-Host "[3/5] Subiendo dist/ al VPS (SCP)..." -ForegroundColor Yellow
Write-Host "      Origen:  $LOCAL_DIST" -ForegroundColor Gray
Write-Host "      Destino: ${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/" -ForegroundColor Gray
Write-Host ""

scp -r "$LOCAL_DIST\." "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SCP fallo. Verifica tu conexion SSH." -ForegroundColor Red
    exit 1
}
Write-Host "      Archivos subidos OK" -ForegroundColor Green

# -- PASO 4: Subir y activar config de Nginx ----------------
Write-Host ""
Write-Host "[4/5] Configurando Nginx..." -ForegroundColor Yellow

scp "$LOCAL_CONF" "${VPS_USER}@${VPS_IP}:/tmp/bocam-erp.conf"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo subir bocam-erp.conf." -ForegroundColor Red
    exit 1
}

ssh "${VPS_USER}@${VPS_IP}" "cp /tmp/bocam-erp.conf /etc/nginx/sites-available/bocam-erp"
ssh "${VPS_USER}@${VPS_IP}" "ln -sf /etc/nginx/sites-available/bocam-erp /etc/nginx/sites-enabled/bocam-erp"
ssh "${VPS_USER}@${VPS_IP}" "rm -f /etc/nginx/sites-enabled/default"
ssh "${VPS_USER}@${VPS_IP}" "nginx -t"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La configuracion de nginx tiene errores. Revisa bocam-erp.conf." -ForegroundColor Red
    exit 1
}
Write-Host "      Nginx configurado OK" -ForegroundColor Green

# -- PASO 5: Recargar Nginx ---------------------------------
Write-Host ""
Write-Host "[5/5] Recargando Nginx..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "systemctl enable nginx"
ssh "${VPS_USER}@${VPS_IP}" "systemctl reload nginx"
$nginxStatus = ssh "${VPS_USER}@${VPS_IP}" "systemctl is-active nginx"
Write-Host "      Estado nginx: $nginxStatus" -ForegroundColor Green

# -- Resultado ----------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Deploy completado exitosamente!          " -ForegroundColor Green
Write-Host "  URL: http://$VPS_IP                      " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
