## Why

Al importar la Explosión de Insumos (formato OPUS), el sistema calcula mal el costo de ciertas partidas de mano de obra/indirectos (ej. "HH Herramienta Menor", "HS Equipo de Seguridad Básico Industrial") porque toma el valor de la columna Costo Unitario cuando debería tomar el de Importe. Esto genera costos incorrectos en el catálogo de insumos y, en cascada, en presupuestos y control presupuestal que dependen de esos valores.

## What Changes

- El parser de Explosión de Insumos (`apps/app-shell/src/views/InsumosView.tsx`, función `parsearArchivoExplosion`) deja de asumir una única columna de costo global para todo el archivo.
- Se detecta también la columna IMPORTE del archivo (además de COSTO UNITARIO).
- Para filas cuyo tipo de insumo reporta el monto como importe directo en el layout OPUS (ej. prefijos HH/HS de mano de obra e indirectos), el sistema usa el valor de IMPORTE en lugar de COSTO UNITARIO al construir el preview y el payload de importación.
- Para el resto de las filas (materiales, equipo, con cantidad y costo unitario explícitos) el comportamiento actual no cambia.

## Capabilities

### New Capabilities
- `importacion-explosion-insumos`: reglas de mapeo de columnas al parsear el archivo de Explosión de Insumos (OPUS), incluyendo la distinción entre filas que reportan costo unitario por unidad de medida y filas que reportan importe directo (mano de obra/indirectos).

### Modified Capabilities
(ninguna — no se encontró spec existente que cubra el parseo de este archivo; se documenta como capability nueva)

## Impact

- Código: `apps/app-shell/src/views/InsumosView.tsx` (parser `parsearArchivoExplosion`, líneas ~571-660, particularmente la detección de columna de costo en ~605-609 y su uso en ~629).
- Datos: costos de insumos ya importados con este bug quedan incorrectos en BD (`apps/gerencia-tecnica`, tabla `Insumo` vía `LoteImportacion`); este change solo corrige el parser hacia adelante — la corrección de datos históricos (re-importar o corregir vía el mecanismo de deshacer lote existente) queda fuera de alcance y es responsabilidad del usuario tras el fix.
- No afecta el backend de `gerencia-tecnica` (el parseo es 100% frontend; el backend solo recibe JSON ya estructurado).
