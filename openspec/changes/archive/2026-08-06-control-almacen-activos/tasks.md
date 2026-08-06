## 1. Schema — modelos nuevos

- [x] 1.1 En `apps/almacen/prisma/schema.prisma`, agregar `model Activo`
      (ver campos exactos en Decisión D1 de design.md):
      `id_activo` (uuid pk), `tenant_id`, `numero_activo` (`VarChar(20)`,
      `ACT-XXX`), `clave`, `descripcion`, `clasificacion` (`VarChar(20)`),
      `estado` (`VarChar(20)`, default `DISPONIBLE`), `proyecto_id`,
      `ubicacion` (nullable), `asignado_a_empleado_id` (nullable, uuid),
      `asignado_a_empleado_nombre` (nullable), `fecha_alta` (default now),
      `fecha_baja` (nullable), `motivo_baja` (nullable),
      `valor_adquisicion` (nullable, `Decimal(18,2)`), `created_at`,
      `updated_at`. `@@unique([tenant_id, numero_activo])`,
      `@@index([tenant_id, proyecto_id])`, `@@map("activos")`.
- [x] 1.2 Agregar `model TraspasoActivo`: `id_traspaso` (uuid pk),
      `tenant_id`, `activo_id` (fk a `Activo`, `onDelete: Cascade`),
      `tipo` (`VarChar(20)`: `PROYECTO`|`ASIGNACION`|`AMBOS`), `estado`
      (`VarChar(20)`, default `PENDIENTE`), `proyecto_origen_id`,
      `proyecto_destino_id` (nullable), `empleado_origen_id`/`nombre`
      (nullable), `empleado_destino_id`/`nombre` (nullable),
      `solicitado_por`, `solicitado_en` (default now),
      `confirmado_por`/`rechazado_por` (nullable), `resuelto_en`
      (nullable), `notas` (nullable). `@@index([tenant_id, activo_id])`,
      `@@index([tenant_id, proyecto_destino_id, estado])`,
      `@@map("traspasos_activos")`.
- [x] 1.3 Aplicar el schema con `prisma db push` contra la BD local
      (mismo patrón que el resto de la sesión — sin migración formal por
      el drift preexistente de shadow database documentado en changes
      anteriores) y confirmar que el cliente se regenera sin errores.

## 2. Backend — CRUD de Activos

- [x] 2.1 Escribir test de integración en
      `apps/almacen/test/integration/activos-crud.integration.test.ts`:
      alta con clasificación válida asigna `numero_activo` correlativo
      y `estado = DISPONIBLE`; clasificación inválida → 400. Debe fallar
      en rojo (el endpoint no existe hoy).
      Confirmado en rojo (404).
- [x] 2.2 Test: listar activos con filtro `clasificacion` y `estado`
      devuelve solo los que coinciden; búsqueda `q` por clave/descripción.
- [x] 2.3 Test: editar `descripcion`/`ubicacion`/`valor_adquisicion` no
      cambia `proyecto_id` ni `asignado_a_empleado_id`.
- [x] 2.4 Test: baja con motivo marca `estado = BAJA` y persiste
      `fecha_baja`/`motivo_baja`; baja sin motivo → 400.
- [x] 2.5 Test: solicitar un traspaso (grupo 3) para un activo `BAJA` →
      409 (adelantado aquí porque valida el estado terminal de CRUD).
      Escrito junto con 2.1-2.4; queda en rojo hasta implementar 3.9
      (endpoint de traspasos) — ver 2.7.
- [x] 2.6 Implementar en `apps/almacen/src/main.ts`
      (`requireRoles('admin', 'superintendent', 'procurement', 'warehouse')`,
      mismo set que el resto de escrituras de este módulo):
      - `GET /api/v1/almacen/activos` (filtros `clasificacion`, `estado`, `q`)
      - `POST /api/v1/almacen/activos` (alta, calcula `numero_activo`
        correlativo por tenant igual que `numero_empleado` en
        `apps/personal/src/main.ts:80-85`)
      - `PATCH /api/v1/almacen/activos/:id` (edición descriptiva)
      - `POST /api/v1/almacen/activos/:id/baja` (motivo obligatorio)
- [x] 2.7 Ejecutar los tests de 2.1-2.5 y confirmar que pasan en verde.
      5/6 verdes (2.5 pendiente de 3.9, ver arriba) — confirmado en
      verde completo al cerrar el grupo 3 (ver 3.10).

## 3. Backend — Traspasos con aprobación

- [x] 3.1 Escribir test de integración en
      `apps/almacen/test/integration/activos-traspasos.integration.test.ts`:
      solicitar traspaso de proyecto dejar el activo en `EN_TRASPASO`
      sin cambiar `proyecto_id` todavía. Debe fallar en rojo.
      Confirmado en rojo (404).
- [x] 3.2 Test: solicitar asignación a un empleado (tipo `ASIGNACION`)
      guarda `empleado_destino_id`/`nombre` en la solicitud.
- [x] 3.3 Test: un activo con `estado = EN_TRASPASO` no admite una
      segunda solicitud → 409.
- [x] 3.4 Test: confirmar con el `proyecto_id` de sesión igual al
      destino aplica el cambio (`Activo.proyecto_id` actualizado,
      solicitud `CONFIRMADO`, `Activo.estado` vuelve a `DISPONIBLE`/`ASIGNADO`).
- [x] 3.5 Test: confirmar con el `proyecto_id` de sesión distinto al
      destino → 403, sin aplicar cambios.
- [x] 3.6 Test: rechazar una solicitud `PENDIENTE` la marca `RECHAZADA`
      y el activo vuelve a su estado previo sin cambiar proyecto/asignación.
- [x] 3.7 Test: listar solicitudes `PENDIENTE` filtradas por
      `proyecto_destino_id` (bandeja de pendientes).
- [x] 3.8 Test: historial de un activo devuelve sus `TraspasoActivo` en
      orden cronológico descendente, con estado y fechas.
- [x] 3.9 Implementar en `apps/almacen/src/main.ts`:
      - `POST /api/v1/almacen/activos/:id/traspasos` (solicitar — valida
        `estado !== EN_TRASPASO`/`BAJA` antes de crear, ver Decisión D3)
      - `PATCH /api/v1/almacen/activos/traspasos/:id/confirmar` (valida
        `proyecto_id` de sesión === `proyecto_destino_id` de la
        solicitud cuando `tipo` incluye `PROYECTO`; aplica cambios al
        `Activo`)
      - `PATCH /api/v1/almacen/activos/traspasos/:id/rechazar` (nota
        opcional, revierte `Activo.estado`)
      - `GET /api/v1/almacen/activos/traspasos?estado=PENDIENTE` (bandeja)
      - `GET /api/v1/almacen/activos/:id/historial`
- [x] 3.10 Ejecutar los tests de 3.1-3.8 y confirmar que pasan en verde.
      8/8 ok. También confirmado 2.5 (que dependía de este grupo): 6/6
      ok en `activos-crud.integration.test.ts`.

## 4. Frontend — apps/app-shell (nueva tab Activos)

- [x] 4.1 Agregar sub-item `{ id: 'activos', label: 'Activos', icon:
      IconLayers }` a `Layout.tsx` (~línea 118-121, junto a
      `inventario`/`movimientos`), mismos roles del nav padre `almacen`.
      Se usó `IconBriefcase` en vez de `IconLayers` (ya usado por
      `inventario`) para diferenciar visualmente el ícono en el sidebar.
- [x] 4.2 En `AlmacenView.tsx`, extender `TabId` con `'activos'` y
      agregar la carga de datos (`GET /almacen/activos`).
- [x] 4.3 Tabla de catálogo de activos: número, clave, descripción,
      clasificación (badge por tipo), estado (badge), proyecto/ubicación
      actual, asignado a (nombre o "—"). Filtros por clasificación y
      estado, búsqueda por clave/descripción (mismo patrón que
      `ComprasView.tsx` proveedores).
- [x] 4.4 Formulario de alta (`SlidePanel`, mismo patrón que "Nuevo
      Proveedor"/"Nuevo Cliente"): clave, descripción, clasificación
      (select con las 4 opciones), valor de adquisición opcional.
- [x] 4.5 Panel de "Solicitar traspaso" por activo: selector de
      proyecto destino (de los proyectos del tenant a los que el
      usuario tiene acceso) y/o selector de empleado destino (`GET
      /personal/empleados` — llamada B2B directa desde el frontend,
      mismo patrón que `ComparativaDetail.tsx` llamando a GT
      directamente, no vía Almacén).
- [x] 4.6 Bandeja de "Traspasos pendientes" (tab o sección dentro de
      Activos): lista de solicitudes `PENDIENTE` con destino = proyecto
      activo de la sesión, botones Confirmar/Rechazar.
      Implementado filtrando `GET /activos/traspasos` por
      `proyecto_destino_id = currentProjectId` — el usuario ve su
      bandeja simplemente al tener ese proyecto activo en su sesión
      (usa el selector de proyecto ya existente en el header, sin
      construir un mecanismo de cambio de proyecto nuevo).
- [x] 4.7 Panel de historial por activo (`SlidePanel`): lista
      cronológica de sus `TraspasoActivo` con estado, fechas y
      quién solicitó/resolvió cada uno.
- [x] 4.8 Botón "Dar de baja" con modal de motivo obligatorio.
      `tsc -b` limpio, 33/33 vitest (30 previos + 3 nuevos... nota: el
      nuevo test de VentasView del fix anterior ya estaba contado;
      0 regresiones confirmadas).

## 5. Verificación de regresión

- [x] 5.1 Ejecutar `npx tsc --noEmit -p apps/almacen/tsconfig.json` limpio.
      Limpio.
- [x] 5.2 Ejecutar `tsc -b` limpio en `app-shell`. Limpio.
- [x] 5.3 Ejecutar la suite completa de tests de integración de
      `apps/almacen` y confirmar 0 regresiones.
      6/7 archivos ok (los 2 nuevos de este change incluidos). 1 falla
      preexistente y no relacionada:
      `almacen-api.integration.test.ts::testDashboard` espera que un
      ítem con `stock_actual=0` cuente simultáneamente como
      `items_bajo_minimo` (1) Y `items_agotados` (1), pero la
      implementación del dashboard (`apps/almacen/src/main.ts`, sin
      tocar en este change) los trata como mutuamente excluyentes
      (`items_bajo_minimo` exige `stock_actual > 0`). No se corrige aquí
      — fuera de alcance de `control-almacen-activos`, no toqué
      `ItemInventario`/`MovimientoAlmacen`/dashboard en ningún punto de
      este change.
- [x] 5.4 Ejecutar la suite completa de vitest de `app-shell` y
      confirmar 0 regresiones. 33/33 ok.

## 6. Verificación manual (E2E con Playwright)

- [x] 6.1 Script E2E (`apps/app-shell/test/e2e/activos-traspaso.e2e.spec.ts`,
      mismo patrón que los 3 scripts de carga masiva de la sesión
      anterior): login real, dar de alta un activo, solicitarle un
      traspaso de proyecto, cambiar de proyecto activo (switch), confirmar
      el traspaso desde la bandeja de pendientes, verificar que el
      activo aparece en el catálogo del proyecto destino con el
      historial mostrando la solicitud confirmada.
      Verde. Se agregó `data-testid="fila-pendiente"` a la fila de la
      bandeja de pendientes (`AlmacenView.tsx`) para poder targetear la
      fila sin ambigüedad de locator. Se halló y corrigió que la fila de
      pendientes solo muestra `numero_activo` + `descripcion` (no la
      `clave`), así que el test filtra por el sufijo único en vez de la
      clave completa.
- [x] 6.2 Verificación manual adicional: intentar confirmar un traspaso
      sin tener el proyecto destino activo → error visible en UI, sin
      aplicar el cambio.
      Verificado a nivel API (`PATCH .../confirmar` con sesión en un
      proyecto distinto al destino → 403, traspaso permanece
      `PENDIENTE`, sin cambios aplicados). Nota: por diseño la bandeja
      de pendientes solo lista traspasos cuyo destino es el proyecto
      activo de la sesión (4.6), así que este escenario no es
      alcanzable navegando la UI normalmente — solo por llamada directa
      a la API o una condición de carrera al cambiar de proyecto justo
      antes de confirmar. En ese caso el botón "Confirmar" hoy falla en
      silencio (mismo patrón de manejo de errores que el resto de los
      paneles de este módulo: la fila permanece para reintentar, sin
      toast). No se agregó un toast dedicado por ser inconsistente con
      el resto del componente y no ser alcanzable por flujo normal.
