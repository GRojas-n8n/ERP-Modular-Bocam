## 1. Script de chequeo

- [x] 1.1 Crear `scripts/ci/check-rls-coverage.js`: descubre servicios vía glob `apps/*/prisma/schema.prisma`.
- [x] 1.2 Parsear cada `schema.prisma`: extraer bloques `model X { ... }`, detectar campo `tenant_id`, extraer nombre de tabla vía `@@map("...")` (reportar error explícito si un modelo con `tenant_id` no tiene `@@map`).
- [x] 1.3 Parsear el `rls-policies.sql` del mismo servicio: detectar `ALTER TABLE "tabla" ENABLE ROW LEVEL SECURITY` y al menos un `CREATE POLICY ... ON "tabla"` por tabla.
- [x] 1.4 Comparar y construir la lista de gaps (tabla sin ENABLE, o con ENABLE pero sin ninguna política), distinguiendo el tipo de gap en el mensaje.
- [x] 1.5 Imprimir reporte legible (servicio, tabla, tipo de gap) y salir con código 1 si hay al menos un gap, código 0 si no hay ninguno.

## 2. Integración a CI

- [x] 2.1 Agregar un job nuevo a `.github/workflows/backend-e2e.yml` (independiente de Postgres/RabbitMQ) que corra `node scripts/ci/check-rls-coverage.js`.

## 3. Verificación

- [x] 3.1 Correr el script localmente contra el estado actual del repo — debe pasar en verde (0 gaps), dado que los 5 incidentes históricos ya están cerrados. Verificado: "Cobertura RLS completa en los 11 microservicios revisados".
- [x] 3.2 Simular un gap: agregar temporalmente un modelo de prueba (`__CiProbeSinRls`, tabla `__ci_probe_sin_rls`) con `tenant_id` sin política en `apps/ventas/prisma/schema.prisma`, confirmar que el script lo detecta y sale con código 1, revertir el cambio.
- [x] 3.3 Simular el caso "ENABLE sin política": agregar solo el `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` de la tabla de prueba sin `CREATE POLICY`, confirmar que el mensaje distingue este caso ("tiene ENABLE ROW LEVEL SECURITY pero ninguna CREATE POLICY") del de "sin ENABLE en absoluto".
- [ ] 3.4 Abrir PR, confirmar que el nuevo job aparece y pasa en GitHub Actions.

## 4. Cierre

- [ ] 4.1 Mergear el change a `main`.
- [ ] 4.2 Actualizar memoria (nueva o extendiendo una `hallazgo-rls-drift-*` existente) señalando que el chequeo automatizado ya existe.
- [ ] 4.3 Archivar el change en OpenSpec.
