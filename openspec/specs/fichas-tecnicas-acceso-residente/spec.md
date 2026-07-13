# fichas-tecnicas-acceso-residente Specification

## Purpose

Cubre el acceso del rol Residente a las fichas técnicas por insumo del
catálogo — subirlas y consultarlas usando los mismos endpoints que ya
usan Compras y Gerencia Técnica.

## Requirements

### Requirement: El Residente SHALL poder subir y consultar fichas técnicas por insumo
El sistema SHALL permitir a un usuario con rol `residencia` (o el legacy
`resident`) subir, listar y descargar fichas técnicas vinculadas a un
insumo del catálogo, usando los mismos endpoints ya disponibles para
Compras y Gerencia Técnica
(`POST/GET/DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas[...]`).

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
