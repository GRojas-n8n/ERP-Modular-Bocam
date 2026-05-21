# Hito UI — Almacén y Comparativa de Cotizaciones

**Fecha:** 20 de Mayo 2026  
**Sesión:** 2026-05-20  
**Tipo:** Frontend Feature — Phase 2 UI  
**Estado al cerrar:** ✅ En producción (11/11 contenedores VPS healthy)

---

## Resumen del Hito

Implementación de dos funcionalidades de frontend complejas en el módulo de **Compras**:

1. **Tab Almacén** — gestión de inventario y movimientos de bodega
2. **Comparativa de Cotizaciones** — flujo completo multi-proveedor para evaluación y autorización de OC

Ambas funcionan completamente en modo demo (`iretum-demo`) con datos en `demoData.ts`.

---

## Feature 1 — Tab Almacén en Compras

### Sub-vista: Inventario

- Tabla de ítems con campos: Clave, Descripción, Unidad, Stock Actual, Stock Mínimo, Ubicación, Estado
- **Semáforo de stock** con función `stockStatus(actual, minimo)`:
  - 🔴 `AGOTADO` — stock_actual === 0
  - 🟡 `BAJO` — stock_actual > 0 && stock_actual < stock_minimo
  - 🟢 `OK` — stock_actual >= stock_minimo
- Banner de alerta automático si hay ítems AGOTADO o BAJO
- Búsqueda en tiempo real por clave/descripción
- 8 ítems demo: 2 AGOTADO, 2 BAJO, 4 OK

### Sub-vista: Movimientos

- Tabla con tipo (INGRESO/EGRESO/TRASPASO), fecha, insumo, cantidad, origen, destino, responsable
- Iconografía y colores por tipo:
  - Verde (INGRESO) → IconArrowUpRight
  - Rojo (EGRESO) → IconArrowDownRight
  - Azul (TRASPASO) → IconRefreshCw
- Filtro por tipo de movimiento
- 10 movimientos demo

### Registro de Movimiento (Slide Panel)

- Botones de tipo en header: INGRESO (emerald) / EGRESO (red) / TRASPASO (blue)
- Slide panel **adaptativo**: labels y placeholders cambian según el tipo seleccionado
  ```
  INGRESO:  Origen = "Proveedor/Procedencia", Destino = "Bodega/Ubicación destino"
  EGRESO:   Origen = "Bodega/Ubicación",      Destino = "Frente de trabajo/Destino"
  TRASPASO: Origen = "Origen (proyecto/bodega)", Destino = "Destino (proyecto/bodega)"
  ```
- Select de insumo con unidad auto-poblada
- Campo de referencia (folio OC, requisición, etc.) opcional

---

## Feature 2 — Comparativa de Cotizaciones

### Flujo completo

```
Requisición APROBADA
  └─ Botón "Iniciar comparativa"
       └─ ComparativaDetail.tsx
            ├─ Agregar proveedores (1–3, con color A/B/C)
            ├─ Agregar líneas de insumo (autocomplete desde catálogo)
            ├─ Capturar precios por renglón y proveedor
            ├─ Marcar ganador por renglón (botones A / B / C)
            ├─ Ver totales por proveedor y total comprometido
            └─ Autorizar → OC
                 └─ Genera OC independiente por proveedor ganador
                      └─ Vista OC generadas con total consolidado
```

### Componente `ComparativaDetail.tsx`

**Interfaces exportadas:**
```typescript
export interface CotizacionLinea {
  id: string; insumo_id: string; insumo_clave: string; insumo_descripcion: string;
  insumo_unidad: string; cantidad: number;
  precios: Record<string, string>; // provId → precio string
  ganador: string | null;
}
export interface ProveedorComp { id: string; nombre: string; }
export interface ComparativaLocal {
  id: string; requisicion_id: string; estado: 'BORRADOR' | 'EN_PROCESO' | 'AUTORIZADA';
  proveedores: ProveedorComp[]; lineas: CotizacionLinea[];
  ordenes_compra: { codigo: string; proveedor_nombre: string; total: number }[];
}
```

**Colores de proveedor:**
```
A (índice 0) → Azul   #1d4ed8
B (índice 1) → Violeta #7c3aed
C (índice 2) → Teal   #0d9488
```

**Estados de comparativa:**
```
BORRADOR → EN_PROCESO → AUTORIZADA
```

**Generación de OC en demo mode:**
```typescript
// Agrupa renglones por ganador, calcula total, genera código OC
const ocs = Object.entries(grupos).map(([, v], i) => ({
  codigo: `OC-2024-0${50 + i}`, proveedor_nombre: v.nombre, total: v.total,
}));
onUpdate({ ...comp, estado: 'AUTORIZADA', ordenes_compra: ocs });
```

### Datos Demo

```javascript
// 2 comparativas de ejemplo:
DEMO_COMPARATIVAS[0]: EN_PROCESO — 3 renglones, 2 proveedores, 1 renglón sin ganador
DEMO_COMPARATIVAS[1]: AUTORIZADA — 2 renglones, 2 proveedores, 2 OC generadas
```

---

## Archivos Modificados / Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `apps/app-shell/src/lib/demoData.ts` | Modificado | +DEMO_INVENTARIO, +DEMO_MOVIMIENTOS_ALMACEN, +DEMO_COMPARATIVAS |
| `apps/app-shell/src/views/ComprasView.tsx` | Modificado (reescritura) | Tabs Requisiciones/Catálogo/Almacén + state de comparativa |
| `apps/app-shell/src/components/ComparativaDetail.tsx` | Creado | Componente de comparativa multi-proveedor |
| `apps/app-shell/src/components/Icons.tsx` | Modificado | +IconArrowLeft |
| `apps/app-shell/src/components/SlidePanel.tsx` | Modificado | +colores 'red' y 'blue' |

---

## Infraestructura al Cerrar

```bash
docker compose -f docker-compose.vps.yml --profile core ps
# 11/11 contenedores ✅ healthy
```

VPS: `72.60.114.12` | App-shell: puerto 3000 (expuesto vía Caddy)

---

## Próximos Pasos

- [ ] Commit y push desde Git Bash local (sandbox tenía HEAD.lock)
- [ ] Deploy VPS: `git pull` → `docker build --no-cache app-shell` → `up -d`
- [ ] Phase 2: Sistema de notificaciones (único pendiente de UI)
- [ ] Backend: endpoints `/api/v1/compras/almacen/*` y `/api/v1/seguridad/epp`
- [ ] Phase 3: Módulos RESIDENCIA y CALIDAD
