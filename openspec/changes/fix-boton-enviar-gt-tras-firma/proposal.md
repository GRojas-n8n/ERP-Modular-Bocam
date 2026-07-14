## Why

Reporte del usuario: Residente crea requisición → Compras crea Cuadro Comparativo →
Residente hace la evaluación técnica → el Gerente Técnico quiere hacer la evaluación
económica pero desde su perfil no ve el cuadro liberado por el Residente.

Causa raíz confirmada en código: tras terminar la evaluación técnica, el Residente debe
**firmar** el cuadro (`PATCH /comparativas/:id/firmar`), lo que transiciona
`CuadroComparativo.estado` a `FIRMADO_BLOQUEADO` (`apps/compras/src/main.ts:5265-5273`).
El siguiente paso manual es que alguien (Residente/Compras/Superintendent) presione
**"Enviar al Gerente Técnico →"**, que llama `PATCH /comparativas/:id/enviar-gt` — este
endpoint backend acepta explícitamente `FIRMADO_BLOQUEADO` como estado de origen válido
(`ESTADOS_ENVIABLES = new Set(['EVALUADO_TECNICAMENTE', 'LOCKED', 'FIRMADO_BLOQUEADO'])`,
línea 3607) y su propio mensaje de error dice literalmente *"El cuadro debe estar firmado
(FIRMADO_BLOQUEADO) antes de enviarse al GT"*.

Pero en el **frontend**, `apps/app-shell/src/components/ComparativaDetail.tsx:884`, la
condición que muestra ese botón es:

```ts
const showEnviarGTBtn = (isResident || isProcurement || isSuperint) &&
  (comp.estado === 'EVALUADO_TECNICAMENTE' || comp.estado === 'LOCKED');
```

Ninguno de esos dos valores de `estado` (`EVALUADO_TECNICAMENTE`, `LOCKED`) es asignado
por NINGÚN endpoint del backend — confirmado con `grep` exhaustivo sobre
`apps/compras/src/main.ts`: son estados muertos, nunca alcanzables en producción (solo
aparecen en un fixture de un test unitario aislado). El estado real que alcanza un cuadro
firmado es `FIRMADO_BLOQUEADO`, que la condición del botón **no contempla**.

Resultado: **el botón "Enviar al Gerente Técnico →" nunca se muestra tras una firma real**,
así que ningún cuadro puede transicionar a `EN_APROBACION_GT` por el camino normal — el
Gerente Técnico jamás ve nada en su bandeja de pendientes, para ningún cuadro, siempre.

## What Changes

- `ComparativaDetail.tsx`: corregir `showEnviarGTBtn` para incluir `'FIRMADO_BLOQUEADO'`
  (el estado real que alcanza un cuadro firmado), manteniendo `'EVALUADO_TECNICAMENTE'` y
  `'LOCKED'` por compatibilidad con datos legacy si alguna vez existieron (no se remueven,
  solo se agrega el caso real que faltaba).
- Sin cambios de backend: el endpoint `enviar-gt` ya acepta `FIRMADO_BLOQUEADO` — el
  contrato ya era correcto, solo el frontend no lo exponía.
- Test que reproduce el bug primero (Playwright E2E: firmar un cuadro real y verificar que
  el botón aparece) — hoy fallaría, tras el fix pasa.

## Capabilities

### Modified Capabilities
- `seleccion-proveedor-recomendado-firma`: tras una firma exitosa, el cuadro queda
  correctamente disponible para el siguiente paso del flujo (envío al Gerente Técnico).

## Impact

- **Frontend**: `apps/app-shell/src/components/ComparativaDetail.tsx` — una condición,
  una línea.
- **Sin impacto de backend/BD** — el endpoint ya soportaba el estado correcto.
- **Impacto en producción**: este bug bloquea el 100% de los cuadros firmados desde que
  el flujo de firma existe — ningún Gerente Técnico ha podido recibir cuadros por el
  camino normal hasta ahora. Prioridad alta.
