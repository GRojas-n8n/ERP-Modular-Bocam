## 1. Backend — Refactorizar convertir-oc para multi-proveedor

- [ ] 1.1 En `apps/compras/src/main.ts`, en el handler `POST /comparativas/:id/convertir-oc`, reemplazar la lógica de `ganador = comparativa.detalles[0]` por: agrupar todos los detalles con `es_ganador=true` y `aprobacion_gt='APROBADO'` por `proveedor_id` en un Map `Map<proveedorId, ComparativaDetalle[]>`
- [ ] 1.2 Obtener las `ComparativaLinea` del mismo cuadro dentro del mismo `createTenantContext` para tener acceso a `detalle_req_id` por `insumo_id`
- [ ] 1.3 Para cada `detalle_req_id` no-null en las líneas, hacer `prisma.requisicionItem.findMany({ where: { id_item: { in: [...] } } })` y construir un Map `Map<detalle_req_id, cantidad>` para resolver cantidades reales
- [ ] 1.4 Calcular `totalAgregado = suma de (precio_ofertado * cantidad)` de todos los detalles ganadores (con IVA) y hacer la verificación de suficiencia con ese único monto sobre el total del lote
- [ ] 1.5 Crear cada OC en un loop por proveedor con `prisma.ordenCompra.create(...)`: usar `codigo = OC-AUTO-{timestamp}-{index}`, items con `cantidad` real (o 1 si no hay `detalle_req_id`), `precio_unitario = detalle.precio_ofertado`, `importe = cantidad * precio_unitario`
- [ ] 1.6 Por cada OC creada: llamar `comprometer-fondos` en Finanzas individualmente; si falla, marcar esa OC como `ERROR_FINANZAS` y persistir `AlertaOcError` con el patrón existente, continuar con las demás
- [ ] 1.7 Por cada OC creada exitosamente (EMITIDA): publicar `compras.oc_creada` (best-effort, try/catch silencioso) con payload `{ id_orden, codigo, proveedor_id, total, proyecto_id }`
- [ ] 1.8 Retornar `201` con `{ success: true, data: { ordenes_compra: [...], advertencias?: [...] } }` donde `ordenes_compra` lista todas las OCs (incluyendo las con `ERROR_FINANZAS`) y `advertencias` lista los códigos con error si los hubo

## 2. Backend — Verificar tiempo_entrega en GET /comparativas/:id

- [ ] 2.1 Confirmar que el spread `...d` en `detallesConCount` (línea ~1942 de `main.ts`) incluye el campo `tiempo_entrega` de `ComparativaDetalle` en la respuesta — ya debería estar por el spread; si no, agregar `tiempo_entrega: d.tiempo_entrega` explícitamente
- [ ] 2.2 Verificar con curl que la respuesta de `GET /comparativas/:id` incluye `tiempo_entrega` (puede ser null) en cada objeto del array `detalles`

## 3. Frontend — Columna Tiempo en la tabla del cuadro (modo compras)

- [ ] 3.1 En `ComparativaDetail.tsx`, localizar el bloque donde se renderizan las columnas de encabezado de la tabla por proveedor (en modo compras); agregar un `<th>` "Tiempo" justo después del `<th>` de precio, solo cuando `modo === 'compras'`
- [ ] 3.2 En las celdas de datos de la tabla, agregar la celda correspondiente con `detalle?.tiempo_entrega ?? '—'` al lado de la celda de precio, solo cuando `modo === 'compras'`
- [ ] 3.3 Verificar que en modo `residente` la columna Tiempo NO aparece

## 4. Frontend — Resolver presupuesto_id antes de handleAutorizar

- [ ] 4.1 En `ComparativaDetail.tsx`, añadir estado `presupuestoId: string | null` y `presupuestos: { id_presupuesto: string; capitulo: string; monto_disponible: number }[]`
- [ ] 4.2 En `handleAutorizar`, ANTES de llamar a `convertir-oc`, hacer `GET /api/v1/finanzas/presupuestos` (con el mismo token del request); si retorna exactamente 1 resultado, usar ese `id_presupuesto` automáticamente
- [ ] 4.3 Si Finanzas retorna 0 presupuestos (o error): mostrar `notify({ type: 'error', title: 'Sin presupuesto activo', message: 'Contacta al módulo de Finanzas para asignar un presupuesto al proyecto.' })` y abortar sin llamar a `convertir-oc`
- [ ] 4.4 Si Finanzas retorna >1 presupuesto: abrir un pequeño `SideSheet` o confirmación con un `<select>` que liste `capitulo + monto_disponible` y esperar a que el usuario elija antes de continuar
- [ ] 4.5 Pasar `{ presupuesto_id: resolvedId }` como body en `api.post(.../convertir-oc, { presupuesto_id })` en vez de `{}`
- [ ] 4.6 Actualizar el callback de `onUpdate` para que use `freshData.ordenes_compra` (ya lo hace con el refetch) — verificar que el array de múltiples OCs se propaga correctamente a `comp.ordenes_compra`

## 5. Deploy y verificación

- [ ] 5.1 Rebuild contenedor `compras` en VPS y verificar `/health`
- [ ] 5.2 Rebuild contenedor `app-shell` en VPS
- [ ] 5.3 Verificar con curl que `GET /comparativas/:id` incluye `tiempo_entrega` en los detalles
- [ ] 5.4 Verificar E2E: abrir un cuadro con estado APROBADO_GT (o simularlo en BD), ejecutar "Autorizar" desde la UI y confirmar que se generan N OCs (una por proveedor) visibles en las tarjetas de OC del cuadro comparativo
- [ ] 5.5 Verificar que los logs del contenedor compras muestran N eventos `compras.oc_creada` publicados
- [ ] 5.6 Verificar que el botón "Recibir" aparece en las OCs generadas (estado EMITIDA) y el flujo de recepción funciona normalmente
