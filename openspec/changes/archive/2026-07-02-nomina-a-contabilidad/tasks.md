# Tasks — nomina-a-contabilidad

## 1. Personal — emitir evento al autorizar

- [x] 1.1 En `apps/personal/src/main.ts` PATCH `/prenominas/:id/autorizar`: publicar `personal.nomina_autorizada` con payload completo (best-effort)
- [x] 1.2 En `apps/personal/src/main.ts` PATCH `/prenominas/:id/pagar`: publicar `personal.nomina_pagada` con mismo payload
- [x] 1.3 Exportar `app`, `initEventBus()`, `shutdownEventBus()` desde `main.ts`; guardar auto-start bajo `if (require.main === module)` — necesario para tests de integración

## 2. Contabilidad — mapper

- [x] 2.1 En `apps/contabilidad/src/mapper.ts`: agregar tipo `'MANO_OBRA'` → `{ cargo: '5100', abono: '2200' }`
- [x] 2.2 En `apps/contabilidad/src/mapper.ts`: agregar tipo `'PAGO_NOMINA'` → `{ cargo: '2200', abono: '1100' }`

## 3. Contabilidad — cuenta 2200

- [x] 3.1 Insertar cuenta `2200 "Nómina por Pagar"` en catálogo (bocam_contabilidad en VPS, ya presente)

## 4. Contabilidad — subscriber

- [x] 4.1 Suscribir `personal.nomina_autorizada` → handler `handleNominaAutorizadaEvent` → crea asiento MANO_OBRA
  - folio: `POL-NOM-{prenomina_id[0:8]}`
  - `external_event_key` para idempotencia
- [x] 4.2 Suscribir `personal.nomina_pagada` → handler `handleNominaPagadaEvent` → crea asiento PAGO_NOMINA
  - folio: `POL-PAG-NOM-{prenomina_id[0:8]}`
- [x] 4.3 Personal DB client lee `PERSONAL_DATABASE_URL || DATABASE_URL` (igual que finanzas)

## 5. Tests

- [x] 5.1 `apps/contabilidad/test/unit/mapper.nomina.test.ts` — 3/3 passing:
  - MANO_OBRA: 5100 cargo / 2200 abono, cuadra
  - PAGO_NOMINA: 2200 cargo / 1100 abono, cuadra
  - Ciclo cierra (2200 pasivo abierto y cerrado)
- [x] 5.2 `apps/contabilidad/test/integration/personal.nomina-a-contabilidad.integration.test.ts` — 4/4 passing ✅ (2026-07-02):
  - PATCH /autorizar → asiento MANO_OBRA creado (event propagado via RabbitMQ)
  - Re-autorizar prenomina AUTORIZADA → 500 (estado inválido); asiento sin duplicar
  - Evento duplicado directo → idempotente (count guard `external_event_key`)
  - PATCH /pagar → asiento PAGO_NOMINA creado

## Notas de implementación

- Todo el código estaba implementado desde `bdaad4d` (2026-06-01 aprox.) antes de que se escribiera el spec formal
- El refactor de `personal/src/main.ts` (export app + require.main guard) fue necesario para testabilidad
- Personal DB client actualizado a `PERSONAL_DATABASE_URL || DATABASE_URL` para consistencia con el patrón del repo
