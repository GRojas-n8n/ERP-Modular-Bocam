## 1. Reproducir el bug (TDD: test primero)

- [x] 1.1 Test que reproduce el bug: `POST /api/v1/gerencia-tecnica/insumos` con `clave` de más de 50 caracteres (resto de campos válidos) responde `500` con el mensaje crudo de Prisma. Confirmado rojo (`Invalid prisma.insumo.create() invocation: The provided value for the column is too long for the column's type`) antes de tocar el schema — confirma que la hipótesis de la inspección (overflow de `clave` VARCHAR(50)) es una causa real y reproducible. Ver `apps/gerencia-tecnica/test/integration/validacion-longitud-insumo.integration.test.ts`, `testAltaConClaveDemasiadoLarga`.
- [x] 1.2 Test equivalente para `PATCH /api/v1/gerencia-tecnica/insumos/:id` con `unidad_medida` de más de 20 caracteres sobre un insumo existente. `testEdicionConUnidadMedidaDemasiadoLarga`.
- [x] 1.3 Test equivalente para `costo_base` mayor a `99,999,999.9999` en `POST /insumos`. `testAltaConCostoBaseFueraDeRango`.
- [x] 1.4 Test equivalente para `POST /api/v1/gerencia-tecnica/insumos/importar-lote`: lote con una fila de `clave` demasiado larga, una fila de `costo_base` fuera de rango, y filas válidas mezcladas. `testImportarLoteConFilasInvalidasNoAbortaElResto` — escrito y corrido en verde junto con el fix (no en rojo-primero para este caso específico, siguiendo la misma nota que dejó `fix-compras-validacion-longitud-proveedor`: el mecanismo de "fila inválida no aborta el lote" ya existe en el endpoint para otras validaciones, así que el comportamiento esperado post-fix era predecible).

## 2. Fundamentos (copiados del patrón de `apps/auth`/`apps/personal`/`apps/compras`)

- [x] 2.1 Agregada dependencia `zod` (`^4.4.3`, misma versión que auth/personal/compras) a `apps/gerencia-tecnica/package.json` e instalada.
- [x] 2.2 Copiado `apps/compras/src/validation/parse-or-respond.ts` a `apps/gerencia-tecnica/src/validation/parse-or-respond.ts` sin adaptación — el shape de `createApiError`/`ApiResponse` en `apps/gerencia-tecnica/src/types.ts` ya coincide exactamente con el de auth/personal/compras.

## 3. Schema

- [x] 3.1 `apps/gerencia-tecnica/src/validation/schemas/insumo.schema.ts`: `longitudInsumoSchema` con todos los campos opcionales — `clave` ≤50, `unidad_medida` ≤20, `costo_base` vía `z.coerce.number().nonnegative().max(99_999_999.9999)` (coerce para tolerar el mismo `parseFloat` implícito que ya hacía `main.ts`).
- [x] 3.2 Confirmado: el chequeo de obligatorios/tipo existente (`TIPOS_VALIDOS`, presencia de `clave`/`descripcion`/`unidad_medida`) se mantiene intacto en los tres endpoints; la validación de longitud/rango se agregó después, como chequeo adicional.

## 4. Integración en los tres endpoints

- [x] 4.1 `POST /api/v1/gerencia-tecnica/insumos` (`main.ts:269`): `parseOrRespond(longitudInsumoSchema, { clave, unidad_medida, costo_base }, res)` después de los checks existentes de obligatorios.
- [x] 4.2 `PATCH /api/v1/gerencia-tecnica/insumos/:id` (`main.ts:435`): mismo `parseOrRespond`, antes de buscar el insumo existente.
- [x] 4.3 `POST /api/v1/gerencia-tecnica/insumos/importar-lote` (`main.ts:316-429`): `longitudInsumoSchema.safeParse(normalizado)` dentro del bucle existente de validación por fila, **después** de normalizar (`trim`/`toUpperCase`/`parseFloat`) — se valida el valor que realmente se escribiría, no el crudo del body. Una fila que falla se suma a `omitidos`, no aborta el lote.
- [x] 4.4 Los tres `catch` de error inesperado dejaron de incluir `error.message` en la respuesta al cliente (se sigue logueando en el servidor vía `console.error`).
- [x] 4.5 Tests 1.1-1.4 en verde.

## 5. Frontend — vista previa marca filas inválidas antes de enviar

- [x] 5.1 En `parsearArchivoAPU` (`InsumosView.tsx`): agregados los tres límites (`LIMITE_CLAVE`, `LIMITE_UNIDAD_MEDIDA`, `COSTO_BASE_MAX`, constantes nuevas) a los checks existentes de `_error`, marcando `_valido: false` cuando aplica.
- [x] 5.2 Mismo cambio en `parsearArchivoExplosion`.
- [x] 5.3 Confirmado por inspección: el panel de vista previa (sección "Se omitirán") ya renderiza genéricamente cualquier fila con `_valido: false` y su `_error` — no requiere cambio de UI, las filas nuevas se listan automáticamente igual que las existentes ("sin descripción", etc.).

## 6. Verificación

- [x] 6.1 Suite de `apps/gerencia-tecnica` corrida en verde: 4/4 tests nuevos (`test:integration:validacion-longitud-insumo`) + regresión completa (`test:integration` [saldo-partida, 11/11], `fichas-tecnicas-residente`, `presupuesto-activo-precio-cantidad`, `presupuestos-unicidad-clave`, `presupuestos-catalogo-maestro`, `presupuestos-capitulos`) — sin romper nada.
- [x] 6.2 `npx tsc --noEmit` en `apps/gerencia-tecnica` y `apps/app-shell` — ambos limpios.
- [x] 6.3 Confirmado sin regresión: alta válida (`testEdicionConUnidadMedidaDemasiadoLarga`, insumo base) responde `201`; lote mixto (`testImportarLoteConFilasInvalidasNoAbortaElResto`) sigue creando la fila válida (`creados: 1`) igual que antes.

## 7. Deploy y cierre

- [ ] 7.1 PR contra `main` (branch `test/gt-<numero>-500-importar-insumos` — confirmar número de issue con el usuario antes de abrir el PR).
- [ ] 7.2 Desplegado vía CI — confirmar workflows de build+deploy backend y frontend en verde (el smoke test post-deploy puede mostrar el 403 ruidoso ya conocido y documentado, no relacionado a este fix).
- [ ] 7.3 Verificado en `iretum.com`: reintentar la carga real de "Explosión de Insumos" y "Análisis de Precios Unitarios" que reportó el Gerente Técnico. Si ahora aparecen filas "se omitirán" con motivo de longitud/rango, confirma cuál era el campo causante (ver design.md → Risks). Si la carga completa sin ninguna fila omitida por este motivo, el causante era otro (revisar logs del servidor en ese momento).
- [ ] 7.4 `openspec archive fix-500-importar-insumos-explosion-apu` tras verificación en producción.
