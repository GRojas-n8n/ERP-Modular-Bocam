# Spec: Partida Obligatoria en Requisición

## Comportamiento esperado

### Cardinalidad

- Una partida del catálogo de conceptos puede tener **muchas** requisiciones.
- Una requisición pertenece a **una sola** partida (campo `concepto_id` en el header de `requisiciones`).

### Validación backend

- `POST /api/v1/compras/requisiciones` → si `concepto_id` está ausente o nulo → `400` con mensaje `"concepto_id es obligatorio"`
- El campo se valida contra los conceptos del proyecto activo del usuario (del JWT)
- Excepción: `tipo = 'APU'` usa `concepto_origen_id` como `concepto_id` automáticamente

### Flujo "Por Insumo" (ResidenciaView y ComprasView)

1. Al abrir el formulario de nueva req, el primer campo es **"Partida del catálogo"** (selector con búsqueda)
2. El selector carga `GET /api/v1/gerencia-tecnica/proyectos/:id/conceptos` — lista de conceptos del proyecto activo
3. Muestra: `[clave] descripción — $monto_presupuestado`
4. El botón "Generar Requisición" está **deshabilitado** hasta que haya una partida seleccionada
5. El formulario muestra debajo del selector: `Presupuesto de esta partida: $XXX,XXX`

### Flujo "Imprevisto" (ResidenciaView)

- Mismo selector de partida en el header del formulario
- Obligatorio antes de poder enviar
- La justificación del imprevisto explica por qué se necesita fuera del presupuesto original

### Flujo "APU" (ResidenciaView)

- Al seleccionar el concepto APU, ese concepto se usa automáticamente como `concepto_id`
- No se muestra un selector adicional (el concepto APU ya es la partida)

### Visualización en lista de reqs

- En los cards de requisición (ComprasView y ResidenciaView) mostrar la clave y nombre corto de la partida: `[01.001] Cimentación`
