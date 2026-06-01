# Spec: Complemento Salarial

## CA-1 — Nombre técnico en Iretum
- El sistema usa el nombre **"Complemento Salarial"** (abreviado CS) en toda la UI y API.
- Código de referencia: formato `CS-{AÑO}-{TIPO}{SEQ}` — ej. `CS-2026-S01` (semanal), `CS-2026-Q01` (quincenal).

## CA-2 — Generación desde Pre-Nómina
- `POST /complementos/calcular` requiere `prenomina_id` existente y en estado `CALCULADA` o superior.
- Solo genera detalle para empleados cuyo `salario_acordado > salario_integrado`.
- Si un empleado no tiene `salario_acordado`, se omite (sin error).
- Si ningún empleado califica → `422` con mensaje "Ningún empleado tiene Complemento Salarial configurado".
- Si ya existe un `NominaComplementaria` para esa `prenomina_id` → `409`.

## CA-3 — Cálculo del complemento
- `complemento_dia = salario_acordado - salario_integrado` (ambos por día).
- `monto_complemento = complemento_dia × dias_trabajados` (lee días del `PreNominaDetalle` correspondiente).
- Sin deducciones de ningún tipo (IMSS, ISR, INFONAVIT = $0.00).

## CA-4 — Flujo de estados
- `BORRADOR → AUTORIZADA` via `PATCH /complementos/:id/autorizar` (roles: personal_rh, admin).
- No hay transición a PAGADA en este spec (se añade en iteración futura con integración de finanzas).

## CA-5 — Visibilidad en frontend
- El panel de Complemento Salarial en PersonalView es visible solo cuando existe al menos un `NominaComplementaria` vinculada.
- Muestra: total del complemento, lista de empleados con su monto, estado, botón Autorizar.
- El rol `residencia` NO ve el Complemento Salarial (es información interna de RH).
