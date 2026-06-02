# Design — GT: Congelación de Versiones de Presupuesto

## Context

`Presupuesto` en GT es el catálogo de costos por proyecto. Hoy no tiene estado — se puede
editar indefinidamente. `ConceptoPresupuesto.precio_unitario` ES el snapshot correcto en
el momento de creación, pero:
- El endpoint de detalle mezcla `precio_unitario` y `Insumo.costo_base` en la misma respuesta
  sin distinguirlos claramente
- No hay protección contra editar conceptos después de la aprobación del proyecto

## Schema Changes

```prisma
// En model Presupuesto — agregar 3 campos:
estado          String   @default("BORRADOR")  // BORRADOR | APROBADO
aprobado_por    String?  @db.Uuid
fecha_aprobacion DateTime?
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `PATCH` | `/presupuestos/:id/aprobar` | Transiciona a APROBADO, bloquea conceptos |
| `PATCH` | `/presupuestos/:id/conceptos/:cid` | **MODIFICADO** → 409 si presupuesto APROBADO |
| `DELETE` | `/presupuestos/:id/conceptos/:cid` | **MODIFICADO** → 409 si presupuesto APROBADO |
| `GET` | `/presupuestos/:id` | **MODIFICADO** → incluye delta por concepto |

## Lógica de Delta

```typescript
// En GET /presupuestos/:id, por cada concepto:
{
  precio_presupuesto: concepto.precio_unitario,  // snapshot histórico
  precio_actual: insumo.costo_base,              // precio vigente
  delta_pct: ((insumo.costo_base - concepto.precio_unitario) / concepto.precio_unitario * 100).toFixed(1)
}
```

## Decisions

**D1 — Solo BORRADOR y APROBADO (no CONGELADO)**
Dos estados son suficientes para el MVP. "Congelado" implica que un aprobado podría
"descongelarse" — eso añade complejidad que no se necesita ahora.

**D2 — No se puede desaprobar**
Una vez APROBADO, el presupuesto no puede volver a BORRADOR. Si necesita cambios, se crea
una nueva versión (futura iteración — por ahora el `version` field ya existe en schema).

**D3 — Bloqueo solo en conceptos, no en metadatos**
El nombre/descripción del presupuesto puede editarse aunque esté APROBADO. Solo los
`ConceptoPresupuesto` (precios y cantidades) quedan bloqueados.
