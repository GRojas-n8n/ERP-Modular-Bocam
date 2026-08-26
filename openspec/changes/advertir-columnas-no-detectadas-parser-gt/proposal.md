## Why

`parsearArchivoAPU` y `parsearArchivoExplosion` (`apps/app-shell/src/views/InsumosView.tsx`) detectan las columnas `clave`/`descripcion` de forma estricta — si no las encuentran en el encabezado, la función no produce ningún insumo y el usuario recibe un error claro ("No se encontraron insumos..."). Pero las columnas secundarias (`unidad`, `cantidad`, `rendimiento`, `costo unitario`) usan detección "suave": si el nombre de columna esperado no aparece en el encabezado del archivo real, la posición se queda en su valor por defecto hardcodeado (`colUnidad = 3`, `colCostoUnitario = 6` para APU; `colUnidad = 2`, `colCostoUnitario = 4` para Explosión) **sin avisar a nadie**. El fix de longitud/rango ya aplicado (`fix-500-importar-insumos-explosion-apu`) valida que el valor leído *quepa* en su columna de Postgres, pero no puede detectar que ese valor viene de la columna equivocada del Excel — un costo unitario mal alineado que por casualidad es un número corto y razonable pasa todas las validaciones y se importa silenciosamente mal.

Esto es exactamente el tipo de corrupción de datos silenciosa que la inspección original del módulo (que llevó al fix de los 500) identificó como riesgo, pero no cubrió: el fix de longitud/rango protege contra un 500, no contra un insumo bien formado pero con el precio de otra columna.

## What Changes

- `parsearArchivoAPU` y `parsearArchivoExplosion` reportan qué columnas secundarias **no** pudieron confirmarse contra el encabezado real del archivo (se quedaron en su posición por defecto).
- `parsearArchivoExplosion` cambia su forma de retorno de `InsumoPreview[]` a `{ insumos: InsumoPreview[], columnasNoConfirmadas: string[] }` — mismo shape que ya usa `APUParseResult` (`{ insumos, composiciones }`), se le agrega el mismo campo `columnasNoConfirmadas`.
- Se agrega un banner de advertencia en el panel de vista previa (`InsumosView.tsx`, mismo lugar donde ya se muestra el banner de "insumos con datos incompletos") cuando `columnasNoConfirmadas.length > 0`, listando qué columnas se asumieron por posición en vez de confirmarse por nombre — el usuario decide si revisa el archivo antes de confirmar la importación.
- Ambas funciones se exportan (antes privadas al módulo) para poder probarlas directamente con tests unitarios, sin simular la UI completa.
- Sin cambios en qué se importa ni en los valores calculados — es puramente informativo, no cambia el comportamiento de parseo existente en ningún caso.

## Capabilities

### New Capabilities
- `advertencia-columnas-no-confirmadas-parser-gt`: los parsers de OPUS (APU y Explosión de Insumos) exponen qué columnas secundarias no pudieron confirmarse contra el encabezado real del archivo, y la vista previa de importación se lo muestra al usuario antes de confirmar.

### Modified Capabilities
Ninguna — no hay spec previo que documente el comportamiento de estos parsers.

## Impact

- `apps/app-shell/src/views/InsumosView.tsx`: `parsearArchivoAPU`, `parsearArchivoExplosion` (ahora exportadas), `interface APUParseResult` (campo nuevo), `handleFileAPU`, `handleFileExplosion`, nuevo estado `columnasNoConfirmadas`, banner nuevo en el panel de vista previa compartido.
- Sin cambios de backend, sin cambios de contrato de API — cambio puramente de UX/detección en el parser del navegador.
- Tests nuevos: `apps/app-shell/src/views/InsumosView.parsers.test.ts` (vitest, unitario directo sobre las funciones exportadas).
