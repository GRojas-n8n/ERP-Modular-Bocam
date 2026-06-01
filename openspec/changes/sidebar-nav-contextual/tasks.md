# Tasks — Sidebar de Navegación Contextual por Rol

## 1. Layout.tsx — Estructura de Nav y Sub-items

- [x] 1.1 Agregar tipo `SubItem` al archivo:
  ```typescript
  type SubItem = { id: string; label: string; icon: React.FC<{ className?: string }>; roles?: string[] };
  ```
  y extender el tipo de `ALL_NAV_ITEMS` para incluir `subItems?: SubItem[]`.

- [x] 1.2 Poblar `subItems` en cada módulo con tabs. Usar íconos ya existentes en `Icons.tsx`:

  **Compras** — `roles: ['compras', 'procurement', 'residencia', 'resident', 'gerencia_tecnica', 'superintendent']`:
  ```typescript
  subItems: [
    { id: 'requisiciones',   label: 'Requisiciones',  icon: IconShoppingCart, roles: ['compras', 'procurement', 'superintendent'] },
    { id: 'catalogo',        label: 'Catálogo',        icon: IconPackage,      roles: ['compras', 'procurement', 'superintendent'] },
    { id: 'almacen',         label: 'Almacén',         icon: IconLayers,       roles: ['compras', 'procurement', 'superintendent'] },
    { id: 'pendientes-eval', label: 'Eval. Técnica',   icon: IconClock,        roles: ['resident', 'residencia', 'superintendent'] },
    { id: 'pendientes-gt',   label: 'Aprob. GT',       icon: IconCheckCircle2, roles: ['gerencia_tecnica', 'superintendent'] },
  ]
  ```

  **Gerencia Técnica** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'catalogo', label: 'Catálogo de Obra', icon: IconBriefcase },
    { id: 'insumos',  label: 'Insumos',          icon: IconPackage },
  ]
  ```

  **Residencia** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'estimaciones', label: 'Estimaciones',    icon: IconFileText },
    { id: 'nomina',       label: 'Nómina Cuadrilla', icon: IconUsers },
    { id: 'asistencia',   label: 'Asistencia QR',   icon: IconClipboardCheck },
    { id: 'requisiciones',label: 'Requisiciones',   icon: IconShoppingCart },
  ]
  ```

  **Control de Obra** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'bitacoras',    label: 'Bitácoras',       icon: IconFileText },
    { id: 'avances',      label: 'Avances Físicos', icon: IconTrendingUp },
    { id: 'estimaciones', label: 'Estimaciones',    icon: IconActivity },
  ]
  ```

  **Personal** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'empleados',  label: 'Empleados',       icon: IconUsers },
    { id: 'cuadrillas', label: 'Cuadrillas',      icon: IconBriefcase },
    { id: 'prenomina',  label: 'Pre-Nómina',      icon: IconWallet },
    { id: 'pases',      label: 'Pases de Acceso', icon: IconShieldCheck },
  ]
  ```

  **Seguridad HSE** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'incidentes',     label: 'Incidentes',      icon: IconAlertCircle },
    { id: 'inspecciones',   label: 'Inspecciones',    icon: IconCheckCircle2 },
    { id: 'permisos',       label: 'Permisos',        icon: IconFileText },
    { id: 'capacitaciones', label: 'Capacitaciones',  icon: IconUsers },
    { id: 'epp',            label: 'EPP',             icon: IconShieldCheck },
  ]
  ```

  **Admin** — `roles` sin cambio:
  ```typescript
  subItems: [
    { id: 'usuarios',  label: 'Usuarios',  icon: IconUsers },
    { id: 'proyectos', label: 'Proyectos', icon: IconBriefcase },
  ]
  ```

  `Dashboard`, `Finanzas`, `Contabilidad`, `Ventas` → sin `subItems` (o `subItems: []`).

- [x] 1.3 Agregar `currentSubView: string` y `onSubNavigate: (sub: string) => void` a `LayoutProps`.

- [x] 1.4 Actualizar `handleNavigate` para auto-seleccionar el primer sub-item accesible al cambiar de módulo:
  ```typescript
  const handleNavigate = (view: string) => {
    const item = ALL_NAV_ITEMS.find(i => i.id === view);
    const firstSub = item?.subItems?.find(s =>
      !s.roles?.length || isAdmin || s.roles.some(r => userRoles.includes(r))
    );
    onSubNavigate(firstSub?.id ?? '');
    onNavigate(view);
    setIsMobileNavOpen(false);
  };
  ```

- [x] 1.5 En `renderSidebarContent`, actualizar el bloque de navegación para renderizar sub-items
  cuando el módulo está activo. Lógica en pseudo-código:
  ```
  Por cada navItem:
    Renderizar botón del módulo (igual que hoy)
    Si currentView === item.id Y item.subItems tiene items:
      Renderizar contenedor de sub-items con línea vertical izquierda
      Por cada subItem filtrado por rol:
        Renderizar botón sub-item con:
          - pl-9 (alineado después del ícono del padre)
          - Ícono h-3.5 w-3.5
          - Texto text-xs font-medium
          - Activo: bg-muted/80 text-primary border-l-2 border-primary
          - Inactivo: text-muted-foreground hover:text-foreground hover:bg-muted/40
          - onClick: onSubNavigate(subItem.id)
  ```

---

## 2. App.tsx — Estado de Sub-navegación

- [x] 2.1 Agregar estado en `AuthenticatedApp`:
  ```typescript
  const [currentSubView, setCurrentSubView] = useState<string>('');
  ```

- [x] 2.2 Pasar nuevos props al `<Layout>`:
  ```typescript
  <Layout
    onNavigate={(view) => setCurrentView(view)}
    currentView={currentView}
    currentSubView={currentSubView}
    onSubNavigate={(sub) => setCurrentSubView(sub)}
  >
  ```

- [x] 2.3 Actualizar `renderView()` para pasar `activeSubView={currentSubView}` a cada vista
  que tiene sub-items:
  ```typescript
  case 'compras':    return <ComprasView     activeSubView={currentSubView} />;
  case 'insumos':    return <InsumosView     activeSubView={currentSubView} />;
  case 'residencia': return <ResidenciaView  activeSubView={currentSubView} />;
  case 'control-obra': return <ControlObraView activeSubView={currentSubView} />;
  case 'personal':   return <PersonalView    activeSubView={currentSubView} />;
  case 'seguridad':  return <SeguridadView   activeSubView={currentSubView} />;
  case 'admin':      return <AdminView       activeSubView={currentSubView} />;
  ```
  Vistas sin tabs (`finanzas`, `contabilidad`, `ventas`, `dashboard`) no reciben el prop.

---

## 3. ComprasView — Migrar a Sub-nav Externo

- [x] 3.1 Agregar prop al componente:
  ```typescript
  interface ComprasViewProps { activeSubView?: string; }
  export const ComprasView: React.FC<ComprasViewProps> = ({ activeSubView }) => {
  ```

- [x] 3.2 Reemplazar el estado interno `activeTab` por valor derivado del prop:
  ```typescript
  // Eliminar: const [activeTab, setActiveTab] = useState<TabId>('requisiciones');
  const activeTab: TabId = (activeSubView as TabId) || 'requisiciones';
  ```

- [x] 3.3 Eliminar el bloque de renderizado de la barra de tabs (el `<div>` que contiene los
  botones `{ id: 'requisiciones', label: 'Requisiciones', ... }.map(tab => <Button ...>)` y
  el wrapper que lo contiene).

- [x] 3.4 Eliminar el botón contextual de acción que referencia `setActiveTab` (líneas ~831–860)
  — este bloque usa `activeTab` para mostrar botones de "Nueva Requisición" / "Nueva Entrada",
  que deben permanecer. Solo eliminar la llamada a `setActiveTab` si existe allí; los botones
  de acción se quedan. Verificar que no haya referencias a `setActiveTab` tras el cambio.

---

## 4. InsumosView — Migrar a Sub-nav Externo

- [x] 4.1 Agregar prop:
  ```typescript
  interface InsumosViewProps { activeSubView?: string; }
  export const InsumosView: React.FC<InsumosViewProps> = ({ activeSubView }) => {
  ```

- [x] 4.2 Reemplazar `const [activeTab, setActiveTab] = useState<ActiveTab>('catalogo')` por:
  ```typescript
  const activeTab: ActiveTab = (activeSubView as ActiveTab) || 'catalogo';
  ```

- [x] 4.3 Eliminar el bloque de la barra de tabs (marcado con `{/* ── Tabs ── */}` ~línea 1259).

- [x] 4.4 Verificar que el botón de "Importar Catálogo" / "Importar Insumos" siga funcionando
  (usa `activeTab` para determinar qué importar — debe seguir leyendo el valor derivado).

---

## 5. ResidenciaView — Migrar a Sub-nav Externo

- [x] 5.1 Agregar prop:
  ```typescript
  interface ResidenciaViewProps { activeSubView?: string; }
  export const ResidenciaView: React.FC<ResidenciaViewProps> = ({ activeSubView }) => {
  ```

- [x] 5.2 Reemplazar `const [activeTab, setActiveTab] = useState<TabId>('estimaciones')` por:
  ```typescript
  const activeTab: TabId = (activeSubView as TabId) || 'estimaciones';
  ```

- [x] 5.3 Localizar el `useEffect` que dispara fetch de requisiciones basado en `activeTab`
  (~línea 330: `if (activeTab !== 'requisiciones' || isDemo) return;`). Verificar que
  siga disparándose correctamente con el valor prop-driven (debería funcionar sin cambios
  adicionales ya que `activeTab` sigue siendo la variable que cambia).

- [x] 5.4 Eliminar el bloque de la barra de tabs (`{/* ── Tab bar ── */}` ~línea 767).

---

## 6. ControlObraView — Migrar a Sub-nav Externo

- [x] 6.1 Agregar prop:
  ```typescript
  interface ControlObraViewProps { activeSubView?: string; }
  export const ControlObraView: React.FC<ControlObraViewProps> = ({ activeSubView }) => {
  ```

- [x] 6.2 Reemplazar `const [activeTab, setActiveTab] = useState<TabId>('bitacoras')` por:
  ```typescript
  const activeTab: TabId = (activeSubView as TabId) || 'bitacoras';
  ```

- [x] 6.3 Eliminar el bloque de renderizado de la barra de tabs.

- [x] 6.4 Verificar que el botón contextual de acción (`Agregar Bitácora` / `Registrar Avance`)
  siga funcionando — usa `activeTab` para condicionar la acción, debe seguir leyendo el
  valor derivado.

---

## 7. PersonalView — Migrar a Sub-nav Externo

- [x] 7.1 Agregar prop:
  ```typescript
  interface PersonalViewProps { activeSubView?: string; }
  export const PersonalView: React.FC<PersonalViewProps> = ({ activeSubView }) => {
  ```

- [x] 7.2 Reemplazar `const [activeTab, setActiveTab] = useState<TabId>('empleados')` por:
  ```typescript
  const activeTab: TabId = (activeSubView as TabId) || 'empleados';
  ```

- [x] 7.3 Eliminar el bloque de la barra de tabs.

- [x] 7.4 Verificar que el badge de alerta de `pases` (contador `pasesAlerta.length`) siga
  siendo visible — verificar que la lógica de alerta no dependa del tab bar eliminado.

---

## 8. SeguridadView — Migrar a Sub-nav Externo

- [x] 8.1 Agregar prop:
  ```typescript
  interface SeguridadViewProps { activeSubView?: string; }
  export const SeguridadView: React.FC<SeguridadViewProps> = ({ activeSubView }) => {
  ```

- [x] 8.2 Reemplazar `const [activeTab, setActiveTab] = useState<TabId>('incidentes')` por:
  ```typescript
  const activeTab: TabId = (activeSubView as TabId) || 'incidentes';
  ```

- [x] 8.3 Eliminar el bloque de la barra de tabs.

---

## 9. AdminView — Migrar a Sub-nav Externo

- [x] 9.1 Agregar prop:
  ```typescript
  interface AdminViewProps { activeSubView?: string; }
  export const AdminView: React.FC<AdminViewProps> = ({ activeSubView }) => {
  ```

- [x] 9.2 Reemplazar `const [activeTab, setActiveTab] = useState<'usuarios' | 'proyectos'>('usuarios')` por:
  ```typescript
  const activeTab = (activeSubView as 'usuarios' | 'proyectos') || 'usuarios';
  ```

- [x] 9.3 Eliminar el bloque de la barra de tabs.

- [x] 9.4 Verificar que el botón contextual "+ Nuevo Usuario" / "+ Nuevo Proyecto" siga
  funcionando — condicionado por `activeTab`.

---

## 10. Inicialización correcta del sub-view al cargar

- [x] 10.1 En `AuthenticatedApp`, sincronizar el `currentSubView` inicial con el módulo que
  se muestra al cargar. El módulo inicial es `dashboard` (sin sub-items), así que
  `currentSubView` inicia en `''` — correcto por default.

- [x] 10.2 Si el usuario recarga la página (o llega con el módulo activo), verificar que
  los sub-items se muestran correctamente. Como no hay URL-based routing, el módulo siempre
  inicia en `dashboard` — no requiere lógica adicional.

---

## 11. Verificación por Rol en Producción (iretum.com)

- [x] 11.1 **admin@bocam.com** — verifica que todos los módulos se expanden con sus sub-items
  al hacer clic; navegar a cada sub-item muestra el contenido correcto sin tab bar.

- [x] 11.2 **compras@bocam.com** (rol: procurement) — verifica que el sidebar muestra:
  Dashboard + Compras con sub-items [Requisiciones, Catálogo, Almacén]. NO debe ver
  Eval. Técnica ni Aprob. GT.

- [x] 11.3 **residente@bocam.com** (roles: residencia, resident, control_obra) — verifica que:
  - En Control de Obra ve: Bitácoras, Avances Físicos, Estimaciones
  - En Residencia ve: Estimaciones, Nómina Cuadrilla, Asistencia QR, Requisiciones
  - **Nuevo:** En Compras ve SOLO: Eval. Técnica (no Catálogo, no Almacén)

- [x] 11.4 **gt@bocam.com** (rol: gerencia_tecnica) — verifica que:
  - En Gerencia Técnica ve: Catálogo de Obra, Insumos
  - **Nuevo:** En Compras ve SOLO: Aprob. GT

- [x] 11.5 Verificar que al hacer clic en un módulo diferente se auto-selecciona la primera
  sección accesible (el sub-item correcto queda activo en el sidebar y el contenido
  renderizado es el de esa sección).

- [x] 11.6 Verificar modo demo — el usuario demo tiene todos los roles, debe ver todos los
  sub-items en todos los módulos, y el contenido de demoData se sigue mostrando correctamente.
