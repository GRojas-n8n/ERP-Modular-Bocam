## Why

Hoy existen dos microservicios separados que el negocio y el propio frontend
ya tratan como un solo módulo: `control-obra` (Bitácoras, Avances Físicos,
Estimaciones — puerto 3005) y `control-proyectos` (EVM, Curva S, Alertas
Predictivas — puerto 3013). `apps/app-shell/src/components/Layout.tsx` ya
expone un único ítem de navegación "Control de Obra" cuyos 9 sub-tabs
mezclan datos de ambos backends, y `ControlObraView.tsx` (el único
componente real, 1471 líneas) ya llama a las APIs de los dos servicios en la
misma pantalla — `ControlProyectosView.tsx` existe pero es código muerto,
inalcanzable desde cualquier ruta de navegación. Mantener dos
microservicios, dos bases de datos y dos ciclos de despliegue para lo que ya
se opera como un solo módulo agrega complejidad operativa sin beneficio real
(no hay aislamiento de equipo ni escala diferenciada que lo justifique). El
dueño del producto confirmó: solo debe existir el módulo "Control de
Proyectos".

Además, `control-obra` tiene un hallazgo de seguridad pendiente (RLS nunca
aplicado en producción, tarea 3.4 de `fix-rls-bypass-bocam-admin`) — la
fusión lo resuelve de raíz en vez de aplicar un parche a un servicio que va
a desaparecer.

## What Changes

- Mover los 4 modelos de `apps/control-obra/prisma/schema.prisma`
  (`BitacoraObra`, `AvanceFisico`, `MaterialConsumidoObra`, `Estimacion`) al
  schema de `apps/control-proyectos/prisma/schema.prisma`.
- Migrar los datos existentes de `bocam_control_obra` → `bocam_control_proyectos`
  (dump + restore de las 4 tablas, conservando UUIDs y relaciones).
- Mover los 17 endpoints REST de `apps/control-obra/src/main.ts` a
  `apps/control-proyectos/src/main.ts`, bajo el prefijo
  `/api/v1/control-proyectos/*`. **BREAKING**: cambia el prefijo de ruta de
  `/api/v1/control-obra/*` a `/api/v1/control-proyectos/*`.
- Internalizar como llamada de función directa la integración que hoy es
  100% asíncrona vía RabbitMQ entre ambos servicios: `control-proyectos` ya
  solo consume `control_obra.avance_fisico_validado` para recalcular
  CPI/SPI/EAC — al vivir en el mismo proceso, ese recálculo se dispara
  directo tras validar un avance, sin publicar/consumir el evento
  internamente (se sigue publicando hacia afuera para finanzas/contabilidad).
- Mantener el **contrato externo** de los eventos que sí tienen
  consumidores reales fuera del módulo fusionado:
  `control_obra.estimacion_aprobada` (finanzas, contabilidad) y
  `control_obra.avance_fisico_validado` (finanzas, contabilidad) — mismo
  nombre de evento y mismo payload, publicados ahora desde
  `control-proyectos`. **No** se preservan `control_obra.estimacion_creada`
  ni `control_obra.bitacora_firmada` (confirmado sin consumidores en todo
  el repo).
- Actualizar los 5 puntos externos que llaman directo a rutas de
  `control-obra` para que apunten al nuevo prefijo:
  `apps/asistente/src/tools/control-obra.ts`,
  `apps/asistente/src/routes/resumen-ejecutivo.ts`,
  `apps/asistente/src/routes/alertas-predictivas.ts`,
  `apps/app-shell/src/views/ResidenciaView.tsx`,
  `apps/app-shell/src/views/DashboardView.tsx`, y el B2B fail-soft de
  `apps/gerencia-tecnica/src/main.ts` (`trazabilidad/triangulo` →
  `conceptos/:id/costo-real`).
- Actualizar `apps/app-shell/src/lib/api.ts` (`controlObraApi`) y
  `ControlObraView.tsx` para que todas las llamadas (las que hoy van a
  `/control-obra/*` y las que ya iban a `/control-proyectos/*`) apunten al
  mismo backend fusionado. Eliminar el caso muerto `'control-proyectos'` en
  `App.tsx` y el componente `ControlProyectosView.tsx` (código muerto,
  nunca alcanzable).
- Aplicar `rls-policies.sql` (RLS real, `bocam_app` sin bypass) sobre las 7
  tablas del schema fusionado como parte de este change — **reemplaza** la
  tarea 3.4 (`control-obra`) y deja sin efecto la tarea 4.3
  (`control-proyectos`, "sin políticas, solo cambio de rol") de
  `openspec/changes/fix-rls-bypass-bocam-admin/tasks.md`, que se actualizan
  para reflejarlo.
- Eliminar el contenedor `bocam-vps-control-obra` de
  `docker-compose.vps.yml` y las variables `CONTROL_OBRA_DATABASE_URL` /
  `CONTROL_OBRA_URL` del `.env` del VPS una vez verificado el corte.
  **BREAKING** a nivel de infraestructura: el servicio deja de existir.

## Capabilities

### New Capabilities
- `bitacoras-obra`: registro diario de bitácora de obra por frente de
  trabajo, firma por el residente, ahora servido por `control-proyectos`.
- `avances-y-estimaciones`: registro y validación de avance físico por
  concepto del presupuesto, y su agrupación en estimaciones de facturación
  con workflow de aprobación (técnica → financiera), ahora servido por
  `control-proyectos`, con recálculo EVM/Curva S disparado en el mismo
  proceso al validar un avance.

### Modified Capabilities
- `dashboard-entrada-control-obra`: el dashboard documentado en este spec
  pasa a ser servido por `control-proyectos` bajo el nuevo prefijo de ruta;
  el contrato visual/de datos (semáforo WBS, avance físico vs financiero,
  banner "Finanzas offline") no cambia.
- `endpoint-dashboard-control-obra`: `GET /api/v1/control-obra/dashboard`
  se convierte en `GET /api/v1/control-proyectos/dashboard-obra` (o
  equivalente a definir en design.md) — mismo shape de respuesta, misma
  llamada B2B fail-soft a Finanzas para `financiero_pct`, mismos roles.

## Impact

- **Código**: `apps/control-obra` (se elimina tras la migración),
  `apps/control-proyectos` (crece: +4 modelos, +17 endpoints, +lógica de
  recálculo EVM en línea), `apps/app-shell` (API client, `ControlObraView`,
  `App.tsx`, borrado de `ControlProyectosView.tsx`), `apps/asistente` (2
  archivos), `apps/gerencia-tecnica` (1 integración B2B).
- **Bases de datos**: `bocam_control_obra` se migra íntegro a
  `bocam_control_proyectos` y luego se retira (backup final antes de
  dropear).
- **Eventos**: contrato externo de `control_obra.estimacion_aprobada` y
  `control_obra.avance_fisico_validado` se preserva sin cambios para
  `finanzas` y `contabilidad` — cero cambios requeridos en esos dos
  servicios.
- **Infraestructura**: `docker-compose.vps.yml`, `.env` del VPS, healthchecks
  de `app-shell` (hoy depende de `control-obra`, pasa a depender solo de
  `control-proyectos`).
- **Seguridad**: resuelve de raíz la tarea 3.4 pendiente de
  `fix-rls-bypass-bocam-admin` (RLS nunca aplicado en `control-obra`).
- **Specs existentes afectados**: `openspec/specs/dashboard-entrada-control-obra/`,
  `openspec/specs/endpoint-dashboard-control-obra/`.
