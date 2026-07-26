## MODIFIED Requirements

### Requirement: La credencial individual del empleado distingue entrada y salida por estado del registro
El QR de la credencial individual del empleado (no un QR de cuadrilla) SHALL funcionar como entrada en el primer escaneo del día y como salida en el segundo escaneo. La lógica de distinción reside en el backend: si no existe registro para empleado/fecha → es entrada; si existe con `hora_entrada` y sin `hora_salida` → es salida. El escaneo SHALL realizarse por personal con sesión autenticada (`residencia`/`control_obra`/`personal_rh`/`admin`) que apunta la cámara a la credencial del empleado — no por el empleado escaneando un QR compartido de cuadrilla desde su propio dispositivo, porque los empleados de obra no tienen cuenta de usuario en el sistema.

#### Scenario: Primer escaneo del día → entrada
- **WHEN** se recibe `POST /asistencia/escanear` con el token de credencial de un empleado y no existe registro para ese empleado/fecha
- **THEN** el sistema crea el registro con `hora_entrada = hora_actual_servidor`, `estado = PRESENTE`

#### Scenario: Segundo escaneo del día → salida
- **WHEN** se recibe `POST /asistencia/escanear` y ya existe registro con `hora_entrada` definida y `hora_salida = null`
- **THEN** el sistema actualiza el registro con `hora_salida = hora_actual_servidor` y calcula horas

#### Scenario: Tercer escaneo del mismo día → idempotente
- **WHEN** se recibe `POST /asistencia/escanear` y el registro ya tiene `hora_entrada` y `hora_salida` definidas
- **THEN** el sistema retorna el registro existente sin modificaciones (`200 OK`)

#### Scenario: QR de cuadrilla compartido ya no es el mecanismo de escaneo
- **WHEN** se diseña o consulta el flujo de toma de asistencia por QR
- **THEN** el QR relevante es el impreso en la credencial individual de cada empleado (`credencial-empleado`), no un código único compartido por cuadrilla; `ResidenciaView.tsx` deja de mostrar el `QrVisual` decorativo por cuadrilla y usa un lector de cámara que decodifica la credencial que se le presente
