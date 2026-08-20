## Why

Ocho rutas `GET` de Finanzas no tienen control de rol de ningún tipo. La más
expuesta es `GET /dashboard`: la llama la pantalla de inicio, que no filtra por
rol, así que hoy **cualquier usuario autenticado con acceso al proyecto ve el
resumen presupuestal** — autorizado, ejercido, comprometido y pagos vencidos —
en cuanto inicia sesión. Un almacenista o un capturista de calidad lo ven igual
que el director.

El análisis completo de consumidores está en `design.md`. Resumen: los ocho
tienen consumidores con roles heterogéneos (Compras llama dos por
backend-to-backend con el JWT del comprador; `ControlPresupuestalTabla` se monta
en Gerencia Técnica y Control de Obra; el asistente y Gerencia Técnica consumen
otras dos), así que un conjunto único para todas las rompería en cadena.

## What Changes

- Las ocho lecturas SHALL exigir rol, cada una con el conjunto derivado de sus
  consumidores reales (tabla en `design.md`). Ninguna propuesta estrecha un
  camino existente: cada conjunto es la unión de los roles que hoy llegan, más
  `finanzas`/`admin`/`director` como base de lectura del módulo.
- `DashboardView` SHALL ocultar la tarjeta financiera para los roles sin acceso
  en vez de pintarla en estado de error. Hoy el 403 se renderiza como fallo, que
  es el mensaje equivocado: no falló nada, no le corresponde verlo.
- Sin cambios de comportamiento para los consumidores legítimos.

## Out of scope

- Los alias huérfanos `technical` y `director` (no asignables desde el alta de
  usuarios) se conservan en los conjuntos por compatibilidad; resolverlos
  corresponde al change de unificación de roles.
- `asistente/src/routes/alertas-predictivas.ts` llama a
  `${FINANZAS_URL}/capitulos-gasto`, ruta inexistente en Finanzas. Falla en
  silencio dentro de un `Promise.allSettled`. Se documenta en `design.md`;
  corregirlo es un change aparte porque toca el asistente, no Finanzas.
- Mover `GET /movimientos` a una proyección vía event bus para que Gerencia
  Técnica y Control de Obra dejen de leer Finanzas desde el navegador — es lo que
  pide la regla de dashboards del CLAUDE.md, pero es un rediseño, no un fix.

## Capabilities

### Modified Capabilities
- `finanzas-control-de-acceso`: extiende la política de autorización por rol de
  las mutaciones de la saga (ver `rbac-finanzas-saga-fondos`) a las rutas de
  lectura del módulo.
