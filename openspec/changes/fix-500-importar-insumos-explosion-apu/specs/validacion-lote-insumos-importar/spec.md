## ADDED Requirements

### Requirement: El backend SHALL validar longitud y rango de los campos de un Insumo antes de escribir a la base de datos
`POST /api/v1/gerencia-tecnica/insumos` y `PATCH /api/v1/gerencia-tecnica/insumos/:id` SHALL validar, antes de invocar `prisma.insumo.create()`/`update()`, que `clave` no exceda 50 caracteres, `unidad_medida` no exceda 20 caracteres, y `costo_base` esté en el rango `0`–`99,999,999.9999` (límite de la columna `DECIMAL(12,4)`). Un error de validación NO SHALL exponer el mensaje interno de Prisma/Postgres al cliente.

#### Scenario: Clave más larga que el límite de la columna (alta individual)
- **WHEN** un usuario con rol autorizado hace `POST /api/v1/gerencia-tecnica/insumos` con `clave` de más de 50 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'` y un detalle que nombra el campo `clave` y su límite, y NO SHALL crearse ningún registro en la base de datos

#### Scenario: Unidad de medida más larga que el límite de la columna (edición)
- **WHEN** un usuario con rol autorizado hace `PATCH /api/v1/gerencia-tecnica/insumos/:id` con `unidad_medida` de más de 20 caracteres
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'`, y el registro existente NO SHALL modificarse

#### Scenario: Costo base fuera del rango de la columna
- **WHEN** un usuario con rol autorizado hace `POST /api/v1/gerencia-tecnica/insumos` o `PATCH /api/v1/gerencia-tecnica/insumos/:id` con `costo_base` mayor a `99,999,999.9999`
- **THEN** la respuesta SHALL ser `400` con `error.code: 'VALIDATION_ERROR'` y un detalle que nombra el campo `costo_base`

#### Scenario: Un error inesperado del servidor no expone el mensaje interno de Prisma/Postgres
- **WHEN** `POST /insumos` o `PATCH /insumos/:id` fallan por una causa no relacionada con la validación de longitud/rango
- **THEN** la respuesta `500` SHALL incluir un mensaje genérico del endpoint, sin el texto crudo de la excepción de Prisma/Postgres

### Requirement: La importación en lote SHALL validar cada fila con los mismos límites, sin abortar el lote completo
`POST /api/v1/gerencia-tecnica/insumos/importar-lote` SHALL aplicar los mismos límites de longitud (`clave` ≤50, `unidad_medida` ≤20) y rango (`costo_base` 0–99,999,999.9999) a cada fila del lote. Una fila que viole cualquiera de estos límites SHALL contarse como omitida, con el motivo específico, igual que ya ocurre hoy con un `tipo_insumo` inválido o un campo obligatorio ausente — el lote SHALL seguir procesando el resto de las filas válidas.

#### Scenario: Una fila del lote con clave demasiado larga no aborta el resto
- **WHEN** `POST /insumos/importar-lote` recibe un array de insumos donde una fila tiene `clave` de más de 50 caracteres y el resto son válidas
- **THEN** la respuesta SHALL ser `200`, la fila inválida SHALL contarse en `omitidos`, y las filas válidas restantes SHALL crearse/actualizarse normalmente

#### Scenario: Una fila del lote con costo_base fuera de rango no aborta el resto
- **WHEN** `POST /insumos/importar-lote` recibe un array de insumos donde una fila tiene `costo_base` mayor a `99,999,999.9999` y el resto son válidas
- **THEN** la respuesta SHALL ser `200`, la fila inválida SHALL contarse en `omitidos`, y las filas válidas restantes SHALL crearse/actualizarse normalmente

### Requirement: La vista previa de importación en el frontend SHALL marcar como inválida una fila fuera de los límites de columna
`InsumosView.tsx` SHALL marcar como inválida (`_valido: false`, con `_error` descriptivo) cualquier fila extraída por `parsearArchivoAPU` o `parsearArchivoExplosion` cuya `clave` exceda 50 caracteres, `unidad_medida` exceda 20 caracteres, o `costo_base` exceda `99,999,999.9999`, antes de que el usuario confirme la importación.

#### Scenario: El parser detecta una clave fuera de rango en el archivo de Explosión o APU
- **WHEN** una fila del archivo importado (Explosión de Insumos o APU) produce una `clave` de más de 50 caracteres
- **THEN** la fila SHALL aparecer en el panel de vista previa como inválida, con un `_error` que menciona el límite excedido, y NO SHALL incluirse en `validPreviewInsumos` al confirmar
