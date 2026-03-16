# 🛒 Módulo Compras (Procuración) - Especificaciones Técnicas

Este módulo se encarga de la gestión de Requisiciones, Órdenes de Compra y Proveedores, operando como un microservicio independiente dentro del ecosistema BOCAM.

## 🏗️ Arquitectura de Datos (Prisma)
Se ha implementado el esquema `apps/compras/prisma/schema.prisma` con las siguientes entidades MDM y Transaccionales:

- **Proveedores (Terceros):** Segregados por `tenant_id`.
- **Requisiciones:** Segregadas por `tenant_id` y `proyecto_id` (Centro de Costos).
- **Órdenes de Compra:** Segregadas por `tenant_id` y `proyecto_id`.

### Aislamiento RLS (PostgreSQL)
Se han aplicado las siguientes políticas en `apps/compras/prisma/rls-policies.sql`:
- Filtrado estricto por `tenant_id` para garantizar que una constructora no vea datos de otra.
- Filtrado por `proyecto_id` para aislar los costos y compras de diferentes frentes de obra.

## 🛰️ Microservicio (Backend)
- **Tecnología:** Node.js + Express + Prisma.
- **Puerto:** 3002.
- **Gateway:** Integrado en el Nginx del App Shell para exposición unificada a través de `/api/v1/compras`.

## 🎨 Frontend (App Shell Integration)
- **Vista:** `apps/app-shell/src/views/ComprasView.tsx`.
- **Servicio:** Se consume a través del cliente API centralizado (`lib/api.ts`) que inyecta automáticamente los headers de seguridad RLS.

## 🚀 Despliegue
Para desplegar este nuevo módulo, el script `deploy.sh` ha sido actualizado. Pasos automáticos:
1. Construcción de imagen Docker `bocam-compras`.
2. Aplicación de migraciones de Prisma.
3. Inyección de políticas RLS en la base de datos de producción.

---
> [!IMPORTANT]
> El aislamiento de datos se garantiza tanto a nivel aplicación (contextHandler) como a nivel base de datos (PostgreSQL RLS), cumpliendo con las directivas de **AGENTS.md**.
