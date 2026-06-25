# Spec — Justificación de Excedentes e Imprevistos

## Criterios de Aceptación

**CA-1: Campo justificación obligatorio en excedente de cantidad**
- Dado que el Residente selecciona un insumo del catálogo y captura una cantidad mayor que `cantidad_presupuestada`
- Cuando intenta generar la requisición sin haber escrito una justificación
- Entonces el sistema muestra error "El ítem [clave] excede el presupuesto — escribe una justificación" y bloquea el envío

**CA-2: Campo justificación obligatorio en IMPREVISTO**
- Dado que el Residente crea una requisición de tipo IMPREVISTO con ítems de texto libre
- Cuando intenta generar la requisición sin justificación
- Entonces el sistema bloquea el envío con mensaje claro

**CA-3: Justificación persiste en BD**
- Dado que el Residente envía la justificación correctamente
- Cuando Compras abre el detalle de la requisición
- Entonces puede leer el texto de justificación junto a cada renglón que lo requirió

**CA-4: Ítems dentro de presupuesto no requieren justificación**
- Dado que el ítem tiene `cantidad <= cantidad_presupuestada`
- Entonces el campo de justificación no aparece y no es requerido

**CA-5: El backend rechaza si falta justificación**
- Si el frontend omite la validación (manipulación de request)
- El backend retorna 400: `{ success: false, message: "El ítem [clave] requiere justificación: excede presupuesto o es imprevisto" }`
