#!/bin/bash

# -----------------------------------------------------------------------------
# Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
# Script: Despliegue Automatizado (BOCAM ERP)
# -----------------------------------------------------------------------------

# Colores para la consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🏗️  DESPLIEGUE: ECOSISTEMA BOCAM ERP MODULAR${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1. Verificar existencia de .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado.${NC}"
    echo -e "Copia .env.prod.example a .env y configura tus credenciales primero."
    exit 1
fi

# 2. Detener contenedores previos si existen
echo -e "${YELLOW}🔄 Deteniendo servicios previos...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans

# 3. Construir y Levantar Imágenes
echo -e "${YELLOW}🛠️  Construyendo imágenes de producción...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Esperar a que la DB esté lista
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# 5. Ejecutar Migraciones de Base de Datos
echo -e "${YELLOW}🔄 Ejecutando migraciones de Prisma...${NC}"
docker exec bocam-gerencia-tecnica npx prisma migrate deploy
docker exec bocam-compras npx prisma migrate deploy

# 6. Aplicar Políticas de Row-Level Security (RLS)
echo -e "${YELLOW}🛡️  Aplicando políticas RLS en PostgreSQL...${NC}"
docker exec -i bocam-postgres-prod psql -U ${DB_USER:-postgres} -d bocam_erp < apps/gerencia-tecnica/prisma/rls-policies.sql
docker exec -i bocam-postgres-prod psql -U ${DB_USER:-postgres} -d bocam_erp < apps/compras/prisma/rls-policies.sql

# 7. Sembrado de Datos (Solo si se solicita)
read -p "¿Deseas ejecutar el SEED de datos de prueba? (s/n): " RUN_SEED
if [ "$RUN_SEED" == "s" ]; then
    echo -e "${YELLOW}🌱 Sembrando datos base...${NC}"
    docker exec bocam-gerencia-tecnica npx prisma db seed
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
echo -e "${GREEN}  🌐 App Shell: http://localhost (Puerto 80)${NC}"
echo -e "${GREEN}  📡 API Gateway: http://localhost:3001${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
