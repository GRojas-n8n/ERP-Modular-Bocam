## ADDED Requirements

### Requirement: Listar inventario del proyecto
El sistema SHALL exponer `GET /api/v1/almacen/inventario` que retorna todos los `ItemInventario` del proyecto activo del tenant autenticado, incluyendo `stock_actual`, `stock_minimo`, `ubicacion` y flag `bajo_minimo` calculado.

#### Scenario: Listado exitoso con items
- **WHEN** usuario autenticado hace `GET /api/v1/almacen/inventario`
- **THEN** el sistema retorna 200 con array de items, cada uno con `stock_actual`, `stock_minimo`, `bajo_minimo: boolean` y `agotado: boolean`

#### Scenario: Proyecto sin inventario
- **WHEN** no existen `ItemInventario` para el proyecto activo
- **THEN** el sistema retorna 200 con `data: []`

#### Scenario: Filtro de búsqueda por texto
- **WHEN** se envía query param `?q=varilla`
- **THEN** el sistema retorna solo items cuya `clave` o `descripcion` contienen el texto (case-insensitive)

### Requirement: Crear ítem de inventario manualmente
El sistema SHALL exponer `POST /api/v1/almacen/inventario` restringido a roles `admin`, `procurement`, `warehouse`. Permite pre-cargar el catálogo antes del primer INGRESO por OC.

Campos requeridos: `clave`, `descripcion`, `unidad`, `categoria`.
Campos opcionales: `stock_actual` (default 0), `stock_minimo` (default 0), `ubicacion`, `insumo_id`.

#### Scenario: Creación exitosa
- **WHEN** usuario con rol autorizado envía POST con campos requeridos
- **THEN** el sistema crea el `ItemInventario` y retorna 201 con el objeto creado

#### Scenario: Clave duplicada en el proyecto
- **WHEN** ya existe un `ItemInventario` con la misma `clave` en el mismo `proyecto_id`
- **THEN** el sistema retorna 409 con mensaje de error descriptivo

#### Scenario: Rol no autorizado
- **WHEN** usuario con rol `resident` intenta crear un ítem
- **THEN** el sistema retorna 403

### Requirement: Actualizar stock mínimo y ubicación
El sistema SHALL exponer `PATCH /api/v1/almacen/inventario/:id` para actualizar `stock_minimo` y/o `ubicacion`. El `stock_actual` NO es editable directamente — solo cambia vía movimientos.

#### Scenario: Actualización de stock mínimo
- **WHEN** se envía PATCH con `{ "stock_minimo": 50 }`
- **THEN** el sistema actualiza el campo y retorna 200 con el item actualizado

#### Scenario: Intento de editar stock_actual directamente
- **WHEN** se envía PATCH con `{ "stock_actual": 100 }`
- **THEN** el sistema ignora el campo `stock_actual` y no lo modifica
