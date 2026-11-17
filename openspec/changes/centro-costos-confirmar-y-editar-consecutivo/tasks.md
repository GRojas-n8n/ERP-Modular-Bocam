## 1. Preparación

- [x] 1.1 Crear rama `feat/centro-costos-confirmar-consecutivo` desde `main` actualizado.
- [x] 1.2 Línea base: correr `centro-costos-alta.integration.test.ts`, `validacion-zod-admin-proyectos.integration.test.ts`, `evento-centro-costos-creado.integration.test.ts` y los `AdminView.*.test.tsx`; registrar que pasan (Postgres/Redis locales).

## 2. Política pura (TDD)

- [x] 2.1 Escribir tests en `apps/auth/src/centro-costos-policy.test.ts`: `siguienteConsecutivoDesdeMaximo(max)` (null→1, 2→3, 5→6, 999→error de agotado); `validarConsecutivo` (1 y 999 válidos; 0, 1000, -1, 1.5, "3", NaN inválidos).
- [x] 2.2 Implementar en `centro-costos-policy.ts` hasta que pasen; conservar `siguienteConsecutivo(count)` si algo más lo usa (verificar con grep) o migrar sus usos.

## 3. Backend — schema y endpoints (TDD de integración)

- [x] 3.1 Escribir tests de integración (rojos) en `centro-costos-alta.integration.test.ts`: GET siguiente-consecutivo (primer contrato → 001; con 001,002,005 → 006; sin efectos: dos consultas iguales y sin filas nuevas; rol no autorizado → 403; 999 → 409 `ADMIN_CONSECUTIVO_AGOTADO`); POST con consecutivo explícito libre (usa exactamente ese valor); POST con explícito ocupado (409 `ADMIN_CODIGO_DUPLICADO` + `consecutivo_sugerido`, sin crear); POST sin consecutivo mantiene reintento ante colisión; consecutivo inválido → 400.
- [x] 3.2 Agregar `consecutivo_centro_costos: z.number().int().min(1).max(999).optional()` a `crearProyectoSchema` y ampliar `validacion-zod-admin-proyectos.integration.test.ts`.
- [x] 3.3 Implementar `GET /api/v1/auth/admin/proyectos/siguiente-consecutivo` (mismos roles `ROLES_ALTA_CENTRO_COSTOS`, dentro de `createTenantContext({ tenantId })`, validando parámetros con Zod).
- [x] 3.4 Ajustar `POST /api/v1/auth/admin/proyectos`: cálculo `MAX+1`, camino con consecutivo explícito sin reintentos y `409 ADMIN_CODIGO_DUPLICADO` con `consecutivo_sugerido`, camino automático con reintento conservado.
- [x] 3.5 Confirmar que `auth.centro_costos_creado` sigue publicando `consecutivo_centro_costos` (test existente `evento-centro-costos-creado` verde).
- [x] 3.6 Tests backend en verde.

## 4. Frontend — app-shell (TDD)

- [x] 4.1 Escribir `AdminView.centro-costos-confirmar-consecutivo.test.tsx` (rojo): al elegir empresa+año+cliente se consulta el endpoint y se muestra el código completo con el consecutivo editable; al guardar aparece la confirmación con el código final y no se hace POST; "Modificar" vuelve al formulario con foco en el consecutivo y sin POST; "Aceptar y guardar" envía `consecutivo_centro_costos` confirmado; editar el consecutivo a `010` envía 10; un 409 `ADMIN_CODIGO_DUPLICADO` actualiza el sugerido y vuelve a pedir confirmación; cambiar cliente tras editar re-sugiere y avisa; respuesta obsoleta ignorada; especial y edición sin cambios.
- [x] 4.2 Agregar la función de API (`getSiguienteConsecutivoCentroCostos`) con su tipo en `apps/app-shell/src/lib/`.
- [x] 4.3 Modificar `ProyectoModal` en `AdminView.tsx`: bloque "Código" con consecutivo editable (input numérico, 3 dígitos con ceros), debounce ~300 ms, descarte de respuestas obsoletas, aviso de re-sugerencia.
- [x] 4.4 Agregar el paso de confirmación ("Aceptar y guardar" / "Modificar") reutilizando el estilo de los diálogos de confirmación de `AdminView`.
- [x] 4.5 Manejo del 409 `ADMIN_CODIGO_DUPLICADO` y `ADMIN_CONSECUTIVO_AGOTADO` con mensajes claros.
- [x] 4.6 Actualizar la ayuda contextual `src/help/content/admin.ts` (ya no dice que el consecutivo se asigna al guardar).
- [x] 4.7 `tsc -b` y `vitest run` de `app-shell` en verde; los `AdminView.*.test.tsx` existentes siguen verdes.

## 5. Verificación manual (local)

- [x] 5.1 Levantar el stack local (`run-app-shell`): alta con código sugerido aceptado; alta editando el consecutivo; alta con consecutivo ya ocupado (crear el mismo en otra pestaña entre vista previa y guardado) → aviso y nueva confirmación; alta de especial; edición de un centro existente. Verificado en navegador (Playwright) con el auth REAL y clientes de Ventas simulados: sugerido 001, editado a 007, 0 POST antes de aceptar, foco en el consecutivo tras Modificar.
- [ ] 5.2 Confirmar que el proyecto creado aparece en el selector con el código confirmado.

## 6. PR, despliegue y cierre

- [ ] 6.1 PR contra `main` (`feat(auth,app-shell): ...`) con CI verde (`backend-e2e`, `Cobertura RLS`, `frontend-build`).
- [ ] 6.2 Tras el merge y el deploy (frontend + auth), smoke en producción con un centro de costos de prueba **creado y luego archivado por el titular** (no se elimina desde código).
- [ ] 6.3 Archivar el change (`/opsx:archive`) y anotar en memoria: consecutivo `max+1`, editable con confirmación, `409` con sugerido.
