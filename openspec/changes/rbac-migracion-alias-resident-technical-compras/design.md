## Context

`packages/roles/src/index.ts` cataloga `resident` (→ `residencia`), `compras`
(→ `procurement`) y `technical` (→ `gerencia_tecnica`) como `estado: 'alias'`.
Ese estado existe para tolerar un JWT emitido antes de que el rol canónico
existiera, mientras el backend termina de migrar. Hoy no está migrando: los
`requireRoles` de `apps/compras`, `apps/almacen`, `apps/gerencia-tecnica` y
`apps/finanzas` siguen aceptando el alias exactamente igual que el canónico, y
`apps/auth` sigue creando usuarios nuevos con `rol_global: ['resident']` por
default cuando no se especifica rol. `User.rol_global` es `String[]` en
Postgres (`apps/auth/prisma/schema.prisma`), sin `CHECK` ni enum a nivel BD —
el catálogo de `packages/roles` es la única validación, y solo se aplica en
`POST /admin/users` (rechaza el alias) y `PATCH .../admin/users/:id` (lo
acepta, a propósito, para no bloquear la edición de quien ya lo tiene).

## Goals / Non-Goals

**Goals:**
- Que `resident`, `compras` y `technical` dejen de abrir ningún endpoint —
  solo el rol canónico debe importar a partir de este change.
- Que ningún usuario nuevo pueda terminar con el alias, por ninguna vía
  (alta explícita, alta con default, seed de desarrollo).
- Que los usuarios existentes con el alias se conviertan a su rol canónico
  sin intervención manual por fila.
- Retirar el alias del catálogo una vez que ninguna de las dos condiciones
  anteriores lo necesita, para que `packages/roles` deje de prometer un
  estado transitorio que ya no está en progreso.

**Non-Goals:**
- No se toca `UserProjectAccess.rol_proyecto` (override de texto libre por
  proyecto, valores como `'residente_frente'`) — no versiona contra este
  catálogo y no fue parte del pedido.
- No se le dan endpoints propios a ningún rol nuevo — esto es un rename/retiro
  de alias existentes, no una capability nueva.
- No se cambia `z.array(z.string())` de `register.schema.ts` a una validación
  completa contra el catálogo — ese endpoint ya tenía esa laxitud antes de
  este change y tocarla es una decisión aparte (deja `roles` fuera del scope
  salvo el default, que sí es parte del bug: escribe el alias sin que nadie lo
  pidiera).

## Decisions

**Renombrar en vez de solo migrar datos.** La mayoría de los `requireRoles`
afectados ya listan alias y canónico juntos (p. ej.
`requireRoles('resident', 'residencia', 'admin')`), así que "renombrar" es en
la práctica borrar la entrada redundante. Solo `apps/compras/src/main.ts:4123`
tiene únicamente `'resident'` sin `'residencia'` — ahí es una sustitución real,
no un borrado, para no perder acceso. Alternativa descartada: dejar
`requireRoles` como está y confiar solo en la migración de datos + retiro del
catálogo. Se descarta porque el catálogo no gatea `requireRoles` en runtime
(son arrays de strings hardcodeados por servicio) — si no se tocan, seguirían
aceptando el alias aunque ya no exista en el catálogo ni en la BD, dejando
código muerto que documenta una migración que en el catálogo aparenta ya
completa.

**Migración de datos como script standalone, no como migración Prisma.**
Seguimos el precedente único del repo para backfills de datos
(`apps/personal/scripts/migrar-config-nomina-proyecto.ts`): un script TS con
`PrismaClient` directo, contador de filas por categoría, y
`main().catch().finally($disconnect)`. Las migraciones Prisma existentes en
`apps/auth/prisma/migrations/` son todas aditivas de esquema (`ALTER TABLE ...
ADD COLUMN`); no hay precedente de `UPDATE` de datos dentro de una migración
Prisma en este repo, y mezclar backfill de datos con DDL de esquema complica
el rollback de la migración de esquema si el backfill falla a medio camino.
`rol_global` es un array (`String[]`), así que el script hace
`findMany` + reescritura del array en memoria + `update` por fila (no hay
`UPDATE ... SET rol_global = ...` de una sola sentencia posible para
"reemplazar un elemento dentro de un array" de forma portable sin funciones
de array de Postgres ad-hoc, y el volumen de filas es bajo — no amerita SQL
crudo).

**Retirar el alias del catálogo en el mismo change que el backend y los
datos**, no en un change posterior. Alternativa descartada: dejar el retiro
del catálogo para un change de seguimiento, análogo a como
`rbac-seguridad-rol-catalogo-desactualizado` corrigió un catálogo que quedó
desactualizado *después* de un fix de backend. Se descarta porque ya se probó
ese patrón (catalogar → arreglar backend → arreglar catálogo en un change
aparte) con `seguridad_hse` y generó exactamente el lapso que motivó este
mismo tipo de change; hacerlo todo junto aquí, con el test guardián nuevo,
evita reproducirlo con este alias.

**Test guardián simétrico.** El guardián existente (agregado en
`rbac-seguridad-rol-catalogo-desactualizado`) falla si un rol `sin-backend` ya
es exigido por el backend real. Se agrega el caso simétrico: un rol `alias`
que **ya no** es exigido por ningún `requireRoles` real debe fallar la suite,
nombrando el alias — fuerza a quien retire el alias del backend a también
retirarlo del catálogo en el mismo PR, en vez de dejarlo como nota
desactualizada.

## Risks / Trade-offs

- **[Riesgo] JWT emitido antes del deploy, con el alias, sigue vivo tras
  migrar los datos y el backend.** Un usuario que inició sesión antes del
  deploy presenta `roles: ['resident']` en su `securityContext` hasta que su
  access token expire o se refresque. → Mitigación: acotado y de bajo
  impacto — `JWT_ACCESS_EXPIRATION` (`apps/auth/src/main.ts:90`) default
  `15m`, y `POST /api/v1/auth/refresh` (línea 458) relee `storedToken.user`
  fresco de BD en cada rotación (no reusa los claims del token viejo) — así
  que el rol migrado se propaga solo con el siguiente refresh automático del
  cliente, sin requerir re-login manual. La ventana real de 403 para un
  usuario con el alias es como máximo ~15 minutos tras el deploy.
- **[Riesgo] Migración de datos corre después de que el código nuevo ya está
  sirviendo tráfico.** Si el deploy activa los `requireRoles` sin alias antes
  de correr el script, cualquier usuario con el alias en BD pierde acceso
  hasta que el script corra (ventana corta) — no hasta que reautentique.
  → Mitigación: orden de deploy explícito en el plan de migración (correr el
  script antes de que el contenedor nuevo reciba tráfico), y el script es
  idempotente y rápido (una sola tabla, filtrado por `rol_global` con los tres
  alias) así que la ventana es de segundos, no de un mantenimiento largo.
- **[Riesgo] Alguien vuelve a introducir el alias a mano en un `requireRoles`
  nuevo sin saber que fue retirado.** → Mitigación: el test guardián existente
  ("todo rol exigido por un servicio está en el catálogo") ya cubre esto — un
  `requireRoles('resident', ...)` nuevo fallaría de inmediato porque
  `resident` ya no estará en `ROLES_VALIDOS`.
- **[Riesgo, descubierto durante la implementación] El guardián de
  `catalogo.test.ts` no resuelve `requireRoles(...CONST)` con spread de una
  constante — solo `requireRoles('a', 'b')` y `rolesAutorizados = [...]`
  literales.** `apps/gerencia-tecnica/src/main.ts` tenía `'resident'` en
  `ROLES_FICHAS_UPLOAD`/`ROLES_FICHAS_LECTURA`, usadas vía
  `requireRoles(...ROLES_FICHAS_UPLOAD)`, y el guardián nunca lo detectó — se
  encontró por un grep manual de cierre, no por la suite. Corregido en este
  change (sección 3.6 de `tasks.md`), pero el punto ciego del guardián sigue
  ahí para el próximo rol que se declare así. → Mitigación aplicada: ninguna
  en el guardián mismo (fuera de alcance); queda como deuda documentada para
  un change de seguimiento sobre `packages/roles/src/catalogo.test.ts`.
- **Trade-off**: se acepta que este change sea **BREAKING** para sesiones
  activas con el alias en vez de hacerlo en dos etapas (deprecar, esperar,
  retirar) — el volumen esperado de usuarios afectados es bajo (piloto,
  catálogo ya deja de ofrecer el alias desde hace un change) y una segunda
  etapa solo pospone el mismo riesgo sin eliminarlo.

## Migration Plan

1. Deploy del código (los 5 microservicios tocados: `auth`, `compras`,
   `almacen`, `gerencia-tecnica`, `finanzas`, más el paquete `roles` del que
   todos dependen) — el script de migración de datos va incluido en la imagen
   de `auth` pero no corre automáticamente al arrancar.
2. Antes de que el tráfico se enrute al contenedor nuevo (o inmediatamente
   después, aceptando la ventana corta descrita en Risks), ejecutar en el VPS:
   `docker exec bocam-vps-auth npm run migrar:roles-alias --workspace=apps/auth`
   (o el equivalente según cómo se invoquen los scripts `ts-node` existentes
   en ese contenedor — seguir el mismo comando usado para
   `migrar:config-nomina` en `personal`).
3. Verificar 0 filas restantes con el alias:
   `SELECT count(*) FROM users WHERE rol_global && ARRAY['resident','compras','technical'];`
   debe devolver 0 tras el paso 2.
4. Smoke test: login con un usuario real de Compras y uno de Gerencia
   Técnica, confirmar que los endpoints antes accesibles por alias siguen
   accesibles por su rol canónico.
5. Rollback: si el deploy falla, revertir la imagen de los 5 servicios a la
   anterior — los datos migrados (`resident` → `residencia`, etc.) son
   compatibles con el código anterior, porque ese código ya aceptaba ambos
   valores en `requireRoles`. No hace falta revertir el script de datos.

## Open Questions

Ninguna pendiente — la duración del JWT y el comportamiento de `/refresh` ya
se confirmaron contra el código real (`apps/auth/src/main.ts:90,458`) y
quedaron documentados en Risks/Trade-offs.
