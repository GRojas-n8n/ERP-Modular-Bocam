# Spec: requisicion-imprevisto

## Comportamiento esperado

### Endpoint: POST /api/v1/compras/requisiciones (tipo IMPREVISTO)

**Payload válido:**
```json
{
  "tipo": "IMPREVISTO",
  "prioridad": "MEDIA",
  "observaciones": "Motivo del imprevisto...",
  "items": [
    {
      "descripcion_libre": "Tabique rojo recocido 7x14x28 cm",
      "unidad_libre": "PZA",
      "cantidad": 500,
      "notas": "Frente Nivel 12 eje A-B",
      "es_imprevisto": true
    }
  ]
}
```

**Reglas de validación:**
- `items` debe ser un array no vacío
- Para ítems IMPREVISTO: `descripcion_libre` es obligatorio en el frontend (el backend acepta null pero el frontend lo valida)
- `insumo_id` es null para ítems IMPREVISTO — el backend los persiste con `insumo_id: null`
- `tipo: 'NORMAL'` con `insumo_id: null` en un ítem: permitido en backend (nullable), advertencia en frontend

**Respuesta exitosa (`201`):**
```json
{
  "success": true,
  "data": {
    "id_requisicion": "uuid",
    "codigo": "REQ-1748398021234",
    "tipo": "IMPREVISTO",
    "estado": "PENDIENTE",
    "items": [...]
  }
}
```

### Persistencia en DB

```
requisiciones_items:
  insumo_id      = NULL
  descripcion_libre = "Tabique rojo recocido..."
  unidad_libre   = "PZA"
  cantidad       = 500.0000
  es_imprevisto  = true
  notas          = "Frente Nivel 12 eje A-B"
```

### Trazabilidad y reportes

Los ítems con `es_imprevisto = true` se etiquetan como desviación presupuestal. En el cuadro comparativo, un renglón de imprevisto no tiene `insumo_id` vinculado al catálogo APU, lo que significa que no puede cruzarse automáticamente con el presupuesto de `gerencia-tecnica`. Esto es intencional: el imprevisto es, por definición, fuera del presupuesto original.

### Flujo en ComprasView (frontend)

1. El usuario selecciona tipo "⚠️ Imprevisto" en el selector del SlidePanel.
2. El accentColor del panel cambia a `amber`.
3. Se muestra un banner informativo sobre la desviación presupuestal.
4. Cada ítem tiene: campo de texto libre `descripcion_libre`, selector de `unidad_libre`, campo numérico `cantidad`, campo opcional `notas`.
5. El botón submit cambia a "Crear Req. Imprevisto".
6. En modo demo: se muestra toast de éxito sin llamada al backend.

### Badge visual

Las tarjetas de requisición con `tipo === 'IMPREVISTO'` muestran un badge naranja "Imprevisto" en la esquina superior derecha, para distinguirlas visualmente de las requisiciones normales del catálogo APU.
