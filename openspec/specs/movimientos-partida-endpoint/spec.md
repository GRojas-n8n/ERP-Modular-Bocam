## ADDED Requirements

### Requirement: GT expone el historial de movimientos de una partida
El sistema SHALL exponer `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos`, que retorna el historial completo de `SaldoMovimiento` para la `SaldoPartida` del `concepto_id` dado, ordenado del más reciente al más antiguo. Disponible para los roles `admin`, `superintendent`, `gerencia_tecnica`, `control_proyectos`, `control_obra` (mismo guard que `GET /partidas/:concepto_id/saldo`).

```
GET /api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos
  → 200 [{
      id: string,
      referencia_id: string,
      referencia_codigo: string | null,
      tipo: string,
      campo: string,
      delta: number,
      saldo_resultante: number,
      created_at: string
    }]
  → 404 si no existe SaldoPartida para ese concepto_id
```

#### Scenario: Partida con movimientos registrados
- **WHEN** se consulta una partida que ya tuvo compromisos/ejercicios/reversas
- **THEN** retorna 200 con la lista completa de `SaldoMovimiento`, orden `created_at desc`

#### Scenario: Partida sin SaldoPartida inicializada
- **WHEN** se consulta un `concepto_id` que no tiene `SaldoPartida` (presupuesto no aprobado)
- **THEN** retorna 404 `SALDO_NO_INICIALIZADO`

#### Scenario: Partida con SaldoPartida pero sin movimientos aún
- **WHEN** la `SaldoPartida` existe pero no se ha comprometido ni ejercido nada
- **THEN** retorna 200 con lista vacía `[]`

#### Scenario: Rol sin acceso
- **WHEN** el JWT no tiene ninguno de los roles permitidos
- **THEN** retorna 403

### Requirement: Finanzas permite filtrar movimientos por concepto_id de partida
`GET /api/v1/finanzas/movimientos` SHALL aceptar un query param `concepto_id` como alternativa a `presupuesto_id`. Cuando se recibe `concepto_id`, el backend SHALL resolver internamente el `presupuesto_id` `ACTIVO` correspondiente a ese `concepto_id` antes de filtrar `MovimientoPresupuestal`, sin requerir que el cliente conozca el `presupuesto_id` interno.

```
GET /api/v1/finanzas/movimientos?concepto_id=<uuid>
  → 200 [{ id_movimiento, tipo, monto, referencia_modulo, referencia_entidad, referencia_id, referencia_codigo, usuario_id, fecha_registro, notas }]
  → 200 [] si no hay presupuesto sincronizado para ese concepto_id (no es error)
```

#### Scenario: Filtro por concepto_id con presupuesto sincronizado
- **WHEN** se llama con `?concepto_id=X` y existe un `PresupuestoAsignado ACTIVO` con ese `concepto_id`
- **THEN** retorna los `MovimientoPresupuestal` de ese presupuesto, mismo formato que el filtro existente por `presupuesto_id`

#### Scenario: concepto_id sin presupuesto sincronizado
- **WHEN** se llama con `?concepto_id=X` y no existe ningún `PresupuestoAsignado` para ese `concepto_id`
- **THEN** retorna 200 con lista vacía `[]` (no 404 — la ausencia de sincronización no es un error del cliente)

#### Scenario: ambos filtros presentes
- **WHEN** se envían `presupuesto_id` y `concepto_id` simultáneamente
- **THEN** `presupuesto_id` tiene precedencia (comportamiento existente sin cambios)
