# Tasks — Motor de Cálculo de Nómina

## 1. Schema Prisma — Nuevos Modelos

- [ ] 1.1 Agregar modelo `RegistroAsistencia` en `apps/personal/prisma/schema.prisma` según design.md (campos: estado, tipo_registro, horas_extra, @@unique por empleado+fecha).
- [ ] 1.2 Agregar modelo `ConfigDeduccionEmpleado` (aplica_imss, aplica_isr, aplica_infonavit, infonavit_num, infonavit_monto, @@unique por empleado).
- [ ] 1.3 Agregar modelos `NominaComplementaria` y `NominaComplementariaDetalle` con la relación entre ellos y con `PreNomina`.
- [ ] 1.4 Agregar campo `salario_acordado Decimal? @db.Decimal(10,2)` en modelo `Empleado`.
- [ ] 1.5 Agregar campo `requiere_recalculo Boolean @default(false)` en modelo `PreNomina`.
- [ ] 1.6 Agregar campo `origen_dias String @default("ASISTENCIA")` en `PreNominaDetalle` (`ASISTENCIA` | `ESTIMADO`).
- [ ] 1.7 Ejecutar `npx prisma migrate dev --name motor-nomina-calculo` y verificar que el SQL generado incluye las 4 tablas nuevas, los índices compuestos y las FKs.
- [ ] 1.8 Aplicar políticas RLS a las 4 tablas nuevas (igual que las existentes: `USING (tenant_id = get_current_tenant_id())`).
- [ ] 1.9 Ejecutar `npx prisma generate` y verificar tipos TypeScript generados.

## 2. Tablas Fiscales 2025

- [ ] 2.1 Crear `apps/personal/src/tablas-fiscales.ts` con:
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

- [ ] 3.1 Implementar `POST /api/v1/personal/asistencia/registro` — registrar un día de asistencia:
  - `requireRoles('residencia', 'control_obra', 'personal_rh', 'admin')`
  - Body: `{ empleado_id, fecha, estado, tipo_registro?, horas_extra?, cuadrilla_id? }`
  - Upsert por `(tenant_id, empleado_id, fecha)` — si ya existe, actualizar
  - `proyecto_id` del JWT

- [ ] 3.2 Implementar `POST /api/v1/personal/asistencia/bulk` — batch de asistencia (cuadrilla completa en un día):
  - `requireRoles('residencia', 'control_obra', 'personal_rh', 'admin')`
  - Body: `{ fecha, registros: [{ empleado_id, estado, horas_extra? }][], cuadrilla_id? }`
  - Upsert de todos los registros en una transacción

- [ ] 3.3 Implementar `GET /api/v1/personal/asistencia` — listar registros:
  - `requireRoles('residencia', 'control_obra', 'personal_rh', 'admin')`
  - Query params: `fecha_inicio`, `fecha_fin`, `cuadrilla_id`, `empleado_id`

- [ ] 3.4 Implementar `PATCH /api/v1/personal/asistencia/:id` — corregir un registro:
  - `requireRoles('personal_rh', 'admin')`
  - Permite cambiar `estado` y `horas_extra`

- [ ] 3.5 Implementar `GET /api/v1/personal/asistencia/resumen` — resumen por período:
  - `requireRoles('personal_rh', 'admin')`
  - Query params: `fecha_inicio`, `fecha_fin`
  - Respuesta: array por empleado con `dias_trabajados`, `dias_ausente`, `total_horas_extra`, `dias_estimados` (si no hay registros)

## 4. Backend — Motor de Cálculo (endpoint modificado)

- [ ] 4.1 Reemplazar la lógica de cálculo en `POST /api/v1/personal/prenominas/calcular`:
  - Importar `tablas-fiscales.ts`
  - Para cada empleado ACTIVO con `tipo_contrato IN ('PLANTA', 'EVENTUAL')`:
    - Consultar `RegistroAsistencia` del período → `diasTrabajados`, `totalHorasExtra`
    - Si `diasTrabajados == 0` y no hay registros: usar días del período como fallback, marcar `origen_dias = 'ESTIMADO'`
    - Si `diasTrabajados == 0` y hay registros: omitir empleado (ausente todo el período)
    - Leer `ConfigDeduccionEmpleado` (o usar defaults: imss=true, isr=true, infonavit=false)
    - Ejecutar motor: calcular `imss`, `isr`, `horas_extra` según algoritmo del design.md
    - Crear `PreNominaDetalle` con todos los campos poblados

- [ ] 4.2 Al crear `PreNomina`, establecer `requiere_recalculo = false` (las nuevas nacen limpias).

- [ ] 4.3 En el deploy (migración), ejecutar un `UPDATE prenominas SET requiere_recalculo = true WHERE estado IN ('BORRADOR', 'CALCULADA')` para marcar las existentes. Incluir este SQL en el archivo de migración de Prisma.

## 5. Backend — Complemento Salarial

- [ ] 5.1 Implementar `POST /api/v1/personal/complementos/calcular`:
  - `requireRoles('personal_rh', 'admin')`
  - Body: `{ prenomina_id }`
  - Lee la `PreNomina` y sus `detalles`
  - Para cada detalle: busca `Empleado.salario_acordado`; si > `salario_integrado`, calcula `complemento_dia × diasTrabajados`
  - Crea `NominaComplementaria` + `NominaComplementariaDetalle`
  - Si ya existe un complemento para esa `prenomina_id` → `409`

- [ ] 5.2 Implementar `GET /api/v1/personal/complementos` — listar con filtros de período.

- [ ] 5.3 Implementar `PATCH /api/v1/personal/complementos/:id/autorizar`:
  - `requireRoles('personal_rh', 'admin')`
  - Transiciona `BORRADOR → AUTORIZADA`, registra `autorizado_por`

## 6. Backend — Configuración de Deducciones

- [ ] 6.1 Implementar `GET /api/v1/personal/empleados/:id/config-deducciones`:
  - Si no existe `ConfigDeduccionEmpleado`, retornar defaults `{ aplica_imss: true, aplica_isr: true, aplica_infonavit: false }`

- [ ] 6.2 Implementar `PUT /api/v1/personal/empleados/:id/config-deducciones`:
  - Upsert de la configuración
  - Validar: si `aplica_infonavit = true`, requerir `infonavit_num` y `infonavit_monto`

## 7. Backend — Detalle de Pre-Nómina

- [ ] 7.1 Implementar `GET /api/v1/personal/prenominas/:id/detalle`:
  - Retorna `PreNomina` con sus `detalles` incluyendo `Empleado.nombre`, desglose completo (salario_base, horas_extra, imss, isr, infonavit, neto)
  - Útil para el PDF/reporte (etapa futura) y para el frontend

## 8. Frontend — ResidenciaView (Asistencia Real)

- [ ] 8.1 En `ResidenciaView.tsx`, reemplazar el bloque `// TODO: fetch real estimaciones, nómina, asistencia` por llamadas reales:
  - `GET /api/v1/personal/asistencia?fecha_inicio=...&fecha_fin=...` filtrado por la cuadrilla activa

- [ ] 8.2 Implementar el botón "Registrar Asistencia" (o el flujo QR) para llamar a `POST /api/v1/personal/asistencia/bulk` con los estados de la cuadrilla.

- [ ] 8.3 En el modal QR existente, agregar opción de "Marcar asistencia manual" para cuando no hay dispositivo con cámara: tabla de empleados de la cuadrilla con checkboxes PRESENTE/AUSENTE y campo de horas extra.

## 9. Frontend — PersonalView (Nómina Expandida)

- [ ] 9.1 En la sección `prenomina` de PersonalView, al hacer clic en una pre-nómina mostrar el detalle por empleado: tabla con nombre, días trabajados, salario base, horas extra, IMSS, ISR, INFONAVIT, neto. Usar `GET /prenominas/:id/detalle`.

- [ ] 9.2 Mostrar badge `REQUIERE RECÁLCULO` (amber) en pre-nóminas con `requiere_recalculo = true`.

- [ ] 9.3 Agregar panel **Complemento Salarial** en PersonalView (solo visible cuando existe `NominaComplementaria` vinculada a la pre-nómina activa):
  - Lista de empleados con su `monto_complemento`
  - Total del complemento
  - Botón "Autorizar" (si estado es BORRADOR)
  - Botón "Generar Complemento" (llama a `POST /complementos/calcular`)

- [ ] 9.4 Agregar panel de configuración de deducciones por empleado en la ficha del empleado (dentro del tab `empleados`): toggles para IMSS, ISR, INFONAVIT + campos INFONAVIT.

## 10. Deploy a VPS

- [ ] 10.1 Aplicar migración: `docker compose exec personal npx prisma migrate deploy`
- [ ] 10.2 Verificar que el SQL incluye las 4 tablas nuevas y el UPDATE de `requiere_recalculo`.
- [ ] 10.3 Build y redeploy de `personal`: `docker compose build --no-cache personal && docker compose up -d personal`
- [ ] 10.4 Build y redeploy de `app-shell` (cambios en ResidenciaView y PersonalView).
- [ ] 10.5 Verificar en producción:
  - Registrar asistencia manual para una cuadrilla de prueba (3 empleados, 5 días)
  - Calcular pre-nómina y confirmar que los montos IMSS/ISR son correctos según tablas SAT
  - Generar Complemento Salarial para empleados con `salario_acordado > salario_integrado`
  - Verificar que pre-nóminas históricas muestran badge "Requiere Recálculo"
