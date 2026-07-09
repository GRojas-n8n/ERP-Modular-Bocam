## Why

Durante pruebas de campo en vivo (2026-07-08), el usuario real de Gerencia Técnica
recibió `403` al intentar subir el catálogo de conceptos, y por separado la
composición APU se "importó" sin errores visibles pero sin vincular ningún insumo
(0 filas en `concepto_insumos`). Ambos bloqueaban por completo el flujo de
importación OPUS del módulo, que es el primer paso de todo el ciclo de control
presupuestal.

## What Changes

- `POST /api/v1/gerencia-tecnica/insumos`, `PATCH /api/v1/gerencia-tecnica/insumos/:id`
  y `POST /api/v1/gerencia-tecnica/presupuestos` exigían el rol `technical`, que
  **no existe** en la lista de roles asignables de AdminView (solo existe
  `gerencia_tecnica`) — ningún usuario real podía llamarlos nunca. Se agrega
  `gerencia_tecnica` a los tres endpoints.
- `express.json()` en `gerencia-tecnica` usaba el límite default de Express (100kb).
  El payload de composición APU (partida × insumo con cantidades/rendimientos de un
  catálogo real de ~250 insumos) lo excede fácilmente, fallando con
  `PayloadTooLargeError` de forma silenciosa para el usuario (el toast de éxito solo
  mencionaba el detalle como texto secundario). Se sube el límite a 15mb en Express
  y se agrega `client_max_body_size 20m` en la ruta de nginx correspondiente.

## Capabilities

### New Capabilities
- `permisos-catalogo-gerencia-tecnica`: Define qué roles pueden crear/editar insumos
  y presupuestos del catálogo GT, y el límite de tamaño aceptado para la importación
  de composición APU — ninguno de los dos estaba documentado como requerimiento antes
  de este bug.

## Impact

- `apps/gerencia-tecnica/src/main.ts` — roles permitidos en 3 endpoints + límite de
  `express.json()`
- `docker/nginx.qnap.conf` — `client_max_body_size` para `/api/v1/gerencia-tecnica`

## Nota SDD

*Este change se implementó y desplegó fuera del flujo SDD estándar (sin spec previo,
sin tests-first) durante pruebas de campo en vivo. Se documenta retroactivamente al
cierre de la sesión.*
