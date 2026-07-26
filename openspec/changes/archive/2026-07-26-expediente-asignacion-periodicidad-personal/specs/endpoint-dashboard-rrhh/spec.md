## MODIFIED Requirements

### Requirement: Interfaz de GET /api/v1/personal/dashboard
`GET /api/v1/personal/dashboard` (roles `rrhh`/`personal_rh`, `admin`) SHALL responder, además de los campos ya existentes (`empleados_activos`, `asistencia_hoy`, `incidencias_pendientes`, `nomina_proximo_corte`, `distribucion_jornada`), un array `alertas` que puede incluir entradas de tipo `AUSENCIA_INJUSTIFICADA` (comportamiento previo, sin cambios) y, cuando aplique, una entrada de tipo `DOCUMENTO_POR_VENCER` con el conteo agregado de documentos del expediente vencidos o por vencer dentro de 30 días.

#### Scenario: Alertas existentes sin cambios
- **WHEN** hay empleados con ≥ 2 días de ausencia injustificada consecutivos
- **THEN** el dashboard incluye la alerta `AUSENCIA_INJUSTIFICADA` igual que antes de este change

#### Scenario: Nueva alerta agregada de vencimientos
- **WHEN** existen documentos de expediente vencidos o por vencer dentro de 30 días en el tenant
- **THEN** el array `alertas` incluye una entrada `{ "tipo": "DOCUMENTO_POR_VENCER", "mensaje": "...", "severidad": "critica" | "advertencia" }` con el conteo total
