## 1. Prueba primero
- [x] 1.1 `test/integration/compras.oc-creada.integration.test.ts`: el evento trae `proveedor_nombre` y el asiento debe tenerlo como beneficiario. Falla en `main`.
## 2. Implementar
- [x] 2.1 Beneficiario con `proveedor_nombre`, con respaldo en `proveedor_id`.
- [x] 2.2 Campos aditivos en `OrdenCompraCreadaPayload`.
- [x] 2.3 Script de rellenado con simulación.
## 3. Verificar
- [x] 3.1 `tsc` de Contabilidad sin errores nuevos (los 8 restantes vienen del cliente Prisma de Finanzas versionado y ya están en `main`).
- [ ] 3.2 CI en verde.
- [ ] 3.3 Producción: simulación del script (deben salir las 2 pólizas de PRUEBA-M11), aplicar y verificar.
