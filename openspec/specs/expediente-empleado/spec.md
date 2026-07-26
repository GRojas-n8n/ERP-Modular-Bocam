## ADDED Requirements

### Requirement: RH sube documentos al expediente del empleado
El sistema SHALL permitir a un usuario con rol `personal_rh` o `admin` subir un documento al expediente de un empleado, indicando `tipo_documento` (`INE`, `COMPROBANTE_DOMICILIO`, `CURSO_CAPACITACION`, `CONTRATO`, `OTRO`) y opcionalmente `fecha_vigencia`. `tenant_id` se lee del JWT, nunca del body.

#### Scenario: Subida exitosa de INE
- **WHEN** RH sube un archivo `.pdf` de 2 MB como `tipo_documento = INE` para un empleado existente
- **THEN** el sistema guarda el archivo y crea un registro `DocumentoEmpleado` con `mime_type`, `tamano_bytes` y `created_at`, y lo retorna con `201`

#### Scenario: Constancia de capacitación con vigencia
- **WHEN** RH sube un documento con `tipo_documento = CURSO_CAPACITACION` y `fecha_vigencia = 2027-01-15`
- **THEN** el sistema guarda `fecha_vigencia` en el registro

#### Scenario: Rol sin permiso intenta subir documento
- **WHEN** un usuario con rol distinto a `personal_rh`/`admin` intenta subir un documento
- **THEN** el sistema responde `403`

### Requirement: Tipo y tamaño de archivo permitido en expediente
El sistema SHALL aceptar únicamente archivos `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx` para el expediente, validados por extensión y MIME type, con un tamaño máximo de 50 MB por archivo.

#### Scenario: Archivo con extensión no permitida
- **WHEN** RH intenta subir un archivo `.exe`
- **THEN** el sistema responde `400` con mensaje "Tipo de archivo no permitido"

#### Scenario: Archivo excede el límite de tamaño
- **WHEN** RH intenta subir un archivo de 60 MB
- **THEN** el sistema responde `400` con mensaje "El archivo supera el límite de 50 MB"

### Requirement: Almacenamiento aislado por tenant y empleado
El sistema SHALL guardar cada archivo en la ruta `/data/personal/uploads/{tenant_id}/{empleado_id}/{documento_id}{extension}`, creando los directorios necesarios. Si el guardado en disco falla, no SHALL crear el registro en base de datos; si el registro en base de datos falla después de guardar el archivo, el sistema SHALL eliminar el archivo del disco.

#### Scenario: Falla al guardar en disco
- **WHEN** el volumen no tiene espacio disponible durante la subida
- **THEN** el sistema responde `500` y no crea ningún registro `DocumentoEmpleado`

#### Scenario: Falla al insertar en base de datos tras guardar archivo
- **WHEN** el archivo se guarda correctamente pero la inserción en BD falla
- **THEN** el sistema elimina el archivo recién guardado del disco y responde `500`

### Requirement: RH consulta y descarga el expediente de un empleado
El sistema SHALL exponer `GET /api/v1/personal/empleados/:id/documentos` que retorna la lista de documentos del empleado (sin el contenido binario) y `GET /api/v1/personal/empleados/:id/documentos/:documentoId/archivo` que retorna el archivo binario, ambos restringidos a rol `personal_rh` o `admin`.

#### Scenario: Listar expediente completo
- **WHEN** RH consulta `GET /api/v1/personal/empleados/:id/documentos`
- **THEN** el sistema retorna todos los documentos del empleado con `tipo_documento`, `nombre_archivo`, `fecha_vigencia` y `created_at`

#### Scenario: Descargar un documento del expediente
- **WHEN** RH solicita `GET /api/v1/personal/empleados/:id/documentos/:documentoId/archivo`
- **THEN** el sistema retorna el archivo binario con el `mime_type` original

#### Scenario: Otro rol intenta consultar el expediente
- **WHEN** un usuario con rol `residencia` intenta listar el expediente de un empleado
- **THEN** el sistema responde `403`

### Requirement: RH elimina un documento del expediente
El sistema SHALL permitir a un usuario con rol `personal_rh` o `admin` eliminar un documento del expediente, borrando tanto el registro en base de datos como el archivo en disco.

#### Scenario: Eliminación exitosa
- **WHEN** RH elimina un documento existente
- **THEN** el sistema borra el registro `DocumentoEmpleado` y el archivo correspondiente en disco, respondiendo `204`

### Requirement: RH consulta el panel de documentos por vencer
El sistema SHALL exponer `GET /api/v1/personal/documentos/por-vencer?dias=N` (default `dias=30`), restringido a rol `personal_rh` o `admin`, que retorna los documentos con `fecha_vigencia` definida cuyo vencimiento cae dentro de los próximos `N` días o que ya vencieron, incluyendo `empleado_id`, `nombre` del empleado, `tipo_documento`, `fecha_vigencia`, `dias_restantes` (negativo si ya venció) y `estado` (`VENCIDO` | `POR_VENCER`).

#### Scenario: Documento próximo a vencer dentro del umbral
- **WHEN** existe un documento con `fecha_vigencia` a 10 días de hoy y se consulta con `dias=30`
- **THEN** el documento aparece en la respuesta con `estado = POR_VENCER` y `dias_restantes = 10`

#### Scenario: Documento ya vencido
- **WHEN** existe un documento con `fecha_vigencia` anterior a hoy
- **THEN** el documento aparece en la respuesta con `estado = VENCIDO` y `dias_restantes` negativo, independientemente del valor de `dias`

#### Scenario: Documento sin fecha de vigencia
- **WHEN** un documento tiene `fecha_vigencia = null` (ej. INE, contrato)
- **THEN** el documento NO aparece en la respuesta de este endpoint

#### Scenario: Documento fuera del umbral consultado
- **WHEN** existe un documento con `fecha_vigencia` a 60 días de hoy y se consulta con `dias=30`
- **THEN** el documento NO aparece en la respuesta

### Requirement: Alerta agregada de vencimientos en el dashboard de Personal
El endpoint `GET /api/v1/personal/dashboard` SHALL incluir en su array `alertas` una entrada agregada cuando existan documentos vencidos o por vencer, con `tipo = DOCUMENTO_POR_VENCER`, conteo total y severidad `critica` si hay al menos un documento vencido, o `advertencia` si solo hay documentos por vencer (ninguno vencido aún).

#### Scenario: Hay documentos vencidos
- **WHEN** el tenant tiene 2 documentos vencidos y 3 por vencer dentro de 30 días
- **THEN** el dashboard incluye una alerta `DOCUMENTO_POR_VENCER` con severidad `critica` mencionando el total (5)

#### Scenario: Solo hay documentos por vencer, ninguno vencido
- **WHEN** el tenant tiene 3 documentos por vencer dentro de 30 días y ninguno vencido
- **THEN** el dashboard incluye una alerta `DOCUMENTO_POR_VENCER` con severidad `advertencia`

#### Scenario: No hay documentos por vencer ni vencidos
- **WHEN** ningún documento tiene `fecha_vigencia` dentro de los próximos 30 días ni vencida
- **THEN** el dashboard no incluye alerta `DOCUMENTO_POR_VENCER`

### Requirement: Aislamiento de `documentos_empleado` reforzado por RLS
La tabla `documentos_empleado` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK`. Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts`, dado que el expediente contiene documentos de identidad (INE, comprobante de domicilio, contratos) con datos personales sensibles.

#### Scenario: Un tenant no puede listar ni descargar documentos de otro tenant
- **WHEN** una consulta ejecuta `SELECT`/`findFirst` sobre `documentos_empleado` con `app.current_tenant_id` fijado a un tenant distinto al dueño del documento
- **THEN** la consulta retorna 0 filas, incluso si el `id_documento`/`empleado_id` coinciden y la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Subida de documento no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `documentos_empleado` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`
