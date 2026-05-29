# Spec: pre-req-gt

## Comportamiento esperado

### Flujo completo

1. GT calcula take-off en InsumosView: selecciona concepto APU + ingresa cantidad
2. Aparece la lista de ítems calculados
3. En lugar del botón directo "Generar Requisición", aparece: **"Preparar Requisición →"** (color `violet`)
4. Al hacer clic, abre un SlidePanel titulado "Pre-Requisición — Revisar y Enviar"
5. El panel muestra:
   - Encabezado: concepto, cantidad, unidad
   - Filtro de tipo: `Todos | MATERIAL | EQUIPO | SERVICIO | MANO_OBRA`
   - Lista de ítems con:
     - Checkbox ✓/✗ (default: todos los que tienen `cantidad_total > 0` están seleccionados)
     - Descripción + clave del insumo
     - Badge de tipo (MATERIAL=azul, EQUIPO=naranja, SERVICIO=verde, MANO_OBRA=gris)
     - Campo `cantidad` editable (pre-llenado con el cálculo del take-off, numérico)
     - Campo `notas` (texto libre opcional por ítem)
   - Contador de ítems seleccionados: "X de Y ítems incluidos"
   - Selector de prioridad: NORMAL / ALTA / URGENTE
   - Textarea de observaciones generales
   - Botón "Enviar Requisición a Compras" (emerald)
6. GT revisa, desmarca lo que no necesita, ajusta cantidades
7. Clic en "Enviar" → POST `/api/v1/compras/requisiciones` con los ítems seleccionados y sus cantidades ajustadas
8. Toast: `"REQ-xxx · N ítems · Compras la recibirá para cotizar."`

### Payload enviado

```json
{
  "tipo": "NORMAL",
  "prioridad": "ALTA",
  "observaciones": "Take-off APU · 1.3 · Cimentación corrida · 15 M3",
  "items": [
    { "insumo_id": "uuid-cemento", "cantidad": 4.5, "notas": "APU 1.3" },
    { "insumo_id": "uuid-grava",   "cantidad": 22.5 }
  ]
}
```

### Criterios de validación

| Condición | Comportamiento |
|---|---|
| Ningún ítem seleccionado | Botón submit deshabilitado + texto "Selecciona al menos un ítem" |
| Ítem seleccionado con cantidad ≤ 0 | Toast error "Ajusta la cantidad de todos los ítems seleccionados" |
| API falla | Toast de error con mensaje del backend |

### Diferencia con flujo anterior

| Antes | Después |
|---|---|
| Botón "Generar Requisición" → POST inmediato | Botón "Preparar Requisición" → SlidePanel de revisión |
| Solo ítems tipo MATERIAL | Todos los tipos de insumo |
| Sin posibilidad de ajustar cantidades | Cantidades editables por ítem |
| Sin posibilidad de excluir ítems | Checkbox por ítem |
