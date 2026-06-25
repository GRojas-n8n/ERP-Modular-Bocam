## Context

El endpoint `POST /comparativas/:id/convertir-oc` existe desde la primera versión del módulo de compras pero fue implementado con una lógica simplificada: toma solo el primer `ComparativaDetalle` con `es_ganador=true` y crea una única OC con un solo ítem de `cantidad=1`. El flujo completo requiere que el GT distribuya renglones entre N proveedores — esto ya está modelado en BD (`es_ganador` por detalle) pero la conversión lo ignora.

**Estructura relevante en BD:**
- `ComparativaLinea` (por cuadro, por insumo): guarda `insumo_id`, `detalle_req_id` → referencia a `RequisicionItem` para obtener `cantidad`.
- `ComparativaDetalle` (por cuadro, por insumo, por proveedor): guarda `precio_ofertado`, `tiempo_entrega`, `es_ganador`, `aprobacion_gt`.
- `OrdenCompra` + `OrdeneCompraItem`: la OC destino; `cantidad` debe venir de `RequisicionItem.cantidad`, `precio_unitario` de `ComparativaDetalle.precio_ofertado`.

**Campo `tiempo_entrega`**: ya está en `ComparativaDetalle`, ya se propaga vía el spread `...d` en `detallesConCount` del GET `/comparativas/:id`. El frontend simplemente no lo renderiza.

**Campo `presupuesto_id`**: no existe en `Requisicion`. La OC lo necesita para que Finanzas pueda registrar el compromiso de fondos. Debe obtenerse desde el módulo Finanzas antes de ejecutar la conversión.

## Goals / Non-Goals

**Goals:**
- `convertir-oc` agrupa detalles ganadores por proveedor y crea una OC por proveedor con todos sus renglones y cantidades reales.
- `GET /comparativas/:id` expone `tiempo_entrega` en el array `detalles` (ya presente, solo documentar que se usa).
- `ComparativaDetail.tsx` muestra columna "Tiempo" en modo GT.
- `handleAutorizar` resuelve `presupuesto_id` llamando a Finanzas antes de lanzar la conversión.
- Evento `compras.oc_creada` se publica por cada OC generada (best-effort, ya existe el patrón).

**Non-Goals:**
- No se cambia el schema de BD (sin migraciones Prisma).
- No se implementa la lógica de selección de partidas por WBS (ya existe `concepto_id` en req items).
- No se modifica el flujo de aprobación financiera (suficiencia + compromiso de fondos) más allá de hacerlo funcionar correctamente con N OCs.

## Decisions

**D1 — Cantidad en OC items: leer de `RequisicionItem` vía `detalle_req_id`**

`ComparativaLinea` no almacena la cantidad — referencia al `RequisicionItem` via `detalle_req_id`. La conversión debe hacer un JOIN: para cada detalle ganador de un proveedor, buscar la `ComparativaLinea` del mismo `cuadro_id` e `insumo_id`, tomar su `detalle_req_id`, y leer `RequisicionItem.cantidad`. Si `detalle_req_id` es null (cuadros anteriores a la migración), usar `cantidad=1` como fallback.

**D2 — Suficiencia financiera: una sola llamada sobre el total agregado**

En vez de llamar a Finanzas N veces (una por proveedor), sumar todos los subtotales agrupados y hacer una sola verificación de suficiencia. Si el total agrega fondos suficientes, crear todas las OCs en secuencia. Si algún `comprometer-fondos` falla, marcar esa OC como `ERROR_FINANZAS` y continuar con las demás (mismo patrón existente de alerta).

**D3 — `presupuesto_id`: obtener de Finanzas antes del dialog de autorización**

Al abrir el dialog "Autorizar" en el frontend, llamar `GET /api/v1/finanzas/presupuestos` para obtener los presupuestos activos del proyecto. Si hay exactamente uno, usarlo automáticamente. Si hay varios, mostrar un select. Si no hay ninguno, bloquear con mensaje "No hay presupuesto activo para este proyecto".

Alternativa descartada: hardcodear o inferir del concepto WBS — requiere conocimiento del módulo GT y añade complejidad innecesaria.

**D4 — Código de OC: incluir sufijo de proveedor para distinguirlas**

Formato: `OC-AUTO-{timestamp}-{N}` donde N es el índice (1, 2, 3…) dentro del lote generado desde el mismo cuadro. Esto permite que varias OCs del mismo cuadro sean trazables y tengan códigos distintos.

**D5 — `tiempo_entrega` en frontend: columna solo en modo `compras`**

El residente NO debe ver precios ni tiempos de entrega (invariante del sistema). La columna "Tiempo" se muestra únicamente cuando `modo === 'compras'`, junto a las columnas de precio. No requiere cambio en el backend — el campo ya viaja en el response.

## Risks / Trade-offs

- [Riesgo] `detalle_req_id` puede ser null en comparativas creadas antes de la migración → Mitigation: fallback a `cantidad=1`, misma lógica que hoy, no hay regresión.
- [Riesgo] Finanzas crea compromiso para OC-1 pero falla para OC-2 del mismo lote → Mitigation: cada OC va a `ERROR_FINANZAS` individualmente; ya existe la tabla `AlertaOcError` y el endpoint de reconciliación para resolverlas manualmente.
- [Riesgo] El endpoint de presupuestos en Finanzas puede no existir o tener una firma diferente → Mitigation: verificar contra el código del módulo finanzas antes de implementar; si no existe, añadir el endpoint mínimo.

## Migration Plan

1. Refactorizar `convertir-oc` en `main.ts` (sin migración BD).
2. Agregar columna Tiempo en `ComparativaDetail.tsx`.
3. Agregar resolución de presupuesto en `handleAutorizar`.
4. Verificar el endpoint de presupuestos en Finanzas; añadirlo si no existe.
5. Deploy normal: rebuild `compras` + `app-shell`. Sin downtime — los datos existentes no se afectan.

**Rollback:** revertir los 2-3 commits en cuestión. No hay migración de BD que revertir.
