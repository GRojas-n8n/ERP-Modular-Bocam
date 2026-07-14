## 1. Backend — funciones puras de cálculo de bloqueos

- [x] 1.1 Test: `calcularBloqueosRequisicion` devuelve vacío si la
      Requisición no tiene OC asociadas.
- [x] 1.2 Test: `calcularBloqueosRequisicion` devuelve el bloqueo de OC
      cuando existen `OrdenCompra` no incluidas en el lote.
- [x] 1.3 Test: `calcularBloqueosRequisicion` no bloquea si las OC
      referenciadas SÍ están incluidas en el mismo lote.
- [x] 1.4 Implementar `calcularBloqueosRequisicion(ocAsociadas: string[],
      ocSeleccionadas: string[])` en `apps/compras/src/purga-bloqueos.ts`
      (función pura, recibe los IDs ya consultados, no hace queries —
      facilita el test). El `CuadroComparativo` y la `SolicitudCotizacion`
      de la Requisición NO se validan aquí — se purgan automáticamente,
      ver sección 3.
- [x] 1.6 Test: `calcularBloqueosProveedor` devuelve vacío si no quedan
      referencias en OC/ComparativaDetalle/EvaluacionEspecificacion/
      SolicitudCotizacionProveedor tras aplicar el lote.
- [x] 1.7 Test: `calcularBloqueosProveedor` devuelve el conteo por tipo
      cuando sí quedan referencias.
- [x] 1.8 Implementar `calcularBloqueosProveedor(referencias, lote)` en el
      mismo archivo.

## 2. Backend — endpoint de resumen

- [x] 2.1 Test de integración: `GET /api/v1/compras/admin/purga/resumen`
      sin rol admin → 403.
- [x] 2.2 Test de integración: `GET .../resumen` con rol admin → 200 con
      listas de Requisiciones/OC/Proveedores del proyecto activo.
- [x] 2.3 Implementar el endpoint (`requireRoles('admin')`, filtro
      explícito por `tenant_id`/`proyecto_id`).

## 3. Backend — endpoint de ejecución de purga

- [x] 3.1 Test de integración: `POST /api/v1/compras/admin/purga` sin rol
      admin → 403, nada borrado.
- [x] 3.2 Test de integración: lote vacío (`{requisiciones:[],
      ordenes_compra:[], proveedores:[]}`) → 400.
- [x] 3.3 Test de integración: purgar una Requisición con una `OrdenCompra`
      generada a partir de ella, no incluida en `ordenes_compra` → 409,
      nada borrado.
- [x] 3.4 Test de integración: purgar una Requisición junto con su
      `OrdenCompra` en el mismo lote → ambas desaparecen sin bloqueo.
- [x] 3.5 Test de integración: purgar una Requisición con un
      `CuadroComparativo` y una `SolicitudCotizacion` asociados, sin
      listarlos aparte (no hay campo para hacerlo) → ambos desaparecen
      junto con `RequisicionItem`, `EspecificacionDetalleReq`,
      `ComparativaDetalle`, `EvaluacionEspecificacion`,
      `SolicitudCotizacionProveedor` asociados.
- [x] 3.5b Test de integración: purgar una Requisición cuyo cuadro tiene
      filas en `AnotacionEspecificacion` (por `cuadro_id` y por
      `especificacion_id`) → esas filas se borran, no quedan huérfanas.
      Reveló un bug real: `EvaluacionEspecificacion.especificacion_id`
      tiene FK RESTRICT hacia `EspecificacionDetalleReq` y solo cascada
      desde `CuadroComparativo` — hubo que invertir el orden (cuadro antes
      que especificación), ver design.md actualizado.
- [x] 3.6 Test de integración: purgar una `OrdenCompra` con
      `presupuesto_id` → se llama a Finanzas `liberar-fondos` y la OC se
      borra (stub HTTP local a Finanzas).
- [x] 3.7 Test de integración: purgar una `OrdenCompra` cuando la llamada a
      Finanzas falla → la OC se borra igual y la respuesta incluye
      `advertencias`.
- [x] 3.8 Test de integración: purgar una `OrdenCompra` con filas en
      `AlertaOcError` → se borran junto con la OC.
- [x] 3.9 Test de integración: purgar un Proveedor con una OC vigente no
      incluida en el lote → 409, nada borrado.
- [x] 3.10 Test de integración: purgar un Proveedor cuyas OC/comparativas
      fueron incluidas en el mismo lote → se borran sus
      `CalificacionProveedor`/`DocumentoProveedor` y el Proveedor.
- [x] 3.11 Test de integración: un bloqueo a mitad de un lote mixto
      (Requisición válida + Proveedor bloqueado) revierte el lote completo
      — la Requisición válida NO queda borrada.
- [x] 3.12 Auditoría: `logInfo(..., 'compras.admin.purga_ejecutada', ...)`
      implementado con usuario, IDs y conteo por tipo — mismo patrón que
      el resto del módulo, sin assertion de log en el test (consistente
      con el resto de la suite de integración de compras).
- [x] 3.13 Implementado dentro del único `basePrisma.$transaction` que ya
      abre `createTenantContext` (ver `db.ts`) — no se anida un
      `prisma.$transaction` adicional porque el cliente de transacción de
      Prisma no lo soporta; orden Requisiciones → OC → Proveedores usando
      las funciones de bloqueo de la sección 1.

## 4. Frontend — panel de administrador en ComprasView

- [x] 4.1 Agregar `getResumenPurga`/`ejecutarPurga` a
      `apps/app-shell/src/lib/api.ts`.
- [x] 4.2 Agregar sección "Herramientas de Administrador" en
      `ComprasView.tsx` (tab `admin-purga`, nav gateada a rol `admin` en
      `Layout.tsx`), visible solo si el rol del usuario incluye `admin`.
- [x] 4.3 Listas con checkboxes de Requisiciones/OC/Proveedores, con
      conteo de seleccionados por tipo.
- [x] 4.4 Modal de confirmación con campo de texto que exige `ELIMINAR`
      exacto para habilitar el botón de borrado definitivo; muestra el
      conteo total seleccionado.
- [x] 4.5 Al confirmar, llama al endpoint de purga; en caso de 409 muestra
      el detalle del bloqueo sin cerrar el modal; en caso de éxito
      refresca las tres listas y muestra notificación de éxito.
- [x] 4.6 Test (RTL): el panel no se renderiza para un usuario sin rol
      `admin`.
- [x] 4.7 Test (RTL): el botón de borrado definitivo permanece
      deshabilitado hasta escribir `ELIMINAR` exacto.
- [x] 4.8 Test (RTL): tras una purga exitosa, las listas se refrescan y
      desaparecen los registros purgados.
- [x] 4.9 Test (RTL): una respuesta 409 muestra el detalle del bloqueo y
      no cierra el modal.

## 5. Verificación

- [x] 5.1 Ejecutados todos los tests nuevos: 5 unitarios (`purga-bloqueos.test.ts`)
      + 2 integración (`admin-purga-resumen`, `admin-purga` con 11 casos) +
      4 vitest RTL — 22/22 en verde, sin regresión en las 27 pruebas de
      integración existentes de compras ni en las suites vitest de
      `ComparativaDetail`/`ComprasView` de los 2 changes previos de esta
      sesión.
- [x] 5.2 `npm run build -w @bocam/compras` (`tsc`) y
      `npm run build -w app-shell` (`tsc -b && vite build`) — ambos
      limpios, build de producción real confirmado.
- [x] 5.3 Verificación manual: purgar una Requisición con cuadro y sin OC,
      confirmar que desaparece del listado y que el bloqueo con OC
      funciona. **Requiere navegador — pendiente para el usuario.**
      Verificado con Playwright real (`admin@alfa.bocam.com`) contra datos
      propios sembrados vía script Prisma de un solo uso (nunca se
      seleccionó ni tocó ningún registro real preexistente del proyecto —
      el panel lista todos los registros del proyecto activo, se apuntó
      cada checkbox por fila exacta según el código scratch). Escenario
      bloqueado: seleccionar solo una Requisición con OC generada →
      "Eliminar definitivamente" → mensaje "No se puede purgar
      requisicion — quedan referencias..." y la requisición permanece en
      el listado (nada se borró). Escenario limpio: Requisición con cuadro
      comparativo y SIN OC → se purga sin error y desaparece del listado.
