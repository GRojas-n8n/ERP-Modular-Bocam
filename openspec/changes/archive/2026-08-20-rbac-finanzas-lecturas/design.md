# Análisis: consumidores reales de las lecturas abiertas de Finanzas

Ocho rutas `GET` de `apps/finanzas/src/main.ts` no tienen control de rol de
ningún tipo — ni `requireRoles` ni comprobación en el handler. Cerrarlas a ciegas
vacía pantallas en tres módulos, así que primero se levantó el mapa completo de
quién las consume y con qué roles llega.

## Método

Para cada ruta se buscaron los tres tipos de consumidor:

1. **Frontend directo** — llamadas `api.get('/api/v1/finanzas/...')` en
   `apps/app-shell/src`, y qué roles ve el módulo del sidebar que las contiene
   (`components/Layout.tsx`).
2. **Frontend indirecto** — componentes compartidos que llaman a Finanzas y se
   montan dentro de vistas de otros módulos.
3. **Backend-to-backend** — `axios.get(FINANZAS_URL/...)` desde otro servicio.
   Todos reenvían el JWT del usuario original, así que los roles que llegan a
   Finanzas son los del **endpoint llamador**, no los del servicio.

## Mapa de consumidores

| Lectura | Consumidor | Roles que llegan hoy |
|---|---|---|
| `GET /suficiencia` | b2b ← `POST /compras/comparativas/:id/convertir-oc` | `admin`, `superintendent`, `procurement` |
| `GET /presupuestos/por-concepto/:conceptoId` | b2b ← `POST /compras/comparativas/:id/convertir-oc` | `admin`, `superintendent`, `procurement` |
| `GET /presupuestos` | `FinanzasView` | `finanzas` |
| `GET /presupuestos/:id` | ningún consumidor detectado | — |
| `GET /movimientos` | `ControlPresupuestalTabla`, montado en `InsumosView` y `ControlObraView`; además `api.getMovimientos()` | `gerencia_tecnica` (Insumos), `control_obra`, `control_proyectos`, `director` (Control de Obra) |
| `GET /pagos` | `FinanzasView`, `api.getPagos()` | `finanzas` |
| `GET /dashboard` | `DashboardView` y `useDashboardData` (la home, `roles: []` → **todos**); b2b ← `/asistente/resumen-ejecutivo` y `/asistente/chat`; `asistente/src/tools/finanzas.ts` | **cualquier rol autenticado** |
| `GET /reportes/pagado-por-concepto` | b2b ← `GET /gerencia-tecnica/dashboard` | `superintendent`, `admin`, `technical`, `gerencia_tecnica` |

## Hallazgos del mapa

**1. `GET /dashboard` es el único caso realmente delicado.** Lo llama la pantalla
de inicio, que no filtra por rol (`roles: []` en el sidebar), así que hoy
**cualquier usuario autenticado ve el resumen presupuestal del proyecto** — total
autorizado, ejercido, comprometido, porcentaje ejercido y pagos vencidos — en
cuanto entra al sistema. Un almacenista, un empleado de HSE o un capturista de
calidad lo ven al iniciar sesión.

La buena noticia: **cerrarlo no rompe la home.** Tanto `DashboardView` como
`useDashboardData` lanzan las peticiones con `Promise.allSettled` y tratan el
rechazo explícitamente (`if (r6.status === 'fulfilled') ... else setFinanzas({
error: true })`). Un 403 deja la tarjeta financiera vacía, no tumba la página.

Queda un detalle de UX: hoy el rechazo pinta la tarjeta en estado de *error*, que
para un rol sin permiso es un mensaje equivocado — no falló nada, simplemente no
le corresponde verlo. La tarjeta debería ocultarse por rol en el cliente, no
mostrarse rota.

**2. Los dos consumos de Compras son el caso inverso: no admiten estrecharse.**
`/suficiencia` y `/presupuestos/por-concepto/:conceptoId` se llaman dentro de
`convertir-oc` reenviando el JWT del comprador. Cualquier conjunto que no
incluya `procurement` y `superintendent` rompe la emisión de órdenes de compra
— el mismo razonamiento ya documentado en `rbac-finanzas-saga-fondos`.

**3. `GET /movimientos` es el más transversal.** Lo consume
`ControlPresupuestalTabla`, un componente compartido que se monta tanto en
Gerencia Técnica como en Control de Obra. Su conjunto debe cubrir los cuatro
roles de esas dos vistas o el control presupuestal por partida deja de cargar en
uno de los dos módulos.

**4. `GET /presupuestos/:id` no tiene ningún consumidor.** Ni frontend ni
backend. Se cierra con el conjunto estrecho sin riesgo, o se evalúa retirarlo.

**5. Dos alias huérfanos aparecen en el camino.** `GET /gerencia-tecnica/dashboard`
admite el rol `technical`, que no existe en el selector de alta de usuarios ni en
ningún otro servicio; y `director` aparece en varios conjuntos de Finanzas pero
tampoco es asignable desde la UI. Ambos son casos de la deuda de alias descrita
en P0·5 y P0·6 del documento de arranque, y conviene resolverlos en ese change,
no aquí.

**6. Un consumidor apunta a un endpoint inexistente.**
`asistente/src/routes/alertas-predictivas.ts` llama a
`${FINANZAS_URL}/capitulos-gasto`, ruta que **no existe** en
`apps/finanzas/src/main.ts`. La llamada va dentro de un `Promise.allSettled`, así
que falla en silencio y la alerta predictiva simplemente sale sin ese dato. No es
un problema de control de acceso, pero se anota aquí porque salió del mismo
barrido y nadie lo había visto.

## Conjuntos propuestos

Regla aplicada: cada ruta recibe **la unión de los roles de sus consumidores
reales**, más `finanzas`, `admin` y `director` como conjunto base de lectura del
módulo. Ninguna propuesta estrecha un camino existente.

| Lectura | Conjunto propuesto |
|---|---|
| `GET /suficiencia` | `finanzas`, `admin`, `director`, `superintendent`, `procurement` |
| `GET /presupuestos/por-concepto/:conceptoId` | `finanzas`, `admin`, `director`, `superintendent`, `procurement` |
| `GET /presupuestos` | `finanzas`, `admin`, `director`, `superintendent` |
| `GET /presupuestos/:id` | `finanzas`, `admin`, `director`, `superintendent` |
| `GET /movimientos` | `finanzas`, `admin`, `director`, `superintendent`, `gerencia_tecnica`, `control_obra`, `control_proyectos` |
| `GET /pagos` | `finanzas`, `admin`, `director` |
| `GET /dashboard` | `finanzas`, `admin`, `director`, `superintendent` |
| `GET /reportes/pagado-por-concepto` | `finanzas`, `admin`, `director`, `superintendent`, `gerencia_tecnica`, `technical` |

## Riesgo residual

El conjunto de `GET /movimientos` sigue siendo ancho — siete roles — porque el
componente compartido lo obliga. Si más adelante se quiere estrechar, el camino
no es recortar roles sino que Gerencia Técnica y Control de Proyectos proyecten
el dato que necesitan vía el event bus en vez de leer Finanzas desde el
navegador, que es además lo que pide la regla de dashboards del CLAUDE.md.
