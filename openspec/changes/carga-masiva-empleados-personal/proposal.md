## Why

Alimentar el catálogo de Empleados hoy requiere capturar uno por uno
desde el formulario "Nuevo Empleado" en `PersonalView.tsx`. Bocam pidió
poder alimentar rápidamente el catálogo vía un archivo CSV/Excel,
validando la integridad de los datos en el proceso — sin bloquear el
flujo completo por un renglón inválido.

Tercero y último de 3 changes independientes (uno por microservicio, per
regla del proyecto de que un spec cubre un solo microservicio): Clientes
(`ventas`, PR #44) y Proveedores (`compras`, PR #45) ya implementados,
Empleados (`personal`, este change) cierra el punto E del roadmap. Los 3
comparten el mismo patrón de UX/validación y la misma utilidad
`csvImport.ts`.

## What Changes

- Nuevo endpoint `POST /api/v1/personal/empleados/importar-lote` (roles
  `personal_rh`/`admin` — mismo rol que ya protege el resto de
  operaciones de escritura de este módulo, ej. `PATCH /empleados/:id`;
  la alta individual `POST /empleados` hoy no tiene restricción de rol,
  este endpoint sí, por ser de mayor riesgo): recibe un arreglo de
  registros ya parseados (`{ registros: Array<{ nombre,
  apellido_paterno, apellido_materno?, rfc, curp?, nss?, puesto,
  categoria?, tipo_contrato?, fecha_ingreso?, salario_diario,
  telefono?, email? }> }`), valida cada uno con las mismas reglas que
  `POST /empleados` (nombre/apellido_paterno/rfc/puesto/salario_diario
  obligatorios), asigna `numero_empleado` autoincremental igual que la
  alta individual, sin duplicar `rfc` ya existente en el tenant NI
  duplicado dentro del mismo lote, crea los válidos y reporta los
  inválidos por fila sin abortar el lote completo.
- `PersonalView.tsx` (tab Empleados): botón "Importar CSV/Excel" junto a
  "Nuevo Empleado" — selecciona archivo, muestra una vista previa con
  conteo de válidos/inválidos antes de confirmar, envía el lote, muestra
  el resultado (creados vs. errores por fila). Reutiliza
  `apps/app-shell/src/lib/csvImport.ts` (ya creado en el change de
  Clientes, sin modificarlo).

## Capabilities

### New Capabilities
- `carga-masiva-empleados`: importación masiva de Empleados desde
  CSV/Excel, con reporte de errores por fila sin abortar el lote.

### Modified Capabilities
(ninguna)

## Impact

- **Backend (`apps/personal`)**: `src/main.ts` (nuevo endpoint
  `POST /empleados/importar-lote`, ~junto a `POST /empleados` línea 65).
- **Frontend (`apps/app-shell`)**: `PersonalView.tsx` (tab Empleados).
  Reutiliza `src/lib/csvImport.ts` existente, sin cambios ahí.
- Sin cambios de schema — usa las mismas columnas y constraints que
  `POST /empleados` ya tiene.
