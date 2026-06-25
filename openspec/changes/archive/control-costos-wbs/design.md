## Context

Hoy las requisiciones en `compras` tienen `concepto_origen_id` (solo para el flujo APU, nullable) pero no se valida ni se requiere para flujos INSUMO/IMPREVISTO. Los insumos en `gerencia-tecnica` tienen `tipo_insumo` (MATERIAL, EQUIPO, etc.) pero no una categoría de gasto configurable por tenant.

No existe ningún mecanismo que acumule el gasto comprometido ni pagado por partida. GT y Control de Proyectos no tienen vistas de control presupuestal por partida ni por categoría.

## Goals / Non-Goals

**Goals:**
- Categorías de gasto configurables por tenant (predefinidas + custom), congeladas al activar el proyecto.
- Vínculo req → partida obligatorio en todos los flujos.
- Acumulado Comprometido/Pagado por partida calculado on-demand desde OCs y pagos existentes.
- Vista GT: tabla catálogo de conceptos × ejecución física y económica con semáforo.
- Vista Control de Proyectos: desglose por categoría de gasto.

**Non-Goals:**
- No se recalculan datos históricos (reqs ya existentes sin `concepto_id` quedan sin vínculo).
- No se modifica el módulo `finanzas` ni sus tablas de pagos (se lee via endpoint existente o query directa a `ordenes_compra`).
- No se implementa Earned Value Management completo (solo alertas simples de % económico vs. % físico).
- No se integra con OPUS ni herramientas externas de presupuesto en esta versión.

## Decisions

### D1 — Categorías de gasto: tabla en `gerencia-tecnica`, gestionadas por Control de Proyectos

Las categorías son datos de negocio ligados al proyecto/tenant. La tabla vive en `gerencia-tecnica` (donde está el catálogo de insumos al que se vinculan), pero los endpoints que hacen CRUD sobre ellas requieren rol `control_obra` o `admin` — no `gerencia_tecnica`. GT solo gestiona la ficha técnica del insumo.

**Catálogo predefinido del sistema (seed):**
```
1. Materiales                      ← MATERIAL
2. Equipo Mayor                    ← EQUIPO
3. Herramienta y Equipo Menor      ← EQUIPO (excepción manual)
4. Servicios y Subcontratos        ← SUBCONTRATO
5. Agua                            ← MATERIAL (excepción manual)
6. Rentas                          ← EQUIPO (excepción manual)
7. EPP (Equipo de Protección Personal) ← MATERIAL (excepción manual)
8. Mano de Obra Subcontratada      ← MANO_DE_OBRA
9. Indirectos y Gastos Generales   ← INDIRECTO
10. Otros                          ← sin mapeo
```

**Auto-clasificación por `tipo_insumo`:** al iniciar el proceso de clasificación, el sistema pre-rellena `categoria_gasto_id` en cada insumo según el mapeo anterior. Control de Proyectos solo corrige las excepciones (agua, rentas, EPP, herramienta menor). Esto reduce el trabajo manual de cientos de ítems a docenas de excepciones.

Cada tenant puede agregar/renombrar/eliminar categorías mientras el proyecto esté en `CONFIGURACION`. Al pasar a `ACTIVO` las categorías se congelan. La congelación se valida a nivel backend.

### D2 — `concepto_id` va en el header de `requisiciones`, no por ítem

Una req pertenece a una sola partida (N:1). Esto ya es coherente con el flujo APU (`concepto_origen_id` en header implícito). Se renombra el campo a `concepto_id` y se hace NOT NULL con default null para no romper datos existentes; la validación obligatoria se aplica en los endpoints de creación (no en el schema de DB, para permitir migración sin bloquear datos históricos).

### D3 — Acumulado Comprometido: calculado desde `ordenes_compra`, no tabla separada

Crear una tabla de acumulados implica mantenerla sincronizada con OCs y pagos, lo cual es frágil. En su lugar, los endpoints de costos por partida calculan en tiempo real:

```sql
-- Comprometido: OCs en estado EMITIDA, APROBADA o PAGADA vinculadas a la partida
SELECT SUM(oc.total) FROM ordenes_compra oc
JOIN requisiciones r ON oc.requisicion_id = r.id_requisicion  -- nuevo campo
WHERE r.concepto_id = :partida_id AND oc.estado IN ('EMITIDA','APROBADA','PAGADA')

-- Pagado: OCs en estado PAGADA
SELECT SUM(oc.total) FROM ordenes_compra oc
JOIN requisiciones r ON oc.requisicion_id = r.id_requisicion
WHERE r.concepto_id = :partida_id AND oc.estado = 'PAGADA'
```

Para esto se necesita vincular también `ordenes_compra.requisicion_id` (campo nuevo, FK a la req que originó la OC).

### D4 — % Físico: se lee de `avances` en `control-obra` via HTTP

El % de avance físico por partida existe en `control-obra` (estimaciones/avances). El endpoint de GT hará una llamada HTTP a `control-obra` para obtener el % de avance de cada concepto. Degradación elegante si el módulo no responde (muestra `—`).

### D5 — Semáforo de desviación: regla simple de proporción

```
ratio = (% Económico) / (% Físico)
🟢 Verde  : ratio ≤ 1.10  (gasto proporcional al avance)
🟡 Ámbar  : 1.10 < ratio ≤ 1.30  (sobrecosto moderado)
🔴 Rojo   : ratio > 1.30  (desviación crítica)
⚪ Gris   : sin avance físico registrado
```

### D6 — Estado de proyecto `CONFIGURACION` vs `ACTIVO`

El campo `estado` en `proyectos` (tabla de `auth` o tenant config) hoy probablemente no existe de forma explícita. Se agrega como campo en la tabla de proyectos del tenant (`CONFIGURACION` | `ACTIVO` | `CERRADO`). El cambio de estado lo hace solo el `admin`.

## Risks / Trade-offs

- **Reqs históricas sin `concepto_id`** → quedan con `concepto_id = NULL`. Los dashboards mostrarán una categoría "Sin asignar" para ellas. No se fuerza retroactivamente.
- **OCs sin `requisicion_id`** (OCs creadas directamente sin req) → no aparecen en el acumulado por partida. Es un caso de uso válido (compras directas); se puede agregar en versión futura.
- **Calcular acumulados on-demand** puede ser lento con muchas OCs → aceptable para el volumen actual (proyectos de construcción medianos). Si escala, se puede agregar una tabla de acumulados materializada.
- **Llamada HTTP a `control-obra` para % físico** → si el módulo está caído, la vista GT muestra `—` en la columna de % físico. Aceptable como degradación elegante.

## Migration Plan

1. Migración DB `gerencia-tecnica`: crear tabla `categorias_gasto`, seed con las 10 categorías predefinidas, agregar `categoria_gasto_id` (nullable) a `insumos`.
2. Migración DB `compras`: agregar `concepto_id` (nullable, FK a conceptos de GT) a `requisiciones`; agregar `requisicion_id` (nullable) a `ordenes_compra`.
3. Rebuild y restart de `gerencia-tecnica` y `compras`.
4. Rebuild y restart de `app-shell`.
5. Datos históricos: no se migran (quedan con NULL). El sistema los muestra como "Sin partida asignada".

**Rollback:** los campos son nullable → eliminarlos no rompe funcionalidad existente.

## Open Questions

- ¿Las OCs creadas directamente sin req (flujo directo de Compras) deben poder vincularse a una partida manualmente? → Fuera de scope v1, documentar como deuda técnica.
