## Context

Se reprodujo el 500 corriendo `parsearArchivoAPU`/`parsearArchivoExplosion` (extraídos a un script Node standalone, misma lógica que `InsumosView.tsx`) contra los archivos reales de OPUS que el usuario intentó subir. Ambos parsers detectan boilerplate por *patrones de texto específicos* (nombres de sección, palabras como "total"/"subtotal"/"rendimiento"), pero no tienen ningún límite de plausibilidad para `clave`/`unidad_medida` — cualquier texto que no matchee un patrón conocido de "fila a ignorar" se trata como insumo real.

`POST /insumos/importar-lote` (`apps/gerencia-tecnica/src/main.ts:319-433`) ya tiene una asimetría de manejo de errores: el loop de `update` de insumos existentes captura excepciones por ítem (línea 420, cuenta como "omitido"), pero el `createMany` de insumos nuevos (líneas 387-402) no — cualquier fila que Postgres rechace tumba el INSERT completo sin capturar.

## Goals / Non-Goals

**Goals:**
- Que una fila de boilerplate (firma, título repetido, o cualquier variante futura no prevista) nunca llegue a corromper la importación ni a tumbar el endpoint — se descarta silenciosamente como cualquier otra fila no reconocida, igual que ya pasa con filas de "total"/"subtotal".
- Que el backend sea resiliente a datos fuera de rango independientemente del frontend (defensa en profundidad), usando el mismo patrón de "omitido" que ya existe para otras validaciones.
- Que la composición APU agrupe correctamente por concepto real cuando el archivo usa celdas combinadas para "Clave: X".
- Que un error de importación, si ocurre, sea diagnosticable desde el mensaje que ve el usuario.

**Non-Goals:**
- No se agrega un catálogo exhaustivo de frases de boilerplate a reconocer por texto ("representante legal", "firma", etc.) — es un enfoque frágil (cualquier variante de redacción lo evade). En su lugar, un límite de longitud plausible cubre esta clase de problema de forma genérica.
- No se cambia el parser de Catálogo de Conceptos (OPUS), que ya es robusto por usar nombres de columna en vez de posiciones fijas.
- No se agrega validación de longitud de `descripcion` — la columna es `Text` (sin límite), no aplica.

## Decisions

- **Límite de longitud como filtro, no como "error a mostrar":** una fila con `clave`/`unidad_medida` fuera de rango se **descarta silenciosamente** en el parser (no se agrega a `insumoMap`, no aparece en el preview ni como fila con `_error`) — no es un insumo con datos incompletos que el usuario deba corregir, es una fila que nunca debió interpretarse como insumo. Alternativa descartada: marcarla `_valido: false` con un `_error` — dejaría basura visible en el preview y seguiría dependiendo de que `validPreviewInsumos` filtre correctamente por validez, que es justamente el filtro que hoy no cubre longitud.
- **Mismo límite en frontend y backend (50/20, igual a las columnas de la BD):** el frontend es la primera línea de defensa (evita que el usuario vea/envíe basura), el backend es la segunda (protege el endpoint sin importar el origen del payload). Se decide no centralizar el límite en un solo lugar compartido — el frontend y el backend son paquetes npm distintos sin un módulo común de constantes hoy; duplicar dos literales (50, 20) es aceptable y de bajo riesgo de desincronización porque están atados a un `@db.VarChar` que rara vez cambia.
- **El `createMany` de insumos nuevos sigue siendo una sola operación por lote** (no se cambia a inserciones individuales con try/catch por fila, que sería más lento para lotes grandes) — en su lugar, la validación de longitud/rango se hace en el mismo loop de validación que ya existe (líneas 348-366), antes de separar `nuevos` de `aActualizar`, así que las filas problemáticas nunca llegan al `createMany`.
- **`extraerClaveConcepto`: saltar duplicados de "Clave:" en la búsqueda del valor.** En vez de tomar el primer valor no vacío tras la celda "Clave:", se ignoran también las celdas que sean ellas mismas otra copia de "Clave:"/"Clave" (con o sin dos puntos) — cubre el caso de celdas combinadas donde la etiqueta se repite en varias columnas antes de llegar a la celda con el valor real.

## Risks / Trade-offs

- [Riesgo] Un insumo real con una unidad de medida inusualmente larga (>20 caracteres) se descartaría silenciosamente sin avisar al usuario → Mitigación: 20 caracteres es un límite generoso para unidades de obra reales (todas las observadas en los archivos de ejemplo miden ≤5 caracteres); si esto ocurre en la práctica, el usuario ya tiene el patrón de diagnóstico existente en consola (`console.warn` del parser) para investigarlo, y el conteo de "omitidos" en el toast de éxito refleja que algo se descartó.
- [Trade-off] La validación de longitud se duplica en frontend y backend — aceptado deliberadamente (ver Decisiones) por ser el patrón de defensa en profundidad ya usado en el resto del proyecto (ej. RLS a nivel de BD además de checks de rol en el backend).
