## 1. Test que reproduce el bug (primero, antes del fix)

- [x] 1.1 Test de frontend (Vitest) `DashboardView.avance-real-mis-proyectos.test.tsx`: confirmado en rojo contra el código actual con `git stash` (2/2 tests fallando — mostraba el mock, nunca llamaba al endpoint nuevo).
- [x] 1.2 No se hizo como test separado — el estado "antes" quedó documentado en el design.md (`resumen-dashboard` no acepta lista de proyectos y requiere `superintendent`/`admin`) y verificado directamente en el código fuente antes de implementar.

## 2. Backend — `control-proyectos`

- [x] 2.1 Implementado `GET /api/v1/control-proyectos/avance-resumen-multi?proyecto_ids=...` (`main.ts`, antes de `/resumen-dashboard`). Sin `requireRoles` — accesible a cualquier rol autenticado, a diferencia del endpoint ejecutivo.
- [x] 2.2 `proyectoIds` se filtra contra `authorizedProjects` del JWT (`req.securityContext.authorizedProjects`) antes de consultar — un `proyecto_id` ajeno simplemente no aparece en la respuesta.
- [x] 2.3 Test de integración (`avance-resumen-multi.integration.test.ts`): proyecto con 1 avance VALIDADO (46%) + 1 PENDIENTE (90%, debe ignorarse) da `avance_pct: 46, tiene_avances: true`; proyecto sin avances da `avance_pct: 0, tiene_avances: false`. Verde.
- [x] 2.4 Mismo test: un tercer proyecto fuera de `authorizedProjects` (con avance VALIDADO propio) no aparece en absoluto en la respuesta.
- [x] **Hallazgo no previsto**: en el Postgres local de desarrollo, la conexión usa el rol `postgres` (superusuario), que **bypassea RLS** incluso con `FORCE ROW LEVEL SECURITY` (comportamiento estándar de Postgres: superusuarios siempre bypassean RLS). El primer intento del test devolvía un promedio contaminado con datos de otro tenant ya presentes en la base. Se agregó filtro explícito `tenant_id`/`proyecto_id` en el `where` del `aggregate` como defensa en profundidad (patrón ya usado en otro punto de `main.ts`, línea ~1005) — no depende únicamente de RLS. **Nota para el equipo**: vale la pena auditar si otros endpoints que solo confían en RLS (la mayoría de `control-proyectos`/`gerencia-tecnica`) tienen el mismo filtro explícito o dependen 100% de que el rol de conexión en producción no tenga bypass — está fuera de alcance de este fix puntual.

## 3. Frontend — `DashboardView`

- [x] 3.1 `DashboardView` dispara el fetch a `avance-resumen-multi` al montar (`useEffect` con dependencia en `projectIdsKey`, los `proyecto_id` de `user.projects` unidos por coma).
- [x] 3.2 Mientras carga, la tarjeta muestra "…" con `animate-pulse` en vez de un número, y la barra se mantiene en 0% de ancho.
- [x] 3.3 Fórmula `Math.min(35 + index * 20, 100)` eliminada.
- [x] 3.4 Respuesta mapeada por `proyecto_id`; `tiene_avances: false` → "Sin avances registrados"; `true` → `${avance_pct}%`.
- [x] 3.5 Error del fetch → `avanceError` → "Avance no disponible" en vez de cualquier número.

## 4. Verificación final

- [x] 4.1 Test de 1.1 corrido de nuevo tras el fix: verde (2/2).
- [ ] 4.2 Verificación manual en navegador real — pendiente, requiere ambiente corriendo; queda para QA/revisión humana.
- [x] 4.3 No se modificó `/resumen-dashboard` ni `DashboardEjecutivo` — solo se agregó un endpoint nuevo y se tocó exclusivamente la rama no-ejecutiva de `DashboardView`.
