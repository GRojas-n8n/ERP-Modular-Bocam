## 1. Evidencia previa (solo lectura)

- [x] 1.1 Logs de Almacén y Compras: cobertura de ~4 h sin recepciones; todos los contadores en 0. Ver `evidence-2026-09-25.md`.
- [x] 1.2 Cuantificación: producción sin datos vivos; a lo sumo 2 recepciones (3 renglones) desde 2026-07-21, ya purgadas; Almacén sin movimientos. Ver el informe.
- [x] 1.3 Preguntas abiertas resueltas por el titular: ítems sin insumo no inventariables, snapshot autosuficiente publicado por Compras, colas `.v2` solo para las suscripciones nuevas, outbox incluido en este change, y conciliación bloqueada sin autorización.
- [x] 1.4 Dry-run opcional del respaldo `pre-purga-20260924-195212` en un contenedor sin red, ya realizado el 2026-09-25: el respaldo contiene 0 recepciones y 0 movimientos, por lo que las 2 recepciones que registran las estadísticas no son identificables. Resultado en `dry-run-historico.md` (sección "Resultado (2026-09-25)").

## 2. Bus de eventos (`packages/event-bus`) — PR 1

- [x] 2.1 Tests en rojo: publicación confirmada (confirma, devuelve por no tener cola, sin canal, timeout); `event_id` asignado; reintento con éxito, DLQ al agotar intentos, mensaje ininterpretable a la DLQ; y suscripción sin opciones idéntica a la actual.
- [x] 2.2 Confirmar que fallan por la razón esperada y guardar la evidencia. Antes de implementar: 7 de 8 fallaban (`publishConfirmed is not a function` y tiempo agotado en la DLQ); la de compatibilidad pasaba, como debe.
- [x] 2.3 Implementar `publishConfirmed`, `event_id`/`event_version`, `retry` y `deadLetter`.
- [x] 2.4 Probar contra RabbitMQ real que las suscripciones existentes no cambian. La prueba existente y la de compatibilidad pasan; los servicios que importan el bus compilan sin errores.
- [x] 2.5 Documentar el procedimiento de reproceso de una DLQ (`docs/operacion/event-bus-dlq-reproceso.md`).

## 3. Almacén (consumidor) — PR 2

- [x] 3.1 Tests en rojo: contrato con el payload de `compras.recepcion_oc_registrada.v1`; fallo de un ítem revierte y propaga sin ack; dos recepciones parciales suman; redelivery por `event_id`; misma recepción con otro `event_id`; ítem sin `insumo_id`; formato antiguo y versión no soportada a la DLQ; `/health` con el bus caído y `/ready` con `503`.
- [x] 3.2 Migración: `recepcion_id` y `recepcion_item_id` en `movimientos_almacen`, índice único parcial y tabla `eventos_procesados`; RLS y cobertura estática.
- [x] 3.3 Reescribir el handler: una transacción por evento, propagación de errores, doble idempotencia y tratamiento de ítems sin insumo.
- [x] 3.4 Suscripción con cola `.v2`, reintentos y DLQ; añadir `/ready`. (Sustituida por la `.v3`, ver 3.6.)
- [x] 3.5 Hacer pasar los tests y la suite de Almacén. Las 9 pruebas de comportamiento y la prueba extremo a extremo con RabbitMQ real pasan; las suites existentes de eventos, salida de obra y activos siguen en verde. Dos pruebas de `almacen-api` ya fallaban antes (`item_id` frente a `insumo_id`, umbral `<` frente a `<=`): coinciden con las diferencias registradas para `almacen-movimientos` y `almacen-dashboard` y pertenecen a esos changes. Almacén no se probaba en CI; ahora `backend-e2e` aplica su esquema, compila y ejecuta las pruebas de recepciones.

- [x] 3.6 Corrección tras el despliegue de la `.v2` (instrucción del titular): la `.v2` heredó el TTL de 24 h del EventBus sin dead-letter y con el outbox una recepción confirmada podía perderse. Cola `.v3` sin TTL y con dead-letter a su DLQ; `.retry` y `.dlq` conservadas; la `.v2` se conserva sin borrar. Pruebas con RabbitMQ real: argumentos de la cola, mensaje recuperable con Almacén detenido, expirado que llega a la DLQ, fallo reintentable que vuelve a `.v3`, rechazo definitivo y reintentos agotados en la DLQ, bindings simultáneos sin doble proceso y desvinculación solo con las precondiciones. Guía y rollback en `docs/operacion/almacen-cola-recepcion-oc-v3.md`.

## 4. Compras (publicador y outbox) — PR 3

- [x] 4.1 Tests en rojo: recepción y fila del outbox en la misma transacción; falla del outbox revierte la recepción; bus caído deja `PENDIENTE`; publicación tras falla transitoria; máximo de intentos a `ERROR`; dos instancias no duplican; marcado solo tras confirmación; mensaje devuelto no se marca; recuperación tras reinicio; caída entre confirmación y marcado republica con el mismo `event_id`; aislamiento por tenant y proyecto; reemisión restringida.
- [x] 4.2 Migración: tabla `outbox_eventos` con RLS (política única con la variable de sesión interna del despachador) y cobertura estática. El RLS se habilita y fuerza **en la propia migración** que crea la tabla (instrucción del titular: no debe existir una ventana sin RLS entre la migración y el workflow); una prueba ejecuta solo la migración en un esquema temporal y comprueba `ENABLE`, `FORCE`, política y aislamiento con un rol sin privilegios, y que coincide con el bloque de `rls-policies.sql`.
- [x] 4.3 Escribir la fila del outbox dentro de la transacción de la recepción, con el contrato v1.
- [x] 4.4 Despachador: `FOR UPDATE SKIP LOCKED`, snapshot congelado desde Gerencia Técnica con reintentos, publicación confirmada, espera exponencial y estado `ERROR`.
- [x] 4.5 Endpoint de reemisión (`admin`, `procurement`) y registros de error.
- [x] 4.5b Rediseño del snapshot (instrucción del titular): snapshot persistido en la OC (migración compatible `20260925140000_snapshot_insumo_oc_items`), `convertir-oc` lo guarda, la recepción lo completa antes del commit o se rechaza con `503 SNAPSHOT_INSUMO_NO_DISPONIBLE`, el despachador nunca consulta a Gerencia Técnica y nunca publica un payload incompleto; la reemisión reconstruye desde datos persistidos. Pruebas: Gerencia Técnica caída, inventario inexistente, evento completo tras reinicio, reproceso sin duplicados y ningún evento incompleto marcado como publicado.
- [x] 4.5c Activación del despachador (instrucción del titular): apagado por defecto, solo `COMPRAS_OUTBOX_DISPATCHER=on` lo enciende, `dispatcher disabled` en el arranque, el outbox sigue guardando sin publicar ni marcar, `/ready` distingue `disabled` de `error`. Pruebas: valores ausente/vacío/inválido/`off` no publican (unitarias y con arranque real contra RabbitMQ), `on` publica y marca, estado y `/ready`. Procedimiento de activación y rollback en `docs/operacion/compras-outbox-despachador.md`.
- [x] 4.6 Hacer pasar los tests y la suite de Compras. 14 pruebas de comportamiento y 3 con RabbitMQ real; las suites de CI de Compras (`e2e:seguridad`, `e2e:reconciliacion`, `finanzas-feedback`) y el contrato de eventos siguen en verde. El snapshot sale de la OC persistida; ver el diseño.

## 5. Conciliación de datos históricos

- [x] 5.1 Cuantificada: sin datos vivos afectados.
- [x] 5.2 Conciliación de solo lectura resuelta por el dry-run (`dry-run-historico.md`, que incluye las consultas por `recepcion_item_id`): 0 recepciones identificables y nada que conciliar. Por decisión del titular no se construye una herramienta adicional porque no existe alcance seguro; no se ejecutó nada en producción.
- [x] 5.3 Decisión expresa del titular: **no se ejecuta conciliación ni reemisión histórica** (el dry-run encontró 0 recepciones identificables; ver `dry-run-historico.md`). Cualquier ejecución futura requeriría una autorización adicional con alcance exacto y ensayo previo.

## 6. Despliegue y verificación (bloqueado hasta autorización expresa)

- [x] 6.1 PR por servicio con CI verde y fusión solo con autorización expresa del titular. #169 fusionado el 2026-09-29 (merge `a7fff6c`) con `Backend E2E Criticas` verde (run `36645918284`); el bus y Almacén ya estaban en `main` y desplegados (ver 6.2b/6.2c). Ver `evidence-2026-09-29-despliegue-y-activacion.md`.
- [x] 6.2 Orden respetado: bus y Almacén (2026-09-25, ver 6.2b/6.2c) y después Compras (2026-09-29, ver 6.2g). El consumidor existió antes de que el publicador emitiera.
- [x] 6.2b (hecho 2026-09-25, workflow RLS run 36099272903, verificado) Tras desplegar Almacén, aplicar `apps/almacen/prisma/rls-policies.sql` con el workflow manual de RLS: la política de `eventos_procesados` no se crea con la migración.
- [x] 6.2c (hecho 2026-09-25, merge 9eb0a9a, verificado) Desplegar el Almacén con la `.v3` y verificar: consumidor activo, bindings, `.retry`, `.dlq`, argumentos sin `x-message-ttl`, colas antiguas sin cambios.
- [x] 6.2d Estado verificado el 2026-09-29: `.v2` vacía y sin binding; el único binding de `compras.recepcion_oc_registrada.v1` hacia Almacén es el de la `.v3` (1 consumidor, 0 mensajes); `.v2`, `.v2.retry` y `.v2.dlq` intactas y vacías, no se borran. La ejecución del script `desvincular` no consta en este change: se comprobó el estado resultante directamente en RabbitMQ.
- [x] 6.2e Compras (publicador) desplegado el 2026-09-29 (#169, merge `a7fff6c`, deploy `36645918565`) con `.v2` ya desvinculada.
- [x] 6.2f `COMPRAS_OUTBOX_DISPATCHER` pasa al contenedor de Compras en el compose del VPS (default `off`): #172 (`b91d2a1`). Verificado en el contenedor (`off`) antes de #169.
- [x] 6.2g Compras (#169) desplegado con el despachador apagado y verificado: `dispatcher disabled`, `/ready` con `outbox_dispatcher: disabled`, RLS de `outbox_eventos` habilitado y forzado con su política, sin publicaciones ni filas. Migraciones aplicadas: `20260925130000_outbox_eventos` y `20260925140000_snapshot_insumo_oc_items`. Ver `evidence-2026-09-29-despliegue-y-activacion.md`.
- [x] 6.2h Despachador activado con autorización expresa el 2026-09-29 ~23:43 UTC (`COMPRAS_OUTBOX_DISPATCHER=on`), con `.v2` desvinculada y `.v3` verificada. `dispatcher enabled`, `/ready` con `outbox_dispatcher: ok`, smoke posterior `36646776085` con 2 pruebas verdes. Ver `evidence-2026-09-29-despliegue-y-activacion.md`.
- [x] 6.2i Workflow manual de RLS (`service=compras`) **sustituido, por decisión del titular, por la verificación directa en producción** de `ENABLE`/`FORCE` RLS, la política `rls_outbox_eventos_context` y los índices de `outbox_eventos` (`pg_class`, `pg_policies`, `pg_indexes`; ver `evidence-2026-09-29-despliegue-y-activacion.md`). La migración ya creó el RLS, así que la ejecución del workflow sería redundante y no se realizó.
- [x] 6.3 Verificación en producción por lectura de logs, profundidad de colas (`.v3`, retry y DLQ) y `/ready`, sin crear datos de prueba (2026-09-29, ver `evidence-2026-09-29-despliegue-y-activacion.md`).
- [ ] 6.4 Decidir aparte el retiro de las colas `almacen.compras_oc_recibida_*` actuales, con evidencia de que no reciben tráfico.
- [ ] 6.5 **Observar la primera recepción real** con el procedimiento `docs/operacion/compras-outbox-primera-recepcion-real.md` (fila de outbox `PENDIENTE` → `PUBLICADO`, un solo evento en `.v3`, un solo INGRESO por ítem con `recepcion_id`, sin duplicados, retry y DLQ vacías, ítems y cantidades coincidentes). Requiere una recepción real; no se crean datos de prueba.

## 7. Cierre

- [ ] 7.1 Verificar las garantías del outbox en producción (en las pruebas ya se cumplen): atomicidad, reintento, marcado solo tras confirmación del broker y recuperación tras reinicios. Sin ellas el change no se considera completo. Pendiente de 6.5 (requiere observar una recepción real).
- [ ] 7.2 Sincronizar la spec canónica `almacen-eventos-oc` (aún en formato anterior a la migración) con los deltas y archivar el change.
- [x] 7.3 Los demás consumidores del bus se tratan en el change `auditar-consumidores-eventbus-sin-perdida-silenciosa`. **Transferida** (2026-09-30): ese change quedó fusionado en #180 con validación estricta, sus tareas 1.1 a 1.3 están cerradas con evidencia (`audit-2026-09-29.md`) y los lotes B1, B2 y L1–L6 con su responsable figuran en su tarea 4.1. Su ejecución ya no bloquea este change.
