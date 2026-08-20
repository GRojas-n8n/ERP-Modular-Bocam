# Spec: control-proyectos-modulo

## Propósito

Define el nuevo módulo **Control de Proyectos** (CP): microservicio independiente en puerto 3011, rol `control_proyectos`.

CP es el cerebro analítico del ERP. No posee operaciones — no aprueba, no compra, no paga. Lee eventos de todos los módulos, los agrega, calcula métricas de performance y emite alertas preventivas. Su único usuario directo es el **Director de Proyectos / Control de Proyectos**, que necesita ver en un solo lugar: cómo va el proyecto, cuándo terminará, cuánto costará al final y dónde están los riesgos.

---

## Datos propios del módulo (no existen en otro módulo)

### 1. ProgramacionObra — el Gantt simplificado

Sin fechas planificadas por partida, no hay Curva S ni SPI. Este es el único dato que el CP captura directamente (el usuario lo ingresa).

```
ProgramacionObra {
  id                UUID PK
  tenant_id         UUID
  proyecto_id       UUID
  concepto_id       UUID          -- cross-ref a GT Concepto
  concepto_clave    VARCHAR(100)  -- desnormalizado
  descripcion       TEXT

  fecha_inicio_plan DATE          -- inicio planificado de la partida
  fecha_fin_plan    DATE          -- fin planificado

  -- Curva S: distribución del avance planificado por período (semanal)
  -- Guardado como JSONB: [{ semana: "2026-W22", pct_acumulado: 15.0 }, ...]
  curva_programada  JSONB

  -- Campos calculados (actualizados por el subscriber de eventos)
  fecha_inicio_real DATE?         -- primer avance físico registrado
  fecha_fin_real    DATE?         -- cuando avance = 100%
  pct_avance_real   DECIMAL(5,2)  DEFAULT 0

  -- EVM acumulado
  cpi               DECIMAL(6,4)? -- Cost Performance Index
  spi               DECIMAL(6,4)? -- Schedule Performance Index
  eac               DECIMAL(18,2)? -- Estimate at Completion
  bac               DECIMAL(18,2)  -- Budget at Completion (= monto_aprobado en GT)

  estado            VARCHAR(20)   DEFAULT 'PENDIENTE'
  -- PENDIENTE: no iniciada
  -- EN_CURSO:  tiene avance registrado
  -- COMPLETADA: avance = 100%
  -- ATRASADA:  fecha_fin_plan superada y pct < 100%

  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

  @@unique([tenant_id, proyecto_id, concepto_id])
}
```

### 2. AlertaProyecto — alertas generadas automáticamente

```
AlertaProyecto {
  id            UUID PK
  tenant_id     UUID
  proyecto_id   UUID
  concepto_id   UUID?   -- null = alerta a nivel proyecto completo

  tipo          VARCHAR(50)
  -- PARTIDA_BLOQUEADA       : tope alcanzado
  -- SOBRE_COSTO_PROYECTADO  : CPI < 0.9 → EAC supera BAC
  -- RETRASO_CRITICO         : SPI < 0.8 en partida de ruta crítica
  -- MATERIAL_INMOVILIZADO   : suministrado >> consumido por N días
  -- BRECHA_FISICO_ECONOMICO : avance físico >> estimaciones facturadas
  -- PROVEEDOR_SIN_PAGAR     : OC pagada parcial > 60 días
  -- NOMINA_SIN_COSTO        : avance físico pero sin nómina registrada ese período
  -- IMPREVISTO_EXCESIVO     : imprevistos > 10% del presupuesto de la partida
  -- TRANSFERENCIA_PENDIENTE : req bloqueada esperando transferencia > 3 días

  severidad     VARCHAR(10)  -- INFO | WARN | CRITICA
  titulo        VARCHAR(200)
  descripcion   TEXT
  datos         JSONB        -- payload con números relevantes para la alerta

  estado        VARCHAR(20)  DEFAULT 'ACTIVA'
  -- ACTIVA: visible en dashboard
  -- RECONOCIDA: el CP la vio y marcó (con nota)
  -- RESUELTA: la condición ya no existe (calculado automáticamente)
  -- IGNORADA: el director decidió ignorarla con justificación

  nota_cp       TEXT?        -- nota que el CP deja al reconocer
  resuelta_en   TIMESTAMPTZ?

  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
}
```

### 3. ProyeccionCierre — snapshot periódico de EVM global

```
ProyeccionCierre {
  id              UUID PK
  tenant_id       UUID
  proyecto_id     UUID
  fecha_calculo   DATE          -- cuándo se calculó este snapshot

  -- EVM global del proyecto
  bac             DECIMAL(18,2) -- presupuesto total
  pv              DECIMAL(18,2) -- Planned Value: lo que debería estar hecho
  ev              DECIMAL(18,2) -- Earned Value: lo que está hecho en términos de presupuesto
  ac              DECIMAL(18,2) -- Actual Cost: lo que se ha gastado realmente

  cpi             DECIMAL(6,4)  -- ev/ac
  spi             DECIMAL(6,4)  -- ev/pv
  cv              DECIMAL(18,2) -- ev-ac (negativo = sobre costo)
  sv              DECIMAL(18,2) -- ev-pv (negativo = atraso)

  eac             DECIMAL(18,2) -- bac/cpi  (costo final proyectado)
  etc             DECIMAL(18,2) -- eac-ac   (lo que falta gastar)
  vac             DECIMAL(18,2) -- bac-eac  (variación al término, negativo = pérdida)

  fecha_fin_plan  DATE
  fecha_fin_proyectada DATE     -- calculada con SPI actual

  created_at      TIMESTAMPTZ
}
```

---

## Eventos que CP consume (subscribers)

CP es el mayor consumidor de eventos del sistema. Construye sus proyecciones a partir de:

| Evento | Acción en CP |
|---|---|
| `control_obra.avance_fisico_validado` | Actualiza `pct_avance_real`, `fecha_inicio_real`, calcula EVM por partida |
| `control_obra.estimacion_aprobada` | Actualiza EV acumulado del proyecto |
| `compras.oc_creada` | Actualiza AC comprometido por partida |
| `compras.oc_cancelada` | Revierte AC comprometido |
| `finanzas.pago_registrado` | Actualiza AC ejercido (costo real definitivo) |
| `almacen.salida_obra` | Detecta IRM por partida, alerta material inmovilizado |
| `personal.nomina_autorizada` | Actualiza AC de mano de obra por período |
| `gerencia_tecnica.partida_bloqueada` | Genera `AlertaProyecto` tipo PARTIDA_BLOQUEADA |
| `gerencia_tecnica.transferencia_partida_aprobada` | Recalcula EVM con nuevos topos |

---

## Curva S

### Requirement: Visualización de avance programado vs real por período

El endpoint `GET /api/v1/control-proyectos/curva-s?proyecto_id=` retorna los datos para graficar la Curva S.

```json
{
  "proyecto_id": "uuid",
  "periodos": [
    {
      "semana":          "2026-W18",
      "fecha_inicio":    "2026-04-28",
      "pv_acumulado_pct": 8.5,   -- % planificado acumulado
      "ev_acumulado_pct": 6.2,   -- % ejecutado acumulado (EV/BAC)
      "ac_acumulado_pct": 7.1,   -- % gastado acumulado (AC/BAC)
      "pv_acumulado_mxn": 1062500,
      "ev_acumulado_mxn": 775000,
      "ac_acumulado_mxn": 887500
    },
    { "semana": "2026-W19", ... }
  ],
  "hoy": "2026-W25",
  "partidas_criticas": [
    { "concepto_clave": "EST-002", "spi": 0.71, "cpi": 0.84 }
  ]
}
```

#### Scenario: Curva S sin programación cargada
- **WHEN** no existe `ProgramacionObra` para el proyecto
- **THEN** retorna `{ error: 'SIN_PROGRAMACION', mensaje: 'Cargue la programación de obra para ver la Curva S' }`

#### Scenario: Curva S con avance real disponible
- **WHEN** existen avances físicos validados y programación cargada
- **THEN** la curva real (EV) diverge de la programada (PV) en los períodos donde hubo retraso o adelanto

---

## EVM por partida y por proyecto

### Requirement: GET /api/v1/control-proyectos/evm
Retorna métricas EVM actuales. El sistema SHALL calcular el Costo Real (AC) de cada partida como la suma de
`ac_comprometido` (monto de órdenes de compra activas asociadas al
`concepto_id`) y `ac_ejercido` (monto de pagos a proveedor ya realizados
sobre esas órdenes de compra), y SHALL calcular el Valor Planeado (PV) de
cada partida interpolando `ProgramacionObra.curva_programada` a la fecha de
corte actual, en vez de derivar AC del mismo valor que EV o PV del mismo
porcentaje de avance físico que EV.

```json
{
  "proyecto_id": "uuid",
  "fecha_corte": "2026-06-29",
  "global": {
    "bac": 12500000,
    "pv":   3125000,
    "ev":   2480000,
    "ac":   2890000,
    "cpi":  0.858,
    "spi":  0.794,
    "cv":   -410000,
    "sv":   -645000,
    "eac":  14568800,
    "etc":  11678800,
    "vac":  -2068800,
    "fecha_fin_plan":       "2027-03-15",
    "fecha_fin_proyectada": "2027-06-22",
    "dias_retraso_proyectado": 99
  },
  "por_partida": [
    {
      "concepto_clave": "CIM-001",
      "bac":   480000,
      "ev":     44160,
      "ac":     52000,
      "cpi":    0.849,
      "spi":    0.912,
      "eac":   565370,
      "sobre_costo_proyectado": 85370,
      "semaforo": "ROJO"
    }
  ]
}
```

#### Scenario: AC se compone de comprometido y ejercido, no del avance físico
- **WHEN** se recalcula el EVM de una partida con `ac_comprometido = $50,000`
  y `ac_ejercido = $30,000`
- **THEN** `ac = $80,000` para esa partida, independientemente del valor de
  `ev` (avance físico valorizado)

#### Scenario: Una orden de compra nueva incrementa el comprometido de su partida
- **WHEN** se recibe el evento `compras.oc_creada` con `concepto_id` y
  `total`
- **THEN** el sistema incrementa `ac_comprometido` de la
  `ProgramacionObra` con ese `concepto_id` en el monto de la OC
- **AND** registra la relación `oc_id → concepto_id` para poder resolverla
  cuando la OC se cancele o se pague

#### Scenario: Una orden de compra cancelada revierte el comprometido de su partida
- **WHEN** se recibe el evento `compras.oc_cancelada` (payload sin
  `concepto_id`)
- **THEN** el sistema resuelve el `concepto_id` de esa orden mediante el
  registro guardado al procesar su `oc_creada`, y decrementa
  `ac_comprometido` de esa partida en el monto de la OC

#### Scenario: Un pago a proveedor mueve comprometido a ejercido
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'OrdenCompra'`
- **THEN** el sistema resuelve el `concepto_id` de esa orden y decrementa
  `ac_comprometido` e incrementa `ac_ejercido` de esa partida en el monto
  pagado

#### Scenario: Un pago de estimación al cliente no afecta el AC de ninguna partida
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'Estimacion'`
- **THEN** el sistema procesa la reconciliación de la estimación como ya lo
  hacía (comportamiento sin cambios) y no modifica `ac_comprometido` ni
  `ac_ejercido` de ninguna partida

#### Scenario: PV interpolado de la curva programada
- **WHEN** `ProgramacionObra.curva_programada` tiene puntos
  `[{semana: "2026-W20", pct_acumulado: 40}, {semana: "2026-W24", pct_acumulado: 70}]`
  y la fecha de corte cae en la semana `"2026-W22"`
- **THEN** `pv` se calcula con el `pct_acumulado` del último punto con
  semana `<=` la semana de corte (`40%` del `bac` en este ejemplo), no con
  el `pct_avance_real` de la partida

#### Scenario: Partida sin programación cargada no tiene SPI
- **WHEN** `ProgramacionObra.curva_programada` está vacío para una partida
- **THEN** `pv` y `spi` de esa partida son `null` en la respuesta, en vez de
  un valor calculado a partir del avance físico

### Requirement: Snapshot periódico de ProyeccionCierre
El sistema SHALL calcular y persistir un snapshot de `ProyeccionCierre` por
proyecto una vez al día, agregando el AC/EV/PV de todas sus partidas
(`ProgramacionObra`) más el AC de mano de obra a nivel proyecto tomado de
`finanzas.pago_registrado` con `referencia_entidad = 'PreNomina'`, para que
`GET /evm` y `GET /dashboard` dejen de devolver el bloque `global` en
`null`.

#### Scenario: El job nocturno persiste un snapshot nuevo cada día
- **WHEN** corre el job nocturno de recálculo (cada 24 horas)
- **THEN** por cada proyecto con `ProgramacionObra` activa, se crea un
  registro nuevo en `ProyeccionCierre` con `bac`/`pv`/`ev`/`ac` agregados de
  todas sus partidas más la mano de obra pagada del proyecto, y sus métricas
  derivadas (`cpi`, `spi`, `cv`, `sv`, `eac`, `etc`, `vac`)

#### Scenario: Mano de obra no se distribuye por partida
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'PreNomina'`
- **THEN** el monto pagado se suma únicamente al AC global del proyecto (vía
  el próximo snapshot de `ProyeccionCierre`), sin intentar atribuirlo a
  ninguna `ProgramacionObra`/`concepto_id` individual

#### Scenario: Dashboard deja de mostrar el resumen EVM global vacío
- **WHEN** un usuario consulta `GET /api/v1/control-proyectos/dashboard`
  después de que exista al menos un snapshot de `ProyeccionCierre`
- **THEN** `resumen_evm.cpi`, `resumen_evm.spi` y `resumen_evm.vac` devuelven
  valores numéricos, no `null`

---

## Alertas predictivas automáticas

### Requirement: Motor de alertas ejecutado periódicamente

El módulo CP SHALL calcular alertas automáticamente en dos momentos:
1. Al recibir cualquier evento relevante (tiempo real)
2. Cada 24 horas en job nocturno (batch completo)

El motor SHALL incluir, además de `SOBRE_COSTO_PROYECTADO` y
`RETRASO_CRITICO`, el tipo `VOLUMEN_EXCEDIDO`, evaluado comparando el
`AvanceFisico` más reciente de cada `concepto_id` de la partida contra su
`cantidad_presupuestada`.

#### Alerta: SOBRE_COSTO_PROYECTADO
- **WHEN** `CPI_global < 0.90` (se está gastando más de lo que se avanza)
- **THEN** crea alerta CRITICA: `"EAC proyectado supera presupuesto en ${vac}. A este ritmo, la obra costará ${eac} (${pct_sobre}% sobre presupuesto)"`

#### Alerta: RETRASO_CRITICO
- **WHEN** `SPI_partida < 0.80` Y `ProgramacionObra.fecha_fin_plan` en menos de 30 días
- **THEN** crea alerta CRITICA: `"Partida ${clave} tiene SPI ${spi}. Riesgo de no terminar en fecha. Retraso proyectado: ${dias} días"`

#### Alerta: VOLUMEN_EXCEDIDO
- **WHEN** el `AvanceFisico` más reciente de un `concepto_id` tiene
  `cantidad_acumulada > cantidad_presupuestada`
- **THEN** crea alerta WARN: `"La partida ${clave} lleva ${cantidad_acumulada} ${unidad} ejecutados, superando los ${cantidad_presupuestada} ${unidad} contratados (${pct_excedido}% de exceso). Requiere autorización de alcance adicional"`

#### Alerta: MATERIAL_INMOVILIZADO
- **WHEN** `stock_suministrado_partida > stock_consumido_partida × 1.5` por más de 15 días
- **THEN** crea alerta WARN: `"Hay ${monto_inmovilizado} en materiales de ${clave} en almacén sin consumir. Capital sin producir avance"`

#### Alerta: BRECHA_FISICO_ECONOMICO
- **WHEN** `avance_fisico_acumulado_pct - estimaciones_facturadas_pct > 15%`
- **THEN** crea alerta WARN: `"Se ha ejecutado ${pct_fisico}% pero solo se ha facturado ${pct_facturado}%. Hay ${monto_no_cobrado} de trabajo ejecutado sin cobrar"`

#### Alerta: IMPREVISTO_EXCESIVO
- **WHEN** `suma_reqs_imprevisto_partida / monto_aprobado_partida > 0.10`
- **THEN** crea alerta WARN: `"Los imprevistos de ${clave} superan el 10% del presupuesto. Revisar si el APU refleja el diseño real"`

#### Scenario: Alerta de volumen se resuelve automáticamente
- **WHEN** la `cantidad_presupuestada` de un concepto se amplía (ej. vía
  transferencia de partida o ajuste del presupuesto) y deja de ser menor a
  `cantidad_acumulada`
- **THEN** la alerta `VOLUMEN_EXCEDIDO` de ese concepto pasa a
  `estado = 'RESUELTA'` automáticamente con `resuelta_en = now()`

#### Scenario: Alerta se resuelve automáticamente
- **WHEN** la condición que generó la alerta ya no existe (ej. CPI sube de 0.88 a 0.93)
- **THEN** la alerta pasa a `estado = 'RESUELTA'` automáticamente con `resuelta_en = now()`

---

## Proyección de flujo de caja mensual

### Requirement: GET /api/v1/control-proyectos/proyeccion-flujo
Proyecta egresos e ingresos mes a mes basado en la programación y el ritmo actual.

```json
{
  "meses": [
    {
      "periodo": "2026-07",
      "egresos_proyectados": 850000,   -- pagos a proveedores esperados
      "ingresos_proyectados": 720000,  -- estimaciones por cobrar según avance
      "flujo_neto": -130000,           -- negativo = mes con déficit
      "partidas_activas": ["CIM-001", "EST-002"],
      "confianza": "ALTA"              -- ALTA si hay programación, BAJA si es extrapolación
    }
  ],
  "meses_con_deficit": ["2026-07", "2026-09"],
  "reserva_recomendada": 280000
}
```

---

## Ingreso de programación de obra

### Requirement: POST /api/v1/control-proyectos/programacion

Permite al CP cargar la programación planificada. Puede ser:
- **Manual** (UI): partida por partida con fechas y curva
- **Importación** desde archivo Excel (formato Gantt simplificado)

```json
[
  {
    "concepto_id": "uuid-CIM-001",
    "fecha_inicio_plan": "2026-04-15",
    "fecha_fin_plan":    "2026-06-30",
    "curva_programada": [
      { "semana": "2026-W16", "pct_acumulado": 10.0 },
      { "semana": "2026-W17", "pct_acumulado": 25.0 },
      { "semana": "2026-W18", "pct_acumulado": 50.0 },
      { "semana": "2026-W19", "pct_acumulado": 75.0 },
      { "semana": "2026-W20", "pct_acumulado": 90.0 },
      { "semana": "2026-W21", "pct_acumulado": 100.0 }
    ]
  }
]
```

#### Scenario: Programación suma 100% al final
- **WHEN** `curva_programada[-1].pct_acumulado != 100`
- **THEN** retorna 422: `"La curva debe terminar en 100%"`

---

## Dashboard del módulo CP

### Requirement: GET /api/v1/control-proyectos/dashboard

Panel ejecutivo de un solo vistazo para el Director de Proyectos.

```json
{
  "proyecto_id": "uuid",
  "resumen_evm": { "cpi": 0.858, "spi": 0.794, "vac": -2068800, "semaforo": "ROJO" },
  "alertas_activas": {
    "criticas": 2,
    "warnings": 5,
    "top_alertas": [
      { "tipo": "SOBRE_COSTO_PROYECTADO", "titulo": "EAC supera presupuesto en $2M", "severidad": "CRITICA" },
      { "tipo": "RETRASO_CRITICO", "titulo": "Estructura: SPI 0.71 — 99 días de retraso proyectado", "severidad": "CRITICA" }
    ]
  },
  "partidas_bloqueadas": 1,
  "transferencias_pendientes": 1,
  "capital_inmovilizado": 257000,
  "brecha_facturacion": 115200,
  "fecha_fin_proyectada": "2027-06-22",
  "dias_retraso": 99
}
```

---

## Puerto y microservicio

- **Puerto:** 3011
- **Nombre del servicio Docker:** `control-proyectos`
- **Base de datos schema:** `control_proyectos`
- **Roles de acceso:** `control_proyectos`, `director`, `admin`
- **Solo lectura para:** `superintendent`, `gerencia_tecnica` (pueden ver dashboard pero no modificar programación)

---

## Reglas de diseño del módulo

1. **CP no bloquea operaciones** — no es un gate. Los gates están en GT (tope de partida) y Finanzas (suficiencia presupuestal). CP solo informa y alerta.
2. **CP no llama a otros módulos en tiempo real** — construye sus proyecciones solo a partir de eventos. Si necesita datos históricos iniciales, hace una llamada B2B de inicialización al arrancar.
3. **Las proyecciones son snapshots** — `ProyeccionCierre` se calcula y guarda como snapshot diario. El dashboard siempre muestra el último snapshot, no recalcula en cada request.
4. **Sin datos de programación, no hay Curva S ni SPI** — el módulo es honesto: informa qué falta en lugar de mostrar datos incompletos como si fueran completos.
