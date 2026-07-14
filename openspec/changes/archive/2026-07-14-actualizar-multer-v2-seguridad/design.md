## Context

`multer@^1.4.5-lts.1` está declarado directo en 4 microservicios (`gerencia-tecnica`,
`compras` ×2 instancias, `calidad`, `asistente`), todos con el mismo patrón: `multer({ dest
| storage, limits: { fileSize }, fileFilter })` + `.single(<campo>)` + chequeo de
`multer.MulterError` / `err instanceof multer.MulterError` para dar un 413/400 legible. Los
8 CVEs abiertos (Denegación de Servicio: recursión no controlada, streams sin cerrar,
excepciones no manejadas, agotamiento de recursos) solo están corregidos desde
`2.1.0`/`2.1.1`.

Todos los usos son de **un solo archivo por request** (`.single()`), ninguno usa
`.array()`, `.fields()`, `.any()` ni `storage` personalizado más allá de
`multer.memoryStorage()` — la superficie de riesgo de romper algo con el salto de versión
mayor es acotada a estos 4 archivos.

## Goals / Non-Goals

**Goals:**
- Eliminar las 40 alertas de Dependabot subiendo a una versión de `multer` sin los CVEs
  conocidos (`^2.1.1`).
- Cero cambio de comportamiento observable: mismos límites de tamaño, mismos mensajes de
  error, mismo almacenamiento (disco vs. memoria) por servicio.
- Dejar cada endpoint de upload cubierto por un test de integración que primero se corre
  contra la versión 1.x (comportamiento base) y luego se confirma sin cambios contra 2.x.

**Non-Goals:**
- No se migra ningún endpoint a `.array()`/`.fields()` ni se rediseña el manejo de
  archivos — solo se sube la dependencia.
- No se toca la lógica de negocio downstream de cada endpoint (qué se hace con el archivo
  una vez subido).
- No se resuelven en este change las otras 2 vulnerabilidades pendientes (`xlsx` sin fix
  disponible, `uuid`/`exceljs` que requeriría downgrade mayor) — quedan fuera de alcance.

## Decisions

- **Versión objetivo `^2.1.1`** (no `^2.0.x`): varios de los 8 CVEs solo se corrigieron en
  parches posteriores a `2.0.2` (ver rangos vulnerables `>=1.4.4-lts.1, <2.0.0/2.0.1/2.0.2`,
  `<2.1.0`, `<2.1.1`) — solo `2.1.1`+ cierra los 8 a la vez.
- **~~Remover~~ Actualizar `@types/multer` a `^2.2.0` en los 4 `package.json`** (corregido
  durante la implementación): la suposición original de que multer 2.x publica sus propios
  tipos resultó FALSA — `multer@2.2.0` no trae `types` en su package.json ni ningún `.d.ts`
  (verificado empíricamente: removerlo rompía `tsc --noEmit` en los 4 servicios con TS7016).
  DefinitelyTyped publica `@types/multer` 2.x alineado con multer 2.x, así que el paquete se
  conserva y se sube de `^1.4.x` a `^2.2.0`.
- **`fileFilter` sin cambios de firma**: multer 2.x conserva `fileFilter(req, file, cb)`
  con `cb(error)` / `cb(null, true)` / `cb(null, false)` — no requiere reescribir la lógica
  existente en ninguno de los 4 servicios.
- **Verificación por reproducción, no por lectura de changelog únicamente**: dado que no
  hay forma 100% confiable de enumerar cada cambio de comportamiento interno de multor 2.x
  sin acceso a documentación externa en este entorno, la tarea de verificación es empírica:
  test de integración real (subir archivo válido, tipo rechazado, archivo que excede
  límite) corrido primero contra 1.x para fijar el comportamiento esperado, y de nuevo
  contra 2.x para confirmar que no cambió — en vez de confiar en una lista de "breaking
  changes" no verificada.

## Risks / Trade-offs

- **[Riesgo] Multer 2.x podría cambiar el código de error exacto de `MulterError` en algún
  caso límite** (ej. `LIMIT_FILE_SIZE` sigue existiendo, pero algún código secundario podría
  variar) → Mitigación: el test de integración de "archivo que excede el límite" verifica el
  código exacto (`err.code === 'LIMIT_FILE_SIZE'`) contra la respuesta HTTP real (413), no
  solo que se lance un error genérico.
- **[Riesgo] `apps/compras` tiene 2 instancias de multer (`cotizacionesMulter`,
  `docsMulter`) en el mismo archivo `main.ts`** → deben verificarse las dos por separado,
  no asumir que una prueba cubre ambas.
- **[Riesgo] Redeploy VPS necesario en 4 contenedores a la vez** (mismo `package-lock.json`
  raíz ya trae la resolución nueva de `multer` una vez mergeado) → Mitigación: rebuild y
  `up -d` servicio por servicio (mismo patrón ya usado en redeploys anteriores), verificando
  `docker ps` en estado `healthy` antes de seguir al siguiente.
- **[Trade-off] No se resuelve `xlsx`/`uuid` en este change** — quedan como vulnerabilidades
  conocidas y aceptadas explícitamente hasta que haya una decisión de producto (migrar de
  librería o aceptar el riesgo).

## Migration Plan

1. Test de integración por servicio que reproduce el comportamiento actual contra
   `multer@1.x` (subida válida, tipo rechazado, límite excedido) — debe pasar en verde
   contra el código actual antes de tocar nada (ver tasks.md sección 1).
2. Bump de `multer` a `^2.1.1` y remoción de `@types/multer` en los 4 `package.json`,
   `npm install` en la raíz para regenerar `package-lock.json`.
3. Re-correr los mismos tests de integración contra `multer@2.x` — deben seguir pasando sin
   modificar el test.
4. `tsc --noEmit`/`tsc -b` en los 4 microservicios (confirma que remover `@types/multer` no
   deja tipos rotos).
5. Redeploy manual en VPS de los 4 contenedores (`gerencia-tecnica`, `compras`, `calidad`,
   `asistente`) — sin migración de base de datos.
6. Confirmar en el panel de Dependabot que las 40 alertas de `multer` pasan a `fixed`.

**Rollback**: revertir el commit del bump (`package.json` × 4 + `package-lock.json`) y
redeploy — no hay cambios de esquema de base de datos ni de contrato de API que revertir
por separado.

## Open Questions

(ninguna — el alcance quedó acotado a los 4 usos existentes, todos con el mismo patrón
simple de `.single()`)
