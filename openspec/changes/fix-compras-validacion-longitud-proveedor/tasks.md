## 1. Reproducir el bug (TDD: test primero)

- [x] 1.1 Test que reproduce el bug reportado: `POST /api/v1/compras/proveedores` con `rfc_tax_id` de más de 20 caracteres (y `razon_social` válida) responde `500` con el mensaje crudo de Prisma. Confirmar rojo. **Nota:** fix y test se escribieron juntos (no en rojo-primero) porque es una copia directa y ya probada del patrón de `fix-personal-validacion-longitud-empleado` — el test corrió en verde contra el fix desde la primera ejecución. Ver `apps/compras/test/integration/validacion-longitud-proveedor.integration.test.ts`, `testAltaConRfcDemasiadoLargo`.
- [x] 1.2 Test equivalente para `PUT /api/v1/compras/proveedores/:id` con `razon_social` de más de 255 caracteres sobre un proveedor existente. `testEdicionConRazonSocialDemasiadoLarga`.
- [x] 1.3 Test equivalente para `POST /api/v1/compras/proveedores/importar-lote`: una fila con `razon_social` de más de 255 caracteres dentro de un lote con otras filas válidas. `testImportacionConUnaFilaRazonSocialDemasiadoLarga` — confirma que el lote no aborta completo, solo reporta la fila inválida.

## 2. Fundamentos (copiados del patrón de `apps/auth`/`apps/personal`)

- [x] 2.1 Agregada dependencia `zod` a `apps/compras/package.json` (`^4.4.3`, misma versión que auth/personal) e instalada.
- [x] 2.2 Copiado `apps/personal/src/validation/parse-or-respond.ts` a `apps/compras/src/validation/parse-or-respond.ts`. Decisión: compras **ya tenía** `createApiError`/`createApiResponse` idénticos a los de auth/personal en `apps/compras/src/types.ts` (mismo shape `{ success, error: { code, message, details }, meta }`) — solo los endpoints de proveedores no los usaban (usaban `{ success: false, message }` ad-hoc). Se adoptó `createApiError` para la respuesta de validación (400 `VALIDATION_ERROR` con `details`), consistente con el resto del servicio; no fue necesario adaptar el formato.

## 3. Schema

- [x] 3.1 `apps/compras/src/validation/schemas/proveedor.schema.ts`: `longitudProveedorSchema` con todos los campos opcionales, cubriendo `rfc_tax_id` ≤20, `razon_social` ≤255, `email_contacto` ≤100, `telefono` ≤20, `ciudad` ≤100 — límites tomados de `apps/compras/prisma/schema.prisma`.
- [x] 3.2 Confirmado: el chequeo de obligatorios existente (`rfc_tax_id`/`razon_social` en POST) y el de `calificacion_desempeno` 0.00–5.00 se mantienen intactos; la validación de longitud se agregó como chequeo adicional después de ellos.
- [x] 3.3 Mismo schema reutilizado en `importar-lote` vía `safeParse` directo dentro del bucle existente de validación por fila (mismo mecanismo que "RFC duplicado dentro del archivo"/`calificacion_desempeno` inválida).

## 4. Integración en los 3 endpoints

- [x] 4.1 `POST /api/v1/compras/proveedores`: `parseOrRespond(longitudProveedorSchema, req.body, res)` después del chequeo de obligatorios y de `calificacion_desempeno` existentes.
- [x] 4.2 `PUT /api/v1/compras/proveedores/:id`: mismo `parseOrRespond`, después de la validación de `calificacion_desempeno` existente.
- [x] 4.3 `POST /api/v1/compras/proveedores/importar-lote`: `longitudProveedorSchema.safeParse(registro)` dentro del bucle existente, agregando a `errores` en vez de responder 400 para todo el request.
- [x] 4.4 Los tres catch de error inesperado dejan de responder `error.message` crudo — mensaje genérico por endpoint. El PUT conserva el manejo especial ya existente de 404 (`Proveedor no encontrado.`, vía `status === 500 ? generico : error.message`); el POST conserva el 409 de `P2002` (RFC duplicado) sin tocar.
- [x] 4.5 Tests 1.1-1.3 en verde (ver salida de `npm run test:integration:validacion-longitud-proveedor` — 4/4 ok).

## 5. Frontend

- [x] 5.1 `maxLength` en los inputs de RFC (20), razón social (255), email (100), teléfono (20) y ciudad (100) en `ComprasView.tsx`.
- [x] 5.2 El formulario de alta y edición de proveedor es el mismo componente (`editingProveedor ? PUT : POST` sobre el mismo modal) — un solo cambio cubre ambos casos, sin duplicación.

## 6. Verificación

- [x] 6.1 Suite relevante de `apps/compras` corrida en verde: los 4 tests nuevos (`test:integration:validacion-longitud-proveedor`) + `proveedores-importar-lote` (4/4) + `archivar-proveedores` (6/6) — sin regresiones. No se encontraron otras suites que llamen directamente a `POST`/`PUT /proveedores`.
- [x] 6.2 `npx tsc --noEmit` en `apps/compras` y `apps/app-shell` — ambos limpios.
- [x] 6.3 Confirmado por `testAltaConCamposValidosSigueFuncionando` (201 con campos válidos) y por la suite de regresión completa (importar-lote, archivar/activar) — sin regresión en el caso normal.

## 7. Deploy y cierre

- [ ] 7.1 Desplegar vía CI (push a `main` tras PR aprobado).
- [ ] 7.2 Verificar en `iretum.com` que el alta/edición de proveedor con un campo largo (p. ej. RFC) ya no produce el 500 crudo, y que un alta normal sigue funcionando.
- [ ] 7.3 `openspec archive fix-compras-validacion-longitud-proveedor` tras verificación en producción.
