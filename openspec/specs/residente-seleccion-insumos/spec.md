# Spec: residente-seleccion-insumos

## Comportamiento esperado

### Selector de tipo de requisición (ampliado)

En ResidenciaView → tab Requisiciones → "Nueva Requisición", el selector pasa de 2 a 3 opciones:

| Opción | Ícono | Accent | Descripción |
|---|---|---|---|
| **Por Insumo** | 📦 | `indigo` | Selecciona materiales, equipos o servicios del catálogo del proyecto |
| **Desde APU** | 📋 | `indigo` | Busca concepto APU, el sistema calcula la composición completa |
| **Imprevisto** | ⚠️ | `amber` | Texto libre sin catálogo |

La opción "Por Insumo" es el **default** (primera posición).

---

### Flujo "Por Insumo" (nuevo)

1. Residente selecciona "📦 Por Insumo"
2. Aparecen tabs de tipo: `MATERIAL | EQUIPO | SERVICIO`
3. En cada tab hay un campo de búsqueda y una lista del catálogo filtrada por tipo
4. El Residente busca y selecciona uno o varios insumos:
   - Al seleccionar un insumo, aparece en la lista de "ítems a requisitar" con un campo de cantidad
   - Puede agregar ítems de diferentes tipos en la misma requisición
5. Ingresa la cantidad requerida por ítem (numérico, unidad mostrada junto al campo)
6. Ajusta prioridad y notas opcionales
7. Clic en "Generar Requisición" → POST `/api/v1/compras/requisiciones`

```json
{
  "tipo": "NORMAL",
  "prioridad": "ALTA",
  "observaciones": "Materiales nivel 12",
  "items": [
    { "insumo_id": "uuid-tabique", "cantidad": 500, "notas": "Frente N12 eje A-B" },
    { "insumo_id": "uuid-mortero", "cantidad": 25 }
  ]
}
```

### Estado del panel durante carga del catálogo

- Los insumos se cargan cuando el Residente activa el tab Requisiciones (lazy load, mismo patrón que conceptos APU)
- Fuente: `GET /api/v1/gerencia-tecnica/presupuesto/activo` → campo `insumos`
- Si el catálogo está vacío: banner "Este proyecto no tiene insumos en el catálogo. Usa la opción Imprevisto."

### Criterios de validación

| Condición | Comportamiento |
|---|---|
| Sin ítems agregados | Botón deshabilitado |
| Ítem agregado sin cantidad | Toast "Ingresa la cantidad de todos los ítems" |
| Catálogo vacío | Banner informativo, no error |

---

### Flujo "Desde APU" (sin cambios de comportamiento)

El flujo existente se conserva intacto: buscar concepto → ingresar cantidad → composición calculada → enviar.

Solo cambia la etiqueta del selector: "📋 Desde APU (take-off completo)".

---

### Invariante de negocio

Ambos flujos (Por Insumo y Desde APU) generan requisiciones con `tipo = 'NORMAL'` e `insumo_id` vinculado al catálogo. Esto permite trazabilidad presupuestal en reportes de desviación.

---

### Campo común de notas: siempre identificado como visible para proveedores

En el formulario "Nueva Requisición", el campo común de notas (`reqNotas`, persistido
como `observaciones` de la requisición) se muestra con la etiqueta "Notas para
Proveedores", el placeholder orientado a proveedores y la leyenda "Se verán en la
Solicitud de Cotización y pueden llegar a los proveedores." para TODOS los tipos de
requisición, incluido IMPREVISTO — nunca como "Justificación". La justificación interna
del imprevisto se captura exclusivamente en el campo obligatorio por ítem
(`item.justificacion`). (Ver change `renombrar-notas-proveedores-imprevisto`: el dato
viaja a proveedores vía Solicitud de Cotización/correo, por lo que etiquetarlo como
justificación interna filtraba información sensible.)
