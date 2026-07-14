## Why

Dependabot reporta 40 alertas (todas de severidad alta, Denegación de Servicio) sobre
`multer@^1.4.5-lts.1` en `apps/gerencia-tecnica`, `apps/compras`, `apps/calidad` y
`apps/asistente` — 8 CVEs distintos (recursión no controlada, fugas de memoria por streams
sin cerrar, excepciones no manejadas por requests malformados, agotamiento de recursos,
limpieza incompleta) todos corregidos únicamente a partir de `multer@2.1.0`/`2.1.1`. No hay
manera de resolverlas sin subir la versión mayor — es un salto 1.x → 2.x con posibles
cambios de API en el manejo de uploads que exige revisar cada uso antes de aplicar.

## What Changes

- Subir `multer` de `^1.4.5-lts.1` a `^2.1.1` en los 4 microservicios que lo usan
  directamente: `gerencia-tecnica` (fichas técnicas), `compras` (PDFs de cotización +
  documentos de proveedor), `calidad` (adjuntos), `asistente` (lectura de PDF de
  cotización por IA).
- Sin cambios de comportamiento observable para el usuario: mismos endpoints, mismos
  límites de tamaño de archivo, mismos mensajes de error (`LIMIT_FILE_SIZE`, tipo de
  archivo no permitido), mismo almacenamiento (`dest` en disco o `memoryStorage()` según
  el servicio).
- Los 4 usos actuales son simples y consistentes (un solo campo vía `.single()`,
  `fileFilter` de 2 argumentos, `limits.fileSize`, chequeo de `multer.MulterError`) — no
  usan `.fields()`, `.array()` ni opciones avanzadas que multer 2.x haya podido alterar
  más profundamente.
- Se agregan tests de integración por microservicio que reproducen el comportamiento
  actual (subida válida, tipo de archivo rechazado, archivo que excede el límite) contra
  la versión 1.x vigente, y se verifica que sigan pasando igual tras el bump — el
  "bug" a reproducir aquí es la superficie de comportamiento actual que no debe romperse,
  no un defecto funcional.

## Capabilities

### New Capabilities
- `carga-archivos-multer`: contrato de comportamiento de los 4 endpoints de subida de
  archivos (límite de tamaño, filtro de tipo de archivo, almacenamiento) — no existía
  documentado antes de este change. Se documenta ahora como el comportamiento que la
  actualización de `multer` NO debe alterar, y sirve de contrato de regresión para
  cualquier cambio futuro a estos endpoints.

### Modified Capabilities
(ninguna)

## Impact

- **Backend**: `apps/gerencia-tecnica/src/main.ts`, `apps/compras/src/main.ts` (2 instancias
  de multer), `apps/calidad/src/main.ts`, `apps/asistente/src/routes/leer-cotizacion.ts`.
- **Dependencias**: `package.json` de los 4 microservicios (`multer: ^1.4.5-lts.1` →
  `^2.1.1`) + `package-lock.json` raíz.
- **Sin impacto de frontend** ni de contrato de API — los 4 endpoints ya existentes no
  cambian su firma request/response.
- **Redeploy VPS requerido** tras el merge: los 4 contenedores (`gerencia-tecnica`,
  `compras`, `calidad`, `asistente`) necesitan rebuild para tomar la dependencia nueva
  (no hay migración de base de datos involucrada).
