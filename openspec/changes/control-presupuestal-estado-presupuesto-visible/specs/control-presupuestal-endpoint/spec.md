## MODIFIED Requirements

### Requirement: Respuesta cuando no hay presupuesto activo
`GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` SHALL distinguir, cuando no exista presupuesto en estado `APROBADO/LIBERADO/CONGELADO`, entre dos casos: (a) no existe ningún presupuesto para el proyecto, y (b) existe un presupuesto en `BORRADOR` o `EN_REVISION` pendiente de aprobación.

#### Scenario: Sin ningún presupuesto para el proyecto
- **WHEN** no existe ningún registro `presupuestoBase` para el `proyecto_id` del JWT
- **THEN** 404 `{ error: "GT_NO_PRESUPUESTO" }`

#### Scenario: Presupuesto existente pendiente de aprobación
- **WHEN** existe un `presupuestoBase` para el proyecto con `estado` en `('BORRADOR', 'EN_REVISION')` y ninguno en `('APROBADO','LIBERADO','CONGELADO')`
- **THEN** 404 `{ error: "GT_PRESUPUESTO_PENDIENTE_APROBACION", presupuesto_id: string, estado: "BORRADOR" | "EN_REVISION" }`
