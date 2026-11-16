## Context

`parsearArchivoExplosion` (`apps/app-shell/src/views/InsumosView.tsx:571-660`) recibe el archivo de Explosión de Insumos en formato OPUS como arreglo de arreglos (`header:1`). Detecta la posición de columna de costo una sola vez, buscando en la fila de encabezados el primer match de `/costo\s*unit/i`, `/precio\s*unit/i` o `/costo\s*dir/i` (líneas ~605-609), y usa esa misma posición (`colCostoUnitario`) para leer el precio de cada fila del archivo (línea ~629).

En el layout OPUS estándar, filas de materiales/equipo con unidad de medida física (pieza, kg, m³, etc.) sí reportan un costo por unidad en esa columna. Pero filas de mano de obra e indirectos con prefijo `HH` (mano de obra / herramienta menor) o `HS` (seguridad) suelen reportar directamente un importe/monto total (a veces derivado de %) bajo la columna IMPORTE, no un costo unitario real — el parser lee esa posición igual y toma un valor que no corresponde.

## Goals / Non-Goals

**Goals:**
- Que el precio importado para filas HH/HS (y cualquier otro tipo de insumo cuyo layout OPUS reporte importe directo) sea el correcto.
- Mantener sin cambios el comportamiento para filas de materiales/equipo que ya funcionan bien hoy.

**Non-Goals:**
- No se corrigen datos ya importados con el bug (insumos existentes en BD) — el usuario deberá re-importar usando el mecanismo de deshacer lote (`LoteImportacion`) ya existente.
- No se mueve el parseo al backend — sigue siendo 100% frontend, consistente con la arquitectura actual.

## Decisions

- **Detectar también la columna IMPORTE** (regex `/^importe$/i` o equivalente) además de la columna de costo unitario, en el mismo paso de detección de encabezados (~605-609).
- **Criterio de selección por fila**: para filas cuya clave/tipo de insumo indica mano de obra o indirecto reportado como importe directo (prefijo `HH` o `HS` en la clave, o el campo de tipo de insumo si el archivo lo trae), usar el valor de la columna IMPORTE. Para el resto, mantener el uso de COSTO UNITARIO como hoy.
- Alternativa descartada: inferir el tipo de fila por heurística de "cantidad ausente o igual a 1" — menos confiable que usar el prefijo de clave, que ya es el criterio que usa OPUS para clasificar mano de obra/indirectos.

## Risks / Trade-offs

- [Riesgo] El criterio por prefijo de clave (`HH`/`HS`) puede no cubrir el 100% de las variantes de archivos OPUS que existan en la práctica → Mitigación: dejar el detector de prefijos como lista explícita y documentada en el código, fácil de extender si aparecen más casos; agregar test con los dos ejemplos reportados por el usuario (Herramienta Menor, Equipo de Seguridad Básico Industrial).
- [Riesgo] Archivos que no traen columna IMPORTE (formatos más viejos/recortados) → Mitigación: si no se detecta columna IMPORTE, mantener el comportamiento actual (fallback a costo unitario) en vez de fallar la importación.
