## 1. Reproducir el bug (test primero)

- [x] 1.1 Crear `apps/contabilidad/test/integration/rbac-rol-finanzas.integration.test.ts` con un helper que genere tokens con `roles: ['finanzas']` y con `roles: ['finance']`.
- [x] 1.2 Escribir el caso que reproduce el bug: token con `roles: ['finanzas']` llamando `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi` — debe fallar en rojo contra el código actual (403 por rol, porque hoy exige `'finance'`).
- [x] 1.3 Añadir casos equivalentes para al menos un endpoint representativo de cada grupo: asientos/cuentas/dashboard, reportes, conciliaciones fiscales, conciliaciones bancarias (cubrir los 6 escenarios de `specs/control-acceso-rol-finanzas-contabilidad/spec.md`).
- [x] 1.4 Añadir el caso negativo: token con `roles: ['finance']` (sin `finanzas`/`admin`/`superintendent`) debe seguir recibiendo 403 después del fix.
- [x] 1.5 Correr la suite y confirmar que los casos 1.2–1.3 fallan en rojo (bug reproducido) antes de tocar el código de producción.

## 2. Aplicar el fix

- [x] 2.1 En `apps/contabilidad/src/main.ts`, reemplazar `'finance'` por `'finanzas'` en las 17 llamadas a `requireRoles(...)` (líneas 1716, 1750, 1771, 1794, 1838, 1876, 1914, 1956, 1997, 2202, 2288, 2359, 2465, 2812, 2940, 3005, 3216).
- [x] 2.2 Confirmar con `grep -n "'finance'" apps/contabilidad/src/main.ts` que ya no quedan ocurrencias en `requireRoles(...)` (la mención en el comentario de la línea 383 se actualiza también si describe el gate real).
- [x] 2.3 Correr la suite de 1.1–1.4 y confirmar que ahora pasa en verde.

## 3. Verificar impacto cruzado en tests existentes

- [x] 3.1 Buscar en todo el repo (`grep -rn "roles:\s*\['finance'\]"`, no solo `apps/contabilidad/test/`) tests de otros microservicios que construyan tokens con `'finance'` para llamar a estos endpoints de contabilidad. (Resultado: solo aparecen en `apps/contabilidad/test/integration/`, 10 archivos — 6 con `['finanzas', 'finance']` redundante y 3 con `['finance']` a secas, más el nuevo test de este change.)
- [x] 3.2 Actualizar esos tests para usar `'finanzas'` (o agregar ambos roles si el test necesita seguir cubriendo otro escenario), siguiendo el patrón ya usado en PR #76.
- [x] 3.3 Correr toda la suite de `apps/contabilidad` (unit + integration) y confirmar que no hay regresiones. (2 unit + 18 integration, todos en verde)

## 4. Cierre

- [ ] 4.1 Verificar manualmente (o documentar que no fue posible) que un usuario real de Finanzas en producción puede usar conciliar-cfdi y al menos un reporte tras el despliegue. **Bloqueada**: requiere PR mergeado + redeploy del VPS; no aplicable todavía (el fix solo existe en el working tree local).
- [x] 4.2 Actualizar la memoria de la sesión: marcar el bug gemelo de `fix-rol-finance-vs-finanzas-2026-07-16.md` como resuelto para `apps/contabilidad`, dejando explícito que `apps/compras` y `apps/asistente` siguen pendientes (fuera de alcance de este change).
