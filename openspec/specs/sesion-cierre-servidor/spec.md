# sesion-cierre-servidor Specification

## Purpose

Revocación de refresh tokens del lado del servidor: cerrar sesión deja de ser
un borrado local de tokens y pasa a invalidar la sesión en el backend, con
soporte para expulsar todas las sesiones de un usuario.

## Requirements

### Requirement: Cerrar sesión SHALL revocar el refresh token en el servidor
`POST /api/v1/auth/logout` SHALL marcar como revocado el refresh token
presentado, de modo que deje de servir para emitir nuevos access tokens. Borrar
los tokens del cliente NO SHALL considerarse un cierre de sesión.

La operación SHALL acotarse al `user_id` del JWT que autentica la petición: un
refresh token de otro usuario NO SHALL revocarse aunque se envíe su valor.

#### Scenario: Cierre de sesión normal
- **WHEN** un usuario autenticado hace `POST /api/v1/auth/logout` con su
  `refresh_token`
- **THEN** ese token SHALL quedar revocado, y un `POST /api/v1/auth/refresh`
  posterior con él SHALL responder 401

#### Scenario: Intento de revocar la sesión de otro usuario
- **WHEN** un usuario autenticado envía en `refresh_token` un valor que
  pertenece a otro usuario
- **THEN** ese token NO SHALL revocarse, y la respuesta SHALL indicar cero
  sesiones cerradas

#### Scenario: Cerrar una sesión ya cerrada
- **WHEN** se hace `POST /api/v1/auth/logout` con un refresh token ya revocado
- **THEN** la respuesta SHALL ser 200 con cero sesiones cerradas — la operación
  es idempotente, para que un cliente que reintenta no quede atrapado en un error

### Requirement: SHALL poder cerrarse toda la cadena de sesiones del usuario
Cuando la petición no incluya `refresh_token`, o incluya `todas: true`, `POST /api/v1/auth/logout` SHALL revocar todos los refresh tokens activos del
usuario autenticado. Es la vía para expulsar sesiones abiertas en un dispositivo
que ya no se tiene a mano.

#### Scenario: Usuario con sesiones en varios dispositivos
- **WHEN** un usuario con tres sesiones activas hace
  `POST /api/v1/auth/logout` con `todas: true`
- **THEN** los tres refresh tokens SHALL quedar revocados, y la respuesta SHALL
  indicar tres sesiones cerradas

### Requirement: El cierre de sesión del cliente NO SHALL depender del servidor
La interfaz SHALL limpiar la sesión local aunque la llamada de revocación falle
o no responda. El usuario pidió salir y debe salir aunque el backend esté caído;
el token expira por su cuenta.

#### Scenario: Backend no disponible al cerrar sesión
- **WHEN** el usuario cierra sesión y `POST /api/v1/auth/logout` falla
- **THEN** los tokens locales SHALL borrarse igual y la aplicación SHALL volver
  a la pantalla de inicio de sesión
