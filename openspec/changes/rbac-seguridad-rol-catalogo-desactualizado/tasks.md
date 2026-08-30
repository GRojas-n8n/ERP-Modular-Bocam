## 1. Verificación previa

- [x] 1.1 Confirmar en `apps/seguridad/src/main.ts` que las 18 rutas fijadas
      en `df8b858` ya incluyen `'seguridad_hse'` en su `requireRoles(...)`, y
      que solo `resumen-dashboard` queda fuera a propósito
      (`superintendent`/`admin`, dashboard ejecutivo sin consumidor
      `seguridad_hse`). **Resultado:** confirmado, documentado en
      `design.md`.
- [x] 1.2 Confirmar que `packages/roles/src/index.ts` sigue marcando
      `seguridad_hse` con `estado: 'sin-backend'` pese al fix de 1.1.
      **Resultado:** confirmado — línea 88-92 de `index.ts`.
- [x] 1.3 Confirmar que `ventas` (el otro rol `sin-backend` del catálogo) no
      está afectado por este lapso: su nota sigue siendo precisa
      (`apps/ventas/src/main.ts` solo exige `admin`). **Resultado:**
      confirmado, fuera de alcance de este change.

## 2. Test que reproduce el gap (debe fallar en rojo antes del fix)

- [x] 2.1 Nuevo test en `packages/roles/src/catalogo.test.ts`: todo rol con
      `estado: 'sin-backend'` NO SHALL aparecer en
      `rolesExigidosPorBackend()` — si aparece, el catálogo está
      desactualizado.
- [x] 2.2 Confirmar que el caso 2.1 falla en rojo contra el catálogo actual
      (`seguridad_hse` marcado `sin-backend` pero exigido por
      `apps/seguridad`).

## 3. Fix

- [x] 3.1 `packages/roles/src/index.ts`: mover `seguridad_hse` de
      `estado: 'sin-backend'` a `estado: 'asignable'` y quitar la nota de
      que el servicio "todavía no comprueba este rol".

## 4. Verificación

- [x] 4.1 El test de la sección 2 pasa en verde tras el fix.
- [x] 4.2 Suite completa `packages/roles/src/catalogo.test.ts` en verde
      (no rompe los casos existentes para `ventas`, alias, ni el resto del
      catálogo).
- [x] 4.3 `npx tsc --noEmit` en `packages/roles` limpio.

## 5. Cierre

- [x] 5.1 Branch `fix/rbac-seguridad-rol-catalogo-desactualizado`, commit con
      test + fix.
- [ ] 5.2 PR contra `main` referenciando este change de OpenSpec.
- [ ] 5.3 Tras merge y verificación en producción, archivar el change
      (`openspec archive`).
