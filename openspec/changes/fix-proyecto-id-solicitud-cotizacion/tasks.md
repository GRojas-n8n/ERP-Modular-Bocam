## 1. Test que reproduce el bug

- [x] 1.1 Crear `apps/compras/src/solicitud-cotizacion-policy.test.ts` (patrón
      `node:test`, igual que `apps/auth/src/login-policy.test.ts`) con casos:
      requisición no encontrada / de otro tenant → error; `proyecto_id` de la
      requisición distinto al de la sesión del usuario → se usa el de la
      requisición; `proyecto_id` de sesión vacío → no afecta, se usa el de la
      requisición; `proyecto_id` de la requisición con formato UUID inválido →
      error explícito. Debe fallar contra el comportamiento actual (la función
      aún no existe).

## 2. Extraer la lógica a función pura + integrar en el endpoint

- [x] 2.1 Crear `apps/compras/src/solicitud-cotizacion-policy.ts` — función
      `resolveProyectoIdParaSolicitud(requisicion, tenantId)` que valida
      existencia/tenant y formato UUID, devolviendo el `proyecto_id` correcto
      o lanzando un error tipado que el handler traduce a 404/400.
- [x] 2.2 `apps/compras/src/main.ts` línea ~648-651: agregar `proyecto_id: true`
      al `select` del `findUnique` de la requisición.
- [x] 2.3 `apps/compras/src/main.ts` línea ~701-719: usar
      `resolveProyectoIdParaSolicitud(...)` en vez de `proyectoId` (de
      `securityContext`) al crear la `SolicitudCotizacion`.
      (Hallazgo adicional durante la implementación: la llamada a
      `enviarCorreosSolicitudCotizacion` también releía la requisición usando
      el `proyectoId` de sesión — mismo bug, mismo endpoint. Corregido usando
      `(data as any).proyecto_id` del registro ya creado.)

## 3. Verificación

- [x] 3.1 Ejecutar el test de 1.1 y confirmar que pasa. (5/5 OK)
- [x] 3.2 Confirmar que `apps/compras` sigue compilando (`tsc --noEmit`) sin
      errores de tipos. (limpio)
