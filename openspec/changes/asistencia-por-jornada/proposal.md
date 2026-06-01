## Why

El sistema de asistencia actual solo registra PRESENTE/AUSENTE con horas extra capturadas manualmente, lo que impide calcular nómina correctamente para trabajadores pagados por hora. Con el módulo Personal ya operativo, es el momento de conectar la ficha del empleado con el control de asistencia real para que el motor de nómina opere con datos precisos y verificables.

## What Changes

- **Nuevo campo en `Empleado`**: `modo_asistencia` (`JORNADA_COMPLETA` | `POR_HORAS`), `hora_entrada_programada`, `hora_salida_programada`, `horas_jornada` y `tipo_jornada` — configurables por RH en la ficha del empleado.
- **Nuevos campos en `RegistroAsistencia`**: `hora_entrada`, `hora_salida`, `horas_trabajadas`, `horas_normales`, `horas_extra_dia` — los tres últimos calculados automáticamente para empleados `POR_HORAS`.
- **UI PersonalView**: Sección de jornada en la ficha del empleado con los campos mencionados; se muestra condicionalmente cuando `modo_asistencia = POR_HORAS`.
- **UI ResidenciaView**: Captura de asistencia diferenciada por modo: toggle PRESENTE/AUSENTE para `JORNADA_COMPLETA`; campos de hora entrada/salida para `POR_HORAS`. El modal de registro manual muestra la UI correcta según el modo de cada empleado.
- **QR doble-scan**: El mismo QR por cuadrilla distingue primer y segundo escaneo del día; primer scan → `hora_entrada`, segundo scan → `hora_salida`.
- **Motor de nómina** — modificado para usar horas reales en empleados `POR_HORAS` y mantener cálculo por días para `JORNADA_COMPLETA`.
- **Acumulador semanal de HE**: El motor suma horas extra de todos los días del período; primeras 9h/semana → 200% (doble), adicionales → 300% (triple), conforme LFT Art. 66-68.

## Capabilities

### New Capabilities

- `config-jornada-empleado`: Configuración de modo y horario de jornada en la ficha del empleado (RH); determina cómo se captura y calcula la asistencia de ese trabajador.
- `registro-asistencia-por-horas`: Captura de hora de entrada y hora de salida por empleado y día; cálculo automático de horas trabajadas, horas normales y horas extra del día.
- `qr-doble-scan`: Flujo de un solo QR por cuadrilla que distingue entrada (primer scan del día) y salida (segundo scan); fallback a captura manual de hora.
- `calculo-nomina-por-horas`: Motor de nómina para empleados `POR_HORAS`: base calculada con horas normales × tarifa horaria, más horas extra con acumulador semanal DOBLE/TRIPLE según LFT.

### Modified Capabilities

- `calculo-nomina-calculo` → no aplica como spec existente; el motor de nómina fue implementado como código (no tiene spec en `openspec/specs/`). El diseño cubre los cambios.

## Impact

- **Schema Prisma** (`apps/personal/prisma/schema.prisma`): 5 campos nuevos en `Empleado`, 5 campos nuevos en `RegistroAsistencia`. Migración nueva.
- **Backend** (`apps/personal/src/main.ts`): Endpoints de asistencia modificados; motor de nómina `POST /prenominas/calcular` modificado.
- **Frontend** (`apps/app-shell/src/views/PersonalView.tsx`): Sección de jornada en ficha de empleado.
- **Frontend** (`apps/app-shell/src/views/ResidenciaView.tsx`): UI de asistencia diferenciada por modo, QR doble-scan.
- **Sin cambios en**: finanzas, compras, auth, otros módulos.
