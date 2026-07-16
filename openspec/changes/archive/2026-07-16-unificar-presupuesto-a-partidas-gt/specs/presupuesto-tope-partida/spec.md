## MODIFIED Requirements

### Requirement: Crear SaldoPartida al aprobar el presupuesto
Cuando GT aprueba un presupuesto (`PATCH /presupuestos/:id/aprobar`), SHALL crear automáticamente un `SaldoPartida` por cada `Concepto` del presupuesto, SHALL calcular y persistir `categoria_predominante`, y SHALL publicar un evento para que Finanzas sincronice su espejo de presupuesto por partida.

- `monto_aprobado = concepto.precio_unitario × concepto.cantidad`
- `estado_tope = 'LIBRE'`
- `categoria_predominante` = el `TipoInsumo` (`MATERIAL|MANO_DE_OBRA|EQUIPO|SUBCONTRATO|INDIRECTO`) con mayor `costo_unitario × cantidad` acumulado entre los `ConceptoInsumo` del concepto (mismo algoritmo que ya usa `GET /reportes/control-presupuestal`), o `null` si el concepto no tiene ningún `ConceptoInsumo`.

#### Scenario: Presupuesto aprobado con 15 conceptos
- **WHEN** se aprueba un presupuesto con 15 conceptos
- **THEN** el sistema crea 15 registros en `SaldoPartida`
- **THEN** la suma de todos los `monto_aprobado` debe igualar el `monto_total` del presupuesto

#### Scenario: Re-aprobación no duplica
- **WHEN** se intenta aprobar un presupuesto ya `APROBADO`
- **THEN** retorna 409 (ya existe, idempotente)

#### Scenario: categoria_predominante calculada desde el APU
- **WHEN** un `Concepto` tiene `ConceptoInsumo` con `tipo_insumo = 'MATERIAL'` de mayor costo acumulado que los demás tipos
- **THEN** `SaldoPartida.categoria_predominante = 'MATERIAL'`

#### Scenario: Concepto sin composición APU
- **WHEN** un `Concepto` no tiene ningún `ConceptoInsumo`
- **THEN** `SaldoPartida.categoria_predominante = null`

#### Scenario: Evento publicado tras crear los SaldoPartida
- **WHEN** se completa la creación de los `SaldoPartida` de un presupuesto aprobado
- **THEN** GT publica `gerencia_tecnica.saldo_partida_creado` con un payload que incluye, por cada partida: `concepto_id`, `concepto_clave`, `concepto_desc`, `monto_aprobado`, `categoria_predominante`
- **THEN** la publicación es best-effort — si el bus de eventos no está disponible, la aprobación del presupuesto igual se completa

## ADDED Requirements

### Requirement: La nómina NO SHALL comprometer el SaldoPartida de una partida individual
El compromiso y ejercicio del gasto de nómina (fiscal y complementaria) SHALL afectar exclusivamente el presupuesto de Mano de Obra a nivel proyecto en Finanzas (capacidad `presupuesto-mano-obra-proyecto`), NUNCA el `SaldoPartida` de un `Concepto` individual — reemplaza cualquier comportamiento previamente documentado (no implementado) de comprometer partida por nómina.

#### Scenario: Autorizar nómina no afecta ningún SaldoPartida
- **WHEN** se autoriza una `PreNomina`
- **THEN** ningún `SaldoPartida` de GT cambia su `monto_comprometido` como consecuencia directa de ese evento
- **THEN** el compromiso se refleja únicamente en el `PresupuestoAsignado` de Mano de Obra a nivel proyecto en Finanzas
