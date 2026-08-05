## 1. Fundamentos

- [x] 1.1 Crear `apps/app-shell/src/help/types.ts` con `HelpBlock`, `HelpSection`, `ModuleHelp` (ver design.md).
- [x] 1.2 Exportar `ALL_NAV_ITEMS` desde `apps/app-shell/src/components/Layout.tsx` (hoy `const` sin `export`); no usarlo desde ningún otro lugar salvo el test de cobertura.
- [x] 1.3 Agregar `IconHelpCircle` a `apps/app-shell/src/components/Icons.tsx` siguiendo el patrón de los íconos SVG a mano existentes.

## 2. Contenido de ayuda por módulo (13 archivos)

Para cada módulo: cruzar en este orden de autoridad — (1) `ALL_NAV_ITEMS` + código real de la vista, (2) `openspec/specs/<capability>/spec.md` relevantes, (3) `docs/arquitectura/modulos-y-flujo-de-datos.md` para `conectaCon`, (4) `docs/manual-de-usuario.md` solo como borrador, verificando cada afirmación contra 1 y 2 antes de reusarla.

- [x] 2.1 `content/dashboard.ts` (`viewId: 'dashboard'`) — visión general de cómo encajan todos los módulos en el proceso de iRetum.
- [x] 2.2 `content/gerencia-tecnica.ts` (`viewId: 'insumos'`) — secciones: catalogo, insumos, control-costos, control-presupuestal, transferencias, trazabilidad.
- [x] 2.3 `content/compras.ts` (`viewId: 'compras'`) — secciones: requisiciones, catalogo, proveedores, pendientes-eval, pendientes-gt, ordenes-compra, trazabilidad, admin-purga.
- [x] 2.4 `content/almacen.ts` (`viewId: 'almacen'`) — secciones: inventario, movimientos.
- [x] 2.5 `content/finanzas.ts` (`viewId: 'finanzas'`) — sin subItems; una sección resumen del módulo.
- [x] 2.6 `content/contabilidad.ts` (`viewId: 'contabilidad'`) — sin subItems; una sección resumen del módulo.
- [x] 2.7 `content/control-obra.ts` (`viewId: 'control-obra'`) — secciones: dashboard, bitacoras, avances, estimaciones, evm, curva-s, alertas, costos, presupuesto-partida, programacion, configuracion.
- [x] 2.8 `content/residencia.ts` (`viewId: 'residencia'`) — secciones: estimaciones, nomina, equipo, asistencia, requisiciones.
- [x] 2.9 `content/personal.ts` (`viewId: 'personal'`) — secciones: empleados, cuadrillas, prenomina, pases.
- [x] 2.10 `content/seguridad.ts` (`viewId: 'seguridad'`) — secciones: incidentes, inspecciones, permisos, capacitaciones, epp.
- [x] 2.11 `content/ventas.ts` (`viewId: 'ventas'`) — sin subItems; una sección resumen del módulo.
- [x] 2.12 `content/calidad.ts` (`viewId: 'calidad'`) — secciones: documentos, no-conformidades, auditorias.
- [x] 2.13 `content/admin.ts` (`viewId: 'admin'`) — secciones: usuarios, proyectos, categorias.

## 3. Registro y guard de cobertura (test primero)

- [x] 3.1 Escribir `apps/app-shell/src/help/registry.test.ts` (falla en rojo primero): recorre `ALL_NAV_ITEMS`, exige que cada `NavItem.id` exista en `HELP_BY_VIEW` y que cada `SubItem.id` tenga una `HelpSection` con ese `id`; falla también si sobra una `HelpSection` sin `SubItem` correspondiente.
- [x] 3.2 Crear `apps/app-shell/src/help/index.ts` con `HELP_BY_VIEW` (importando los 13 módulos de `content/`) y `getModuleHelp(viewId)`.
- [x] 3.3 Correr el test de 3.1 hasta que pase en verde con el contenido de la sección 2.

## 4. Componentes de UI (tests primero)

- [x] 4.1 Escribir `apps/app-shell/src/components/HelpButton.test.tsx`: renderiza un botón con `aria-label` de ayuda y dispara `onClick`.
- [x] 4.2 Implementar `apps/app-shell/src/components/HelpButton.tsx` (`Button variant="outline" size="icon"` + `IconHelpCircle`).
- [x] 4.3 Escribir `apps/app-shell/src/components/HelpPanel.test.tsx`: muestra título/`queHace`/flujo/conexiones/errores comunes; abre expandida la `HelpSection` cuyo `id === activeSubView`; cierra con Esc y con el botón de cerrar; no lanza excepción si `viewId` no está en el registro.
- [x] 4.4 Implementar `apps/app-shell/src/components/HelpPanel.tsx` sobre `SlidePanel`/`SideSheet`, usando `<details>`/`<summary>` para las secciones y el vocabulario visual del panel OPUS (`InsumosView.tsx`) hasta que 4.3 pase en verde.

## 5. Integración en las 13 vistas

- [x] 5.1 `AlmacenView.tsx` — agregar estado `helpOpen`, `HelpButton` en la fila de acciones del header "hero", `HelpPanel` junto a los demás `SlidePanel` (vista de referencia para el resto).
- [x] 5.2 `InsumosView.tsx` — igual, sin tocar el botón/panel existente "¿Cómo exportar desde OPUS?".
- [x] 5.3 `ComprasView.tsx`
- [x] 5.4 `FinanzasView.tsx`
- [x] 5.5 `ContabilidadView.tsx`
- [x] 5.6 `ControlObraView.tsx`
- [x] 5.7 `ResidenciaView.tsx` — header compacto: botón junto al `h1`, no en fila de acciones.
- [x] 5.8 `PersonalView.tsx`
- [x] 5.9 `SeguridadView.tsx`
- [x] 5.10 `VentasView.tsx`
- [x] 5.11 `CalidadView.tsx` — incluye sus 3 render trees (Documentos, NoConformidadesView, AuditoriasView).
- [x] 5.12 `AdminView.tsx`
- [x] 5.13 `DashboardView.tsx` — incluye sus 2 variantes (DashboardEjecutivo y estándar).
- [x] 5.14 Escribir/actualizar un test de integración representativo, ej. `AlmacenView.ayuda-modulo.test.tsx`: el botón existe y al hacer clic aparece el panel con el título del módulo.

## 6. Verificación

- [x] 6.1 `cd apps/app-shell && npm test` en verde (suite completa, no solo los archivos nuevos) — 58/58 archivos, 186/186 tests.
- [x] 6.2 `npm run build` (`tsc -b && vite build`) sin errores.
- [x] 6.3 Navegador real (skill `/run-app-shell`) con 3 usuarios reales de roles distintos (admin→Gerencia Técnica y RRHH, residente@alfa→Residencia, comprador@alfa→Compras): panel abre con la sección de la pestaña activa expandida y el resto colapsado (confirmado cambiando de pestaña en GT y viendo el expand/collapse cambiar), nombres de sección coinciden con el sidebar, buen contraste en tema claro y oscuro (incluye bloques de aviso ámbar y errores en rojo). Sin errores de React en consola (solo 500s esperados de microservicios no levantados).
- [x] 6.4 Confirmar que no hay cambios fuera de `apps/app-shell` (sin backend, sin migraciones) — `git status` confirma solo `apps/app-shell/` y `openspec/changes/ayuda-contextual-por-modulo/`.
