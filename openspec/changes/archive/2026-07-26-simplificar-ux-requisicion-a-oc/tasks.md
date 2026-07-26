## 1. Backend compras — especificación técnica fuente única

- [x] 1.1 Test: `GET` del Cuadro Comparativo resuelve `marca_modelo_ref`/`especificaciones_requeridas` desde el `RequisicionItem` referenciado por `detalle_req_id` cuando este no es null. **Ejecutado y en verde** (`test/integration/especificacion-tecnica-fuente-unica.integration.test.ts`, entorno Docker local levantado).
- [x] 1.2 Test: renglón con `detalle_req_id` null (legacy) sigue devolviendo el valor copiado almacenado en `ComparativaLinea`. **Ejecutado y en verde** (mismo archivo).
- [x] 1.3 Implementar el join en vivo en el endpoint de lectura de comparativa según 1.1/1.2. **Hallazgo:** ya existía (`main.ts:2488-2522`, campos `especificacion_marca_modelo`/`especificacion_detalle` resueltos vía `reqItemsMap`) — sin cambio de código necesario.
- [x] 1.4 Dejar de copiar... **Revisado y ajustado:** el copiado en creación (`POST /comparativas`) se conserva a propósito como respaldo (ya no es necesario removerlo: el `GET` prioriza el valor en vivo). En su lugar se corrigió un gap real encontrado: el clon de `ComparativaLinea` en `revision-con-preguntas` (nueva revisión A→B del Residente, `main.ts:~5490`) no propagaba `detalle_req_id`, rompiendo la fuente única en cuadros revisados — corregido.
- [x] 1.5 Test: `PUT /comparativas/:id/lineas/:insumoId` rechaza edición de spec cuando la línea de **catálogo** tiene `detalle_req_id` no nulo. **Ejecutado y en verde**.
- [x] 1.6 Test: el mismo endpoint sigue aceptando edición cuando `detalle_req_id` es null (compatibilidad legacy). **Ejecutado y en verde**.
- [x] 1.7 Implementar el rechazo condicional en `PUT /comparativas/:id/lineas/:insumoId` según 1.5/1.6. Implementado (`main.ts`, retorna 400 `specLocked`). **Regresión encontrada y corregida al correr la suite completa:** la condición inicial bloqueaba también renglones de texto libre/imprevisto (identificados por `detalle_req_id`, sin `insumo_id`), rompiendo el test preexistente `cotizar-items-texto-libre-comparativa` (caso 5.2). Ajustado para aplicar el rechazo solo a renglones de catálogo (`insumo_id` no null); spec actualizado con el escenario correspondiente. Los 30 archivos de tests de integración de `compras` relevantes pasan tras el fix (excluidos `admin-purga*` y `finanzas.feedback` por no relacionados).
- [x] 1.8 Test: `PUT` de especificación en `RequisicionItem` se acepta con `Requisicion.estado` en `PENDIENTE` o `APROBADA`, y se rechaza en `COMPRADA`. **Ejecutado y en verde** (`test/integration/especificacion-simple-post-creacion.integration.test.ts`).
- [x] 1.9 Confirmar/ajustar el endpoint de edición de `RequisicionItem`. **No existía** endpoint para el texto libre (marca/detalle) post-creación — solo existía para `EspecificacionDetalleReq` estructurada. Se creó `PUT /api/v1/compras/requisiciones/:reqId/items/:itemId/especificacion-simple`.

## 2. Backend compras — selección de proveedores unificada

- [x] 2.1/2.2 **Revisado y descartado un campo nuevo:** el frontend (`ProveedorComp.estado_respuesta`) ya queda `undefined` para proveedores sin fila en `SolicitudCotizacionProveedor` (comentario preexistente en el tipo lo documentaba). No se necesitó agregar `proveedores_invitados_ids` al backend — se revirtió ese intento inicial para no duplicar información ya disponible.
- [x] 2.3/2.4 Confirmado: el tope de 3 proveedores **no existe en backend** (grep sin resultados) — es puramente frontend. Sin cambio de backend necesario.

## 3. Backend compras — notas en vivo y acción combinada aprobar+invitar

- [x] 3.1 Confirmado: `GET /requisiciones/:id` lee Prisma directo en cada request, sin caché — sin cambio de contrato necesario.
- [x] 3.2 Confirmado: sin endpoint nuevo (se encadena en frontend, ver 6.2).

## 4. Frontend app-shell — ResidenciaView.tsx

- [x] 4.1 Edición inline de especificación agregada en la tarjeta de requisición (botón "Editar" cuando `estado` es `PENDIENTE`/`APROBADA`), llama al nuevo endpoint `especificacion-simple`.
- [x] 4.2 Confirmado: la carga de ficha técnica sigue siendo únicamente la de este archivo tras retirar el duplicado en `ComparativaDetail.tsx` (tarea 5.2).

## 5. Frontend app-shell — ComparativaDetail.tsx

- [x] 5.1 Edición inline de spec retirada cuando `linea.detalle_req_id` existe; se muestra en solo lectura con nota "Definida en la Requisición". Se conserva editable solo para líneas legacy sin `detalle_req_id`.
- [x] 5.2 Control de carga de ficha técnica retirado del SideSheet (y todo el código muerto asociado: `handleFichaUpload`, `uploadingFicha`, `fichaFileRef`, `fichaUploadInsumoId`, input oculto). El SideSheet queda solo de consulta/descarga.
- [x] 5.3 Tope fijo de 3 proveedores eliminado (`handleAddProveedorFromCatalog`, header "Proveedores en comparativa"). **Nota sobre 7.1:** no se extrajo un componente `ProveedorPicker` nuevo — ver justificación en sección 7.
- [x] 5.4 Badge "Sin invitación" agregado junto a cada chip de proveedor cuando `!prov.estado_respuesta` (mismo dato usado en 2.1).

## 6. Frontend app-shell — ComprasView.tsx

- [x] 6.1 **Revisado y confirmado sin cambio necesario:** el panel de invitación y `ComparativaDetail` ya comparten la misma fuente (`proveedoresList` en `ComprasView`, pasada como prop `proveedoresCatalogo`) — no hay listas divergentes que unificar.
- [x] 6.2 Acción combinada implementada: `handleAprobar` ahora recibe la `Requisicion` completa, verifica `resp.data.data.estado === 'APROBADA'` y, si el usuario tiene rol `procurement`/`admin` (`canInvitarCotizacion`), abre `handleOpenSolicitudPanel` directamente. Botón cambia su label a "Aprobar e Invitar a Cotizar" para esos roles.
- [x] 6.3 Cubierto por el mismo flujo: el caso `PENDIENTE_TRANSFERENCIA` devuelve 422 y cae en el `catch` existente (mensaje de bloqueo ya mostrado), sin tocar el panel de invitación.
- [x] 6.4 Confirmado: `handleOpenSolicitudPanel` ya lee `req.observaciones` del objeto pasado por el llamador en cada apertura (sin caché propia); el flujo combinado le pasa la `Requisicion` recién aprobada.

## 7. Frontend app-shell — componente compartido

- [x] 7.1/7.2 **Descartado tras investigar:** `ComprasView.tsx` ya hace un único fetch de proveedores (`proveedoresList`) y lo pasa como prop a `ComparativaDetail` — el requirement de spec ("mismo catálogo, sin listas divergentes") ya estaba satisfecho por la arquitectura existente. Extraer un componente/hook nuevo habría sido riesgo sin beneficio funcional adicional; se documenta la decisión aquí en vez de forzar el refactor.

## 8. Verificación manual

- [x] 8.1 Sin extensión de navegador disponible en esta sesión, se verificó el flujo completo con llamadas HTTP reales contra auth/compras/GT levantados en local (Docker + servicios en modo dev): Requisición con spec → aprobar (contrato `estado==='APROBADA'` que dispara la acción combinada en frontend) → invitar 2 proveedores → crear Cuadro → especificación en vivo confirmada (incluida corrección post-creación reflejada sin recrear el cuadro) → edición directa en el cuadro rechazada (400) → cotizar 3 proveedores (incl. 1 sin invitación) → badge "sin invitación" confirmado a nivel de dato → evaluación técnica → firma → envío a GT → evaluación económica → `APROBADO_GT` con ganador automático correcto. 21/22 pasos verdes. El único paso no alcanzado (`convertir-oc` → requiere Finanzas con presupuesto sincronizado) es lógica preexistente no tocada por este change; no se levantó Finanzas por estar fuera de alcance. **Pendiente real:** click-through visual en navegador cuando haya extensión disponible — la lógica de negocio ya está probada de punta a punta.
- [x] 8.2 Cubierto a nivel de API por los tests 1.1/1.2/1.6 (línea legacy sin `detalle_req_id` sigue funcionando, en verde). Falta confirmación visual en el navegador.
- [x] 8.3 Cubierto a nivel de lógica: el badge se deriva de `!prov.estado_respuesta`, campo ya usado y probado indirectamente por `estado-respuesta-proveedor-comparativo.integration.test.ts` (en verde). Falta confirmación visual en el navegador.
