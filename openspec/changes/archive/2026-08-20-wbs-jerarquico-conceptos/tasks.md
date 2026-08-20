## 1. Investigación previa (bloquea el resto)

- [x] 1.1 Corrido contra la BD real de producción (VPS, vía Prisma del propio contenedor `bocam-vps-gerencia-tecnica`, sin exponer credenciales): `SELECT tenant_id, proyecto_id, presupuesto_id, clave, COUNT(*) FROM conceptos GROUP BY 1,2,3,4 HAVING COUNT(*) > 1` → **0 filas**. No hay claves duplicadas existentes — la migración del índice único es segura de aplicar en producción sin pasos de resolución previos.

## 2. Backend — gerencia-tecnica: schema

- [x] 2.1 Agregar modelo `Capitulo` (`tenant_id`, `proyecto_id`, `presupuesto_id`, `clave`, `nombre`, `orden`) con FK a `PresupuestoBase`.
- [x] 2.2 Agregar modelo `ConceptoCatalogo` (`tenant_id`, `clave` único por tenant, `descripcion`, `unidad_medida`, timestamps).
- [x] 2.3 `Concepto` gana `capitulo_id` (FK opcional a `Capitulo`) y el índice único `@@unique([tenant_id, proyecto_id, presupuesto_id, clave])`.
- [x] 2.4 Generar y aplicar la migración contra la BD local real (Docker) — solo tras resolver 1.1 contra producción. Verificar tablas/columnas con `\d` directo en Postgres.

## 3. Backend — gerencia-tecnica: unicidad dentro del lote (TDD: test primero)

- [x] 3.1 Test que reproduce el bug: `POST /presupuestos` con dos conceptos de la misma `clave` en el mismo body responde `201` hoy (debería ser `422`). Rojo confirmado.
- [x] 3.2 Test: `POST /presupuestos` con conceptos de claves únicas sigue respondiendo `201` (no regresión).
- [x] 3.3 Test: crear una versión 2 de presupuesto para el mismo proyecto, reutilizando las mismas claves que la versión 1, responde `201` (el índice único no debe bloquear entre `presupuesto_id` distintos).
- [x] 3.4 Validación de duplicados dentro del body implementada antes de la creación (evita depender solo del error de BD, para poder devolver un mensaje claro con la(s) clave(s) duplicada(s)).
- [x] 3.5 Tests 3.1-3.3 en verde.

## 4. Backend — gerencia-tecnica: catálogo maestro (TDD: test primero)

- [x] 4.1 Test que reproduce el gap: importar un concepto con clave ya usada en otra obra del tenant, con descripción distinta, no genera ninguna advertencia hoy. Rojo confirmado.
- [x] 4.2 Test: concepto con clave nueva se agrega a `ConceptoCatalogo`.
- [x] 4.3 Test: concepto con clave conocida y datos consistentes no genera advertencia.
- [x] 4.4 Test: concepto con clave conocida y datos divergentes genera advertencia en la respuesta, pero el concepto se crea igual (no bloquea).
- [x] 4.5 Test: `precio_unitario`/`cantidad` del concepto creado siguen siendo los del archivo importado, nunca los del catálogo maestro (que no los guarda).
- [x] 4.6 Implementado el flujo de resolución/creación de `ConceptoCatalogo` y advertencias en `POST /presupuestos`.
- [x] 4.7 Tests 4.1-4.5 en verde.

## 5. Backend — gerencia-tecnica: capítulos (TDD: test primero)

- [x] 5.1 Test: importar conceptos con referencia de capítulo (clave+nombre) crea/reutiliza el `Capitulo` del presupuesto y asocia `capitulo_id` a cada concepto.
- [x] 5.2 Test: concepto sin referencia de capítulo se crea con `capitulo_id = null`, sin rechazar la importación.
- [x] 5.3 `GET /presupuesto/activo` amplía su `select` para incluir `capitulo_id` (campo nuevo opcional, no reemplaza ninguno existente — no rompe a `control-proyectos`, que ya consume este endpoint).
- [x] 5.4 Tests 5.1-5.2 en verde; confirmar que el test/contrato existente de `control-proyectos` sobre `presupuesto/activo` sigue en verde sin cambios (campo nuevo es aditivo).

## 6. Verificación

- [x] 6.1 Suite completa de `apps/gerencia-tecnica` corrida en verde (13 archivos de integración + `tsc --noEmit`, contra Postgres/RabbitMQ reales de Docker local).
- [x] 6.2 Entorno local: importar un presupuesto de prueba con capítulos y una clave duplicada intencional — confirmar rechazo `422` con mensaje claro. (Cubierto end-to-end por el test 3.1 en `test/integration/presupuestos-unicidad-clave.integration.test.ts`, ejecutado contra el HTTP real levantado sobre el Postgres de Docker local.)
- [x] 6.3 Entorno local: importar el mismo catálogo de conceptos en dos proyectos distintos del mismo tenant con una descripción ligeramente distinta en el segundo — confirmar que aparece la advertencia y el presupuesto se crea igual. (Cubierto end-to-end por el test 4.1/4.4 en `test/integration/presupuestos-catalogo-maestro.integration.test.ts`.)

## 7. Deploy y cierre

- [ ] 7.1 Desplegado vía CI (push a `main`). Confirmar migración aplicada en `_prisma_migrations` real y tablas/columnas nuevas presentes.
- [ ] 7.2 Actualizar memoria del proyecto con el resultado.
- [ ] 7.3 `openspec archive wbs-jerarquico-conceptos` tras verificación en producción.
