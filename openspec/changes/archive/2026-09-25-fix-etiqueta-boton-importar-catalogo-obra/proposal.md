## Why

En la pestaña "Catálogo de Obra" de Gerencia Técnica, los botones de importación dicen "Importar OPUS" (barra de acciones) e "Importar desde OPUS" (estado vacío "Sin catálogo cargado"). El nombre correcto de lo que se importa es el catálogo de conceptos del presupuesto (clave, descripción, unidad, cantidad, precio unitario, importe) — OPUS es solo el software de origen del archivo exportado, no el nombre de la funcionalidad. La etiqueta actual confunde el nombre del software externo con el nombre de la acción dentro del sistema.

## What Changes

- El botón "Importar OPUS" (barra de acciones de Catálogo de Obra) pasa a decir "Importar Catálogo de Conceptos".
- El botón "Importar desde OPUS" (estado vacío "Sin catálogo cargado") pasa a decir "Importar Catálogo de Conceptos", por consistencia — es la misma acción (`fileInputRef.current?.click()`), solo se mostraba con una etiqueta ligeramente distinta según el estado de la pantalla.
- No cambia el texto explicativo que menciona OPUS como origen del archivo (ej. "Exporta el PRESUPUESTO desde OPUS...") — esa prosa sí necesita nombrar el software externo para guiar al usuario en la exportación.

## Capabilities

### New Capabilities
- `etiquetas-importacion-catalogo-obra`: documenta el texto correcto de los botones de importación en la pestaña Catálogo de Obra, hoy sin spec propio.

### Modified Capabilities
(ninguna)

## Impact

- Código afectado: `apps/app-shell/src/views/InsumosView.tsx` (dos botones en la pestaña "Catálogo de Obra": barra de acciones y estado vacío).
- Cambio puramente de texto — no afecta lógica, endpoints ni el flujo de importación.
