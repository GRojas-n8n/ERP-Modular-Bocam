## Context

`POST /avances` (`apps/control-proyectos/src/main.ts:631-699`) calcula y persiste `cantidad_acumulada` y `importe_acumulado` sin ningún tope (solo el `porcentaje_avance` mostrado se recorta a 100 con `Math.min`, línea 688 — el dato real guardado no se recorta). `calcularAlertas` (línea 393-436) itera `ProgramacionObra` por proyecto y hoy solo evalúa dos condiciones (`cpi < 0.9` → `SOBRE_COSTO_PROYECTADO`, `spi < 0.8` → `RETRASO_CRITICO`), usando el helper `upsertAlerta`/`resolverAlertaSiExiste` (línea 386-391) que ya soporta cualquier `tipo` de alerta sin cambios adicionales — agregar un tipo nuevo es extender esta misma función, no construir un motor nuevo.

## Goals / Non-Goals

**Goals:**
- Cuando el volumen físico acumulado de un concepto supera el volumen contratado (presupuestado), el sistema genera una alerta visible en el dashboard de Control de Proyectos (`AlertaProyecto` tipo `VOLUMEN_EXCEDIDO`), igual que ya hace con sobrecosto y retraso.
- Quien registra el avance que causa el excedente recibe una advertencia inmediata en la respuesta del `POST`, sin que eso le impida registrar el avance.

**Non-Goals:**
- **No se bloquea `POST /avances`.** Ver Decisions 1. Esto es un desvío consciente de la frase de venta original ("bloqueando la fuga de capital"); el spec `control-proyectos-modulo` ya documenta que CP no es un gate, y los gates de negocio reales (tope de partida por monto) ya existen en GT vía `SaldoPartida`/`estado_tope` (`openspec/specs/presupuesto-tope-partida/spec.md`) — ese es el mecanismo de bloqueo del sistema, no el registro de avance físico.
- No se agrega un mecanismo de "orden de cambio"/extra de obra formal para justificar el excedente — el negocio no ha definido ese flujo; este change solo hace visible el excedente, no gestiona su resolución administrativa.
- No se aplica tolerancia/margen antes de alertar (ej. no ignorar excesos menores al 2%). Cualquier `cantidad_acumulada > cantidad_presupuestada` genera la alerta — exceder lo contratado sin una revisión de presupuesto ya es, por definición, la condición que se quiere detectar (scope creep), no un umbral arbitrario.

## Decisions

**1. Alerta, no bloqueo — se respeta la regla de diseño ya documentada del módulo, en vez de la redacción de venta.**
`openspec/specs/control-proyectos-modulo/spec.md:360` ya establece: "CP no bloquea operaciones — no es un gate. Los gates están en GT (tope de partida) y Finanzas (suficiencia presupuestal). CP solo informa y alerta." Alternativa considerada: rechazar `POST /avances` con 422 cuando el avance dejaría `cantidad_acumulada > cantidad_presupuestada`. Se descarta porque (a) contradice una decisión de arquitectura ya tomada y documentada en el spec del módulo, no relacionada con este change; (b) el avance físico es un hecho ya ocurrido en campo — negarse a registrarlo no evita el sobrecosto, solo esconde el dato; el residente terminaría sin forma de reportar la realidad, o inflando otro concepto para evadir el bloqueo, empeorando la trazabilidad que el resto del sistema (EVM, KPIs) necesita.

**2. `VOLUMEN_EXCEDIDO` se evalúa dentro de `calcularAlertas`, comparando el último `AvanceFisico` de cada `concepto_id` contra su `cantidad_presupuestada`, no con un cálculo nuevo separado.**
`AvanceFisico.cantidad_acumulada` y `cantidad_presupuestada` (`apps/control-proyectos/prisma/schema.prisma`) ya traen todo lo necesario por avance; el más reciente de cada `concepto_id` en el proyecto representa el estado acumulado actual. Se reutiliza el mismo bucle por `ProgramacionObra` que ya usa `calcularAlertas`, agregando una consulta del último avance por `concepto_id` (mismo patrón de "traer lo último" ya usado en `resolverConceptoDelCatalogo`/derivación de `cantidad_anterior`).

**3. La advertencia en la respuesta de `POST /avances` es informativa e inmediata; la `AlertaProyecto` persistente es asíncrona (corre en el job nocturno o al validar un avance, como el resto del motor).**
Son dos mecanismos con propósitos distintos: la advertencia en la respuesta le informa a quien captura el dato en el momento (sin bloquear, Decision 1); la `AlertaProyecto` es lo que ve el Director de Proyectos en el dashboard más adelante, y debe poder resolverse automáticamente si el excedente se corrige (ej. se transfiere presupuesto y se amplía la `cantidad_presupuestada` del concepto) — mismo patrón ya usado por `resolverAlertaSiExiste` para las otras 2 alertas implementadas.

**4. `VOLUMEN_EXCEDIDO` es severidad `WARN`, no `CRITICA`.**
A diferencia de `SOBRE_COSTO_PROYECTADO` (que ya implica que el proyecto completo va a costar más de lo presupuestado, un riesgo financiero directo), un volumen excedido en una partida es, por sí solo, información operativa que puede o no tener impacto financiero real (podría estar cubierto por ahorro en otra partida, o ser un excedente menor ya en trámite de ampliación de presupuesto). Se deja como `WARN` para no saturar el nivel `CRITICA` del dashboard con algo que todavía no está confirmado como pérdida.

## Risks / Trade-offs

- **[Riesgo] Sin bloqueo, un excedente de volumen puede acumularse por varios períodos antes de que alguien revise el dashboard.** → Aceptado como trade-off consciente de Decision 1; es el mismo nivel de riesgo que ya existe hoy para `SOBRE_COSTO_PROYECTADO`/`RETRASO_CRITICO`, ninguno de los cuales bloquea tampoco.
- **[Trade-off] Sin tolerancia mínima, un excedente de redondeo de 0.1% ya genera alerta.** → Aceptado (ver Non-Goals) — se puede ajustar con un umbral configurable en un change futuro si en la práctica genera ruido, pero no hay evidencia hoy de que eso ocurra.

## Migration Plan

- No requiere migración de schema (`AlertaProyecto.tipo` es `VARCHAR`, no enum de BD).
- Deploy: un solo servicio (`control-proyectos`).
- Rollback: revertir el commit; no hay estado persistente nuevo que limpiar (las alertas `VOLUMEN_EXCEDIDO` creadas quedan como cualquier otra fila de `AlertaProyecto`, no rompen nada si el código que las genera se revierte).

## Open Questions

Ninguna — la pregunta de diseño principal (¿alerta o bloqueo?) queda resuelta por la regla de arquitectura ya documentada del módulo (Decision 1).
