## 1. Evidencia previa (solo lectura)

- [x] 1.1 Logs de Almacén y Compras: cobertura de ~4 h sin recepciones; todos los contadores en 0. Ver `evidence-2026-09-25.md`.
- [x] 1.2 Cuantificación: producción sin datos vivos; a lo sumo 2 recepciones (3 renglones) desde 2026-07-21, ya purgadas; Almacén sin movimientos. Ver el informe.
- [x] 1.3 Preguntas abiertas resueltas por el titular: ítems sin insumo no inventariables, snapshot autosuficiente publicado por Compras, colas `.v2` solo para las suscripciones nuevas, outbox incluido en este change, y conciliación bloqueada sin autorización.
- [ ] 1.4 **Titular (opcional):** autorizar el dry-run del respaldo `pre-purga-20260924-195212` en un contenedor sin red para identificar esas dos recepciones (sección 9 del informe).

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

- [ ] 4.1 Tests en rojo: recepción y fila del outbox en la misma transacción; falla del outbox revierte la recepción; bus caído deja `PENDIENTE`; publicación tras falla transitoria; máximo de intentos a `ERROR`; dos instancias no duplican; marcado solo tras confirmación; mensaje devuelto no se marca; recuperación tras reinicio; caída entre confirmación y marcado republica con el mismo `event_id`; aislamiento por tenant y proyecto; reemisión restringida.
- [ ] 4.2 Migración: tabla `outbox_eventos` con RLS (política única con la variable de sesión interna del despachador) y cobertura estática.
- [ ] 4.3 Escribir la fila del outbox dentro de la transacción de la recepción, con el contrato v1.
- [ ] 4.4 Despachador: `FOR UPDATE SKIP LOCKED`, snapshot congelado desde Gerencia Técnica con reintentos, publicación confirmada, espera exponencial y estado `ERROR`.
- [ ] 4.5 Endpoint de reemisión (`admin`, `procurement`) y registros de error.
- [ ] 4.6 Hacer pasar los tests y la suite de Compras.

## 5. Conciliación de datos históricos

- [x] 5.1 Cuantificada: sin datos vivos afectados.
- [ ] 5.2 Reporte de conciliación de solo lectura (recepciones de Compras frente a ingresos de Almacén por `recepcion_item_id`) como herramienta, sin ejecutar en producción.
- [ ] 5.3 **Titular:** cualquier ejecución productiva de conciliación o reemisión histórica requiere autorización expresa adicional, con alcance exacto y ensayo previo.

## 6. Despliegue y verificación (bloqueado hasta autorización expresa)

- [ ] 6.1 PR por servicio con CI verde. **No fusionar** hasta que el titular autorice el despliegue: fusionar a `main` despliega y aplica migraciones.
- [ ] 6.2 Orden: bus, Almacén y Compras. El consumidor debe existir antes de que el publicador emita.
- [ ] 6.2b Tras desplegar Almacén, aplicar `apps/almacen/prisma/rls-policies.sql` con el workflow manual de RLS: la política de `eventos_procesados` no se crea con la migración.
- [ ] 6.2c Desplegar el Almacén con la `.v3` y verificar: consumidor activo, bindings, `.retry`, `.dlq`, argumentos sin `x-message-ttl`, colas antiguas sin cambios.
- [ ] 6.2d Verificar la `.v2` vacía y, con autorización expresa, desvincularla con `scripts/ops/almacen-recepcion-oc/topologia.js desvincular --ejecutar`. Confirmar que el único binding del evento hacia Almacén es el de la `.v3`. Las colas `.v2` no se borran.
- [ ] 6.2e Solo después de 6.2d se despliega Compras (publicador).
- [ ] 6.3 Verificación en producción por lectura de logs, profundidad de la DLQ y `/ready`, sin crear datos de prueba.
- [ ] 6.4 Decidir aparte el retiro de las colas `almacen.compras_oc_recibida_*` actuales, con evidencia de que no reciben tráfico.

## 7. Cierre

- [ ] 7.1 Verificar las garantías del outbox: atomicidad, reintento, marcado solo tras confirmación del broker y recuperación tras reinicios. Sin ellas el change no se considera completo.
- [ ] 7.2 Sincronizar la spec canónica `almacen-eventos-oc` (aún en formato anterior a la migración) con los deltas y archivar el change.
- [ ] 7.3 Los demás consumidores del bus se tratan en `auditar-consumidores-eventbus-sin-perdida-silenciosa`.
