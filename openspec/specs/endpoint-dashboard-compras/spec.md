## ADDED Requirements

### Requirement: GET /api/v1/compras/dashboard
El microservicio compras SHALL exponer `GET /api/v1/compras/dashboard` que retorna KPIs agregados del proyecto activo en una sola respuesta.

Response shape:
```json
{
  "kpis": {
    "total_requisiciones": number,
    "pendiente_aprobacion": number,
    "lista_cotizar": number,
    "cotizando": number,
    "pendiente_gt": number,
    "ocs_emitidas": number,
    "ocs_pendientes_recibir": number
  },
  "alertas": [
    { "tipo": "cotizacion_vencida", "req_id": string, "folio": string, "dias_vencida": number },
    { "tipo": "oc_error_finanzas", "oc_id": string, "oc_codigo": string, "error_message": string, "dias_vencida": number },
    { "tipo": "requisicion_sin_cuadro", "req_id": string, "folio": string, "dias_vencida": number },
    { "tipo": "cuadro_atorado", "cuadro_id": string, "folio": string, "estado": string, "dias_vencida": number }
  ],
  "actividad_reciente": [
    { "id": string, "folio": string, "concepto": string, "estado": string, "updated_at": string }
  ]
}
```

#### Scenario: Dashboard con datos del proyecto
- **WHEN** usuario compras hace `GET /api/v1/compras/dashboard`
- **THEN** retorna 200 con KPIs calculados para el proyecto activo del token

#### Scenario: Alertas de cotización vencida
- **WHEN** existen `SolicitudCotizacion` con `alerta_plazo = true`
- **THEN** aparecen en `alertas[]` con `tipo: "cotizacion_vencida"` y los días de retraso

#### Scenario: Alertas de OC en ERROR_FINANZAS sin resolver
- **WHEN** existen filas en `AlertaOcError` con `resuelta = false` para el tenant/proyecto activo
- **THEN** aparecen en `alertas[]` con `tipo: "oc_error_finanzas"`, `oc_id`, `oc_codigo`, `error_message` y `dias_vencida` calculado desde `AlertaOcError.created_at`

#### Scenario: Alerta de requisición aprobada sin cuadro comparativo
- **WHEN** una `Requisicion` está en estado `APROBADA`, no tiene ningún `CuadroComparativo` asociado, y han pasado más de `DIAS_ALERTA_PROCESO_ATORADO` (5) días desde `fecha_solicitud`
- **THEN** aparece en `alertas[]` con `tipo: "requisicion_sin_cuadro"` y `dias_vencida` calculado desde `fecha_solicitud`

#### Scenario: Requisición recién aprobada no genera alerta prematura
- **WHEN** una `Requisicion` está en estado `APROBADA` sin `CuadroComparativo` pero `fecha_solicitud` es de hace menos de `DIAS_ALERTA_PROCESO_ATORADO` (5) días
- **THEN** NO aparece en `alertas[]`

#### Scenario: Alerta de cuadro comparativo atorado en estado no terminal
- **WHEN** un `CuadroComparativo` está en cualquier estado no terminal (`BORRADOR`, `CON_SOLICITUD`, `EN_COTIZACION`, `EN_EVALUACION_TECNICA`, `EVALUADO_TECNICAMENTE`, `EN_APROBACION_GT`, `REVISION_SOLICITADA`, `FIRMADO_BLOQUEADO` o `LOCKED`), y han pasado más de `DIAS_ALERTA_PROCESO_ATORADO` (5) días desde `fecha_creacion`
- **THEN** aparece en `alertas[]` con `tipo: "cuadro_atorado"`, `estado` actual del cuadro y `dias_vencida` calculado desde `fecha_creacion`

#### Scenario: Cuadro firmado pero nunca enviado a GT también alerta
- **WHEN** un `CuadroComparativo` queda en `FIRMADO_BLOQUEADO` (firmado por el Residente) sin que nadie ejecute el envío a GT por más de `DIAS_ALERTA_PROCESO_ATORADO` (5) días
- **THEN** aparece en `alertas[]` con `tipo: "cuadro_atorado"` y `estado: "FIRMADO_BLOQUEADO"` — firmar no envía automáticamente a GT, es un paso separado

#### Scenario: Cuadro en estado terminal no genera alerta de atorado
- **WHEN** un `CuadroComparativo` está en estado `APROBADO_GT`, `RECHAZADO_GT`, `CERRADO` o `SUPERSEDIDO`, sin importar su antigüedad
- **THEN** NO aparece en `alertas[]` como `cuadro_atorado`

#### Scenario: Actividad reciente
- **WHEN** se solicita el dashboard
- **THEN** `actividad_reciente` contiene las últimas 5 `Requisicion` modificadas, ordenadas por `updated_at DESC`
