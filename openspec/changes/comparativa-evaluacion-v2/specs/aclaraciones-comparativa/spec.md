# Spec — Gestión de Aclaraciones por Celda

## Descripción

Cuando el comprador o el Residente detecta que la información de un proveedor para una partida específica es ambigua o incompleta, puede abrir un hilo de aclaración. El hilo queda ligado a la celda exacta: `(cuadro_id, insumo_id, proveedor_id)`.

## Modelo AclaracionComparativa

Campos: `id_aclaracion`, `tenant_id`, `proyecto_id`, `cuadro_id`, `insumo_id`, `proveedor_id`, `autor_id`, `tipo` (PREGUNTA | RESPUESTA), `mensaje` (Text), `resuelta` (Boolean default false), `created_at`.

## Criterios de Aceptación

1. `POST /api/v1/compras/comparativas/:id/aclaraciones` acepta `{ insumo_id, proveedor_id, tipo, mensaje }`. Valida que `insumo_id` y `proveedor_id` formen una celda existente en el cuadro (existe un `ComparativaDetalle` para ese par). Si no existe, retorna 404.
2. `GET /api/v1/compras/comparativas/:id/aclaraciones` devuelve todos los hilos del cuadro agrupados por `(insumo_id, proveedor_id)`.
3. Las aclaraciones son visibles para todos los roles con acceso al cuadro comparativo.
4. Solo `procurement`, `resident` y `admin` pueden crear aclaraciones.
5. Una aclaración puede crearse en cualquier estado del cuadro EXCEPTO `LOCKED`, `SUPERSEDIDO` y `CERRADO` (retorna 403).
6. En la UI, una celda con aclaraciones no resueltas (`resuelta = false`) muestra el indicador `?` con contador de mensajes pendientes.
7. Marcar una aclaración como resuelta: `PATCH /api/v1/compras/comparativas/:id/aclaraciones/:aid` con `{ resuelta: true }`. Solo el autor original o `admin` pueden resolverla.
8. Cuando todas las aclaraciones de una celda están resueltas, el indicador `?` desaparece.
