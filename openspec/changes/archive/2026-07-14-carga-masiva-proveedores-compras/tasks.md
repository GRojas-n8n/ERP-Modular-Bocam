## 1. Backend — apps/compras

- [x] 1.1 Agregar `POST /api/v1/compras/proveedores/importar-lote` en
      `apps/compras/src/main.ts` (junto a `POST /proveedores`, línea
      1807+), con `requireRoles('procurement', 'admin')` — mismos roles
      que la alta individual.
- [x] 1.2 Body esperado: `{ registros: Array<{ rfc_tax_id, razon_social,
      email_contacto?, telefono?, tipo_proveedor?,
      calificacion_desempeno? }> }`. Si `registros` no es un arreglo,
      responder 400 sin tocar la BD.
- [x] 1.3 Normalizar `rfc_tax_id` de cada registro con
      `.trim().toUpperCase()` (mismo tratamiento que línea 1829) antes de
      cualquier comparación o creación.
- [x] 1.4 Detectar `rfc_tax_id` (ya normalizado) duplicado dentro del
      mismo arreglo ANTES de crear nada: agrupar por `rfc_tax_id`, marcar
      como error de fila `"RFC duplicado dentro del archivo"` a todas las
      filas con el mismo RFC repetido — ninguna de esas se crea.
- [x] 1.5 Para cada registro no descartado por 1.4, validar con las
      mismas reglas que `POST /proveedores` ya usa (línea 1817-1822):
      `rfc_tax_id` y `razon_social` obligatorios; `calificacion_desempeno`,
      si viene, debe estar entre 0.00 y 5.00. Registro inválido → error de
      fila con motivo, no aborta el lote.
- [x] 1.6 Para cada registro válido, verificar que `rfc_tax_id`
      (normalizado) no exista ya en el tenant (`findFirst` por
      `tenant_id`+`rfc_tax_id`, mismo par que el `@@unique([tenant_id,
      rfc_tax_id])` del schema) antes de crear — si existe, error de fila
      ("ya existe en el tenant"), no se crea ni se sobrescribe (sin
      upsert).
- [x] 1.7 Crear cada registro válido restante con `prisma.proveedor.create`
      (mismo shape que línea 1826-1842, con los campos no capturados en
      el lote —`ciudad`, `tipo_ubicacion`, `entrega_en_sitio`,
      `estatus_credito`, `limite_credito`, `estatus`— en su default de
      schema), acumulando los creados.
- [x] 1.8 Responder siempre `200` (nunca 400 por errores parciales) con
      `{ success: true, data: { creados: number, proveedores: Proveedor[],
      errores: Array<{ fila: number; motivo: string }> } }`.
- [x] 1.9 Loguear con `logInfo`/`logError` (mismo patrón que línea
      1845/1849) un evento `compras.proveedores.importar_lote` con el
      conteo de creados y errores.
- [x] 1.10 Test de integración en `apps/compras/test/integration/`: lote
      100% válido (todos se crean, errores vacío); lote mixto (válidos se
      crean, inválidos se reportan con fila+motivo); RFC duplicado dentro
      del archivo (ninguna de las dos filas se crea, incluyendo el caso
      de mismo RFC en distinto case); `calificacion_desempeno` fuera de
      rango; rol sin `procurement`/`admin` → 403 sin crear nada.
      `apps/compras/test/integration/proveedores-importar-lote.integration.test.ts`
      — 4/4 casos pasan.

## 2. Frontend — apps/app-shell (ComprasView.tsx, tab Proveedores)

- [x] 2.1 Agregar `comprasApi.importarProveedoresLote` en
      `apps/app-shell/src/lib/api.ts` (junto a los demás métodos de
      `comprasApi`), que llama a `POST /proveedores/importar-lote`.
- [x] 2.2 Junto al botón "Nuevo Proveedor" (`ComprasView.tsx:1307-1315`,
      visible solo si `isProcurement`), agregar botón "Importar
      CSV/Excel" — visible solo si el usuario tiene rol `procurement` o
      `admin` (NO `superintendent`, a diferencia de `isProcurement`
      línea 230, porque el endpoint de 1.1 no incluye ese rol).
      Se agregó `puedeImportarProveedores` como constante separada de
      `isProcurement` para reflejar exactamente esta diferencia.
- [x] 2.3 Al seleccionar archivo, parsearlo con
      `apps/app-shell/src/lib/csvImport.ts` (ya existente, sin
      modificarlo) y mostrar una vista previa: conteo de filas
      reconocidas como válidas/inválidas (validación cliente-side
      equivalente a 1.5, sin llamar al backend todavía) antes de
      confirmar el envío. Reutilizar el componente `SlidePanel` (mismo
      patrón que `VentasView.tsx`, PR #44).
- [x] 2.4 Al confirmar, enviar `POST /proveedores/importar-lote` (1.1)
      con el arreglo parseado y mostrar el resultado: creados vs.
      errores por fila (motivo visible por fila), y refrescar la lista de
      proveedores si hubo al menos un creado.
      Se optó por anexar directamente `data.proveedores` a
      `proveedoresList` (mismo patrón que el submit de "Nuevo Proveedor",
      línea ~3758) en vez de refetch completo — evita recargar
      requisiciones/comparativas/dashboard que `fetchData()` también trae.
- [x] 2.5 Sin seleccionar archivo o con rol sin permiso, el tab
      Proveedores se comporta exactamente igual que hoy (sin regresión
      visual/de flujo en el caso común).
      Verificado por lógica: el botón de importar solo se renderiza si
      `activeTab === 'proveedores' && isProcurement && puedeImportarProveedores`;
      `tsc --noEmit` limpio en `apps/app-shell`. Sin herramienta de
      automatización de navegador disponible en este entorno para
      verificación visual real (ver 4.1/4.2).

## 3. Verificación de regresión

- [x] 3.0 **Nota de dependencia entre branches**: `csvImport.ts` (D1 de
      design.md) se asumió existente porque PR #44
      (`carga-masiva-clientes-ventas`) lo creó, pero ese PR aún no está
      mergeado a `main` — esta branch parte de `main`, así que el archivo
      no existía aquí. Se copió el archivo tal cual (byte-idéntico) para
      que esta branch compile de forma independiente. Al mergear
      cualquiera de los dos PRs primero, el otro no debería tener
      conflicto real (contenido idéntico); si igual aparece un conflicto
      de "ambos agregan el archivo", resolverlo tomando cualquiera de las
      dos copias (son iguales).
- [x] 3.1 Ejecutar `npx tsc --noEmit -p apps/compras/tsconfig.json`
      limpio. Limpio.
- [x] 3.2 Ejecutar `tsc -b` limpio en `app-shell`. Limpio (requirió 3.0:
      sin `csvImport.ts` el build fallaba con `TS2307`).
- [x] 3.3 Ejecutar la suite completa de tests de integración de
      `apps/compras` y confirmar 0 regresiones. 17/17 archivos ok.
- [x] 3.4 Ejecutar la suite completa de vitest de `app-shell` y confirmar
      0 regresiones. 30/30 ok.

## 4. Verificación manual

- [x] 4.1 Verificación manual en navegador: como usuario `procurement`,
      importar un archivo con filas válidas, inválidas y un RFC duplicado
      dentro del mismo archivo (incluyendo un caso de mismo RFC en
      distinto case) — confirmar que la vista previa y el resultado final
      coinciden con el detalle esperado por fila, y que los proveedores
      válidos aparecen en el catálogo tras refrescar.
      Automatizado en `apps/app-shell/test/e2e/proveedores-importar-lote.e2e.spec.ts`
      (Playwright, mismo patrón que `carga-masiva-clientes-ventas`).
      Login real como `comprador@alfa.bocam.com` (rol `procurement`),
      CSV con 2 filas válidas + 1 sin razon_social + 2 con RFC duplicado
      en distinto case (`pwpXXXdup`/`PWPXXXDUP`) — vista previa (2
      listos/3 con error), confirmación, resultado (2 creados/3 errores)
      y catálogo refrescado (búsqueda por RFC) — todo en verde a la
      primera corrida. A diferencia de `carga-masiva-clientes-ventas`,
      `ComprasView.tsx` ya usa los nombres de campo reales del backend
      (`razon_social`, `rfc_tax_id`) directamente — no tiene el bug de
      `fix-ventas-clientes-render-campos-backend`.
- [x] 4.2 Verificación manual: confirmar que un usuario `superintendent`
      (tiene acceso a la tab Proveedores vía `isProcurement`, pero no
      está en los roles del endpoint) no ve el botón "Importar CSV/Excel"
      y que, si llama al endpoint directamente, recibe 403.
      Automatizado en `proveedores-importar-lote.e2e.spec.ts` (segundo
      test): rol de `comprador@alfa.bocam.com` cambiado temporalmente a
      `['superintendent']` vía `PATCH /admin/users/:id` (no hay seed
      "superintendent puro"; `admin@alfa` trae `['admin',
      'superintendent']`, lo que enmascararía el gate), verificado en
      navegador (ve la tab, no ve el botón; endpoint → 403), y revertido
      a `['procurement']` al final del test (confirmado por query
      posterior a `/admin/users`). 2/2 tests en verde.
