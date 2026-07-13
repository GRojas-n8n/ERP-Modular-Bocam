## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test nuevo en `apps/app-shell/src/lib/cotizacion-pdf-match.test.ts`: dada una
      línea con descripción "Mini Split Inverter de 1 Tonelada (12,000 BTU) a 220V" y un
      renglón de PDF con descripción "Minisplit Inverter 1 Ton 220V" (mismo caso real de
      producción), `emparejarRenglonesConLineas` (aún no existe) encuentra el match —
      reproduce en forma de test unitario el síntoma reportado (0 líneas emparejadas pese a
      describir el mismo ítem).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual (la función no existe
      todavía) antes de implementar.

## 2. Función pura de emparejamiento (`cotizacion-pdf-match.ts`)

- [x] 2.1 Implementar `normalizarTexto(texto)`: minúsculas, quitar acentos (`normalize('NFD')`
      + strip de diacríticos), quitar puntuación, colapsar espacios.
- [x] 2.2 Implementar `tokenizar(texto)`: normaliza y divide por espacios, descarta tokens de
      longitud ≤ 2.
- [x] 2.3 Implementar `emparejarRenglonesConLineas(lineas, renglones)` en
      `apps/app-shell/src/lib/cotizacion-pdf-match.ts`: para cada línea, calcula el puntaje
      (tamaño de la intersección de tokens) contra cada renglón, elige el de mayor puntaje
      con umbral mínimo `>= 1`. Devuelve, por línea, el renglón emparejado (o `null` si
      ninguno superó el umbral) — sin mutar los argumentos de entrada.
- [x] 2.4 Test: descripciones con palabras en distinto orden ("Split Inverter Mini 1
      Tonelada" vs "Mini Split Inverter de 1 Tonelada") emparejan correctamente.
- [x] 2.5 Test: descripciones sin ninguna palabra significativa en común no emparejan
      (resultado `null` para esa línea).
- [x] 2.6 Test: dos líneas y dos renglones, cada línea empareja con el renglón correcto
      (caso de un cuadro con más de un ítem).
- [x] 2.7 Test: acentos y mayúsculas no impiden el match ("ACEROS" vs "aceros", "válvula" vs
      "valvula").
- [x] 2.8 Verificar que los tests 1.1 y 2.4-2.7 pasan. 7/7 verdes.

## 3. Cablear el emparejamiento en `handleAplicarCotizacion`

- [x] 3.1 Reemplazar la comparación de substring de 10 caracteres en
      `apps/app-shell/src/components/ComparativaDetail.tsx:890-898` por una llamada a
      `emparejarRenglonesConLineas(comp.lineas, renglonesPdf)`, aplicando el precio de cada
      renglón emparejado a su línea correspondiente.
- [x] 3.2 Contabilizar cuántas líneas quedaron sin match (renglón `null`) tras el
      emparejamiento.
- [x] 3.3 Ajustar el `notify()` final de `handleAplicarCotizacion` según el resultado: 0
      líneas sin match → toast de éxito actual sin cambios; 1 o más líneas sin match → toast
      tipo `warning` indicando cuántas de cuántas líneas no se pudieron relacionar
      automáticamente y que deben capturarse manualmente.
- [x] 3.4 La persistencia del PDF como respaldo (`comprasApi.subirCotizacionPdf`) sigue
      ejecutándose igual en los tres casos (match total, parcial o nulo) — sin cambios en esa
      parte.
- [x] 3.5 Verificar con `tsc --noEmit` en `apps/app-shell` que no hay errores de tipos. Limpio.

## 4. Verificación de integración y manual

- [x] 4.1 Test de componente en `ComparativaDetail` (mismo patrón que
      `ComparativaDetail.estado-respuesta.test.tsx` u otro test existente del componente):
      subir un PDF cuyos renglones extraídos (mockeados) no comparten prefijo con la
      descripción de la línea pero sí palabras significativas → tras "Aplicar cotización", el
      precio se refleja en la tabla. Implementado en
      `ComparativaDetail.emparejamiento-pdf.test.tsx`, con el caso real de producción
      (Mini Split Inverter / Minisplit Inverter).
- [x] 4.2 Test de componente: renglones del PDF sin ninguna palabra en común con ninguna
      línea → tras "Aplicar cotización", no se aplica ningún precio y aparece el aviso de
      advertencia (no el toast de éxito genérico). Mismo archivo, segundo test.
- [ ] 4.3 Verificación manual en navegador (Playwright o manual) contra un caso real:
      re-subir uno de los 3 PDFs de la prueba de producción del usuario administrador
      (requisición `80ffce1d-4092-4061-8728-824f6df764e6`) y confirmar que el precio se
      aplica a la línea del cuadro.
- [x] 4.4 Suite completa de `apps/app-shell` (`vitest run` + `tsc --noEmit`) en verde antes de
      abrir el PR. 17/17 archivos, 54/54 tests, tsc limpio.

## 5. Cierre

- [ ] 5.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
