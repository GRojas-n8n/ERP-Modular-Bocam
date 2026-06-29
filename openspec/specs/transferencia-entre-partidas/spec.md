# Spec: transferencia-entre-partidas

## Propósito

Mecanismo formal para mover presupuesto entre partidas cuando una partida llega a su tope. Todo movimiento queda registrado, aprobado, trazable y reflejado en contabilidad.

Dos tipos:
- **Interna**: de partida A → partida B dentro del mismo proyecto
- **Externa**: de proyecto X → proyecto Y (préstamo entre obras)

La transferencia NO es un parche — es una decisión gerencial documentada que cambia el alcance del presupuesto original. Queda en el historial del proyecto para cualquier auditoría.

---

## Entidad: TransferenciaPartida (en GT)

```
TransferenciaPartida {
  id                  UUID PK
  tenant_id           UUID
  tipo                VARCHAR(20)  -- INTERNA | EXTERNA

  -- Origen
  proyecto_origen_id  UUID
  concepto_origen_id  UUID?        -- null si tipo=EXTERNA y origen es bolsa general
  concepto_origen_clave VARCHAR(100) -- desnormalizado

  -- Destino
  proyecto_destino_id UUID
  concepto_destino_id UUID
  concepto_destino_clave VARCHAR(100) -- desnormalizado

  monto               DECIMAL(18,2)
  moneda              VARCHAR(3)   DEFAULT 'MXN'

  -- Justificación y aprobación
  justificacion       TEXT         -- obligatoria: por qué se necesita la transferencia
  solicitado_por_id   UUID         -- quien la solicitó (Control de Proyectos o GT)
  solicitado_por_nombre VARCHAR(200)
  aprobado_por_id     UUID?        -- director o gerente general
  aprobado_por_nombre VARCHAR(200)?
  fecha_aprobacion    TIMESTAMPTZ?

  -- Estado del proceso
  estado              VARCHAR(20)  DEFAULT 'PENDIENTE'
  -- PENDIENTE: esperando aprobación del director
  -- APROBADA:  director aprobó, los saldos ya se ajustaron
  -- RECHAZADA: director rechazó con motivo
  -- REVERTIDA: se deshizo (excepcionalmente, con doble aprobación)

  motivo_rechazo      TEXT?
  notas_director      TEXT?

  created_at          TIMESTAMPTZ
  updated_at          TIMESTAMPTZ
}
```

---

## Flujo de una transferencia interna

```
Control de Proyectos detecta:
  partida EST-002 BLOQUEADA — req #089 esperando $25,000
  partida ACB-005 tiene disponible $180,000 (17% del presupuesto)

CP propone transferencia:
  POST /api/v1/gerencia-tecnica/transferencias-partida
  {
    tipo: "INTERNA",
    concepto_origen_id:  "uuid-ACB-005",
    concepto_destino_id: "uuid-EST-002",
    monto: 30000,
    justificacion: "Estructura requiere refuerzo adicional no previsto en APU original. 
                    Acabados tienen holgura por cambio de especificación cliente (ver minuta 2026-06-28)"
  }

Director recibe notificación → revisa → aprueba:
  PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/aprobar

GT actualiza ambos saldos:
  SaldoPartida[ACB-005].monto_aprobado -= 30,000
  SaldoPartida[EST-002].monto_aprobado += 30,000

Req #089 se desbloquea automáticamente:
  estado: PENDIENTE_TRANSFERENCIA → APROBADA (si ahora tiene saldo)

Contabilidad registra asiento TRANSFERENCIA_INTERNA:
  evento: gerencia_tecnica.transferencia_partida_aprobada
```

---

## API — Crear transferencia

### Requirement: POST /api/v1/gerencia-tecnica/transferencias-partida

Roles: `control_proyectos`, `gerencia_tecnica`, `superintendent`, `admin`.

```json
{
  "tipo": "INTERNA",
  "concepto_origen_id":  "uuid",
  "concepto_destino_id": "uuid",
  "monto": 30000,
  "justificacion": "Texto obligatorio mínimo 50 caracteres explicando la razón técnica"
}
```

#### Scenario: Transferencia interna creada exitosamente
- **WHEN** se envía POST con datos válidos y `tipo = INTERNA`
- **THEN** sistema crea `TransferenciaPartida` con `estado = 'PENDIENTE'`
- **THEN** se notifica al director (evento `gerencia_tecnica.transferencia_partida_solicitada`)
- **THEN** retorna 201 con la transferencia creada

#### Scenario: Origen sin saldo suficiente
- **WHEN** `concepto_origen.monto_disponible < monto`
- **THEN** retorna 422: `"La partida origen solo tiene $X disponibles para transferir"`
- **NOTA**: no se puede transferir lo ya comprometido o ejercido — solo el disponible libre

#### Scenario: Justificación insuficiente
- **WHEN** `justificacion.length < 50`
- **THEN** retorna 422: `"La justificación debe tener al menos 50 caracteres"`

---

## API — Aprobar / rechazar transferencia

### Requirement: PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/aprobar
Rol: `admin`, `director`.

Al aprobar:
1. GT actualiza `SaldoPartida` de origen y destino
2. Publica `gerencia_tecnica.transferencia_partida_aprobada`
3. Contabilidad crea asiento `TRANSFERENCIA_INTERNA`
4. Si la partida destino tenía requisiciones en `PENDIENTE_TRANSFERENCIA` → se evalúan para desbloqueo

#### Scenario: Aprobación desbloquea requisición
- **WHEN** director aprueba transferencia y `SaldoPartida[destino].monto_disponible >= monto_req_bloqueada`
- **THEN** la req bloqueada pasa a `APROBADA` automáticamente
- **THEN** se notifica a Compras para continuar el flujo

### Requirement: PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/rechazar
```json
{ "motivo_rechazo": "No hay holgura suficiente en acabados. Buscar recurso externo." }
```

#### Scenario: Rechazo notifica al solicitante
- **WHEN** director rechaza con motivo
- **THEN** `estado = 'RECHAZADA'`
- **THEN** la req permanece en `PENDIENTE_TRANSFERENCIA`
- **THEN** se genera alerta en CP: "Transferencia rechazada — requiere acción alternativa"

---

## Transferencia externa (entre proyectos)

### Requirement: Transferencia externa requiere doble aprobación

Una transferencia de Proyecto A → Proyecto B es más grave porque afecta el presupuesto de otra obra. Requiere:
1. Aprobación del GT del proyecto origen
2. Aprobación del director general (nivel superior)

```
POST con tipo: "EXTERNA"
{
  "tipo": "EXTERNA",
  "proyecto_origen_id":  "uuid-proyecto-A",
  "concepto_origen_id":  "uuid-ACB-005-en-A",   -- puede ser null (bolsa general)
  "proyecto_destino_id": "uuid-proyecto-B",
  "concepto_destino_id": "uuid-EST-002-en-B",
  "monto": 50000,
  "justificacion": "...",
  "plazo_devolucion": "2026-09-30"  -- opcional: fecha compromiso de reposición
}
```

#### Scenario: Transferencia externa con plazo de devolución
- **WHEN** `plazo_devolucion` está definido
- **THEN** Control de Proyectos programa una alerta para 15 días antes del plazo
- **THEN** en los reportes del proyecto origen aparece como "Préstamo pendiente de recuperación: $50,000"

#### Scenario: Devolución de préstamo externo
- **WHEN** se crea una nueva TransferenciaPartida en sentido inverso con referencia a la original
- **THEN** el sistema detecta el cruce y marca la deuda como saldada
- **THEN** ambas transferencias quedan vinculadas en el historial

---

## Historial de transferencias por partida

### Requirement: GET /api/v1/gerencia-tecnica/partidas/:concepto_id/transferencias
Retorna todas las transferencias que afectaron una partida (como origen o destino).

```json
[
  {
    "id": "uuid",
    "tipo": "INTERNA",
    "direccion": "RECIBIDA",
    "concepto_contraparte": "ACB-005 — Acabados interiores",
    "monto": 30000,
    "estado": "APROBADA",
    "fecha_aprobacion": "2026-06-28T14:30:00Z",
    "aprobado_por": "Ing. Carlos Mendoza",
    "justificacion": "Refuerzo estructural no previsto..."
  }
]
```

---

## Evento: `gerencia_tecnica.transferencia_partida_aprobada`

```typescript
{
  event_type: 'gerencia_tecnica.transferencia_partida_aprobada',
  payload: {
    transferencia_id:      string,
    tipo:                  'INTERNA' | 'EXTERNA',
    proyecto_origen_id:    string,
    concepto_origen_id:    string | null,
    concepto_origen_clave: string,
    proyecto_destino_id:   string,
    concepto_destino_id:   string,
    concepto_destino_clave: string,
    monto:                 number,
    aprobado_por_nombre:   string,
    justificacion:         string
  }
}
```

**Consumidores:**
- Contabilidad → crea `AsientoContable` tipo `TRANSFERENCIA_INTERNA`
- Control de Proyectos → actualiza métricas EVM y desbloquea alertas
- Compras → re-evalúa requisiciones en `PENDIENTE_TRANSFERENCIA`

---

## Reglas de negocio invariantes

1. **No se puede transferir monto comprometido o ejercido** — solo el `monto_disponible` es movible.
2. **Toda transferencia requiere justificación** — mínimo 50 caracteres, queda en auditoría permanente.
3. **Una transferencia APROBADA no se puede cancelar** — solo se puede hacer una transferencia inversa (reversión), que también requiere aprobación.
4. **Las reversiones son excepcionales** — requieren doble aprobación: GT + director, y quedan marcadas como `REVERTIDA` con referencia cruzada.
5. **La suma de todos los `monto_aprobado` del proyecto debe conservarse** — las transferencias internas son suma-cero. Las externas reducen el total de un proyecto y aumentan el del otro.
