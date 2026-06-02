## Context

El módulo `apps/compras` implementa el flujo de adquisición de materiales. Las requisiciones son el punto de entrada: un usuario las crea, Procurement las revisa y aprueba, y entonces se inicia el cuadro comparativo de proveedores.

Al analizar el estado en producción se detectaron tres problemas independientes:

**Problema A — Mismatch de campos API/Frontend**
El modelo Prisma devuelve `id_requisicion`, `codigo`, `fecha_solicitud`, `solicitante_id`, pero `ComprasView.tsx` esperaba `id`, `folio`, `fecha`, `solicitante`. El resultado era tarjetas vacías en producción (solo en demo mode se veían datos, porque `demoData.ts` usaba los campos del frontend).

**Problema B — Ausencia de paso de aprobación**
El flujo diseñado era: `PENDIENTE → (aprobación procurement) → APROBADA → cuadro comparativo`. En la implementación, el botón "Iniciar comparativa" aparecía directamente para cualquier requisición sin filtrar por estado, saltándose el paso de aprobación.

**Problema C — Imprevistos de obra sin representación**
Los imprevistos son materiales que aparecen durante la ejecución de obra y no tienen código en el catálogo APU original. Sin soporte en el schema, el Residente no podía requisitarlos de forma trazable. La alternativa era crear insumos ficticios en el catálogo de gerencia-técnica, contaminando el catálogo maestro.

## Goals / Non-Goals

**Goals:**
- Agregar campo `tipo` a `Requisicion` (NORMAL | IMPREVISTO) con índice parcial para consultas eficientes
- Hacer `insumo_id` nullable en `RequisicionItem` para permitir ítems sin catálogo
- Agregar `PATCH /requisiciones/:id/aprobar` con validación de roles y idempotencia
- Normalizar la respuesta del `GET /requisiciones` en el frontend para que el mismatch sea transparente
- Mostrar el botón "Aprobar" solo a roles con autoridad de procurement
- Etiquetar visualmente los imprevistos en las tarjetas

**Non-Goals:**
- No se implementan notificaciones push/email al aprobar una requisición
- No se implementa flujo de rechazo de requisición (solo aprobación)
- No se implementa historial de cambios de estado por requisición
- No se construyen tests de integración en esta iteración (deuda técnica registrada)
- No se modifica el flujo de cuadro comparativo ni las órdenes de compra

## Decisions

### D1: Una tabla para NORMAL e IMPREVISTO vs. tablas separadas

**Decisión:** Una única tabla `requisiciones_items` con `insumo_id` nullable y campos opcionales `descripcion_libre`, `unidad_libre`, `es_imprevisto`.

**Alternativa descartada:** Tabla `requisiciones_items_imprevisto` separada. Requería duplicar índices, relaciones y queries. El `ComparativaDetalle` y el cuadro comparativo tendrían que unir dos tablas para obtener todos los ítems de una requisición.

**Rationale:** El campo `es_imprevisto: Boolean` actúa como discriminador. La query más frecuente es "dame todos los ítems de esta req" — funciona igual para ambos tipos. La query menos frecuente "dame solo imprevistos por proyecto" tiene índice parcial dedicado.

### D2: Estado inicial de requisiciones nuevas

**Decisión:** El estado inicial de toda requisición (NORMAL o IMPREVISTO) es siempre `PENDIENTE`.

**Alternativa descartada:** Estado `BORRADOR` para las creadas por residencia (que requieren mayor revisión). Agrega complejidad al flujo sin beneficio operativo claro: Procurement ya valida todas las requisiciones antes de cotizar.

**Rationale:** El flujo es plano: crear → aprobar → cotizar. El estado `BORRADOR` existe para casos donde el usuario guarda parcialmente antes de enviar (feature no implementada). Usar `PENDIENTE` desde el inicio hace el flujo explícito.

### D3: Validación de rol en aprobación — solo backend vs. backend + frontend

**Decisión:** Validación en ambas capas. Backend con `requireRoles('procurement', 'admin', 'superintendent')`. Frontend oculta el botón para roles sin autoridad.

**Rationale:** La validación de backend es la fuente de verdad y no puede omitirse. La validación de frontend es UX: evita que el usuario vea un botón que siempre le va a devolver 403. Ambas son necesarias; no son redundantes.

### D4: Normalización de campos API — en el fetch vs. en la interfaz TypeScript

**Decisión:** Normalizar en `fetchData()` al momento de poblar el estado de React. La interfaz `Requisicion` mantiene los nombres semánticos del frontend (`folio`, `fecha`, `solicitante`).

**Alternativa descartada:** Cambiar la API para devolver los campos con nombres del frontend. Rompería la convención `snake_case` del backend y los campos Prisma. El endpoint lo consumen potencialmente otros clientes.

**Rationale:** El adapter pattern en el fetch es el lugar correcto para absorber diferencias entre la API y el modelo de vista. Centralizado, testeable, no contamina la UI.

### D5: Índice parcial para imprevistos

**Decisión:** `CREATE INDEX idx_req_imprevisto ON requisiciones(tenant_id, tipo) WHERE tipo = 'IMPREVISTO'`

**Rationale:** Las consultas de imprevistos son filtradas exactamente por `tipo = 'IMPREVISTO'`. Un índice parcial es más pequeño y eficiente que un índice compuesto completo. PostgreSQL lo usa automáticamente cuando la cláusula `WHERE` del query incluye `tipo = 'IMPREVISTO'`.

## Risks / Trade-offs

- **[Riesgo] Tests ausentes**: Este cambio no tiene tests de integración. Si se modifica el endpoint de aprobación o la lógica de tipo, no hay red de seguridad. Registrado en CLAUDE.md §19 como deuda técnica.
- **[Trade-off] IVA hardcodeado al 16%**: No relacionado con este cambio, pero el `POST /requisiciones` no valida montos (las reqs no tienen monto, solo ítems). El IVA hardcodeado afecta solo al flujo de OC.
- **[Riesgo] Migración manual**: `backend-entrypoint.sh` solo hace `node`, no `prisma migrate deploy`. La migración se aplicó manualmente en producción. Si se recrea el container desde cero sin aplicar la migración, el schema estará desactualizado.
- **[Decisión consciente] Sin notificación al solicitante**: Cuando Procurement aprueba una req, el Residente que la creó no recibe ningún aviso. Requeriría EventBus + módulo de notificaciones. Fuera de scope.

## Migration Plan

1. ✅ `ALTER TABLE requisiciones ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'NORMAL'`
2. ✅ `ALTER TABLE requisiciones_items ALTER COLUMN insumo_id DROP NOT NULL`
3. ✅ `ALTER TABLE requisiciones_items ADD COLUMN descripcion_libre TEXT, unidad_libre VARCHAR(20), es_imprevisto BOOLEAN NOT NULL DEFAULT false`
4. ✅ `CREATE INDEX idx_req_imprevisto ON requisiciones(tenant_id, tipo) WHERE tipo = 'IMPREVISTO'`
5. ✅ Registrada en `_prisma_migrations` de `bocam_compras` en VPS
6. ✅ Containers `compras` + `app-shell` reconstruidos y desplegados

No se requiere rollback especial: todos los cambios son aditivos. Revertir el código sin revertir la migración deja columnas ignoradas — sin impacto funcional.
