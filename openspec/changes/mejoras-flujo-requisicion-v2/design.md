# Design: mejoras-flujo-requisicion-v2

## Context

El ciclo APU → Requisición → Cotización → Evaluación → Aprobación → OC involucra tres roles:

| Rol | Responsabilidad en el ciclo |
|---|---|
| `gerencia_tecnica` (GT) | Calcula take-off, decide qué partidas requisitar, aprueba el comparativo final |
| `residencia` (Residente) | Solicita materiales en campo, evalúa técnicamente las propuestas de proveedores |
| `procurement` (Compras) | Cotiza con proveedores, arma el cuadro comparativo, emite la OC |

El backend ya soporta este flujo completo. Los cambios son 100% frontend.

## Goals / Non-Goals

**Goals:**
- GT puede revisar y editar la pre-requisición antes de enviarla
- Residente puede seleccionar insumos individuales por tipo (no solo por concepto APU)
- Procurement ve claramente en qué paso del ciclo está cada requisición
- El routing del cuadro comparativo (Compras → Residente → GT → OC) es visible sin ambigüedad

**Non-Goals:**
- No se modifica el backend ni el schema
- No se implementan notificaciones push/email (el usuario revisa en su módulo)
- No se cambia la estructura de datos del cuadro comparativo
- No se implementa edición de cotizaciones ya autorizadas

---

## Decisions

### D1: Pre-req GT — Panel vs modal inline

**Decisión:** SlidePanel con accentColor `violet` (edición/actualización), que reemplaza el botón directo.

**Alternativa descartada:** Modal flotante en lugar del SlidePanel.

**Rationale:** El SlidePanel es el patrón establecido en el app-shell para acciones de creación/edición que requieren múltiples campos. Un modal no tiene espacio para mostrar una lista de 10-30 ítems con checkboxes y campos editables.

### D2: Pre-req GT — ¿Todos los tipos de insumo o solo MATERIAL?

**Decisión:** Mostrar todos los tipos calculados en el take-off (MATERIAL, EQUIPO, SERVICIO, MANO_DE_OBRA), con filtro de tipo visible. El GT selecciona qué ítems incluir. El `tipo_insumo` del ítem determina la naturaleza de la req (MATERIAL → compra; EQUIPO → renta; SERVICIO → subcontrato).

**Alternativa descartada:** Forzar solo MATERIAL como hace el flujo actual.

**Rationale:** En obra real, el GT necesita también requisitar equipo (retroexcavadoras, andamios en renta) y servicios (laboratorio, topografía). Limitar a MATERIAL es una restricción artificial del prototipo inicial.

### D3: Pre-req GT — ¿Una req o múltiples reqs por tipo?

**Decisión:** Una sola requisición con todos los ítems seleccionados (mezcla de tipos permitida). El campo `tipo` de `RequisicionItem` ya tiene `insumo_id` que permite distinguir.

**Alternativa descartada:** Generar automáticamente 3 reqs separadas (1 por tipo de insumo).

**Rationale:** El GT ve todo en una sola acción. Compras puede después splitear o agrupar en cotizaciones según sus proveedores. Separar automáticamente añadiría complejidad sin beneficio inmediato.

### D4: Residente — ¿Reemplazar flujo por concepto o agregar como opción?

**Decisión:** El selector NORMAL/IMPREVISTO se expande a TRES opciones:
- **📦 Por Insumo** (nuevo, default) — selección directa del catálogo por tipo
- **📋 Desde APU** (existente) — busca por concepto, carga composición completa
- **⚠️ Imprevisto** (existente) — texto libre sin catálogo

**Alternativa descartada:** Reemplazar el flujo APU por el de insumos.

**Rationale:** El flujo APU sigue siendo útil cuando el Residente quiere requisitar TODO lo de un concepto a ejecutar en un frente completo. El flujo por insumo es útil para requisitar materiales puntuales. Ambos casos ocurren en campo.

### D5: Residente — ¿Qué muestra la lista de insumos?

**Decisión:** Los insumos se cargan desde `GET /api/v1/gerencia-tecnica/presupuesto/activo` → campo `insumos` (o desde el catálogo de insumos del proyecto). Se muestra como búsqueda con filtro de tipo (MATERIAL / EQUIPO / SERVICIO). El Residente busca por nombre/clave y selecciona items, luego ingresa la cantidad.

**Alternativa descartada:** Cargar TODOS los insumos del catálogo (podría ser miles sin filtro).

**Rationale:** El catálogo del proyecto activo es el subconjunto relevante. Filtrar por tipo (MATERIAL/EQUIPO/SERVICIO) da contexto inmediato.

### D6: Routing del comparativo — ¿Cómo sabe el Residente que tiene algo que evaluar?

**Decisión:** En ComprasView, cuando el Residente inicia sesión, el tab "Eval. Técnica" muestra el badge con el count de comparativos en estado `ENVIADO_EVALUACION`. En ResidenciaView, se agrega un banner informativo en el tab Requisiciones si hay comparativos pendientes de evaluar.

**Alternativa descartada:** Notificación push/email.

**Rationale:** Las notificaciones push requieren un sistema de mensajería (WebSockets o polling) que está fuera de scope. El badge en el tab es suficiente para MVP — el Residente sabe que debe revisar su módulo.

### D7: Wizard de 3 pasos — ¿En ComparativaDetail o en la tarjeta de la req?

**Decisión:** En la **tarjeta de requisición** (ComprasView tab Requisiciones), se muestra el paso actual como un indicador de estado textual (ej. "Paso 2 de 3 — En evaluación técnica"). En `ComparativaDetail`, el wizard de pasos está como stepper visual en la parte superior.

**Rationale:** La tarjeta es el punto de entrada. El usuario necesita saber en qué paso está sin entrar al detalle. El detalle (ComparativaDetail) tiene espacio para el wizard completo.

---

## Risks / Trade-offs

- **[Riesgo] Catálogo de insumos vacío en Residente**: Si el proyecto no tiene presupuesto activo con insumos, la lista estará vacía. Hay que mostrar un mensaje claro: "Este proyecto no tiene insumos en el catálogo. Usa la opción Imprevisto."
- **[Trade-off] Un req con múltiples tipos**: Si GT mezcla MATERIAL + EQUIPO en una sola req, Compras recibe una req heterogénea. Compras debe cotizar con diferentes proveedores. Esto es correcto operativamente pero puede ser confuso en la UI de cotizaciones. Solución: en ComparativaDetail, agrupar ítems por tipo dentro del comparativo.
- **[Sin riesgo] Backend**: cero cambios, los endpoints ya soportan todo esto.

## Migration Plan

Solo frontend. No hay datos a migrar.

1. InsumosView.tsx: cambiar botón "Generar" → "Preparar" + SlidePanel de pre-req
2. ResidenciaView.tsx: expandir selector NORMAL/IMPREVISTO a 3 opciones; implementar flujo "Por Insumo"
3. ComprasView.tsx: agregar stepper de estado en tarjetas de req + botón "Enviar a Evaluación"
4. ComparativaDetail.tsx: agregar stepper visual de 3 pasos en el header
5. Build + deploy
