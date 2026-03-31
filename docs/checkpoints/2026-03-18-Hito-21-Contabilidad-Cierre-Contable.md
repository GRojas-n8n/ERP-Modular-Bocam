# Hito 21 - Formalizacion de Contabilidad y cierre contable por eventos

Fecha: 2026-03-18

## Objetivo

Formalizar `Contabilidad` como modulo soberano del cierre contable y conectar el contrato:

- `finanzas.pago_registrado`
- `contabilidad.asiento_contable_generado`

sin romper el aislamiento multi-tenant, multi-proyecto ni la soberania de datos entre modulos.

## Base directiva usada

- `AGENTS.md`
- `directives/Visión Arquitectónica.md`
- `directives/Diccionario de Entidades Globales (MDM).md`
- `directives/Matriz de Autorizaciones (RBAC).md`
- `Arquitectura de Módulos y Flujo de Datos.md`

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades MDM tocadas: `Proyecto`, `Usuario_Identidad` y referencias externas de pago provenientes de `Finanzas`.
3. Aislamiento: toda persistencia del modulo nuevo usa `tenant_id` + `proyecto_id` y `createTenantContext(...)`.
4. Centro de costos: el asiento queda siempre ligado a `proyecto_id`.
5. Evento de salida: `contabilidad.asiento_contable_generado`.

## Cambios realizados

### 1. Nuevo modulo `apps/contabilidad`

Se agregó el modulo backend:

- `apps/contabilidad/package.json`
- `apps/contabilidad/tsconfig.json`
- `apps/contabilidad/prisma/schema.prisma`
- `apps/contabilidad/src/db.ts`
- `apps/contabilidad/src/types.ts`
- `apps/contabilidad/src/main.ts`

### 2. Modelo de datos contable

Se creó la entidad `AsientoContable` en schema propio `contabilidad` con:

- `tenant_id`
- `proyecto_id`
- `pago_id`
- `tipo_poliza`
- `folio_poliza`
- `monto_total`
- `beneficiario`
- referencias inter-modulo (`referencia_modulo`, `referencia_entidad`, `referencia_id`)

Se blindó idempotencia con `@@unique([tenant_id, pago_id])`.

### 3. Consumo real de `finanzas.pago_registrado`

`Contabilidad` ahora consume `finanzas.pago_registrado` y:

- valida contrato minimo;
- ejecuta el alta del asiento en su propia BD;
- genera `folio_poliza` determinista;
- deja logs estructurados `created` e `idempotent`;
- evita duplicados ante reenvio del mismo `id_pago`.

### 4. Emision de `contabilidad.asiento_contable_generado`

Despues de crear el asiento, el modulo publica:

- `contabilidad.asiento_contable_generado`

con:

- `id_asiento`
- `pago_id`
- `tipo_poliza`
- `folio_poliza`
- `monto_total`
- `fecha_poliza`
- referencias externas
- `beneficiario`
- `estatus`

El evento conserva `tenant_id`, `proyecto_id`, `user_id` y `correlation_id`.

### 5. Endpoint inicial del modulo

Se agregó:

- `GET /api/v1/contabilidad/asientos`

con JWT real, `requireProjectAccess()` y `requireRoles('admin', 'finance', 'superintendent')`.

### 6. Integracion real y pipeline

Se agregó la prueba:

- `apps/contabilidad/test/integration/finanzas.pago-registrado.integration.test.ts`

La validacion cubre:

1. `Finanzas` procesa un pago real.
2. Se publica `finanzas.pago_registrado`.
3. `Contabilidad` crea un solo asiento.
4. `Contabilidad` emite `contabilidad.asiento_contable_generado`.
5. El reenvio del mismo evento no crea un segundo asiento ni un segundo evento.

Tambien se actualizó:

- `package.json`
- `.github/workflows/backend-e2e.yml`
- `package-lock.json`

para incluir `Contabilidad` en el monorepo, Prisma, typecheck e integracion inter-modulo.

## Validaciones ejecutadas

Pasaron:

- `npx prisma generate --schema apps/contabilidad/prisma/schema.prisma`
- `npx prisma db push --schema apps/contabilidad/prisma/schema.prisma`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npm run test:integration:finanzas-pago -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` deja de ser solo una pieza prevista en documentos y pasa a existir como modulo real dentro del SaaS.

Ahora el sistema tiene este tramo completo:

- `Finanzas -> Contabilidad`

Flujo:

- pago real registrado
- evento financiero emitido
- asiento contable generado en modulo soberano
- evento contable emitido con trazabilidad completa

## Siguiente paso recomendado

Extender `Contabilidad` para:

- consumir `compras.oc_creada` y registrar pasivos proyectados;
- consumir `finanzas.transferencia_presupuestal` para polizas internas;
- emitir eventos de cierre fiscal/CFDI cuando aplique;
- montar pruebas negativas de contrato para payloads contables invalidos.
