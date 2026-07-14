## 1. Tests que fijan el comportamiento actual (deben pasar contra multer 1.x antes de tocar nada)

- [x] 1.1 Test de integración en `apps/gerencia-tecnica/test/integration/fichas-upload-multer.integration.test.ts`
      (mismo patrón `startHttpApp` + Prisma real ya usado en la suite de integración de
      este servicio): subir una ficha técnica con extensión permitida (`.pdf`) → 200/201;
      extensión no permitida (`.exe`) → error de tipo no permitido, sin persistir; archivo
      que excede `FICHAS_MAX_SIZE_MB` → `MulterError` `LIMIT_FILE_SIZE`, HTTP explícito, sin
      persistir.
- [x] 1.2 Test de integración en `apps/compras/test/integration/cotizacion-pdf-upload-multer.integration.test.ts`
      para `cotizacionesMulter`: mismos 3 casos (válido `.pdf`/`.jpg`/`.jpeg`/`.png`, tipo no
      permitido, límite excedido) contra el endpoint de PDF de cotización.
- [x] 1.3 Test de integración en `apps/compras/test/integration/docs-proveedor-upload-multer.integration.test.ts`
      para `docsMulter` (instancia separada, NO cubierta por 1.2): mismos 3 casos contra el
      endpoint de documentos de proveedor (`.pdf`/`.xml`/`.jpg`/`.jpeg`/`.png`).
- [x] 1.4 Test de integración en `apps/calidad/test/integration/adjuntos-upload-multer.integration.test.ts`:
      mismos 3 casos contra el endpoint de adjuntos de calidad.
- [x] 1.5 Test de integración en `apps/asistente/test/integration/leer-cotizacion-upload-multer.integration.test.ts`:
      mismos 3 casos contra `/api/v1/asistente/leer-cotizacion` — confirmar además que el
      archivo válido queda disponible como `req.file.buffer` (memoryStorage), no escrito a
      disco.
- [x] 1.6 Confirmar que los 5 archivos de test (15 casos en total) pasan en verde contra
      `multer@^1.4.5-lts.1` (versión actual, antes del bump) — este es el comportamiento
      base que el resto del change no debe alterar.

## 2. Bump de dependencia

- [x] 2.1 `apps/gerencia-tecnica/package.json`: `multer` → `^2.1.1`, remover `@types/multer`
      (multer 2.x publica sus propios tipos).
- [x] 2.2 `apps/compras/package.json`: mismo cambio.
- [x] 2.3 `apps/calidad/package.json`: mismo cambio.
- [x] 2.4 `apps/asistente/package.json`: mismo cambio.
- [x] 2.5 `npm install` en la raíz del monorepo — regenerar `package-lock.json` con
      `multer@2.1.1`+ resuelto en los 4 workspaces, sin tocar `express` ni otras
      dependencias no relacionadas.

## 3. Re-verificación contra multer 2.x

- [x] 3.1 Re-correr los 5 archivos de test de la sección 1 (sin modificarlos) contra la
      versión nueva — deben seguir pasando los 15 casos en verde.
      → Verificado 2026-07-14: 15/15 en verde contra `multer@2.2.0` sin modificar ningún test.
- [x] 3.2 Si algún caso falla: documentar el cambio de comportamiento real encontrado,
      ajustar el código de manejo de errores del endpoint afectado (no el test) para
      preservar el contrato de `specs/carga-archivos-multer`, y volver a verificar.
      → Ningún caso de runtime falló. El único desvío encontrado fue de TIPOS: multer 2.2.0
      NO publica tipos propios (la decisión del design.md era incorrecta — no hay `types`
      en su package.json ni `.d.ts` en el paquete). En vez de remover `@types/multer`, se
      subió a `@types/multer@^2.2.0` (DefinitelyTyped ya publica la línea 2.x) en los 4
      servicios. Cero cambios en código de producción.
- [x] 3.3 `tsc --noEmit` en `gerencia-tecnica`, `compras`, `calidad`, `asistente` — confirma
      que remover `@types/multer` no deja tipos rotos (multer 2.x debe cubrir los mismos
      usos con sus tipos nativos).
      → Verificado con `@types/multer@2.2.0` (ver 3.2): `tsc --noEmit` limpio en los 4.

## 4. Verificación de suite completa

- [x] 4.1 Suite completa de integración de los 4 microservicios (no solo los tests nuevos)
      en verde — confirmar que el bump no rompió ninguna otra ruta que dependa
      indirectamente de Express/middleware compartido.
      → Verificado 2026-07-14 contra `multer@2.2.0`:
      compras 25/25 PASS; gerencia-tecnica 6/6 PASS (`ventas-a-obra` exige apuntar servicio
      y test al MISMO Postgres — en esta máquina `localhost:5432` resuelve a un Postgres de
      WSL vía `::1`/wslrelay mientras Docker publica en `::`; con
      `DATABASE_URL=...@127.0.0.1:5432/...?schema=gerencia_tecnica` pasa 3 corridas
      seguidas); calidad 15/16 (adjuntos 3/3, aislamiento 4/4, hallazgo-a-nc 5/5,
      workflow-nc 3/4 — el fallo `testReaperturaAdmin` 403≠200 es bug legacy PREEXISTENTE,
      sin relación con multer: `apps/calidad/src/main.ts` destructura `rol` singular de
      `securityContext` pero el auth-middleware solo publica `roles[]`, desde el commit
      dc95f22; este change no toca esos archivos — pendiente de su propio spec de bug-fix);
      asistente: multer 3/3 + session-store 2/2 PASS; `chat.integration.test.ts` omitido
      (llama al API real de Anthropic, no hay ANTHROPIC_API_KEY local, no involucra multer).
- [x] 4.2 `npm audit` en la raíz: confirmar que las 40 alertas de `multer` ya no aparecen
      como abiertas.
      → Verificado 2026-07-14: `npm audit` ya no reporta NINGUNA alerta de multer. Solo
      quedan las 3 vulnerabilidades documentadas como fuera de alcance en design.md
      (`xlsx` high sin fix disponible, `uuid` moderate ×2 vía `exceljs`).

## 5. Cierre

- [x] 5.1 Redeploy manual en VPS de los 4 contenedores (`gerencia-tecnica`, `compras`,
      `calidad`, `asistente`) — build + `up -d`, uno por uno, verificando `docker ps`
      healthy antes de seguir al siguiente (sin migración de BD).
      → Hecho 2026-07-14 tras merge de PR #62 (multer) y PR #63 (axios/overrides, chore
      aparte): redeploy secuencial de 9 contenedores (los 4 de multer + control-proyectos,
      personal, seguridad, ventas y app-shell por el bump de axios), script nohup en el VPS
      con espera de healthy por servicio. Verificación final por contenedor: los 9
      recreados hoy (15:19–15:28 UTC), `health=healthy`, y `multer@2.2.0` + `axios@1.18.1`
      confirmados DENTRO de los 8 contenedores backend (app-shell es nginx estático, sin
      node). Smoke test de producción: https://iretum.com y los 7 health endpoints → 200.
- [x] 5.2 Confirmar en el panel de Dependabot de GitHub que las 40 alertas de `multer`
      pasan a estado `fixed`.
      → Verificado 2026-07-14 vía API de GitHub tras el merge del PR #62: las 40 alertas
      de multer están en estado `fixed` (0 abiertas). Las alertas de axios/qs/tmp/form-data
      también cerraron con el PR #63. Quedan abiertas (fuera de alcance): xlsx ×4 high
      (sin fix), uuid ×1, js-yaml, hono ×5, @opentelemetry/core ×2, @babel/core ×1.
