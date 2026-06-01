## Context

El módulo Personal ya tiene operativo el motor de nómina (tablas SAT 2025, IMSS, ISR, horas extra manuales). La tabla `registros_asistencia` existe pero no almacena `hora_entrada` / `hora_salida` — campos que aparecen en la interfaz del frontend como `null` siempre. El campo `horas_extra` en el registro es un número capturado a mano sin trazabilidad. RH requiere poder declarar, por cada empleado, si trabaja por jornada completa (pago fijo diario) o por horas (pago proporcional más horas extra reales). Esta distinción afecta el cálculo de pre-nómina.

Estado de código base relevante:
- `apps/personal/prisma/schema.prisma` — modelos `Empleado`, `RegistroAsistencia`
- `apps/personal/src/tablas-fiscales.ts` — `calcularHorasExtra(heTotal, diasPeriodo, salarioDiario)` ya contempla DOBLE/TRIPLE
- `apps/personal/src/main.ts` — `POST /prenominas/calcular` usa `diasTrabajados` y `totalHorasExtra` del resumen de asistencia
- `apps/app-shell/src/views/ResidenciaView.tsx` — modal QR con tabs QR/Manual, ya usa `POST /asistencia/bulk`

## Goals / Non-Goals

**Goals:**
- Permitir que RH configure `modo_asistencia`, horario programado y duración de jornada en cada empleado.
- Capturar `hora_entrada` y `hora_salida` reales para empleados `POR_HORAS`.
- Calcular automáticamente `horas_trabajadas`, `horas_normales` y `horas_extra_dia` al registrar o al cerrar el día.
- Actualizar el motor de nómina para usar horas reales vs. días según el modo del empleado.
- Implementar acumulador semanal de HE para determinar DOBLE vs. TRIPLE conforme LFT Art. 66-68.
- Mantener el flujo actual para empleados `JORNADA_COMPLETA` sin cambios de comportamiento.
- Implementar QR de doble-scan (entrada / salida) en ResidenciaView.

**Non-Goals:**
- Control de asistencia biométrico o GPS.
- Gestión de turnos rotativos ni horarios partidos.
- Cálculo de prima dominical, días festivos, vacaciones o PTU (fuera del alcance de esta iteración).
- Implementación de recesos/breaks dentro de la jornada (la jornada se trata como continua).
- Cambios en módulos distintos a `personal` (backend) y `app-shell` (frontend).

## Decisions

### D1 — Modo de asistencia como campo en `Empleado`, no en `Cuadrilla`

**Decisión:** `modo_asistencia` vive en `Empleado`.

**Alternativa descartada:** en `Cuadrilla` (todos los miembros heredan el modo).

**Razón:** Una cuadrilla de campo puede tener el capataz con contrato `PLANTA` en modo `JORNADA_COMPLETA` y peones eventuales en modo `POR_HORAS`. La granularidad por empleado es necesaria. El overhead de configurarlo por empleado se mitiga con un valor default (`JORNADA_COMPLETA`) que solo se cambia cuando aplica.

---

### D2 — QR de doble-scan: mismo código, lógica de estado

**Decisión:** El QR de cuadrilla es único por día. El backend detecta si ya existe `hora_entrada` sin `hora_salida` para ese empleado/fecha → si no → registra entrada; si sí → registra salida y calcula `horas_trabajadas`.

**Alternativa descartada A:** Dos QR diferentes (entrada en verde, salida en rojo).
- Descartada: duplica la logística en obra (imprimir 2 QR por cuadrilla, riesgo de confusión).

**Alternativa descartada B:** QR con parámetro en URL (`?tipo=entrada`).
- Descartada: el QR actual es decorativo (SVG), no un URL real. Implementar URL QR real requeriría un backend de URL de redirección fuera del alcance.

**Implicación:** El endpoint `POST /asistencia/registro` recibe `tipo_scan: 'AUTO'` y el backend resuelve si es entrada o salida. También acepta `tipo_scan: 'ENTRADA'` o `'SALIDA'` explícitos para el registro manual desde la UI.

---

### D3 — Cálculo de `horas_trabajadas` en el backend, no en el frontend

**Decisión:** El backend calcula `horas_trabajadas = hora_salida − hora_entrada` al recibir la salida.

**Razón:** El frontend puede tener relojes desincronizados o redondeos distintos. El backend es la fuente de verdad. El motor de nómina también lee desde la BD directamente, no desde el frontend.

**Regla:** Si `hora_salida <= hora_entrada` (ej. turno nocturno cruzando medianoche), se añade 24h a `hora_salida` para el cálculo.

---

### D4 — Tarifa horaria derivada del salario diario

**Decisión:** `tarifa_hora = salario_diario / horas_jornada`.

**Alternativa descartada:** campo `salario_hora` separado.
- Descartada: introduce inconsistencia si RH cambia el salario diario sin actualizar la tarifa hora.

**Regla de negocio:**
```
salario_base = horas_normales_periodo × tarifa_hora
monto_he     = calcularHorasExtra(he_acum_semana, dias_periodo, salario_diario)
```
Se mantiene `calcularHorasExtra` existente pasando `he_acum_semana` en lugar de `horas_extra` manual.

---

### D5 — Acumulador semanal de HE en el motor de nómina

**Decisión:** El motor agrupa los `RegistroAsistencia` del período por semana natural (lunes–domingo) y suma `horas_extra_dia` por empleado por semana. Las primeras 9h de HE en cada semana son DOBLE; el exceso es TRIPLE. Al final del período se suma el total ponderado.

**Razón:** La LFT Art. 67 establece el límite en 9h/semana, no en 9h/período. Para períodos quincenales se procesan dos semanas por separado.

**Simplificación aceptada:** Si el período no coincide exactamente con semanas naturales (ej. del miércoles al martes), se toma como una sola semana para el cálculo. Esto es conservador (beneficia al trabajador).

---

### D6 — Empleados `JORNADA_COMPLETA`: sin cambios en el flujo de cálculo

**Decisión:** Si `modo_asistencia = JORNADA_COMPLETA`, el motor de nómina ignora `hora_entrada`/`hora_salida` y usa `dias_presentes × salario_diario` exactamente como hoy. `horas_extra` puede seguir siendo captura manual opcional.

**Razón:** No romper el flujo existente para la mayoría de los empleados actuales.

---

### D7 — Campos de hora: `String` tipo `HH:MM` en Prisma, no `DateTime`

**Decisión:** `hora_entrada` y `hora_salida` se almacenan como `VARCHAR(5)` (`"07:30"`) en lugar de `TIMESTAMPTZ`.

**Razón:** La fecha ya está en `RegistroAsistencia.fecha` (tipo `DATE`). Almacenar solo la hora evita problemas de zona horaria y simplifica el cálculo diferencial (`"15:45" − "07:00" = 8.75h`). El backend convierte a minutos para el cálculo.

**Alternativa descartada:** `TIME` nativo de PostgreSQL.
- `TIME` en Prisma requiere `@db.Time` que no está en la lista de tipos de `schema.prisma` del proyecto; el proyecto usa `@db.VarChar` para horas en otros contextos.

---

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Empleado olvida escanear salida | `hora_salida = null` → motor usa `hora_entrada + horas_jornada` como estimación; marca `origen_horas = 'ESTIMADO'` en el detalle de prenomina |
| Turno nocturno cruzando medianoche | D3: si salida < entrada, sumar 24h al cálculo. Limitación: no contempla guardias de >24h (fuera de scope) |
| Empleados con modo `POR_HORAS` sin `hora_entrada_programada` configurada | Validación en UI y backend: no permitir guardar `modo_asistencia = POR_HORAS` sin `hora_entrada_programada` y `hora_salida_programada` |
| Pre-nóminas históricas con `horas_extra` manual | No migrar. Las prenominas históricas mantienen sus datos. Solo prenominas nuevas usan horas reales. `requiere_recalculo` puede marcarse manualmente si se desea |
| Concurrencia en doble-scan QR | Upsert con `@@unique([tenant_id, empleado_id, fecha])` ya en el schema; el segundo scan actualiza el registro existente si `hora_entrada` ya existe |

## Migration Plan

1. Agregar campos a `Empleado` y `RegistroAsistencia` en `schema.prisma` con valores default.
2. Ejecutar `prisma migrate dev --name asistencia-por-jornada` → genera SQL incremental con `ALTER TABLE`.
3. En VPS: `prisma db push` o `prisma migrate deploy` (según disponibilidad de migration history — ver nota de deploy del change anterior).
4. Todos los empleados existentes quedan con `modo_asistencia = 'JORNADA_COMPLETA'` por default → comportamiento sin cambios.
5. Todos los registros de asistencia existentes quedan con `hora_entrada = null`, `hora_salida = null` → motor los trata como JORNADA_COMPLETA.
6. No hay rollback destructivo: todos los campos nuevos son nullable o tienen default.

**Rollback:** Revertir el deployment de personal y app-shell a la imagen anterior. Los campos extra en la BD no causan errores en la versión anterior (son nuevos, nullable/con default).

## Open Questions

- **OQ-1**: ¿Los peones eventuales sin horario fijo se capturan como `POR_HORAS` con horario estimado (ej. 07:00–15:00) o como `JORNADA_COMPLETA`? → RH decide por empleado; el sistema soporta ambos.
- **OQ-2**: ¿Se necesita tolerancia de puntualidad (grace period)? Por ejemplo, llegar a las 07:10 no descuenta los 10 minutos. → Fuera de scope v1; el sistema registra la hora real y calcula con precisión. Si RH quiere tolerancia, se puede agregar `tolerancia_minutos` en v2.
- **OQ-3**: ¿El Residente puede editar `hora_entrada` o `hora_salida` ya guardadas? → Sí, con rol `residencia` o `personal_rh`; el endpoint `PATCH /asistencia/:id` ya existe y se extiende para incluir los nuevos campos.
