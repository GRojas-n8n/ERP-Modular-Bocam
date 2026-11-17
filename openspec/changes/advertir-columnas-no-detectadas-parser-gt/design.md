## Context

Ambos parsers (`InsumosView.tsx:313-533` para APU, `561-647` para Explosión) usan el mismo patrón de dos niveles para ubicar columnas en el Excel/CSV real de OPUS:

1. **Columnas obligatorias** (`clave`, `descripcion`): si no aparecen en el encabezado, `headerDetectado` nunca se activa, el loop entero se salta con `continue`, y la función retorna vacío. El usuario ve "No se encontraron insumos..." — falla de forma segura y visible.
2. **Columnas secundarias** (`unidad`, `cantidad`, `rendimiento` en APU; `unidad`, `costo unitario` en ambos): cada una tiene un `if (iX >= 0) colX = iX;` — si el nombre esperado no aparece en esa fila de encabezado, `colX` se queda en su valor por defecto (declarado antes del loop, p. ej. `colCostoUnitario = 6` en APU). La función **no falla ni avisa** — simplemente sigue leyendo esa columna fija para todas las filas del archivo, aunque no corresponda al layout real de ese archivo específico.

El fix de longitud/rango (`fix-500-importar-insumos-explosion-apu`, ya implementado) resuelve que un valor fuera de rango no cause un 500 — pero un valor mal alineado que *sí* cabe en su columna (un número corto leído de la celda equivocada) pasa esa validación sin problema y se importa con el precio/unidad equivocados, sin que nadie lo note hasta que alguien audite el catálogo manualmente.

## Goals / Non-Goals

**Goals:**
- El usuario ve, antes de confirmar una importación, si alguna columna secundaria (unidad, cantidad, rendimiento, costo unitario) no pudo confirmarse contra el encabezado real del archivo y se usó una posición por defecto.
- Ningún comportamiento de parseo existente cambia — mismos insumos, mismos valores, mismas columnas leídas. El cambio es puramente de visibilidad.
- Los parsers quedan testeables directamente (exportados), sin depender de simular un upload de archivo completo en la UI.

**Non-Goals:**
- No se cambia el fallback de `costoBase === 0 → buscar el primer número > 0 desde la columna 4` (`InsumosView.tsx:458-464`, solo en APU) — es un mecanismo distinto (decide qué valor usar cuando la celda de la columna detectada está vacía/cero, no una falla de detección de encabezado) y cambiar su comportamiento podría alterar archivos que hoy se importan correctamente gracias a él. Cambiarlo es un change aparte si se decide que también necesita una advertencia.
- No se bloquea la importación cuando hay columnas no confirmadas — se advierte, no se impide; el usuario puede tener un archivo con una variante de encabezado legítima que el parser simplemente no reconoce todavía (igual que la validación de nomenclatura de clave, que tampoco se fuerza — ver `wbs-jerarquico-conceptos`).
- No se mejora la heurística de detección en sí (agregar más sinónimos de encabezado, tolerancia a typos) — ese es un problema de cobertura de patrones, no de este change, que solo se ocupa de que la incertidumbre existente sea visible.

## Decisions

**1. La advertencia es a nivel de archivo completo, no por fila.**
La posición de columna se decide una sola vez, al detectar el encabezado — si `costo unitario` no se confirmó, **todas** las filas del archivo se leyeron con la posición por defecto, no solo algunas. Una advertencia por fila sería ruido redundante; un solo banner a nivel de archivo ("no se confirmó la columna Costo Unitario") comunica el alcance real del problema.

**2. `parsearArchivoExplosion` cambia de retornar `InsumoPreview[]` a `{ insumos, columnasNoConfirmadas }`, igualando el shape que `APUParseResult` ya usa.**
Alternativa descartada: un segundo valor de retorno via tupla o un parámetro de salida (`out`) — se descarta por ser menos idiomático en TypeScript/React que un objeto, y por romper la simetría con `APUParseResult` que ya existe para el otro parser. Este es un cambio de firma interno a un archivo (la función no se usa fuera de `InsumosView.tsx`), su único call site (`handleFileExplosion`) se actualiza en el mismo change.

**3. Los parsers se exportan para permitir tests unitarios directos, en vez de simular la carga de archivo a través de la UI.**
Ambas funciones son puras (mismo input de filas → mismo output, sin efectos secundarios más allá de `console.log`/`console.warn` de diagnóstico) — exportarlas no cambia su comportamiento ni introduce acoplamiento nuevo, y permite escribir casos de encabezados variados (con/sin columna de unidad reconocible, etc.) sin necesitar `@testing-library/react` ni simular un `File`.

## Risks / Trade-offs

- **[Trade-off] El usuario puede aprender a ignorar la advertencia si aparece seguido con archivos que en realidad están bien** (falso positivo: una variante de encabezado que el parser no reconoce pero cuyos datos caen, por coincidencia, en la posición correcta de todas formas). Aceptado: es preferible un falso positivo ocasional y visible a un falso negativo silencioso — el caso que este change existe para prevenir.
- **[Riesgo] No resuelve el problema de fondo** (la heurística de detección de encabezado sigue sin cubrir todas las variantes de exportación de OPUS) — solo lo hace visible. Aceptado explícitamente en Non-Goals: mejorar la cobertura de patrones es un esfuerzo continuo y separado.

## Migration Plan

- Sin backend, sin migración de datos. Cambio de un solo archivo de frontend (`InsumosView.tsx`) + su suite de tests nueva.
- Deploy del frontend (`app-shell`) únicamente.
- Rollback: revertir el commit — no hay estado persistido que dependa de este cambio.

## Open Questions

Ninguna pendiente.
