## 1. Backend — Refactorizar convertir-oc para multi-proveedor

- [x] 1.1 En `apps/compras/src/main.ts`, en el handler `POST /comparativas/:id/convertir-oc`, reemplazar la lógica de `ganador = comparativa.detalles[0]` por: agrupar todos los detalles con `es_ganador=true` y `aprobacion_gt='APROBADO'` por `proveedor_id` en un Map `Map<proveedorId, ComparativaDetalle[]>`
- [x] 1.2 Obtener las `ComparativaLinea` del mismo cuadro dentro del mismo `createTenantContext` para tener acceso a `detalle_req_id` por `insumo_id`
- [x] 1.3 Para cada `detalle_req_id` no-null en las líneas, hacer `prisma.requisicionItem.findMany({ where: { id_item: { in: [...] } } })` y construir un Map `Map<detalle_req_id, cantidad>` para resolver cantidades reales
- [x] 1.4 Calcular `totalAgregado = suma de (precio_ofertado * cantidad)` de todos los detalles ganadores (con IVA) y hacer la verificación de suficiencia con ese único monto sobre el total del lote
- [x] 1.5 Crear cada OC en un loop por proveedor con `prisma.ordenCompra.create(...)`: usar `codigo = OC-AUTO-{timestamp}-{index}`, items con `cantidad` real (o 1 si no hay `detalle_req_id`), `precio_unitario = detalle.precio_ofertado`, `importe = cantidad * precio_unitario`
- [x] 1.6 Por cada OC creada: llamar `comprometer-fondos` en Finanzas individualmente; si falla, marcar esa OC como `ERROR_FINANZAS` y persistir `AlertaOcError` con el patrón existente, continuar con las demás
- [x] 1.7 Por cada OC creada exitosamente (EMITIDA): publicar `compras.oc_creada` (best-effort, try/catch silencioso) con payload `{ id_orden, codigo, proveedor_id, total, proyecto_id }`
- [x] 1.8 Retornar `201` con `{ success: true, data: { ordenes_compra: [...], advertencias?: [...] } }` donde `ordenes_compra` lista todas las OCs (incluyendo las con `ERROR_FINANZAS`) y `advertencias` lista los códigos con error si los hubo

## 2. Backend — Verificar tiempo_entrega en GET /comparativas/:id

- [x] 2.1 Confirmar que el spread `...d` en `detallesConCount` (línea ~1942 de `main.ts`) incluye el campo `tiempo_entrega` de `ComparativaDetalle` en la respuesta — ya debería estar por el spread; si no, agregar `tiempo_entrega: d.tiempo_entrega` explícitamente
- [x] 2.2 Verificar con curl que la respuesta de `GET /comparativas/:id` incluye `tiempo_entrega` (puede ser null) en cada objeto del array `detalles`

## 3. Frontend — Columna Tiempo en la tabla del cuadro (modo compras)

- [x] 3.1 En `ComparativaDetail.tsx`, sub-label "Precio · Tiempo" en los `<th>` por proveedor (solo `!isResidenteMode`)
- [x] 3.2 En las celdas de datos: div `texto-sky-600` con `linea.tiempos?.[prov.id] ?? '—'` debajo del subtotal, condicionado a `modo === 'compras'`
- [x] 3.3 Verificar que en modo `residente` la columna Tiempo NO aparece — garantizado por condición `modo === 'compras'`

## 4. Frontend — Resolver presupuesto_id antes de handleAutorizar

- [x] 4.1 En `ComparativaDetail.tsx`, añadir estado `presupuestoId: string | null` y `presupuestos: { id_presupuesto: string; nombre: string; monto_disponible: number }[]` + `showPresupuestoModal`
- [x] 4.2 En `handleAutorizar`, ANTES de llamar a `convertir-oc`, hacer `GET /api/v1/finanzas/presupuestos`; si retorna exactamente 1 resultado, llamar `ejecutarConvertirOc` automáticamente
- [x] 4.3 Si Finanzas retorna 0 presupuestos: `notify({ type: 'error', title: 'Sin presupuesto activo', ... })` y abortar
- [x] 4.4 Si Finanzas retorna >1 presupuesto: mostrar modal inline con lista de presupuestos (botones radio), confirmar llama `ejecutarConvertirOc(selectedPresupuestoId)`
- [x] 4.5 `ejecutarConvertirOc(presupuestoId)` pasa `{ presupuesto_id: presupuestoId }` como body en `api.post(.../convertir-oc, ...)`
- [x] 4.6 `onUpdate` usa `freshData.ordenes_compra` tras refetch — verificado: array de múltiples OCs se propaga correctamente

## 5. Deploy y verificación

- [x] 5.1 Rebuild contenedor `compras` en VPS — healthy, conectado a RabbitMQ, commit 7417a98
- [x] 5.2 Rebuild contenedor `app-shell` en VPS — build exitoso, Started
- [x] 5.3 Verificar con curl que `GET /comparativas/:id` incluye `tiempo_entrega` en los detalles
- [ ] 5.4 Verificar E2E: abrir un cuadro con estado APROBADO_GT, ejecutar "Generar OC" desde la UI y confirmar N OCs (una por proveedor)
- [ ] 5.5 Verificar logs del contenedor compras muestran N eventos `compras.oc_creada` publicados
- [x] 5.6 Verificar que botón "Recibir" aparece en OCs generadas (estado EMITIDA)
