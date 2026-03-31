# Hito 9: E2E de flujo completo y diagnostico de infraestructura local

Fecha: 2026-03-18

## Objetivo

Extender la cobertura E2E desde reconciliacion puntual hacia el flujo primario de negocio en:

- `Compras`: comparativa ganadora -> OC emitida -> cancelacion de OC
- `Control de Obra`: avances validados -> estimacion -> aprobacion financiera

## Cambios implementados

### 1. E2E ampliadas en Compras

Archivo:

- `apps/compras/test/e2e/reconciliacion.e2e.test.ts`

Cobertura nueva agregada:

- flujo `comparativa -> OC emitida`
- flujo `OC emitida -> cancelada`

Validaciones funcionales incluidas en el script:

- `GET /api/v1/finanzas/suficiencia`
- `POST /api/v1/finanzas/comprometer-fondos`
- `POST /api/v1/finanzas/liberar-fondos`
- cambio de estado de comparativa a `CERRADO`
- persistencia de la OC en `EMITIDA` y luego `CANCELADA`

Soporte de datos:

- seed de proveedor
- seed de cuadro comparativo con detalle ganador
- limpieza completa de `comparativas_detalles`, `cuadros_comparativos`, `ordenes_compra_items`, `ordenes_compra` y `proveedores`

### 2. E2E ampliadas en Control de Obra

Archivo:

- `apps/control-obra/test/e2e/reconciliacion.e2e.test.ts`

Cobertura nueva agregada:

- flujo `avances validados -> estimacion BORRADOR`
- flujo `estimacion BORRADOR -> APROBADA_FINANCIERA`

Validaciones funcionales incluidas en el script:

- creacion de estimacion desde avances `VALIDADO`
- aprobacion por `PATCH /api/v1/control-obra/estimaciones/:id/aprobar`
- llamada HTTP a `POST /api/v1/finanzas/pagos`
- persistencia de la estimacion en `APROBADA_FINANCIERA`
- vinculacion de avances a la estimacion creada

Soporte de datos:

- seed de avances validados
- limpieza completa de `avances_fisicos`, `estimaciones` y `bitacoras_obra`

## Validacion tecnica realizada

Compilacion:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`

Resultado:

- ambas compilaciones pasan

## Bloqueo de entorno encontrado

Las nuevas E2E no pudieron ejecutarse completamente hoy por una causa externa al codigo:

- PostgreSQL no esta escuchando en `localhost:5432`
- `Test-NetConnection localhost -Port 5432` fallo
- `docker compose up -d postgres` no pudo arrancar porque el daemon de Docker no estaba disponible
- el servicio `com.docker.service` existe pero estaba `Stopped`
- no fue posible iniciarlo desde esta sesion por restricciones del entorno host

Impacto:

- el codigo de pruebas quedo montado y compilando
- la validacion runtime de flujo completo queda pendiente hasta restablecer PostgreSQL local

## Estado resultante

Quedo listo el siguiente tramo de madurez del SaaS:

- ya existe cobertura E2E para reconciliacion
- ya existe codigo E2E para flujo feliz primario en Compras y Control de Obra
- el siguiente paso operativo es levantar PostgreSQL local y rerun:

```bash
npm run test:e2e:reconciliacion -w @bocam/compras
npm run test:e2e:reconciliacion -w @bocam/control-obra
npm run test:e2e:reconciliacion
```

## Recomendacion inmediata

Antes de seguir endureciendo sagas o RBAC, conviene restablecer el stack base local:

1. Iniciar Docker Desktop o un PostgreSQL local equivalente en `5432`
2. Confirmar conectividad de BD
3. Reejecutar las E2E completas
4. Crear el siguiente checkpoint solo si ambos flujos pasan en runtime
