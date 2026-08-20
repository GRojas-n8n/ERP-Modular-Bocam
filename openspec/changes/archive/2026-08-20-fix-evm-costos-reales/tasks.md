## 1. Backend — control-proyectos: schema

- [x] 1.1 Agregar `ac_comprometido` y `ac_ejercido` (Decimal(18,2), default 0) a `ProgramacionObra` en `apps/control-proyectos/prisma/schema.prisma`.
- [x] 1.2 Agregar modelo nuevo `OrdenCompraSeguimiento` (`oc_id` único, `tenant_id`, `proyecto_id`, `concepto_id`, `monto_comprometido`, `monto_ejercido`, timestamps) con índice `[tenant_id, proyecto_id, concepto_id]`. (Además, no itemizado explícitamente en este tasks.md pero necesario para implementar honestamente 2.7/4.2/4.3 del design.md: `ManoObraProyecto` — acumulador de mano de obra pagada por proyecto — y `PagoEvmProcesado` — idempotencia por `id_pago` para las ramas nuevas de `finanzas.pago_registrado` — ambos con política RLS en `rls-policies.sql`.)
- [x] 1.3 Generar y aplicar la migración contra la BD local real (Docker). Verificar columnas/tabla con `\d` directo en Postgres.

## 2. Backend — control-proyectos: AC por partida (TDD: test primero)

- [x] 2.1 Test que reproduce el bug: `recalcularEVMPorAvanceValidado` con `ev` distinto de un AC real produce `cpi = 1` porque `ac = acAcumulado ?? ev` usa el mismo valor. Rojo confirmado. (Implementado como `test_2_1_ac_ya_no_es_igual_a_ev` en `test/e2e/evm-costos-reales.e2e.test.ts` — siembra `ac_comprometido=50000`/`ac_ejercido=30000` distintos de `ev=50000` y valida `cpi=0.625`, no `1.0`. El "rojo" se confirmó por análisis del código antes del fix — `ac = acAcumulado ?? ev` con `acAcumulado` recibiendo siempre `importe_acumulado`, el mismo valor de `ev` — y quedó documentado también en el assert `cpi !== null` preexistente en `bitacoras-avances-evm.e2e.test.ts`, trivialmente cierto bajo el bug porque `ac` nunca podía ser 0.)
- [x] 2.2 Test: subscriber de `compras.oc_creada` incrementa `ac_comprometido` de la `ProgramacionObra` con ese `concepto_id` y crea el registro en `OrdenCompraSeguimiento`. Rojo confirmado (subscriber no existe). (`test_2_2_oc_creada_incrementa_ac_comprometido`, incluye idempotencia por `oc_id`.)
- [x] 2.3 Test: subscriber de `compras.oc_cancelada` resuelve `concepto_id` vía `OrdenCompraSeguimiento` (payload sin `concepto_id`) y decrementa `ac_comprometido`. (`test_2_3_oc_cancelada_revierte_ac_comprometido`.)
- [x] 2.4 Test: subscriber de `finanzas.pago_registrado` con `referencia_entidad = 'OrdenCompra'` resuelve `concepto_id` vía `OrdenCompraSeguimiento`, decrementa `ac_comprometido` e incrementa `ac_ejercido`. (`test_2_4_pago_orden_compra_mueve_comprometido_a_ejercido`, incluye idempotencia por `id_pago` vía `PagoEvmProcesado`.)
- [x] 2.5 Test: `finanzas.pago_registrado` con `referencia_entidad = 'Estimacion'` sigue funcionando igual que antes (no toca `ac_comprometido`/`ac_ejercido` de ninguna partida) — regresión del comportamiento existente. (`test_2_5_pago_estimacion_no_toca_ac_de_partidas`, + regresión real contra RabbitMQ+finanzas en `test:integration:finanzas-pago-feedback`, verde.)
- [x] 2.6 Implementar los 2 subscribers nuevos (`compras.oc_creada`, `compras.oc_cancelada`) siguiendo el patrón del subscriber existente de `almacen.salida_obra`. (`handleOcCreadaEvent`/`handleOcCanceladaEvent` en `src/main.ts`, suscritos en `initEventSubscribers`.)
- [x] 2.7 Ampliar `handlePagoRegistradoEvent` con la rama nueva para `referencia_entidad === 'OrdenCompra'`, sin tocar la rama existente de `'Estimacion'`. (+ rama `'PreNomina'` para el grupo 4, ver 4.2 — ambas vía `aplicarPagoOrdenCompraAlEvm`/`aplicarPagoPreNominaAlEvm`.)
- [x] 2.8 `recalcularEVMPorAvanceValidado` deja de recibir `acAcumulado`; lee `ac = ac_comprometido + ac_ejercido` de la `ProgramacionObra`. Actualizar el llamador en `PATCH /avances/:id/validar` (línea ~751-758) para dejar de pasar ese parámetro.
- [x] 2.9 Tests 2.1-2.5 en verde. (`npm run test:e2e:evm-costos-reales` + `npm run test:integration:finanzas-pago-feedback`, ambos verdes.)

## 3. Backend — control-proyectos: PV interpolado (TDD: test primero)

- [x] 3.1 Test que reproduce el bug: `pv = bac * (pct_avance_real / 100)` da el mismo resultado que `ev` porque usa el mismo `pct`. Rojo confirmado. (Cubierto por el assert `spi` actualizado en `bitacoras-avances-evm.e2e.test.ts` — bajo el código viejo `pv` habría sido idéntico al `ev` derivado del mismo `pct`; con el fix `pv` se interpola de `curva_programada`, independiente del `pct` de avance físico, ver 3.3.)
- [x] 3.2 Función de interpolación: dado `curva_programada` (JSONB `[{semana, pct_acumulado}]`) y una fecha de corte, retorna el `pct_acumulado` del último punto con semana `<=` la semana de corte, o `null` si la curva está vacía o la fecha es anterior al primer punto. (`interpolarPctProgramado`, exportada; `test_3_2_interpolarPctProgramado_puro` cubre los 6 casos del spec, incluyendo `0` cuando `hoy` es anterior al primer punto vs. `null` cuando la curva está vacía.)
- [x] 3.3 Test: partida con curva programada — PV usa el porcentaje interpolado, no `pct_avance_real`. (`test_3_3_pv_usa_curva_no_avance_fisico`: curva interpola a 70%, avance físico real es 90% — el SPI resultante prueba que se usó el interpolado.)
- [x] 3.4 Test: partida sin `curva_programada` — `pv`/`spi` son `null`, no se calculan a partir del avance físico. (`test_3_4_sin_curva_programada_pv_y_spi_null`.)
- [x] 3.5 Tests 3.1/3.3/3.4 en verde. (`npm run test:e2e:evm-costos-reales` + `npm run test:e2e:bitacoras-avances-evm`, ambos verdes.)

## 4. Backend — control-proyectos: snapshot de ProyeccionCierre (TDD: test primero)

- [x] 4.1 Test que reproduce el bug: tras correr el job nocturno, `ProyeccionCierre` sigue vacía para un proyecto con `ProgramacionObra`. Rojo confirmado. (`test_4_1_job_persiste_snapshot` — confirma explícitamente que `ProyeccionCierre` está vacía ANTES de llamar `calcularYGuardarProyeccionCierre`, luego que existe un snapshot después.)
- [x] 4.2 Test: subscriber/acumulador de `finanzas.pago_registrado` con `referencia_entidad = 'PreNomina'` — el monto se guarda a nivel proyecto (no por partida) para sumarlo al AC global del próximo snapshot. (`test_4_2_pago_prenomina_acumula_a_nivel_proyecto`, vía `ManoObraProyecto` + `aplicarPagoPreNominaAlEvm`.)
- [x] 4.3 Implementar el cálculo de snapshot dentro de `initJobNocturno`: agregar BAC/PV/EV/AC de todas las `ProgramacionObra` del proyecto + mano de obra pagada del proyecto, calcular CPI/SPI/CV/SV/EAC/ETC/VAC, y crear el registro en `ProyeccionCierre`. (`calcularYGuardarProyeccionCierre`, invocada desde `initJobNocturno` junto a `calcularAlertas`; `test_4_3_snapshot_incluye_mano_de_obra_en_ac_global` verifica que el AC global suma partidas + mano de obra.)
- [x] 4.4 Test 4.1 en verde: existe un snapshot nuevo tras correr el job.
- [x] 4.5 Test: `GET /api/v1/control-proyectos/dashboard` y `GET /evm` devuelven `resumen_evm`/`global` con valores numéricos, no `null`, cuando existe al menos un snapshot. (`test_4_5_dashboard_y_evm_ya_no_devuelven_global_null` — confirma `null` antes del snapshot y numérico después.)
- [x] 4.6 Suite completa de `apps/control-proyectos` corrida en verde. Ver reporte de la sesión: 8 suites ejecutadas (`test:integration`, `test:integration:centro-costos-creado`, `test:integration:finanzas-pago-feedback`, `test:e2e:reconciliacion`, `test:e2e:seguridad`, `test:e2e:bitacoras-avances-evm`, `test:e2e:avances-estimaciones-rbac-catalogo`, `test:e2e:evm-costos-reales`), todas verdes; `npx tsc --noEmit` y `node scripts/ci/check-rls-coverage.js` también verdes.

## 5. Verificación en navegador real (local)

- [ ] 5.1 Entorno local levantado: `compras`, `finanzas`, `control-proyectos`, `gerencia-tecnica`, `app-shell`, con un proyecto real que tenga presupuesto, programación de obra cargada, al menos una OC creada y pagada, y avances físicos validados.
- [ ] 5.2 Verificado en navegador: crear una OC contra un concepto con programación cargada incrementa `ac_comprometido` visible (vía endpoint o BD) de esa partida.
- [ ] 5.3 Verificado en navegador: registrar el pago de esa OC mueve el monto de `ac_comprometido` a `ac_ejercido`.
- [ ] 5.4 Verificado en navegador: tras correr el job nocturno manualmente (o esperar el intervalo en un entorno de prueba con `MS_24H` reducido), `GET /dashboard` y `GET /evm` devuelven `resumen_evm`/`global` con CPI/SPI reales, no `null` ni ≈1 artificial.

## 6. Deploy y verificación en VPS

- [ ] 6.1 Desplegado vía CI (push a `main`). Confirmar migración aplicada en `_prisma_migrations` real y columnas/tabla nuevas presentes.
- [ ] 6.2 Confirmar en producción real que un CPI/SPI ya no es siempre ≈1 en al menos un proyecto con datos reales de compras/pagos.

## 7. Cierre

- [ ] 7.1 Actualizar memoria del proyecto con el resultado (bug confirmado y corregido, o hallazgos adicionales encontrados durante la implementación).
- [ ] 7.2 `openspec archive fix-evm-costos-reales` tras verificación en producción.
