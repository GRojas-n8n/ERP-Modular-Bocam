## ADDED Requirements

### Requirement: Módulo Almacén en sidebar raíz
El sidebar del app-shell SHALL mostrar "Almacén" como entrada de primer nivel, al mismo nivel que Compras, Finanzas y Gerencia Técnica. Solo visible para usuarios con rol `warehouse`, `procurement` o `admin`.

#### Scenario: Sidebar con rol warehouse
- **WHEN** usuario con rol `warehouse` inicia sesión
- **THEN** el sidebar muestra la entrada "Almacén" con ícono de caja/paquete

#### Scenario: Sidebar con rol compras sin warehouse
- **WHEN** usuario con rol `procurement` inicia sesión
- **THEN** el sidebar también muestra "Almacén" (procurement necesita ver stock)

#### Scenario: Sidebar con rol residente
- **WHEN** usuario con rol `resident` inicia sesión
- **THEN** el sidebar NO muestra la entrada "Almacén"

### Requirement: Ruta /almacen y AlmacenView
El app-shell SHALL registrar la ruta `/almacen` que renderiza `AlmacenView.tsx`. La vista contiene el dashboard (pantalla inicial) y dos tabs: "Inventario" y "Movimientos".

#### Scenario: Navegación a /almacen
- **WHEN** usuario hace clic en "Almacén" en el sidebar
- **THEN** la URL cambia a `/almacen` y se renderiza `AlmacenView` con el dashboard visible

#### Scenario: Tab Inventario
- **WHEN** usuario hace clic en tab "Inventario"
- **THEN** se muestra la tabla de items con columnas: Clave, Descripción, Unidad, Stock Actual, Stock Mínimo, Ubicación, Estado (Disponible/Bajo mínimo/Agotado)

#### Scenario: Tab Movimientos
- **WHEN** usuario hace clic en tab "Movimientos"
- **THEN** se muestra la tabla de movimientos con columnas: Fecha, Tipo, Item, Cantidad, Origen/Destino, Referencia

### Requirement: Eliminar tab Almacén de ComprasView
El tab 'almacen' y todos sus estados/handlers relacionados SHALL ser eliminados de `ComprasView.tsx`. Los endpoints `/api/v1/compras/almacen/*` SHALL ser eliminados del microservicio `apps/compras`.

#### Scenario: ComprasView sin tab Almacén
- **WHEN** usuario con rol compras navega a `/compras`
- **THEN** los tabs disponibles son: Requisiciones, Catálogo, Proveedores, Trazabilidad (sin Almacén)

#### Scenario: Endpoint eliminado de Compras
- **WHEN** cualquier cliente hace `GET /api/v1/compras/almacen/inventario`
- **THEN** el servidor retorna 404 (endpoint no existe en Compras)

### Requirement: Proxy Caddy para nuevo microservicio
El archivo de configuración de Caddy SHALL incluir la ruta `/api/v1/almacen/*` apuntando al servicio `almacen:3012`.

#### Scenario: Request a almacén en producción
- **WHEN** el frontend hace `GET https://iretum.com/api/v1/almacen/inventario`
- **THEN** Caddy enruta la request al contenedor `almacen` en puerto 3012
