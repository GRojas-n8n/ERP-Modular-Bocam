# Proposal — Motor de Cálculo de Nómina

## Why

El módulo `personal` tiene los campos correctos en el schema pero el motor de cálculo
está hardcodeado con tasas inventadas (IMSS 2.5% plano, ISR en solo dos tramos: 4% o 9%),
lo que produce nóminas incorrectas e inutilizables en producción real. Adicionalmente:

- La asistencia QR capturada por el Residente no tiene backend real — los registros no se
  persisten y por tanto no alimentan la nómina (el frontend tiene `// TODO: fetch real`).
- No existe el concepto de **Complemento Salarial**: en construcción es práctica estándar
  pagar el salario IMSS (formal) más un complemento acordado sin deducciones. Sin esto, el
  ERP no puede modelar la realidad contractual de la empresa.
- Las deducciones son iguales para todos los empleados sin posibilidad de configuración por
  perfil (ej. empleado con crédito INFONAVIT vs. sin él).

## What Changes

- **NUEVA** tabla `RegistroAsistencia` en `personal` — backend para el QR ya existente en
  ResidenciaView: endpoints para registrar, consultar y resumir asistencia por período.
- **NUEVA** tabla `ConfigDeduccionEmpleado` — qué deducciones aplican a cada empleado
  (IMSS, ISR, INFONAVIT, otras); configurable por RH.
- **NUEVA** tabla `NominaComplementaria` + `NominaComplementariaDetalle` — el "Complemento
  Salarial": nómina sin deducciones para la diferencia entre salario acordado y salario IMSS.
- **MODIFICADO** motor de cálculo en `POST /prenominas/calcular`:
  - Lee días trabajados desde `RegistroAsistencia` (no los asume fijos)
  - IMSS cuota obrera correcta con UMA 2025 y cuatro conceptos
  - ISR con tablas SAT 2025 semanal/quincenal + subsidio al empleo
  - Horas extras conforme a LFT (200% primeras 9h/semana, 300% excedente)
  - Solo aplica a empleados `PLANTA` y `EVENTUAL` (no `SUBCONTRATO`)
- **MODIFICADO** ResidenciaView — pestaña Asistencia conectada al backend real.
- **MODIFICADO** PersonalView — tab pre-nómina muestra desglose por empleado; nuevo panel
  Complemento Salarial.

## Capabilities

### New Capabilities

- `asistencia-qr-backend`: Backend de registro de asistencia diaria por cuadrilla — crear,
  consultar, resumen por período; endpoint QR scan autenticado para dispositivos de obra.
- `motor-imss-isr`: Motor de cálculo conforme a ley: IMSS cuota obrera (4 conceptos, UMA
  2025), ISR tablas SAT 2025 con subsidio al empleo, horas extras LFT, solo aplica a PLANTA
  y EVENTUAL con NSS registrado.
- `complemento-salarial`: Módulo de Complemento Salarial (nombre técnico en Iretum para la
  nómina sin deducciones): creación automática a partir de la diferencia salario_acordado −
  salario_integrado, flujo independiente BORRADOR → AUTORIZADA → PAGADA.
- `config-deducciones-empleado`: Panel en PersonalView para activar/desactivar deducciones
  por empleado (IMSS, ISR, INFONAVIT con número de crédito y monto fijo).

### Modified Capabilities

*(Ninguna spec existente cambia de comportamiento — son capacidades nuevas sobre módulo existente)*

## Impact

- **Backend:** `apps/personal/` — schema Prisma (4 modelos nuevos), ~6 endpoints nuevos,
  motor de cálculo reemplaza la lógica existente en el endpoint calcular.
- **Frontend:** `ResidenciaView.tsx` (asistencia real), `PersonalView.tsx` (prenomina
  desglose + nuevo panel Complemento Salarial).
- **Sin cambios en:** otros módulos, `api.ts`, eventos de bus, infraestructura Docker.
- **Migración de datos:** los `PreNominaDetalle` existentes en producción tienen valores
  calculados con las tasas incorrectas — se marcarán como BORRADOR para recalcular.
