## 1. Test que reproduce el bug (primero, en rojo)

- [x] 1.1 Crear
      `apps/personal/test/integration/rol-personal-rh-autorizar-pagar-nomina.integration.test.ts`
      siguiendo el patrón de
      `empleados-importar-lote.integration.test.ts` (mismo setup con
      `signTenantToken`/`startHttpApp`/`stopHttpApp` de `test-support/e2e`,
      cleanup de `preNomina`/`preNominaDetalle`/`empleado` por `tenant_id`).
- [x] 1.2 Test: crear un empleado activo, calcular una pre-nómina
      (`POST /prenominas/calcular`) para obtener una en estado `CALCULADA`,
      luego llamar `PATCH /prenominas/:id/autorizar` con un token
      `roles: ['personal_rh']` (el rol real) — confirmar en **rojo** contra
      el código actual: `403 PER_FORBIDDEN` en vez de 200 con
      `estado: 'AUTORIZADA'`.
- [x] 1.3 Test: sobre la pre-nómina ya `AUTORIZADA` (autorizada manualmente
      vía Prisma en el setup del test, ya que el paso 1.2 falla en rojo),
      llamar `PATCH /prenominas/:id/pagar` con el mismo token
      `roles: ['personal_rh']` — confirmar en rojo el mismo 403.
- [x] 1.4 Grep global `rh_manager` en todo el monorepo (`grep -rn
      "rh_manager"`) — confirmar que las únicas 2 ocurrencias son las
      líneas 686 y 736 de `apps/personal/src/main.ts` y que ningún test
      existente ya usa ese rol para simular RH (si alguno lo hiciera,
      documentarlo aquí antes de continuar).

## 2. Fix

- [x] 2.1 `apps/personal/src/main.ts` línea ~686
      (`PATCH /prenominas/:id/autorizar`): cambiar
      `roles.includes('rh_manager')` → `roles.includes('personal_rh')` y
      actualizar el mensaje de error 403 ("Solo admin o rh_manager..." →
      "Solo admin o personal_rh...").
- [x] 2.2 Línea ~736 (`PATCH /prenominas/:id/pagar`): mismo cambio en la
      condición y en el mensaje de error.
- [x] 2.3 Verificar con grep: 0 ocurrencias de `'rh_manager'` restantes en
      `apps/personal/src/main.ts`.

## 3. Verificación

- [x] 3.1 Tests de la sección 1 (1.2 y 1.3) ahora en verde con
      `roles: ['personal_rh']`.
- [x] 3.2 Test de rol negativo: un token sin `personal_rh` ni `admin` (ej.
      `roles: ['residencia']`) sigue recibiendo 403 en ambos endpoints — no
      se abrió el acceso de más.
- [x] 3.3 `tsc --noEmit` (o `tsc -b` si aplica) en `apps/personal` limpio.
- [x] 3.4 Suite completa de tests de `apps/personal` en verde, sin
      regresión (incluye el test de `evento-centro-costos-creado` y
      `empleados-importar-lote` ya existentes).
- [x] 3.5 Grep `rh_manager` en el resto del monorepo (otros servicios que
      pudieran simular RH contra estos 2 endpoints, igual que PR #76
      encontró 9 tests de otros servicios con `'finance'`) — corregir
      cualquier ocurrencia encontrada a `personal_rh` como parte de este
      mismo change.

## 4. Cierre

- [x] 4.1 PR contra `main`, CI verde, merge. (PR #87, CI `backend-e2e` verde, squash-merge a `main` en `07059ef`)
- [x] 4.2 Redeploy VPS de `personal` (build + `up -d`, sin migración). Contenedor `bocam-vps-personal` healthy; verificado en el contenedor real 19 ocurrencias de `personal_rh` y 0 de `rh_manager` en el bundle desplegado.
- [ ] 4.3 **Pendiente** — requiere las credenciales reales de `recursoshumanos@bocam.com.mx` (no disponibles para el agente). Verificación manual: confirmar que puede autorizar y pagar una pre-nómina real en producción tras el redeploy.
