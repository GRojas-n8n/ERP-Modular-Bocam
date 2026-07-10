## 1. Investigación previa (bloqueante antes de tocar schema)

- [x] 1.1 Confirmar con `grep` en todo el monorepo (no solo `apps/auth` y
      `apps/app-shell`) que ningún otro servicio compara contra los valores
      legacy de `estatus` (`LICITACION`, `ADJUDICADO`, `CONSTRUCCION`,
      `CIERRE_TECNICO`, `CIERRE_FINANCIERO`) antes de migrar el vocabulario
      (confirmado: solo `apps/auth` y `AdminView.tsx`)
- [x] 1.2 Confirmar si `apps/auth/src/main.ts` ya expone un helper
      `requireRoles(...)` reutilizable (como en `apps/compras`) o si hay que
      crear uno nuevo específico para este endpoint (confirmado: existe en
      `packages/auth-middleware/src/middleware.ts:198`, reutilizable
      directamente, `apps/auth` solo necesita importarlo)

## 2. Backend `apps/ventas` — código de cliente

- [x] 2.1 Test: crear un `Cliente` con `codigo_cliente` fuera de rango
      (`"051"`, `"abc"`, duplicado en el tenant) es rechazado
- [x] 2.2 Test: crear un `Cliente` con `codigo_cliente` válido y único
      persiste correctamente
- [x] 2.3 Agregar `codigo_cliente String? @db.VarChar(3)` a `Cliente` en
      `apps/ventas/prisma/schema.prisma`, con `@@unique([tenant_id, codigo_cliente])`
- [x] 2.4 `apps/ventas` no usa carpeta de migraciones de Prisma (no existía
      antes de este change) — se siguió la convención ya establecida del
      servicio (`prisma db push`) en vez de introducir un patrón nuevo
- [x] 2.5 Endpoint `POST /api/v1/ventas/clientes` creado (no existía
      ningún endpoint de creación de cliente antes de este change — la
      tarea original asumía que había uno que extender) con validación de
      `codigo_cliente` (rango `000`-`050`, formato 3 dígitos)
- [x] 2.6 Script de seed idempotente
      (`apps/ventas/prisma/seed-clientes-centro-costos.ts`, no enganchado a
      `prisma db seed`) con los 51 clientes reales provistos — RFCs son
      placeholder (`PEND###`), a corregir manualmente antes de facturación
      real

## 3. Backend `apps/auth` — modelo `Proyecto`

- [x] 3.1 Test: función pura `ensamblarCodigoCentroCostos(empresa, anio,
      codigoCliente, consecutivo)` produce exactamente 13 caracteres en el
      orden correcto
- [x] 3.2 Test: función pura de validación rechaza `empresa_grupo` fuera de
      `['CIB','HCO','HSE','SEO']`
- [x] 3.3 Test: cálculo de consecutivo — primer contrato del año/cliente,
      segundo contrato, y reintento ante colisión de unicidad
- [x] 3.4 Test: mapeo de migración de `estatus` legacy → nuevo vocabulario
      (los 5 casos de la tabla en design.md)
- [x] 3.5 Agregado a `Proyecto` en `apps/auth/prisma/schema.prisma`:
      `empresa_grupo`, `anio_centro_costos`, `cliente_id`,
      `consecutivo_centro_costos`, `es_especial`, `tipo_especial`,
      `fecha_inicio_real`, `fecha_firma_contrato`, `fecha_programada_inicio`,
      `fecha_programada_fin`, `monto_total_vendido`, `periodo_ejecucion`,
      `periodo_ejecucion_unidad`, `total_dias_naturales`,
      `total_dias_laborables` (todos nullable), + índice
      `(tenant_id, empresa_grupo, anio_centro_costos, cliente_id)` para el
      cálculo de consecutivo
- [x] 3.6 Migración `20260710000000_centro_costos_alta_formal` (aditiva,
      `IF NOT EXISTS`) + `UPDATE` que remapea los valores legacy de
      `estatus`. Validada corriéndola contra la BD local: remapeó
      correctamente los 3 proyectos sembrados (`ADJUDICADO`→`ABIERTO`,
      `CONSTRUCCION`→`EN EJECUCIÓN` ×2)
- [x] 3.7 Creado `apps/auth/src/centro-costos-policy.ts` con las funciones
      puras de 3.1-3.4 (mismo patrón que
      `apps/compras/src/solicitud-cotizacion-policy.ts`)
- [x] 3.8 RBAC vía `requireRoles('admin','gerencia_tecnica','control_proyectos')`
      (ya existía en `packages/auth-middleware`, solo se importó) aplicado a
      `POST`, `PATCH` **y también `GET`** `/api/v1/auth/admin/proyectos`
      (se amplió el alcance original de la tarea: sin acceso de lectura estos
      roles no podrían ver el catálogo de centros de costos ya creados desde
      la pestaña que se les habilita en el punto 4.6)
- [x] 3.9 Ensamblado de código + cálculo de consecutivo integrado en
      `POST /api/v1/auth/admin/proyectos`, con reintento (hasta 3 intentos)
      ante colisión de unicidad (`P2002`). Bifurca por `es_especial` para el
      caso de bypass de máscara
- [x] 3.10 `estatus` por default cambiado a `ABIERTO`; `POST` y `PATCH`
      validan contra el nuevo vocabulario con `validarEstatus`; fechas
      normalizadas (`'YYYY-MM-DD'` → `Date`) antes de escribir a Prisma;
      validación cruzada `fecha_programada_fin >= fecha_programada_inicio`
      en ambos handlers
- [x] 3.11 Verificado — 12/12 tests de `centro-costos-policy.test.ts` pasan,
      y los 19/19 tests existentes de `apps/auth` (`login-policy`,
      `project-access-policy`) siguen pasando sin regresión

### Hallazgo adicional: `apps/auth/src/main.ts` no exportaba `app` ni tenía
guard `require.main === module` — a diferencia de `compras`/`ventas`, el
módulo arrancaba su propio servidor en el puerto fijo 3003 al importarse,
haciendo imposible escribir tests de integración con el patrón ya
establecido. Se corrigió (cambio mínimo, mismo patrón que el resto de
servicios) para poder cumplir el TDD que exige este proyecto — sin esto, las
tareas 5.1-5.4 no eran verificables.

## 4. Frontend `apps/app-shell`

- [x] 4.1 `AdminView.tsx`: reemplazado el input de texto libre por el flujo
      guiado — dropdown de empresa, año (prellenado con el año actual,
      editable), dropdown de cliente cargado desde `ventasApi.getClientes()`,
      vista previa de solo lectura del código ensamblado (los 10 primeros
      caracteres; el consecutivo se muestra como `···` hasta guardar, lo
      calcula el backend)
- [x] 4.2 Casilla "Centro de Costos especial (gasto operativo interno)" que,
      al marcarse, cambia el formulario a `tipo_especial` (dropdown
      OFICINA/TALLER/ALMACÉN) + código de texto libre
- [x] 4.3 Modal `AgregarClienteModal`: crea el cliente vía
      `ventasApi.createCliente`, inyecta el resultado en el selector del
      formulario en curso sin recargar ni perder el resto de los campos ya
      capturados
- [x] 4.4 Sección "Línea base financiera y de plazos" con los 9 campos del
      punto 6, validación cruzada `fecha_programada_fin >=
      fecha_programada_inicio` (bloquea el botón de guardar y muestra el
      campo en rojo)
- [x] 4.5 `<select>` de estatus actualizado a `ESTATUS_CENTRO_COSTOS`
      (`ABIERTO`, `EN EJECUCIÓN`, `EN COBRO`, `TERMINADO`, `CERRADO`)
- [x] 4.6 Nav de "Administración" ampliado a `admin`, `gerencia_tecnica`,
      `control_proyectos`; sub-items "Usuarios" y "Categorías de Gasto"
      bloqueados explícitamente a `admin` (antes quedaban protegidos solo
      porque todo el módulo era admin-only — al ampliar el módulo había que
      re-explicitarlo por sub-item, usando el soporte de `SubItem.roles` que
      ya existía en `Layout.tsx` pero no se usaba)

## 5. Verificación end-to-end

Verificado con navegador real (Playwright) contra servicios locales
(`auth`, `ventas`, `app-shell`) + BD aislada, sesión de login real (usuario
`admin@alfa.bocam.com`):

- [x] 5.1 Flujo completo: Administración → Proyectos → Nuevo Proyecto →
      empresa `HCO` + año `2018` + cliente `SERSSINSA` (código `004`, del
      catálogo real de 51 clientes sembrado) → preview `HCO2018004···` →
      nombre + fechas + monto → guardado → aparece en el listado como
      **`HCO2018004001`** (coincide exactamente con el ejemplo del roadmap)
- [x] 5.2 Verificado por integración (`5.1/5.2` en
      `centro-costos-alta.integration.test.ts`): segundo alta mismo año+cliente
      obtiene `consecutivo=002`
- [x] 5.3 Verificado por integración: rol `resident` recibe 403 y no crea el
      registro
- [x] 5.4 Verificado por integración: `es_especial=true` + `tipo_especial=OFICINA`
      con código libre (`OFICINA-CDMX`) se crea sin la máscara de 13
      posiciones; `tipo_especial` inválido (`BODEGA`) se rechaza con 400
- [x] 5.5 Verificado en navegador: los 2 proyectos legacy
      (`CC-2026-GUA-01`, `CC-2026-MTY-02`) siguen visibles y editables, con
      `estatus` ya migrado (`EN EJECUCIÓN`, `ABIERTO` respectivamente — antes
      `CONSTRUCCION`/`ADJUDICADO`) sin exigirles los campos nuevos
- [x] 5.6 Suite completa ejecutada: `apps/auth` (19/19 tests: 12 nuevos de
      `centro-costos-policy` + 7 existentes sin regresión, vía
      `node --test`), `apps/ventas` (2/2 tests de integración de
      `codigo_cliente`), `apps/app-shell` (`tsc --noEmit` sin errores)
