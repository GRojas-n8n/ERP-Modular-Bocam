## Why

RH necesita imprimir credenciales físicas de empleado (una, varias o todas las de un proyecto) con foto, datos y un código QR. Ese QR no es solo un dato de identificación: es una de las dos formas de tomar asistencia real en obra (la otra, reconocimiento facial, queda para un change futuro) — al escanearlo al inicio y fin de jornada se registra entrada/salida, y de ahí se calcula la pre-nómina fiscal y complementaria del período (semanal/quincenal/mensual, ya resuelto por `expediente-asignacion-periodicidad-personal`). Hoy no existe nada de esto: `apps/personal` no tiene concepto de credencial ni token, y el único "QR" que existe en el sistema es un SVG decorativo en `ResidenciaView.tsx` (`QrVisual`) que no codifica ningún dato real ni llama a ningún backend — es puramente cosmético.

Como el QR queda impreso en una tarjeta física (no es un código que rota en un celular), no puede ser la única barrera de seguridad: cualquiera puede fotografiarlo. La seguridad real tiene que estar en quién puede *usar* ese QR para marcar asistencia, no en el QR en sí.

## What Changes

- Nueva credencial de empleado: token opaco y revocable por empleado (no el UUID real, no adivinable), generado/regenerado por RH, distinto de cualquier identificador ya expuesto en la API.
- Nuevo endpoint de escaneo seguro `POST /asistencia/escanear`: reemplaza la lógica decorativa de `ResidenciaView.tsx`. Requiere sesión autenticada con rol `residencia`/`control_obra`/`personal_rh`/`admin` (fotografiar el QR y escanearlo sin sesión válida no hace nada), aplica cooldown anti-rescaneo, valida que el empleado esté asignado al proyecto activo, y opcionalmente valida geolocalización del dispositivo contra coordenadas del proyecto si RH las configuró.
- Revocación de credencial: RH puede invalidar el token de una credencial perdida/robada y emitir una nueva sin tocar el resto del expediente del empleado.
- Captura de fotografía del empleado en el expediente digital (nuevo `tipo_documento = FOTO_CREDENCIAL`), usada para imprimir la credencial. **No** incluye reconocimiento facial (matching biométrico) — eso es una fase 2 separada, con su propio análisis de proveedor y cumplimiento LFPDPPP (dato biométrico es dato personal sensible en México).
- **BREAKING conceptual, no de contrato**: el modelo de "QR de cuadrilla" mostrado hoy en `ResidenciaView.tsx` (un QR compartido por cuadrilla, pensado para que cada obrero se auto-registre desde su propio celular) se reemplaza por credencial individual escaneada por personal con sesión (residencia/control_obra). Los obreros no tienen cuenta de usuario en el sistema — un modelo de auto-escaneo nunca pudo funcionar con el modelo de auth actual; este change lo corrige con el único modelo que sí es viable.
- Impresión: conecta el diseño de credencial ya aprobado (hoja carta, 10 por página, frente+reverso) con datos reales — QR real (no el pseudo-QR de canvas de la maqueta), foto real si existe en expediente, selección de uno/varios/todos los empleados de un proyecto desde `PersonalView.tsx`.

## Capabilities

### New Capabilities
- `credencial-empleado`: generación, revocación y consulta del token de credencial por empleado; captura de foto de credencial en el expediente; impresión con datos reales.
- `asistencia-qr-segura`: endpoint de escaneo con todos los candados de seguridad (sesión autenticada, cooldown, scoping por proyecto, geolocalización opcional), y su integración con el motor de doble-scan (entrada/salida) ya existente.

### Modified Capabilities
- `qr-doble-scan`: la fuente del QR pasa de "QR de cuadrilla" (autoescaneo, inviable con el modelo de auth actual) a "credencial individual por empleado" (escaneada por personal autenticado). La lógica de distinción entrada/salida por estado del registro se mantiene sin cambios.

Nota: `POST /asistencia/escanear`, el cooldown y la geolocalización opcional se especifican como requirements nuevos dentro de la capability nueva `asistencia-qr-segura` — no modifican ningún CA existente de `asistencia-qr-backend` (`/registro`, `/bulk`, `/resumen`, `PATCH /:id` siguen intactos), por eso esa capability no aparece en esta sección.

## Impact

- **Servicio principal**: `apps/personal` (backend + Prisma + `PersonalView.tsx`). Toca también `ResidenciaView.tsx` en `app-shell` para reemplazar `QrVisual` (decorativo) por un lector de cámara real — mismo módulo Personal, vista distinta.
- **Prisma**: nueva tabla `CredencialEmpleado` (token, activa, emitida/revocada, auditoría de emisión); nueva tabla `ConfigAsistenciaProyecto` (coordenadas del proyecto para geofencing opcional, mismo patrón que `ConfigNominaProyecto` — sin entidad `Proyecto` propia en este servicio).
- **Endpoints nuevos**: `POST/GET /api/v1/personal/empleados/:id/credencial`, `POST /api/v1/personal/asistencia/escanear`, `PUT/GET /api/v1/personal/config-asistencia` (geofencing por proyecto).
- **Frontend**: lector de QR por cámara real (librería cliente, sin backend adicional) en `ResidenciaView.tsx`; en `PersonalView.tsx`, botón de generar/regenerar credencial, captura de foto en el expediente, y selección de empleados para imprimir credenciales en lote.
- **Fuera de alcance**: reconocimiento facial (fase 2, change separado); geofencing es opcional y no bloquea el escaneo si RH no configuró coordenadas del proyecto.
