## Why

El sistema se vende afirmando que "genera alertas automáticas cuando un volumen ejecutado supera el volumen contratado, bloqueando la fuga de capital". Hoy no existe ninguna de las dos cosas: `POST /api/v1/control-proyectos/avances` (`apps/control-proyectos/src/main.ts:631-699`) calcula `cantidad_acumulada = cantidad_anterior + cantidad_periodo` y la persiste sin ningún tope — solo el `porcentaje_avance` que se **muestra** se recorta a 100 con `Math.min(porcentaje, 100)` (línea 688), pero la cantidad real guardada puede superar la `cantidad_presupuestada` sin ningún rechazo ni aviso. El motor de alertas (`calcularAlertas`, `apps/control-proyectos/src/main.ts:393-436`) documenta 9 tipos de alerta en el schema (`AlertaProyecto.tipo`, comentario en `prisma/schema.prisma:66-75`, igual que en `openspec/specs/control-proyectos-modulo/spec.md:66-75`) pero solo implementa 2 (`SOBRE_COSTO_PROYECTADO`, `RETRASO_CRITICO`). Ninguno de los 9 tipos documentados corresponde a volumen físico excedido — es un tipo de alerta que ni siquiera está en la lista original, no solo un pendiente de implementar.

## What Changes

- **Backend (`control-proyectos`)**: nuevo tipo de alerta `VOLUMEN_EXCEDIDO` en `AlertaProyecto.tipo`, generado/resuelto por `calcularAlertas` cuando `cantidad_acumulada > cantidad_presupuestada` del último avance de una partida.
- **Backend (`control-proyectos`)**: `POST /avances` deja de responder solo con el avance creado — agrega `advertencia_volumen_excedido: { excedido: boolean, cantidad_excedente, pct_excedido }` en la respuesta cuando el avance recién creado deja `cantidad_acumulada > cantidad_presupuestada`, para dar retroalimentación inmediata a quien lo registra (mismo patrón de `advertencias` ya usado en `apps/compras/src/main.ts` para OC).
- **No se agrega bloqueo (rechazo del `POST /avances`).** El propio spec `control-proyectos-modulo` documenta como regla de diseño explícita que "CP no bloquea operaciones — no es un gate. Los gates están en GT (tope de partida) y Finanzas (suficiencia presupuestal). CP solo informa y alerta" (`openspec/specs/control-proyectos-modulo/spec.md:360`). Bloquear el registro de avance contradiría esa arquitectura ya decidida — un residente que ejecutó de más en campo necesita poder seguir registrando lo que realmente pasó (el dato físico ya ocurrió); lo que hace falta es que quede visible y alertado, no que el sistema se niegue a registrar la realidad. La frase de venta "bloqueando la fuga de capital" no corresponde a este diseño y debería corregirse en el material comercial (fuera del alcance de este change).

## Capabilities

### New Capabilities
(ninguna — se extiende la capability ya documentada de alertas dentro de `control-proyectos-modulo`)

### Modified Capabilities
- `control-proyectos-modulo`: el requirement "Motor de alertas ejecutado periódicamente" gana un tipo de alerta nuevo (`VOLUMEN_EXCEDIDO`) con su condición `WHEN`/`THEN`, y `POST /avances` (documentado hoy en `avances-y-estimaciones`, no en `control-proyectos-modulo`) gana el campo de advertencia inmediata — ver también el delta correspondiente en `avances-y-estimaciones`.

## Impact

- `apps/control-proyectos/prisma/schema.prisma` — comentario de `AlertaProyecto.tipo` documenta el tipo nuevo `VOLUMEN_EXCEDIDO` (es un `VARCHAR`, no un enum de BD — no requiere migración de schema, solo el valor nuevo usado en código).
- `apps/control-proyectos/src/main.ts` — `calcularAlertas` (línea ~393-436): nueva verificación de volumen por partida; `POST /avances` (línea ~631-699): agregar `advertencia_volumen_excedido` a la respuesta.
- `openspec/specs/control-proyectos-modulo/spec.md` y `openspec/specs/avances-y-estimaciones/spec.md` — deltas de requirements.
- Tests nuevos en `apps/control-proyectos`: alerta se crea/resuelve automáticamente, advertencia en la respuesta de `POST /avances`, ausencia de rechazo (el avance se crea igual, con o sin excedente).
- No afecta a `gerencia-tecnica`, `compras` ni `finanzas` — es lógica interna de `control-proyectos` sobre datos que ya tiene (`AvanceFisico.cantidad_acumulada`/`cantidad_presupuestada`).
