## 1. Reproducir

- [x] 1.1 Test en `apps/finanzas/test/e2e/seguridad.e2e.test.ts`: token con rol `finanzas` y `limiteAprobacion: 1000` hace `POST /pagos-oc` por 2500. Falló antes del fix con `500 !== 403` — el 500 confirma el bypass: la petición atravesó el límite y llegó al handler, que solo reventó por no haber BD. Con Postgres vivo habría descontado el saldo.
- [x] 1.2 Casos equivalentes para `POST /proyectos/:id/anticipo` y `POST /transferencias-presupuestales`.
- [x] 1.3 Caso de no-regresión: el mismo endpoint con límite holgado no rechaza por límite.

## 2. Cerrar

- [x] 2.1 Validar `limiteAprobacion` contra `montoTotal` en `POST /pagos-oc`, antes de tocar saldo o anticipo.
- [x] 2.2 Misma validación en `POST /proyectos/:proyectoId/anticipo` y `POST /transferencias-presupuestales`.
- [x] 2.3 Comentar en `POST /pagos` y `/pagos/bulk` por qué no validan límite (programar no mueve dinero) y por qué sus roles difieren de los de tesorería.
- [x] 2.4 Documentada la segregación planeación/tesorería en ambos comentarios.

## 3. Verificación

- [x] 3.1 `test:e2e:seguridad` — 12/12 en verde.
- [x] 3.2 `npx tsc --noEmit` en `apps/finanzas` y `apps/app-shell` — limpio.
- [x] 3.3 `FinanzasView` mostraba el mensaje genérico porque leía `data.message` y `createApiError` escribe en `data.error.message`. Se lee ahora por ambas formas, así que el rechazo por límite llega al usuario con su monto.
- [ ] 3.4 Correr la suite de integración en CI con Postgres levantado.
- [ ] 3.5 Verificar en `iretum.com` que un usuario de Finanzas con límite bajo ve el mensaje correcto al intentar registrar un pago de OC por encima.
