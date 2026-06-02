## Context

El rol `resident` en Bocam es el Residente de Obra: la persona en campo responsable de ejecutar los frentes de trabajo definidos en el presupuesto. Su flujo de trabajo natural es:

1. Toma el presupuesto APU del frente asignado
2. Calcula cuántos materiales necesita para ejecutar X unidades de un concepto (take-off)
3. Solicita esos materiales a Compras para que los cotice y adquiera
4. Reporta imprevistos cuando aparecen materiales no contemplados

La vista `ResidenciaView.tsx` ya cubría: estimaciones, nómina de cuadrilla y asistencia QR. El ciclo de requisición era el eslabón faltante para que el Residente operara completamente desde su módulo.

## Goals / Non-Goals

**Goals:**
- Tab "Requisiciones" en ResidenciaView accesible al rol `residencia`/`resident`
- Flujo NORMAL: concepto APU → cantidad → materiales calculados → POST /compras/requisiciones
- Flujo IMPREVISTO: texto libre multi-ítem → POST /compras/requisiciones con tipo IMPREVISTO
- Lista de requisiciones propias del proyecto con estado
- KPIs básicos (total, pendientes, aprobadas, imprevistos)
- Demo mode funcional sin llamadas al backend

**Non-Goals:**
- No se implementa seguimiento del estado de la OC generada (eso es módulo Compras)
- No se implementa edición ni cancelación de requisiciones desde ResidenciaView
- No se duplica la funcionalidad de catálogo de insumos (eso es InsumosView de GT)
- No se agrega navegación entre ResidenciaView y ComprasView para ver el cuadro comparativo
- No se implementan notificaciones cuando Procurement aprueba la req

## Decisions

### D1: Tab en ResidenciaView vs. nueva vista dedicada `RequisicionesResidenteView`

**Decisión:** Tab adicional en `ResidenciaView.tsx` existente.

**Alternativa descartada:** Vista separada `RequisicionesResidenteView.tsx` con su propia entrada en el sidebar y routing en `App.tsx`.

**Rationale:** El Residente ya vive en `ResidenciaView`. Agregar una vista nueva requeriría modificar `App.tsx` (routing), el sidebar de navegación, y el sistema de permisos por vista. Un tab es mínimamente invasivo y agrupa funcionalmente todas las herramientas del Residente en un solo lugar.

### D2: Flujo NORMAL basado en concepto APU completo vs. búsqueda de insumos individuales

**Decisión:** El Residente selecciona un **concepto APU** (ej. "1.3 — Cimentación corrida de concreto") e ingresa la cantidad a ejecutar. El sistema extrae automáticamente la composición.

**Alternativa descartada:** Búsqueda de insumos individuales (igual que en InsumosView y ComprasView). El Residente no piensa en insumos individuales; piensa en conceptos completos de su presupuesto. Buscar insumos uno a uno es el flujo de Gerencia Técnica.

**Rationale:** El take-off es el cálculo `cantidad_insumo = composicion_APU × unidades_a_ejecutar`. El Residente ingresa "unidades a ejecutar" y el sistema se encarga de la composición. Este flujo es imposible con búsqueda de insumos individuales porque requeriría que el Residente recuerde qué insumos componen cada concepto.

### D3: Carga de conceptos — al abrir el panel vs. al activar el tab

**Decisión:** Los conceptos APU se cargan cuando el usuario activa el tab "Requisiciones" (en `useEffect` con `[activeTab]`). Las requisiciones también se cargan en ese momento.

**Alternativa descartada:** Cargar en el `useEffect` inicial junto con estimaciones/nómina/asistencia.

**Rationale:** El tab de Requisiciones hace 2 llamadas adicionales a la API (compras + gerencia-tecnica). Cargarlas siempre al montar la vista aumentaría el tiempo de carga inicial del Residente, que principalmente usa estimaciones y asistencia. Lazy loading por tab es el patrón correcto.

### D4: Lógica de take-off — duplicada vs. componente compartido

**Decisión:** Implementación autodependiente dentro de `ResidenciaView.tsx`. No se extrae a un componente compartido ni se reutiliza el código de `InsumosView.tsx`.

**Alternativa descartada:** Componente `TakeoffPanel.tsx` en `apps/app-shell/src/components/` que ambas vistas importan.

**Rationale:** Los dos take-offs tienen propósitos distintos. InsumosView usa el take-off para mostrar costos y análisis presupuestal. ResidenciaView usa el take-off para generar requisiciones de compra. La UI, el estado y las acciones son suficientemente distintas como para que un componente compartido sería más complejo que dos implementaciones independientes. Si en el futuro convergen, se extrae entonces.

### D5: Recalculo de totales — en el useEffect de composición vs. en el de cantidad

**Decisión:** Dos `useEffect` independientes:
1. `useEffect([conceptoSeleccionado])` — llama al API y carga la composición con `cantidad_total = 0`
2. `useEffect([cantidadTakeoff])` — recalcula `cantidad_total = cantidad_unitaria × qty` sin llamada al API

**Rationale:** Si ambos estuvieran en el mismo effect, cambiar la cantidad rellamaría al API de composición innecesariamente. Separar los concerns reduce llamadas y mejora la UX (el recálculo es instantáneo).

## Risks / Trade-offs

- **[Riesgo] Presupuesto activo vacío**: Si `GET /presupuesto/activo` devuelve 404 o sin conceptos (proyecto sin presupuesto importado en GT), el dropdown de conceptos queda vacío. El Residente puede usar el flujo IMPREVISTO, pero no puede hacer take-off. No se muestra mensaje de error específico — mejora futura.
- **[Trade-off] Sin paginación en conceptos**: El dropdown de búsqueda devuelve los primeros 10 conceptos. Si el presupuesto tiene cientos de conceptos, el usuario debe escribir para filtrar. Aceptable para el MVP.
- **[Riesgo] Rol de routing en App.tsx**: `ResidenciaView` se muestra al caso `'residencia'` en `App.tsx`. Si el JWT del Residente tiene rol `resident` (no `residencia`), no llegaría a esta vista. Revisar el mapeo de roles en App.tsx si se crean usuarios reales con rol `resident`.
- **[Decisión consciente] Sin feedback al Residente cuando Procurement aprueba**: El Residente no recibe notificación. Deberá revisar la lista de sus requisiciones para ver si pasaron a APROBADA. Fuera de scope.
- **[Sin impacto de rendimiento]**: La llamada `GET /conceptos/:id/composicion` se hace al seleccionar el concepto, no al cargar el tab. La composición de un concepto es O(10-50 insumos) — sin riesgo de timeout.

## Migration Plan

No hay cambios de schema ni de backend. Solo frontend.

1. ✅ Agregar imports (`api`, iconos nuevos) a `ResidenciaView.tsx`
2. ✅ Definir nuevos tipos TypeScript locales (`ReqResidente`, `ConceptoSimple`, `MaterialTakeoff`, `ImprevistoItem`)
3. ✅ Actualizar `TabId` para incluir `'requisiciones'`
4. ✅ Agregar estado y efectos para requisiciones
5. ✅ Implementar `handleGenerarRequisicion` con los dos flujos
6. ✅ Agregar tab "Requisiciones" al array `TABS` con badge de contador
7. ✅ Agregar KPIs para el tab activo
8. ✅ Implementar contenido del tab (lista de reqs propias)
9. ✅ Implementar SlidePanel de nueva requisición con selector NORMAL/IMPREVISTO
10. ✅ Build sin errores TypeScript
11. ✅ Commit `feat(residencia): tab Requisiciones — APU take-off e imprevistos` (hash a874468)
12. ✅ Push y pull en VPS
13. ✅ Rebuild y restart de `app-shell`
