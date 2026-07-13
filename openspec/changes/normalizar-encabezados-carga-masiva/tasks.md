## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test nuevo en `apps/app-shell/src/lib/csvImport.test.ts`: dado un `row` con clave
      `"RAZÓN SOCIAL"` y alias `['razon_social', 'nombre']`, `leerColumnaCsv` (aún no existe)
      debe devolver el valor de esa columna — reproduce el bug real de producción (hoy no
      hay forma de emparejar ese encabezado).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual antes de implementar.
      Confirmado: 6/6 tests fallan con `leerColumnaCsv is not a function`.

## 2. Función compartida de emparejamiento (`csvImport.ts`)

- [x] 2.1 Implementar `normalizarEncabezado(texto)`: `normalize('NFD')` + strip de
      diacríticos, minúsculas, trim, quitar palabras conectoras (`de`, `del`, `la`, `el`,
      `los`, `las`) como palabras completas, colapsar espacios/guiones/guion-bajo a `_`.
- [x] 2.2 Implementar `leerColumnaCsv(row, ...alias)`: busca la primera clave de `row` cuyo
      `normalizarEncabezado` coincida con `normalizarEncabezado` de algún alias.
- [x] 2.3 Test: encabezado con tilde y espacio ("RAZÓN SOCIAL") empareja con `razon_social`.
- [x] 2.4 Test: encabezado con palabra conectora ("Fecha de Ingreso") empareja con
      `fecha_ingreso`.
- [x] 2.5 Test: encabezado sin ninguna coincidencia real (ej. "Compañía") no empareja con
      `razon_social`/`nombre` — sin falsos positivos.
- [x] 2.6 Test: mismo comportamiento de "primer match gana" que las funciones actuales
      cuando hay dos alias y el archivo trae ambas columnas.
- [x] 2.7 Verificar que los tests 1.1, 2.3-2.6 pasan. 6/6 verdes.

## 3. Cablear en los 3 importadores

- [x] 3.1 `VentasView.tsx`: reemplazar `leerColumnaImport` local por
      `leerColumnaCsv` importado de `csvImport.ts`, mismos alias en cada llamada.
- [x] 3.2 `ComprasView.tsx`: reemplazar `leerColumnaImportProveedor` local por
      `leerColumnaCsv`, mismos alias.
- [x] 3.3 `PersonalView.tsx`: reemplazar `leerColumnaImportEmpleado` local por
      `leerColumnaCsv`, mismos alias.
- [x] 3.4 Eliminar las 3 funciones locales duplicadas ya sin uso. Hecho como parte de
      3.1-3.3.

## 4. Verificación

- [x] 4.1 Verificar con `npx tsc -b` en `apps/app-shell` (comando real del build de Docker)
      que no hay errores de tipos. Limpio.
- [x] 4.2 Suite completa de `apps/app-shell` (`vitest run`) en verde: 21/21 archivos, 64/64
      tests, sin regresión. Los E2E de Playwright (`*-importar-lote.e2e.spec.ts`) requieren
      todos los servicios backend levantados — no se ejecutaron en este entorno; los tests
      de componente/unitarios cubren la lógica de emparejamiento de columnas modificada.
- [ ] 4.3 Verificación manual en navegador: subir un Excel con encabezados en español
      natural ("RFC", "Razón Social", "Código") para Clientes y confirmar que la vista
      previa extrae los datos correctamente, sin errores falsos.

## 5. Cierre

- [ ] 5.1 Sincronizar `openspec/specs/carga-masiva-archivos/spec.md` (nuevo) al archivar.
