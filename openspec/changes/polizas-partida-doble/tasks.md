## 1. Schema — CuentaContable + MovimientoPoliza

- [x] 1.1 Agregar modelo `CuentaContable` al `apps/contabilidad/prisma/schema.prisma` (campos: id_cuenta, tenant_id?, clave, nombre, tipo, naturaleza, padre_id, nivel, activa, created_at)
- [x] 1.2 Agregar modelo `MovimientoPoliza` al schema (campos: id_movimiento, tenant_id, proyecto_id, asiento_id, cuenta_id, descripcion, cargo, abono, orden, created_at; FK a AsientoContable y CuentaContable)
- [x] 1.3 Generar y ejecutar migración Prisma (`prisma migrate dev --name add-partida-doble`)
- [x] 1.4 Crear seed SQL `prisma/migrations/seed_catalogo_cuentas.sql` con las 15 cuentas base (1100–6100) e insertar via `psql` en contabilidad DB

## 2. Mapper hardcoded tipo_poliza → movimientos

- [x] 2.1 Crear `apps/contabilidad/src/mapper.ts` con función `buildMovimientosForPoliza(tipoPoliza, monto, context)` que retorna `[{ clave_cargo, clave_abono, monto, descripcion }]`
- [x] 2.2 Implementar mappings: EGRESO (2100→1100), PASIVO_PROYECTADO (5110→2100), REVERSION_PASIVO_PROYECTADO (2100→5110), TRANSFERENCIA_INTERNA (6100→6100), ESTIMACION (1200→4100), AVANCE (5100→2100)
- [x] 2.3 Agregar función `resolveCuentaId(prisma, clave)` que busca la cuenta en BD con graceful fallback (log warn si no existe)
- [x] 2.4 Agregar función `persistMovimientos(prisma, asientoId, movimientosDefs, ctx)` que valida cuadre (sum cargo === sum abono) y persiste las líneas; loggea error si descuadra

## 3. Integrar mapper en handlers existentes

- [x] 3.1 Extender `handlePagoRegistradoEvent` para llamar `persistMovimientos` si `fecha_poliza >= PARTIDA_DOBLE_CUTOFF`
- [x] 3.2 Extender `handleOrdenCompraCreadaEvent` para generar movimientos PASIVO_PROYECTADO
- [x] 3.3 Extender `handleOrdenCompraCanceladaEvent` para generar movimientos REVERSION_PASIVO_PROYECTADO
- [x] 3.4 Extender `handleTransferenciaPresupuestalEvent` para generar movimientos TRANSFERENCIA_INTERNA
- [x] 3.5 Extender `handleFondosComprometidosEvent` y `handleFondosLiberadosEvent` (estos ya son de reconciliación, no generan movimientos propios — verificar si aplica)

## 4. Nuevos event handlers — control_obra

- [x] 4.1 Agregar `control_obra.estimacion_aprobada` y `control_obra.avance_fisico_validado` al enum `ContabilidadConsumedEvents` en `types.ts`
- [x] 4.2 Implementar `handleEstimacionAprobadaEvent` que crea AsientoContable tipo `ESTIMACION` + movimientos (1200/4100)
- [x] 4.3 Implementar `handleAvanceFisicoValidadoEvent` que crea AsientoContable tipo `AVANCE` + movimientos (5100/2100)
- [x] 4.4 Registrar los nuevos handlers en la suscripción RabbitMQ del `main.ts` de contabilidad

## 5. Endpoint catálogo de cuentas

- [x] 5.1 Agregar `GET /api/v1/contabilidad/cuentas` que retorna todas las `CuentaContable` con `activa = true`, ordenadas por `clave`

## 6. Endpoints de reportes

- [x] 6.1 Implementar `GET /api/v1/contabilidad/reportes/balanza-comprobacion?desde=&hasta=` usando `prisma.$queryRaw` para agregar cargo/abono por cuenta en el período
- [x] 6.2 Implementar `GET /api/v1/contabilidad/reportes/estado-resultados?desde=&hasta=` filtrando cuentas 4xxx (INGRESO), 5xxx (COSTO), 6xxx (GASTO) con cálculo de utilidad neta
- [x] 6.3 Implementar `GET /api/v1/contabilidad/reportes/balance-general?fecha=` con saldos acumulados hasta la fecha para cuentas 1xxx, 2xxx, 3xxx
- [x] 6.4 Implementar `GET /api/v1/contabilidad/reportes/libro-diario?desde=&hasta=&page=&limit=` que retorna asientos con movimientos en orden cronológico, paginado
- [x] 6.5 Implementar `GET /api/v1/contabilidad/dashboard` con KPIs: total_asientos, cerrados, pendientes_cfdi, pendientes_banco, total_egreso_mes, total_ingreso_mes, alertas mapper_error

## 7. Endpoint movimientos por asiento

- [x] 7.1 Agregar `GET /api/v1/contabilidad/asientos/:id/movimientos` que retorna las líneas de `MovimientoPoliza` con join a `CuentaContable` (clave, nombre)

## 8. Tests de integración

- [x] 8.1 `contabilidad/test/integration/mapper.polizas.integration.test.ts` — test unitario del mapper: verifica cargo/abono correcto para cada tipo_poliza y cuadre contable
- [x] 8.2 `contabilidad/test/integration/control-obra.estimacion.integration.test.ts` — test evento `control_obra.estimacion_aprobada` genera AsientoContable + 2 MovimientoPoliza
- [x] 8.3 `contabilidad/test/integration/control-obra.avance.integration.test.ts` — test evento `control_obra.avance_fisico_validado` genera asiento + movimientos
- [x] 8.4 `contabilidad/test/integration/reportes.balanza.integration.test.ts` — test endpoint balanza: crea movimientos de prueba y verifica agregados + cuadre

## 9. Frontend — ContabilidadView.tsx

- [x] 9.1 Crear `apps/app-shell/src/views/ContabilidadView.tsx` con estructura de 3 tabs (Pólizas, Conciliación, Reportes) y estado inicial en tab Pólizas
- [x] 9.2 Implementar tab Pólizas: tabla con columnas folio/fecha/tipo/concepto/monto/estatus-cfdi/estatus-banco, filtros por tipo y rango de fechas
- [x] 9.3 Implementar expansión de filas en tab Pólizas: `GET /api/v1/contabilidad/asientos/:id/movimientos` → tabla anidada cargo/abono; mensaje especial para pre-cutoff
- [x] 9.4 Implementar tab Conciliación: sub-sección CFDI pendientes con modal conciliar-cfdi; sub-sección banco pendientes con modal conciliar-banco
- [x] 9.5 Implementar tab Reportes: selector de reporte, date picker desde/hasta, botón Generar, tabla de resultados con spinner y manejo de error
- [x] 9.6 Implementar las 4 llamadas de reporte en el tab Reportes (balanza, estado resultados, balance general, libro diario)

## 10. Proxy nginx + vite + sidebar

- [x] 10.1 Agregar bloque proxy en `apps/app-shell/nginx.conf` para `/api/v1/contabilidad/` → `contabilidad:3008`
- [x] 10.2 Agregar entrada proxy en `apps/app-shell/vite.config.ts` para `/api/v1/contabilidad` → `http://localhost:3008`
- [x] 10.3 Ítem "Contabilidad" ya estaba en el sidebar de `Layout.tsx` (rol `contabilidad`); añadido import + case en `App.tsx` para renderizar `ContabilidadView`
