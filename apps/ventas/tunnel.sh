#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# tunnel.sh — Expone el módulo de Ventas al exterior vía localtunnel
# Uso: bash apps/ventas/tunnel.sh
# Requiere: Node.js (ya instalado en este monorepo)
# -----------------------------------------------------------------------------

PORT=3012
echo ""
echo "======================================================"
echo "  BOCAM ERP — Túnel externo para Módulo de Ventas"
echo "======================================================"
echo "  Puerto local : http://localhost:$PORT"
echo "  Abriendo túnel con localtunnel (npx, sin instalar)..."
echo "  Cuando aparezca la URL pública, compártela con Alejandro."
echo "======================================================"
echo ""

npx --yes localtunnel --port $PORT --subdomain bocam-ventas 2>&1 || \
  npx --yes localtunnel --port $PORT
