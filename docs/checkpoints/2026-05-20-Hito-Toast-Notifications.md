# Hito: Sistema de Notificaciones Toast Global

**Fecha:** 2026-05-20  
**Sesión:** Parte 2 (continuación de Almacén + Comparativa)  
**Resultado:** Phase 2 UI completada al 100% · Deploy exitoso en producción

---

## Resumen

Implementación del sistema de notificaciones toast visual global para el ERP. Cubre la comunicación de eventos inter-módulo hacia el usuario (requisiciones, movimientos de almacén, alertas de stock, órdenes de compra generadas).

---

## Arquitectura

```
NotificationProvider (App.tsx, fuera de TenantProvider)
    └── NotificationContext (toasts[], notify(), dismiss())
         └── ToastContainer (fixed top-right, z-9999)
              └── ToastItem × N (slide-in / fade-out / progress bar)
```

### Decisiones de diseño

| Decisión | Razón |
|----------|-------|
| Provider fuera de TenantProvider | Los toasts deben funcionar durante login y para errores globales |
| Máximo 4 toasts simultáneos | `prev.slice(-3)` antes de agregar el nuevo |
| `duration - 400ms` para iniciar fade | Animación de salida visible antes del dismiss real |
| `@keyframes shrink` CSS inline | Sin dependencias externas, animación declarativa |
| `pointer-events-none` en contenedor | Los toasts no bloquean clicks en la UI subyacente |
| `pointer-events-auto` en cada item | Permite cerrar individualmente |

---

## Archivos Creados / Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `apps/app-shell/src/context/NotificationContext.tsx` | NUEVO | Context provider global |
| `apps/app-shell/src/components/ToastContainer.tsx` | NUEVO | UI container + ToastItem |
| `apps/app-shell/src/components/Icons.tsx` | MODIFICADO | +IconInfo, +IconBell, +IconAlertTriangle |
| `apps/app-shell/src/App.tsx` | MODIFICADO | Integración NotificationProvider + ToastContainer |
| `apps/app-shell/src/views/ComprasView.tsx` | MODIFICADO | Disparadores de toasts |

---

## API Pública

```typescript
// Importar
import { useNotification } from '../context/NotificationContext';
import type { Toast, ToastType } from '../context/NotificationContext'; // verbatimModuleSyntax!

// Usar
const { notify, dismiss } = useNotification();

notify({
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message?: string,    // línea secundaria opcional
  duration?: number,   // ms — default 4500
});
```

### Estilos por tipo

| Tipo | Barra | Icono | Uso |
|------|-------|-------|-----|
| `success` | emerald-500 | IconCheckCircle2 | Operación completada |
| `error` | red-500 | IconAlertCircle | Error crítico o stock agotado |
| `warning` | amber-500 | IconAlertTriangle | Stock bajo mínimo |
| `info` | sky-500 | IconInfo | Información general |

---

## Disparadores Implementados

### ComprasView — Requisiciones
```typescript
notify({
  type: 'success',
  title: 'Requisición creada',
  message: `${folio} · ${n} insumos · Prioridad ${prioridad}`,
});
```

### ComprasView — Movimiento de Almacén
```typescript
// Éxito base
notify({ type: 'success', title: 'Ingreso/Egreso/Traspaso registrado', message: `${clave} · ${cant} ${unidad}` });

// Stock agotado (solo en EGRESO)
notify({ type: 'error', title: 'Stock agotado', message: `${clave} — sin existencias en almacén`, duration: 6000 });

// Stock bajo mínimo (solo en EGRESO)
notify({ type: 'warning', title: 'Stock bajo mínimo', message: `${clave} · ${newStock} ${unidad} (mín. ${stockMin})`, duration: 6000 });
```

### ComprasView — Comparativa / OC Autorizada
```typescript
notify({
  type: 'success',
  title: `${n} OC${n !== 1 ? 's' : ''} generada${n !== 1 ? 's' : ''}`,
  message: `Total comprometido: ${total.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`,
  duration: 6000,
});
```

---

## Errores Encontrados y Resueltos

### Error 1 — TS1484 verbatimModuleSyntax
```
error TS1484: 'Toast' is a type and must be imported using a type-only import
when 'verbatimModuleSyntax' is enabled.
```
**Fix:** Split del import en dos líneas:
```typescript
import { useNotification } from '../context/NotificationContext';
import type { Toast, ToastType } from '../context/NotificationContext';
```

### Error 2 — SSH "Permission denied" al VPS
**Contexto:** Password olvidado del root del VPS.  
**Fix:** Usar Hostinger browser console (VNC web) como terminal alternativa.  
**Pendiente:** Configurar key-based SSH auth para evitar recurrencia.

---

## Comportamiento de Animación

```
Mount → 16ms setTimeout → visible=true → translate-x-0 opacity-100 (slide-in)
             ↓
       (duration - 400ms) → leaving=true → translate-x-8 opacity-0 (fade-out)
             ↓
       dismiss(id) → filtra del array → componente desmontado
```

Progress bar:
```css
@keyframes shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
/* applied: animation: shrink ${duration}ms linear forwards */
```

---

## Estado Post-Deploy

- 11/11 contenedores healthy en `https://iretum.com`
- Phase 2 UI 100% completa
- Deploy via Hostinger browser console (sin SSH directo)
- Bundle nuevo con hash actualizado confirmado en producción
