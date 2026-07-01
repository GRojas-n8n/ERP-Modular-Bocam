## Context

El sistema iRetum aisla los datos de cada proyecto (Centro de Costos) mediante JWT: el `auth-middleware` extrae `req.securityContext.proyectoId` del token y cada microservicio lo usa en sus queries.

Calidad fue diseñado en una etapa donde el sistema era single-project y nunca se actualizó al patrón multi-proyecto. Al activar el selector de CC, el módulo seguía mostrando todos los registros del tenant sin importar qué proyecto estuviera activo.

## Goals / Non-Goals

**Goals:**
- Backend Calidad: todos los GET/POST usan `proyectoId` del JWT en los filtros WHERE y en los CREATE
- GET de recurso individual (por ID) también verifica que pertenece al `proyecto_id` del token (bloqueo de acceso cruzado)
- Frontend: re-fetch automático al cambiar `currentProjectId`

**Non-Goals:**
- Migrar datos históricos (los registros sin `proyecto_id` en DB se quedan sin filtro aplicado — no aplica porque el campo `proyecto_id` ya existía en el schema de Calidad)
- Aplicar aislamiento a sub-entidades (`VersionDocumento`, `AccionCorrectiva`, `HallazgoAuditoria`) — no tienen columna `proyecto_id` propia; son sub-entidades de entidades ya aisladas

## Decisions

### D1: `proyecto_id` del JWT, no del body

En el patrón de seguridad del proyecto, nunca se acepta `proyecto_id` del body del request. El JWT es el único vector confiable (verificado criptográficamente por el `auth-middleware`). Los endpoints de creación obtienen `proyectoId` de `req.securityContext.proyectoId`.

### D2: GET por ID verifica `proyecto_id` además del ID del recurso

Un usuario con token del proyecto A no debe poder leer un documento del proyecto B aun conociendo su UUID. Los endpoints `GET/PATCH/DELETE /calidad/*/:id` incluyen `proyecto_id: proyectoId` en el `findFirst` para bloquear acceso cruzado.

### D3: Dashboard — solo counts de entidades con `proyecto_id`

El dashboard de Calidad suma 8 counts (NC×4, Auditoría×2, Documento×2). Las sub-entidades (`AccionCorrectiva`, `HallazgoAuditoria`, `VersionDocumento`) no tienen `proyecto_id` propio — sus counts siguen siendo tenant-level, lo cual es aceptable al ser sub-entidades de entidades ya aisladas.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Registros pre-existentes sin `proyecto_id` quedan inaccesibles | No aplica — el campo `proyecto_id` ya existía en el schema desde el diseño inicial |
| Sub-entidades muestran conteos de todo el tenant en el dashboard | Aceptable: el count de acciones correctivas pendientes es útil a nivel tenant (no por proyecto) |
| `prisma db push` en VPS necesario si se agregan columnas | Se verificó: el schema ya incluía `proyecto_id` en todas las entidades principales |
