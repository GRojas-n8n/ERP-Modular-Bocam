# Design: control-proyectos-modulo

## D1: Puerto 3013 (no 3011)

El spec original dice puerto 3011, pero ese puerto está ocupado por el microservicio `asistente`. Se usa 3013.

## D2: Event-sourcing sobre RabbitMQ

CP nunca llama a otros microservicios en tiempo real. Construye todas sus métricas a partir de eventos RabbitMQ:
- `control_obra.avance_fisico_validado` → actualiza `ProgramacionObra.pct_avance_real` + recalcula EVM.
- `gerencia_tecnica.partida_bloqueada` → crea `AlertaProyecto` tipo PARTIDA_BLOQUEADA.
- `gerencia_tecnica.transferencia_partida_aprobada` → resuelve alerta de bloqueo en destino + recalcula alertas.

## D3: Base de datos propia

Schema `bocam_control_proyectos` (DB separada). Tres tablas:
- `programacion_obra` — Gantt simplificado por partida.
- `alertas_proyecto` — Alertas generadas automáticamente.
- `proyecciones_cierre` — Snapshots EVM diarios.

Deploy VPS via SQL directo (`create_control_proyectos_tables.sql`) — igual que almacén y transferencia-entre-partidas para evitar conflicto con `prisma db push`.

## D4: Motor de alertas dual

Las alertas se calculan en dos momentos:
1. Inmediatamente al recibir eventos relevantes (tiempo real).
2. Cada 24h en job batch (para detectar condiciones que no son evento-driven: material inmovilizado, brecha físico-económico, etc.).

La función `calcularAlertas(tenantId, proyectoId)` es idempotente: hace upsert si ya existe una alerta del mismo tipo+concepto, y la resuelve si la condición desapareció.

## D5: Frontend tabs-only

La vista `ControlProyectosView.tsx` tiene 5 pestañas: Dashboard, EVM, Curva S, Alertas, Programación.
No hay modales de ingreso manual de programación desde la UI en esta iteración — el CP carga programación via API directamente.

## D6: Roles

- `control_proyectos`, `director`, `admin` → acceso total.
- Sidebar visible para estos roles.
- Endpoints de escritura (reconocer/ignorar alertas, cargar programación) requieren `requireRoles`.
