## ADDED Requirements

### Requirement: Listar movimientos de almacén
El sistema SHALL exponer `GET /api/v1/almacen/movimientos` que retorna movimientos del proyecto activo, ordenados por `fecha` descendente. Soporta filtro por `?tipo=INGRESO|EGRESO|TRASPASO` y `?item_id=uuid`.

#### Scenario: Listado con movimientos existentes
- **WHEN** usuario autenticado hace `GET /api/v1/almacen/movimientos`
- **THEN** el sistema retorna 200 con array de movimientos incluyendo `tipo`, `cantidad`, `fecha`, `origen`, `referencia` y datos del item relacionado

#### Scenario: Filtro por tipo
- **WHEN** se envía `?tipo=EGRESO`
- **THEN** el sistema retorna solo movimientos de tipo EGRESO

### Requirement: Registrar movimiento manual (INGRESO / EGRESO / TRASPASO)
El sistema SHALL exponer `POST /api/v1/almacen/movimientos` restringido a roles `admin`, `warehouse`, `procurement`. El movimiento actualiza `stock_actual` del `ItemInventario` de forma atómica.

Tipos:
- `INGRESO`: suma `cantidad` al `stock_actual`. Si el item no existe y se proporciona `insumo_id` con datos del catálogo, se auto-crea.
- `EGRESO`: resta `cantidad`. No puede dejar `stock_actual < 0`.
- `TRASPASO`: resta en item origen, suma en item destino (mismo proyecto).

Campos requeridos: `item_id`, `tipo`, `cantidad`, `unidad`.
Campos opcionales: `origen`, `destino`, `responsable`, `referencia`.

#### Scenario: INGRESO exitoso
- **WHEN** se envía POST con `tipo: "INGRESO"`, `item_id` válido y `cantidad: 100`
- **THEN** el sistema crea el movimiento, suma 100 al `stock_actual` y retorna 201

#### Scenario: EGRESO que deja stock negativo
- **WHEN** se envía POST con `tipo: "EGRESO"` y `cantidad` mayor al `stock_actual` del item
- **THEN** el sistema retorna 422 con mensaje `"Stock insuficiente: disponible X, solicitado Y"`

#### Scenario: EGRESO que dispara alerta de stock bajo
- **WHEN** tras el EGRESO el nuevo `stock_actual` cae por debajo de `stock_minimo`
- **THEN** el sistema publica evento `almacen.stock_bajo` en RabbitMQ con `{ item_id, clave, stock_actual, stock_minimo, proyecto_id }`

#### Scenario: EGRESO que agota el stock
- **WHEN** tras el EGRESO el nuevo `stock_actual` llega a 0
- **THEN** el sistema publica evento `almacen.stock_agotado` en RabbitMQ (best-effort, no bloquea la respuesta)

#### Scenario: Rol no autorizado
- **WHEN** usuario con rol `resident` intenta registrar un movimiento manual
- **THEN** el sistema retorna 403
