## MODIFIED Requirements

### Requirement: El Residente SHALL poder subir y consultar fichas técnicas por insumo
El sistema SHALL permitir a un usuario con rol `residencia` (o el legacy
`resident`) subir, listar y descargar fichas técnicas vinculadas a un
insumo del catálogo, usando los mismos endpoints ya disponibles para
Compras y Gerencia Técnica
(`POST/GET /api/v1/gerencia-tecnica/insumos/:id/fichas[...]`). El sistema SHALL
rechazar con `403` cualquier intento de un usuario con rol `residencia` (o
`resident`, `procurement`, `gerencia_tecnica`) de eliminar una ficha técnica: a partir de
este cambio `DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid` SHALL aceptar
únicamente al rol `admin`.

#### Scenario: Residente sube una ficha técnica para un insumo
- **WHEN** un usuario con rol `residencia` envía `POST
  /api/v1/gerencia-tecnica/insumos/:id/fichas` con un archivo válido
- **THEN** el sistema responde 201 y la ficha queda persistida, igual que
  si la hubiera subido Compras o Gerencia Técnica

#### Scenario: Residente consulta las fichas técnicas de un insumo
- **WHEN** un usuario con rol `residencia` envía `GET
  /api/v1/gerencia-tecnica/insumos/:id/fichas`
- **THEN** el sistema responde 200 con la lista de fichas del insumo, sin
  el 403 que recibía antes de este change

#### Scenario: Residente intenta eliminar una ficha técnica
- **WHEN** un usuario con rol `residencia` (o `resident`) envía `DELETE
  /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid`
- **THEN** el sistema responde `403` y no elimina la ficha

#### Scenario: Compras o Gerencia Técnica intentan eliminar una ficha técnica
- **WHEN** un usuario con rol `procurement` o `gerencia_tecnica` envía `DELETE
  /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid`
- **THEN** el sistema responde `403` y no elimina la ficha

#### Scenario: Admin elimina una ficha técnica
- **WHEN** un usuario con rol `admin` envía `DELETE
  /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid`
- **THEN** el sistema responde `200` (o `204`) y elimina el archivo físico y el registro,
  sin cambios respecto al comportamiento actual para ese rol
