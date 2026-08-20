## 1. Middleware JWT

- [x] 1.1 Escribir test en `packages/auth-middleware/src/middleware.test.ts` que reproduzca la falta de restricción de algoritmo (token firmado con un algoritmo distinto a HS256 debe rechazarse).
- [x] 1.2 Agregar `algorithms: ['HS256']` a la llamada `jwt.verify` en `packages/auth-middleware/src/middleware.ts`.
- [x] 1.3 Confirmar que el test nuevo pasa y que los tests existentes de login/verificación siguen en verde.

## 2. Comparación de MASTER_SECRET

- [x] 2.1 Escribir test en `apps/auth` que reproduzca el timing side-channel (o al menos confirme el comportamiento correcto de aceptar/rechazar) antes del fix. Extraído a `apps/auth/src/master-secret-policy.ts` (+ `.test.ts`) siguiendo el patrón `*-policy.ts` ya usado en el repo, para no importar `main.ts` completo (tiene `app.listen`/conexiones a BD a nivel de módulo).
- [x] 2.2 Reemplazar `secret !== MASTER_SECRET` en `requireMasterSecret` (apps/auth/src/main.ts) por comparación de longitud + `crypto.timingSafeEqual` (función `secretsMatch`).
- [x] 2.3 Confirmar que los tests de `/api/v1/master/*` existentes siguen pasando. (No había tests previos de esos endpoints; no se rompió nada en la suite existente.)

## 3. Verificación

- [x] 3.1 Correr la suite completa de `auth` (`npm test` en `apps/auth`) y de `packages/auth-middleware`. Ambas en verde (28/28 y 5/5). De paso se encontró y corrigió un gotcha preexistente: `packages/auth-middleware/src/*.js` compilados estaban comiteados junto al `.ts` y quedaban obsoletos — Node prefiere el `.js` sobre el `.ts` en `require` sin extensión, así que `ts-node-dev`/`node --test` de **todos** los consumidores de `auth-middleware` (incluido el `dev` de `apps/auth`) estaban corriendo código JWT desactualizado en local. Se eliminaron esos artefactos del repo (no afecta producción, que compila fresco vía `tsc` en el Dockerfile).
- [ ] 3.2 Desplegar y verificar login real en `iretum.com` tras el cambio. (pendiente — se hace junto con el deploy final de los 7 changes)
