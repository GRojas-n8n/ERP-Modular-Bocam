# Spec: oc-cierre-pago

## Propósito

Eslabón faltante entre **Finanzas** y **Compras** en el ciclo de pago.
Finanzas ya publica `finanzas.oc_pagada_total` y `finanzas.oc_pagada_parcial` cuando registra pagos sobre una OC, pero Compras no los escucha. La OC nunca refleja su estado de pago desde el módulo que la originó. Este spec cierra el ciclo: Compras suscribe esos eventos y actualiza `OrdenCompra.estado_pago`.

---

## Contexto de datos existente

- `OrdenCompra.estado_pago` ya existe con valores: `PENDIENTE_PAGO | PAGO_PARCIAL | PAGADA`
- Finanzas ya publica `finanzas.oc_pagada_total` y `finanzas.oc_pagada_parcial` desde `main.ts` (línea ~1765)
- Compras NO tiene subscriber para estos eventos actualmente

---

## Subscriber: finanzas.oc_pagada_parcial

### Requirement: Compras actualiza estado_pago = PAGO_PARCIAL
El servicio Compras SHALL suscribirse al evento `finanzas.oc_pagada_parcial` en `bocam.events` y actualizar la OC correspondiente.

Payload esperado del evento:
```typescript
{
  oc_id:       string,   // UUID de OrdenCompra
  monto_pagado: number,
  saldo_pendiente: number,
  tenant_id:   string,
  proyecto_id: string
}
```

#### Scenario: OC pasa a PAGO_PARCIAL
- **WHEN** Finanzas publica `finanzas.oc_pagada_parcial` con `oc_id` existente
- **THEN** Compras actualiza `OrdenCompra.estado_pago = 'PAGO_PARCIAL'`
- **THEN** la actualización es atómica (no modifica `estado` principal de la OC)

#### Scenario: OC ya en estado PAGADA — no regresa
- **WHEN** se recibe `finanzas.oc_pagada_parcial` para una OC con `estado_pago = 'PAGADA'`
- **THEN** el sistema ignora el evento y hace ack sin modificar la OC

#### Scenario: OC no encontrada
- **WHEN** `oc_id` del evento no existe en la BD de Compras
- **THEN** el sistema registra warning y hace ack (no reencola — el dato puede haber sido borrado)

---

## Subscriber: finanzas.oc_pagada_total

### Requirement: Compras cierra estado_pago = PAGADA
El servicio Compras SHALL suscribirse al evento `finanzas.oc_pagada_total` y marcar la OC como completamente pagada.

#### Scenario: OC pasa a PAGADA
- **WHEN** Finanzas publica `finanzas.oc_pagada_total` con `oc_id` existente
- **THEN** Compras actualiza `OrdenCompra.estado_pago = 'PAGADA'`
- **THEN** si la OC está en estado `RECIBIDA`, se considera completamente cerrada (recibida + pagada)

#### Scenario: Idempotencia
- **WHEN** el mismo evento `finanzas.oc_pagada_total` se recibe dos veces
- **THEN** la segunda ejecución detecta `estado_pago = 'PAGADA'` y hace ack sin modificar

---

## Dashboard indicador

### Requirement: KPI "OCs sin pagar" en dashboard de Compras
El endpoint `GET /api/v1/compras/dashboard` SHALL incluir en su respuesta:
```json
{
  "ocs_pendientes_pago": number,
  "ocs_pago_parcial":    number,
  "ocs_pagadas_mes":     number
}
```

#### Scenario: KPI calculado correctamente
- **WHEN** existen OCs con `estado_pago = 'PENDIENTE_PAGO'`, `'PAGO_PARCIAL'` y `'PAGADA'`
- **THEN** el dashboard retorna las 3 cifras correctas filtradas por proyecto activo

---

## Vista frontend

### Requirement: Columna estado_pago en lista de OC
La tabla de OCs en `ComprasView` SHALL mostrar una columna o badge adicional con el `estado_pago`.

| estado_pago | Badge color | Texto |
|---|---|---|
| PENDIENTE_PAGO | Ámbar | Sin pagar |
| PAGO_PARCIAL | Azul | Pago parcial |
| PAGADA | Verde | Pagada |

#### Scenario: Badge visible en modo lista
- **WHEN** el usuario ve la lista de OCs en estado `EMITIDA` o `RECIBIDA`
- **THEN** el badge de pago es visible junto al badge de estado de recepción

#### Scenario: Filtro por estado_pago
- **WHEN** el usuario aplica filtro "Sin pagar" en la lista de OC
- **THEN** solo se muestran OCs con `estado_pago IN ('PENDIENTE_PAGO', 'PAGO_PARCIAL')`
