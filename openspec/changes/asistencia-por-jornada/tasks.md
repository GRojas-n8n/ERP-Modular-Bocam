## 1. Schema Prisma — Empleado (campos de jornada)

- [ ] 1.1 Agregar campo `modo_asistencia String @default("JORNADA_COMPLETA")` en modelo `Empleado` del schema `apps/personal/prisma/schema.prisma`. Valores: `JORNADA_COMPLETA` | `POR_HORAS`.
- [ ] 1.2 Agregar campo `tipo_jornada String @default("DIURNA")` en `Empleado`. Valores: `DIURNA` | `NOCTURNA` | `MIXTA`.
- [ ] 1.3 Agregar campo `hora_entrada_programada String? @db.VarChar(5)` en `Empleado`. Formato `HH:MM`. Nullable; obligatorio solo si `modo_asistencia = POR_HORAS`.
- [ ] 1.4 Agregar campo `hora_salida_programada String? @db.VarChar(5)` en `Empleado`. Formato `HH:MM`. Nullable.
- [ ] 1.5 Agregar campo `horas_jornada Decimal @default(8) @db.Decimal(4,2)` en `Empleado`.

## 2. Schema Prisma — RegistroAsistencia (campos de hora)

- [ ] 2.1 Agregar campo `hora_entrada String? @db.VarChar(5)` en modelo `RegistroAsistencia`. Formato `HH:MM`.
- [ ] 2.2 Agregar campo `hora_salida String? @db.VarChar(5)` en `RegistroAsistencia`.
- [ ] 2.3 Agregar campo `horas_trabajadas Decimal? @db.Decimal(4,2)` en `RegistroAsistencia` (calculado por el backend).
- [ ] 2.4 Agregar campo `horas_normales Decimal? @db.Decimal(4,2)` en `RegistroAsistencia`.
- [ ] 2.5 Agregar campo `horas_extra_dia Decimal? @db.Decimal(4,2)` en `RegistroAsistencia`.
- [ ] 2.6 Agregar campo `origen_horas String @default("REAL")` en `RegistroAsistencia`. Valores: `REAL` | `ESTIMADO`.

## 3. Schema Prisma — PreNominaDetalle (campos de horas)

- [ ] 3.1 Agregar campo `horas_normales Decimal? @db.Decimal(6,2)` en `PreNominaDetalle`.
- [ ] 3.2 Agregar campo `monto_he_doble Decimal @default(0) @db.Decimal(10,2)` en `PreNominaDetalle`.
- [ ] 3.3 Agregar campo `monto_he_triple Decimal @default(0) @db.Decimal(10,2)` en `PreNominaDetalle`.
- [ ] 3.4 Agregar campo `origen_horas String @default("REAL")` en `PreNominaDetalle`. Valores: `REAL` | `ESTIMADO`.
- [ ] 3.5 Ejecutar `npx prisma migrate dev --name asistencia-por-jornada` en el módulo `apps/personal` y verificar que el SQL generado contiene los ALTER TABLE correctos (sin CREATE TABLE, ya que las tablas existen).
- [ ] 3.6 Ejecutar `npx prisma generate` y verificar que los tipos TypeScript nuevos están disponibles.

## 4. Backend — Helper de cálculo de horas

- [ ] 4.1 Crear función `calcularHorasTrabajadas(horaEntrada: string, horaSalida: string): number` en `apps/personal/src/tablas-fiscales.ts`. Maneja turno nocturno (salida < entrada → suma 24h). Retorna horas en decimal (ej. `8.75`).
- [ ] 4.2 Crear función `calcularHorasDesglose(horasTrabajadas: number, horasJornada: number): { horas_normales: number; horas_extra_dia: number }` en `tablas-fiscales.ts`.
- [ ] 4.3 Crear función `calcularMontoHEPorSemana(heAcumSemana: number, tarifaHora: number): { monto_doble: number; monto_triple: number }` en `tablas-fiscales.ts`. Aplica regla 9h/semana: primeras 9h → ×2, adicionales → ×3.

## 5. Backend — Endpoint POST /asistencia/registro (doble-scan)

- [ ] 5.1 Modificar `POST /api/v1/personal/asistencia/registro` en `main.ts`:
  - Si el empleado tiene `modo_asistencia = POR_HORAS` y se recibe `tipo_scan = 'AUTO'` o `'ENTRADA'`:
    - Si no existe registro para (empleado_id, fecha) → crear con `hora_entrada = hora_actual`, `estado = PRESENTE`.
    - Si existe con `hora_entrada` sin `hora_salida` y `tipo_scan = 'AUTO'` → registrar salida (ver 5.2).
    - Si existe con ambas horas → retornar registro actual sin modificar (idempotente).
  - Si `modo_asistencia = JORNADA_COMPLETA` → mantener comportamiento actual (upsert estado).
- [ ] 5.2 Al registrar `hora_salida` (entrada ya existente):
  - Llamar a `calcularHorasTrabajadas(hora_entrada, hora_salida)`.
  - Llamar a `calcularHorasDesglose(horas_trabajadas, empleado.horas_jornada)`.
  - Actualizar registro con `hora_salida`, `horas_trabajadas`, `horas_normales`, `horas_extra_dia`, `origen_horas = 'REAL'`.
- [ ] 5.3 Agregar campo `tipo_scan` al body de `POST /asistencia/registro`. Valores: `'AUTO'` (default), `'ENTRADA'`, `'SALIDA'`. Validar que `tipo_scan = 'SALIDA'` solo aplica cuando existe `hora_entrada`.

## 6. Backend — Endpoint POST /asistencia/bulk (modo mixto)

- [ ] 6.1 Modificar `POST /api/v1/personal/asistencia/bulk` para aceptar por cada registro: `{ empleado_id, estado?, hora_entrada?, hora_salida?, horas_extra? }`.
- [ ] 6.2 Para cada registro del bulk: si el empleado tiene `modo_asistencia = POR_HORAS` y se proporcionan `hora_entrada` y `hora_salida`, calcular y almacenar `horas_trabajadas`, `horas_normales`, `horas_extra_dia`.
- [ ] 6.3 Para empleados `JORNADA_COMPLETA` en el mismo bulk: mantener comportamiento actual (upsert estado).

## 7. Backend — Endpoint PATCH /asistencia/:id (corrección)

- [ ] 7.1 Modificar `PATCH /api/v1/personal/asistencia/:id` para aceptar `hora_entrada`, `hora_salida` en el body.
- [ ] 7.2 Si se actualiza `hora_entrada` o `hora_salida` y ambas están presentes → recalcular `horas_trabajadas`, `horas_normales`, `horas_extra_dia` automáticamente.

## 8. Backend — Endpoint PATCH /empleados/:id (campos de jornada)

- [ ] 8.1 Modificar `PATCH /api/v1/personal/empleados/:id` para aceptar `modo_asistencia`, `tipo_jornada`, `hora_entrada_programada`, `hora_salida_programada`, `horas_jornada`.
- [ ] 8.2 Validar: si `modo_asistencia = 'POR_HORAS'`, requerir `hora_entrada_programada` y `hora_salida_programada`. Retornar `400` si faltan.
- [ ] 8.3 Validar: `horas_jornada` entre 1 y 24. Retornar `400` si fuera de rango.

## 9. Backend — Motor de nómina (empleados POR_HORAS)

- [ ] 9.1 En `POST /prenominas/calcular`, después de obtener resumen de asistencia, detectar `modo_asistencia` de cada empleado.
- [ ] 9.2 Para empleados `JORNADA_COMPLETA`: mantener lógica actual (`dias_trabajados × salario_diario`).
- [ ] 9.3 Para empleados `POR_HORAS`:
  - Calcular `tarifa_hora = salario_diario / horas_jornada`.
  - Sumar `horas_normales` de todos los registros del período → `total_horas_normales`.
  - `salario_base = total_horas_normales × tarifa_hora`.
- [ ] 9.4 Implementar acumulador semanal de HE para empleados `POR_HORAS`:
  - Agrupar `RegistroAsistencia` del período por semana natural (lunes–domingo).
  - Por cada semana: sumar `horas_extra_dia` → `he_semana`.
  - Llamar a `calcularMontoHEPorSemana(he_semana, tarifa_hora)` → `{ monto_doble, monto_triple }`.
  - Sumar montos de todas las semanas → `monto_he_total`.
- [ ] 9.5 Para registros sin `hora_salida` (origen ESTIMADO): usar `horas_jornada` como `horas_normales` y `0` como `horas_extra_dia`. Marcar `origen_horas = 'ESTIMADO'` en el `PreNominaDetalle`.
- [ ] 9.6 Crear `PreNominaDetalle` con los campos nuevos: `horas_normales`, `monto_he_doble`, `monto_he_triple`, `origen_horas`.

## 10. Backend — GET /prenominas/:id/detalle (campos nuevos)

- [ ] 10.1 Modificar `GET /prenominas/:id/detalle` para incluir `horas_normales`, `monto_he_doble`, `monto_he_triple`, `origen_horas` en cada detalle serializado.

## 11. Backend — GET /asistencia (campos nuevos)

- [ ] 11.1 Modificar `GET /asistencia` para incluir `hora_entrada`, `hora_salida`, `horas_trabajadas`, `horas_extra_dia`, `origen_horas` en la respuesta enriquecida.

## 12. Frontend — PersonalView (ficha de empleado)

- [ ] 12.1 Añadir interfaz `ConfigJornada` en `PersonalView.tsx` con los campos: `modo_asistencia`, `tipo_jornada`, `hora_entrada_programada`, `hora_salida_programada`, `horas_jornada`.
- [ ] 12.2 Agregar estado y handler `handleAbrirConfigJornada(empleado)` que carga los valores actuales del empleado.
- [ ] 12.3 Agregar SlidePanel "Jornada" (accentColor `violet`) con:
  - Select `modo_asistencia`: JORNADA COMPLETA / POR HORAS.
  - Select `tipo_jornada`: DIURNA / NOCTURNA / MIXTA (visible siempre).
  - Input `hora_entrada_programada` (type time), `hora_salida_programada` (type time), Input `horas_jornada` (number) — visibles solo si `modo_asistencia = POR_HORAS`.
- [ ] 12.4 Agregar botón "Jornada" en la columna de acciones de la tabla de empleados (junto al botón "Deducciones").
- [ ] 12.5 Implementar `handleSaveConfigJornada` que llama a `PATCH /api/v1/personal/empleados/:id`.

## 13. Frontend — ResidenciaView (asistencia por horas)

- [ ] 13.1 Actualizar interfaz `RegistroAsistencia` en `ResidenciaView.tsx` para incluir: `hora_entrada: string | null`, `hora_salida: string | null`, `horas_trabajadas: number | null`, `horas_extra_dia: number | null`, `origen_horas: string`.
- [ ] 13.2 En la tabla de asistencia (tab `asistencia`), mostrar `hora_entrada ?? '—'` y `hora_salida ?? '—'` con badge "Sin salida" (ámbar) si `hora_entrada` existe y `hora_salida` es null pasada la `hora_salida_programada`.
- [ ] 13.3 En el tab "Registro Manual" del modal QR, actualizar el renderizado por fila:
  - Si `modo_asistencia = JORNADA_COMPLETA`: mantener toggle PRESENTE/AUSENTE.
  - Si `modo_asistencia = POR_HORAS`: mostrar dos inputs de tipo `time` (entrada y salida) en lugar del toggle.
- [ ] 13.4 Actualizar `handleGuardarBulk` para enviar `hora_entrada` y `hora_salida` en los registros de empleados `POR_HORAS` en lugar de `estado`.
- [ ] 13.5 Enriquecer el endpoint `GET /asistencia` llamada para incluir `modo_asistencia` en la respuesta, o fetcher separado de empleados de cuadrilla para conocer el modo. Usar el campo para renderizar la UI correcta.
- [ ] 13.6 Actualizar `CuadrillaReal` interface para incluir `modo_asistencia` en cada miembro de `miembros[]`.

## 14. Frontend — PersonalView (modal detalle de prenomina)

- [ ] 14.1 En el modal de desglose de pre-nómina, mostrar columnas adicionales para empleados `POR_HORAS`: `Horas Norm.`, `HE Doble`, `HE Triple`.
- [ ] 14.2 Mostrar badge `ESTIMADO` (ámbar) en la columna de origen para filas con `origen_horas = 'ESTIMADO'`.

## 15. Deploy

- [ ] 15.1 Aplicar migración en VPS: `docker exec bocam-vps-personal sh -c "cd /workspace && npx prisma db push --schema apps/personal/prisma/schema.prisma"` (schema incremental, todos los campos nuevos son nullable o con default).
- [ ] 15.2 Build y redeploy del módulo personal: `docker compose -f docker-compose.vps.yml build --no-cache personal && docker compose -f docker-compose.vps.yml up -d --no-deps personal`.
- [ ] 15.3 Build y redeploy de app-shell: `docker compose -f docker-compose.vps.yml build --no-cache app-shell && docker compose -f docker-compose.vps.yml up -d --no-deps app-shell`.
- [ ] 15.4 Verificar en producción:
  - Crear empleado de prueba con `modo_asistencia = POR_HORAS`, horario 07:00–15:00.
  - Registrar entrada y salida manual desde ResidenciaView.
  - Confirmar que `horas_trabajadas`, `horas_normales` y `horas_extra_dia` se calculan correctamente.
  - Calcular pre-nómina del período y verificar que el desglose DOBLE/TRIPLE es correcto.
  - Confirmar que empleados existentes `JORNADA_COMPLETA` no se ven afectados.
