## 1. Infraestructura de tipos y estado

- [x] 1.1 Actualizar `type TabId` para incluir `'requisiciones'`
- [x] 1.2 Definir interfaz `ReqResidente` (`id`, `folio`, `fecha`, `estado`, `tipo?`, `prioridad`, `observaciones?`)
- [x] 1.3 Definir interfaz `ConceptoSimple` (`id`, `clave`, `descripcion`, `unidad_medida`)
- [x] 1.4 Definir interfaz `MaterialTakeoff` (`insumo_id`, `clave`, `descripcion`, `unidad`, `cantidad_unitaria`, `cantidad_total`)
- [x] 1.5 Definir interfaz `ImprevistoItem` (`descripcion_libre`, `unidad_libre`, `cantidad`, `notas`)
- [x] 1.6 Definir constante `UNIDADES_REQ` y mapa `REQ_ESTADO_BADGE`

## 2. Estado del componente

- [x] 2.1 Agregar estados: `reqsResidente`, `showReqPanel`, `reqTipo`, `reqPrioridad`, `reqNotas`, `generandoReq`
- [x] 2.2 Agregar estados de take-off: `conceptos`, `conceptoSearch`, `conceptoDropdownOpen`, `conceptoSeleccionado`, `cantidadTakeoff`, `materialesTakeoff`, `loadingComposicion`
- [x] 2.3 Agregar `conceptoDropdownRef` para cerrar el dropdown al click afuera
- [x] 2.4 Agregar estado `itemsImprevisto` con un ítem inicial vacío

## 3. Imports

- [x] 3.1 Agregar `import api from '../lib/api'`
- [x] 3.2 Agregar `useRef` al import de React
- [x] 3.3 Agregar `IconShoppingCart`, `IconSearch`, `IconClock` al import de Icons

## 4. useEffects y lógica de carga

- [x] 4.1 `useEffect([activeTab, isDemo])`: al activar tab 'requisiciones', cargar `GET /compras/requisiciones` y normalizar campos (`id_requisicion→id`, `codigo→folio`, etc.) + cargar `GET /gerencia-tecnica/presupuesto/activo` y extraer conceptos
- [x] 4.2 `useEffect([conceptoDropdownOpen])`: registrar handler `mousedown` para cerrar dropdown al click afuera
- [x] 4.3 `useEffect([conceptoSeleccionado])`: al cambiar el concepto, llamar `GET /conceptos/:id/composicion`, filtrar MATERIAL, poblar `materialesTakeoff` con `cantidad_total = 0`
- [x] 4.4 `useEffect([cantidadTakeoff])`: recalcular `cantidad_total = cantidad_unitaria × qty` sin llamada al API

## 5. Handlers

- [x] 5.1 `resetReqPanel()`: limpia todo el estado del panel
- [x] 5.2 `conceptosFiltrados`: computed que filtra por `conceptoSearch` (primeros 10)
- [x] 5.3 `handleGenerarRequisicion()` — rama NORMAL:
  - Valida concepto seleccionado y cantidad > 0
  - Valida que hay al menos un material con cantidad > 0
  - Demo mode: toast de simulación
  - Real: `POST /compras/requisiciones` con `tipo: 'NORMAL'`, ítems mapeados, observaciones con contexto APU
  - Tras éxito: toast + `resetReqPanel()` + refrescar lista
- [x] 5.4 `handleGenerarRequisicion()` — rama IMPREVISTO:
  - Valida al menos un ítem con `descripcion_libre` y `cantidad`
  - Demo mode: toast de simulación
  - Real: `POST /compras/requisiciones` con `tipo: 'IMPREVISTO'`, `es_imprevisto: true`
  - Tras éxito: toast + `resetReqPanel()` + refrescar lista

## 6. Tab bar

- [x] 6.1 Agregar `{ id: 'requisiciones', label: 'Requisiciones', icon: IconShoppingCart, count: reqsPendientes }` al array `TABS`
- [x] 6.2 Actualizar el render del tab bar para mostrar el badge de `count` cuando > 0

## 7. KPIs del tab

- [x] 7.1 Sección de KPIs condicional a `activeTab === 'requisiciones'`: total, pendientes, aprobadas, imprevistos

## 8. Contenido del tab Requisiciones

- [x] 8.1 Header con título descriptivo + botón "Nueva Requisición" (bg-indigo-600)
- [x] 8.2 Estado vacío demo: panel informativo con instrucciones
- [x] 8.3 Estado vacío real: panel vacío con call to action
- [x] 8.4 Grid de tarjetas `ReqResidente`: folio, badge tipo IMPREVISTO, estado con ícono, fecha, observaciones truncadas, prioridad, mensaje contextual (⏳ Esperando aprobación / ✓ En cotización)

## 9. SlidePanel — Nueva Requisición

- [x] 9.1 Selector NORMAL / IMPREVISTO (dos botones card con cambio de accent color indigo/amber)
- [x] 9.2 Flujo NORMAL: autocomplete de conceptos con dropdown, campo cantidad, lista de materiales calculados, mensaje si composición vacía
- [x] 9.3 Flujo IMPREVISTO: lista de ítems con `descripcion_libre` + `Select unidad_libre` + `cantidad` + `notas`, botón "Agregar ítem", banner informativo de desviación
- [x] 9.4 Campos comunes: prioridad (Select), notas/justificación (Textarea)
- [x] 9.5 `SubmitButton` con label y color condicionales al tipo

## 10. Build y deploy

- [x] 10.1 `tsc --noEmit` sin errores
- [x] 10.2 `vite build` exitoso
- [x] 10.3 Commit `feat(residencia): tab Requisiciones — APU take-off e imprevistos` (a874468)
- [x] 10.4 Push a origin/main
- [x] 10.5 Pull en VPS, rebuild app-shell, `docker compose up -d app-shell`
- [x] 10.6 Verificar que el container app-shell arranca correctamente

## 11. Riesgos pendientes de resolución

- [x] 11.1 Endpoint `GET /gerencia-tecnica/presupuesto/activo` creado — devuelve el presupuesto más reciente con conceptos `{ id, clave, descripcion, unidad_medida }`; retorna 404 si no existe
- [x] 11.2 Verificado: App.tsx usa `case 'residencia':` (línea 91) — coincide con el rol en JWTs de producción
- [x] 11.3 Agregado estado `sinPresupuesto` en ResidenciaView — el dropdown muestra "Sin presupuesto activo — importa el catálogo en Gerencia Técnica" cuando la carga falla
