## 1. Test que reproduce el bug (backend)

- [x] 1.1/1.2 `control-presupuestal-estado-pendiente.integration.test.ts`: confirmado en rojo contra el código actual (`git stash` del fix) — un presupuesto BORRADOR devolvía el mismo 404 genérico; verde tras el fix, con `GT_PRESUPUESTO_PENDIENTE_APROBACION` + `presupuesto_id` + `estado`.
- [x] 1.3 Proyecto sin ningún `presupuestoBase` → sigue en `GT_NO_PRESUPUESTO` (sin regresión).
- [x] 1.4 Presupuesto en `EN_REVISION` → mismo tratamiento que `BORRADOR`.
- [x] 1.5 Presupuesto `APROBADO` con un concepto → 200 con datos reales (camino feliz sin cambios).

## 2. Backend — endpoint

- [x] 2.1 `buildControlPresupuestal()`: segunda query liviana (`select id, estado`) por `BORRADOR`/`EN_REVISION` cuando la primera no encuentra nada.
- [x] 2.2 Handler HTTP devuelve `GT_PRESUPUESTO_PENDIENTE_APROBACION` + `details: {presupuesto_id, estado}` cuando aplica; `GT_NO_PRESUPUESTO` sin cambios para el resto.
- [x] 2.3 Los 4 tests de la sección 1 pasan.
- [x] **Hallazgo no previsto (mismo patrón que `fix-avance-mock-mis-proyectos`)**: en el Postgres local de desarrollo, la conexión usa el rol superusuario, que bypassea RLS. Sin filtro explícito, `testSinPresupuestoAlguno` encontraba un presupuesto `APROBADO` de otro tenant ya presente en la base y devolvía 200 en vez de 404. Se agregó `tenant_id`/`proyecto_id` explícito en el `where` de ambas queries de `buildControlPresupuestal` (la ya existente y la nueva) como defensa en profundidad — no depende únicamente de RLS.

## 3. Frontend — pestaña Control Presupuestal (GT)

- [x] 3.1 `InsumosView.tsx`: nuevo panel "Presupuesto pendiente de aprobación" (con badge de `estado`) quando `loadControlPresupuestal` recibe `GT_PRESUPUESTO_PENDIENTE_APROBACION`, en vez de mostrar el error genérico.
- [x] 3.2 Botón "Aprobar presupuesto" visible solo si `puedeAprobar` (mismo check que ya usaba `handleAprobarPresupuesto` — roles `gerencia_tecnica`/`admin`), usando el `presupuesto_id` recibido en la respuesta (no depende de que `presupuesto` ya esté cargado por otra pestaña).
- [x] 3.3 Sin permiso: panel informativo sin botón — cubierto por test.
- [x] 3.4 Tras aprobar, se refresca tanto `fetchPresupuesto()` (Catálogo) como `loadControlPresupuestal()` (esta pestaña).

## 4. Frontend — widget en Compras

- [x] 4.1 `ComprasView.tsx` diferencia el mensaje (`GT_NO_PRESUPUESTO` → "Sin presupuesto activo para este proyecto."; `GT_PRESUPUESTO_PENDIENTE_APROBACION` → "Presupuesto del proyecto pendiente de aprobación en Gerencia Técnica."); otros errores siguen silenciosos (widget opcional).
- [x] **Ajuste no previsto, necesario para 4.1**: el proxy `GET /api/v1/compras/reportes/control-presupuestal` (`apps/compras/src/main.ts`) colapsaba CUALQUIER error de GT (incluido el 404 existente `GT_NO_PRESUPUESTO`) a un 502 genérico sin código, perdiendo la información que el frontend necesita para diferenciar. Se cambió para reenviar el status/body real de la respuesta de GT cuando existe, y solo caer a 502 genérico ante fallas de conexión/timeout reales.

## 5. Verificación manual

- [ ] 5.1–5.3 Verificación manual en navegador real (dar de alta proyecto, importar catálogo, ver panel/CTA en GT, confirmar mensaje en Compras) — pendiente, requiere ambiente corriendo; queda para QA/revisión humana.

## Verificación automatizada adicional (no listada originalmente)

- Suite completa de `InsumosView.*`, `ComprasView.*` y `ControlPresupuestalTabla.*` sin regresiones (22 archivos / 54 tests).
- `tsc` limpio en `app-shell`, `gerencia-tecnica` y `compras`.
