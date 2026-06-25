## ADDED Requirements

### Requirement: Subir ficha técnica vinculada a un insumo
El sistema SHALL permitir a los roles `procurement`, `gerencia_tecnica` y `admin` subir un archivo (PDF, Word, imagen) como ficha técnica de un insumo del catálogo. El archivo se almacena en el filesystem del VPS bajo `FICHAS_UPLOAD_DIR` y se registra en `FichaTecnicaInsumo` con metadatos (`nombre_doc`, `proveedor_ref`, `ruta_archivo`, `mime_type`, `subido_por`).

#### Scenario: Upload exitoso de ficha técnica
- **WHEN** usuario con rol permitido hace `POST /api/v1/gerencia-tecnica/insumos/:id/fichas` con `multipart/form-data` (campo `archivo`, campo `proveedor_ref`, campo `nombre_doc`)
- **THEN** el sistema guarda el archivo en disco, crea el registro en `FichaTecnicaInsumo` y responde `201` con el objeto creado

#### Scenario: Archivo supera el límite de tamaño
- **WHEN** el archivo supera 20 MB (configurable vía `FICHAS_MAX_SIZE_MB`)
- **THEN** el sistema responde `400` con mensaje "El archivo supera el límite permitido" y no persiste nada

#### Scenario: Extensión no permitida
- **WHEN** se sube un archivo con extensión no incluida en `.pdf .doc .docx .jpg .jpeg .png`
- **THEN** el sistema responde `400` con mensaje "Tipo de archivo no permitido" y no persiste nada

#### Scenario: Insumo no encontrado
- **WHEN** el `insumo_id` no existe para el `tenant_id` del token
- **THEN** el sistema responde `404` y elimina el archivo temporal

### Requirement: Listar fichas técnicas de un insumo
El sistema SHALL permitir a los roles `resident`, `control_obra`, `gerencia_tecnica`, `superintendent`, `procurement` y `admin` obtener la lista de fichas técnicas de un insumo vía `GET /api/v1/gerencia-tecnica/insumos/:id/fichas`.

#### Scenario: Listado con fichas existentes
- **WHEN** se consulta el endpoint con un `insumo_id` válido
- **THEN** el sistema responde `200` con array de `{ id, nombre_doc, proveedor_ref, mime_type, tamano_bytes, subido_por, created_at }`

#### Scenario: Insumo sin fichas
- **WHEN** el insumo existe pero no tiene fichas registradas
- **THEN** el sistema responde `200` con array vacío `[]`

### Requirement: Descargar ficha técnica
El sistema SHALL permitir a todos los roles con acceso de consulta descargar el archivo físico vía `GET /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid/descargar`. La respuesta incluye el header `Content-Disposition: attachment` con el nombre original del documento.

#### Scenario: Descarga exitosa
- **WHEN** usuario con rol de consulta solicita descarga de una ficha existente
- **THEN** el sistema responde con el binario del archivo y headers correctos de `Content-Type` y `Content-Disposition`

#### Scenario: Ficha no encontrada o pertenece a otro tenant
- **WHEN** el `fid` no existe o su `tenant_id` no coincide con el del token
- **THEN** el sistema responde `404`

### Requirement: Eliminar ficha técnica
El sistema SHALL permitir a los roles `procurement`, `gerencia_tecnica` y `admin` eliminar una ficha técnica vía `DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid`. La eliminación borra el registro de BD y el archivo del filesystem.

#### Scenario: Eliminación exitosa
- **WHEN** usuario con rol permitido elimina una ficha existente
- **THEN** el sistema borra el archivo del disco, elimina el registro de BD y responde `200`

#### Scenario: Archivo ya no existe en disco
- **WHEN** el registro existe en BD pero el archivo no está en el filesystem
- **THEN** el sistema elimina el registro de BD de todas formas y responde `200` (degradación elegante)

### Requirement: Acceso a fichas desde el cuadro comparativo
El sistema SHALL mostrar en cada fila de partida del cuadro comparativo un badge con el número de fichas técnicas disponibles para ese insumo. Al hacer clic se abre un SideSheet donde se pueden ver, descargar y (si el rol lo permite) subir fichas.

#### Scenario: Badge con fichas disponibles
- **WHEN** el cuadro comparativo carga y el insumo de la partida tiene fichas registradas
- **THEN** se muestra un badge `📎 N fichas` en la fila de la partida

#### Scenario: Badge sin fichas
- **WHEN** el insumo no tiene fichas registradas
- **THEN** se muestra un botón discreto `+ Subir ficha` visible solo para roles con permiso de upload

#### Scenario: Upload desde SideSheet de fichas en comparativa
- **WHEN** Compras hace clic en `+ Subir ficha` dentro del SideSheet de una partida
- **THEN** se abre el selector de archivo; al confirmar, se hace `POST` a `gerencia-tecnica/insumos/:id/fichas` y el listado se refresca automáticamente
