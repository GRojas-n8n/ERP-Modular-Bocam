## Why

Hallazgo H2 de la certificación M11 (19 nov 2026). `TenantContext` fijaba como proyecto activo `projects[0]` al
recargar la página y al iniciar sesión, sin mirar el `proyecto_id` del JWT. El JWT conserva el último proyecto elegido
con `switch-project`, así que después de una recarga la pantalla mostraba una obra y el servidor operaba en otra. En la
prueba, la confirmación del egreso mostró una obra real aunque el pago se registró en PRUEBA-M11. Las vistas que envían
`currentProjectId` en el cuerpo o en la URL pueden cruzar proyectos.

## What Changes

- `resolverProyectoActivo(token, proyectos)` en `TenantContext`:
  - si el `proyecto_id` del JWT está en la lista del usuario, ese es el proyecto activo;
  - si no (proyecto archivado, acceso retirado, token sin proyecto o ilegible), toma el primero de la lista y llama a
    `switch-project` para alinear el JWT; si el switch falla, conserva el del token.
- Se usa al recargar (`checkExistingSession`) y al iniciar sesión (`login`).
- `proyectoDelToken(token)`: lee el payload del JWT sin verificar firma (la firma la valida el servidor; aquí solo
  se elige qué proyecto mostrar).
- Pruebas `TenantContext.proyecto-activo-recarga.test.tsx`.

## Impact

- `apps/app-shell` únicamente. Sin cambio en el backend ni en el contrato de `/auth/me` o `/auth/switch-project`.
