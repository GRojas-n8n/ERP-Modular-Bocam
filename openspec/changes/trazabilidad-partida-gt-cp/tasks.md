## 1. GT — endpoint de movimientos por partida

- [x] 1.1 Test (rojo primero): `GET /partidas/:concepto_id/movimientos`
      con una partida que tiene compromisos/ejercicios/reversas retorna
      200 con la lista completa de `SaldoMovimiento`, orden
      `created_at desc`.
      → `movimientos-partida.integration.test.ts`, confirmado rojo
      (404) antes de implementar.
- [x] 1.2 Test (rojo primero): `concepto_id` sin `SaldoPartida` retorna
      404 `SALDO_NO_INICIALIZADO`.
- [x] 1.3 Test (rojo primero): partida con `SaldoPartida` pero sin
      movimientos retorna 200 `[]`.
- [x] 1.4 Test (rojo primero): rol sin acceso (ej. `compras` sin ninguno
      de los roles permitidos) retorna 403.
- [x] 1.5 Implementar el endpoint en `apps/gerencia-tecnica/src/main.ts`,
      mismo guard de roles que `GET /partidas/:concepto_id/saldo`
      (`admin, superintendent, gerencia_tecnica, control_proyectos,
      control_obra`). Reusar el patrón de
      `GET /partidas/:concepto_id/transferencias` como referencia de
      estructura.
      → Insertado entre `DELETE /comprometer/:referencia_id` y
      `PATCH /anular-bloqueo`, mismo guard exacto que `/saldo`.
- [x] 1.6 `tsc --noEmit` y suite de integración de `gerencia-tecnica` en
      verde, sin regresión.
      → `tsc --noEmit` limpio. `movimientos-partida.integration.test.ts`
      4/4 verde. `saldo-partida.integration.test.ts` 11/11 verde (sin
      regresión).

## 2. Finanzas — filtro concepto_id en /movimientos

- [x] 2.1 Test (rojo primero): `GET /movimientos?concepto_id=X` con
      presupuesto sincronizado retorna los mismos movimientos que
      `?presupuesto_id=` para ese presupuesto.
- [x] 2.2 Test (rojo primero): `concepto_id` sin presupuesto sincronizado
      retorna 200 `[]` (no 404).
- [x] 2.3 Test (rojo primero): si se envían `presupuesto_id` y
      `concepto_id` juntos, `presupuesto_id` tiene precedencia
      (comportamiento existente sin cambios).
      → `movimientos-por-concepto.integration.test.ts`, confirmado rojo
      (2/3 fallando) antes de implementar.
- [x] 2.4 Implementar el filtro en
      `apps/finanzas/src/main.ts` (`GET /api/v1/finanzas/movimientos`):
      resolver `presupuesto_id` desde `concepto_id` (mismo criterio que
      `GET /presupuestos/por-concepto/:conceptoId`, estatus `ACTIVO`)
      antes de filtrar `MovimientoPresupuestal`.
- [x] 2.5 `tsc --noEmit` y suite de integración de `finanzas` en verde,
      sin regresión.
      → `tsc --noEmit` limpio. `movimientos-por-concepto.integration.test.ts`
      3/3 verde. `sincronizacion-partida-gt.integration.test.ts` 9/9
      verde (sin regresión).

## 3. app-shell — componente compartido de tabla + drill-down

- [x] 3.1 Test (RTL, rojo primero): al hacer clic en una fila de partida
      en la tabla de Control Presupuestal, se despliegan sus movimientos
      combinando GT + Finanzas.
- [x] 3.2 Test (RTL, rojo primero): partida sin movimientos en ningún
      servicio muestra "Sin movimientos registrados para esta partida".
- [x] 3.3 Test (RTL, rojo primero): si Finanzas falla pero GT responde
      (o viceversa), se muestran los movimientos disponibles con nota de
      lista incompleta, sin bloquear el drill-down.
      → `ControlPresupuestalTabla.test.tsx`, confirmado rojo (módulo
      inexistente) antes de implementar. Incluye además un 4º test: sin
      controles de escritura visibles.
- [x] 3.4 Extraer la tabla de Control Presupuestal de `InsumosView.tsx` a
      un componente reusable (ej. `ControlPresupuestalTabla.tsx`) que
      incluya el nuevo drill-down, etiquetado como "Movimientos" (no
      "Trazabilidad", para no confundir con la pestaña existente basada
      en `CompraProyectada`).
      → Filas de detalle sin encabezado "Trazabilidad"; drill-down
      combina GT+Finanzas vía `Promise.allSettled` (fail-soft por
      servicio, sin bloquear el otro).
- [x] 3.5 Montar el componente en `InsumosView.tsx` (pestaña "Control
      Presupuestal" existente, sin cambiar su comportamiento previo,
      solo agregar el drill-down).
- [x] 3.6 `npm run build` limpio en `app-shell` y suite de tests
      correspondiente en verde.
      → `tsc -b` limpio (no `--noEmit`, ver gotcha de CI en memoria).
      `ControlPresupuestalTabla.test.tsx` 4/4 verde,
      `InsumosView.catalogo-scroll.test.tsx` sin regresión.

## 4. app-shell — nueva pestaña de solo lectura para Control de Proyectos

- [x] 4.1 Test (RTL, rojo primero): usuario con rol `control_proyectos`
      ve la pestaña "Presupuesto por Partida" en el módulo Control de
      Obra y puede expandir movimientos, sin ningún control de escritura
      visible.
      → `ControlObraView.presupuesto-partida.test.tsx`, confirmado rojo
      (pestaña inexistente, caía al fallback "bitácoras") antes de
      implementar.
- [x] 4.2 Agregar el subItem de navegación en
      `apps/app-shell/src/components/Layout.tsx` (módulo `control-obra`,
      roles ya existentes `control_obra`/`control_proyectos`/`director`
      — el subItem visible solo para `control_proyectos` y `admin` si
      aplica, a definir según convención de `roles` por subItem ya usada
      en otros módulos).
      → Se siguió la convención real del propio módulo `control-obra`:
      ningún subItem existente restringe por rol más allá del módulo
      (a diferencia de "Compras"), así que el nuevo subItem tampoco lo
      hace — visible a los 3 roles del módulo. La restricción real de
      "quién puede ver" ya vive en el guard de roles del endpoint GT
      (sección 1), que sí exige explícitamente `control_proyectos`.
- [x] 4.3 Montar el mismo componente `ControlPresupuestalTabla.tsx` en
      `ControlObraView.tsx` bajo esa pestaña, en modo lectura.
      → Reusa `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal`
      (mismo endpoint agregado que ya usa GT), consistente con el
      precedente existente `loadCostosCO` que ya cruza a `gerencia-tecnica`
      desde esta misma vista.
- [x] 4.4 `npm run build` limpio en `app-shell` y suite de tests en
      verde.
      → `tsc -b` limpio. `ControlObraView.presupuesto-partida.test.tsx`
      2/2 verde. Suite completa de `app-shell`: 30/30 archivos, 86/86
      tests verde (sin regresión).

## 5. Cierre

- [ ] 5.1 Verificar manualmente en local con datos reales de un proyecto
      con partidas comprometidas: expandir una partida en GT y en
      Control de Proyectos y confirmar que ambas muestran el mismo
      historial.
- [ ] 5.2 PR, CI verde, merge, redeploy VPS de `gerencia-tecnica`,
      `finanzas` y `app-shell`.
- [ ] 5.3 Sincronizar specs delta (`movimientos-partida-endpoint` nueva,
      `trazabilidad-partida-frontend` nueva) a `openspec/specs/` y
      archivar el change.
