## 1. Backend — apps/ventas

- [x] 1.1 Agregar `POST /api/v1/ventas/clientes/importar-lote` en
      `apps/ventas/src/main.ts` (junto a `POST /clientes`, línea 56+), con
      `requireRoles('admin')` (mismo patrón de
      `packages/auth-middleware/src` usado en `apps/compras/src/main.ts:333`)
      — hoy `POST /clientes` no tiene restricción de rol, este endpoint sí.
- [x] 1.2 Body esperado: `{ registros: Array<{ rfc_tax_id, razon_social,
      email_contacto?, telefono?, codigo_cliente? }> }`. Si `registros` no
      es un arreglo, responder 400 sin tocar la BD.
- [x] 1.3 Detectar `rfc_tax_id` duplicado dentro del mismo arreglo (D3 de
      design.md) ANTES de crear nada: agrupar por `rfc_tax_id`, marcar como
      error de fila `"RFC duplicado dentro del archivo"` a todas las filas
      con el mismo RFC repetido — ninguna de esas se crea.
- [x] 1.4 Para cada registro no descartado por 1.3, validar con las mismas
      reglas que `POST /clientes` ya usa (línea 63-71): `rfc_tax_id` y
      `razon_social` obligatorios; `codigo_cliente`, si viene, debe cumplir
      `CODIGO_CLIENTE_PATTERN` (línea 53) y no exceder `CODIGO_CLIENTE_MAX`
      (línea 54). Registro inválido → error de fila con motivo, no aborta
      el lote.
- [x] 1.5 Para cada registro válido, verificar que `rfc_tax_id` y
      `codigo_cliente` (si viene) no existan ya en el tenant (mismo check de
      `findFirst` que línea 75) antes de crear — si existe, error de fila
      ("ya existe en el tenant"), no se crea ni se sobrescribe (Non-Goal de
      design.md: sin upsert).
- [x] 1.6 Crear cada registro válido restante con `prisma.cliente.create`
      (mismo shape que línea 80-89), acumulando los creados.
- [x] 1.7 Responder siempre `200` (nunca 400 por errores parciales — D2 de
      design.md) con
      `{ success: true, data: { creados: number, clientes: Cliente[],
      errores: Array<{ fila: number; motivo: string }> } }`.
- [x] 1.8 Loguear con `logInfo`/`logError` (mismo patrón que línea 97/101)
      un evento `ventas.clientes.importar_lote` con el conteo de creados y
      errores.
- [x] 1.9 Test de integración en `apps/ventas/test/integration/`: lote
      100% válido (todos se crean, errores vacío); lote mixto (válidos se
      crean, inválidos se reportan con fila+motivo); RFC duplicado dentro
      del archivo (ninguna de las dos filas se crea); rol sin `admin` → 403
      sin crear nada.
      `apps/ventas/test/integration/clientes-importar-lote.integration.test.ts`
      — 4/4 casos pasan.

## 2. Frontend — utilidad compartida

- [x] 2.1 Crear `apps/app-shell/src/lib/csvImport.ts`: función que reciba
      un `File` (`.csv` o `.xlsx`) y devuelva un arreglo de objetos usando
      la librería `xlsx` ya instalada en `apps/app-shell/package.json`
      (`XLSX.read(...)` + `XLSX.utils.sheet_to_json(...)`), mapeando cada
      fila por nombre de columna del encabezado.
      Mismo motor que ya usa `InsumosView.tsx` (`leerArchivoComoRawRows`),
      pero devolviendo objetos por fila (sin `header: 1`) en vez de arreglos
      crudos.
- [x] 2.2 La utilidad no debe asumir un shape de columnas fijo — debe ser
      reutilizable tal cual por los changes futuros de Proveedores
      (`compras`) y Empleados (`personal`) mencionados en proposal.md.

## 3. Frontend — apps/app-shell (VentasView.tsx, tab Clientes)

- [x] 3.1 Junto al botón "Nuevo Cliente" (`VentasView.tsx:179-181`, visible
      solo en el tab `clientes`), agregar botón "Importar CSV/Excel" —
      visible solo si `roles.includes('admin')` (mismo patrón que
      `isAdminRole` en `ComprasView.tsx:229/285`), ya que el endpoint de 1.1
      es admin-only.
- [x] 3.2 Al seleccionar archivo, parsearlo con `csvImport.ts` (2.1) y
      mostrar una vista previa: conteo de filas reconocidas como
      válidas/inválidas (validación cliente-side equivalente a 1.4, sin
      llamar al backend todavía) antes de confirmar el envío.
      Se usó el componente `SlidePanel` ya existente (mismo que
      `InsumosView.tsx` para su vista previa de importación) en vez de un
      modal nuevo.
- [x] 3.3 Al confirmar, enviar `POST /clientes/importar-lote` (1.1) con el
      arreglo parseado y mostrar el resultado: creados vs. errores por fila
      (motivo visible por fila), y refrescar la lista de clientes
      (`fetchData()`, línea 173) si hubo al menos un creado.
- [x] 3.4 Sin seleccionar archivo o con rol no-admin, el tab Clientes se
      comporta exactamente igual que hoy (sin regresión visual/de flujo en
      el caso común).
      Verificado por lógica: el botón de importar solo se renderiza si
      `tab === 'clientes' && esAdmin`; `tsc --noEmit` limpio en
      `apps/app-shell`. Sin herramienta de automatización de navegador
      disponible en este entorno para verificación visual real (ver 4.1).

## 4. Verificación manual

- [ ] 4.1 Verificación manual en navegador: como usuario `admin`, importar
      un archivo con filas válidas, inválidas y un RFC duplicado dentro del
      mismo archivo — confirmar que la vista previa y el resultado final
      coinciden con el detalle esperado por fila, y que los clientes
      válidos aparecen en el catálogo tras refrescar.
- [ ] 4.2 Verificación manual: confirmar que un usuario sin rol `admin` no
      ve el botón "Importar CSV/Excel" y que, si llama al endpoint
      directamente, recibe 403.
