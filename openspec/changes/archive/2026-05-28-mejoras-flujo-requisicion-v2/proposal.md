# Proposal: mejoras-flujo-requisicion-v2

## Why

Tres problemas de UX identificados al probar el flujo real con usuarios de producción:

1. **GT genera requisición sin revisión** — En InsumosView, al calcular el take-off y hacer clic en "Generar Requisición" la req se envía a Compras en automático. El Gerente Técnico no puede seleccionar qué partidas incluir ni ajustar cantidades. Debe ver una pre-requisición editable antes de confirmar.

2. **Residente no puede seleccionar por tipo de insumo** — En ResidenciaView el Residente busca por concepto APU (clave/descripción). En campo, el Residente razona por material ("necesito 500 tabiques"), no por concepto APU ("necesito ejecutar 15 M3 de cimentación"). Se requiere una lista de insumos filtrable por tipo (MATERIAL, EQUIPO, SERVICIO) para que el Residente sea directo.

3. **Flujo de cotizaciones poco claro** — El usuario de Compras llega al cuadro comparativo pero no entiende cómo capturar precios de proveedores, cómo enviar al Residente para evaluación técnica, ni cómo ese resultado llega al GT para aprobación.

## What Changes

### `InsumosView.tsx` — Pre-Requisición GT

- **Antes**: botón "Generar Requisición" → POST inmediato a /compras/requisiciones
- **Después**: botón "Preparar Requisición" → abre SlidePanel de pre-requisición con:
  - Lista de todos los items del take-off (MATERIAL, EQUIPO, SERVICIO)
  - Checkbox por ítem para incluir/excluir
  - Campo de cantidad editable por ítem (pre-llenado con el cálculo del take-off)
  - Selector de tipo general (solo MATERIAL → req de compra; EQUIPO → req de renta; SERVICIO → req de contratación)
  - Botón "Enviar Requisición a Compras" → POST final

### `ResidenciaView.tsx` — Selección por insumo

- **Antes**: el Residente busca un concepto APU completo → el sistema extrae la composición
- **Después**: en la opción "Desde APU", el Residente ve un dropdown por categoría:
  - `MATERIAL` — lista de materiales del catálogo
  - `EQUIPO` — equipos/maquinaria de renta
  - `SERVICIO` — subcontratos y servicios
  - Selecciona uno o varios ítems, ingresa la cantidad requerida por ítem
  - El sistema genera la req con esos ítems específicos (con `insumo_id`)
- La opción de búsqueda por concepto APU se conserva como modo alternativo

### `ComprasView.tsx` — UX de cotizaciones y routing del cuadro comparativo

- **Cotizaciones**: en `ComparativaDetail`, clarificar el flujo de captura de precios con un wizard de 3 pasos visibles:
  1. **Paso 1 — Capturar cotizaciones**: Procurement agrega proveedores y captura precios por ítem
  2. **Paso 2 — Enviar a Evaluación Técnica**: botón visible que cambia el estado del comparativo a `ENVIADO_EVALUACION` y notifica al Residente
  3. **Paso 3 — Recibir aprobación GT**: después de la evaluación del Residente, GT ve el comparativo evaluado y puede autorizarlo

- **Routing visual**: en ComprasView, la tarjeta de la req muestra en qué paso del comparativo está (`SIN COTIZAR → COTIZANDO → EN EVALUACIÓN → PENDIENTE GT → AUTORIZADO`)

## Capabilities

### New Capabilities

- `pre-req-gt`: Gerente Técnico puede revisar, ajustar cantidades y seleccionar partidas antes de enviar una requisición a Compras.
- `residente-seleccion-insumos`: Residente puede crear requisición seleccionando insumos individuales por tipo (material, equipo, servicio) desde el catálogo.
- `cotizacion-compras-ux`: Flujo de cotización con wizard de pasos visibles; Procurement sabe en qué paso está cada req.

### Modified Capabilities

- `take-off-gt` (InsumosView): conserva el cálculo de take-off; solo cambia la acción final.
- `requisicion-desde-apu-residente` (ResidenciaView): se amplía para soportar selección de insumos individuales además del flujo por concepto APU.

## Impact

- **Frontend exclusivamente** — tres vistas: `InsumosView.tsx`, `ResidenciaView.tsx`, `ComprasView.tsx` + componente `ComparativaDetail.tsx`
- **Sin cambios de backend**: usa los mismos endpoints existentes
- **Sin cambios de schema**: los campos ya existen (`insumo_id`, `descripcion_libre`, `es_imprevisto`, etc.)
- **Roles afectados**: `gerencia_tecnica` (InsumosView), `residencia` (ResidenciaView), `procurement` (ComprasView)
