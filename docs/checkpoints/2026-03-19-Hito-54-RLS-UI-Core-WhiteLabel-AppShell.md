# Checkpoint: Normalizacion RLS, White-Label y Primer Slice de UI Core

**Fecha:** 2026-03-19  
**Objetivo:** avanzar en cuatro frentes de alineacion con `AGENTS.md`: normalizar `createTenantContext()` sin `executeRawUnsafe`, limpiar branding fijo del shell, retirar CSS custom heredado y comenzar una migracion real a `@bocam/ui-core`.

---

## Cambios realizados

### 1. Normalizacion de wrappers RLS

Se sustituyo la inyeccion de contexto RLS basada en `executeRawUnsafe` por llamadas parametrizadas con `set_config(...)` en:

- [apps/finanzas/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/db.ts)
- [apps/compras/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/db.ts)
- [apps/control-obra/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/db.ts)
- [apps/contabilidad/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/contabilidad/src/db.ts)
- [apps/personal/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/db.ts)
- [apps/seguridad/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/db.ts)

Con esto, la capa de datos de los modulos operativos queda alineada con el patron seguro que ya usaba `auth`.

### 2. Primer paquete real de `@bocam/ui-core`

Se creo un primer slice utilizable del design system compartido en:

- [packages/ui-core/package.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/package.json)
- [packages/ui-core/tsconfig.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/tsconfig.json)
- [packages/ui-core/src/index.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/src/index.tsx)

El paquete ya exporta componentes base reutilizables:

- `Button`
- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`
- `BrandMark`
- `SectionBadge`
- `cn`

### 3. Integracion real del shell con `@bocam/ui-core`

El `app-shell` ya resuelve e importa el paquete por alias de modulo:

- [apps/app-shell/tsconfig.app.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/tsconfig.app.json)
- [apps/app-shell/vite.config.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/vite.config.ts)
- [apps/app-shell/package.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/package.json)

Y el paquete ya se consume de forma real en:

- [apps/app-shell/src/views/LoginView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/LoginView.tsx)
- [apps/app-shell/src/components/Layout.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/Layout.tsx)

### 4. Limpieza de branding fijo del shell

Se eliminaron referencias visibles de marca fija del shell y se sustituyeron por textos genericos o por datos del tenant:

- el login ya no presenta marca fija corporativa;
- el sidebar usa `tenant.name` y `tenant.logoUrl` a traves de `BrandMark`;
- se retiraron labels tipo `BOCAM ERP` y el footer corporativo fijo.

### 5. Reduccion de CSS custom

Se elimino el archivo heredado:

- [apps/app-shell/src/App.css](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/App.css)

Y se limpio [apps/app-shell/src/index.css](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/index.css) para dejar solo capa base de tokens/theme y eliminar estilos custom de scrollbar.

Tambien se retiraron restos legacy del cliente API:

- [apps/app-shell/src/lib/api.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/lib/api.ts)

---

## Validacion ejecutada

Pasaron:

- `npx tsc --noEmit -p packages/ui-core/tsconfig.json`
- `npx tsc --noEmit -p apps/app-shell/tsconfig.app.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`

Observaciones:

- `apps/personal` y `apps/seguridad` no quedaron en verde por deuda previa del repo: falta `generated/prisma` y ya traian errores de tipado no relacionados con esta normalizacion.
- `npm run build -w app-shell` no pudo cerrar por un bloqueo del entorno Vite/Windows: `spawn EPERM` al cargar `vite.config.ts`. El problema no fue de TypeScript ni de los imports nuevos.

---

## Resultado

Esta tanda deja resueltos tres objetivos completos y uno muy encaminado:

1. `createTenantContext()` ya quedo normalizado en los modulos tocados sin `executeRawUnsafe`.
2. El branding fijo visible del shell ya fue limpiado.
3. El CSS custom heredado del shell se redujo de forma importante y se elimino `App.css`.
4. La migracion a `@bocam/ui-core` ya comenzo de forma real y verificable, no solo preparatoria.

---

## Siguiente paso recomendado

Para cerrar este frente de manera todavia mas consistente:

1. extender `@bocam/ui-core` a formularios e inputs base del shell;
2. migrar una segunda vista operativa (`Dashboard` o `Compras`) al paquete compartido;
3. revisar `nginx.conf` del shell para retirar headers legacy `x-tenant-id` / `x-proyecto-id`;
4. resolver la deuda previa de `personal` y `seguridad` para dejar toda la capa RLS tipada en verde.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
