# Spec: multi-oc-generacion

## Requirements

### Requirement: Conversión de cuadro APROBADO_GT en OCs agrupadas por proveedor
Cuando un cuadro comparativo tiene estado `APROBADO_GT`, el endpoint `POST /comparativas/:id/convertir-oc` SHALL agrupar todos los `ComparativaDetalle` con `es_ganador=true` y `aprobacion_gt=APROBADO` por `proveedor_id`, y crear exactamente una `OrdenCompra` por cada grupo. Cada OC SHALL contener como items todos los renglones ganadores de ese proveedor con cantidades reales y precios unitarios correctos.

#### Scenario: Cuadro con todos los renglones al mismo proveedor
- **WHEN** el GT aprueba todos los renglones a Proveedor A y se ejecuta `convertir-oc`
- **THEN** el sistema crea exactamente 1 OC con todos los renglones como items

#### Scenario: Cuadro con renglones repartidos entre dos proveedores
- **WHEN** el GT asigna 3 renglones a Proveedor A y 2 a Proveedor B y se ejecuta `convertir-oc`
- **THEN** el sistema crea 2 OCs: una para Proveedor A con 3 items y otra para Proveedor B con 2 items

#### Scenario: Cantidad de ítem tomada de la requisición
- **WHEN** un renglón ganador tiene `detalle_req_id` vinculado a un `RequisicionItem`
- **THEN** el ítem de la OC usa `cantidad = RequisicionItem.cantidad` y `precio_unitario = ComparativaDetalle.precio_ofertado`

#### Scenario: Fallback de cantidad cuando no hay detalle_req_id
- **WHEN** un renglón ganador tiene `detalle_req_id = null` (cuadro anterior a la migración)
- **THEN** el ítem de la OC usa `cantidad = 1` como fallback sin error

### Requirement: Suficiencia financiera sobre el total agregado del lote
El sistema SHALL calcular el total agregado de TODAS las OCs a crear (suma de subtotales), verificar suficiencia financiera una sola vez con ese monto, y solo si hay suficiencia proceder a crear y comprometer fondos para cada OC individualmente.

#### Scenario: Fondos suficientes para el lote completo
- **WHEN** el total de todas las OCs a generar es menor o igual al disponible en Finanzas
- **THEN** el sistema crea todas las OCs y registra el compromiso de fondos para cada una

#### Scenario: Fondos insuficientes
- **WHEN** el total agrupado supera el disponible en Finanzas
- **THEN** el sistema retorna `422` con mensaje `PRESUPUESTO_INSUFICIENTE` sin crear ninguna OC

#### Scenario: Error al comprometer fondos para una OC individual
- **WHEN** la suficiencia pasó pero `comprometer-fondos` falla para una OC del lote
- **THEN** esa OC queda en estado `ERROR_FINANZAS` con alerta persistida, las demás OCs del lote quedan en `EMITIDA`, y la respuesta informa cuáles OCs tuvieron error

### Requirement: Código único por OC en el lote
Cada OC generada dentro del mismo lote SHALL tener un código único con formato `OC-AUTO-{timestamp}-{N}` donde N es el índice secuencial (1, 2, …) dentro del lote.

#### Scenario: Lote de 2 OCs
- **WHEN** se generan 2 OCs en el mismo lote con timestamp `1718000000000`
- **THEN** sus códigos son `OC-AUTO-1718000000000-1` y `OC-AUTO-1718000000000-2`

### Requirement: Evento compras.oc_creada por cada OC generada
El sistema SHALL publicar el evento `compras.oc_creada` (best-effort, con try/catch silencioso) por cada OC exitosamente creada en el lote.

#### Scenario: Publicación por OC individual
- **WHEN** se crean 3 OCs de un lote y el EventBus está disponible
- **THEN** se publican 3 eventos `compras.oc_creada`, uno por OC, cada uno con el `id_orden` y `codigo` correspondiente

#### Scenario: EventBus offline
- **WHEN** el EventBus no está disponible al crear las OCs
- **THEN** las OCs se crean correctamente y el error del bus se silencia (degradación elegante)

### Requirement: Respuesta incluye todas las OCs generadas
El endpoint `convertir-oc` SHALL retornar `201` con un array `ordenes_compra` que lista todas las OCs creadas (incluyendo las que están en `ERROR_FINANZAS`), junto al estado de cada una.

#### Scenario: Respuesta exitosa de lote completo
- **WHEN** todas las OCs del lote se crean y comprometen correctamente
- **THEN** la respuesta es `{ success: true, data: { ordenes_compra: [{ id_orden, codigo, estado, proveedor_id, total }] } }`

#### Scenario: Respuesta con OC en error
- **WHEN** al menos una OC del lote tiene `ERROR_FINANZAS`
- **THEN** la respuesta es `{ success: true, data: { ordenes_compra: [...], advertencias: ["OC-AUTO-...-2 quedó en ERROR_FINANZAS"] } }`


### Requirement: La Requisición SHALL transicionar a COMPRADA cuando el lote de OCs cubre todos sus renglones
El sistema SHALL actualizar `Requisicion.estado` a `COMPRADA` cuando, al
ejecutar `convertir-oc` sobre un cuadro comparativo, todos los renglones de
la `Requisicion` de origen quedaron cubiertos por las OCs generadas
exitosamente en el lote (ninguno quedó sin ganador asignado o en
`ERROR_FINANZAS`).

#### Scenario: Todos los renglones cubiertos por el lote generado
- **WHEN** `convertir-oc` genera exitosamente OCs que cubren el 100% de los
  renglones de la requisición de origen
- **THEN** `Requisicion.estado` pasa a `COMPRADA`

#### Scenario: Alguna OC del lote queda en ERROR_FINANZAS
- **WHEN** `convertir-oc` genera el lote pero al menos una OC queda en
  `ERROR_FINANZAS` (renglones de esa OC no confirmados)
- **THEN** `Requisicion.estado` NO se actualiza a `COMPRADA` — permanece en su
  estado previo hasta que se resuelva el error financiero y se reintente

#### Scenario: Requisición sin vínculo directo a un renglón de la comparativa
- **WHEN** un renglón ganador no tiene `detalle_req_id` (cuadro anterior a la
  migración, ver capability `multi-oc-generacion` existente) y por tanto no
  es posible determinar cobertura por renglón
- **THEN** el sistema no falla la conversión de OC por esta causa; la
  actualización de `Requisicion.estado` se omite de forma segura para esa
  requisición (queda en su estado previo) en vez de marcarla `COMPRADA` con
  cobertura incierta
