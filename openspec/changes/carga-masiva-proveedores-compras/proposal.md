## Why

Alimentar el catálogo de Proveedores hoy requiere capturar uno por uno
desde el formulario "Nuevo Proveedor" en `ComprasView.tsx`. Bocam pidió
poder alimentar rápidamente el catálogo vía un archivo CSV/Excel,
validando la integridad de los datos en el proceso — sin bloquear el
flujo completo por un renglón inválido.

Segundo de 3 changes independientes (uno por microservicio, per regla
del proyecto de que un spec cubre un solo microservicio): Clientes
(`ventas`, PR #44) ya implementado, Proveedores (`compras`, este change)
y Empleados (`personal`, pendiente). Los 3 comparten el mismo patrón de
UX/validación (mismo componente `csvImport.ts` ya creado en el change de
Clientes), pero cada uno tiene su propio modelo de datos y reglas de
negocio.

## What Changes

- Nuevo endpoint `POST /api/v1/compras/proveedores/importar-lote` (rol
  `procurement`/`admin` — mismos roles que la alta individual
  `POST /proveedores`): recibe un arreglo de registros ya parseados
  (`{ registros: Array<{ rfc_tax_id, razon_social, email_contacto?,
  telefono?, tipo_proveedor?, calificacion_desempeno? }> }`), valida cada
  uno con las mismas reglas que `POST /proveedores` (rfc_tax_id y
  razon_social obligatorios, calificacion_desempeno entre 0.00 y 5.00 si
  se envía, sin duplicar rfc_tax_id ya existente en el tenant NI
  duplicado dentro del mismo lote), crea los válidos y reporta los
  inválidos por fila sin abortar el lote completo.
- `ComprasView.tsx` (tab Proveedores): botón "Importar CSV/Excel" junto a
  "Nuevo Proveedor" — selecciona archivo, muestra una vista previa con
  conteo de válidos/inválidos antes de confirmar, envía el lote, muestra
  el resultado (creados vs. errores por fila). Reutiliza
  `apps/app-shell/src/lib/csvImport.ts` (ya creado en el change de
  Clientes, sin modificarlo).

## Capabilities

### New Capabilities
- `carga-masiva-proveedores`: importación masiva de Proveedores desde
  CSV/Excel, con reporte de errores por fila sin abortar el lote.

### Modified Capabilities
(ninguna)

## Impact

- **Backend (`apps/compras`)**: `src/main.ts` (nuevo endpoint
  `POST /proveedores/importar-lote`, ~junto a `POST /proveedores` línea
  1807).
- **Frontend (`apps/app-shell`)**: `ComprasView.tsx` (tab Proveedores).
  Reutiliza `src/lib/csvImport.ts` existente, sin cambios ahí.
- Sin cambios de schema — usa las mismas columnas y constraints que
  `POST /proveedores` ya tiene.
