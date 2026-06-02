# Design — Dashboard Ejecutivo Consolidado

## Context

El `DashboardView` actual muestra el menú de 9 módulos para todos los roles.
Para `superintendent` y `admin` se necesita una vista de control operativo real:
KPIs en tiempo real de todos los módulos sin tener que entrar a cada uno.

## Goals

1. Vista ejecutiva con KPIs consolidados para roles superintendent/admin
2. Resto de roles: comportamiento actual sin cambio
3. Cada módulo expone un endpoint liviano `/resumen-dashboard` (solo counts + sumas)
4. Frontend carga los 5 módulos en paralelo con `Promise.allSettled` — fallo parcial = "—"

## Non-Goals

- Gráficas históricas / tendencias (iteración futura)
- WebSockets / actualización en tiempo real (polling manual con botón Refresh)
- Nuevo módulo backend (solo endpoints adicionales en los existentes)

---

## Endpoints (uno por módulo)

### GET /api/v1/compras/resumen-dashboard
`requireRoles('superintendent', 'admin')`
```json
{
  "requisiciones_pendientes": 3,
  "ocs_por_emitir": 2,
  "ocs_en_proceso": 5,
  "monto_comprometido": 450000.00
}
```
- `requisiciones_pendientes`: `Requisicion.count({ estado: 'PENDIENTE' })`
- `ocs_por_emitir`: `OrdenCompra.count({ estado: 'APROBADA' })`
- `ocs_en_proceso`: `OrdenCompra.count({ estado: 'EMITIDA' })`
- `monto_comprometido`: `OrdenCompra._sum.total` where `estado IN ('EMITIDA','RECIBIDA')`

### GET /api/v1/control-obra/resumen-dashboard
`requireRoles('superintendent', 'admin')`
```json
{
  "estimaciones_en_revision": 1,
  "estimaciones_aprobadas": 4,
  "avances_pendientes": 7
}
```
- `estimaciones_en_revision`: estado `EN_REVISION`
- `estimaciones_aprobadas`: estado `APROBADA_TECNICA` o `APROBADA_FINANCIERA`
- `avances_pendientes`: `AvanceFisico.count({ estado: 'PENDIENTE' })`

### GET /api/v1/personal/resumen-dashboard
`requireRoles('superintendent', 'admin')`
```json
{
  "empleados_activos": 45,
  "cuadrillas_activas": 5,
  "prenominas_pendientes": 2
}
```
- `empleados_activos`: `Empleado.count({ estado: 'ACTIVO' })`
- `cuadrillas_activas`: `Cuadrilla.count({ estado: 'ACTIVA' })`
- `prenominas_pendientes`: `PreNomina.count({ estado: { in: ['BORRADOR','CALCULADA'] } })`

### GET /api/v1/seguridad/resumen-dashboard
`requireRoles('superintendent', 'admin')`
```json
{
  "incidentes_abiertos": 3,
  "incidentes_criticos": 1,
  "permisos_vigentes": 4
}
```
- `incidentes_abiertos`: estado `ABIERTO` o `EN_INVESTIGACION`
- `incidentes_criticos`: same + severidad `ALTA` o `CRITICA`
- `permisos_vigentes`: `PermisoTrabajo.count({ estado: 'VIGENTE' })`

### GET /api/v1/calidad/resumen-dashboard
`requireRoles('superintendent', 'admin')`
```json
{
  "documentos_vigentes": 18,
  "documentos_en_revision": 2,
  "versiones_pendientes": 5
}
```
- `documentos_vigentes`: `Documento.count({ estado_actual: 'VIGENTE' })`
- `documentos_en_revision`: `Documento.count({ estado_actual: 'EN_REVISION' })`
- `versiones_pendientes`: `VersionDocumento.count({ estado: 'EN_REVISION' })`

---

## Frontend — Layout

```
OperationalBanner: "Dashboard Ejecutivo · [nombre proyecto]"

Row 1 — 3 cols
  [Compras]  [Control de Obra]  [Personal]

Row 2 — 2 cols
  [Seguridad HSE]  [Calidad SGC]

Cada card de módulo:
  Header: icono + nombre módulo + badge estado (ONLINE/ERROR)
  Body: 2-3 MetricCard con valor + label
  Footer: "Actualizado hace Xs" + botón ir al módulo
```

## Decisions

**D1 — Endpoint por módulo, no endpoint agregador**
Un único endpoint en un módulo coordinador requeriría llamadas síncronas internas
(JOINs cruzados prohibidos). Mejor que el frontend haga N llamadas paralelas.

**D2 — Promise.allSettled, no Promise.all**
Si Seguridad está caído, el resto del dashboard sigue mostrando datos.
Cada módulo con error muestra "—" y badge "ERROR".

**D3 — Solo counts y sumas — sin paginación**
Los endpoints son `O(1)` en tiempo de ejecución (count + aggregate son índices).
Sin límite de paginación, sin cursores.
