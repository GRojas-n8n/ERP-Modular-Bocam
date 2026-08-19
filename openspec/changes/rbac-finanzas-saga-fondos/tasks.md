## 1. Reproducir el hueco

- [x] 1.1 Extender `apps/finanzas/test/e2e/seguridad.e2e.test.ts` con un caso que haga `POST /comprometer-fondos` con un token de rol `resident` y espere 403. Falló antes del fix con `500 !== 403`: el 500 confirma el hueco — la petición del residente atravesó el control de acceso y llegó al handler, que reventó solo por no haber base de datos en local. Con BD viva habría comprometido fondos.
- [x] 1.2 Añadir el caso equivalente para `POST /liberar-fondos` con rol `seguridad_hse`. Mismo fallo esperado.
- [x] 1.3 Añadir un caso que confirme que un token con rol `procurement` **no** recibe 403 en `/comprometer-fondos` ni `/liberar-fondos` (protege la saga de Compras contra una regresión por conjunto de roles demasiado estrecho). Se envía body vacío a propósito: la validación de campos obligatorios responde 400 antes de tocar la BD, así que el 400 prueba que la petición pasó el control de acceso sin necesidad de Postgres.
- [x] 1.4 Correr la suite y registrar los fallos esperados.

**Gotcha de entorno encontrado:** `apps/finanzas/.env` fija `REDIS_URL="redis://localhost:6379"`, y Prisma carga ese `.env` al importar `./db`. Sin Redis local, el `RedisStore` del rate limiter hace fallar **toda** petición con 500 y la suite entera queda roja por una razón ambiental. Se corre con `REDIS_URL=` (vacío) para forzar el fallback en memoria:
`REDIS_URL= JWT_SECRET=bocam-e2e-secret npm run test:e2e:seguridad`

## 2. Cerrar el hueco

- [x] 2.1 Añadir `requireRoles('finanzas', 'admin', 'superintendent', 'procurement')` a `POST /api/v1/finanzas/comprometer-fondos` en `apps/finanzas/src/main.ts`.
- [x] 2.2 Añadir el mismo middleware a `POST /api/v1/finanzas/liberar-fondos`.
- [x] 2.3 Documentar en el comentario de cabecera de ambos endpoints por qué el conjunto de roles incluye `procurement`/`superintendent` (llamada backend-to-backend con JWT reenviado desde Compras), para que un futuro "endurecimiento" no lo estreche y rompa la saga.

## 3. Verificación

- [x] 3.1 Correr `test:e2e:seguridad` de `apps/finanzas` — 5/5 en verde (los 2 casos previos + los 3 nuevos).
- [x] 3.2 `npx tsc --noEmit` en `apps/finanzas` — limpio.
- [ ] 3.3 Correr el resto de la suite de `apps/finanzas` y `apps/compras/test/e2e/reconciliacion.e2e.test.ts`. **No ejecutable en este entorno:** requieren Postgres y Docker no está corriendo en la máquina local (`P1001: Can't reach database server`). Verificado estáticamente en su lugar:
  - El único test que llama a estos dos endpoints **directamente** es `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`, con `roles: ['finanzas']` → dentro del conjunto autorizado.
  - Todas las demás llamadas llegan **a través de Compras**, cuyos tres call sites (`comparativas/:id/convertir-oc`, `ordenes-compra/:id/cancelar`, `ordenes-compra/:id/reconciliar-finanzas`) están protegidos por `requireRoles('admin', 'superintendent', 'procurement')`. El conjunto autorizado en Finanzas es un superconjunto de ese, así que ninguna petición que pase el gate de Compras puede fallar en el de Finanzas.
  - `apps/compras/test/e2e/reconciliacion.e2e.test.ts` usa un **stub** de Finanzas, no el servicio real: el cambio no lo afecta.
- [x] 3.4 Verificar el diff: solo `apps/finanzas/src/main.ts` tocado en producción — 2 middlewares añadidos y 2 comentarios. Ninguna mutación existente modificada.
- [ ] 3.5 Correr la suite completa en CI (con Postgres y Redis levantados) antes de mezclar.
- [ ] 3.6 Desplegar y emitir una OC real en `iretum.com` con un usuario `procurement`, confirmando que no cae en `ERROR_FINANZAS`.

## 4. Corrección al diagnóstico previo

El hallazgo original (P0·1 del documento de arranque) decía "17 de 26 rutas sin control de rol" y listaba 8 endpoints de escritura. Estaba mayormente equivocado: se contó solo `requireRoles`, ignorando que Finanzas usa **dos** mecanismos de autorización y que el más antiguo vive dentro del handler (`rolesAutorizados` + 403 `FIN_FORBIDDEN`).

Recuento correcto por ruta, contemplando ambos mecanismos:

| Endpoint | Estado real |
|---|---|
| `POST /presupuestos` | ya protegido (handler) |
| `POST /movimientos` | ya protegido (handler) |
| `POST /transferencias-presupuestales` | ya protegido (handler) |
| `POST /pagos` | ya protegido (handler) |
| `POST /pagos/bulk` | ya protegido (handler) |
| `PATCH /pagos/:id/pagar` | ya protegido (handler) |
| `POST /comprometer-fondos` | **sin control de rol** → corregido aquí |
| `POST /liberar-fondos` | **sin control de rol** → corregido aquí |

De 8 escrituras señaladas, 6 ya estaban cerradas. Lo real eran 2 — pero las 2 más expuestas, porque son las únicas que mueven dinero sin pasar por ninguna validación de límite de autoridad financiera.

La misma métrica defectuosa se usó para el resto del documento de arranque. Reverificado: solo Finanzas y `control-proyectos` usan el patrón in-handler. Los hallazgos de **Seguridad** (20 rutas, 0 comprobaciones de rol de cualquier tipo) y **Ventas** (7 rutas, 1) se confirman. El de **Control de Proyectos** también estaba mal: sus dos escrituras (`POST /programacion`, `PATCH /alertas/:id/*`) sí usan `requireRoles`; lo que queda abierto ahí son 6 lecturas.
