# Spec: trazabilidad-triangulo

## Propósito

Reporte de cierre de la cadena de trazabilidad completa: **presupuestado ↔ comprado ↔ consumido** por concepto/partida del presupuesto.

Hoy cada módulo tiene su pieza pero nadie puede ver el triángulo completo:
- GT sabe cuánto se presupuestó por APU
- Compras sabe cuánto se compró por OC
- Almacén (con spec `salida-almacen-obra`) sabrá cuánto se consumió en obra
- Control de Obra (con spec `salida-almacen-obra`) acumula el costo real de material

Este spec define el endpoint de trazabilidad en GT y la vista frontend que muestra las 3 cifras por concepto con semáforo de desviación.

---

## Dependencias

Este spec requiere que estén implementados:
- `salida-almacen-obra` — sin él, "consumido" siempre es 0
- APU cargado en GT (`POST /composicion-apu`) — sin él, "presupuestado por insumo" no está disponible

---

## Endpoint: GET /api/v1/gerencia-tecnica/trazabilidad/triangulo

### Requirement: GT agrega presupuestado + comprado + consumido por concepto
GT SHALL exponer este endpoint haciendo llamadas B2B internas a Compras y Control de Obra.

Parámetros opcionales:
- `?concepto_id=uuid` — filtrar por una sola partida
- `?tipo_insumo=MATERIAL|EQUIPO|SERVICIO` — filtrar por tipo de insumo

Respuesta:
```json
{
  "proyecto_id": "uuid",
  "presupuesto_id": "uuid",
  "generado_en": "2026-07-01T10:00:00Z",
  "parcial": false,
  "conceptos": [
    {
      "concepto_id":    "uuid",
      "clave":          "CIM-001",
      "descripcion":    "Cimentación — zapatas aisladas",
      "unidad":         "m³",
      "cantidad_presupuestada": 120.0,
      "monto_presupuestado":    480000.00,
      "insumos": [
        {
          "insumo_id":       "uuid",
          "clave":           "CEMENTO-42.5",
          "descripcion":     "Cemento Portland 42.5R saco 50kg",
          "unidad":          "saco",
          "tipo_insumo":     "MATERIAL",
          "presupuestado": {
            "cantidad":  1440.0,
            "monto":     86400.00,
            "fuente":    "APU"
          },
          "comprado": {
            "cantidad":  1200.0,
            "monto":     74400.00,
            "ocs":       ["OC-2026-042", "OC-2026-067"],
            "parcial":   false
          },
          "consumido": {
            "cantidad":  980.0,
            "monto":     60760.00,
            "parcial":   false
          },
          "semaforo": "VERDE",
          "desviacion_compra_pct":   -16.7,
          "desviacion_consumo_pct":  -31.9
        }
      ]
    }
  ],
  "resumen": {
    "total_presupuestado":  4800000.00,
    "total_comprado":       3920000.00,
    "total_consumido":      2150000.00,
    "desviacion_compra_pct": -18.3,
    "conceptos_en_alerta":  3
  }
}
```

El campo `parcial: true` se activa si Compras o Control de Obra no respondieron en tiempo.

---

## Lógica B2B interna

### Requirement: GT llama internamente a Control de Obra para obtener consumido
GT SHALL llamar a `GET /api/v1/control-obra/conceptos/{concepto_id}/costo-real` (definido en spec `salida-almacen-obra`) para obtener el material consumido. Si el servicio no responde en 2s, retorna `parcial: true` para ese concepto.

### Requirement: GT calcula comprado desde sus propios datos de OC proyectados
GT NO llama directamente a Compras. En cambio, Compras proyecta sus datos hacia GT vía eventos cuando se crea/cancela una OC (ya existen: `compras.oc_creada`, `compras.oc_cancelada`).

GT SHALL mantener una tabla de proyección `CompraProyectada`:

```
CompraProyectada {
  id            UUID PK
  tenant_id     UUID
  proyecto_id   UUID
  concepto_id   UUID          -- del concepto de la requisición origen
  insumo_id     UUID
  oc_id         UUID          -- referencia a OrdenCompra
  oc_codigo     VARCHAR(50)   -- desnormalizado
  cantidad      DECIMAL(18,4)
  monto         DECIMAL(18,2)
  estado        VARCHAR(20)   -- VIGENTE | CANCELADA
  created_at    TIMESTAMPTZ
}
```

GT suscribe `compras.oc_creada` → inserta en `CompraProyectada`.
GT suscribe `compras.oc_cancelada` → actualiza `estado = CANCELADA`.

#### Scenario: OC creada proyectada en GT
- **WHEN** Compras publica `compras.oc_creada` con `requisicion_id` y sus ítems
- **THEN** GT busca la `requisicion_id` para obtener `concepto_id`
- **THEN** GT inserta un registro por ítem en `CompraProyectada`

**Nota**: El evento `compras.oc_creada` debe incluir en su payload `requisicion_id` e `items[{insumo_id, cantidad, precio_unitario}]`. Si no los incluye actualmente, el evento debe enriquecerse.

---

## Semáforo de desviación

### Requirement: GT calcula semáforo por insumo
El semáforo compara cantidad comprada vs presupuestada:

| Condición | Semáforo |
|---|---|
| comprado >= 95% y <= 105% presupuestado | VERDE |
| comprado entre 80–95% o 105–120% | AMARILLO |
| comprado < 80% o > 120% presupuestado | ROJO |
| consumido > comprado | ROJO (sobre-consumo) |
| sin datos de compra aún | GRIS |

#### Scenario: Insumo sobre-comprado
- **WHEN** `comprado.cantidad > presupuestado.cantidad * 1.2`
- **THEN** `semaforo = 'ROJO'` y `desviacion_compra_pct` es positivo

#### Scenario: Sin consumo aún
- **WHEN** `consumido.cantidad == 0` (no hay salidas de almacén para ese insumo)
- **THEN** `consumido = { cantidad: 0, monto: 0, parcial: false }` y semáforo no penaliza por consumo

---

## Endpoint auxiliar: resumen por concepto sin detalle de insumos

### Requirement: GET /api/v1/gerencia-tecnica/trazabilidad/resumen
Para el dashboard (que necesita datos ligeros), GT SHALL exponer:

```json
[
  {
    "concepto_id":             "uuid",
    "clave":                   "CIM-001",
    "descripcion":             "Cimentación — zapatas aisladas",
    "monto_presupuestado":     480000.00,
    "monto_comprado":          392000.00,
    "monto_consumido":         210000.00,
    "semaforo":                "AMARILLO",
    "pct_comprado":            81.7,
    "pct_consumido":           43.8
  }
]
```

Este endpoint NO hace B2B — solo consulta `CompraProyectada` y `MaterialConsumidoObra` (via control-obra B2B) y los cruza con la APU local.

---

## Vista frontend: InsumosView — Tab "Trazabilidad"

### Requirement: Nueva pestaña en InsumosView
`InsumosView` (Gerencia Técnica) SHALL agregar una pestaña "Trazabilidad" junto a "Presupuesto", "Insumos" y "Control de Costos".

Contenido: tabla con una fila por concepto, columnas:
- Clave / Descripción
- Presupuestado ($)
- Comprado ($) + % de avance compra
- Consumido ($) + % de avance consumo
- Semáforo (ícono de color)
- Acción: expandir para ver desglose por insumo

#### Scenario: Fila expandida muestra desglose de insumos
- **WHEN** el usuario expande una fila de concepto
- **THEN** aparece una sub-tabla con cada insumo de la APU y sus 3 cifras (presupuestado/comprado/consumido)
- **THEN** los insumos con semáforo ROJO aparecen primero

#### Scenario: Datos parciales
- **WHEN** `parcial: true` en la respuesta del API
- **THEN** la UI muestra un badge "Datos incompletos — Compras/Almacén no disponibles" sin bloquear la vista

#### Scenario: Sin APU cargada
- **WHEN** el presupuesto no tiene composición APU
- **THEN** la pestaña muestra estado vacío con botón "Cargar APU" que abre el panel de importación existente
