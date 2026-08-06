## ADDED Requirements

### Requirement: Resolución de alerta al reconciliar una OC en ERROR_FINANZAS
El sistema SHALL marcar como `resuelta = true` la fila de `AlertaOcError` correspondiente a una OC (si existe) cuando `POST /api/v1/compras/ordenes-compra/:id/reconciliar-finanzas` reintenta con éxito el compromiso de fondos de esa OC en estado `ERROR_FINANZAS` y la transiciona a `EMITIDA`, para que deje de listarse en `alertas[]` del dashboard.

#### Scenario: Reintento exitoso apaga la alerta
- **WHEN** una OC en `ERROR_FINANZAS` con una `AlertaOcError` asociada (`resuelta = false`) se reconcilia exitosamente vía `reconciliar-finanzas`
- **THEN** la OC pasa a `EMITIDA` y la fila de `AlertaOcError` correspondiente queda `resuelta = true`

#### Scenario: Reconciliación sin fila de alerta previa no falla
- **WHEN** una OC está en `ERROR_FINANZAS` pero no existe ninguna fila de `AlertaOcError` para ese `oc_id` (por ejemplo, si se creó por una vía distinta a las cubiertas hoy)
- **THEN** `reconciliar-finanzas` completa la reconciliación normalmente sin error, sin intentar actualizar una fila inexistente

#### Scenario: Reintento fallido no toca la alerta
- **WHEN** el reintento de `comprometer-fondos` contra Finanzas vuelve a fallar
- **THEN** la OC permanece en `ERROR_FINANZAS`, la `AlertaOcError` permanece `resuelta = false`, y el endpoint retorna el error de forma explícita (no silenciosa)
