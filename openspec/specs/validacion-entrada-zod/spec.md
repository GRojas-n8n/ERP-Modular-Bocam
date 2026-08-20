# validacion-entrada-zod Specification

## Purpose

Todo endpoint de escritura de `apps/auth` valida su entrada con un schema
Zod dedicado antes de tocar Prisma, reemplazando los chequeos manuales `if`
previos, con una respuesta de error en el formato estándar del proyecto.

## Requirements

### Requirement: Todo endpoint de escritura de auth SHALL validar su entrada con un schema Zod antes de tocar Prisma
Cada endpoint `POST`/`PATCH`/`DELETE` de `apps/auth/src/main.ts` que reciba datos del cliente SHALL validar `req.body` (y `req.params` cuando el identificador venga de la ruta) contra un schema Zod dedicado antes de ejecutar cualquier operación de Prisma, reemplazando los chequeos manuales `if` existentes.

#### Scenario: Payload válido
- **WHEN** un cliente envía un payload que cumple el schema Zod del endpoint (mismos campos y tipos que hoy se consideran válidos)
- **THEN** el endpoint SHALL procesar la petición exactamente igual que antes de este cambio, sin diferencia observable en la respuesta de éxito

#### Scenario: Payload inválido o con forma inesperada
- **WHEN** un cliente envía un payload que no cumple el schema (campo faltante, tipo incorrecto, o un campo con una forma inesperada como un objeto donde se espera un string)
- **THEN** el endpoint SHALL responder 400 con `success: false`, `error.code: 'VALIDATION_ERROR'` y un detalle por campo que falló, sin ejecutar ninguna operación de Prisma

### Requirement: Un fallo de validación Zod SHALL responder en el formato de error estándar del proyecto
La respuesta de un fallo de validación SHALL seguir la misma forma de error usada por el resto del ERP (`success: false`, objeto `error` con `code` y `message`), agregando un array `error.details` con `{ field, message }` por cada issue reportado por Zod.

#### Scenario: Múltiples campos inválidos en un solo request
- **WHEN** un payload falla la validación en más de un campo a la vez (ej. `email` con formato inválido y `tenant_id` vacío)
- **THEN** la respuesta 400 SHALL incluir todos los issues encontrados en `error.details`, no solo el primero
