## 1. Tests unitarios primero (TDD)

- [x] 1.1 Exportadas `parsearArchivoAPU` y `parsearArchivoExplosion` desde `InsumosView.tsx`.
- [x] 1.2 `apps/app-shell/src/views/InsumosView.parsers.test.ts` (vitest): caso base — encabezado APU con todas las columnas reconocibles → `columnasNoConfirmadas` vacío.
- [x] 1.3 Test: encabezado APU sin columna de Costo Unitario reconocible → `columnasNoConfirmadas` incluye `'Costo Unitario'`.
- [x] 1.4 Test: encabezado APU sin columna de Rendimiento reconocible → incluye `'Rendimiento'`.
- [x] 1.5 Test: encabezado Explosión sin columna de Unidad reconocible → `columnasNoConfirmadas` incluye `'Unidad'`.
- [x] 1.6 Test de no-regresión: archivo con encabezado completo (Explosión) → insumos extraídos con los valores esperados, idénticos al comportamiento previo. Se agregó además un test específico (no listado originalmente) que confirma que el encabezado repetido por concepto en APU no duplica la misma columna no confirmada.

## 2. Cambios en los parsers

- [x] 2.1 `interface APUParseResult`: agregado `columnasNoConfirmadas: string[]`. Se agregó también `ExplosionParseResult` (nueva interfaz) para el shape de retorno de `parsearArchivoExplosion`.
- [x] 2.2 `parsearArchivoAPU`: `columnasNoConfirmadas` construido con un `Set` (deduplicación entre conceptos, ver 1.6) a partir de los checks `if (iU >= 0)`/`if (iCa >= 0)`/`if (iRe >= 0)`/`if (iCo >= 0)` existentes.
- [x] 2.3 `parsearArchivoExplosion`: cambiado el retorno a `{ insumos, columnasNoConfirmadas }`, mismo mecanismo con `iU`/`iCosto` (sin necesidad de `Set` — el encabezado de Explosión aparece una sola vez).
- [x] 2.4 Confirmado: mismos `insumos`/`composiciones` que antes para los mismos inputs (test 1.6 + suite existente `InsumosView.catalogo-scroll.test.tsx` sin regresión).

## 3. UI — banner de advertencia

- [x] 3.1 Nuevo estado `columnasNoConfirmadas` (string[]) en `InsumosView`.
- [x] 3.2 `handleFileAPU`: guarda `resultado.columnasNoConfirmadas`.
- [x] 3.3 `handleFileExplosion`: actualizado al nuevo shape de retorno, guarda ambos campos.
- [x] 3.4 `columnasNoConfirmadas` se resetea a `[]` en el `onClose` de ambos paneles.
- [x] 3.5 Banner nuevo en el panel de vista previa compartido, después del banner de "insumos con datos incompletos", visible solo si `columnasNoConfirmadas.length > 0`. No bloquea el botón de confirmar.

## 4. Verificación

- [x] 4.1 Los 7 tests de `InsumosView.parsers.test.ts` en verde.
- [x] 4.2 `InsumosView.catalogo-scroll.test.tsx` sigue en verde (corrida junto con la suite nueva).
- [x] 4.3 `npx tsc --noEmit` en `apps/app-shell` — limpio.
- [ ] 4.4 Verificación manual en el navegador (dev server) — pendiente, requiere un archivo real con encabezado incompleto para confirmar visualmente el banner.

## 5. Deploy y cierre

- [ ] 5.1 PR contra `main`.
- [ ] 5.2 Desplegado vía CI (solo frontend).
- [ ] 5.3 Verificado en `iretum.com` con un archivo real.
- [ ] 5.4 `openspec archive advertir-columnas-no-detectadas-parser-gt` tras verificación en producción.
