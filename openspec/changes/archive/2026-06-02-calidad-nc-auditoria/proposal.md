# Proposal — Calidad: No Conformidades y Auditorías Internas

## Why

El módulo `calidad` implementado en la sesión anterior cubre el pilar 7.5 (Información
Documentada) de ISO 9001:2015. El siguiente pilar más crítico para producción real es el
10.2 (No Conformidades y Acciones Correctivas) y el 9.2 (Auditorías Internas). Sin ellos,
el SGC no puede demostrar mejora continua ante una auditoría externa.

## What Changes

- **NUEVO** módulo de No Conformidades (NC) en `apps/calidad/`: registro, clasificación,
  análisis de causa raíz (5-Por-qués), plan de acción correctiva (AC), seguimiento y cierre.
- **NUEVO** módulo de Auditorías Internas: programa anual, hallazgos, clasificación
  (mayor/menor/observación), acciones derivadas, seguimiento.
- **MODIFICADA** `CalidadView` — nuevos sub-items en sidebar: "No Conformidades" y "Auditorías".
- **MODIFICADO** Dashboard de Calidad — incluye KPIs de NC (abiertas/cerradas/vencidas) y
  auditorías (programadas/completadas).

## Capabilities

### New Capabilities

- `no-conformidades`: Ciclo completo NC: ABIERTA → EN_ANALISIS → ACCION_CORRECTIVA → EN_VERIFICACION → CERRADA. Con clasificación de fuente (interna, cliente, proveedor, auditoría), análisis causa raíz estructurado y plan de acción con responsable y fecha compromiso.
- `auditorias-internas`: Programa de auditorías con alcance y criterios, hallazgos clasificados (MAYOR | MENOR | OBSERVACION), acciones derivadas con seguimiento, cierre de auditoría.

## Impact

- **Backend:** `apps/calidad/` — 4 modelos nuevos, ~8 endpoints nuevos.
- **Frontend:** `CalidadView.tsx` — 2 nuevos sub-items y sus vistas.
- **Sin cambios en:** infraestructura, otros módulos.
