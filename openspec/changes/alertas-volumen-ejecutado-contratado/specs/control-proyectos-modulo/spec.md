## MODIFIED Requirements

### Requirement: Motor de alertas ejecutado periódicamente
El módulo CP SHALL calcular alertas automáticamente en dos momentos:
1. Al recibir cualquier evento relevante (tiempo real)
2. Cada 24 horas en job nocturno (batch completo)

El motor SHALL incluir, además de `SOBRE_COSTO_PROYECTADO` y
`RETRASO_CRITICO`, el tipo `VOLUMEN_EXCEDIDO`, evaluado comparando el
`AvanceFisico` más reciente de cada `concepto_id` de la partida contra su
`cantidad_presupuestada`.

#### Alerta: SOBRE_COSTO_PROYECTADO
- **WHEN** `CPI_global < 0.90` (se está gastando más de lo que se avanza)
- **THEN** crea alerta CRITICA: `"EAC proyectado supera presupuesto en ${vac}. A este ritmo, la obra costará ${eac} (${pct_sobre}% sobre presupuesto)"`

#### Alerta: RETRASO_CRITICO
- **WHEN** `SPI_partida < 0.80` Y `ProgramacionObra.fecha_fin_plan` en menos de 30 días
- **THEN** crea alerta CRITICA: `"Partida ${clave} tiene SPI ${spi}. Riesgo de no terminar en fecha. Retraso proyectado: ${dias} días"`

#### Alerta: VOLUMEN_EXCEDIDO
- **WHEN** el `AvanceFisico` más reciente de un `concepto_id` tiene
  `cantidad_acumulada > cantidad_presupuestada`
- **THEN** crea alerta WARN: `"La partida ${clave} lleva ${cantidad_acumulada} ${unidad} ejecutados, superando los ${cantidad_presupuestada} ${unidad} contratados (${pct_excedido}% de exceso). Requiere autorización de alcance adicional"`

#### Scenario: Alerta de volumen se resuelve automáticamente
- **WHEN** la `cantidad_presupuestada` de un concepto se amplía (ej. vía
  transferencia de partida o ajuste del presupuesto) y deja de ser menor a
  `cantidad_acumulada`
- **THEN** la alerta `VOLUMEN_EXCEDIDO` de ese concepto pasa a
  `estado = 'RESUELTA'` automáticamente con `resuelta_en = now()`

#### Scenario: Alerta se resuelve automáticamente
- **WHEN** la condición que generó la alerta ya no existe (ej. CPI sube de 0.88 a 0.93)
- **THEN** la alerta pasa a `estado = 'RESUELTA'` automáticamente con `resuelta_en = now()`
