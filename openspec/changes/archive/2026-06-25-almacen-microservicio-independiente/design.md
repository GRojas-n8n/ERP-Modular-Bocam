## Context

El módulo de Almacén existe hoy como endpoints secundarios dentro de `apps/compras` (puerto 3002) y un tab en `ComprasView.tsx`. Los modelos `ItemInventario` y `MovimientoAlmacen` comparten la base de datos de Compras. Esto impide: (1) asignar un rol `almacen`/`warehouse` con acceso solo a su módulo, (2) desplegar o escalar Almacén independientemente, (3) tener un dashboard propio. La recepción de OCs ya publica `compras.oc_recibida_total` vía RabbitMQ — el subscriber es lo único nuevo en el backend.

Estado actual de puertos asignados: 3001=GT, 3002=compras, 3003=auth, 3004=finanzas, 3005=control-obra, 3006–3008=otros servicios, 3009=asistente, 3010=reportes, 3011=personal. Puerto 3012 disponible para Almacén.

## Goals / Non-Goals

**Goals:**
- Microservicio `apps/almacen` autónomo en puerto 3012 con BD PostgreSQL propia
- Endpoints `/api/v1/almacen/inventario` y `/api/v1/almacen/movimientos` funcionalmente equivalentes a los actuales de Compras
- Subscriber RabbitMQ que convierte recepciones de OC en INGRESOs de inventario automáticamente
- `AlmacenView.tsx` como módulo raíz en sidebar — con dashboard propio
- Eliminar tab Almacén de ComprasView y endpoints `/api/v1/compras/almacen/*` de Compras

**Non-Goals:**
- Migración de datos históricos del ambiente de producción (tablas son nuevas en nueva BD; si hay datos en prod, migración manual fuera del scope)
- Módulo de despacho/salida con firma de residente (futura iteración)
- Integración con sistemas externos de inventario (SAP, etc.)
- Conteo físico / toma de inventario (futura iteración)

## Decisions

### D1: BD propia vs. compartida con Compras
**Decisión:** BD PostgreSQL independiente para Almacén.
**Razón:** Alineado con el principio de iRetum (una BD por microservicio, sin JOINs cruzados). Permite escalar Almacén sin afectar Compras. El acoplamiento actual es el problema a resolver.
**Alternativa descartada:** Shared DB — resuelve lo frontend pero mantiene el acoplamiento de datos.

### D2: Sincronización de stock al recibir OC
**Decisión:** Almacén subscribe a `compras.oc_recibida_total` y `compras.oc_recibida_parcial` via RabbitMQ. El handler crea un `MovimientoAlmacen` de tipo INGRESO y actualiza `ItemInventario.stock_actual`.
**Razón:** Compras ya publica esos eventos — costo de implementación mínimo. Desacopla servicios correctamente. Si Almacén está caído, los eventos se encolan y se procesan al reiniciar.
**Alternativa descartada:** Llamada HTTP directa de Compras a Almacén al recibir — crea dependencia sincrónica; si Almacén está caído, la recepción falla.

### D3: Auto-creación de ItemInventario en primer INGRESO
**Decisión:** Si el `insumo_id` del evento no tiene `ItemInventario` en la BD de Almacén, se crea automáticamente usando los datos del payload del evento (`clave`, `descripcion`, `unidad`, `categoria`).
**Razón:** Evita requerir carga manual previa de catálogo en Almacén. El catálogo canónico de insumos vive en Compras; Almacén lo proyecta bajo demanda vía eventos.

### D4: Estructura del microservicio
**Decisión:** Copiar la estructura de `apps/compras` como plantilla — mismo package.json base, mismos middleware patterns (`createTenantContext`, `requireRoles`, `auth-middleware`), mismo Dockerfile pattern.
**Razón:** Consistencia con el resto de la plataforma. Reduce curva de aprendizaje y riesgo de errores de configuración.

### D5: Frontend — AlmacenView como módulo raíz
**Decisión:** Nueva ruta `/almacen` en el app-shell. El sidebar muestra Almacén al mismo nivel que Compras. El rol que puede ver Almacén es `warehouse` (nuevo) o `admin`/`procurement` (acceso ampliado).
**Razón:** El almacenista no es el mismo usuario que el comprador. Tener módulo raíz permite control de acceso por rol independiente.

## Risks / Trade-offs

- **[Riesgo] Datos en producción** → Si hay registros en `inventario_almacen` y `movimientos_almacen` en la BD de Compras, se pierden al eliminar esos modelos. **Mitigación:** Verificar con `SELECT COUNT(*)` en prod antes de eliminar; si hay datos, exportar e importar a nueva BD antes del deploy.
- **[Riesgo] Evento con payload incompleto** → Si `compras.oc_recibida_*` no incluye `clave`/`descripcion` del insumo, la auto-creación de `ItemInventario` fallará. **Mitigación:** Revisar payload actual del evento y enriquecerlo si necesario antes de implementar subscriber.
- **[Riesgo] Ventana de inconsistencia** → Entre el momento en que se elimina el endpoint `/api/v1/compras/almacen/*` y el deploy del nuevo servicio, el frontend puede fallar. **Mitigación:** Deploy atómico — buildear y levantar `almacen` antes de desplegar el `app-shell` sin el tab de Almacén en Compras.
- **[Trade-off] Duplicación temporal de código** → Algunos utilitarios de Compras se copian a Almacén. Aceptable — la alternativa (shared lib) agrega complejidad que el proyecto no necesita ahora.

## Migration Plan

1. **Verificar datos en prod**: `docker exec bocam-vps-postgres psql -U bocam -c "SELECT COUNT(*) FROM inventario_almacen; SELECT COUNT(*) FROM movimientos_almacen;"`
2. **Implementar y buildear** `apps/almacen` localmente — tests passing
3. **Agregar a docker-compose.vps.yml** el servicio `almacen` con su BD
4. **Deploy en VPS**: `git pull && docker compose build almacen && docker compose up -d almacen`
5. **Verificar healthcheck** del nuevo servicio: `GET /health`
6. **Actualizar app-shell** con `AlmacenView.tsx` + ruta + sidebar + remover tab Compras
7. **Deploy app-shell**: `docker compose build app-shell && docker compose up -d app-shell`
8. **Verificar E2E** en producción: inventario visible en `/almacen`, recibir OC → aparece INGRESO en Almacén
9. **Eliminar endpoints** `/api/v1/compras/almacen/*` y modelos de `apps/compras/prisma/schema.prisma`
10. **Rebuild compras**: `docker compose build compras && docker compose up -d compras`

**Rollback:** Si el paso 9–10 falla, los endpoints de Compras siguen en prod hasta que Almacén esté estable.

## Open Questions

- ¿Qué rol de usuario accede a Almacén? ¿Existe `warehouse` en la tabla de roles o se reutiliza `procurement`? → Confirmar con admin antes de implementar RBAC del módulo.
- ¿El payload de `compras.oc_recibida_total` incluye `clave`, `descripcion`, `unidad`, `categoria` del insumo? → Verificar en `apps/compras/src/main.ts` línea ~1320 antes de implementar subscriber.
