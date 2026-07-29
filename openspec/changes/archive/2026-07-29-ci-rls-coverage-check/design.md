## Context

Los 11 microservicios con base de datos propia (`almacen`, `auth`, `calidad`, `compras`, `contabilidad`, `control-proyectos`, `finanzas`, `gerencia-tecnica`, `personal`, `seguridad`, `ventas`) siguen una convención consistente y ya verificada en el repo:
- Cada modelo Prisma usa `@@map("nombre_tabla")` para mapear a su tabla snake_case (confirmado: 100% de los ~90 modelos across los 11 schemas usan `@@map`, ninguno depende del nombre por defecto).
- Las tablas tenant-scoped tienen un campo `tenant_id String @db.Uuid` declarado explícitamente en el modelo.
- Cada servicio declara su cobertura RLS en `apps/<servicio>/prisma/rls-policies.sql`, con el patrón `ALTER TABLE "tabla" ENABLE ROW LEVEL SECURITY;` + `ALTER TABLE "tabla" FORCE ROW LEVEL SECURITY;` + al menos un `CREATE POLICY ... ON "tabla"`.
- Las tablas catálogo sin `tenant_id` (ej. `cuentas_contables` en `contabilidad`) se excluyen a propósito y ya no tienen campo `tenant_id` en el modelo — no requieren ninguna anotación especial para que el chequeo las ignore correctamente.

Los 5 incidentes históricos de RLS drift (ver memoria `hallazgo-rls-drift-*`) comparten la misma forma: una tabla nueva con `tenant_id` se agregó al `schema.prisma` de un servicio, pero `rls-policies.sql` no se actualizó en el mismo cambio. Ese es exactamente el patrón que este chequeo detecta.

## Goals / Non-Goals

**Goals:**
- Detectar, en CI, cualquier modelo Prisma con campo `tenant_id` cuya tabla mapeada no tenga `ENABLE ROW LEVEL SECURITY` + al menos una `CREATE POLICY` en el `rls-policies.sql` de su servicio.
- Que el chequeo sea rápido (segundos) y no dependa de levantar una base de datos ni desplegar los 11 microservicios en el runner.
- Que el script se pueda correr también localmente (`node scripts/ci/check-rls-coverage.js`) antes de abrir un PR.

**Non-Goals:**
- No verifica que las políticas declaradas estén realmente aplicadas en ningún entorno (dev/staging/VPS) — eso es un problema de despliegue, no de código versionado, y ya lo cubren los tests de integración `rls-*.integration.test.ts` existentes y el requisito de rol sin `BYPASSRLS` en `despliegue-completo-microservicios`.
- No valida que el contenido de cada política sea correcto (ej. si debería ser `tenant_id` solo o `tenant_id AND proyecto_id`) — esa es una decisión de diseño caso por caso, ya documentada como requisito separado en el mismo spec, no automatizable con un chequeo estático simple.
- No cubre `asistente` ni `reportes` (no tienen `prisma/schema.prisma` propio — consultan otros servicios vía HTTP/eventos, no tienen tablas propias que proteger).

## Decisions

**1. Chequeo estático (parseo de texto) vs. chequeo contra base de datos viva (`pg_policies`).**
Se elige estático.
- Alternativa considerada: extender `backend-e2e.yml` para hacer `prisma db push` de los 11 servicios (hoy solo hace push de 4) y consultar `pg_policies` real. Rechazada para este change: requiere reestructurar el workflow existente, es más lento, y el gap real nunca fue "la política no se aplicó a la base" sino "la política nunca se escribió" — un chequeo del archivo versionado ataca la causa raíz sin la complejidad adicional.
- El chequeo estático tiene una limitación conocida y aceptada: si alguien declara la política en `rls-policies.sql` pero el archivo nunca se ejecuta contra una base real, este chequeo no lo detecta. Ese es un problema distinto (de proceso de despliegue), ya cubierto por otro requisito del mismo spec.

**2. Nombre de tabla: exigir `@@map` explícito, no asumir default de Prisma.**
El script requiere que cada modelo tenga `@@map("...")` para determinar el nombre de tabla. Si un modelo con `tenant_id` no tiene `@@map`, el script lo reporta como error (no lo ignora en silencio) — es una violación de la convención ya universal en el repo, y asumir el nombre por defecto de Prisma (el nombre del modelo tal cual, PascalCase) sería adivinar en vez de verificar.

**3. Cobertura = `ENABLE ROW LEVEL SECURITY` + al menos una `CREATE POLICY` sobre esa tabla.**
No basta con `ENABLE ROW LEVEL SECURITY` sola: sin ninguna política, `FORCE ROW LEVEL SECURITY` produce un deny-all que rompe la aplicación en cuanto se prueba (fallaría ruidosamente, no en silencio) — pero igual se reporta como gap de cobertura real, no solo de bandera activada, para que el mensaje de error sea preciso sobre qué falta.

**4. Ubicación del script y del paso de CI.**
El script vive en `scripts/ci/check-rls-coverage.js` (Node puro, sin dependencias nuevas — usa solo `fs`/`path` del runtime). El paso de CI se agrega a `backend-e2e.yml` como un job independiente y rápido (no depende de Postgres/RabbitMQ vivos), para que corra en paralelo al resto y falle rápido si hay un gap, sin esperar a que terminen las suites largas.

## Risks / Trade-offs

- **[Riesgo] Falso negativo si alguien nombra el campo distinto a `tenant_id` (ej. `tenantId` en camelCase con `@map`).** → Mitigación: la convención del repo (CLAUDE.md: "snake_case en tablas BD") y los 11 schemas actuales usan `tenant_id` de forma 100% consistente; si apareciera una variante, el chequeo simplemente no la marcaría como riesgo — trade-off aceptado por simplicidad, documentado en el propio script con un comentario.
- **[Riesgo] El script puede quedar desactualizado si se agrega un 12º microservicio con base propia y no se incluye en el descubrimiento de servicios.** → Mitigación: el script descubre servicios dinámicamente vía `apps/*/prisma/schema.prisma` (glob), no vía una lista hardcodeada — un servicio nuevo se detecta automáticamente sin tocar el script.
- **[Trade-off] No reemplaza una auditoría real contra producción.** → Aceptado como Non-Goal; sigue siendo válido hacer barridos manuales periódicos contra el VPS real (como ya se ha hecho), este chequeo solo cierra la puerta de entrada de nuevas tablas sin cobertura desde el código.

## Migration Plan

1. Escribir `scripts/ci/check-rls-coverage.js` y correrlo localmente contra el estado actual del repo — debe pasar en verde (todos los gaps históricos ya están cerrados según memoria).
2. Agregar el paso/job a `backend-e2e.yml`.
3. Verificar que el chequeo falla si se simula una tabla sin cobertura (agregar temporalmente un modelo de prueba con `tenant_id` sin política, confirmar que el script lo detecta, revertir).
4. Mergear a `main`.
5. Actualizar la memoria relevante (`hallazgo-rls-drift-*` o una nueva) señalando que el chequeo automatizado ya existe, para que futuras auditorías no repitan el barrido manual completo.

## Open Questions

Ninguna bloqueante.
