## 1. Backend — apps/personal

- [x] 1.1 Agregar `POST /api/v1/personal/empleados/importar-lote` en
      `apps/personal/src/main.ts` (junto a `POST /empleados`, línea
      65+), con `requireRoles('personal_rh', 'admin')` — mismo rol que
      protege el resto de escrituras de este módulo (ej. línea 111).
- [x] 1.2 Body esperado: `{ registros: Array<{ nombre,
      apellido_paterno, apellido_materno?, rfc, curp?, nss?, puesto,
      categoria?, tipo_contrato?, fecha_ingreso?, salario_diario,
      telefono?, email? }> }`. Si `registros` no es un arreglo, responder
      400 sin tocar la BD.
- [x] 1.3 Detectar `rfc` duplicado dentro del mismo arreglo ANTES de
      crear nada: agrupar por `rfc`, marcar como error de fila "RFC
      duplicado dentro del archivo" a todas las filas con el mismo RFC
      repetido — ninguna de esas se crea.
- [x] 1.4 Para cada registro no descartado por 1.3, validar con las
      mismas reglas que `POST /empleados` ya usa (línea 74): `nombre`,
      `apellido_paterno`, `rfc`, `puesto` y `salario_diario`
      obligatorios; `salario_diario` además debe ser un número válido
      (`Number(...)` no debe dar `NaN`) — ver D2 de design.md, aquí es
      obligatorio validarlo porque todo el lote corre en una sola
      transacción (`createTenantContext`/`$transaction`) y un `Decimal`
      inválido revertiría el lote completo. Registro inválido → error de
      fila con motivo, no aborta el lote.
- [x] 1.5 Para cada registro válido, verificar que `rfc` no exista ya en
      el tenant (`findFirst` por `tenant_id`+`rfc`, mismo par que
      `@@unique([tenant_id, rfc])` del schema) antes de crear — si
      existe, error de fila ("ya existe en el tenant"), no se crea ni se
      sobrescribe (sin upsert).
- [x] 1.6 Para cada registro válido restante, generar `numero_empleado`
      con la misma lógica que la alta individual (línea 80-85:
      `findFirst` por `numero_empleado desc` del tenant, incrementar,
      `EMP-XXX`) justo antes de crear ese registro — dentro del mismo
      bucle secuencial (sin paralelizar), para que cada lectura vea los
      creados por iteraciones previas del mismo lote (D3 de design.md).
- [x] 1.7 Crear cada registro válido con `prisma.empleado.create` (mismo
      shape que línea 87-101, con los campos no capturados en el lote
      —jornada/asistencia, `certificaciones`— en su default de schema),
      acumulando los creados.
- [x] 1.8 Responder siempre `200` (nunca 400 por errores parciales) con
      `{ success: true, data: { creados: number, empleados: Empleado[],
      errores: Array<{ fila: number; motivo: string }> } }` (usar
      `createApiResponse`, mismo patrón que línea 59/105).
- [x] 1.9 Loguear el resultado del lote (conteo de creados/errores) —
      mismo patrón `console.log` que línea 104 (este módulo no usa
      `logInfo`/`logError` de `packages/observability` en este archivo).
- [x] 1.10 Test de integración en `apps/personal/test/integration/`:
      lote 100% válido (todos se crean con `numero_empleado` correlativo
      sin huecos ni colisiones); lote mixto (válidos se crean, inválidos
      se reportan con fila+motivo, incluyendo `salario_diario` no
      numérico); RFC duplicado dentro del archivo (ninguna de las dos
      filas se crea); rol sin `personal_rh`/`admin` → 403 sin crear
      nada.
      `apps/personal/test/integration/empleados-importar-lote.integration.test.ts`
      — 4/4 casos pasan. Requirió `prisma db push --accept-data-loss`
      local (BD sin migrar, `personal.empleados` no existía todavía en
      este entorno — no relacionado con este change).

## 2. Frontend — apps/app-shell (PersonalView.tsx, tab Empleados)

- [x] 2.1 Agregar `user` a la desestructuración de `useTenant()`
      (`PersonalView.tsx:154`, hoy solo extrae `tenant`) para poder leer
      `user?.role`.
- [x] 2.2 Junto al botón "Nuevo Empleado" (línea ~411-418, sin
      `onClick` — no está cableado a ningún formulario todavía), agregar
      botón "Importar CSV/Excel" — visible solo si el usuario tiene rol
      `personal_rh` o `admin` (mismos roles que el endpoint de 1.1).
      Se agregó `puedeImportarEmpleados` como constante dedicada.
- [x] 2.3 Al seleccionar archivo, parsearlo con
      `apps/app-shell/src/lib/csvImport.ts` (ya existente, sin
      modificarlo) y mostrar una vista previa: conteo de filas
      reconocidas como válidas/inválidas (validación cliente-side
      equivalente a 1.4, sin llamar al backend todavía) antes de
      confirmar el envío. Reutilizar el componente `SlidePanel` (ya
      importado en este archivo, mismo patrón que `VentasView.tsx` PR
      #44 y `ComprasView.tsx` PR #45).
      Nota: igual que en PR #45, `csvImport.ts` se copió tal cual
      (byte-idéntico) porque PR #44 aún no está mergeado a `main` —
      ver 3.0.
- [x] 2.4 Al confirmar, enviar `POST /empleados/importar-lote` (1.1) con
      el arreglo parseado (usando `api.post(...)` directo, como el resto
      de este archivo — no existe un wrapper `personalApi` en
      `lib/api.ts`) y mostrar el resultado: creados vs. errores por fila
      (motivo visible por fila, incluyendo el `numero_empleado` asignado
      a cada creado), y refrescar la lista de empleados si hubo al menos
      un creado.
      Se anexó `data.empleados` directo a `empleados` (`setEmpleados(prev
      => [...prev, ...])`) — este archivo no expone un `fetchData()`
      reutilizable fuera del `useEffect` inicial, mismo motivo que llevó
      a la misma decisión en PR #45.
      El manejo de error usa `err.response?.data?.error?.message` (no
      `.data.message`) porque `createApiError` de este módulo anida el
      mensaje bajo `error.message`, distinto al shape de `ventas`/`compras`.
- [x] 2.5 Sin seleccionar archivo o con rol sin permiso, el tab
      Empleados se comporta exactamente igual que hoy (sin regresión
      visual/de flujo en el caso común).
      Verificado por lógica: el botón solo se renderiza si
      `activeTab === 'empleados' && puedeImportarEmpleados`; `tsc -b`
      limpio en `apps/app-shell`. Sin herramienta de automatización de
      navegador disponible en este entorno para verificación visual real
      (ver 4.1/4.2).

## 3. Verificación de regresión

- [x] 3.0 **Nota de dependencia entre branches** (mismo caso que PR #45):
      `csvImport.ts` se asumió existente porque PR #44
      (`carga-masiva-clientes-ventas`) lo creó, pero ese PR aún no está
      mergeado a `main` — esta branch parte de `main`, así que se copió
      el archivo tal cual (byte-idéntico). Al mergear cualquiera de los
      3 PRs de esta serie primero, los otros no deberían tener conflicto
      real (contenido idéntico); si aparece un conflicto de "ambos
      agregan el archivo", resolverlo tomando cualquiera de las copias.
- [x] 3.1 Ejecutar `npx tsc --noEmit -p apps/personal/tsconfig.json`
      limpio. Limpio.
- [x] 3.2 Ejecutar `tsc -b` limpio en `app-shell`. Limpio (requirió 3.0).
- [x] 3.3 Ejecutar la suite completa de tests de integración de
      `apps/personal` y confirmar 0 regresiones. 2/2 archivos ok
      (`evento-centro-costos-creado` + el nuevo de este change).
- [x] 3.4 Ejecutar la suite completa de vitest de `app-shell` y confirmar
      0 regresiones.

## 4. Verificación manual

- [x] 4.1 Verificación manual en navegador: como usuario `personal_rh`,
      importar un archivo con filas válidas, inválidas y un RFC
      duplicado dentro del mismo archivo — confirmar que la vista previa
      y el resultado final coinciden con el detalle esperado por fila,
      que los `numero_empleado` asignados son correlativos sin huecos, y
      que los empleados válidos aparecen en el catálogo tras refrescar.
      Automatizado en `apps/app-shell/test/e2e/empleados-importar-lote.e2e.spec.ts`
      (Playwright, mismo patrón que las 2 series anteriores). Login real
      como `admin@alfa.bocam.com` (rol `admin`, satisface
      `personal_rh`/`admin`) — no hay usuario `personal_rh` puro en el
      seed. CSV con 2 filas válidas + 1 con `salario_diario` no numérico
      + 2 con RFC duplicado.
      **Bug real encontrado y arreglado en este mismo change** (no
      legacy, código de este PR sin mergear): `handleConfirmarImportEmpleados`
      hacía `Number(salario_diario)` en el frontend antes de enviar — un
      valor no numérico se volvía `NaN`, que `JSON.stringify` serializa
      como `null`, así que el backend lo reportaba como "obligatorio
      faltante" en vez de "no numérico". Se corrigió enviando
      `salario_diario` tal cual (string), dejando que el backend haga su
      propia conversión/validación con `Number(...)`. Con el fix, el
      flujo completo pasa en verde: vista previa (2 listos/3 con error),
      resultado (2 creados/3 errores con motivo correcto — incluyendo
      "no numérico" para la fila correcta), y catálogo refrescado
      (verificado sin necesidad de búsqueda: `PersonalView.tsx` no
      pagina ni virtualiza la tabla de empleados).
- [ ] 4.2 Verificación manual: confirmar que un usuario sin rol
      `personal_rh`/`admin` no ve el botón "Importar CSV/Excel" y que,
      si llama al endpoint directamente, recibe 403.
