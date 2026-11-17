## 1. Prueba primero

- [x] 1.1 `test/integration/oc-creada-proveedor-nombre.integration.test.ts`: cuadro con dos proveedores ganadores; `convertir-oc` publica dos `compras.oc_creada`, cada uno con la razón social de su proveedor y los campos existentes intactos. Falla en `main` (el campo no existe).

## 2. Implementar

- [x] 2.1 `include` de la razón social del proveedor al crear la OC.
- [x] 2.2 `proveedor_nombre` en el payload de `compras.oc_creada`.
- [x] 2.3 Script `test:integration:oc-creada-proveedor-nombre` y paso en `backend-e2e.yml`.

## 3. Verificar

- [x] 3.1 `tsc` de Compras sin errores nuevos respecto a `main`.
- [ ] 3.2 CI en verde.
