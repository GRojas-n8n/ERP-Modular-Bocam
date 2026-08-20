## Why

`apps/auth` exponía 18 rutas y ninguna era `logout`, `change-password` ni
recuperación. Dos consecuencias, ambas bloqueantes para abrir el piloto a
usuarios reales:

**Nadie podía cambiar su contraseña.** Todos los usuarios se dan de alta con la
misma contraseña de arranque (`Bocam2026!`, documentada en
`docs/ejercicios-prueba-produccion.md`). Sin autoservicio, o se queda compartida
por todo el equipo durante el piloto, o cada cambio pasa por un administrador
editando el usuario a mano. Con contraseña compartida, el registro de auditoría
—quién autorizó una orden de compra, quién ejecutó un pago— deja de significar
nada: cualquiera pudo entrar como cualquiera.

**«Cerrar sesión» no cerraba nada en el servidor.** `TenantContext.logout()`
borraba los tokens de `localStorage` y ya. El refresh token seguía vivo en la
tabla `refresh_tokens` hasta expirar, así que quien lo hubiera copiado antes
—de un equipo compartido en obra, por ejemplo— podía seguir emitiendo access
tokens con `POST /auth/refresh` mucho después de que el usuario creyera haber
salido. No había forma de expulsar una sesión abierta en un dispositivo que ya
no se tiene a mano.

El modelo `RefreshToken` ya tenía el campo `revoked`, y `POST /auth/refresh` ya
lo usa al rotar. Solo faltaba exponerlo.

## What Changes

- **`POST /api/v1/auth/logout`** — revoca el refresh token presentado. Sin
  `refresh_token` en el cuerpo, o con `todas: true`, revoca la cadena completa
  del usuario, que es también la vía para expulsar sesiones de un dispositivo
  perdido. Acotado por el `user_id` del JWT: no se puede revocar el token de
  otro usuario aunque se envíe su valor. Idempotente — cerrar una sesión ya
  cerrada responde 200, para que un cliente que reintenta no quede atrapado.
- **`POST /api/v1/auth/change-password`** — verifica la contraseña actual con
  `bcrypt.compare`, aplica la política y **revoca todas las sesiones del
  usuario, incluida la que hace la petición**. Si la razón del cambio es que
  alguien más conocía la contraseña, dejar sus sesiones vivas vacía el gesto.
  Rate limit de 5 por ventana: el endpoint verifica la contraseña actual, así
  que sin techo es un oráculo para sondearla.
- **Política de contraseñas** en `apps/auth/src/password-policy.ts`, siguiendo el
  patrón `*-policy.ts` del repo (`main.ts` tiene `app.listen` y conexiones a BD
  a nivel de módulo, no se puede importar desde un test unitario). Mínimo 12
  caracteres, distinta de la actual, y no puede ser la contraseña de arranque
  compartida. **No se exige composición** de mayúsculas, números ni símbolos:
  en obra esas reglas producen contraseñas anotadas en el casco, no contraseñas
  más fuertes. Una frase larga es mejor y se recuerda.
- **Frontend** — `logout()` llama al servidor antes de limpiar los tokens, sin
  esperar la respuesta ni bloquear el cierre si falla: el usuario pidió salir y
  debe salir aunque el backend esté caído. Nuevo diálogo de cambio de contraseña
  accesible desde el bloque de usuario del sidebar.

## Out of scope

- **Recuperación de contraseña por correo.** Necesita tokens de un solo uso,
  plantillas y entrega de correo verificada — y el `SMTP_*` del VPS solo está
  probado para las órdenes de compra de Compras. Para el piloto la vía es que un
  administrador la reponga con `PATCH /api/v1/auth/admin/users/:id`, que ya
  acepta `password` y ya funciona.
- **Forzar el cambio en el primer inicio de sesión.** Es lo correcto para salir
  de la contraseña compartida, pero cambia el flujo de login y merece su propio
  spec. Mientras tanto, el aviso operativo es pedirle a cada usuario que la
  cambie el primer día.
- **Listar y cerrar sesiones individuales** desde la interfaz. `todas: true`
  cubre el caso urgente.
- **Expiración de contraseñas.** No aporta seguridad real y molesta.

## Capabilities

### New Capabilities
- `sesion-cierre-servidor`: revocación de refresh tokens del lado del servidor.
- `cambio-password-autoservicio`: cambio de contraseña por el propio usuario, con
  política y revocación de sesiones.
