## 1. Prisma Schema — 3 tablas

- [x] 1.1 Crear `apps/control-proyectos/prisma/schema.prisma` con modelos `ProgramacionObra`, `AlertaProyecto`, `ProyeccionCierre`
- [x] 1.2 Crear SQL directo para VPS (`apps/control-proyectos/prisma/create_control_proyectos_tables.sql`)
- [x] 1.3 Ejecutar `prisma generate` localmente para regenerar el cliente Prisma

## 2. Scaffold del microservicio

- [x] 2.1 Crear `apps/control-proyectos/package.json` (nombre `@bocam/control-proyectos`, puerto 3013)
- [x] 2.2 Crear `apps/control-proyectos/tsconfig.json` (mismo patrón que almacén)
- [x] 2.3 Crear `apps/control-proyectos/src/db.ts` (patrón `createTenantContext`)

## 3. Backend — endpoints API

- [x] 3.1 `GET /api/v1/control-proyectos/dashboard` — panel ejecutivo con EVM global, alertas, fechas
- [x] 3.2 `GET /api/v1/control-proyectos/evm` — EVM por partida + global desde último snapshot
- [x] 3.3 `GET /api/v1/control-proyectos/curva-s` — periodos PV acumulado; retorna SIN_PROGRAMACION si no hay datos
- [x] 3.4 `GET /api/v1/control-proyectos/proyeccion-flujo` — egresos/ingresos proyectados mes a mes
- [x] 3.5 `GET /api/v1/control-proyectos/programacion` — lista Gantt por proyecto
- [x] 3.6 `POST /api/v1/control-proyectos/programacion` — carga/actualiza programación (upsert por concepto_id); valida curva termina en 100%
- [x] 3.7 `GET /api/v1/control-proyectos/alertas` — lista con filtros ?estado= y ?severidad=
- [x] 3.8 `PATCH /api/v1/control-proyectos/alertas/:id/reconocer` — estado RECONOCIDA + nota_cp
- [x] 3.9 `PATCH /api/v1/control-proyectos/alertas/:id/ignorar` — estado IGNORADA + nota_cp (≥20 chars)
- [x] 3.10 `GET /health`

## 4. Motor de alertas y job batch

- [x] 4.1 Función `upsertAlerta` — crea o actualiza alerta de mismo tipo+concepto (idempotente)
- [x] 4.2 Función `resolverAlertaSiExiste` — auto-resuelve alertas cuando la condición desaparece
- [x] 4.3 Función `calcularAlertas(tenantId, proyectoId)` — SOBRE_COSTO_PROYECTADO + RETRASO_CRITICO
- [x] 4.4 Job nocturno cada 24h — recalcula alertas para todos los proyectos activos

## 5. Suscriptores de eventos

- [x] 5.1 `control_obra.avance_fisico_validado` → actualiza ProgramacionObra.pct_avance_real + EVM + calcularAlertas
- [x] 5.2 `gerencia_tecnica.partida_bloqueada` → crea AlertaProyecto tipo PARTIDA_BLOQUEADA
- [x] 5.3 `gerencia_tecnica.transferencia_partida_aprobada` → resuelve PARTIDA_BLOQUEADA en destino + calcularAlertas

## 6. Frontend

- [x] 6.1 Crear `apps/app-shell/src/views/ControlProyectosView.tsx` con pestañas: Dashboard / EVM / Curva S / Alertas / Programación
- [x] 6.2 Agregar "Control Proyectos" a sidebar en `Layout.tsx` (roles: control_proyectos, director)
- [x] 6.3 Agregar case `'control-proyectos'` en `App.tsx` switch de vistas
- [x] 6.4 Agregar proxy `/api/v1/control-proyectos` en `vite.config.ts` (→ localhost:3013)

## 7. Infraestructura

- [x] 7.1 Agregar service `control-proyectos` en `docker-compose.vps.yml` (puerto 3013, profile core)
- [x] 7.2 Agregar proxy nginx `/api/v1/control-proyectos` → `http://control-proyectos:3013` en `nginx.conf`
- [x] 7.3 Agregar `control-proyectos` a `depends_on` de `app-shell`

## 8. Tests de integración

- [x] 8.1 Test: dashboard sin programación → sin_programacion=true
- [x] 8.2 Test: cargar programación válida → 201
- [x] 8.3 Test: curva sin 100% → 422
- [x] 8.4 Test: curva-s sin programación → SIN_PROGRAMACION
- [x] 8.5 Test: reconocer alerta → RECONOCIDA
- [x] 8.6 Test: EVM retorna partidas

## 9. Deploy VPS

- [ ] 9.1 Crear base de datos `bocam_control_proyectos` en PostgreSQL del VPS
- [ ] 9.2 Ejecutar `create_control_proyectos_tables.sql` en la DB
- [ ] 9.3 Agregar `CONTROL_PROYECTOS_DATABASE_URL` en variables de entorno del VPS
- [ ] 9.4 `docker compose up -d control-proyectos app-shell` con la nueva imagen
- [ ] 9.5 Smoke test: `GET /health` → `{ status: ok }`
