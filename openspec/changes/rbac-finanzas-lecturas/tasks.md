## 1. Reproducir

- [ ] 1.1 Extender `apps/finanzas/test/e2e/seguridad.e2e.test.ts`: un token de rol `seguridad_hse` debe recibir 403 en `GET /dashboard`. Debe fallar antes del fix.
- [ ] 1.2 Añadir un caso por cada conjunto que no puede estrecharse, para blindar contra regresiones: `procurement` en `GET /suficiencia`, `gerencia_tecnica` y `control_obra` en `GET /movimientos`.

## 2. Cerrar

- [ ] 2.1 Aplicar `requireRoles(...)` a las ocho lecturas con los conjuntos de la tabla de `design.md`.
- [ ] 2.2 Ocultar la tarjeta financiera de `DashboardView` para roles sin acceso, en vez de mostrarla en estado de error.

## 3. Verificación

- [ ] 3.1 `test:e2e:seguridad` en verde.
- [ ] 3.2 Suite de integración de `compras` con Postgres levantado — `convertir-oc` sigue resolviendo suficiencia.
- [ ] 3.3 Verificar en navegador: control presupuestal por partida sigue cargando en Gerencia Técnica y en Control de Obra; la home de un rol no financiero ya no muestra el resumen presupuestal.
