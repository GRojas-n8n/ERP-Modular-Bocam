# sesion-jwt-inactividad Specification

## Purpose
TBD - created by archiving change sesion-jwt-inactividad. Update Purpose after archive.
## Requirements
### Requirement: El sistema SHALL cerrar la sesión del usuario tras un período configurable sin actividad
El frontend SHALL monitorear actividad real del usuario (movimiento de mouse, teclado, clic, scroll) y, tras `VITE_INACTIVITY_TIMEOUT_MIN` minutos (default 15) sin ninguna de estas señales, SHALL limpiar los tokens almacenados y redirigir a la pantalla de login con un mensaje que indique que la sesión se cerró por inactividad.

#### Scenario: Usuario inactivo supera el umbral
- **WHEN** un usuario autenticado no genera ninguna interacción (mouse, teclado, clic, scroll) durante 15 minutos
- **THEN** el sistema limpia el access token y el refresh token de `localStorage`, marca la sesión como no autenticada, y la pantalla de login se muestra con el mensaje "Tu sesión se cerró por inactividad"

#### Scenario: Actividad reinicia el temporizador
- **WHEN** un usuario mueve el mouse, presiona una tecla, hace clic o hace scroll en cualquier momento antes de cumplirse el umbral
- **THEN** el temporizador de inactividad se reinicia desde cero, sin cerrar la sesión

### Requirement: El refresh token SHALL tener un límite absoluto de duración de sesión, independiente de la actividad
El backend de `apps/auth` SHALL registrar el momento en que inició la sesión (login original) y propagar ese valor sin reiniciarlo en cada rotación del refresh token. `POST /api/v1/auth/refresh` SHALL rechazar la renovación si el tiempo transcurrido desde el inicio de sesión excede `JWT_MAX_SESSION_HOURS` (default 16 horas), sin importar cuánta actividad haya generado el usuario durante ese lapso.

#### Scenario: Sesión activa sin interrupción supera el máximo
- **WHEN** un usuario mantiene actividad continua (refrescos exitosos periódicos) durante más de 16 horas desde su login original
- **THEN** la siguiente llamada a `POST /api/v1/auth/refresh` responde 401 (`AUTH_REFRESH_INVALID`), obligando a un nuevo login

#### Scenario: Rotación normal dentro del límite no reinicia el reloj de sesión
- **WHEN** el refresh token se rota (uso normal, dentro de las 16 horas desde el login)
- **THEN** el nuevo refresh token conserva el mismo `sesion_iniciada_en` del login original, no uno recalculado a partir del momento de la rotación

#### Scenario: Sesión no persiste de un día para otro
- **WHEN** un usuario inicia sesión un día y deja una pestaña abierta y activa (ej. con auto-refresh) hasta el día siguiente, superando las 16 horas configuradas
- **THEN** el sistema exige un nuevo login antes de continuar, sin importar que la pestaña nunca haya estado inactiva

