## Why

El módulo de Almacén vive actualmente dentro del microservicio `compras` (puerto 3002) como endpoints secundarios y un tab en `ComprasView.tsx`. Esto acopla la lógica de inventario con la de compras, impide asignar roles independientes al almacenista, y hace imposible escalar o desplegar Almacén de forma autónoma. Se extrae ahora porque el crecimiento del módulo de pagos y los dashboards por rol requieren que Almacén tenga identidad propia.

## What Changes

- **Nuevo microservicio** `apps/almacen` (puerto 3012) con su propia base de datos PostgreSQL
- **Migración de schema**: modelos `ItemInventario` y `MovimientoAlmacen` se mueven de `apps/compras/prisma/schema.prisma` a `apps/almacen/prisma/schema.prisma`
- **Migración de endpoints**: `/api/v1/compras/almacen/*` → `/api/v1/almacen/*`
- **Subscriber RabbitMQ**: Almacén escucha `compras.oc_recibida_total` y `compras.oc_recibida_parcial` para registrar INGRESOs automáticamente sin intervención manual
- **Nueva vista frontend** `AlmacenView.tsx` como módulo raíz en el sidebar (mismo nivel que Compras, Finanzas, etc.)
- **BREAKING**: Eliminación del tab 'almacen' en `ComprasView.tsx` y de los endpoints `/api/v1/compras/almacen/*`
- El botón "Recibir" en OCs **permanece en Compras** — solo publica el evento; Almacén lo consume

## Capabilities

### New Capabilities

- `almacen-inventario`: Gestión de stock por proyecto — listar, crear y actualizar ítems de inventario con alertas de stock mínimo
- `almacen-movimientos`: Registro de movimientos INGRESO / EGRESO / TRASPASO con trazabilidad por OC origen
- `almacen-eventos-oc`: Subscriber RabbitMQ que escucha recepciones de OC y crea INGRESOs automáticamente en el inventario
- `almacen-dashboard`: Dashboard del módulo con KPIs de stock, alertas, recepciones esperadas y movimientos recientes
- `almacen-frontend-raiz`: Vista `AlmacenView.tsx` como módulo raíz en sidebar — reemplaza el tab dentro de ComprasView

### Modified Capabilities

- `flujo-solicitud-cotizacion`: El endpoint que actualiza stock al recibir OC cambia de `/api/v1/compras/almacen/*` a evento RabbitMQ — sin cambio de requisito, solo de implementación (no requiere delta spec)

## Impact

- **`apps/compras`**: eliminar modelos `ItemInventario` + `MovimientoAlmacen` del schema, eliminar endpoints `/api/v1/compras/almacen/*`, eliminar lógica de stock en handler de recepción (ya publica evento, Almacén lo consume)
- **`apps/almacen`**: nuevo microservicio Node.js + TypeScript + Prisma, Dockerfile, healthcheck
- **`apps/app-shell`**: nuevo `AlmacenView.tsx`, nueva entrada en sidebar, nueva ruta `/almacen`, eliminar tab 'almacen' y estados relacionados en `ComprasView.tsx`
- **`docker-compose.vps.yml`**: nuevo servicio `almacen` en puerto 3012 con su base de datos
- **Caddy / proxy**: nueva ruta `/api/v1/almacen/*` → `almacen:3012`
- **RabbitMQ**: Almacén se suscribe a topic exchange `bocam.events`, binding key `compras.oc_recibida_*`
