## Why

Regularización **retroactiva** (SDD) del PR #173 (commit `e64168c`), que se desplegó a producción sin spec. Desde `c65e6ab` (2026-09-24) todo Ventas exige proyecto activo, pero `clientes` es un catálogo por tenant (RLS solo por `tenant_id`). Efecto en producción: al dar de alta un Centro de Costos sin proyecto seleccionado el desplegable de clientes salía vacío (error 403 tragado por el front) y "+ Agregar Cliente" fallaba con "Error al crear el cliente" — no se podía crear el proyecto, y como el cliente exigía proyecto activo, tampoco el cliente. Además la vista Ventas se bloqueaba entera sin proyecto, y no había forma de corregir el RFC provisional de un cliente o proveedor capturado con un valor inventado.

## What Changes

- **Ventas (backend):** `/api/v1/ventas/clientes*` deja de exigir proyecto activo / acceso a proyecto (el resto de Ventas lo sigue exigiendo).
- **Ventas (backend):** nuevo `PUT /api/v1/ventas/clientes/:id` (solo `admin`) para editar RFC, razón social, email, teléfono, código de cliente y estatus; el alta normaliza el RFC (`trim().toUpperCase()`), valida longitudes y responde `409` ante RFC/código duplicado; un 500 ya no expone el texto crudo de Prisma.
- **App-shell:** la vista Ventas no se bloquea sin proyecto (la pestaña Clientes siempre; Cotizaciones y Facturas piden proyecto con aviso); botón "Editar" de cliente (admin); los errores del servidor con forma `error.message` se muestran en lugar del mensaje genérico; el formulario de Centro de Costos muestra el error si falla la carga de clientes.
- **Smoke post-deploy (corrección posterior, hallazgo del deploy de #172):** el smoke `sin proyecto activo, los módulos project-scoped quedan bloqueados` quedó **obsoleto** tras #173: seguía exigiendo que Ventas se bloqueara por completo y que no saliera ninguna petición a `/api/v1/ventas/`, cuando Clientes es tenant-scoped y Cotizaciones/Facturas siguen siendo project-scoped. Está en rojo desde el deploy de #173 (`e64168c`). Se actualiza para reflejar el contrato: Ventas fuera de los módulos totalmente bloqueados; única petición permitida sin proyecto = `GET /api/v1/ventas/clientes` (coincidencia exacta de método + ruta, con o sin query string, nunca por prefijo); Cotizaciones y Facturas muestran el aviso y no consultan.
- **Compras (backend):** `PUT /api/v1/compras/proveedores/:id` acepta `rfc_tax_id` (normalizado; `400` si vacío; `409` si duplicado) y rechaza `razon_social` vacía.
- **App-shell (Compras):** el RFC de proveedor es editable; "Nuevo/Editar proveedor" y acciones solo para `procurement`/`admin` (lo que ya exigía la API; el rol `superintendent` los veía y recibía 403).

## Capabilities

### Modified por la corrección del smoke
- `ci-playwright-smoke-post-deploy`: nuevo requisito de que el smoke verifique los guards sin proyecto con el alcance de Ventas explícito (ver `specs/ci-playwright-smoke-post-deploy/spec.md`, ADDED).

### New Capabilities
- `catalogo-clientes-ventas`: alta, listado y edición de Clientes como catálogo por tenant, sin proyecto activo.
- `edicion-proveedor`: edición de datos guardados del Proveedor, incluido el RFC.

### Modified Capabilities
<!-- Ninguna: la excepción a datos-operativos-requieren-proyecto-activo se documenta en design.md; no se altera su requisito para datos con proyecto. -->

## Impact

- `apps/ventas/src/main.ts`, `apps/compras/src/main.ts`.
- `apps/app-shell/src/{App.tsx,lib/api.ts,views/{AdminView,VentasView,ComprasView}.tsx}`.
- Smoke: `apps/app-shell/test/smoke/{post-deploy.smoke.spec.ts,ventas-alcance.ts,ventas-alcance.unit.test.ts}`, `apps/app-shell/vitest.config.ts` (incluye `test/smoke/**/*.unit.test.ts`); pruebas herméticas `apps/app-shell/src/{App,views/VentasView}.*sin-proyecto.test.tsx`.
- Tests: `apps/ventas/test/integration/cliente-sin-proyecto-y-edicion.integration.test.ts`, `apps/compras/test/integration/editar-proveedor.integration.test.ts`.
- Relacionado: `aislamiento-proyecto-por-modulo`, `datos-operativos-requieren-proyecto-activo`, `centro-costos-alta`, `carga-masiva-clientes`.
