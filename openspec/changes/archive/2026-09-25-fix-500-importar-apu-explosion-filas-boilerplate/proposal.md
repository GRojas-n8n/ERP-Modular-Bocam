## Why

Al importar un archivo de "Análisis de Precios Unitarios" (APU) o de "Explosión de Insumos" desde Gerencia Técnica (pestaña Insumos), el backend responde 500 y la importación falla por completo. Se reprodujo con archivos reales de exportación OPUS proporcionados por el usuario:

- Ambos archivos traen, al final del reporte, una fila de firma ("L.A.E. IVONNE OBREGON GUTIERREZ" / "REPRESENTANTE LEGAL"). Por las celdas combinadas de OPUS, ese texto se repite en todas las columnas de la fila. Los parsers de APU y Explosión (`parsearArchivoAPU`, `parsearArchivoExplosion` en `InsumosView.tsx`) no reconocen esta fila como no-dato y la agregan al catálogo como si `clave = unidad_medida = "L.A.E. IVONNE OBREGON GUTIERREZ"` (31 caracteres).
- `clave` cabe en `VarChar(50)`, pero **`unidad_medida` excede `VarChar(20)`**. El endpoint `POST /insumos/importar-lote` no valida longitud antes de `db.insumo.createMany(...)`, que —a diferencia del `update` de insumos existentes, que sí tiene try/catch por ítem— no está protegido: Postgres rechaza el INSERT completo ("value too long for type character varying(20)") y la excepción sube sin capturar como 500.
- En el archivo de APU se reprodujo un segundo caso: el título del reporte ("ANÁLISIS DETALLADO DE PRECIOS UNITARIOS", repetido por OPUS en cada página impresa del Excel) se cuela igual cuando aparece a media hoja sin ir precedido de un disparador que resetee el parser.
- Adicionalmente (no causa el 500, pero deja la función inutilizable): por las mismas celdas combinadas, `extraerClaveConcepto` en el parser de APU toma literalmente el texto duplicado "Clave:" en vez del valor real del concepto (ej. "2.1.1") cuando busca la celda siguiente no vacía — todas las composiciones del archivo terminan agrupadas bajo una sola clave de concepto falsa ("CLAVE:") en vez de una composición por concepto real.
- El mensaje de error que ve el usuario tras un fallo también es poco útil: `handleConfirmarInsumos` lee `err.response?.data?.message`, pero el backend devuelve el mensaje bajo `error.message` — el toast solo muestra el texto genérico de Axios ("Request failed with status code 500"), ocultando la causa real.

## What Changes

- Los parsers de APU y Explosión descartan (no agregan al catálogo) cualquier fila cuya `clave` exceda 50 caracteres o cuya `unidad_medida` exceda 20 caracteres — mismo límite que las columnas de la base de datos. Cubre tanto filas de firma/pie de página como títulos repetidos u otro boilerplate no previsto explícitamente.
- `POST /insumos/importar-lote` valida esos mismos límites (longitud de `clave`/`unidad_medida`, rango de `costo_base`) antes de `createMany`, contando cualquier fila fuera de rango como "omitida" — igual que ya hace con otras validaciones — en vez de dejar que Postgres tire una excepción no capturada. Esto protege el endpoint aunque el frontend cambie o se use por otra vía.
- `extraerClaveConcepto` (parser de APU) ignora celdas duplicadas de "Clave:" causadas por combinación de celdas al buscar el valor en la celda siguiente, para extraer la clave real del concepto (ej. "2.1.1") en vez del texto literal "Clave:".
- `handleConfirmarInsumos` lee el mensaje de error del backend desde `error.message` (como ya hace el catch de composiciones), para que cualquier error futuro sea visible y depurable desde la UI.

## Capabilities

### New Capabilities
- `importacion-apu-explosion-filas-invalidas`: documenta que las filas de boilerplate (firma, títulos repetidos) se descartan en vez de corromper la importación, y que el backend valida longitud como defensa adicional — hoy sin spec propio.

### Modified Capabilities
(ninguna)

## Impact

- Código afectado:
  - `apps/app-shell/src/views/InsumosView.tsx` — `parsearArchivoAPU`, `parsearArchivoExplosion`, `extraerClaveConcepto`, `handleConfirmarInsumos`.
  - `apps/gerencia-tecnica/src/main.ts` — `POST /api/v1/gerencia-tecnica/insumos/importar-lote` (validación de longitud/rango antes de `createMany`).
- No cambia el contrato de la API (mismo shape de request/response), solo qué filas se aceptan y cómo se reporta un error.
- No afecta la importación de Catálogo de Conceptos (OPUS), que usa un parser distinto (`normalizarFila`, por nombre de columna) no tocado por este cambio.
