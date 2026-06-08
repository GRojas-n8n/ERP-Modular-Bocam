# Proposal — calificacion-proveedor

## Why

El catálogo de proveedores actualmente tiene un campo `calificacion_desempeno` de captura libre, sin historial ni trazabilidad. No hay manera de saber quién calificó, en qué proyecto, ni cómo evolucionó el score a lo largo del tiempo. La empresa no puede tomar decisiones de selección de proveedor basadas en desempeño real y documentado.

## What Changes

### Capacidades nuevas

1. **Registro de calificación por proyecto** — `procurement`/`admin` asigna una puntuación (0.0–5.0) y un comentario opcional al proveedor en el contexto de un proyecto específico. Una sola calificación por par (proveedor, proyecto); se puede actualizar mientras el proyecto esté activo.

2. **Promedio automático en tiempo real** — Cada vez que se registra o actualiza una calificación, el backend recalcula el promedio de todas las calificaciones del proveedor y actualiza `calificacion_desempeno` en la tabla `proveedores`. La tabla es la única fuente de verdad del score global.

3. **Historial de calificaciones** — SideSheet de historial accesible desde el catálogo: lista de calificaciones por proyecto con puntuación, comentario, nombre del proyecto, fecha y calificador.

4. **UI enriquecida en catálogo** — La columna de score en la tabla de proveedores muestra el promedio calculado con número de calificaciones entre paréntesis (ej. `★ 4.2 (3)`). El botón "Calificar" abre el formulario de registro/edición.

### Capacidades modificadas

- `calificacion_desempeno` en `Proveedor` pasa de ser editable directamente a ser **campo calculado** (solo lectura en el formulario de edición de proveedor).
- El formulario de nuevo/editar proveedor oculta el campo `calificacion_desempeno` o lo muestra como read-only con un enlace al historial.

## Impact

| Área | Impacto |
|---|---|
| Schema `compras` | Nueva tabla `calificaciones_proveedor` |
| Backend `compras` | 3 nuevos endpoints |
| Frontend `app-shell` | Nuevo SideSheet de historial + formulario de calificación |
| Datos existentes | `calificacion_desempeno` existente se conserva; se recalcula solo cuando se registre la primera calificación del sistema nuevo |

## No-Goals

- No integra con cierre automático de OC (punto de entrada único: catálogo de proveedores).
- No tiene flujo de aprobación de la calificación (no requiere validación de un superior).
- No califica dimensiones separadas (calidad técnica vs. puntualidad vs. precio); la calificación es un score holístico único.
