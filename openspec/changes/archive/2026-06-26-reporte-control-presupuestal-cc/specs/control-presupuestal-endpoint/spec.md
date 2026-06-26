## ADDED Requirements

### Requirement: Endpoint de reporte control presupuestal en GT
El servicio `gerencia-tecnica` (puerto 3001) SHALL exponer `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` que retorna por partida (Concepto) del presupuesto aprobado: monto presupuestado, monto comprometido en OCs activas, monto pagado, disponible y porcentaje ejercido. El endpoint requiere JWT + `tenant_id` header y acepta `?proyectoId=<uuid>` (requerido) y `?categoria=<TipoInsumo>` (opcional).

#### Scenario: Consulta con proyecto válido
- **WHEN** GET con `proyectoId` válido y presupuesto APROBADO/LIBERADO/CONGELADO existe
- **THEN** responde 200 con `{ proyectoId, presupuesto_id, total_presupuestado, total_comprometido, total_pagado, total_disponible, pct_ejercido, parcial: false, partidas: [...] }`

#### Scenario: Partida con composición APU
- **WHEN** un Concepto tiene `ConceptoInsumos` con `tipo_insumo`
- **THEN** cada partida en la respuesta incluye `categoria_predominante` (el `TipoInsumo` con mayor `costo_unitario * cantidad` acumulado)

#### Scenario: Sin presupuesto activo
- **WHEN** el `proyectoId` no tiene presupuesto con estado APROBADO, LIBERADO o CONGELADO
- **THEN** responde 404 con `{ error: "Sin presupuesto activo para este proyecto" }`

#### Scenario: Respuesta parcial cuando un servicio externo falla
- **WHEN** la llamada B2B a Compras o Finanzas falla (timeout > 5s o error HTTP)
- **THEN** responde 200 con los datos disponibles y `parcial: true`, más `advertencias: ["Compras no disponible: comprometido aproximado", ...]`

#### Scenario: Filtro por categoría
- **WHEN** se pasa `?categoria=MATERIAL`
- **THEN** el array `partidas` incluye solo conceptos cuya `categoria_predominante` sea `MATERIAL`

### Requirement: Sub-endpoint B2B en Compras — OCs por concepto
El servicio `compras` SHALL exponer `GET /api/v1/compras/reportes/ocs-por-concepto?proyectoId=<uuid>` únicamente para consumo B2B. Requiere header `X-Internal-Service: gerencia-tecnica` + JWT válido con `tenant_id`. Retorna suma de `OrdenCompra.total` agrupada por `concepto_id` de la requisición origen, para OCs en estado `EMITIDA`, `PARCIALMENTE_RECIBIDA` o `RECIBIDA`.

#### Scenario: Consulta de comprometido por concepto
- **WHEN** GT llama B2B con `proyectoId` y headers correctos
- **THEN** responde 200 con `[{ concepto_id, monto_comprometido, count_ocs }]`

#### Scenario: Rechazo sin header de servicio interno
- **WHEN** se llama sin `X-Internal-Service: gerencia-tecnica`
- **THEN** responde 403

#### Scenario: OC sin requisicion_id
- **WHEN** una OC no tiene `requisicion_id` o la req no tiene `concepto_id`
- **THEN** esa OC NO se incluye en el resultado (no puede asignarse a partida)

### Requirement: Sub-endpoint B2B en Finanzas — pagado por concepto
El servicio `finanzas` SHALL exponer `GET /api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=<uuid>` únicamente para consumo B2B. Requiere `X-Internal-Service: gerencia-tecnica` + JWT. Retorna suma de `DetallePagoOC.monto_aplicado` agrupada por `concepto_id`.

#### Scenario: Consulta de pagado por concepto
- **WHEN** GT llama B2B con `proyectoId` y headers correctos
- **THEN** responde 200 con `[{ concepto_id, monto_pagado, count_pagos }]`

#### Scenario: Pagos sin concepto_id (legacy)
- **WHEN** existen `DetallePagoOC` con `concepto_id = null`
- **THEN** se incluyen agrupados bajo `concepto_id: null` para que GT pueda reportar el monto sin clasificar

#### Scenario: Rechazo sin header de servicio interno
- **WHEN** se llama sin `X-Internal-Service: gerencia-tecnica`
- **THEN** responde 403

### Requirement: Endpoint de exportación en Reportes
El servicio `reportes` (puerto 3010) SHALL exponer `POST /api/v1/reportes/control-presupuestal/export` que recibe el payload completo del reporte (datos ya procesados por GT) y retorna un archivo PDF o XLSX según `formato` en el body.

#### Scenario: Exportación a PDF
- **WHEN** body incluye `{ formato: "PDF", datos: { partidas: [...], ... } }`
- **THEN** responde con `Content-Type: application/pdf` y el buffer del archivo

#### Scenario: Exportación a XLSX
- **WHEN** body incluye `{ formato: "XLSX", datos: { partidas: [...], ... } }`
- **THEN** responde con `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### Scenario: Formato inválido
- **WHEN** `formato` no es `"PDF"` ni `"XLSX"`
- **THEN** responde 400 con `{ error: "Formato no soportado" }`
