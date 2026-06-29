# Spec: ventas-a-obra

## Propósito

Eslabón faltante entre **Ventas** y **Gerencia Técnica / Inicio de Obra**.
Hoy Ventas emite `ventas.cotizacion_aceptada` pero nadie lo escucha: el ciclo de ingresos (ventas al cliente) está completamente desconectado del ciclo de costos (presupuesto + ejecución). Este spec define cómo la aceptación de una cotización dispara el inicio formal del ciclo de obra en GT, asegurando que cada proyecto nace de un contrato real.

---

## Arquitectura del flujo

```
Ventas: cotización aceptada por el cliente
    │ publica: ventas.cotizacion_aceptada
    ▼
Gerencia Técnica: recibe el evento
    │ crea ProyectoVinculado con referencia a la cotización
    │ activa el proyecto para carga de presupuesto
    ▼
Admin: sube APU + catálogo de conceptos en GT
    ▼
GT: presupuesto APROBADO → cadena de obra inicia
```

---

## Contexto de datos existente

- `ventas/main.ts` ya publica `ventas.cotizacion_aceptada` con payload `{ cotizacion_id, proyecto_id, cliente_nombre, monto_contrato, moneda }`
- Los proyectos se crean en **Auth** (tabla `projects` de tenant) — el `proyecto_id` ya existe cuando la cotización se acepta
- GT no tiene tabla de vinculación cotización → proyecto
- El campo `presupuesto_activo` en GT no indica si el proyecto fue iniciado desde Ventas o manualmente

---

## Nueva entidad: ProyectoObraVinculado (en GT)

```
ProyectoObraVinculado {
  id              UUID PK
  tenant_id       UUID
  proyecto_id     UUID     -- cross-ref a Auth projects
  cotizacion_id   UUID     -- cross-ref a Ventas
  monto_contrato  DECIMAL(18,2)
  moneda          VARCHAR(3)  DEFAULT 'MXN'
  cliente_nombre  VARCHAR(255)
  fecha_contrato  DATE
  estado          VARCHAR(30)  -- SIN_PRESUPUESTO | CON_PRESUPUESTO | EN_EJECUCION | CERRADO
  notas           VARCHAR(500)?
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
}
```

---

## Subscriber en GT: ventas.cotizacion_aceptada

### Requirement: GT crea ProyectoObraVinculado al recibir el evento
Gerencia Técnica SHALL suscribirse a `ventas.cotizacion_aceptada` y registrar el vínculo.

Payload esperado del evento:
```typescript
{
  event_type: 'ventas.cotizacion_aceptada',
  context: { tenant_id, proyecto_id, user_id },
  payload: {
    cotizacion_id:   string,
    proyecto_id:     string,
    cliente_nombre:  string,
    monto_contrato:  number,
    moneda:          string,
    fecha_aceptacion: string  // ISO date
  }
}
```

#### Scenario: Vínculo creado exitosamente
- **WHEN** Ventas publica `ventas.cotizacion_aceptada` con `proyecto_id` y `cotizacion_id` válidos
- **THEN** GT crea `ProyectoObraVinculado` con `estado = 'SIN_PRESUPUESTO'`
- **THEN** GT registra en log: `[GT] Proyecto {proyecto_id} vinculado a cotización {cotizacion_id} — {cliente_nombre} — ${monto_contrato}`

#### Scenario: Idempotencia — cotización ya vinculada
- **WHEN** el mismo evento llega dos veces
- **THEN** el sistema verifica `@@unique([tenant_id, cotizacion_id])` y hace ack sin crear duplicado

#### Scenario: Proyecto no existe en contexto del tenant
- **WHEN** el `proyecto_id` del evento no está en la BD de GT del tenant
- **THEN** el sistema crea el vínculo de todas formas (la validación de existencia es responsabilidad de Auth)
- **THEN** registra warning en log para revisión

---

## Transición de estado del vínculo

### Requirement: Estado del vínculo se actualiza con el ciclo de obra
El `ProyectoObraVinculado.estado` SHALL evolucionar automáticamente:

| Evento / acción | Transición de estado |
|---|---|
| `ventas.cotizacion_aceptada` recibido | `SIN_PRESUPUESTO` (estado inicial) |
| Presupuesto creado + aprobado en GT | `CON_PRESUPUESTO` |
| Primera requisición aprobada | `EN_EJECUCION` |
| Última estimación facturada y pagada | `CERRADO` |

#### Scenario: Estado cambia al aprobar presupuesto
- **WHEN** se aprueba un `Presupuesto` para el proyecto vía `PATCH /presupuestos/:id/aprobar`
- **THEN** GT actualiza `ProyectoObraVinculado.estado = 'CON_PRESUPUESTO'`

---

## Endpoint en GT: GET /api/v1/gerencia-tecnica/proyectos-vinculados

### Requirement: Listar proyectos con su origen contractual
GT SHALL exponer este endpoint para mostrar todos los proyectos y su estado de vinculación con Ventas.

```json
[
  {
    "proyecto_id":     "uuid",
    "cotizacion_id":   "uuid",
    "cliente_nombre":  "Inmobiliaria XYZ SA de CV",
    "monto_contrato":  12500000.00,
    "moneda":          "MXN",
    "estado":          "CON_PRESUPUESTO",
    "tiene_presupuesto": true,
    "fecha_contrato":  "2026-06-15"
  }
]
```

#### Scenario: Proyecto sin cotización (creado manualmente)
- **WHEN** un proyecto existe en Auth pero no tiene `ProyectoObraVinculado`
- **THEN** NO aparece en este endpoint (solo aparecen los que nacieron de Ventas)

#### Scenario: Filtro por estado
- **WHEN** `GET /api/v1/gerencia-tecnica/proyectos-vinculados?estado=SIN_PRESUPUESTO`
- **THEN** retorna solo proyectos aceptados por el cliente que aún no tienen presupuesto cargado

---

## Alerta en dashboard GT

### Requirement: KPI "Proyectos sin presupuesto" en dashboard GT
El endpoint `GET /api/v1/gerencia-tecnica/dashboard` SHALL incluir:
```json
{
  "proyectos_sin_presupuesto": number,  // ProyectoObraVinculado con estado SIN_PRESUPUESTO
  "proyectos_en_ejecucion":    number,
  "monto_contratado_activo":   number   // suma monto_contrato de proyectos EN_EJECUCION
}
```

#### Scenario: Alerta visible cuando hay proyectos sin presupuesto
- **WHEN** existen proyectos con `estado = 'SIN_PRESUPUESTO'`
- **THEN** el KPI aparece con tono warning en el dashboard de GT
- **THEN** el tooltip indica "Proyectos con contrato firmado pendientes de presupuesto"

---

## Enriquecimiento del evento en Ventas

### Requirement: Ventas incluye fecha_aceptacion en el evento
El payload de `ventas.cotizacion_aceptada` SHALL incluir `fecha_aceptacion` (ISO date) para registrar la fecha contractual.

#### Scenario: Fecha contractual preservada
- **WHEN** GT recibe el evento
- **THEN** `ProyectoObraVinculado.fecha_contrato = payload.fecha_aceptacion`
