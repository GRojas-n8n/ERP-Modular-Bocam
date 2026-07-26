## ADDED Requirements

### Requirement: Escanear una credencial requiere sesión autenticada con rol de checador
El sistema SHALL exponer `POST /api/v1/personal/asistencia/escanear`, restringido a roles `residencia`, `control_obra`, `personal_rh` o `admin` (mismos roles que `POST /asistencia/registro`). El cuerpo de la petición SHALL incluir el `token` decodificado del QR. Sin una sesión válida con uno de estos roles, ningún request a este endpoint SHALL registrar asistencia — el contenido del QR por sí solo NUNCA SHALL ser suficiente para marcar asistencia.

#### Scenario: Escaneo con sesión válida
- **WHEN** un usuario con rol `residencia` envía un `token` de credencial activa
- **THEN** el sistema registra la asistencia correspondiente

#### Scenario: Request sin token de sesión
- **WHEN** se envía el mismo `token` sin header `Authorization`
- **THEN** el sistema responde `401`, sin registrar nada, sin importar que el token de credencial sea válido

#### Scenario: Sesión con rol sin permiso
- **WHEN** un usuario con rol `procurement` envía un `token` de credencial activa
- **THEN** el sistema responde `403`

### Requirement: Token resuelve a empleado o falla explícitamente
El sistema SHALL resolver el `token` recibido contra `CredencialEmpleado`. Si no existe ningún registro con ese `token` → `404`. Si existe pero `activa = false` → `410 Gone` con mensaje indicando que la credencial fue revocada.

#### Scenario: Token inexistente
- **WHEN** se escanea un `token` que no corresponde a ninguna credencial emitida
- **THEN** el sistema responde `404`

#### Scenario: Token de credencial revocada
- **WHEN** se escanea el `token` de una credencial que RH revocó
- **THEN** el sistema responde `410` con mensaje "Credencial revocada, contacte a RH"

### Requirement: El empleado debe pertenecer al proyecto activo de quien escanea
El sistema SHALL validar que el `empleado_id` resuelto del token esté en el conjunto de empleados elegibles del `proyecto_id` activo de la sesión (mismo criterio que el filtro de `calcular`: `AsignacionFrente` activa o `Cuadrilla` del proyecto). Si el empleado no pertenece a ese proyecto → `403`.

#### Scenario: Credencial de empleado de otro proyecto
- **WHEN** se escanea la credencial de un empleado asignado únicamente al proyecto `P2`, desde una sesión con proyecto activo `P1`
- **THEN** el sistema responde `403` y no registra asistencia

### Requirement: Cooldown anti-rescaneo
El sistema SHALL rechazar un escaneo si el mismo empleado tuvo un escaneo exitoso (`RegistroAsistencia.ultimo_scan_en`) hace menos de `ASISTENCIA_COOLDOWN_MINUTOS` (default 2 minutos).

#### Scenario: Reescaneo inmediato
- **WHEN** el mismo empleado es escaneado dos veces con 30 segundos de diferencia
- **THEN** el segundo escaneo responde `429` indicando el tiempo restante de cooldown, sin modificar el registro

#### Scenario: Reescaneo tras el cooldown
- **WHEN** el mismo empleado es escaneado nuevamente 3 minutos después del anterior
- **THEN** el escaneo se procesa normalmente (como salida, si el primero fue entrada)

### Requirement: Geolocalización opcional por proyecto
El sistema SHALL exponer `PUT/GET /api/v1/personal/config-asistencia` (roles `personal_rh`/`admin`) para configurar `lat`, `lng`, `radio_metros` del proyecto activo. Si existe configuración para el proyecto, `POST /asistencia/escanear` SHALL requerir `lat`/`lng` del dispositivo en el body y SHALL rechazar el escaneo con `403` si la distancia Haversine excede `radio_metros`. Si no existe configuración, el escaneo SHALL proceder sin validar ubicación.

#### Scenario: Proyecto sin geofencing configurado
- **WHEN** se escanea una credencial válida en un proyecto sin `ConfigAsistenciaProyecto`
- **THEN** el sistema registra la asistencia sin exigir `lat`/`lng`

#### Scenario: Escaneo dentro del radio configurado
- **WHEN** el proyecto tiene geofencing configurado y el dispositivo envía coordenadas dentro de `radio_metros`
- **THEN** el sistema registra la asistencia normalmente

#### Scenario: Escaneo fuera del radio configurado
- **WHEN** el proyecto tiene geofencing configurado y el dispositivo envía coordenadas fuera de `radio_metros`
- **THEN** el sistema responde `403` sin registrar asistencia

#### Scenario: Geofencing configurado pero sin coordenadas del dispositivo
- **WHEN** el proyecto tiene geofencing configurado y el request de escaneo no incluye `lat`/`lng`
- **THEN** el sistema responde `400` pidiendo activar el permiso de ubicación, sin registrar asistencia en silencio

### Requirement: Escaneo exitoso reusa el motor de doble-scan existente
Un escaneo que pase todas las validaciones anteriores SHALL aplicar la misma lógica de entrada/salida que `POST /asistencia/registro` (sin registro hoy → entrada; con entrada sin salida → salida; con ambas → idempotente), con `tipo_registro = 'QR'` y `registrado_por = userId` de la sesión que escaneó.

#### Scenario: Primer escaneo del día
- **WHEN** un empleado sin registro de asistencia hoy es escaneado
- **THEN** el sistema crea el registro con `hora_entrada` = hora del servidor y actualiza `ultimo_scan_en`

#### Scenario: Segundo escaneo del día
- **WHEN** el mismo empleado es escaneado de nuevo tras el cooldown, con `hora_entrada` ya registrada
- **THEN** el sistema completa `hora_salida` y calcula horas trabajadas, igual que el registro manual
