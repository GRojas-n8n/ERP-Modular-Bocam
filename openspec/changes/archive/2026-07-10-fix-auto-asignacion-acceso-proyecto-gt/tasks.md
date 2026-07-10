## 1. Test que reproduce el bug

- [x] 1.1 Crear `apps/auth/src/project-access-policy.test.ts` con casos que
      cubran los 4 escenarios del spec `auto-asignacion-acceso-proyecto`
      (gerencia_tecnica incluido, admin/superintendent sin regresión, rol
      fuera de lista blanca excluido, usuario inactivo excluido). Debe fallar
      contra el comportamiento actual (lista blanca sin `gerencia_tecnica`).

## 2. Extraer la lógica a función pura

- [x] 2.1 Crear `apps/auth/src/project-access-policy.ts` — función
      `resolveAutoAssignedUserIds(users, roles)` (o firma equivalente) que
      recibe la lista de usuarios del tenant y devuelve los `id_usuario` que
      deben auto-asignarse, filtrando por `activo` y por
      `['admin', 'superintendent', 'gerencia_tecnica']`.
- [x] 2.2 Verificar que el test de 1.1 pasa contra esta función.

## 3. Integrar en el endpoint

- [x] 3.1 `apps/auth/src/main.ts` líneas 843-858: reemplazar el filtro inline
      por una llamada a `resolveAutoAssignedUserIds` de `project-access-policy.ts`.

## 4. Verificación

- [x] 4.1 Ejecutar `npm test` en `apps/auth` y confirmar que el test nuevo (y
      los existentes, incl. `login-policy.test.ts`) pasan. (7/7 OK)
- [x] 4.2 Confirmar que `main.ts` sigue compilando (`tsc`) sin errores de tipos.
      (`npx tsc --noEmit` limpio)
