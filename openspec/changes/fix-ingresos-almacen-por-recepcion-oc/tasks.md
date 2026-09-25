## 1. Confirmación previa (solo lectura)

- [ ] 1.1 **Titular:** con la llave autorizada y comandos limitados a lectura, contar en los logs de Almacén los `almacen.event.oc_recibida.skip_no_items` y `almacen.event.oc_recibida.applied` desde el último despliegue, para confirmar por evidencia el hallazgo del análisis estático.
- [ ] 1.2 **Titular:** cuantificar en modo solo lectura las recepciones de OC sin INGRESO correspondiente (recepciones, ítems y cantidades). No se modifica ningún dato.
- [ ] 1.3 Resolver las preguntas abiertas 1 a 5 de `design.md` y actualizar el diseño.

## 2. Tests primero (rojo)

- [ ] 2.1 Contrato: un test que toma el payload real que publica hoy Compras y verifica que Almacén registra los INGRESOS. Debe fallar contra el código actual.
- [ ] 2.2 Almacén: un fallo en un ítem no confirma el mensaje y no deja INGRESOS parciales del evento.
- [ ] 2.3 Almacén: dos recepciones parciales del mismo insumo en la misma OC suman el stock.
- [ ] 2.4 Almacén: un redelivery de la misma recepción no duplica stock.
- [ ] 2.5 Almacén: ítems con `insumo_id` nulo no generan error ni reintento.
- [ ] 2.6 Bus: reintento con éxito en el segundo intento, envío a `<cola>.dlq` al agotar intentos, mensaje ininterpretable directo a la DLQ, y suscripción sin opciones con comportamiento idéntico al actual.
- [ ] 2.7 Compras: cada recepción publica el evento correcto (total o parcial) con los ítems de esa recepción; un bus caído no revierte la recepción y deja un log de error.
- [ ] 2.8 Almacén: `/health` responde `200` con el bus caído y `/ready` responde `503` con el detalle.
- [ ] 2.9 Confirmar que todos fallan por la razón esperada y guardar la evidencia.

## 3. Bus de eventos

- [ ] 3.1 Añadir `retry` y `deadLetter` opcionales a `SubscriptionOptions` con la cola de espera, el contador de intentos, la DLQ y el log de envío.
- [ ] 3.2 Probar contra RabbitMQ real que las suscripciones existentes no cambian.
- [ ] 3.3 Documentar el procedimiento de reproceso de una DLQ.

## 4. Compras (publicador)

- [ ] 4.1 Publicar `compras.oc_recibida_parcial` y `compras.oc_recibida_total` con el contrato definido, según la decisión de las preguntas 1 y 2.
- [ ] 4.2 Registrar el fallo de publicación y añadir el endpoint de reemisión restringido a `admin` y `procurement`.

## 5. Almacén (consumidor)

- [ ] 5.1 Migración: columna `recepcion_id` en `movimientos_almacen` e índice único parcial de idempotencia; actualizar `rls-policies.sql` si aplica.
- [ ] 5.2 Reescribir `handleOcRecibida`: transacción por evento, propagación de errores, idempotencia por recepción e ítem y tratamiento de ítems sin insumo.
- [ ] 5.3 Suscribir con las colas nuevas y las opciones `retry` y `deadLetter`.
- [ ] 5.4 Añadir `/ready` y conservar `/health` como prueba de vida.
- [ ] 5.5 Hacer pasar los tests de la sección 2 y ejecutar la suite de Almacén, Compras y del bus.

## 6. Conciliación de datos históricos

- [ ] 6.1 Con los resultados de 1.2, presentar al titular el alcance exacto de la conciliación y el procedimiento propuesto.
- [ ] 6.2 **Titular:** autorizar por escrito. Sin esa autorización no se modifica ningún dato.
- [ ] 6.3 Ensayar en una copia, con dry-run y verificación posterior, y ejecutar solo el alcance autorizado.

## 7. Despliegue y verificación

- [ ] 7.1 PR por servicio (bus, Almacén, Compras) con CI verde y validación estricta de OpenSpec.
- [ ] 7.2 Desplegar en orden: Almacén, Compras y, por último, el retiro de las colas antiguas.
- [ ] 7.3 Verificar en producción con lectura de logs, la profundidad de la DLQ y `/ready`, sin crear datos de prueba.
- [ ] 7.4 Registrar un hallazgo separado sobre los demás consumidores del bus que descartan mensajes al fallar.

## 8. Cierre

- [ ] 8.1 Sincronizar la spec canónica `almacen-eventos-oc` (aún en formato anterior a la migración) con los deltas, y archivar el change.
