## Why

Alimentar el catálogo de Clientes hoy requiere capturar uno por uno desde
el formulario "Nuevo Cliente" en `VentasView.tsx`. Bocam pidió poder
alimentar rápidamente el catálogo vía un archivo CSV/Excel, validando la
integridad de los datos en el proceso — sin bloquear el flujo completo
por un renglón inválido.

Este es el primero de 3 changes independientes (uno por microservicio,
per regla del proyecto de que un spec cubre un solo microservicio):
Clientes (`ventas`, este change), Proveedores (`compras`) y Empleados
(`personal`). Los 3 comparten el mismo patrón de UX/validación, pero cada
uno tiene su propio modelo de datos y reglas de negocio.

## What Changes

- Nuevo endpoint `POST /api/v1/ventas/clientes/importar-lote` (rol
  `admin` — operación de mayor riesgo que la alta individual, que hoy no
  tiene restricción de rol): recibe un arreglo de registros ya parseados
  (`{ registros: Array<{ rfc_tax_id, razon_social, email_contacto?,
  telefono?, codigo_cliente? }> }`), valida cada uno con las mismas
  reglas que `POST /clientes` (rfc_tax_id y razon_social obligatorios,
  codigo_cliente con formato de 3 dígitos si se envía, sin duplicar
  rfc_tax_id/codigo_cliente ya existentes en el tenant NI duplicados
  dentro del mismo lote), crea los válidos y reporta los inválidos por
  fila sin abortar el lote completo.
- Nueva utilidad compartida en `apps/app-shell/src/lib/csvImport.ts`:
  parsea un archivo CSV o Excel (reutiliza la librería `xlsx` ya
  instalada en `app-shell`) a un arreglo de objetos por encabezado de
  columna. Reutilizable por los changes de Proveedores y Empleados que
  siguen a este.
- `VentasView.tsx` (tab Clientes): botón "Importar CSV/Excel" junto a
  "Nuevo Cliente" — selecciona archivo, muestra una vista previa con
  conteo de válidos/inválidos antes de confirmar, envía el lote, muestra
  el resultado (creados vs. errores por fila).

## Capabilities

### New Capabilities
- `carga-masiva-clientes`: importación masiva de Clientes desde
  CSV/Excel, con reporte de errores por fila sin abortar el lote.

### Modified Capabilities
(ninguna)

## Impact

- **Backend (`apps/ventas`)**: `src/main.ts` (nuevo endpoint
  `POST /clientes/importar-lote`, ~junto a `POST /clientes` línea 56).
- **Frontend (`apps/app-shell`)**: nuevo `src/lib/csvImport.ts`
  (utilidad compartida), `VentasView.tsx` (tab Clientes).
- Sin cambios de schema — usa las mismas columnas y constraints que
  `POST /clientes` ya tiene.
