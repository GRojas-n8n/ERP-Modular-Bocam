# Spec: requisicion-imprevisto-residente

## Comportamiento esperado

El flujo de imprevisto desde ResidenciaView es funcionalmente idéntico al de ComprasView, pero contextualizado para el Residente: el panel usa `accentColor="amber"` e `accentColor="indigo"` para el tipo normal.

### Flujo completo

1. El Residente abre "Nueva Requisición" y selecciona "⚠️ Imprevisto"
2. El panel cambia a estilo ámbar con banner informativo:
   > "Los imprevistos quedan etiquetados para reportes de desviación presupuestal. Procurement los revisará antes de cotizar."
3. El Residente agrega uno o más ítems:
   - `descripcion_libre`: texto libre obligatorio (ej. "Tabique rojo recocido 7×14×28 cm")
   - `unidad_libre`: selector de unidad (PZA, SAC, M3, etc.)
   - `cantidad`: numérico obligatorio
   - `notas`: texto libre opcional (ej. "Frente Nivel 12 eje A-B")
4. Puede agregar más ítems con el botón "Agregar ítem"
5. Puede eliminar ítems con el botón X (si hay más de uno)
6. Ajusta prioridad y agrega justificación del imprevisto
7. Clic en "Enviar Imprevisto a Compras"
8. Sistema llama `POST /api/v1/compras/requisiciones` con:
   ```json
   {
     "tipo": "IMPREVISTO",
     "prioridad": "ALTA",
     "observaciones": "Muro perimetral colapsado por lluvia",
     "items": [
       {
         "descripcion_libre": "Tabique rojo recocido 7×14×28 cm",
         "unidad_libre": "PZA",
         "cantidad": 500,
         "notas": "Frente Nivel 12 eje A-B",
         "es_imprevisto": true
       }
     ]
   }
   ```
9. Toast: `"REQ-xxx · Procurement la revisará antes de cotizar."`

### Criterios de validación (frontend)

| Condición | Comportamiento |
|---|---|
| Ningún ítem con descripción y cantidad | Toast error "Agrega al menos un ítem con descripción y cantidad" |
| `descripcion_libre` vacío en un ítem | Ese ítem se omite de la validación (solo los ítems válidos se envían) |
| API falla | Toast de error con mensaje del backend |

### Relación con ComprasView

- La misma requisición aparece en el tab Requisiciones de ComprasView para el rol `procurement`
- La tarjeta en ComprasView muestra el badge naranja "Imprevisto"
- Procurement puede aprobarla con el botón "Aprobar Requisición" → `PATCH /aprobar`
- Una vez APROBADA, puede iniciar el cuadro comparativo (Procurement cotiza el material imprevisto con proveedores)

### Trazabilidad

Los ítems con `es_imprevisto = true` son identificables en reportes:
- **Presupuestal**: el material no tiene `insumo_id` vinculado al APU → es automáticamente una desviación
- **Operativo**: el campo `observaciones` de la requisición documenta la causa del imprevisto
- **Temporal**: `fecha_solicitud` registra cuándo se detectó en obra
