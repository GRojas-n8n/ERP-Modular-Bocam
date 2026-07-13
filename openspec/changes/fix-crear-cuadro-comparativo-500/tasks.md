## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test de integración nuevo en
      `apps/compras/test/integration/fix-crear-cuadro-comparativo-500.integration.test.ts`:
      crear una requisición con un ítem cuya `especificacion_marca_modelo` tenga 109
      caracteres (mismo caso real de producción), `POST /comparativas` debe retornar 201 —
      reproduce el bug (hoy retorna 500).
- [x] 1.2 Confirmar que el test 1.1 falla contra el código actual antes de implementar.
      Confirmado: `500 !== 201`, mismo error de Prisma que en los logs de producción
      ("The provided value for the column is too long for the column's type").

## 2. Backend — ampliar la columna

- [x] 2.1 `ComparativaLinea.marca_modelo_ref`: `VARCHAR(100)` → `VARCHAR(200)` en
      `apps/compras/prisma/schema.prisma`.
- [x] 2.2 Generar y aplicar la migración de Prisma (aditiva, ampliar longitud, sin
      backfill). Migración escrita a mano (`20260713170000_ampliar_marca_modelo_ref`),
      mismo patrón que changes anteriores por drift preexistente de la shadow DB local.
- [x] 2.3 Regenerar el cliente de Prisma para `apps/compras`.
- [x] 2.4 Verificar que el test 1.1 pasa. Confirmado.

## 3. Frontend — error visible en vez de fallback silencioso

- [x] 3.1 En `apps/app-shell/src/views/ComprasView.tsx` (`openComparativa`), reemplazar el
      `catch` silencioso de `POST /comparativas` por uno que muestre `notify({ type: 'error',
      ... })` con el mensaje del backend y no continúe abriendo el cuadro (`return` antes de
      poblar `comparativas`/`activeReqId`).
- [x] 3.2 Test de componente: `POST /comparativas` responde con error → se muestra un
      `notify` de tipo `error` y no se abre ningún cuadro. Confirmado que falla sin el fix
      (`git stash`): timeout esperando el `notify` de error.
- [x] 3.3 Test de componente: `POST /comparativas` responde 201 normalmente → comportamiento
      actual sin cambios (se abre el cuadro con el `id_cuadro` real).

## 4. Verificación

- [x] 4.1 Verificar con `npx tsc -b` en `apps/app-shell` (comando real del build de Docker)
      y `tsc --noEmit` en `apps/compras` que no hay errores de tipos. Ambos limpios.
- [x] 4.2 Suite completa de `apps/compras` (tests de integración relevantes, incluyendo
      `marca-especificaciones-cuadro-comparativo`, `cotizar-items-texto-libre-comparativa`,
      `comparativa-pdf-cotizacion` y `cuadro-comparativo-dos-etapas` — happy path completo)
      y `apps/app-shell` (`vitest run`, 20/20 archivos, 58/58 tests) en verde.
- [ ] 4.3 Verificación manual en navegador contra el caso real: crear el cuadro comparativo
      de la requisición de imprevistos de producción (marca/modelo de 109 caracteres) y
      confirmar que se crea sin error, y que marca/especificaciones se ven en el panel de
      "Detalles técnicos".

## 5. Cierre

- [ ] 5.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
