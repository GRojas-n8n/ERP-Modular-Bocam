## Context

`ComparativaLinea` ya tiene `marca_modelo_ref` y `especificaciones_requeridas`
(`apps/compras/prisma/schema.prisma:366-367`), editables por Compras vía el panel de
"Detalles técnicos" ya existente en `ComparativaDetail.tsx` (`PUT
/comparativas/:id/lineas/:insumoId`). El problema es que al crear el cuadro
(`POST /comparativas`, `apps/compras/src/main.ts:2990-3025`) nada popula estos campos desde
lo que el Residente ya capturó en `RequisicionItem.especificacion_marca_modelo` /
`especificacion_detalle` — solo se intenta `especificaciones_requeridas` desde
`EspecificacionDetalleReq`, una tabla estructurada aparte (usada por la evaluación técnica
por especificación) que en la práctica suele estar vacía.

## Goals / Non-Goals

**Goals:**
- Que Compras vea, al crear el cuadro, la marca/modelo y especificación que el Residente ya
  escribió en la requisición, sin tener que volver a capturarlas a mano.
- No romper el mecanismo existente de `EspecificacionDetalleReq` para los ítems que sí lo
  usan (mantiene precedencia).

**Non-Goals:**
- No se resuelve aquí el caso de ítems sin `insumo_id` (texto libre/imprevisto) — sigue sin
  tener línea en el cuadro, es un problema aparte y más grande (ver change relacionado).
- No se cambia el panel de edición manual existente ni su endpoint.

## Decisions

### D1: Poblar en la creación del cuadro, con `EspecificacionDetalleReq` como prioridad

En el bloque que ya recorre `items` para poblar `especificaciones_requeridas`
(`main.ts:3007-3025`):
- `marca_modelo_ref`: siempre `item.especificacion_marca_modelo?.trim() || null` (no hay
  fuente alterna para este campo).
- `especificaciones_requeridas`: `specsTexto` (de `EspecificacionDetalleReq`, como hoy) si
  existe; si no, `item.especificacion_detalle?.trim() || null` como respaldo.

**Alternativa descartada**: concatenar ambas fuentes siempre. Se descarta porque
`EspecificacionDetalleReq` es contenido estructurado pensado para la matriz de evaluación
técnica — mezclarlo con el texto libre de la requisición generaría un bloque de texto
redundante y confuso para Compras/GT.

## Risks / Trade-offs

- **[Riesgo]** Ítems que ya tienen un cuadro creado antes de este fix no se actualizan
  retroactivamente (el `POST /comparativas` es idempotente y devuelve el existente sin
  volver a poblar). **[Mitigación]** Aceptable — Compras puede seguir llenando el campo a
  mano vía el panel existente para cuadros ya creados; no se justifica una migración de
  datos para esto.

## Migration Plan

Sin cambios de schema ni migración de datos. Despliegue normal de backend (`apps/compras`).
