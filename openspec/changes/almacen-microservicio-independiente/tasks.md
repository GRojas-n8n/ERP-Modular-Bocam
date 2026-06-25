## 1. Scaffold del microservicio apps/almacen

- [ ] 1.1 Crear directorio `apps/almacen/` con estructura base: `src/main.ts`, `package.json`, `tsconfig.json`, `prisma/schema.prisma`
- [ ] 1.2 Copiar `package.json` de `apps/compras` como base y ajustar `name: "@bocam/almacen"`, `PORT=3012`; instalar dependencias con `npm install -w almacen`
- [ ] 1.3 Crear `apps/almacen/prisma/schema.prisma` con modelos `ItemInventario` y `MovimientoAlmacen` (copiar de `apps/compras/prisma/schema.prisma` y adaptar `datasource` a variable `ALMACEN_DATABASE_URL`)
- [ ] 1.4 Crear `apps/almacen/docker/Dockerfile.almacen` copiando el patrón de `docker/Dockerfile.compras` y ajustando `APP_PATH=apps/almacen` y `WORKSPACE_NAME=@bocam/almacen`

## 2. Backend — Endpoints REST del microservicio

- [ ] 2.1 En `apps/almacen/src/main.ts`, implementar el servidor Express con middleware `auth-middleware`, `createTenantContext`, y healthcheck `GET /health → { status: "ok", service: "almacen" }`
- [ ] 2.2 Implementar `GET /api/v1/almacen/inventario` — lista `ItemInventario` del proyecto activo con filtro opcional `?q=texto`, añadiendo campos calculados `bajo_minimo` y `agotado`
- [ ] 2.3 Implementar `POST /api/v1/almacen/inventario` — crea `ItemInventario`; requiere roles `admin|warehouse|procurement`; retorna 409 si `clave` duplicada en mismo `proyecto_id`
- [ ] 2.4 Implementar `PATCH /api/v1/almacen/inventario/:id` — actualiza solo `stock_minimo` y/o `ubicacion`; ignora cualquier `stock_actual` en el body
- [ ] 2.5 Implementar `GET /api/v1/almacen/movimientos` — lista `MovimientoAlmacen` del proyecto ordenados por `fecha DESC`, con filtros `?tipo=` y `?item_id=`
- [ ] 2.6 Implementar `POST /api/v1/almacen/movimientos` — registra INGRESO/EGRESO/TRASPASO; actualiza `stock_actual` de forma atómica en la misma transacción Prisma; retorna 422 si EGRESO deja stock negativo; publica `almacen.stock_bajo` o `almacen.stock_agotado` (best-effort) si corresponde
- [ ] 2.7 Implementar `GET /api/v1/almacen/dashboard` — retorna KPIs agregados: `total_items`, `items_bajo_minimo`, `items_agotados`, `movimientos_hoy`, `alertas[]` (primeros 5 items bajo mínimo)

## 3. Backend — Subscriber RabbitMQ

- [ ] 3.1 Verificar en `apps/compras/src/main.ts` línea ~1320 que el payload de `compras.oc_recibida_total` incluye `items[]` con `insumo_id`, `clave`, `descripcion`, `unidad`, `categoria`, `cantidad_recibida`; si faltan campos, enriquecer el evento en Compras primero
- [ ] 3.2 Implementar subscriber en `apps/almacen/src/main.ts` que se conecta a RabbitMQ topic exchange `bocam.events` con binding key `compras.oc_recibida_*` al arrancar el servicio
- [ ] 3.3 Implementar handler de `compras.oc_recibida_total`: por cada item del payload, buscar o auto-crear `ItemInventario` (usando `insumo_id` como FK), luego crear `MovimientoAlmacen` tipo INGRESO con `referencia = orden_compra_id` y `origen = "OC"`
- [ ] 3.4 Implementar idempotencia: antes de crear el INGRESO verificar que no existe ya un `MovimientoAlmacen` con `referencia = orden_compra_id` y `tipo = INGRESO` para el mismo item — si existe, hacer ack sin duplicar
- [ ] 3.5 Implementar handler de `compras.oc_recibida_parcial` con el mismo patrón usando `cantidad_recibida_parcial` del payload
- [ ] 3.6 En caso de excepción en el handler: no hacer ack (RabbitMQ reencola); registrar error en log con payload completo

## 4. Infraestructura — Docker y proxy

- [ ] 4.1 En `docker-compose.vps.yml`, agregar servicio `almacen` con `PORT: 3012`, `ALMACEN_DATABASE_URL` apuntando a la BD de Postgres, dependencias en `postgres` y `rabbitmq`, healthcheck `wget -qO- http://127.0.0.1:3012/health`
- [ ] 4.2 En `docker-compose.vps.yml`, agregar la base de datos `almacen_db` en el servicio Postgres (nueva database en el mismo cluster) o configurar `DATABASE_URL` apuntando a la misma instancia Postgres con schema separado
- [ ] 4.3 En el archivo de configuración de Caddy (`docker/Caddyfile` o equivalente), agregar la ruta `handle /api/v1/almacen/* { reverse_proxy almacen:3012 }` antes del bloque catch-all
- [ ] 4.4 Agregar `almacen` al workspace de npm en el `package.json` raíz del monorepo

## 5. Frontend — AlmacenView y sidebar

- [ ] 5.1 Crear `apps/app-shell/src/views/AlmacenView.tsx` con estructura base: imports, interfaces `ItemInventario` y `MovimientoAlmacen`, estado inicial, `useEffect` para fetch de dashboard + inventario + movimientos desde `/api/v1/almacen/*`
- [ ] 5.2 Implementar el dashboard de entrada en `AlmacenView`: 4 KPI cards (Total items, Bajo mínimo, Agotados, Movimientos hoy), sección de alertas con items bajo mínimo, tabla de últimos movimientos del día
- [ ] 5.3 Implementar tab "Inventario" en `AlmacenView`: tabla con columnas Clave, Descripción, Unidad, Stock Actual, Stock Mínimo, Ubicación, Estado (badge Disponible/Bajo mínimo/Agotado); búsqueda por texto
- [ ] 5.4 Implementar tab "Movimientos" en `AlmacenView`: tabla con columnas Fecha, Tipo (badge INGRESO/EGRESO/TRASPASO), Item, Cantidad, Origen, Referencia; filtro por tipo
- [ ] 5.5 En el componente de sidebar del app-shell, agregar entrada "Almacén" con ícono `IconPackage` (o equivalente) visible para roles `warehouse`, `procurement`, `admin`; añadir ruta `/almacen → AlmacenView` en el router

## 6. Limpieza — Eliminar Almacén de Compras

- [ ] 6.1 En `apps/compras/src/main.ts`, eliminar los 3 endpoints bajo el comentario `// ── Almacén ──`: `GET /almacen/inventario`, `POST /almacen/inventario`, `GET /almacen/movimientos`, `POST /almacen/movimientos`
- [ ] 6.2 En `apps/compras/prisma/schema.prisma`, eliminar los modelos `ItemInventario` y `MovimientoAlmacen` (y sus tablas `inventario_almacen`, `movimientos_almacen`)
- [ ] 6.3 En `apps/app-shell/src/views/ComprasView.tsx`, eliminar el tab `'almacen'` del type `TabId`, todos los estados relacionados (`inventario`, `movimientosAlmacen`, `almacenSubView`, `almacenFilter`, `inventarioSearch`), los handlers de almacén, y el bloque JSX del tab Almacén
- [ ] 6.4 Eliminar las interfaces `ItemInventario` y `MovimientoAlmacen` de `ComprasView.tsx` y cualquier import de datos demo relacionado (`DEMO_INVENTARIO`, `DEMO_MOVIMIENTOS_ALMACEN`)
- [ ] 6.5 Verificar que `stockMap` en la función de trazabilidad de Compras (línea ~778) siga funcionando — si usa los modelos eliminados, refactorizar para consultar `/api/v1/almacen/inventario` por HTTP o remover esa métrica de trazabilidad

## 7. Verificación E2E

- [ ] 7.1 Verificar en producción: `GET https://iretum.com/api/v1/almacen/inventario` retorna 200
- [ ] 7.2 Verificar: `GET https://iretum.com/api/v1/almacen/dashboard` retorna KPIs correctos
- [ ] 7.3 Verificar: Recibir una OC en Compras → el INGRESO aparece automáticamente en `/api/v1/almacen/movimientos`
- [ ] 7.4 Verificar UI: `/almacen` en producción muestra dashboard con KPIs, tab Inventario y tab Movimientos
- [ ] 7.5 Verificar UI: el sidebar ya NO muestra Almacén dentro de Compras (tab eliminado)
- [ ] 7.6 Verificar: `GET https://iretum.com/api/v1/compras/almacen/inventario` retorna 404 (endpoint eliminado)
