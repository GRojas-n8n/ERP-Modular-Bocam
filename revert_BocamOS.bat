@echo off
cd /d "D:\01_PROFESIONAL\Mis_Scripts_IA\Flujos Agenticos\Proyecto ERP MODULAR Bocam"
echo.
echo ============================================
echo   BocamOS ERP - Revertir Version
echo ============================================
echo.
echo Ultimas 10 versiones:
echo.
git log --oneline -10
echo.
set /p codigo="Pega el codigo de la version buena (ej: a5cd0e9): "
echo.
echo Revirtiendo a version %codigo%...
git revert %codigo% --no-edit
if %ERRORLEVEL% neq 0 (
  echo ERROR: No se pudo revertir. Verifica el codigo ingresado.
  pause
  exit /b 1
)
echo.
echo Subiendo revert a GitHub y VPS...
powershell -ExecutionPolicy Bypass -File ".\git-push.ps1" "revert: volver a version %codigo%"
pause
