# cambio-password-autoservicio Specification

## Purpose

Cambio de contraseña por el propio usuario, sin intervención de un
administrador, con una política que premia la longitud sobre la composición y
revoca todas las sesiones activas al cambiarla.

## Requirements

### Requirement: El usuario SHALL poder cambiar su propia contraseña
`POST /api/v1/auth/change-password` SHALL permitir a un usuario autenticado
cambiar su contraseña presentando la actual. NO SHALL requerir la intervención de
un administrador.

La contraseña actual SHALL verificarse con `bcrypt.compare` antes de cualquier
escritura. El endpoint SHALL tener rate limiting: verifica la contraseña actual,
así que sin techo es un oráculo para sondearla.

#### Scenario: Cambio correcto
- **WHEN** un usuario autenticado envía su contraseña actual correcta y una
  nueva que cumple la política
- **THEN** su `password_hash` SHALL actualizarse, y el siguiente inicio de sesión
  SHALL funcionar con la contraseña nueva y fallar con la anterior

#### Scenario: Contraseña actual incorrecta
- **WHEN** la contraseña actual presentada no coincide
- **THEN** la respuesta SHALL ser 403 con `error.code:
  'AUTH_PASSWORD_ACTUAL_INCORRECTA'`, y el hash NO SHALL modificarse

### Requirement: Cambiar la contraseña SHALL cerrar todas las sesiones del usuario
Al cambiar la contraseña SHALL revocarse todos los refresh tokens activos del
usuario, **incluido el de la sesión que hace la petición**. Si la razón del
cambio es que otra persona conocía la contraseña, dejar sus sesiones vivas vacía
el gesto.

La interfaz SHALL indicarlo antes de confirmar, y llevar al inicio de sesión
después.

#### Scenario: Sesión en otro dispositivo tras el cambio
- **WHEN** un usuario con sesión abierta en dos dispositivos cambia su
  contraseña desde uno
- **THEN** el refresh token del otro dispositivo SHALL quedar revocado, y su
  siguiente `POST /api/v1/auth/refresh` SHALL responder 401

### Requirement: La política de contraseñas SHALL premiar la longitud, no la composición
La contraseña nueva SHALL tener al menos 12 caracteres, SHALL ser distinta de la
actual, y NO SHALL ser la contraseña de arranque compartida con la que se dan de
alta los usuarios.

NO SHALL exigirse composición de mayúsculas, números ni símbolos: en obra esas
reglas producen contraseñas anotadas en el casco, no contraseñas más fuertes.

El mensaje de rechazo SHALL nombrar el motivo concreto, y la comprobación de la
contraseña de arranque SHALL ocurrir antes que la de longitud — la de arranque
mide menos del mínimo, así que en el orden inverso el usuario recibiría «muy
corta» en vez del motivo real.

#### Scenario: Frase larga sin símbolos
- **WHEN** se envía una frase de más de 12 caracteres sin mayúsculas ni símbolos
- **THEN** SHALL aceptarse

#### Scenario: Reusar la contraseña de arranque
- **WHEN** se envía la contraseña de arranque compartida como contraseña nueva
- **THEN** SHALL rechazarse con `error.code: 'AUTH_PASSWORD_DE_ARRANQUE'`, no con
  el error de longitud

#### Scenario: La misma contraseña con un espacio pegado al copiar
- **WHEN** la contraseña nueva es idéntica a la actual salvo espacios al inicio
  o al final
- **THEN** SHALL rechazarse con `error.code: 'AUTH_PASSWORD_SIN_CAMBIO'` — sigue
  siendo la misma contraseña
