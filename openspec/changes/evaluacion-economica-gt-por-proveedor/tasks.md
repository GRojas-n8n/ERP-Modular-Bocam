## 1. Backend — schema

- [ ] 1.1 Agregar `pregunta_gt` y `respuesta_gt` (`String?`, `@db.Text`) a
      `ComparativaDetalle` (`apps/compras/prisma/schema.prisma`) — análogos a
      `pregunta_residente`/`respuesta_compras`.
- [ ] 1.2 Migración de Prisma (aditiva, columnas nullable, sin backfill) — hand-written si
      `prisma migrate dev --create-only` falla por el drift de shadow-DB conocido en este
      entorno (ver memoria de sesiones previas), aplicada con `prisma db push
      --accept-data-loss` en local.
- [ ] 1.3 Actualizar el comentario de `aprobacion_gt` en el schema para documentar el
      nuevo vocabulario `PENDIENTE | C | NC | DA | ?` + legacy `APROBADO | RECHAZADO`
      (mismo patrón que `evaluacion_tecnica`) — sin cambio de tipo de columna.
- [ ] 1.4 Agregar `ofrece_credito` (`Boolean @default(false)`) y `dias_credito` (`Int?`) al
      modelo `Proveedor` (`schema.prisma:18-49`), junto a `estatus_credito`/
      `limite_credito` — atributo fijo del proveedor en su catálogo, no por cotización.

## 2. Backend — reproducir el comportamiento actual con un test que falle

- [ ] 2.1 Test de integración: `PATCH /comparativas/:id/evaluar-gt` (endpoint nuevo) con
      evaluaciones C/NC/DA para 3 proveedores de un mismo renglón — falla hoy porque el
      endpoint no existe.
- [ ] 2.2 Test de integración: guardar evaluaciones vía `evaluar-gt` NO transiciona el
      cuadro — permanece en `EN_APROBACION_GT`.
- [ ] 2.3 Test de integración: `PATCH /comparativas/:id/revisar-gt` (contrato nuevo, sin
      `aprobaciones[]`) rechaza con 400 si algún `ComparativaDetalle` sigue
      `PENDIENTE`/`?`.
- [ ] 2.4 Test de integración: `revisar-gt` con todos los proveedores evaluados
      transiciona a `APROBADO_GT` (si hay al menos un `C`/`DA`) o `RECHAZADO_GT` (si todos
      `NC`).
- [ ] 2.5 Test de integración: `evaluar-gt` rechaza marcar `C` en un proveedor cuya
      `evaluacion_tecnica` es `NC` (regla existente, re-validada en el endpoint nuevo).
- [ ] 2.6 Confirmar que los tests 2.1-2.5 fallan contra el código actual antes de
      implementar.

## 3. Backend — endpoints

- [ ] 3.1 Implementar `PATCH /comparativas/:id/evaluar-gt` — mismo patrón que
      `PATCH .../evaluar` de evaluación técnica: recibe `evaluaciones: { detalle_id,
      aprobacion_gt, comentario_gt }[]`, valida rol GT + estado `EN_APROBACION_GT` + regla
      "no aprobar si técnica fue NC", actualiza `ComparativaDetalle` sin tocar el estado
      del cuadro.
- [ ] 3.2 Modificar `PATCH .../revisar-gt`: quitar `aprobaciones[]` del body, agregar gate
      "todos los `ComparativaDetalle` del cuadro con `aprobacion_gt` distinto de
      `PENDIENTE`/`?`" antes de transicionar; conservar la lógica de determinar
      `APROBADO_GT`/`RECHAZADO_GT`.
- [ ] 3.3 Implementar `POST /comparativas/:id/revision-con-preguntas-gt`: clona el cuadro
      como `revision-con-preguntas` pero (a) copia `evaluacion_tecnica`/
      `comentario_tecnico` tal cual del original en vez de resetear a `PENDIENTE`, (b)
      resetea `aprobacion_gt` a `PENDIENTE` preservando `pregunta_gt` en los proveedores
      marcados `?`, (c) el cuadro nuevo nace en `estado: 'EN_APROBACION_GT'`, no
      `BORRADOR`.
- [ ] 3.4 Endpoint para que Compras responda `pregunta_gt` (`respuesta_gt`) — mismo patrón
      que la respuesta a `pregunta_residente` (revisar si puede reutilizarse el endpoint
      existente de respuesta o si requiere uno nuevo, según cómo esté implementado hoy).
- [ ] 3.5 Extender los endpoints de creación/edición de `Proveedor` (junto a donde ya
      manejan `estatus_credito`/`limite_credito`) para aceptar `ofrece_credito`/
      `dias_credito`.
- [ ] 3.6 Verificar que los tests 2.1-2.5 pasan.

## 4. Frontend — modelo de datos

- [ ] 4.1 Extender `CotizacionLinea` (`ComparativaDetail.tsx`) con
      `aprobacionesGtPorProveedor?: Record<string, { id_detalle, aprobacion_gt,
      comentario_gt?, pregunta_gt?, respuesta_gt? }>` — mismo patrón que
      `evaluacionesPorProveedor`.
- [ ] 4.2 `normalizeComp` (`ComprasView.tsx`): poblar `aprobacionesGtPorProveedor`
      iterando todos los `detalles` de cada línea, keyed por `proveedor_id`.
- [ ] 4.3 Calcular `diasSuministro` por proveedor: `Math.round((fecha_entrega_estimada -
      comp.fecha_firma) / 86400000)` cuando ambas fechas existen.
- [ ] 4.4 Extender `ProveedorComp` (`ComparativaDetail.tsx`) con `ofrece_credito?: boolean`
      y `dias_credito?: number | null`; poblar desde el proveedor en `normalizeComp`
      (`ComprasView.tsx`) — ya viene incluido en la consulta del proveedor, sin requerir
      un endpoint nuevo.
- [ ] 4.5 Agregar `ofrece_credito`/`dias_credito` al formulario de alta/edición de
      Proveedores en `ComprasView.tsx`, junto a los campos de `estatus_credito`/
      `limite_credito` ya existentes ahí.

## 5. Frontend — sub-fila de evaluación económica GT (reemplaza showGTPanel)

- [ ] 5.1 Test de componente en `ComparativaDetail.evaluacion-economica-gt.test.tsx`: un
      renglón con 3 proveedores en un cuadro `EN_APROBACION_GT` muestra, sin clic previo,
      costo + días de suministro + condición de crédito ("Crédito N días" / "Sin
      crédito") + controles C/NC/DA/? por proveedor.
- [ ] 5.2 Test: guardar evaluaciones sin "?" llama a `PATCH .../evaluar-gt` con las
      evaluaciones de esa línea.
- [ ] 5.3 Test: marcar "?" en un proveedor oculta el guardado individual y muestra el
      botón agregado de la revisión GT.
- [ ] 5.4 Test: el botón agregado envía una sola llamada a
      `POST .../revision-con-preguntas-gt` con todas las evaluaciones "?" pendientes.
- [ ] 5.5 Confirmar que los tests 5.1-5.4 fallan contra el código actual (con
      `showGTPanel`) antes de implementar.
- [ ] 5.6 Renderizar la sub-fila de evaluación GT reutilizando el patrón de
      `evaluacion-tecnica-inline-tabla-comparativa` (misma estructura de `<tr>` alineada
      por columna de proveedor), agregando las celdas de costo, días de suministro y
      condición de crédito (leída de `comp.proveedores`, no de `ComparativaDetalle`).
- [ ] 5.7 Botón "Guardar" por línea (sin "?") → `evaluar-gt`; botón agregado a nivel de
      tabla (con algún "?" pendiente) → `revision-con-preguntas-gt`.
- [ ] 5.8 Eliminar `showGTPanel` y su bloque JSX modal.
- [ ] 5.9 Gate de "Autorizar"/finalizar GT en frontend: deshabilitado mientras exista al
      menos un proveedor de algún renglón sin evaluar (mismo patrón que `todasEvaluadas`
      para la firma del Residente).
- [ ] 5.10 Verificar que los tests 5.1-5.4 pasan.

## 6. Verificación

- [ ] 6.1 `npx tsc -b` en `apps/app-shell` sin errores.
- [ ] 6.2 Suite completa `apps/app-shell` (`vitest run`) en verde, sin regresión.
- [ ] 6.3 Suite de integración de `apps/compras` en verde.
- [ ] 6.4 Verificación manual en navegador: Gerente Técnico evalúa un renglón con 3
      proveedores (C/NC/DA), guarda esa línea; marca "?" en otro renglón con pregunta,
      confirma que se crea una revisión nueva que YA muestra la evaluación técnica del
      Residente (no `PENDIENTE`) y arranca directo en aprobación GT.

## 7. Cierre

- [ ] 7.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
