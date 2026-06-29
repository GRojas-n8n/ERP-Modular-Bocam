# Spec: nomina-a-contabilidad

## Propósito

Eslabón faltante entre **Personal/RRHH** y **Contabilidad**.
La mano de obra es el mayor costo en construcción. Hoy la nómina se autoriza y se paga pero ningún asiento contable refleja ese gasto — el Estado de Resultados y la Balanza están incompletos. Este spec cierra el ciclo: cuando una PreNomina se autoriza, Personal emite `personal.nomina_autorizada` y Contabilidad genera automáticamente el asiento en partida doble.

---

## Contexto de datos existente

- `PreNomina` ya tiene estados: `BORRADOR → CALCULADA → AUTORIZADA → PAGADA`
- `PreNomina.autorizado_por` y `PreNomina.fecha_autorizacion` ya existen en el schema
- El PATCH de autorización (`PATCH /api/v1/personal/prenominas/:id/autorizar`) existe pero NO emite evento
- Contabilidad ya tiene `mapper.ts` con función `buildMovimientosForPoliza` y 6 tipos de póliza
- El catálogo de cuentas tiene: 5100 "Costos Directos de Operación", 2100 "Proveedores y CxP"
- Falta: cuenta 2200 "Nómina por Pagar" y tipo de póliza `MANO_OBRA` en el mapper

---

## Evento publicado por Personal: `personal.nomina_autorizada`

### Requirement: Personal emite evento al autorizar PreNomina
Al transicionar `PreNomina.estado → AUTORIZADA`, Personal SHALL publicar el evento en `bocam.events`.

```typescript
{
  event_type: 'personal.nomina_autorizada',
  timestamp: string,
  context: {
    tenant_id:   string,
    proyecto_id: string,
    user_id:     string  // quien autorizó
  },
  payload: {
    prenomina_id:       string,   // UUID de PreNomina
    codigo:             string,   // ej. "NOM-2026-S22"
    periodo_tipo:       string,   // SEMANAL | QUINCENAL
    periodo_inicio:     string,   // ISO date
    periodo_fin:        string,   // ISO date
    total_percepciones: number,
    total_deducciones:  number,
    total_neto:         number,   // monto a registrar en póliza
    total_empleados:    number,
    autorizado_por_id:  string,
    autorizado_por_nombre: string
  }
}
```

#### Scenario: Evento publicado al autorizar
- **WHEN** `PATCH /api/v1/personal/prenominas/:id/autorizar` transiciona el estado a `AUTORIZADA`
- **THEN** el sistema publica `personal.nomina_autorizada` con el payload completo
- **THEN** la autorización se completa aunque el bus no esté disponible (best-effort)

#### Scenario: Re-autorización idempotente
- **WHEN** se intenta autorizar una PreNomina ya en estado `AUTORIZADA`
- **THEN** el sistema retorna 409 y NO vuelve a publicar el evento

---

## Cuenta contable nueva: 2200 Nómina por Pagar

### Requirement: Agregar cuenta 2200 al catálogo
El seed `seed_catalogo_cuentas.sql` SHALL incluir la cuenta:

```sql
INSERT INTO cuentas_contables (id_cuenta, clave, nombre, tipo, naturaleza, nivel, activa)
VALUES (gen_random_uuid(), '2200', 'Nómina por Pagar', 'PASIVO', 'ACREEDORA', 1, true)
ON CONFLICT (clave) DO NOTHING;
```

---

## Tipo de póliza nuevo: MANO_OBRA

### Requirement: Agregar MANO_OBRA al mapper de Contabilidad
`mapper.ts` SHALL incluir el mapping para el nuevo tipo:

| Tipo póliza | Cargo | Abono | Descripción |
|---|---|---|---|
| `MANO_OBRA` | 5100 (Costos Directos) | 2200 (Nómina por Pagar) | Reconocimiento del gasto de personal |
| `PAGO_NOMINA` | 2200 (Nómina por Pagar) | 1100 (Bancos) | Liquidación del pasivo de nómina |

El tipo `PAGO_NOMINA` se genera cuando la PreNomina transiciona a `PAGADA`.

#### Scenario: Cuadre de partida doble MANO_OBRA
- **WHEN** `buildMovimientosForPoliza('MANO_OBRA', 150000, 'Nómina S22 — 45 empleados')`
- **THEN** retorna `[{ clave_cargo: '5100', clave_abono: '2200', monto: 150000 }]`
- **THEN** cargo === abono (cuadre)

---

## Subscriber en Contabilidad: personal.nomina_autorizada

### Requirement: Contabilidad crea asiento MANO_OBRA al recibir el evento
Contabilidad SHALL suscribirse a `personal.nomina_autorizada` y crear `AsientoContable` tipo `MANO_OBRA`.

- `folio_poliza`: `POL-NOM-{prenomina_id[0:8]}`
- `concepto`: `"Nómina {codigo} — {total_empleados} empleados · {periodo_inicio} a {periodo_fin}"`
- `monto_total`: `total_neto` del payload
- `external_event_key`: `personal.nomina_autorizada:{prenomina_id}` (idempotencia)
- `beneficiario`: `"Nómina {periodo_tipo}"`

#### Scenario: Asiento creado al recibir evento
- **WHEN** se recibe `personal.nomina_autorizada` con `prenomina_id` nuevo
- **THEN** se crea `AsientoContable` tipo `MANO_OBRA` con los movimientos 5100/2200
- **THEN** los movimientos cuadran: Σcargo === Σabono === `total_neto`

#### Scenario: Idempotencia — evento duplicado
- **WHEN** el mismo evento `personal.nomina_autorizada` llega dos veces
- **THEN** el segundo se ignora (count guard por `external_event_key`)

#### Scenario: Corte de partida doble respetado
- **WHEN** `fecha_autorizacion < PARTIDA_DOBLE_CUTOFF`
- **THEN** se crea el `AsientoContable` pero NO se crean `MovimientoPoliza` (comportamiento existente del cutoff)

---

## Evento publicado por Personal al pagar: `personal.nomina_pagada`

### Requirement: Personal emite evento al pasar PreNomina a PAGADA
Al transicionar `PreNomina.estado → PAGADA`, Personal SHALL publicar `personal.nomina_pagada` con el mismo payload que `nomina_autorizada`.

Contabilidad lo consume y crea asiento tipo `PAGO_NOMINA` (2200 → 1100) cerrando el pasivo.

#### Scenario: Asiento PAGO_NOMINA
- **WHEN** se recibe `personal.nomina_pagada`
- **THEN** se crea asiento tipo `PAGO_NOMINA` con movimientos: cargo 2200 / abono 1100
- **THEN** el folio es `POL-PAG-NOM-{prenomina_id[0:8]}`
