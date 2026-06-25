# Spec: Acumulado de Costos por Partida

## Comportamiento esperado

### Endpoint

`GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-wbs`

Roles: `gerencia_tecnica`, `superintendent`, `admin`, `control_obra`

### Response

```json
{
  "success": true,
  "data": [
    {
      "concepto_id": "uuid",
      "clave": "01.001",
      "descripcion": "Cimentación de concreto armado",
      "unidad": "M3",
      "cantidad": 120,
      "costo_unitario": 4500.00,
      "presupuesto": 540000.00,
      "comprometido": 194400.00,
      "pagado": 108000.00,
      "pct_economico": 36.0,
      "pct_fisico": 30.0,
      "semaforo": "verde",
      "categoria_desglose": [
        { "categoria": "Materiales", "comprometido": 120000.00 },
        { "categoria": "Mano de Obra Subcontratada", "comprometido": 74400.00 }
      ]
    }
  ]
}
```

### Cálculo

```
presupuesto   = concepto.costo_unitario × concepto.cantidad
comprometido  = SUM(oc.total) WHERE req.concepto_id = concepto.id
                AND oc.estado IN ('EMITIDA', 'APROBADA', 'PAGADA')
pagado        = SUM(oc.total) WHERE req.concepto_id = concepto.id
                AND oc.estado = 'PAGADA'
pct_economico = (comprometido / presupuesto) × 100
pct_fisico    = obtenido de control-obra vía HTTP (degradación elegante si falla)
```

### Semáforo

```
ratio = pct_economico / pct_fisico

verde  : ratio ≤ 1.10
ambar  : 1.10 < ratio ≤ 1.30
rojo   : ratio > 1.30
gris   : pct_fisico = 0 o no disponible
```

### Requisición → OC: nuevo vínculo

Para que el cálculo funcione, `ordenes_compra` debe tener `requisicion_id` (FK nullable). Al emitir una OC desde el flujo de comparativa, se hereda el `concepto_id` de la req original.

### Endpoint de resumen por categoría

`GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-categorias`

Roles: `gerencia_tecnica`, `superintendent`, `admin`, `control_obra`

```json
{
  "data": [
    {
      "categoria_id": "uuid",
      "categoria_nombre": "Materiales",
      "presupuesto_total": 1200000.00,
      "comprometido_total": 620000.00,
      "pagado_total": 400000.00,
      "pct_comprometido": 51.7
    }
  ]
}
```
