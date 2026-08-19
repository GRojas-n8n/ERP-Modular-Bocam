## 1. Reproducir

- [ ] 1.1 Test en `apps/finanzas`: token con rol `finanzas` y `limiteAprobacion: 1000` hace `POST /pagos-oc` por un total de 2500. Debe recibir 403 `FIN_LIMIT_EXCEEDED`. Falla antes del fix (hoy pasa y descuenta saldo).
- [ ] 1.2 Test equivalente para `POST /proyectos/:id/anticipo` y `POST /transferencias-presupuestales`.
- [ ] 1.3 Test de no-regresión: el mismo token con límite holgado sigue pudiendo registrar el pago.

## 2. Cerrar

- [ ] 2.1 Validar `limiteAprobacion` contra `montoTotal` en `POST /pagos-oc`, antes de tocar saldo o anticipo.
- [ ] 2.2 Misma validación en `POST /proyectos/:proyectoId/anticipo` y `POST /transferencias-presupuestales`.
- [ ] 2.3 Comentar en `POST /pagos` y `/pagos/bulk` por qué no validan límite (programar no mueve dinero).
- [ ] 2.4 Comentar la segregación planeación/tesorería en los conjuntos de roles, para que no se "unifiquen" por error.

## 3. Verificación

- [ ] 3.1 Suite de `apps/finanzas` en verde con Postgres levantado.
- [ ] 3.2 Verificar en navegador que `FinanzasView` muestra el mensaje de límite excedido de forma legible, no un 500 genérico.
