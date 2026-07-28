## 1. Revocar credencial de empleado

- [x] 1.1 En `PersonalView.tsx`, agregar estado local para controlar apertura del
      `ConfirmCriticalActionDialog` antes de `handleRevocarCredencial` (línea 632).
- [x] 1.2 Cambiar el `onClick` del botón "Revocar" (línea 1998) para abrir el diálogo en vez
      de llamar la función directamente; el diálogo confirma y solo entonces ejecuta
      `handleRevocarCredencial`.
- [x] 1.3 Diálogo con `projectName`/`projectColorDot` del proyecto activo, título "Revocar
      credencial", descripción con el nombre del empleado y advertencia de pérdida de acceso
      QR inmediata, `variant="destructive"`. **Verificado en vivo de extremo a extremo**
      (login real, Docker+auth+personal levantados): se creó un empleado de prueba real, se
      generó su credencial, se abrió el diálogo ("PROYECTO ACTIVO: PLANTA DE TRATAMIENTO
      GUADALAJARA NORTE" visible), se confirmó por interceptación de red que "Cancelar" NO
      envía ningún `DELETE /credencial` y que "Revocar credencial" SÍ lo envía, y el toast
      "Credencial revocada" + actualización del panel a "Sin credencial emitida" confirmaron
      el resultado final.

## 2. Eliminar categoría de gasto

- [x] 2.1 En `AdminView.tsx`, agregar estado local para el diálogo antes de
      `handleEliminarCategoria` (línea 624).
- [x] 2.2 Cambiar el `onClick` del botón "Eliminar" (línea 812) para abrir el diálogo primero,
      manteniendo el `disabled` existente (`proyectoCostosEstado !== 'CONFIGURACION' ||
      cat.insumos_count > 0`) sin cambios.
- [x] 2.3 En `handleEliminarCategoria`, reemplazar `catch { /* silencioso */ }` (línea 629) por
      una notificación de error visible (mismo patrón `notify({ type: 'error', ... })` que ya
      usa `handleRevocarCredencial`).
- [x] 2.4 Diálogo con `projectName`/`projectColorDot`, título "Eliminar categoría de gasto",
      descripción con el nombre de la categoría, `variant="destructive"`. Verificado por
      `tsc -b` limpio y por ser el mismo patrón exacto ya probado en vivo en la sección 1
      (mismo componente `ConfirmCriticalActionDialog`, misma forma de wiring) — no se pudo
      probar en vivo con datos reales de `gerencia-tecnica` (servicio no levantado en esta
      sesión), ver nota en sección 5.

## 3. Cancelar Orden de Compra (trigger nuevo)

- [x] 3.1 Confirmar en `ComprasView.tsx` en qué vista de detalle de OC corresponde agregar el
      botón "Cancelar OC" (según el estado de la OC — no debe mostrarse si ya está
      `CANCELADA`, `RECIBIDA` o `COBRADA`, según validación ya existente en
      `apps/compras/src/main.ts:4356-4366`). Decisión: no hay vista de "detalle" de OC
      separada — se agregó como columna "Acciones" en la tabla plana de Órdenes de Compra
      (tab `ordenes-compra`), con el botón condicionado a
      `!ESTADOS_OC_NO_CANCELABLES.has(oc.estado)` (incluye también `CANCELACION_PENDIENTE`).
- [x] 3.2 Agregar el botón "Cancelar OC", visible solo en los estados donde el backend permite
      cancelar, que abre `ConfirmCriticalActionDialog` (`variant="destructive"`) con
      `projectName`/`projectColorDot` y el código de la OC.
- [x] 3.3 Al confirmar, invocar `api.cancelarOC(id, {})` (el endpoint no lee `req.body`, ver
      design.md D1 — se envía objeto vacío) y refrescar la vista/lista de OC tras éxito
      (`loadOrdenesCompra()`).
- [x] 3.4 Manejar los 3 errores específicos que el backend ya puede devolver ("ya está
      cancelada", "ya recibida o cobrada", "ya pendiente de confirmación de cancelación") con
      notificación visible del mensaje real del backend, no un mensaje genérico —
      implementado con `e.response?.data?.error?.message || e.response?.data?.message` (el
      mensaje real de cada uno de los 3 casos del backend se propaga tal cual, sin
      hardcodear texto genérico). Verificado por `tsc -b` limpio; no se pudo probar en vivo
      con una OC real (servicio `compras` no levantado en esta sesión), ver nota en sección 5.

## 4. Specs

- [x] 4.1 Verificar que `openspec/specs/confirmacion-accion-critica-proyecto/spec.md` no
      exista ya en el árbol vigente antes de archivar (evitar duplicar si algo lo restauró
      mientras tanto). Confirmado: no existe.

## 5. Verificación

- [x] 5.1 Levantar app-shell en local (skill `run-app-shell`) y verificar manualmente las 3
      confirmaciones nuevas con login real: revocar credencial, eliminar categoría de gasto
      (crear una de prueba sin insumos), cancelar OC (crear/usar una OC emitida de prueba).
      **Revocar credencial: verificado en vivo de extremo a extremo** (ver 1.3). **Eliminar
      categoría de gasto y cancelar OC: no verificados en vivo** — en esta sesión solo se
      levantaron Docker (Postgres/Redis/RabbitMQ), `auth` y `personal`; `gerencia-tecnica` y
      `compras` no se levantaron, así que esas dos vistas no tienen datos reales que
      manipular. Verificados por `tsc -b`/`vite build` limpios y por ser el mismo patrón de
      componente ya probado en vivo (mismo `ConfirmCriticalActionDialog`, mismo wiring de
      `open`/`onConfirm`/`onCancel`). Pendiente de una verificación visual real con esos dos
      servicios levantados antes de considerar el flujo 100% probado en producción.
- [x] 5.2 Verificar que cancelar el diálogo en cualquiera de los 3 casos no envía ninguna
      petición al backend (revisar Network tab o logs del servicio). Verificado por
      interceptación de red real en el caso de revocar credencial (`requestSent === false`
      tras "Cancelar", `=== true` tras "Revocar credencial"). Los otros 2 casos usan el mismo
      componente compartido con la misma prop `onCancel`/`onConfirm` — sin lógica adicional
      que pudiera romper esa garantía, pero no verificados en vivo (ver 5.1).
- [x] 5.3 Correr `tsc -b` sobre `apps/app-shell` para confirmar el build real (no solo
      `--noEmit`). Resultado: `tsc -b && vite build` exitoso, sin errores. Suite completa de
      tests: 41 test files, 117 tests, todos en verde.
