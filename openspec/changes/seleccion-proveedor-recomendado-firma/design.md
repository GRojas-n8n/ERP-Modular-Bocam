## Context

Investigado antes de diseñar: `primera_opcion_proveedor_id` y
`segunda_opcion_proveedor_id` ya existen en `CuadroComparativo`
(`schema.prisma:282-283`), ya se guardan juntos vía `PUT
/api/v1/compras/comparativas/:id/seleccion` (`main.ts:4574-4631`), y ya
tienen su UI (`ComparativaDetail.tsx:1418-1464`, dos `<select>` + botón
"Guardar selección"). Nada de esto es nuevo — este change agrega la validación
de negocio que falta y reordena la UI.

## Goals / Non-Goals

**Goals:**
- La 2ª opción queda sujeta a las mismas reglas de integridad que la 1ª
  (pertenencia al cuadro, sin NC/?).
- La selección de proveedor, el veredicto y el botón de firma quedan en un
  solo flujo visual, en ese orden.
- El botón de firma no se habilita si falta la selección — el error se
  adelanta a la UI en vez de aparecer como 400 al hacer clic.

**Non-Goals:**
- No se toca `proveedores_sugeridos` (el multi-select de chips) — es
  conceptualmente distinto (recomendación libre del veredicto) y ya funciona.
- No se agregan campos nuevos al schema.

## Decisions

**1. La validación de 2ª opción es opcional-si-presente, no la vuelve
obligatoria.** El campo sigue siendo opcional (el Residente puede no tener
una segunda opción viable). Cuando SÍ se envía, se valida con las mismas
reglas que la primera — pertenencia al cuadro en `/seleccion`, sin NC/? en
`/firmar`. Si no se envía, no bloquea nada (igual que hoy).

**2. Error distinto para la 2ª opción con NC/?.** `SEGUNDA_OPCION_INVALIDA_NC`
(paralelo a `SELECCION_INVALIDA_NC` de la primera), para que el mensaje sea
específico sobre cuál selección falló.

**3. Reposición de UI: fusionar, no solo mover.** El bloque "Recomendación
del Residente" (1418-1464) se elimina de su ubicación actual y sus dos
`<select>` pasan a ser las primeras dos secciones dentro del bloque
"Veredicto del Residente" (2138-2188), antes del textarea de veredicto —
mismo layout de campos que ya existe, solo reubicado. El botón "Guardar
selección" se mantiene como acción independiente dentro de ese mismo bloque
(la selección de proveedor y el veredicto siguen siendo guardados por
llamadas separadas al backend — `/seleccion` y `/veredicto` — no se
fusionan esos dos endpoints).

**4. `showFirmaBtn` gana la condición que le faltaba.**
```ts
const veredictoListo = veredicto.trim().length > 0 && provSugeridos.length > 0
  && !!comp.primera_opcion_proveedor_id; // nueva condición
```
Con esto, si falta guardar la selección, el botón de firma permanece
deshabilitado con el mismo texto de ayuda ya existente
(línea 2182-2184), en vez de permitir el clic y recibir un 400 del backend.

## Risks / Trade-offs

- **[Riesgo] Un cuadro ya en curso con `segunda_opcion_proveedor_id` guardado
  que hoy NO cumpliría la nueva validación** (por ejemplo, un proveedor con
  NC ya seleccionado como 2ª opción antes de este change). → Mitigación: la
  validación nueva solo se evalúa en el momento de `/firmar` y de guardar una
  nueva `/seleccion` — un cuadro con datos "inválidos" preexistentes que
  todavía no llegó a `firmar` simplemente pedirá corregir la selección en
  ese momento; no hay ninguna migración de datos necesaria (0 evaluaciones
  reales en producción, mismo hallazgo que en `evaluacion-tecnica-por-especificacion`).

## Migration Plan

- Sin migración de schema. Deploy: rebuild `apps/compras` + `apps/app-shell`.

## Open Questions

(ninguna — alcance acotado, sin decisiones pendientes)
