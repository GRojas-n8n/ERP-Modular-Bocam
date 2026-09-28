## Context

Ventas monta `requireProjectAccess()` + `requireActiveProject()` globalmente (commit `c65e6ab`). `Cliente` no tiene `proyecto_id` y su política RLS es solo por tenant (`rls_clientes_tenant`), igual que `Proveedor` en Compras, donde `/proveedores` ya está exento vía `isTenantCatalog`. El alta de Centro de Costos (`AdminView`, roles `admin`/`gerencia_tecnica`/`control_proyectos`) necesita listar y crear clientes antes de que exista o se seleccione un proyecto.

## Goals / Non-Goals

**Goals:** poder crear Centros de Costos sin proyecto previo; corregir RFC provisionales de clientes y proveedores; errores visibles.

**Non-Goals:** cambiar el modelo de datos, dar edición de clientes a roles distintos de `admin`, tocar cotizaciones/facturas, resolver la salida de sesión al guardar un proyecto.

## Decisions

1. **Exención por ruta, no por rol.** Un middleware sobre `/api/v1/ventas` omite `requireProjectAccess` y `requireActiveProject` para `/clientes` y `/clientes/*`. Alternativa descartada: eximir solo a `admin` (dejaba fuera a `gerencia_tecnica`/`control_proyectos`, que también dan de alta proyectos). El JWT sigue siendo obligatorio y RLS por tenant sigue aislando datos.
2. **`PUT /clientes/:id` solo `admin`**, mismo criterio que la importación masiva. `POST /clientes` conserva su falta de guard de rol previa (fuera de alcance).
3. **RFC editable** en cliente y proveedor con normalización `trim().toUpperCase()`; unicidad `(tenant_id, rfc_tax_id)` → `409`. Para proveedor el mensaje aclara que el RFC puede estar archivado.
4. **Front:** Ventas ya no está en `projectScopedViews`; `VentasView` decide por pestaña. Los errores se leen de `data.message ?? data.error.message` porque los middlewares de auth responden con `error.message`.

## Risks / Trade-offs

- Cualquier usuario autenticado del tenant puede listar/crear clientes sin proyecto (ya podía crearlos con proyecto). Aceptado: es catálogo por tenant.
- Cambio ya desplegado sin spec previa (regularización); no se respetó el orden test→código. Los tests de integración quedaron escritos pero sin ejecutar localmente.
- Causa no confirmada de la salida de sesión al guardar un proyecto: se investiga aparte (posible vencimiento del access token de 15 min con refresh fallido, o el límite absoluto `JWT_MAX_SESSION_HOURS`).
