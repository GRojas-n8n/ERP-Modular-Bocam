# Design — proveedores-catalogo-v2

## Context

El módulo `compras` es propietario del catálogo de proveedores (Proveedor). El modelo actual tiene 5 campos útiles. Este change amplía el modelo y agrega gestión de documentos sin cambiar el contrato existente con otros módulos (los endpoints actuales de `/proveedores` mantienen su forma).

## Goals

- Registrar segmentación logística, crédito y cumplimiento por proveedor.
- Almacenar documentos fiscales y de calidad ligados al proveedor (mismo servidor, mismo volumen Docker).
- Visibilidad del status crediticio desde la lista de proveedores en ComprasView.

## Non-Goals

- Validación automática de opinión SAT contra el servicio del SAT (fuera de scope).
- Cálculo automático de calificación de desempeño (se captura manual).
- Integración con contabilidad para los documentos fiscales (fuera de scope).

## Decisions

**D1 — Almacenamiento de documentos en compras, no en contabilidad.**
Mismo patrón que `FichaTecnicaInsumo` en gerencia-tecnica: multer + volumen Docker + endpoints propios. Decisión del usuario confirmada. Permite autonomía del módulo de compras.

**D2 — `tipo_proveedor` no reemplaza `estatus`.**
`estatus` (ACTIVO/VETADO/PENDIENTE) sigue siendo el control operativo. `tipo_proveedor` (NACIONAL/EXTRANJERO) y `estatus_credito` son dimensiones independientes. Un proveedor ACTIVO puede tener crédito BLOQUEADO.

**D3 — `limite_credito = null` significa sin límite definido, no cero.**
El equipo de Finanzas define límites cuando corresponde. `null` no bloquea al proveedor.

**D4 — `calificacion_desempeno` es captura manual, no calculada.**
Basada en historial de entregas evaluado por el comprador. Rango 0.00–5.00 para alinear con estándares ISO de evaluación de proveedores.

## Risks

**R1 — Migración en VPS con proveedores existentes.**
Los campos nuevos tienen defaults o son nullable, por lo que `ALTER TABLE` es seguro sin afectar registros existentes. Prisma migrate apply no requiere downtime.

**R2 — Espacio en disco para documentos.**
Cada proveedor podría subir varios PDFs. Límite recomendado: 10 MB por archivo. El volumen Docker se puede monitorear igual que `vps_fichas_uploads`.

## Migration Plan

1. Añadir campos a `Proveedor` en schema.prisma — todos nullable o con default → `prisma migrate dev`.
2. Crear modelo `DocumentoProveedor` → `prisma migrate dev`.
3. Configurar multer en `main.ts` para `DOCS_PROVEEDORES_UPLOAD_DIR`.
4. Agregar volumen en `docker-compose.vps.yml`.
5. Implementar 4 endpoints de documentos.
6. Actualizar frontend (formulario + SideSheet de documentos).
7. Migrar en VPS: `prisma migrate deploy` en contenedor compras.
8. Rebuild `compras` y `app-shell`.
