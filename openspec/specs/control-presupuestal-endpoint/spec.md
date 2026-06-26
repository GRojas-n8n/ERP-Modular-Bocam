# control-presupuestal-endpoint

## Endpoint principal — GET /api/v1/gerencia-tecnica/reportes/control-presupuestal

El servicio `gerencia-tecnica` (puerto 3001) expone `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` que retorna por partida (Concepto) del presupuesto aprobado: monto presupuestado, monto comprometido en OCs activas, monto pagado, disponible y porcentaje ejercido.

Requiere JWT + `x-tenant-id` header. El `proyectoId` se obtiene del `securityContext` (JWT). Acepta `?categoria=<TipoInsumo>` opcional.

```
GET /api/v1/gerencia-tecnica/reportes/control-presupuestal
  Headers: Authorization: Bearer <token>, x-tenant-id: <uuid>
  Query:   ?categoria=MATERIAL|MANO_DE_OBRA|EQUIPO|SUBCONTRATO|INDIRECTO (opcional)
  → 200 {
      proyectoId: string,
      presupuesto_id: string,
      total_presupuestado: number,
      total_comprometido: number,
      total_pagado: number,
      total_disponible: number,
      pct_ejercido: number,
      parcial: boolean,
      advertencias: string[],
      partidas: Array<{
        concepto_id: string,
        clave: string,
        descripcion: string,
        categoria_predominante: TipoInsumo | null,
        presupuesto: number,
        comprometido: number,
        pagado: number,
        disponible: number,
        pct_ejercido: number
      }>
    }
  → 404 cuando no hay presupuesto activo (APROBADO/LIBERADO/CONGELADO)
```

### Scenarios

#### Scenario: Consulta con proyecto válido
- **WHEN** el JWT tiene `proyecto_id` válido y existe presupuesto APROBADO/LIBERADO/CONGELADO
- **THEN** 200 con estructura completa

#### Scenario: Partida con composición APU
- **WHEN** un Concepto tiene `ConceptoInsumos` con `tipo_insumo`
- **THEN** `categoria_predominante` = TipoInsumo con mayor `costo_unitario × cantidad` acumulado

#### Scenario: Sin presupuesto activo
- **WHEN** no existe presupuesto activo para el proyecto
- **THEN** 404 `{ error: "Sin presupuesto activo para este proyecto" }`

#### Scenario: Respuesta parcial cuando un servicio externo falla
- **WHEN** la llamada B2B a Compras o Finanzas falla (timeout > 5s o error HTTP)
- **THEN** 200 con los datos disponibles y `parcial: true`, `advertencias: [...]`

#### Scenario: Filtro por categoría
- **WHEN** `?categoria=MATERIAL`
- **THEN** `partidas` incluye solo conceptos con `categoria_predominante = MATERIAL`

---

## Endpoint de exportación — POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export

```
POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export
  Body: { formato: "PDF" | "XLSX", categoria?: TipoInsumo }
  → binary (application/pdf o spreadsheet)
  → 400 si formato inválido
```

Internamente llama B2B a Reportes (puerto 3010) para generar el archivo.

---

## Sub-endpoint B2B en Compras — GET /api/v1/compras/reportes/ocs-por-concepto

Consumo exclusivo B2B (requiere `X-Internal-Service: gerencia-tecnica`). Retorna suma de `OrdenCompra.total` agrupada por `concepto_id` de la requisición origen, para OCs en estado `EMITIDA`, `PARCIALMENTE_RECIBIDA` o `RECIBIDA`.

```
GET /api/v1/compras/reportes/ocs-por-concepto?proyectoId=<uuid>
  Headers: X-Internal-Service: gerencia-tecnica, Authorization: Bearer <token>
  → 200 [{ concepto_id: string | null, monto_comprometido: number, count_ocs: number }]
  → 403 si falta X-Internal-Service
```

#### Scenario: OC sin concepto_id en la req
- **WHEN** una OC no tiene `requisicion_id` o la req no tiene `concepto_id`
- **THEN** esa OC no se incluye en el resultado

---

## Sub-endpoint B2B en Finanzas — GET /api/v1/finanzas/reportes/pagado-por-concepto

Consumo exclusivo B2B (requiere `X-Internal-Service: gerencia-tecnica`). Retorna suma de `DetallePagoOC.monto_aplicado` agrupada por `concepto_id`.

```
GET /api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=<uuid>
  Headers: X-Internal-Service: gerencia-tecnica, Authorization: Bearer <token>
  → 200 [{ concepto_id: string | null, monto_pagado: number, count_pagos: number }]
  → 403 si falta X-Internal-Service
```

#### Scenario: Pagos legacy sin concepto_id
- **WHEN** existen `DetallePagoOC` con `concepto_id = null`
- **THEN** se incluyen agrupados bajo `concepto_id: null`

---

## Sub-endpoint B2B en Reportes — POST /api/v1/reportes/control-presupuestal/export

```
POST /api/v1/reportes/control-presupuestal/export
  Body: { formato: "PDF" | "XLSX", datos: { partidas: [...], ... } }
  → binary (PDF o XLSX)
  → 400 si formato inválido
```

PDF: encabezado proyecto + CC, tabla partidas (Clave/Descripción/Categoría/Presupuestado/Comprometido/Pagado/Disponible/% Ejercido), totales al pie.
XLSX: misma estructura en hoja "Control Presupuestal" con formato de moneda.
