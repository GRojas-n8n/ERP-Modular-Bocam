## 1. Ventas (backend) — implementado en #173

- [x] 1.1 Eximir `/clientes*` de `requireProjectAccess`/`requireActiveProject`
- [x] 1.2 Alta: normalizar RFC, validar longitudes, `409` en duplicado, `500` genérico
- [x] 1.3 `PUT /clientes/:id` (solo `admin`): validaciones, `404`, `409`

## 2. Compras (backend) — implementado en #173

- [x] 2.1 `PUT /proveedores/:id` acepta `rfc_tax_id` normalizado; `400` vacíos; `409` duplicado

## 3. App-shell — implementado en #173

- [x] 3.1 Ventas fuera de `projectScopedViews`; aviso por pestaña sin proyecto
- [x] 3.2 Botón y modal "Editar cliente" (admin) + `ventasApi.updateCliente`
- [x] 3.3 Errores `error.message` visibles (AdminView, VentasView, ComprasView)
- [x] 3.4 Proveedores: RFC editable; alta/edición solo `procurement`/`admin`

## 4. Smoke post-deploy obsoleto tras #173 (corrección)

- [x] 4.0.1 Helper `ventas-alcance.ts` con excepción exacta `GET /api/v1/ventas/clientes` (por `pathname`; sin prefijos amplios) + `ventas-alcance.unit.test.ts` (7 pruebas)
- [x] 4.0.2 Smoke: Ventas fuera de los módulos totalmente bloqueados; comprueba Clientes sin proyecto (pestaña visible, sin "Proyecto activo requerido", petición emitida); abre Cotizaciones y Facturas y exige el aviso; prohíbe cualquier otra petición project-scoped
- [x] 4.0.3 Pruebas herméticas: `VentasView.sin-proyecto.test.tsx` (3) y `App.ventas-sin-proyecto.test.tsx` (2)
- [x] 4.0.4 Pruebas de mutación locales: Ventas bloqueada en `App`, guard de Cotizaciones/Facturas neutralizado, aviso eliminado, Clientes bloqueado y exclusión amplia `/api/v1/ventas/` hacen fallar las pruebas
- [x] 4.0.5 Ejecución real del smoke tras el deploy de este PR (plan de validación en la descripción del PR)
  - Evidencia (2026-09-29): PR #177, merge commit `528021d`, workflow `Deploy Frontend al VPS` run `36642004793` (Build + Deploy en verde). Smoke Playwright contra producción: 2 passed — `login y dashboard cargan sin errores tras el deploy` y `sin proyecto activo, los módulos project-scoped quedan bloqueados sin consultar datos`.
- [ ] 4.0.6 Sincronizar los deltas con `openspec/specs/` y archivar el change cuando 4.x y 5.1 estén cerrados

## 4. Verificación — PENDIENTE

- [ ] 4.1 (No ejecutable en local: sin Docker/Postgres/Redis; requiere CI o un entorno con servicios) Ejecutar `cliente-sin-proyecto-y-edicion.integration.test.ts` con Postgres + Redis y confirmar en verde
- [ ] 4.2 Ejecutar `editar-proveedor.integration.test.ts` (`npm run test:integration:editar-proveedor` en `apps/compras`)
- [ ] 4.3 Añadir el test de Ventas a los scripts/CI para que se ejecute (`backend-e2e.yml` no genera ni empuja el schema de Ventas ni levanta Redis: requiere un change de CI aparte)
- [ ] 4.4 (REQUIERE PRODUCCIÓN, no autorizado en este PR) Prueba manual en producción: alta de proyecto sin proyecto activo, listado y edición de cliente

## 5. Investigación abierta — PENDIENTE

- [ ] 5.1 Confirmar la causa de la salida de sesión al guardar un proyecto (logs `bocam-vps-auth`, `JWT_MAX_SESSION_HOURS`, expiración del access token)
