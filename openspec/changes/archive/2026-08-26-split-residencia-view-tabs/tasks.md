## 1. Preparación

- [x] 1.1 Correr la suite de tests actual de `ResidenciaView.*.test.tsx` y confirmar que todos pasan antes de tocar nada (baseline).
- [x] 1.2 Crear el directorio `apps/app-shell/src/views/residencia/`.

## 2. Módulo compartido

- [x] 2.1 Crear `residencia/shared.tsx`. Ajustado en implementación: solo `fmt$`, `fmtDate` y `Modal` son realmente cross-tab (verificado por grep); las badges de estado (`EST_BADGE`, `NOM_BADGE`, `ASIS_BADGE`, `REQ_ESTADO_BADGE`, `AVANCE_BADGE`) y los tipos son cada uno de un solo tab, así que se mueven junto con su tab en las secciones 3–7, no a `shared.tsx`.
- [x] 2.2 Actualizar `ResidenciaView.tsx` para importar `fmt$`, `fmtDate`, `Modal` desde `./residencia/shared` en vez de definirlos localmente.
- [x] 2.3 `npx tsc -b` + suite de `ResidenciaView.*.test.tsx` — 7 archivos / 26 tests en verde, igual que en 1.1.

## 3. Extraer tab `equipo`

- [x] 3.1 Grep de `equipoPorCategoria`/`loadingEquipo` en todo el archivo — confirmado, sin lectura cruzada de otros tabs.
- [x] 3.2 Creado `residencia/EquipoTab.tsx`. `isDemo` se obtiene de `useTenant()` directamente en vez de recibirla por prop (más simple, es un hook de contexto). El tab se monta siempre (`active: boolean` prop) y retorna `null` cuando no está activo — ver design.md Decisión 3 (estado debe sobrevivir al cambiar de tab).
- [x] 3.3 En `ResidenciaView.tsx`, el bloque se reemplazó por `<EquipoTab active={activeTab === 'equipo'} />`.
- [x] 3.4 `tsc -b` limpio + suite `ResidenciaView.*` (7 archivos / 26 tests) en verde.

## 4. Extraer tab `asistencia`

- [x] 4.1 Grep confirmado: sin lectura cruzada de otros tabs.
- [x] 4.2 Creado `residencia/AsistenciaTab.tsx` con el estado, el fetch de tab (gateado por `active`), el escaneo QR completo (cámara, geolocalización, jsQR) y el JSX (KPIs, tabla, panel bulk-check, modal de escaneo). `useTenant()`/`useNotification()` se llaman directo en el componente.
- [x] 4.3 En `ResidenciaView.tsx`, reemplazado por `<AsistenciaTab active={activeTab === 'asistencia'} />`.
- [x] 4.4 `tsc -b` limpio + suite `ResidenciaView.*` (7 archivos / 26 tests) en verde.

## 5. Extraer tab `nomina`

- [x] 5.1 Grep confirmado: sin lectura cruzada. Nómina es distinta a los demás tabs: `prenominas`/`complementos` se cargaban en el efecto de "carga inicial" del orquestador (junto con `dashData`), no en un efecto propio gateado por `activeTab === 'nomina'` — no existía tal efecto.
- [x] 5.2 Creado `residencia/NominaTab.tsx`. Su fetch de `prenominas`/`complementos` NO se gatea por `active` (corre una sola vez al montar, igual que el original disparaba sin importar el tab activo) — ver design.md Decisión 6. El orquestador retiene solo el fetch de `dashData`.
- [x] 5.3 En `ResidenciaView.tsx`, reemplazado por `<NominaTab active={activeTab === 'nomina'} />`.
- [x] 5.4 `tsc -b` limpio + suite `ResidenciaView.*` (7 archivos / 26 tests) en verde.

## 6. Extraer tab `estimaciones`

- [x] 6.1 Grep confirmado: sin lectura cruzada, salvo `conceptos` (catálogo de partidas) que también usa `requisiciones` — confirmado seguro tener una copia local por tab (ver design.md, hallazgo de la Decisión 3).
- [x] 6.2 Creado `residencia/EstimacionesTab.tsx` con `fetchEstimacionesTab` (gateado por `active`), handlers y JSX (KPIs, error state, avances + estimaciones, SlidePanel de registrar avance, 2 confirm dialogs).
- [x] 6.3 En `ResidenciaView.tsx`, reemplazado por `<EstimacionesTab active={activeTab === 'estimaciones'} />`.
- [x] 6.4 `tsc -b` limpio + suite `ResidenciaView.*` (7 archivos / 26 tests) en verde. Limpieza adicional: varios imports (`Table*`, `ConfirmCriticalActionDialog`, `EmptyStatePanel`, `getProjectColor`, `fmt$`/`fmtDate`, `useCallback`) y `user`/`currentProjectId`/`currentProjectName`/`currentProjectColor` quedaron sin uso en el orquestador tras esta extracción — confirma que `requisiciones` (el único tab que falta) no usa las tablas compartidas ni diálogos de confirmación críticos.

## 7. Extraer tab `requisiciones`

- [x] 7.1 Grep confirmado: sin lectura cruzada (salvo `conceptos`, ya cubierto en la Decisión 3 de design.md).
- [x] 7.2 Creado `residencia/RequisicionesTab.tsx` (1469 líneas — el tab más grande) con los tres flujos (por insumo, desde APU, imprevisto), el panel "Nueva Requisición" y la lista de requisiciones.
- [x] 7.3 En `ResidenciaView.tsx`, reemplazado por `<RequisicionesTab active={activeTab === 'requisiciones'} />`.
- [x] 7.4 `tsc -b` limpio + suite completa de `apps/app-shell` (72 archivos / 245 tests) en verde — no solo `ResidenciaView.*`.

## 8. Cierre

- [x] 8.1 `ResidenciaView.tsx` quedó en 169 líneas (3311 → 169): `tenant`/`isDemo`, `loading` inicial, `dashData` + su fetch, `helpOpen`/`HelpPanel`, header, y el render de los 5 `<XTab active={...} />`.
- [x] 8.2 Named export `ResidenciaView` y firma `React.FC<{ activeSubView?: string }>` sin cambios — confirmado por los 6 tests legacy pasando sin tocar sus imports.
- [x] 8.3 Suite completa de `apps/app-shell`: 72 archivos / 245 tests en verde.
- [x] 8.4 Smoke manual vía skill `run-app-shell` (login demo, Playwright headless): los 5 tabs (Estimaciones, Nómina Cuadrilla, Mi Equipo, Asistencia QR, Requisiciones) cargan con KPIs/tablas/listas visibles y cero errores de consola. Además se probaron los dos paneles más complejos — "Registrar Avance" y "Nueva Requisición" con sus 3 flujos (Por Insumo, Desde APU, Imprevisto) — todos abren y renderizan correctamente sin errores.
- [x] 8.5 Diff acotado a `apps/app-shell/src/views/ResidenciaView.tsx` (modificado) y `apps/app-shell/src/views/residencia/` (nuevo) — verificado con `git status`, nada más tocado.
