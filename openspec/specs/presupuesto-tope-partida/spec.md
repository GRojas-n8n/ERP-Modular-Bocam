# Spec: presupuesto-tope-partida

## Propósito

Introduce control presupuestal **a nivel de partida del catálogo** (concepto APU). Hoy el tope existe solo a nivel de proyecto (`PresupuestoAsignado.monto_autorizado`). Ese nivel es demasiado grueso: una OC puede agotar el presupuesto de cimentación comprando acabados y el sistema no lo detecta.

Este spec define:
1. Una tabla `SaldoPartida` en GT que lleva el presupuesto aprobado, comprometido, ejercido y disponible por concepto.
2. Un gate de verificación que bloquea OCs y requisiciones cuando la partida está agotada.
3. El ciclo de vida del saldo: cómo cada acción del sistema lo afecta.

---

## Entidad: SaldoPartida (en Gerencia Técnica)

```
SaldoPartida {
  id                UUID PK
  tenant_id         UUID
  proyecto_id       UUID
  concepto_id       UUID          -- FK a Concepto (@@unique)
  concepto_clave    VARCHAR(100)  -- desnormalizado
  concepto_desc     TEXT          -- desnormalizado

  -- Monto aprobado: viene del APU (cantidad × PU) al aprobar el presupuesto.
  -- Se modifica SOLO vía TransferenciaPartida o ajuste de director.
  monto_aprobado    DECIMAL(18,2)

  -- Movimientos acumulados (nunca negativos)
  monto_comprometido DECIMAL(18,2) DEFAULT 0   -- OC vigentes + nómina comprometida
  monto_ejercido     DECIMAL(18,2) DEFAULT 0   -- pagos realizados definitivos
  monto_en_proceso   DECIMAL(18,2) DEFAULT 0   -- reqs aprobadas sin OC aún

  -- Calculado: aprobado - comprometido - ejercido - en_proceso
  monto_disponible   DECIMAL(18,2) GENERATED

  -- Estado de control
  estado_tope        VARCHAR(20) DEFAULT 'LIBRE'
  -- LIBRE:     disponible > 20% del aprobado
  -- LIMITADO:  disponible entre 1% y 20% → alerta, pero sigue operando
  -- BLOQUEADO: disponible <= 0 → no se puede requisitar ni emitir OC
  -- SUSPENDIDO: director suspendió manualmente la partida

  bloqueo_automatico BOOLEAN DEFAULT true  -- si false, el director anuló el bloqueo con justificación

  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

  @@unique([tenant_id, proyecto_id, concepto_id])
}
```

---

## Población inicial del SaldoPartida

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

### Requirement: La nómina NO SHALL comprometer el SaldoPartida de una partida individual
El compromiso y ejercicio del gasto de nómina (fiscal y complementaria) SHALL afectar exclusivamente el presupuesto de Mano de Obra a nivel proyecto en Finanzas (capacidad `presupuesto-mano-obra-proyecto`), NUNCA el `SaldoPartida` de un `Concepto` individual — reemplaza cualquier comportamiento previamente documentado (no implementado) de comprometer partida por nómina.

#### Scenario: Autorizar nómina no afecta ningún SaldoPartida
- **WHEN** se autoriza una `PreNomina`
- **THEN** ningún `SaldoPartida` de GT cambia su `monto_comprometido` como consecuencia directa de ese evento
- **THEN** el compromiso se refleja únicamente en el `PresupuestoAsignado` de Mano de Obra a nivel proyecto en Finanzas

---

## Gate de verificación al generar OC

### Requirement: Compras verifica disponible en partida antes de emitir OC
Cuando Compras va a generar una OC, SHALL llamar `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo` para verificar disponibilidad.

La verificación usa el `concepto_id` del ítem de la requisición original.

```
Regla:  monto_OC_item <= SaldoPartida.monto_disponible
Si NO → OC del ítem BLOQUEADA → retorna 422 con detalle de la partida
```

#### Scenario: Partida con saldo suficiente
- **WHEN** se intenta generar OC por $50,000 y `monto_disponible = $80,000`
- **THEN** la OC se genera normalmente
- **THEN** Compras llama `POST /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer` con `monto: 50000, oc_id, oc_codigo`
- **THEN** GT actualiza `monto_comprometido += 50,000` y `monto_disponible -= 50,000`

#### Scenario: Partida BLOQUEADA — no genera OC
- **WHEN** `SaldoPartida.estado_tope = 'BLOQUEADO'` y se intenta generar OC
- **THEN** retorna 422:
  ```json
  {
    "error": "PARTIDA_BLOQUEADA",
    "concepto_clave": "CIM-001",
    "monto_disponible": 0,
    "monto_aprobado": 480000,
    "monto_comprometido": 350000,
    "monto_ejercido": 130000,
    "alternativas": ["Solicitar transferencia de otra partida", "Solicitar ampliación presupuestal"]
  }
  ```

#### Scenario: Partida LIMITADA — genera OC con alerta
- **WHEN** `estado_tope = 'LIMITADO'` (disponible < 20%)
- **THEN** la OC se genera pero la respuesta incluye `warning: "Partida al 85% de ejecución. Disponible: $72,000"`

#### Scenario: BLOQUEADO pero director anuló el bloqueo
- **WHEN** `bloqueo_automatico = false` (director autorizó continuar con justificación)
- **THEN** la OC se genera con flag `requiere_aprobacion_director = true` en el flujo de aprobación
- **THEN** se registra en el audit log la excepción al tope

---

## Gate en requisición

### Requirement: Alerta en aprobación de requisición cuando partida está limitada
Al aprobar una requisición en GT/Compras, SHALL verificar el saldo de la partida.

- Si `BLOQUEADO`: la req queda en estado `PENDIENTE_TRANSFERENCIA` — no puede avanzar sin acción del CP.
- Si `LIMITADO`: la req se aprueba con advertencia visible en el dashboard del CP.
- Si `LIBRE`: aprobación normal.

#### Scenario: Req bloqueada por partida agotada
- **WHEN** GT intenta aprobar una req de $30,000 para concepto `EST-002` que tiene `disponible = $5,000`
- **THEN** la req pasa a estado `PENDIENTE_TRANSFERENCIA`
- **THEN** se genera alerta en dashboard de CP: "Req #REQ-2026-089 bloqueada — falta $25,000 en partida EST-002"
- **THEN** se publica evento `gerencia_tecnica.partida_bloqueada`

---

## Ciclo de vida del saldo por partida

```
ACCIÓN                    → EFECTO EN SaldoPartida
────────────────────────────────────────────────────────────────────
Req aprobada (sin OC)     → monto_en_proceso     += monto_req
Req rechazada/cancelada   → monto_en_proceso     -= monto_req
OC generada               → monto_comprometido   += monto_OC
                             monto_en_proceso     -= monto_req_origen
OC cancelada              → monto_comprometido   -= monto_OC
Pago registrado (parcial) → monto_ejercido       += monto_pago
                             monto_comprometido   -= monto_pago
OC pagada total           → monto_ejercido       += saldo_OC restante
                             monto_comprometido   -= saldo_OC restante
TransferenciaPartida      → monto_aprobado       ajustado en origen/destino
────────────────────────────────────────────────────────────────────
```

---

## Endpoint: GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo

### Requirement: Retorna saldo completo de una partida
Disponible para roles `admin`, `superintendent`, `gerencia_tecnica`, `control_proyectos`.

```json
{
  "concepto_id":     "uuid",
  "concepto_clave":  "CIM-001",
  "concepto_desc":   "Cimentación zapatas aisladas",
  "monto_aprobado":  480000,
  "monto_en_proceso": 12000,
  "monto_comprometido": 68400,
  "monto_ejercido":  40800,
  "monto_disponible": 358800,
  "pct_comprometido": 22.8,
  "pct_ejercido":     8.5,
  "pct_disponible":  74.8,
  "estado_tope":     "LIBRE",
  "bloqueo_automatico": true
}
```

---

## Endpoint: POST /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer

Interno (solo llamado por Compras o Personal). Actualiza `monto_comprometido` y recalcula `estado_tope`. Idempotente por `referencia_id`.

---

## Endpoint: GET /api/v1/gerencia-tecnica/partidas/resumen

Retorna todas las partidas del proyecto con su estado de tope. Usado por el dashboard de CP.

```json
[
  { "concepto_clave": "CIM-001", "estado_tope": "LIBRE",     "pct_ejecutado": 17.3 },
  { "concepto_clave": "EST-002", "estado_tope": "LIMITADO",  "pct_ejecutado": 84.1 },
  { "concepto_clave": "ACB-003", "estado_tope": "BLOQUEADO", "pct_ejecutado": 102.4 }
]
```

---

## Evento publicado: `gerencia_tecnica.partida_bloqueada`

```typescript
{
  event_type: 'gerencia_tecnica.partida_bloqueada',
  payload: {
    concepto_id:      string,
    concepto_clave:   string,
    monto_aprobado:   number,
    monto_disponible: number,
    trigger:          string,  // 'OC' | 'REQUISICION' | 'NOMINA'
    referencia_id:    string,  // UUID de la OC o req que disparó el bloqueo
    referencia_codigo: string
  }
}
```

Consumido por: Control de Proyectos (genera alerta urgente), Compras (bloquea la OC).
