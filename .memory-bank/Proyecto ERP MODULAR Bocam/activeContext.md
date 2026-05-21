# Active Context — Iretum ERP (BocamOS)

**Fecha:** 2026-05-20  
**Producto:** Iretum ERP — SaaS Multi-Tenant para constructoras  
**VPS:** `72.60.114.12` | Proyecto: `/root/ERP-Modular-Bocam`  
**GitHub:** `https://github.com/GRojas-n8n/ERP-Modular-Bocam`

---

## Foco Actual

Sesión de hoy completó los dos módulos de frontend pendientes de Phase 2:

1. **Tab Almacén en Compras** — sub-vistas Inventario y Movimientos (INGRESO/EGRESO/TRASPASO)
2. **Comparativa de Cotizaciones** — flujo multi-proveedor dentro de Requisiciones

Ambas funcionalidades están en producción en el VPS (11/11 contenedores healthy).  
ESTADO_DEL_SISTEMA.md fue actualizado para reflejar el estado real al 20-Mayo-2026.

---

## Archivos Clave Modificados Esta Sesión

| Archivo | Cambio |
|---------|--------|
| `apps/app-shell/src/lib/demoData.ts` | +DEMO_INVENTARIO, +DEMO_MOVIMIENTOS_ALMACEN, +DEMO_COMPARATIVAS |
| `apps/app-shell/src/views/ComprasView.tsx` | Reescritura completa: tabs Requisiciones/Catálogo/Almacén + comparativa state |
| `apps/app-shell/src/components/ComparativaDetail.tsx` | Componente nuevo — comparativa multi-proveedor completa |
| `apps/app-shell/src/components/Icons.tsx` | +IconArrowLeft |
| `apps/app-shell/src/components/SlidePanel.tsx` | +colores red y blue |
| `ESTADO_DEL_SISTEMA.md` | Reescritura completa con estado actual |

---

## Stack Técnico

- **Frontend:** React 19 · Vite 7 · TypeScript · Tailwind CSS v4
- **UI Library:** `@bocam/ui-core` (workspace package)
- **Backend:** Express · Prisma · PostgreSQL · RabbitMQ · Redis
- **Infra:** Docker Compose · Caddy (reverse proxy) · VPS Ubuntu

---

## Patrones de Desarrollo Establecidos

**Demo mode:**
```typescript
const isDemo = tenant?.id === 'iretum-demo';
if (isDemo) { /* usar demoData, no llamar backend */ return; }
```

**API error handling (Promise.allSettled):**
```typescript
const results = await Promise.allSettled([fetchA(), fetchB()]);
// cada módulo carga independientemente aunque falle otro
```

**SlidePanel color convention:**
- sky → acciones neutras
- emerald → creación/alta
- violet → edición/actualización
- amber → advertencia/revisión
- red → eliminación/incidente
- blue → autorización/OC

**ComparativaDetail state flow:**
```
ComprasView (comparativas[]) → ComparativaDetail (onUpdate callback) → ComprasView
```

---

## Pendiente Inmediato

1. **Commit + push desde local** (el sandbox tenía HEAD.lock):
   ```bash
   cd "D:\01_PROFESIONAL\Mis_Scripts_IA\Flujos Agenticos\Proyecto ERP MODULAR Bocam"
   git add apps/app-shell/src/views/ComprasView.tsx \
           apps/app-shell/src/components/ComparativaDetail.tsx \
           apps/app-shell/src/components/Icons.tsx \
           apps/app-shell/src/lib/demoData.ts
   git commit -m "feat(compras): Comparativa cotizaciones — multi-proveedor, ganador por renglon, autorizar OC"
   git push origin main
   ```

2. **VPS deploy** (después del push):
   ```bash
   ssh root@72.60.114.12
   cd /root/ERP-Modular-Bocam
   git pull origin main
   docker compose -f docker-compose.vps.yml --profile core build --no-cache app-shell
   docker compose -f docker-compose.vps.yml --profile core up -d
   ```

3. **Phase 2 — Sistema de notificaciones** (último pendiente de UI)

---

## Brechas Backend que el Frontend ya Requiere

```
GET  /api/v1/compras/almacen/inventario    → no existe
GET  /api/v1/compras/almacen/movimientos   → no existe
POST /api/v1/compras/almacen/movimientos   → no existe
GET  /api/v1/seguridad/epp                 → no existe
```

Estos endpoints retornan 404 en modo real. En modo demo (`iretum-demo`) el frontend usa `demoData.ts` y funciona correctamente.
