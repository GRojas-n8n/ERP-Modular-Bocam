# Matriz de alcance de datos — auditoría 2026-09-24

## Criterio

- `project-scoped`: requiere `securityContext.proyectoId` no vacío y filtra
  explícitamente por ese identificador.
- `tenant-scoped`: puede operar sin proyecto, pero filtra obligatoriamente por
  tenant y debe estar justificado por una capacidad global.
- `catálogo compartido`: entidad de referencia del tenant o global que no
  representa una operación de obra.
- `mixto`: el servicio contiene más de un patrón; el guard debe montarse por
  router o ruta, nunca globalmente por nombre de servicio.

## Backend

| Servicio | Clasificación | Evidencia actual | Decisión para implementación |
|---|---|---|---|
| `auth` | tenant-scoped + catálogo administrativo | Usuarios, proyectos y accesos pertenecen al tenant; no monta `requireProjectAccess()` | No montar el guard project-scoped en las rutas administrativas |
| `gerencia-tecnica` | mixto, interfaz operativa project-scoped | Monta `requireProjectAccess()`. `GET /presupuestos` usa un `whereClause` vacío si falta `proyectoId`; RLS de presupuesto/conceptos permite `proyecto NULL` como modo global | Guard obligatorio en presupuestos, conceptos de obra, APU, saldos, transferencias, costos, trazabilidad y dashboard; catálogos compartidos requieren excepción explícita |
| `compras` | project-scoped transaccional + catálogos compartidos | `procurement` ya exige proyecto; requisiciones, comparativas, OCs y trazabilidad filtran por proyecto. Proveedores/documentos son catálogo del tenant | Mantener transacciones estrictas. Revisar si proveedores deben vivir en router tenant-scoped separado |
| `almacen` | mixto con operación principal project-scoped | Inventario y movimientos filtran tenant + proyecto. Activos y traspasos incluyen navegación entre proyecto origen/destino | Guard en inventario/movimientos/dashboard; documentar explícitamente las rutas de activos/traspasos que necesiten alcance cruzado |
| `control-proyectos` | project-scoped | Middleware y RLS combinan tenant + proyecto en todas las tablas operativas | Guard obligatorio a nivel del router operativo; conservar aparte `avance-resumen-multi` con validación de lista autorizada |
| `seguridad` | project-scoped | Middleware y políticas RLS estrictas para incidentes, inspecciones, permisos, capacitaciones y EPP | Guard obligatorio para todo el router autenticado |
| `ventas` | project-scoped | RLS de entidades transaccionales exige tenant + proyecto | Guard obligatorio en rutas operativas |
| `finanzas` | mixto | Pagos y flujo consolidado tienen modo global documentado; presupuestos asignados, movimientos y proyecto-finanzas mantienen RLS estricta | Guard solo en presupuestos y operaciones de proyecto; no aplicarlo a pagos, cuentas bancarias ni reportes consolidados autorizados |
| `contabilidad` | mixto | Asientos/movimientos pueden operar globalmente con trazabilidad; algunas rutas construyen `...(proyectoId ? { proyecto_id } : {})` de forma deliberada | Mantener global únicamente en asientos/reportes documentados; clasificar las demás rutas antes de montar guard |
| `personal` | mixto | Empleados, documentos y credenciales son tenant-scoped; asignaciones, cuadrillas, asistencia y prenómina son project-scoped | Separar routers: catálogo laboral global sin guard; operación de obra y nómina de proyecto con guard |
| `calidad` | decisión pendiente, hoy inconsistente | RLS declara alcance corporativo, pero varias consultas agregan `proyecto_id: proyectoId`; no monta `requireProjectAccess()` | Resolver contrato de producto antes de cambiar: corporativo con trazabilidad o project-scoped. Mientras tanto no usar como precedente global |
| `reportes` | servicio de generación, sin propiedad de datos | Genera archivos con payload ya autorizado; no debe ampliar acceso por sí mismo | Validar autorización en el servicio dueño de los datos; no introducir modo global implícito |
| `asistente` | agregador mixto | Consume módulos B2B y recibe contexto autenticado | Cada herramienta debe heredar la clasificación del servicio dueño y nunca sustituir proyecto vacío por consulta global |

## Frontend

| Vista | Alcance esperado | Estado actual sin proyecto | Acción requerida |
|---|---|---|---|
| `InsumosView` | project-scoped | **Crítico:** ejecuta presupuesto y dashboard; producción mostró 72 conceptos | Bloquear toda carga, limpiar estado y ocultar acciones |
| `ControlObraView` | project-scoped | Guardas parciales; producción mostró `SIN DATOS DE PROYECTO` | Unificar guard de vista y cubrir todas las cargas |
| `ComprasView` | mixto, operación project-scoped | Ejecuta `fetchData()` al cambiar a `null`; producción mostró estado vacío y acción `Nueva requisición` | Bloquear transacciones y acciones; separar catálogos compartidos |
| `AlmacenView` | mixto | Solicita dashboard/inventario/movimientos al montar; usa `currentProjectId ?? ''` en traspasos | Guardar operación project-scoped y decidir rutas cross-project |
| `SeguridadView` | project-scoped | Carga cinco colecciones sin guard visible | Estado seguro único y ninguna acción mutante |
| `CalidadView` | por decidir | Carga dashboard/documentos sin usar `currentProjectId` como precondición | Alinear con la decisión de alcance backend |
| `FinanzasView` | mixto | Carga dashboard, pagos, presupuestos y cuentas sin proyecto; deja acciones visibles | Separar panel global de presupuestos/acciones project-scoped |
| `ContabilidadView` | tenant-scoped con trazabilidad | Carga dashboard/asientos/reportes globales | Conservar; mostrar proyecto por fila cuando aplique |
| `PersonalView` | mixto | Carga catálogo laboral y operación de proyecto en una misma tanda | Mantener empleados globales; bloquear cuadrillas, asistencia y prenómina sin proyecto |
| `ResidenciaView` y tabs | project-scoped | Varias pestañas cargan Control, GT, Compras y Personal sin guard superior uniforme | Guard en el contenedor y limpieza al cambiar/perder proyecto |
| `DashboardView` | mixto | Llama resúmenes de seis servicios aun sin proyecto | Separar indicadores tenant-level de tarjetas project-scoped y no presentar errores como KPIs |
| `AdminView` | mixto | Usuarios/proyectos funcionan sin proyecto; categorías/costos ya tienen guardas puntuales | Conservar administración tenant-level y reforzar solo subvista de configuración del proyecto |

## Hallazgos de ampliación implícita

1. **Confirmado y reproducible:** `apps/gerencia-tecnica/src/main.ts` construye
   `whereClause = {}` en `GET /presupuestos` cuando `proyectoId` es vacío.
2. **Intencional, no corregir en bloque:** `apps/contabilidad/src/main.ts` usa un
   filtro condicional en asientos para el modo global con trazabilidad.
3. **RLS que amplía alcance con proyecto nulo:** Gerencia Técnica permite
   `get_current_proyecto_id() IS NULL` en presupuesto y conceptos; esto convierte
   un error de contexto en lectura global y debe retirarse de entidades
   project-scoped.
4. **Frontend:** `InsumosView`, `ComprasView`, `FinanzasView`, `AlmacenView`,
   `CalidadView`, `PersonalView`, `SeguridadView`, `DashboardView` y tabs de
   Residencia disparan al menos una carga sin una precondición uniforme de
   proyecto.

## Cobertura de regresión reutilizada

- `packages/auth-middleware/src/middleware.test.ts` conserva el contrato global
  de `finanzas`, `admin`, `superintendent` y `personal_rh` en
  `requireProjectAccess()`.
- `apps/finanzas/test/integration/rls-pagos-modo-global.integration.test.ts`
  cubre pagos globales con trazabilidad y aislamiento de tenant.
- Las suites de aislamiento cross-project de Compras y Control de Proyectos
  cubren el patrón estricto existente.
- Los tests nuevos de este change cubren el guard project-scoped separado,
  Gerencia Técnica sin proyecto y la ausencia de cargas en `InsumosView`.
