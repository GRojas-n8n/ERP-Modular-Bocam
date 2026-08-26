## Context

`createTenantContext(ctx)` en `apps/gerencia-tecnica/src/db.ts:70-133` usa `basePrisma.$extends({ query: { $allModels: { $allOperations(...) } } })` para interceptar cada operación de Prisma y envolverla en su propia `$transaction`. Esto es necesario porque `set_config('app.current_tenant_id', ..., true)` (el tercer argumento `true` lo hace `local` a la transacción, ver comentario en `db.ts:92-94`) solo tiene efecto si la query real corre en la misma conexión/transacción — por eso el diseño actual re-ejecuta la operación dentro de una transacción interactiva cada vez.

El problema no es el mecanismo (correcto para una operación aislada), sino su uso en loops: 4 endpoints llaman a este cliente decenas, cientos o miles de veces en secuencia dentro del mismo request, multiplicando el overhead de transacción por cada fila. Los otros 10 microservicios de este repo resuelven el mismo requisito (RLS vía `set_config` + Prisma) con una forma distinta de `createTenantContext`: `(context, callback) => Promise<T>` — una sola transacción por invocación, el llamador decide cuántas operaciones corren dentro. Gerencia Técnica no puede adoptar esa forma sin romper 49 call sites existentes en `main.ts` que asumen `const db = createTenantContext(ctx)` seguido de operaciones sueltas — ese refactor completo está fuera de alcance de este change (ver Non-Goals).

## Goals / Non-Goals

**Goals:**
- Los 4 loops identificados en proposal.md ejecutan sus operaciones dentro de 1 sola transacción de Postgres por request, no N.
- Una fila individual que falla (constraint, FK inexistente, error inesperado) se sigue omitiendo (`omitidos++`) sin abortar ni afectar las demás filas del mismo request — mismo comportamiento observable que hoy, verificado con un test dedicado.
- Ningún cambio de contrato HTTP: mismos endpoints, mismos status codes, misma forma de respuesta.

**Non-Goals:**
- No se migra `createTenantContext(ctx)` (el cliente de 49 call sites) al patrón `(context, callback)` de los otros 10 servicios — blast radius de todo `main.ts`, fuera de alcance de un change enfocado en 4 loops concretos. Si en el futuro se decide unificar el patrón en todo el archivo, es un change aparte.
- No se convierte ningún loop en una sola sentencia SQL de bulk upsert (`INSERT ... ON CONFLICT DO UPDATE` vía `$executeRaw` + `UNNEST`) — es la optimización siguiente y más agresiva, pero cambia la forma de la query (más riesgo, requiere probar contra Postgres real con datos de borde). Este change se limita a agrupar operaciones existentes en menos transacciones, sin tocar qué SQL genera cada operación.
- No se agrega un cap explícito a `PUT /insumos/clasificacion-bulk` (hoy sin límite de `items.length`) — fuera del problema que este change resuelve (número de transacciones, no tamaño de payload); si se decide que necesita un límite, es una validación aparte.
- No se deduplica el endpoint deprecado `POST /presupuestos/:presupuesto_id/composicion-apu` contra `POST /composicion-apu` (código casi idéntico) — ambos se corrigen por separado, tal como están, para no mezclar este fix con una limpieza de duplicación no pedida.

## Decisions

**1. Función nueva `withTenantTransaction`, no una sobrecarga de `createTenantContext`.**
`createTenantContext(ctx)` sin callback ya tiene 49 usos con una forma de retorno (`BocamPrismaClient`) incompatible con una sobrecarga `(ctx, callback) => Promise<T>` sin ambigüedad de tipos para TypeScript, y mezclar ambas formas bajo el mismo nombre invita a que alguien use la forma equivocada en un call site nuevo. Un nombre distinto hace explícito, en cada call site, cuál mecanismo se está usando y por qué.

**2. Aislamiento de fallos por fila vía `SAVEPOINT` de Postgres, no vía captura de la excepción y continuar sin más.**
Postgres aborta el resto de una transacción en cuanto una sentencia falla (`current transaction is aborted, commands ignored until end of transaction block`) — un `try/catch` alrededor de `tx.insumo.update(...)` sin `SAVEPOINT` capturaría la excepción en JavaScript, pero la conexión de Postgres seguiría abortada para el resto de la transacción, y **todas** las filas posteriores fallarían silenciosamente por la misma razón, no por su propio contenido. `SAVEPOINT nombre` antes de cada operación + `RELEASE SAVEPOINT` si tiene éxito o `ROLLBACK TO SAVEPOINT` si falla mantiene la transacción principal viva y aísla el fallo a esa sola fila — es el mecanismo estándar de Postgres para exactamente este caso (procesar un lote donde algunas filas pueden fallar sin abortar el resto).

**3. El label de cada `SAVEPOINT` es un índice numérico (`row_${idx}`), nunca un valor derivado del contenido de la fila.**
`SAVEPOINT` no admite parámetros bindeados (`$1`) — el nombre va interpolado directamente en el SQL. Usar `clave` o cualquier campo de la fila como parte del label abriría una vía de inyección SQL si esa fila viene de un archivo importado por el usuario. Un índice de loop (`0`, `1`, `2`...) es siempre seguro porque nunca contiene texto arbitrario.

**4. `withTenantTransaction` acepta un `timeoutMs` opcional (default 10000, igual que hoy) — los 2 call sites de lotes grandes (`importar-lote`, `composicion-apu` ×2) pasan explícitamente 60000.**
Colapsar N transacciones en 1 elimina el overhead de N `BEGIN`/`COMMIT`, pero las N operaciones (ahora + N pares de `SAVEPOINT`/`RELEASE`) siguen ejecutándose secuencialmente dentro de esa transacción — para el caso límite ya validado por el endpoint (5000 filas en `importar-lote`), el timeout de 10s por defecto podría no alcanzar. Se sube a 60s solo en los 2 endpoints con volumen potencialmente alto; `clasificacion-bulk` (sin cap conocido pero uso típico menor, reclasificación manual desde UI) se queda en el default.

**5. Las lecturas previas al loop (`findFirst`/`findMany` para construir mapas clave→id) siguen usando el `createTenantContext(ctx)` existente, sin cambios — solo el loop en sí se mueve dentro de `withTenantTransaction`.**
Esas lecturas ya son una sola operación cada una (el patrón actual no las penaliza); moverlas también reduciría el diff sin beneficio medible, y mantenerlas fuera de la transacción de escritura evita alargar la ventana de lock innecesariamente.

## Risks / Trade-offs

- **[Riesgo] Una transacción de escritura que dura más (hasta 60s en el peor caso) mantiene una conexión de Postgres ocupada más tiempo que antes por transacción individual — pero son muchas menos conexiones en total** (1 en vez de hasta 5000). Trade-off aceptado: el problema original era exactamente "demasiadas conexiones cortas compitiendo por el pool bajo carga concurrente"; una conexión más larga por request es la contrapartida directa de resolverlo.
- **[Riesgo] `SAVEPOINT` por fila tiene su propio costo (aunque mucho menor que una transacción completa)** — con 5000 filas son 5000-10000 sentencias `SAVEPOINT`/`RELEASE` adicionales dentro de la misma transacción. Aceptado: es overhead de Postgres bien conocido y barato comparado con el costo de una transacción nueva (nueva conexión del pool, nuevo `BEGIN`, nuevo round-trip completo de red).
- **[Trade-off] No se resuelve el límite real de fondo (sin `connection_limit` configurado en ningún servicio, Postgres en el default de 100 conexiones para 12 microservicios)** — este change reduce cuántas conexiones pide Gerencia Técnica por un request de lote, pero no toca la configuración global del pool. Si el problema persiste después de este fix, la siguiente pregunta es una revisión de `connection_limit`/`pool_timeout` repo-wide, fuera de alcance aquí.

## Migration Plan

- Sin migración de datos ni de schema — cambio de código puro en `apps/gerencia-tecnica`.
- Deploy de un solo servicio backend. Sin cambios de contrato, sin coordinación con otros microservicios.
- Rollback: revertir el commit — `createTenantContext(ctx)` no se tocó, así que el resto del servicio queda intacto ante un revert.

## Open Questions

Ninguna pendiente de decisión técnica.
