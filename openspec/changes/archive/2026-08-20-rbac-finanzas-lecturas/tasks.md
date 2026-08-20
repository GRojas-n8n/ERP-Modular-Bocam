## 1. Reproducir

- [x] 1.1 Casos en `apps/finanzas/test/e2e/seguridad.e2e.test.ts`: roles `seguridad_hse`, `calidad` y `warehouse` deben recibir 403 en las lecturas. Fallaron antes del fix.
- [x] 1.2 Casos de no-regresión por cada consumidor cruzado: `procurement` en `/suficiencia` y `/presupuestos/por-concepto`, `gerencia_tecnica`/`control_obra`/`control_proyectos` en `/movimientos`, `superintendent`/`finanzas` en `/dashboard`.

## 2. Cerrar

- [x] 2.1 `requireRoles(...)` en las 8 lecturas, con los conjuntos de `design.md`. Cada conjunto lleva comentario cuando incluye un rol que no es obvio.
- [x] 2.2 `DashboardView` oculta las dos tarjetas financieras y el bloque de Consumo Presupuestal para roles sin acceso, y expande Actividad Reciente a todo el ancho. Antes los totales caían a `|| 0` y el usuario veía un presupuesto de $0, que se lee como "este proyecto no tiene presupuesto" — peor que no mostrarlo.

## 3. Verificación

- [x] 3.1 `test:e2e:seguridad` — 12/12 en verde.
- [x] 3.2 Suite de `apps/app-shell` — 237/237 en verde.
- [x] 3.3 `npx tsc --noEmit` en ambos paquetes — limpio.
- [ ] 3.4 Suite de integración de `compras` en CI con Postgres: `convertir-oc` sigue resolviendo suficiencia.
- [ ] 3.5 Verificar en navegador: control presupuestal por partida sigue cargando en Gerencia Técnica y Control de Obra; la home de un rol operativo ya no muestra el resumen presupuestal.

## 4. Corrección al análisis

`GET /reportes/pagado-por-concepto` **no estaba abierta**: ya exigía la cabecera
`X-Internal-Service: gerencia-tecnica` vía un `requireInternalService` local del
módulo — un tercer mecanismo de autorización que ni el conteo de `requireRoles`
ni el barrido de comprobaciones en handler contemplaban. Solo se usa en dos
lugares del repo (`finanzas` y `compras`), ambos para el mismo consumidor b2b.

Se le añadió `requireRoles` de todos modos como defensa en profundidad: una
cabecera HTTP es falsificable por sí sola, así que el rol es la garantía real. El
test correspondiente verifica los tres caminos — sin cabecera, con cabecera pero
rol no autorizado, y el consumo legítimo de Gerencia Técnica.

Con esto, las lecturas realmente abiertas eran **7**, no 8.
