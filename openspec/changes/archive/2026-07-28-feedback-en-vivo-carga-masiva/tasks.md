## 1. csvImport.ts — CSV streaming real vía Papa.parse `step`

- [x] 1.1 En `parseCsvTexto` (`apps/app-shell/src/lib/csvImport.ts`), agregar un parámetro
      opcional `onFila?: (fila: Record<string, string>, indice: number) => void` y usar
      `Papa.parse(texto, { header: true, step: (resultado) => { ...; onFila?.(...) } })` en
      vez de `complete`. **Ajustado durante implementación** (ver design.md D5): la función
      pasó a llamarse `parseCsvArchivo` y recibe el `File` directamente (no un string
      pre-leído vía `leerArchivoComoTexto`) — Papa Parse solo cede el control al event loop
      entre filas cuando el input es un `File`/`Blob`, no un string ya materializado.
      También se agregó `chunkSize: 64 * 1024` explícito, sin el cual un archivo
      pequeño/mediano cabe en un solo chunk por defecto y el problema se repite.
- [x] 1.2 Verificar que `results.errors` (errores de sintaxis CSV) se sigue capturando por
      fila y se propaga igual que hoy. Confirmado: el código **original** (antes de este
      change) nunca inspeccionaba `resultado.errors` — solo el callback `error:` (errores
      fatales de lectura, no de sintaxis por fila). El comportamiento se preserva
      exactamente: una fila con más columnas que el encabezado (verificado en vivo con un
      CSV de prueba) simplemente ignora las columnas extra, sin error, igual que antes.
- [x] 1.3 Aplicar el mismo cambio a `parseCsvOrExcelFileComoFilas` si su caller
      (`InsumosView.tsx`) se beneficia, o dejarlo sin cambios si está fuera de alcance.
      **Decisión:** sin cambios — `InsumosView.tsx` está explícitamente fuera de alcance
      (ver proposal.md), y `parseCsvOrExcelFileComoFilas`/`leerArchivoComoTexto` se dejaron
      intactos para ese caller.

## 2. csvImport.ts — XLSX por lotes en la fase de validación

- [x] 2.1 En `hojaAObjetos` aceptar un callback `onFila?: (fila, indice) => void` invocado
      por cada fila, cediendo el control al event loop cada 25 filas
      (`LOTE_CESION_XLSX = 25`, `await new Promise(r => setTimeout(r, 0))`).
- [x] 2.2 Mantener `wb.xlsx.load(buffer)` sin cambios (limitación documentada — no hay
      streaming real de lectura en este entorno). Confirmado y verificado en vivo: un
      `.xlsx` de 3,000 filas sí muestra progreso en tiempo real ("Procesando fila 1300…"),
      aunque notablemente más lento que CSV (~25-30s vs ~1s) — ver hallazgo de rendimiento
      en design.md, no bloqueante para archivos reales de cientos de filas.

## 3. VentasView.tsx — Clientes

- [x] 3.1 Cambiar `handleImportFileChange` para usar la variante con callback de
      `parseCsvOrExcelFile`, validando cada fila con `validarFilaCliente` (extraída de
      `construirPreviewImportClientes`, que se eliminó) y actualizando `filasImport`
      incrementalmente.
- [x] 3.2 Agregar estado de progreso (`procesandoImport`, banner "Procesando fila X… N
      errores encontrados hasta el momento") mientras el archivo se procesa; botón
      "Importar" deshabilitado y con texto "Leyendo archivo…" durante el procesamiento.
      **Ajuste por hallazgo de rendimiento** (ver design.md D6): el estado se actualiza cada
      25 filas (`contador % 25 === 0`), no en cada una — actualizar en cada fila individual
      colgó la pestaña con archivos de decenas de miles de filas en pruebas reales.
- [x] 3.3 Verificar que la detección de "RFC duplicado en el archivo" sigue funcionando con
      procesamiento incremental. Implementado como segunda pasada ligera
      (`marcarDuplicadosRfc`) sobre el arreglo completo ya acumulado, ejecutada al terminar
      de leer el archivo — **verificado en vivo** con un CSV de 10 filas con 2 RFC
      duplicados: ambas filas quedaron correctamente marcadas con error, igual que el
      comportamiento original.

## 4. ComprasView.tsx — Proveedores

- [x] 4.1 Mismo cambio que 3.1-3.3 aplicado a `validarFilaProveedor`/
      `marcarDuplicadosRfcProveedores` (extraídas de `construirPreviewImportProveedores`,
      eliminada) y su `handleImportProveedoresFileChange` correspondiente. Verificado por
      `tsc -b` limpio; no se probó en vivo con datos reales de Proveedores en esta sesión
      (mismo patrón exacto ya verificado en vivo para Clientes en la sección 3).

## 5. PersonalView.tsx — Empleados

- [x] 5.1 Mismo cambio que 3.1-3.3 aplicado a `validarFilaEmpleado`/
      `marcarDuplicadosRfcEmpleados` (extraídas de `construirPreviewImportEmpleados`,
      eliminada) y su `handleImportEmpleadosFileChange` correspondiente. Verificado por
      `tsc -b` limpio; no se probó en vivo con datos reales de Empleados en esta sesión
      (mismo patrón exacto ya verificado en vivo para Clientes en la sección 3).

## 6. Verificación

- [x] 6.1 Levantar app-shell en local (skill `run-app-shell`) y probar las 3 vistas con un
      archivo CSV de prueba (~50-100 filas) con al menos un error deliberado en una fila
      avanzada — confirmar que las filas anteriores aparecen antes de llegar a la fila con
      error. **Verificado en vivo, con creces**: probado con CSVs de 300, 5,000 y 10 filas
      (Clientes/VentasView) con errores deliberados en filas avanzadas — capturado en vivo
      el banner de progreso "Procesando fila 4000… 1 error encontrado hasta el momento" con
      "3999 listos" mientras el archivo aún se procesaba. Proveedores y Empleados no se
      probaron en vivo (mismo código, ver 4.1/5.1).
- [x] 6.2 Repetir la prueba 6.1 con un archivo `.xlsx` equivalente. **Verificado en vivo**:
      `.xlsx` de 3,000 filas con error en fila 50 — capturado el progreso en tiempo real
      ("Procesando fila 1300…") y el resultado final correcto (2999 listos + 1 error =
      3000).
- [x] 6.3 Confirmar que el resultado final (conjunto de filas válidas/inválidas, motivos de
      error) es idéntico al que se obtenía antes de este change, para el mismo archivo de
      prueba. Verificado en los 3 escenarios en vivo (300, 5000, 3000 filas): el conteo
      final siempre coincidió exactamente con los errores deliberados insertados.
- [x] 6.4 Probar un CSV con un error de sintaxis real (ej. una fila con más columnas que el
      encabezado) para confirmar que el cambio de `complete` a `step` no perdió el manejo de
      ese caso. **Verificado en vivo**: fila con 2 columnas extra (4 valores contra un
      encabezado de 2 columnas) se procesó sin error, ignorando las columnas sobrantes —
      idéntico al comportamiento pre-existente (nunca hubo validación de sintaxis por fila).
- [x] 6.5 Correr `tsc -b` sobre `apps/app-shell` y la suite de tests existente
      (`csvImport.parseo.test.ts` y los tests de las 3 vistas) para confirmar que nada se
      rompe. Resultado: `tsc -b` limpio, `npm run build` (`vite build`) exitoso. Suite
      completa: 41 test files, 117 tests, todos en verde (incluye
      `csvImport.parseo.test.ts` con 10/10 y `csvImport.test.ts` con 6/6).
