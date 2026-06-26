## ADDED Requirements

### Requirement: Campo concepto_id en DetallePagoOC
El modelo `DetallePagoOC` en `apps/finanzas/prisma/schema.prisma` SHALL agregar los campos:
- `concepto_id String? @db.Uuid` — UUID del Concepto (partida APU) en GT, nullable para compatibilidad con pagos legacy
- `concepto_clave String? @db.VarChar(100)` — clave desnormalizada del concepto (evita B2B en tiempo de lectura)

#### Scenario: Nuevo pago con concepto_id
- **WHEN** el frontend envía `POST /api/v1/finanzas/pagos` con `detalles[i].concepto_id` y `detalles[i].concepto_clave`
- **THEN** los valores se persisten en `DetallePagoOC` sin validación cruzada (son desnormalizados)

#### Scenario: Pago sin concepto_id (compatibilidad)
- **WHEN** el frontend envía `POST /api/v1/finanzas/pagos` sin `concepto_id` en los detalles
- **THEN** el campo queda `null` y el pago se crea normalmente (sin error)

#### Scenario: Migración sin datos existentes afectados
- **WHEN** se ejecuta `prisma migrate deploy` en el container `finanzas`
- **THEN** la migración agrega las columnas nullable sin tocar filas existentes

### Requirement: Respuesta de GET /finanzas/pagos incluye concepto_id
El endpoint `GET /api/v1/finanzas/pagos` SHALL incluir `concepto_id` y `concepto_clave` en cada `DetallePagoOC` de la respuesta.

#### Scenario: Serialización de pago con concepto
- **WHEN** se consulta `GET /api/v1/finanzas/pagos/:id`
- **THEN** la respuesta incluye `detalles[i].concepto_id` y `detalles[i].concepto_clave` (null si no fue asignado)
