## 1. Prueba primero
- [x] 1.1 `TenantContext.proyecto-activo-recarga.test.tsx`: recarga con proyecto del JWT en la lista; proyecto fuera de la lista; token ilegible; login con el proyecto del JWT en segundo lugar. Fallan en `main`.
## 2. Implementar
- [x] 2.1 `proyectoDelToken` y `resolverProyectoActivo` en `TenantContext`.
- [x] 2.2 Usarlo en `checkExistingSession` y en `login`.
## 3. Verificar
- [x] 3.1 `vitest` y `tsc` de app-shell. La única falla (`help/registry.test.ts`) ya falla en `main`.
- [ ] 3.2 Producción: cambiar a PRUEBA-M11, recargar y confirmar que el selector y la confirmación del egreso muestran PRUEBA-M11.
