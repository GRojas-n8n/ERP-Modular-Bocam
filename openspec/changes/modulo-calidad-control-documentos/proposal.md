## Why

El sistema carece de un módulo de Gestión de Calidad, dejando sin soporte digital la cláusula 7.5 (Información Documentada) de la norma ISO 9001:2015 — el pilar más operativo del SGC para una constructora. Planos, procedimientos, instructivos y especificaciones técnicas se gestionan hoy de forma manual o en repositorios ad-hoc sin control de versiones, sin flujo de aprobación y sin trazabilidad de quién tiene qué versión vigente.

## What Changes

- **Nuevo microservicio** `calidad` (puerto 3009) con schema Prisma propio y endpoints REST
- **Nuevo rol** `calidad` — Responsable del Sistema de Gestión de Calidad
- **Control de versiones de documentos** con flujo de estado: `BORRADOR → EN_REVISION → VIGENTE → OBSOLETO`
- **Almacenamiento de archivos** directamente en el sistema (PDF, DWG, DXF, DOCX, XLSX) via upload multipart, guardados en volumen Docker `/data/calidad/uploads/`
- **Alcance corporativo (tenant-level)** — los documentos del SGC pertenecen al tenant, no a un proyecto específico (aunque pueden referenciar proyectos)
- **Nueva vista `CalidadView`** en el frontend con sub-item "Documentos" en el sidebar
- **Nuevo nav item** "Calidad" en `ALL_NAV_ITEMS` visible para roles `calidad` y `admin`

## Capabilities

### New Capabilities

- `gestion-documentos`: Registro, categorización y búsqueda de documentos del SGC con código único por tenant, tipo de documento y responsable asignado
- `control-versiones`: Ciclo completo de versiones por documento — crear versión, subir archivo, transicionar estado (BORRADOR → EN_REVISION → VIGENTE → OBSOLETO), con lógica de que solo una versión puede estar VIGENTE simultáneamente
- `almacenamiento-archivos`: Upload de archivos (PDF, DWG, DXF, DOCX, XLSX, PNG, JPG) via multipart/form-data, almacenados en volumen Docker `/data/calidad/uploads/{tenant_id}/{doc_id}/{version_id}.{ext}`, con endpoint de descarga autenticado
- `dashboard-calidad`: Vista resumen con KPIs del SGC: total documentos por estado, documentos por tipo, versiones pendientes de revisión/aprobación

### Modified Capabilities

*(Ninguna — módulo completamente nuevo, sin cambios en specs existentes)*

## Impact

- **Nuevo módulo backend:** `apps/calidad/` — microservicio independiente, sin JOINs con otros módulos
- **Frontend:** `apps/app-shell/src/views/CalidadView.tsx` (nueva), `Layout.tsx` (nuevo nav item + sub-items), `App.tsx` (nuevo case en renderView)
- **Docker:** nueva entrada `calidad` en `docker-compose.vps.yml` (profile `core`), nuevo `Dockerfile.calidad`, nuevo volumen `vps_calidad_uploads`
- **Nginx (app-shell):** nuevo bloque `location /api/v1/calidad/` en `docker/nginx.qnap.conf`
- **Sin cambios en:** otros backends, `api.ts`, `TenantContext.tsx`, bus de eventos (no se publican eventos en MVP)
