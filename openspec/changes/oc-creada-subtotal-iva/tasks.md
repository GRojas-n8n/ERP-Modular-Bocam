## 1. Prueba primero
- [x] 1.1 `src/oc-eventos.test.ts`: subtotal e IVA presentes; OC sin ellos publica `null`. Fallan en `main`.
## 2. Implementar
- [x] 2.1 `subtotal` e `iva` en `OcCreadaPayload` y `buildOcCreadaPayload` (la ruta `convertir-oc` ya pasa la OC completa).
## 3. Verificar
- [x] 3.1 `test:unit:oc-eventos` 7/7 y `tsc` de Compras.
- [ ] 3.2 CI en verde.
