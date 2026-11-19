## 1. Prueba primero

- [x] 1.1 `test/e2e/seguridad.e2e.test.ts`: `testAdminFlujoComparativa` con token `admin` contra `enviar-gt`, `pendientes-evaluacion` y `pendientes-gt`; espera que ninguna responda 403. Falla en `main`.

## 2. Implementar

- [x] 2.1 Agregar `admin` a `requireRoles` de las tres rutas.

## 3. Verificar

- [x] 3.1 `tsc` de Compras sin errores nuevos.
- [ ] 3.2 CI en verde (`test:e2e:seguridad -w @bocam/compras` ya corre en `backend-e2e.yml`).
- [ ] 3.3 Producción: repetir `enviar-gt` con el usuario admin en PRUEBA-M11 sin rol `procurement`.
