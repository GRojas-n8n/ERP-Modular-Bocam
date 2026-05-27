# Spec: requisicion-desde-apu-residente

## Comportamiento esperado

### Flujo completo (modo real)

1. El Residente activa el tab "Requisiciones" en ResidenciaView
2. El sistema carga en paralelo:
   - `GET /api/v1/compras/requisiciones` → lista de reqs del proyecto
   - `GET /api/v1/gerencia-tecnica/presupuesto/activo` → conceptos APU disponibles
3. El Residente hace clic en "Nueva Requisición"
4. En el SlidePanel, selecciona tipo "📋 Desde APU"
5. Busca un concepto por clave o descripción (autocomplete, primeros 10 resultados)
6. Al seleccionar el concepto, el sistema llama `GET /api/v1/gerencia-tecnica/conceptos/:id/composicion`
7. Se filtran los ítems con `tipo_insumo === 'MATERIAL'` y se muestra la lista con cantidad = 0
8. El Residente ingresa la cantidad a ejecutar (ej. `15` si el concepto es en M3)
9. Los materiales recalculan: `cantidad_total = cantidad_unitaria × 15`
10. El Residente ajusta prioridad y agrega notas opcionales
11. Hace clic en "Generar Requisición APU"
12. El sistema llama `POST /api/v1/compras/requisiciones` con:
    ```json
    {
      "tipo": "NORMAL",
      "prioridad": "MEDIA",
      "observaciones": "Take-off APU · 1.3 · Cimentación corrida · 15 M3",
      "items": [
        { "insumo_id": "uuid-cemento", "cantidad": 4.5, "notas": "APU 1.3: 0.3 × 15 M3" },
        { "insumo_id": "uuid-grava",   "cantidad": 22.5, "notas": "APU 1.3: 1.5 × 15 M3" }
      ]
    }
    ```
13. Toast: `"REQ-xxx · 2 materiales · Procurement la revisará."`
14. La nueva req aparece en la lista con estado `PENDIENTE`

### Criterios de validación (frontend)

| Condición | Comportamiento |
|---|---|
| Sin concepto seleccionado | Toast error "Selecciona un concepto APU" |
| Cantidad ≤ 0 o vacía | Toast error "Ingresa una cantidad válida" |
| Concepto sin MATERIALES en composición | Banner en el panel: "Este concepto no tiene insumos MATERIAL" |
| API de composición falla | `materialesTakeoff = []`, sin crash |
| API `POST /requisiciones` falla | Toast de error con mensaje del backend |

### Estado del panel durante carga de composición

Mientras `loadingComposicion === true`:
- Se muestra un spinner centrado con texto "Cargando composición APU..."
- El botón submit no es visible todavía (no hay materiales aún)

### Mensajes en la lista de materiales

| Estado | Texto |
|---|---|
| Cantidad no ingresada | "Ingresa la cantidad para ver los totales" |
| Cantidad > 0 | Cantidad calculada en azul índigo (`text-indigo-700`) |

### Invariante de negocio

La requisición resultante tiene `tipo = 'NORMAL'` e ítems con `insumo_id` vinculados al catálogo de gerencia-tecnica. Esto permite que futuros reportes de desviación comparen lo requisitado contra el presupuesto APU original.
