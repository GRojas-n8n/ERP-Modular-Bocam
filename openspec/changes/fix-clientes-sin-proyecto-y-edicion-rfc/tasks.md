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

## 4. Verificación — PENDIENTE

- [ ] 4.1 Ejecutar `cliente-sin-proyecto-y-edicion.integration.test.ts` con Postgres + Redis y confirmar en verde
- [ ] 4.2 Ejecutar `editar-proveedor.integration.test.ts` (`npm run test:integration:editar-proveedor` en `apps/compras`)
- [ ] 4.3 Añadir el test de Ventas a los scripts/CI para que se ejecute
- [ ] 4.4 Prueba manual en producción: alta de proyecto sin proyecto activo, listado y edición de cliente

## 5. Investigación abierta — PENDIENTE

- [ ] 5.1 Confirmar la causa de la salida de sesión al guardar un proyecto (logs `bocam-vps-auth`, `JWT_MAX_SESSION_HOURS`, expiración del access token)
