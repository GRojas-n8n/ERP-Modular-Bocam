## ADDED Requirements

### Requirement: La Requisición SHALL transicionar a COMPRADA cuando el lote de OCs cubre todos sus renglones
El sistema SHALL actualizar `Requisicion.estado` a `COMPRADA` cuando, al
ejecutar `convertir-oc` sobre un cuadro comparativo, todos los renglones de
la `Requisicion` de origen quedaron cubiertos por las OCs generadas
exitosamente en el lote (ninguno quedó sin ganador asignado o en
`ERROR_FINANZAS`).

#### Scenario: Todos los renglones cubiertos por el lote generado
- **WHEN** `convertir-oc` genera exitosamente OCs que cubren el 100% de los
  renglones de la requisición de origen
- **THEN** `Requisicion.estado` pasa a `COMPRADA`

#### Scenario: Alguna OC del lote queda en ERROR_FINANZAS
- **WHEN** `convertir-oc` genera el lote pero al menos una OC queda en
  `ERROR_FINANZAS` (renglones de esa OC no confirmados)
- **THEN** `Requisicion.estado` NO se actualiza a `COMPRADA` — permanece en su
  estado previo hasta que se resuelva el error financiero y se reintente

#### Scenario: Requisición sin vínculo directo a un renglón de la comparativa
- **WHEN** un renglón ganador no tiene `detalle_req_id` (cuadro anterior a la
  migración, ver capability `multi-oc-generacion` existente) y por tanto no
  es posible determinar cobertura por renglón
- **THEN** el sistema no falla la conversión de OC por esta causa; la
  actualización de `Requisicion.estado` se omite de forma segura para esa
  requisición (queda en su estado previo) en vez de marcarla `COMPRADA` con
  cobertura incierta
