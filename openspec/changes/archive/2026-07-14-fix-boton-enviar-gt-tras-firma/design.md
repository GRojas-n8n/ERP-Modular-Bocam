## Context

Ciclo de vida real (confirmado en `apps/compras/src/main.ts`) de `CuadroComparativo.estado`:

```
BORRADOR
  → (enviar-evaluacion, Compras)      EN_EVALUACION_TECNICA
  → (firmar, Residente)               FIRMADO_BLOQUEADO
  → (enviar-gt, Residente/Compras)    EN_APROBACION_GT
  → (revisar-gt, Gerente Técnico)     APROBADO_GT | RECHAZADO_GT
```

`EVALUADO_TECNICAMENTE` y `LOCKED` no aparecen como valor asignado en ningún `data: {
estado: ... }` de `main.ts` — son remanentes de un diseño anterior (probablemente cuando
se planeó un paso intermedio "evaluado, sin firmar" que terminó fusionándose con la firma
misma) que quedaron en la condición del botón del frontend sin actualizarse cuando el
flujo real de firma se implementó.

## Goals / Non-Goals

**Goals:**
- Que el botón "Enviar al Gerente Técnico →" aparezca para cualquier cuadro realmente
  `FIRMADO_BLOQUEADO`, para los 3 roles ya autorizados (Residente, Compras,
  Superintendent).

**Non-Goals:**
- No se limpian los estados muertos `EVALUADO_TECNICAMENTE`/`LOCKED` del enum de estados
  ni de otras condiciones que los referencian (`isLocked`, `showNuevaRevisionBtn`) — fuera
  de alcance de este fix puntual; limpiarlos requeriría auditar todo el enum y confirmar
  que ninguna migración de datos legacy los usa, lo cual excede un bug-fix de una línea.
- No se agrega ninguna automatización (que el envío a GT ocurra solo al firmar) — el
  usuario no la pidió y cambiaría el flujo de aprobación en dos pasos manuales
  intencional (firma ≠ envío, permite a Compras revisar antes de remitir).

## Decisions

- **Agregar `'FIRMADO_BLOQUEADO'` a la condición existente, no reemplazar los otros dos
  valores**: mantiene compatibilidad hacia atrás por si algún cuadro legacy (de antes de
  esta investigación) tuviera alguno de esos estados por alguna vía no identificada —
  costo cero de mantenerlos, riesgo cero de agregarlos.

## Risks / Trade-offs

- **[Riesgo] Ninguno identificado** — es un cambio estrictamente aditivo a una condición
  booleana; no puede regresar comportamiento existente, solo habilitar el caso que
  faltaba.

## Migration Plan

1. Test Playwright E2E que reproduce el bug: Compras cotiza y envía a evaluación,
   Residente evalúa todos los renglones C, selecciona primera opción, firma → verificar
   que el botón "Enviar al Gerente Técnico →" es visible. Correr contra el código actual
   y confirmar que FALLA (el botón no aparece).
2. Fix de una línea en `ComparativaDetail.tsx`.
3. Test en verde. Continuar el mismo E2E: click en el botón → verificar que el cuadro
   aparece en la bandeja de pendientes del Gerente Técnico.
4. `tsc -b` de `app-shell` limpio.

**Rollback**: revertir el commit — cambio de una condición, sin efectos secundarios.

## Open Questions

(ninguna)
