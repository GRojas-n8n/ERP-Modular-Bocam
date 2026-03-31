# Hito 29 - Conciliacion bancaria desde archivo CSV/XLSX

Fecha: 2026-03-19

## Objetivo

Permitir que `Contabilidad` cargue lotes reales de estado de cuenta desde archivo `CSV` o `XLSX`, con validacion previa antes de ejecutar la conciliacion bancaria y sin romper el aislamiento SaaS por `tenant_id + proyecto_id`.

## Plan arquitectonico aplicado

1. Modulo afectado: `Contabilidad`.
2. Entidades tocadas:
   - `AsientoContable`
   - `ConciliacionBancaria`
3. Aislamiento multi-tenant: toda la validacion y ejecucion ocurre dentro de `createTenantContext(...)`.
4. Alcance multi-proyecto: la resolucion de cada fila se limita al `tenant_id + proyecto_id` del JWT.
5. Interoperabilidad: no se hace ningun join cruzado con `Finanzas`; el archivo se concilia contra datos ya materializados y soberanos en `Contabilidad`.

## Cambios realizados

### 1. Soporte de archivos reales

Archivos:

- `apps/contabilidad/src/main.ts`
- `apps/contabilidad/package.json`

Se agrego parser para:

- `CSV`
- `XLSX`
- `XLS`

La lectura usa `xlsx` y soporta:

- nombre de hoja opcional (`sheet_name`)
- filas con encabezados flexibles por alias
- carga en `base64`, incluyendo payloads con prefijo `data:*`

### 2. Normalizacion y validacion sintactica de filas

Archivo:

- `apps/contabilidad/src/main.ts`

Se agregaron helpers para:

- normalizar encabezados (`normalizeHeader`)
- resolver aliases (`pickRowValue`)
- convertir montos (`parseNumericCell`)
- transformar filas crudas a estructura controlada (`NormalizedBankFileItem`)

La validacion previa ahora detecta antes de ejecutar:

- falta de `id_asiento` y `referencia_bancaria`
- `monto_banco` ausente o invalido
- `fecha_movimiento_bancario` ausente

### 3. Prevalidacion operativa real antes de mutar

Archivo:

- `apps/contabilidad/src/main.ts`

Se agrego:

- `resolveBankReconciliationTarget(...)`
- `prevalidateBankReconciliation(...)`

Con esto el modo estricto ya no valida solo sintaxis. Tambien comprueba, antes de cualquier update:

- que el asiento exista dentro del tenant
- que la conciliacion bancaria pendiente exista
- que el asiento admita conciliacion bancaria
- que el monto del archivo coincida con el monto contable
- que la referencia bancaria sea consistente
- si la fila ya es idempotente o si realmente requiere mutacion

Si `allow_partial !== true`, cualquier fila que falle esta prevalidacion aborta el archivo completo con `422`, sin efectos parciales.

### 4. Nuevos endpoints por archivo

Archivo:

- `apps/contabilidad/src/main.ts`

Se agregaron:

- `POST /api/v1/contabilidad/conciliaciones-bancarias/archivo/validar`
- `POST /api/v1/contabilidad/conciliaciones-bancarias/archivo/ejecutar`

Ambos:

- exigen JWT y `requireRoles('admin', 'finance')`
- conservan `correlation_id`
- reportan `tenant_id` y `proyecto_id` en meta

`/archivo/validar` devuelve:

- `total_rows`
- `valid_count`
- `invalid_count`
- `valid_items`
- `invalid_items`

`/archivo/ejecutar` soporta dos modos:

- estricto: aborta si alguna fila es sintactica u operativamente invalida
- parcial: procesa solo las validas y devuelve exito/falla por item

### 5. Reutilizacion de reglas contables existentes

Archivo:

- `apps/contabilidad/src/main.ts`

La ejecucion por archivo reutiliza `reconcileBankMovement(...)`, por lo que comparte exactamente las mismas reglas que:

- conciliacion bancaria unitaria
- conciliacion bancaria masiva por JSON

Eso evita divergencias entre los tres canales operativos.

### 6. Observabilidad del procesamiento por archivo

Archivo:

- `apps/contabilidad/src/main.ts`

Se agregaron logs estructurados para:

- archivo validado
- fila conciliada
- fila fallida
- archivo ejecutado

Con trazabilidad por:

- `tenant_id`
- `proyecto_id`
- `correlation_id`
- `lote_id`
- `file_name`
- `sheet_name`

## Integracion real agregada

Archivo:

- `apps/contabilidad/test/integration/finanzas.banco-archivo.conciliacion.integration.test.ts`

La prueba cubre:

1. `Finanzas` registra dos pagos reales
2. `Contabilidad` materializa asiento, placeholder fiscal y placeholder bancario
3. se concilian CFDI y SAT `VIGENTE`
4. se valida un archivo `CSV` con una fila correcta y una invalida
5. se intenta ejecutar un `XLSX` en modo estricto con una fila no resoluble y el endpoint responde `422`
6. se ejecuta un `XLSX` valido en modo parcial
7. ambos asientos quedan `CERRADO` y `CONCILIADO`

## Scripts

Archivos:

- `apps/contabilidad/package.json`
- `package.json`

Se agrego:

- `test:integration:finanzas-banco-archivo`

Y se sumo al runner:

- `test:integration:intermodulo`

## Validaciones ejecutadas

Pasaron:

- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-banco-archivo -w @bocam/contabilidad`
- `npm run test:integration:intermodulo`

## Resultado

`Contabilidad` ya soporta ingestion operativa de estados de cuenta desde archivo real:

- `CSV` y `XLSX`
- validacion previa
- prevalidacion contable real contra el tenant
- modo estricto sin mutaciones parciales
- modo parcial con resultado por fila
- trazabilidad completa para auditoria

Con esto tesoreria ya puede trabajar desde extractos reales sin tener que reconstruir manualmente el payload JSON del lote.

## Siguiente paso recomendado

El siguiente paso con mas valor es integrar un adaptador SAT externo para sustituir la validacion manual/controlada y cerrar la automatizacion fiscal end-to-end.
