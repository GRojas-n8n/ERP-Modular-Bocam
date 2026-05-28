# Tasks: mejoras-flujo-requisicion-v2

## 1. InsumosView — Pre-Requisición GT

- [x] 1.1 Renombrar botón "Generar Requisición" → "Preparar Requisición →"
- [x] 1.2 Agregar estado `showPreReqPanel: boolean` y `preReqItems: PreReqItem[]`
- [x] 1.3 Definir interfaz `PreReqItem` (`insumo_id`, `clave`, `descripcion`, `tipo_insumo`, `unidad`, `cantidad`, `notas`, `incluido`)
- [x] 1.4 Handler `handlePrepararRequisicion()`: copia `takeoffItems` → `preReqItems` con `incluido = cantidad_total > 0`
- [x] 1.5 SlidePanel "Pre-Requisición — Revisar y Enviar" con accentColor `violet`
- [x] 1.6 Filtro de tipo en el panel (tabs TODOS / MATERIAL / EQUIPO / SERVICIO / MANO_OBRA)
- [x] 1.7 Lista de ítems con checkbox + campo cantidad editable + badge tipo + campo notas
- [x] 1.8 Contador "X de Y ítems incluidos" en el footer del panel
- [x] 1.9 Selector de prioridad + textarea observaciones
- [x] 1.10 Validación: al menos un ítem incluido + cantidades > 0
- [x] 1.11 Handler `handleEnviarPreReq()`: POST `/api/v1/compras/requisiciones` con ítems seleccionados
- [x] 1.12 Toast éxito con folio + count de ítems
- [x] 1.13 Demo mode: toast de simulación sin llamada al API

## 2. ResidenciaView — Selector de 3 opciones + flujo Por Insumo

- [x] 2.1 Cambiar tipo `reqTipo` de `'NORMAL' | 'IMPREVISTO'` a `'INSUMO' | 'APU' | 'IMPREVISTO'`
- [x] 2.2 Actualizar selector en el SlidePanel: 3 botones card (Por Insumo / Desde APU / Imprevisto)
- [x] 2.3 Renombrar opción NORMAL → APU (sin cambio de comportamiento)
- [x] 2.4 Definir interfaz `InsumoReq` (`insumo_id`, `clave`, `descripcion`, `tipo_insumo`, `unidad_medida`)
- [x] 2.5 Definir interfaz `InsumoSeleccionado` (extends `InsumoReq`, + `cantidad: number`, `notas: string`)
- [x] 2.6 Agregar estado: `insumosAll`, `insumoSearch`, `insumoTabTipo`, `insumosSeleccionados`
- [x] 2.7 Cargar insumos desde `GET /api/v1/gerencia-tecnica/insumos` en `useEffect([activeTab])` — devuelve todos los activos con `tipo_insumo`
- [x] 2.8 Flujo Por Insumo: tabs MATERIAL / EQUIPO / SERVICIO + campo búsqueda por nombre/clave
- [x] 2.9 Al seleccionar un insumo: lo agrega a `insumosSeleccionados` con cantidad = 0
- [x] 2.10 Lista de `insumosSeleccionados` con campo cantidad editable + botón X para quitar
- [x] 2.11 Actualizar `handleGenerarRequisicion()` — rama INSUMO: valida, POST con `insumo_id` y cantidades
- [x] 2.12 Actualizar `resetReqPanel()` para limpiar también `insumosSeleccionados`
- [x] 2.13 Banner si catálogo vacío: "Este proyecto no tiene insumos. Usa la opción Imprevisto."
- [x] 2.14 Demo mode: toast de simulación para flujo INSUMO

## 3. ComprasView — Stepper de estado en tarjetas + botón enviar evaluación

- [x] 3.1 Fix roles bug en ComparativaDetail (`user?.role` en vez de `tenant?.roles`)
- [ ] 3.2 Función helper `getReqCycleStep(req, comparativa)` → retorna `{ step: 1|2|3|4, label, color }`
- [ ] 3.3 Agregar stepper de estado en cada tarjeta de req (reemplaza o complementa el badge de estado actual)
- [ ] 3.4 En `ComparativaDetail`: agregar componente `<ComparativaStepIndicator step={step} />` en el header
- [ ] 3.5 En `ComparativaDetail`: agregar botón contextual por paso (ver spec cotizacion-compras-ux)
- [ ] 3.6 Handler `handleEnviarEvaluacion(comparativaId)` → `PATCH /comparativas/:id/enviar-evaluacion` ← ya verificado en backend
- [ ] 3.7 Handler `handleEvaluar(comparativaId, evaluacion)` → `PATCH /comparativas/:id/evaluar` ← ya verificado en backend
- [ ] 3.8 UI del tab "Eval. Técnica": lista de tarjetas con resumen de proveedores + botón "Evaluar"
- [ ] 3.9 UI del tab "Aprob. GT": lista de tarjetas con evaluación del Residente resaltada + botón "Revisar y Autorizar"

## 4. Build y deploy

- [x] 4.1 `tsc --noEmit` sin errores
- [x] 4.2 `vite build` exitoso
- [x] 4.3 Commit `feat(flujos): pre-req GT, seleccion insumos residente, UX cotizacion compras`
- [x] 4.4 Push a origin/main
- [x] 4.5 Pull en VPS, rebuild app-shell, `docker compose up -d app-shell`
- [ ] 4.6 Prueba E2E: GT → pre-req → Compras aprueba → Compras cotiza → envía a Residente → Residente evalúa → GT autoriza

## 5. Estado del backend (verificado)

- [x] 5.1 `GET /gerencia-tecnica/insumos` — devuelve insumos activos con `tipo_insumo` (MATERIAL/EQUIPO/SERVICIO/MANO_DE_OBRA/SUBCONTRATO). ✅ Verificado en GT main.ts línea 54.
- [x] 5.2 `PATCH /compras/comparativas/:id/enviar-evaluacion` — existe en compras main.ts línea 516. ✅
- [x] 5.3 `PATCH /compras/comparativas/:id/evaluar` — existe en compras main.ts línea 569. ✅ Acepta `{ evaluaciones: [{detalle_id, evaluacion_tecnica, comentario_tecnico?}] }`.
- [x] 5.4 Todos los cambios son exclusivamente frontend. Sin migración de backend necesaria.
