## ADDED Requirements

### Requirement: Registro de avances por estimación y por concepto
El sistema SHALL permitir al Residente registrar en un solo paso avances de varios conceptos referidos a una estimación existente, enviando `POST /api/v1/control-proyectos/avances/lote` con `estimacion_referencia_id` e `items` (`concepto_id`, `cantidad_periodo`). El periodo de cada avance SHALL heredarse de la estimación; precio, cantidad presupuestada y acumulado SHALL resolverse en backend igual que en `POST /avances`.

#### Scenario: Lote válido
- **WHEN** el Residente elige una estimación y captura cantidades para 3 conceptos
- **THEN** el sistema crea 3 avances en estado `PENDIENTE` con `estimacion_referencia_id` y el periodo de la estimación, y responde 201

#### Scenario: Un concepto inválido invalida el lote
- **WHEN** uno de los `concepto_id` no existe en el presupuesto activo
- **THEN** el sistema responde 400 y no crea ningún avance del lote

#### Scenario: Prellenado desde lo cobrado
- **WHEN** el Residente abre el registro por estimación
- **THEN** el formulario lista los conceptos de esa estimación con la cantidad estimada prellenada y editable

### Requirement: Avances agrupados por concepto
El sistema SHALL exponer `GET /api/v1/control-proyectos/avances/resumen-por-concepto` con una fila por concepto (contratado, cantidad acumulada, porcentaje de avance) y su desglose por estimación/periodo.

#### Scenario: Concepto con varios avances
- **WHEN** un concepto tiene avances en 3 estimaciones
- **THEN** el resumen devuelve una sola fila del concepto con acumulado igual a la suma y 3 entradas de desglose

### Requirement: Totales contratado, estimado, cobrado y restante
El sistema SHALL exponer `GET /api/v1/control-proyectos/estimaciones/totales` con `contratado`, `estimado`, `cobrado` y `restante` (contratado − cobrado) del proyecto activo, y `parcial: true` con `contratado` y `restante` nulos si gerencia-tecnica no responde.

#### Scenario: Totales completos
- **WHEN** existen estimaciones `FACTURADA` y `APROBADA_TECNICA` y el catálogo responde
- **THEN** `estimado` suma ambas, `cobrado` suma solo las `FACTURADA` y `restante = contratado - cobrado`

#### Scenario: Catálogo no disponible
- **WHEN** gerencia-tecnica falla
- **THEN** la respuesta es 200 con `parcial: true`, `contratado: null`, `restante: null`
