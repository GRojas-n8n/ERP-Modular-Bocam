# Active Context — Iretum ERP (BocamOS)

**Fecha:** 2026-05-27  
**Producto:** Iretum ERP — SaaS Multi-Tenant para constructoras  
**VPS:** `72.60.114.12` | Proyecto: `/root/ERP-Modular-Bocam`  
**GitHub:** `https://github.com/GRojas-n8n/ERP-Modular-Bocam`

---

## Estado Actual

**Phase 2 UI + Phase 3 RESIDENCIA + Aprobación Dos Etapas — en producción** (https://iretum.com)  
**Dos ciclos SDD completos:** `oc-error-finanzas-alert` + `cuadro-comparativo-aprobacion-dos-etapas` (commit `eaf5194`)

---

## Semáforo MVP — Condiciones Bloqueantes para Datos Reales

| # | Condición | Estado |
|---|---|---|
| 2 | Alerta automática OCs en `ERROR_FINANZAS` | ✅ RESUELTO — ciclo SDD `oc-error-finanzas-alert` completo |
| 1 | Motor de cálculo IMSS/ISR/retenciones en Personal | ⏳ Pendiente — próximo ciclo SDD |
| 3 | Audit log + rate limiting en `POST /master/tenants` | ⏳ Pendiente |

---

## Deuda Técnica Activa

~~**DT-001**~~ ✅ Resuelta 2026-05-26 — migración `20260526215207_add_alerta_oc_error` registrada en `_prisma_migrations` del VPS.

---

## Foco Siguiente

**Adopción SDD en módulos restantes.** Orden sugerido por riesgo:

1. **Personal — Motor IMSS/ISR** (bloqueante fiscal, 0% tests — añadir tests antes de tocar)
2. **Auth — Hardening MASTER_SECRET** (audit log + rate limiting)
3. **Gerencia Técnica — Versioning de presupuestos** (integridad de reportes)
4. **Seguridad — EventBus no-silencioso** (integridad de eventos HSE)

---

## Metodología SDD Activa

Artefactos por ciclo en `docs/openspec/<nombre-ciclo>/`:
- `.openspec.yaml` — estado del ciclo (draft → active → archived)
- `design.md` — diseño técnico
- `proposal.md` — propuesta inicial
- `spec-delta.md` — decisiones técnicas documentadas (D1–Dn)
- `ARCHIVE.md` — inventario completo al cerrar el ciclo
- `specs/` — specs formales

---

## Sesión 2026-05-27 — Archivos Modificados (cuadro-comparativo-aprobacion-dos-etapas)

| Archivo | Cambio |
|---------|--------|
| `apps/compras/prisma/schema.prisma` | +campos evaluacion en CuadroComparativo + ComparativaDetalle; default estado → BORRADOR |
| `apps/compras/prisma/migrations/20260526194511_*/migration.sql` | NUEVO — migración dos etapas (ABIERTO→BORRADOR, columnas evaluacion) |
| `apps/compras/src/main.ts` | +6 endpoints nuevos, +2 bandejas, guard convertir-oc, OC filtrada por aprobacion_gt |
| `apps/compras/src/generated/prisma/` | Regenerado post-migrate |
| `apps/compras/test/integration/cuadro-comparativo-dos-etapas.integration.test.ts` | NUEVO — 5 tests integración |
| `apps/app-shell/src/components/ComparativaDetail.tsx` | Reescrito — badge estado, botones condicionales por rol, formularios eval técnica + GT |
| `apps/app-shell/src/views/ComprasView.tsx` | +bandejas pendientes-eval / pendientes-gt, tabs condicionales por rol, demo mode filtrado |
| `apps/app-shell/src/lib/demoData.ts` | DEMO_COMPARATIVAS actualizado — 5 cuadros con todos los estados del flujo |

## Sesión 2026-05-26 — Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `CLAUDE.md` | +Stack con rationale, +@bocam/ui-core verificado, +RLS §10, +Integraciones externas §13, +Reglas negocio iretum.com §17, +Código intocable §18, +Deuda técnica §19, puertos corregidos |
| `docs/checkpoints/2026-05-26-Fase0-Diagnostico-Brownfield.md` | NUEVO — Diagnóstico completo por módulo, cobertura tests, top-5 riesgos, semáforo MVP |
| `apps/compras/` | Ciclo SDD `oc-error-finanzas-alert` — schema `AlertaOcError`, endpoints, tests 5/5, migración VPS |

---

## Stack Técnico

- **Frontend:** React 19 · Vite 7 · TypeScript · Tailwind CSS v4
- **UI Library:** `@bocam/ui-core` (workspace package — ver CLAUDE.md §3 para API completa)
- **Backend:** Express · Prisma · PostgreSQL (RLS) · RabbitMQ · Redis
- **Infra:** Docker Compose (`--profile core`) · Caddy (reverse proxy) · VPS Ubuntu (Hostinger)

---

## Patrones de Desarrollo Establecidos

**Demo mode:**
```typescript
const isDemo = tenant?.id === 'iretum-demo';
if (isDemo) { /* usar demoData, no llamar backend */ return; }
```

**verbatimModuleSyntax — CRÍTICO:**
```typescript
// ✅ Correcto
import { useNotification } from '../context/NotificationContext';
import type { Toast, ToastType } from '../context/NotificationContext';
// ❌ Error TS1484
import { useNotification, Toast, ToastType } from '../context/NotificationContext';
```

**Toast pattern:**
```typescript
const { notify } = useNotification();
notify({ type: 'success', title: 'Título', message: 'Detalle opcional', duration: 4500 });
notify({ type: 'error',   title: 'Error',  message: '...', duration: 6000 });
```

**SlidePanel / SubmitButton** — componentes locales en `apps/app-shell/src/components/SlidePanel.tsx`:
- `isOpen` (no `open`), `accentColor` (no `color`), `SubmitButton` usa `label` (no `children`)
- Colores: `sky` neutro · `emerald` creación · `violet` edición · `amber` advertencia · `red` eliminación · `blue` autorización · `indigo` Residencia

**Docker build diagnóstico:**
```bash
docker compose build 2>&1 | grep "error TS"
# Bundle hash idéntico = build falló silenciosamente
```

**TypeScript check sin Vite (sandbox Linux):**
```bash
npx tsc -b apps/app-shell/tsconfig.json   # exit 0 = sin errores TS
```

---

## Infra VPS

- **Acceso SSH:** `ssh -i bocam_vps_key root@72.60.114.12`
- **Key local:** `D:\...\Proyecto ERP MODULAR Bocam\bocam_vps_key`
- **Acceso alternativo:** Hostinger browser console (VNC web)
- **Dockerfile frontend:** `docker/Dockerfile.app-shell` (NO `apps/app-shell/Dockerfile`)
- **Compose file VPS:** `docker-compose.vps.yml --profile core`
