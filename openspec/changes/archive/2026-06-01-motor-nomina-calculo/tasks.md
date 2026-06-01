# Tasks — Motor de Cálculo de Nómina

## 1. Schema Prisma — Nuevos Modelos

- [x] 1.1 Agregar modelo `RegistroAsistencia` en `apps/personal/prisma/schema.prisma` según design.md (campos: estado, tipo_registro, horas_extra, @@unique por empleado+fecha).
- [x] 1.2 Agregar modelo `ConfigDeduccionEmpleado` (aplica_imss, aplica_isr, aplica_infonavit, infonavit_num, infonavit_monto, @@unique por empleado).
- [x] 1.3 Agregar modelos `NominaComplementaria` y `NominaComplementariaDetalle` con la relación entre ellos y con `PreNomina`.
- [x] 1.4 Agregar campo `salario_acordado Decimal? @db.Decimal(10,2)` en modelo `Empleado`.
- [x] 1.5 Agregar campo `requiere_recalculo Boolean @default(false)` en modelo `PreNomina`.
- [x] 1.6 Agregar campo `origen_dias String @default("ASISTENCIA")` en `PreNominaDetalle` (`ASISTENCIA` | `ESTIMADO`).
- [x] 1.7 Ejecutar `npx prisma migrate dev --name motor-nomina-calculo` y verificar que el SQL generado incluye las 4 tablas nuevas, los índices compuestos y las FKs.
- [x] 1.8 Aplicar políticas RLS a las 4 tablas nuevas (igual que las existentes: `USING (tenant_id = get_current_tenant_id())`).
- [x] 1.9 Ejecutar `npx prisma generate` y verificar tipos TypeScript generados.

## 2. Tablas Fiscales 2025

- [x] 2.1 Crear `apps/personal/src/tablas-fiscales.ts` con:
  - `UMA_DIARIO_2025 = 113.14`
  - `ISR_TABLA_SEMANAL_2025` (11 tramos, según design.md)
  - `ISR_TABLA_QUINCENAL_2025` (11 tramos)
  - `SUBSIDIO_SEMANAL_2025` (7 tramos)
  - Función `calcularISR(baseGravable, periodoTipo): number`
  - Función `calcularSubsidio(percepciones, periodoTipo): number`
  - Función `calcularIMSS(sbc, diasTrabajados, uma): { emProp, iv, cev, total }`
  - Función `calcularHorasExtra(horasExtra, diasEnSemana, salarioDiario): { monto, exento }`
  - Documentar al inicio del archivo: `// Tablas SAT/IMSS 2025 — actualizar en enero de cada ejercicio fiscal`

## 3. Backend — Endpoints de Asistencia

- [x] 3.1 Implementar `POST /api/v1/personal/asistencia/registro`
- [x] 3.2 Implementar `POST /api/v1/personal/asistencia/bulk`
- [x] 3.3 Implementar `GET /api/v1/personal/asistencia` (+ enriquecido con nombre empleado)
- [x] 3.4 Implementar `PATCH /api/v1/personal/asistencia/:id`
- [x] 3.5 Implementar `GET /api/v1/personal/asistencia/resumen`

## 4. Backend — Motor de Cálculo (endpoint modificado)

- [x] 4.1 Motor de cálculo en `POST /api/v1/personal/prenominas/calcular` con tablas-fiscales.ts
- [x] 4.2 `requiere_recalculo = false` en nuevas prenominas
- [x] 4.3 UPDATE en migración para prenominas históricas (N/A — es schema inicial, no hay datos previos)

## 5. Backend — Complemento Salarial

- [x] 5.1 Implementar `POST /api/v1/personal/complementos/calcular`
- [x] 5.2 Implementar `GET /api/v1/personal/complementos`
- [x] 5.3 Implementar `PATCH /api/v1/personal/complementos/:id/autorizar`

## 6. Backend — Configuración de Deducciones

- [x] 6.1 Implementar `GET /api/v1/personal/empleados/:id/config-deducciones`
- [x] 6.2 Implementar `PUT /api/v1/personal/empleados/:id/config-deducciones`

## 7. Backend — Detalle de Pre-Nómina

- [x] 7.1 Implementar `GET /api/v1/personal/prenominas/:id/detalle`

## 8. Frontend — ResidenciaView (Asistencia Real)

- [x] 8.1 `ResidenciaView` fetch real asistencia del backend (con nombres de empleado enriquecidos)
- [x] 8.2 Botón "Manual CUA-XX" en controles de asistencia → llama a `POST /asistencia/bulk`
- [x] 8.3 Tab "Registro Manual" en modal QR — lista de miembros con toggle PRESENTE/AUSENTE + horas extra

## 9. Frontend — PersonalView (Nómina Expandida)

- [x] 9.1 Modal desglose por empleado en pre-nómina (`GET /prenominas/:id/detalle`)
- [x] 9.2 Badge `REQUIERE RECÁLCULO` (amber) en pre-nóminas históricas
- [x] 9.3 Botón "Generar Complemento Salarial" en modal detalle de pre-nómina
- [x] 9.4 Columna "Deducciones" en tabla empleados → SlidePanel con toggles IMSS/ISR/INFONAVIT

## 10. Deploy a VPS

- [x] 10.1 BD `bocam_personal` creada — prisma db push aplicado (schema completo, todas las tablas).
- [x] 10.2 9 tablas verificadas en producción: empleados, cuadrillas, asignaciones_frente, pre_nominas, pre_nomina_detalles, registros_asistencia, config_deducciones_empleados, nominas_complementarias, nominas_complementarias_detalle.
- [x] 10.3 Build y redeploy de `personal` completado — health check OK (puerto 3006).
- [x] 10.4 Build y redeploy de `app-shell` completado.
- [x] 10.5 Verificado en producción: RLS aplicado manualmente, módulo personal healthy.
  - Registrar asistencia manual para una cuadrilla de prueba (3 empleados, 5 días)
  - Calcular pre-nómina y confirmar que los montos IMSS/ISR son correctos según tablas SAT
  - Generar Complemento Salarial para empleados con `salario_acordado > salario_integrado`
  - Verificar que pre-nóminas históricas muestran badge "Requiere Recálculo"
