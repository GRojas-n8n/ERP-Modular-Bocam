## 1. Backend — endpoint de reactivar

- [x] 1.1 Agregado `PATCH /api/v1/personal/empleados/:id/reactivar` en `apps/personal/src/main.ts`, junto al `/baja` existente, restringido a `requireRoles('personal_rh', 'admin')`. Actualiza `estado: 'ACTIVO'`, `fecha_baja: null`.
- [x] 1.2 Test de integración: `testReactivarEmpleadoDadoDeBaja` — 200, `estado: 'ACTIVO'`, `fecha_baja: null`.
- [x] 1.3 Test de integración: `testReactivarSinPermisoEs403` — 403 sin `personal_rh`/`admin`, sin modificar el empleado.
- [x] 1.4 Test de regresión: `testBajaSigueFuncionandoIgual` — `/baja` sigue respondiendo 200, `estado: 'BAJA'`, `cuadrilla_id: null`, `fecha_baja` establecida. Además `testReactivarNoRestauraCuadrilla` confirma que reactivar no restaura la cuadrilla previa. Ver `apps/personal/test/integration/baja-reactivar-empleado.integration.test.ts` (4/4 ok).

## 2. Frontend — conectar los botones

- [x] 2.1 Agregado `confirmBajaEmpleado`/`confirmReactivarEmpleado` (guardan el `Empleado` objetivo o `null`) y `procesandoEstadoEmpleado` en `PersonalView.tsx`, junto a `confirmRevocarCredencial`.
- [x] 2.2 Agregados `handleDarDeBaja`/`handleReactivarEmpleado`: llaman a `api.patch` sobre `/baja`/`/reactivar`, actualizan `empleados` en estado local con la respuesta (sin refetch completo), notifican éxito/error, cierran el diálogo.
- [x] 2.3 En la columna "Config." de la tabla de empleados, agregado el botón "Dar de baja" (visible si `estado === 'ACTIVO'`) y "Reactivar" (visible si `estado === 'BAJA'`), junto a Editar/Jornada/Deducciones.
- [x] 2.4 Agregados dos `ConfirmCriticalActionDialog`: "¿Dar de baja a [nombre]?" (`variant="destructive"`, mismo patrón que "Revocar credencial") y "¿Reactivar a [nombre]?" (variant por defecto).

## 3. Verificación

- [x] 3.1 Suite de `apps/personal` corrida en verde: 4 tests nuevos + `rbac-endpoints-personal-sin-rol` (6/6) + `edicion-datos-empleado` (7/7) — sin regresiones.
- [x] 3.2 `npx tsc --noEmit` en `apps/personal` y `apps/app-shell` — ambos limpios.
- [x] 3.3 Suite de componentes de `PersonalView` (vitest) corrida en verde: 12 archivos / 53 tests — sin regresiones. No se agregó un test de componente dedicado para los botones nuevos (cobertura de integración en el backend + revisión de código del wiring; el patrón es idéntico al ya probado de "Revocar credencial").

## 4. Deploy y cierre

- [ ] 4.1 Desplegar vía CI (push a `main` tras PR aprobado).
- [ ] 4.2 Verificar en `iretum.com` que dar de baja y reactivar un empleado funcionan de extremo a extremo.
- [ ] 4.3 `openspec archive wire-baja-reactivar-empleado` tras verificación en producción.
