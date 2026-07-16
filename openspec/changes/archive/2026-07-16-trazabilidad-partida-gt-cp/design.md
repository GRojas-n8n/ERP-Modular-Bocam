## Context

`SaldoPartida` (GT) ya lleva totales acumulados por partida
(`monto_comprometido`, `monto_ejercido`, `monto_disponible`, `estado_tope`)
y GT ya escribe un registro de auditoría por cada cambio en
`SaldoMovimiento` (tabla `saldo_movimientos`) dentro de
`POST /partidas/:concepto_id/comprometer`,
`POST /partidas/:concepto_id/ejercer` y
`PATCH /partidas/:concepto_id/anular-bloqueo` — con `referencia_id`
(normalmente el `oc_id`), `referencia_codigo` (ej. "OC-2026-001"), `tipo`,
`campo`, `delta` y `saldo_resultante`. Nada lo expone hoy vía GET.

En Finanzas, `MovimientoPresupuestal` es el equivalente (un registro
inmutable por cada `COMPROMISO`/`EJERCIDO`/`LIBERACION`), y ya tiene
`GET /api/v1/finanzas/movimientos?presupuesto_id=X` funcionando. Como
`PresupuestoAsignado.concepto_id` ahora mapea 1:1 a la partida real de GT
(ver `openspec/changes/archive/2026-07-16-unificar-presupuesto-a-partidas-gt`),
alguien que solo conoce el `concepto_id` (típicamente GT o CP, que no
manejan IDs internos de Finanzas) no puede consultar directamente sin un
paso intermedio.

Existe un endpoint precedente con exactamente el mismo patrón de
drill-down por partida: `GET /partidas/:concepto_id/transferencias`
(`apps/gerencia-tecnica/src/main.ts:2484`), y el guard de roles a replicar
ya está establecido en `GET /partidas/:concepto_id/saldo`
(`requireRoles('admin', 'superintendent', 'gerencia_tecnica',
'control_proyectos', 'control_obra')`).

## Goals / Non-Goals

**Goals:**
- Exponer el audit trail real (`SaldoMovimiento` + `MovimientoPresupuestal`)
  como una lista consultable por partida, sin tocar el gate de bloqueo.
- Dar a Control de Proyectos el mismo nivel de visibilidad que hoy solo
  tiene Gerencia Técnica.
- Reusar componentes/patrones de UI existentes (tabla + fila expandible)
  en vez de construir una pantalla nueva desde cero.

**Non-Goals:**
- No se toca el sistema `CompraProyectada` / `trazabilidad-triangulo`
  existente — sigue funcionando igual, sin relación con este change.
- No se agrega ningún flujo de aprobación, alerta accionable o bloqueo
  nuevo — es estrictamente de solo lectura.
- No se unifica `SaldoMovimiento` (GT) y `MovimientoPresupuestal`
  (Finanzas) en una sola tabla ni se elimina la duplicación entre
  servicios — cada uno sigue siendo dueño de su propio registro, se listan
  por separado en la respuesta (ver Decisión 2).

## Decisions

### Decisión 1: nuevo endpoint en GT, sin cambio de esquema
`GET /api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos` lee
directamente `SaldoMovimiento` filtrado por `saldo_partida_id` (resuelto
desde `concepto_id`), ordenado por `created_at desc`. Mismo guard de roles
que `GET /partidas/:concepto_id/saldo`. No requiere migración — el modelo
y los datos ya existen desde que se implementó el gate de bloqueo.

### Decisión 2: no fusionar GT + Finanzas en una sola llamada
El frontend hace dos llamadas independientes (una a GT, una a Finanzas vía
`GET /movimientos?concepto_id=`) y las combina en la UI, en vez de que GT
agregue una llamada B2B a Finanzas dentro de su propio endpoint. Razón:
mantiene el aislamiento de servicios (regla dura del proyecto — sin
JOINs/agregación cruzada en backend salvo que sea estrictamente necesario)
y evita que este endpoint de solo-auditoría dependa de la disponibilidad
de Finanzas para responder. El endpoint de reporte agregado
(`/reportes/control-presupuestal`) ya hace B2B cuando de verdad se
necesitan totales combinados; aquí no aplica el mismo motivo porque son
dos listas de auditoría independientes, no un total que deba cuadrar.

### Decisión 3: filtro `?concepto_id=` en Finanzas en vez de resolver primero `presupuesto_id`
Se agrega `concepto_id` como filtro alternativo a `presupuesto_id` en
`GET /api/v1/finanzas/movimientos` (resuelve internamente el
`presupuesto_id` activo para ese `concepto_id` antes de filtrar
`movimientos`). Alternativa descartada: forzar al frontend a llamar
primero `GET /presupuestos/por-concepto/:conceptoId` y luego
`/movimientos?presupuesto_id=` — funciona, pero duplica una llamada de red
en cada apertura de drill-down y acopla al frontend a un detalle interno
(el `presupuesto_id`) que no necesita conocer.

### Decisión 4: un solo componente de tabla compartido, reusado por GT y CP
Se extrae la tabla de "Control Presupuestal" (hoy solo en
`InsumosView.tsx`) a un componente reusable con el drill-down incluido, y
se monta tanto en la pestaña existente de GT como en la nueva pestaña de
`ControlObraView.tsx` (rol `control_proyectos`), en modo estrictamente de
lectura en ambos casos (no hay acciones de escritura en ninguna de las dos
pantallas hoy, así que no hay diferencia de permisos que gestionar en el
componente). Alternativa descartada: duplicar el JSX en los dos archivos
— se rechaza porque ya hay precedente de deriva entre vistas duplicadas en
este repo (ver memoria de sesiones previas) y esto es exactamente el tipo
de tabla que se querría mantener idéntica entre GT y CP.

## Risks / Trade-offs

- [Riesgo] Dos llamadas de red por partida al expandir el drill-down (GT +
  Finanzas) → Mitigación: ambas son consultas ligeras filtradas por
  `concepto_id`/`presupuesto_id` con índice existente, se disparan solo al
  expandir (no en la carga inicial de la tabla), y cada una falla de forma
  independiente sin bloquear a la otra (mismo patrón fail-soft que
  `/reportes/control-presupuestal`).
- [Riesgo] Confusión entre esta nueva trazabilidad y la pestaña
  "Trazabilidad" existente (`CompraProyectada`), que sigue viva y muestra
  números potencially distintos para la misma partida → Mitigación:
  nombrar la nueva funcionalidad de forma distinta en la UI (ej.
  "Movimientos" o "Historial de partida" dentro de la tabla de Control
  Presupuestal, no "Trazabilidad") para no sugerir que son la misma fuente
  de datos; documentado explícitamente en el proposal que son sistemas
  separados.
- [Riesgo] `control_proyectos` no tenía antes ningún endpoint GT en su
  lista de roles permitidos salvo `/saldo` → Mitigación: ya existe el
  precedente exacto de ese guard de roles, se reutiliza sin inventar un
  esquema de permisos nuevo.
