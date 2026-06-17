## Context

El módulo `compras` tiene `OrdenCompra` con estados `BORRADOR → PENDIENTE → APROBADA → EMITIDA → RECIBIDA → CANCELADA`. El estado `RECIBIDA` existe pero nunca se asigna — no hay mecanismo para registrar la entrega física. `OrdenCompraItem` guarda la cantidad pedida por línea referenciando el catálogo de insumos. El módulo `almacén` en ComprasView está presente pero sin lógica real.

## Goals / Non-Goals

**Goals:**
- Registrar recepciones parciales o totales contra una OC en estado `EMITIDA` o `PARCIALMENTE_RECIBIDA`.
- Cada recepción captura líneas con cantidad recibida, discrepancias opcionales y notas.
- La OC avanza automáticamente: `EMITIDA → PARCIALMENTE_RECIBIDA → RECIBIDA` al cierre total.
- Publicar `compras.oc_recibida_total` cuando la OC queda completamente recibida.
- UI en ComprasView: historial de recepciones por OC y formulario de nueva recepción.

**Non-Goals:**
- Inventario real (entradas/salidas por almacén físico) — fase posterior.
- Integración automática con Control de Obra en esta fase — solo el evento se publica.
- Devoluciones o rechazos parciales — fuera de alcance.
- Recepción de OC en estado distinto a `EMITIDA` o `PARCIALMENTE_RECIBIDA`.

## Decisions

**D1 — Nuevo estado `PARCIALMENTE_RECIBIDA` en lugar de reusar `RECIBIDA`**
El estado `RECIBIDA` ya existe en el schema como terminal. Agregamos `PARCIALMENTE_RECIBIDA` como estado intermedio entre `EMITIDA` y `RECIBIDA`. Esto es menos disruptivo que renombrar `RECIBIDA` a `RECIBIDA_TOTAL` (evita migración de datos existentes en esa columna).
_Alternativa descartada_: renombrar `RECIBIDA` → `RECIBIDA_TOTAL` requeriría migración de filas existentes y posibles chequeos hardcodeados en el frontend.

**D2 — Dos tablas nuevas: `recepciones_oc` + `recepcion_oc_items`**
Una recepción es un evento en el tiempo (fecha, receptor, notas) con múltiples líneas. Separar cabecera de líneas permite histórico de múltiples recepciones parciales por OC y audit trail claro.
_Alternativa descartada_: Una sola tabla con JSON array de ítems no es consultable por `orden_item_id` para calcular acumulados.

**D3 — Cálculo de estado de OC post-recepción en el backend, no en el cliente**
El endpoint `POST /recepciones` calcula internamente si todas las líneas están completas (Σ `cantidad_recibida` >= `cantidad` del item). El frontend no toma decisiones de estado.

**D4 — Lógica de "línea completa": tolerancia cero**
Una línea se considera recibida cuando `Σ cantidad_recibida >= OrdenCompraItem.cantidad`. Sin tolerancia de ±5% para simplificar la primera iteración.

**D5 — `recibido_por` del JWT, no del body**
Regla de oro §4: el userId siempre del `req.securityContext`.

## Risks / Trade-offs

- **OC con discrepancias nunca cierra automáticamente** → La discrepancia es informativa; si la cantidad recibida cubre la pedida a pesar de la discrepancia anotada, igual se cierra. Mitigación: el campo `nota_discrepancia` deja constancia.
- **Recepciones no son reversibles** → No hay endpoint DELETE. Si se registra un error, se debe crear otra recepción correctiva. Esto es intencional para mantener audit trail.
- **Sin integración con finanzas en esta fase** → La OC recibida no dispara pago automático. El módulo Finanzas puede suscribirse al evento `compras.oc_recibida_total` en una fase posterior.

## Migration Plan

1. `prisma migrate dev --name add_recepcion_oc` en `apps/compras` (2 tablas nuevas, no rompe nada existente).
2. No hay datos a migrar — las OC en estado `RECIBIDA` existentes (si las hay) no se tocan.
3. En VPS: `docker exec bocam-vps-compras npx prisma migrate deploy` → rebuild imagen → restart.
4. Rollback: el estado `PARCIALMENTE_RECIBIDA` es nuevo; si se revierte, ninguna fila existente lo tenía.
