## Why

Regularización **retroactiva** (SDD) del PR #173 (commit `e64168c`), que se desplegó a producción sin spec. Desde `c65e6ab` (2026-09-24) todo Ventas exige proyecto activo, pero `clientes` es un catálogo por tenant (RLS solo por `tenant_id`). Efecto en producción: al dar de alta un Centro de Costos sin proyecto seleccionado el desplegable de clientes salía vacío (error 403 tragado por el front) y "+ Agregar Cliente" fallaba con "Error al crear el cliente" — no se podía crear el proyecto, y como el cliente exigía proyecto activo, tampoco el cliente. Además la vista Ventas se bloqueaba entera sin proyecto, y no había forma de corregir el RFC provisional de un cliente o proveedor capturado con un valor inventado.

## What Changes

- **Ventas (backend):** `/api/v1/ventas/clientes*` deja de exigir proyecto activo / acceso a proyecto (el resto de Ventas lo sigue exigiendo).
- **Ventas (backend):** nuevo `PUT /api/v1/ventas/clientes/:id` (solo `admin`) para editar RFC, razón social, email, teléfono, código de cliente y estatus; el alta normaliza el RFC (`trim().toUpperCase()`), valida longitudes y responde `409` ante RFC/código duplicado; un 500 ya no expone el texto crudo de Prisma.
- **App-shell:** la vista Ventas no se bloquea sin proyecto (la pestaña Clientes siempre; Cotizaciones y Facturas piden proyecto con aviso); botón "Editar" de cliente (admin); los errores del servidor con forma `error.message` se muestran en lugar del mensaje genérico; el formulario de Centro de Costos muestra el error si falla la carga de clientes.
- **Compras (backend):** `PUT /api/v1/compras/proveedores/:id` acepta `rfc_tax_id` (normalizado; `400` si vacío; `409` si duplicado) y rechaza `razon_social` vacía.
- **App-shell (Compras):** el RFC de proveedor es editable; "Nuevo/Editar proveedor" y acciones solo para `procurement`/`admin` (lo que ya exigía la API; el rol `superintendent` los veía y recibía 403).

## Capabilities

### New Capabilities
- `catalogo-clientes-ventas`: alta, listado y edición de Clientes como catálogo por tenant, sin proyecto activo.
- `edicion-proveedor`: edición de datos guardados del Proveedor, incluido el RFC.

### Modified Capabilities
<!-- Ninguna: la excepción a datos-operativos-requieren-proyecto-activo se documenta en design.md; no se altera su requisito para datos con proyecto. -->

## Impact

- `apps/ventas/src/main.ts`, `apps/compras/src/main.ts`.
- `apps/app-shell/src/{App.tsx,lib/api.ts,views/{AdminView,VentasView,ComprasView}.tsx}`.
- Tests: `apps/ventas/test/integration/cliente-sin-proyecto-y-edicion.integration.test.ts`, `apps/compras/test/integration/editar-proveedor.integration.test.ts`.
- Relacionado: `aislamiento-proyecto-por-modulo`, `datos-operativos-requieren-proyecto-activo`, `centro-costos-alta`, `carga-masiva-clientes`.
