# auth-verificacion-endurecida Specification

## Purpose

Endurece la verificación de identidad en `auth`: el algoritmo de firma JWT
aceptado se declara explícitamente en vez de inferirse implícitamente, y la
comparación del secreto maestro administrativo es de tiempo constante para
no filtrar información por canal lateral de tiempo.

## Requirements

### Requirement: La verificación de JWT SHALL declarar explícitamente el algoritmo de firma aceptado
`createAuthMiddleware` SHALL pasar `algorithms: ['HS256']` a `jwt.verify`, en vez de depender del algoritmo inferido implícitamente por el tipo de la clave, de forma que la política de firma aceptada quede declarada en el código y no dependa del comportamiento por defecto de la librería `jsonwebtoken`.

#### Scenario: Token firmado con HS256 (algoritmo esperado)
- **WHEN** llega un request con un JWT válido firmado con `HS256` y el `JWT_SECRET` correcto
- **THEN** el middleware SHALL aceptarlo y construir el `SecurityContext` normalmente, igual que antes de este cambio

#### Scenario: Token firmado con un algoritmo distinto al declarado
- **WHEN** llega un JWT firmado con un algoritmo que no está en la lista `algorithms` declarada (por ejemplo, si algún día se emitiera con `HS384` sin actualizar el emisor)
- **THEN** el middleware SHALL rechazarlo con 401, sin importar si la firma es criptográficamente válida para ese otro algoritmo

### Requirement: La comparación del secreto maestro administrativo SHALL ser de tiempo constante
`requireMasterSecret` en `apps/auth` SHALL comparar el secreto recibido contra `MASTER_SECRET` usando `crypto.timingSafeEqual`, en vez de una comparación de string estándar (`!==`) que hace short-circuit en el primer carácter distinto.

#### Scenario: Secreto maestro correcto
- **WHEN** una petición a `/api/v1/master/*` incluye el `MASTER_SECRET` correcto en el header `Authorization: Bearer <secret>`
- **THEN** la petición SHALL autorizarse igual que antes de este cambio

#### Scenario: Secreto maestro incorrecto de cualquier longitud
- **WHEN** una petición a `/api/v1/master/*` incluye un secreto incorrecto, sin importar en qué posición difiera del secreto real o si su longitud coincide
- **THEN** la petición SHALL rechazarse con 401 en un tiempo que no varíe de forma medible según cuántos caracteres iniciales coincidan con el secreto real
