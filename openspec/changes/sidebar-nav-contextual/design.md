# Design — Sidebar de Navegación Contextual por Rol

## Context

El ERP tiene 11 módulos de negocio. Los usuarios operativos (residente, procurement,
personal_rh, etc.) tienen acceso a 1–3 módulos. La barra de tabs horizontal dentro de
cada vista tiene problemas estructurales:

- Fragmenta la UI al convivir dos sistemas de navegación (sidebar + tabs)
- Consume altura en la zona de contenido (~60–80px por vista)
- Cada vista implementa sus propios estilos de tabs — inconsistencia visual
- En mobile, los labels de tabs se truncan

El sidebar ya tiene 240px de ancho con ícono + texto, está filtrado por rol, y tiene
capacidad para ~12 items antes de necesitar scroll. La oportunidad es aprovechar ese
espacio para centralizar TODA la navegación.

### Inventario de tabs por módulo

| Módulo | Sub-secciones actuales (tab IDs) |
|--------|----------------------------------|
| Compras | `requisiciones`, `catalogo`, `almacen`, `pendientes-eval`\*, `pendientes-gt`\*\* |
| Gerencia Técnica | `catalogo` (Catálogo de Obra), `insumos` |
| Residencia | `estimaciones`, `nomina`, `asistencia`, `requisiciones` |
| Control de Obra | `bitacoras`, `avances`, `estimaciones` |
| Personal | `empleados`, `cuadrillas`, `prenomina`, `pases` |
| Seguridad HSE | `incidentes`, `inspecciones`, `permisos`, `capacitaciones`, `epp` |
| Admin | `usuarios`, `proyectos` |
| Finanzas | Sin tabs (vista única) |
| Contabilidad | Sin tabs (vista única) |
| Ventas | Sin tabs (skeleton) |
| Dashboard | Sin tabs (vista única) |

\* `pendientes-eval`: actualmente solo visible para `resident`/`residencia`/`superintendent`
\*\* `pendientes-gt`: actualmente solo visible para `gerencia_tecnica`/`superintendent`

### Gap RBAC identificado

`residencia` y `gerencia_tecnica` operan endpoints de evaluación en Compras (backends
aceptan esos roles desde commit `6cdb11a`) pero el nav item de Compras tiene
`roles: ['compras', 'procurement']` — esos usuarios no pueden llegar a la vista.

## Goals

1. Un solo sistema de navegación: sidebar es la fuente de verdad para módulo + sección
2. El `<main>` contiene SOLO contenido, sin controles de navegación
3. Sub-items filtrados por rol del usuario (mismo principio que nav items de nivel 1)
4. Auto-selección: navegar a un módulo activa automáticamente su primera sección accesible
5. Corregir gap RBAC: `residencia`, `resident`, `gerencia_tecnica`, `superintendent`
   acceden a Compras con visibilidad filtrada de sub-items

## Non-Goals

- Sidebar colapsable (fuera de scope)
- URL-based routing / React Router (no se introduce)
- Rediseño visual profundo de las vistas
- Cambios en FinanzasView, ContabilidadView, VentasView (no tienen tabs)
- Cambios en mobile overlay (los sub-items se incluyen naturalmente)
- Cambios en backend

## Decisions

**D1 — Estado en App.tsx, no en Layout**
`currentSubView` vive en `AuthenticatedApp` (App.tsx) al mismo nivel que `currentView`.
Esto permite que `renderView()` pase `activeSubView` directamente a cada vista como prop,
sin introducir context adicional. Layout recibe `currentSubView` + `onSubNavigate` como
props nuevos.

**D2 — Sub-items indentados bajo el módulo activo**
Cuando un módulo está activo, sus sub-items aparecen indentados debajo de él en el
sidebar. Los otros módulos (accesibles al usuario) permanecen en la lista. El módulo
padre permanece clickeable (redirige a la primera sección accesible).
Jerarquía visual: línea vertical izquierda + padding izquierdo adicional (`pl-9`).

**D3 — Filtrado de sub-items por rol (mismo patrón que nivel 1)**
Cada `subItem` puede declarar `roles?: string[]`. Si está vacío/undefined → siempre
visible. Si tiene roles → mismo filtro que `navItems`: al menos uno de sus roles debe
estar en `userRoles` (o el usuario es admin).

**D4 — Reemplazar estado interno por prop en cada vista**
Las vistas que tienen `activeTab` local lo reemplazan con `activeSubView` del prop:
```typescript
// Antes
const [activeTab, setActiveTab] = useState<TabId>('requisiciones');

// Después
const activeTab: TabId = (activeSubView as TabId) || 'requisiciones'; // default al primero
```
La lógica de rendering condicional dentro de cada vista (`{activeTab === 'x' && ...}`)
no cambia — solo cambia de dónde viene el valor.

**D5 — Auto-selección al navegar a un módulo**
`handleNavigate(view)` en Layout calcula el primer subItem accesible del módulo destino
y llama `onSubNavigate(firstSubItem.id)` antes de cambiar el módulo. Si el módulo no
tiene subItems (finanzas, dashboard), llama `onSubNavigate('')`.

**D6 — Visibilidad filtrada en Compras para residencia/gerencia_tecnica**
Al agregar `residencia`, `resident`, `gerencia_tecnica`, `superintendent` al nav de
Compras, los sub-items se filtran:
- `requisiciones` → `roles: ['compras', 'procurement', 'admin', 'superintendent']`
- `catalogo` → `roles: ['compras', 'procurement', 'admin', 'superintendent']`
- `almacen` → `roles: ['compras', 'procurement', 'admin', 'superintendent']`
- `pendientes-eval` → `roles: ['resident', 'residencia', 'superintendent', 'admin']`
- `pendientes-gt` → `roles: ['gerencia_tecnica', 'superintendent', 'admin']`

Así un usuario `residencia` que entra a Compras ve SOLO `pendientes-eval` en el sidebar.

## Visual Design — Sub-items en Sidebar

```
┌─────────────────────────┐
│  🛒 Compras         [●] │  ← módulo activo (gradiente azul)
│    ├ 📋 Requisiciones   │  ← sub-item activo (bg-muted, text-primary, borde izq.)
│    ├ 📦 Catálogo        │  ← sub-item inactivo
│    └ 🏪 Almacén         │
│  📊 Dashboard           │  ← otros módulos normales
└─────────────────────────┘
```

Estilos sub-item activo: `bg-muted text-primary border-l-2 border-primary pl-[35px] py-2`
Estilos sub-item inactivo: `text-muted-foreground hover:text-foreground pl-[35px] py-2`
Línea vertical conectora: pseudo-elemento o `div absolute` en el contenedor del grupo.

## Risks

**R1 — useEffect en ResidenciaView depende de `activeTab`**
`ResidenciaView` tiene un `useEffect` que dispara fetch de requisiciones cuando
`activeTab === 'requisiciones'` (línea ~330). Al pasar a prop, ese efecto debe
depender de `activeSubView` prop. Verificar que el fetch siga disparándose correctamente.

**R2 — Rollback de sub-items filtrados en Compras**
Si se agrega `residencia` al nav de Compras sin los sub-item roles correctos, un residente
podría ver tabs de catálogo o almacén sin tener acceso backend. Los sub-item roles deben
coincidir exactamente con los `requireRoles` de los endpoints correspondientes.
