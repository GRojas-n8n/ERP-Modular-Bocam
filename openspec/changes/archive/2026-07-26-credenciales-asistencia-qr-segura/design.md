## Context

`apps/personal` ya tiene el motor de doble-scan (entrada/salida por estado del registro, `tipo_scan`) y el cálculo de nómina por periodicidad de proyecto (`expediente-asignacion-periodicidad-personal`, ya implementado). Lo que falta es la pieza que los conecta con la realidad física: hoy nada en el sistema lee un QR de verdad. `ResidenciaView.tsx` tiene un componente `QrVisual` (SVG generado a partir de un seed) puramente decorativo — no codifica un token real, "Imprimir QR" y "Compartir QR" solo disparan una notificación de éxito falsa.

El diseño de la credencial física (hoja carta, 10 por página, frente+reverso, ya aprobado en conversación previa) incluye un QR. Este change lo vuelve real y lo conecta al flujo de asistencia.

## Goals / Non-Goals

**Goals:**
- Emitir una credencial con token propio, revocable, por empleado.
- Que ese token, escaneado, registre entrada/salida real usando el motor de doble-scan ya existente.
- Que el hecho de que el QR esté impreso (fotografiable, copiable) no comprometa el sistema de asistencia.
- Capturar la foto del empleado para imprimirla en la credencial.

**Non-Goals:**
- No se implementa reconocimiento facial (matching biométrico, detección de vida) — fase 2 separada. Este change solo deja la foto capturada y almacenada, lista para que esa fase la consuma.
- No se implementa un sistema de geofencing obligatorio — es opcional, por proyecto, y el escaneo funciona igual si RH no lo configuró.
- No se resuelve aquí el hallazgo de tope de horas extra inconsistente (`JORNADA_COMPLETA` vs `POR_HORAS`) — sigue siendo un bug-fix separado.

## Decisions

**1. El QR no es la barrera de seguridad — la sesión que lo escanea sí lo es.**
Un QR impreso en una tarjeta física puede fotografiarse, reimprimirse o compartirse por WhatsApp. Diseñar la seguridad asumiendo que el QR es secreto es una base falsa. La decisión de diseño es: el QR solo *identifica* al empleado (como un número de placa), nunca *autentica* nada por sí solo. La autorización para escribir un registro de asistencia vive enteramente en la sesión JWT de quien escanea — exactamente el mismo modelo que ya usa `POST /asistencia/registro` (`requireRoles('residencia', 'control_obra', 'personal_rh', 'admin')`). Si alguien fotografía el QR de un compañero y lo escanea desde su casa, no pasa nada: no tiene una sesión válida de checador. Este es el candado que de verdad importa; los demás (cooldown, geolocalización, revocación) son defensa en profundidad sobre esta base, no la base misma.
Alternativa descartada: QR con contenido rotativo tipo TOTP (como una app de autenticación) — inviable en una tarjeta impresa estática; requeriría una pantalla (celular/tablet) por empleado, contradice el pedido explícito de credencial física impresa.

**2. Token opaco por empleado, no el `id_empleado` real.**
Nueva tabla `CredencialEmpleado` (`id_credencial`, `tenant_id`, `empleado_id`, `token` — 32 bytes aleatorios en base62, único por tenant —, `activa`, `emitida_en`, `emitida_por`, `revocada_en`, `revocada_por`, `motivo_revocacion`). El QR codifica `BOCAM:CRED:{token}`, nunca el UUID de `Empleado`. Cada fila es un evento de emisión: revocar = poner `activa=false` + `revocada_en`/`revocada_por`; reemitir = crear una fila nueva con `activa=true`. Solo puede haber una fila `activa=true` por empleado a la vez (se valida en el endpoint, no a nivel de constraint de BD — un índice parcial `WHERE activa` no es portable a través de todos los entornos de despliegue de este proyecto). El historial completo queda para auditoría (quién emitió/revocó y cuándo) sin tabla de log aparte.
Alternativa descartada: usar `id_empleado` directamente en el QR — expone el identificador interno real; revocar una credencial comprometida obligaría a cambiar el ID del empleado en todo el sistema, imposible en la práctica.

**3. `POST /asistencia/escanear` reusa el motor de doble-scan existente, no lo duplica.**
La lógica de "si no hay registro hoy → entrada; si hay entrada sin salida → salida; si ya tiene ambas → idempotente" que hoy vive inline en `POST /asistencia/registro` se extrae a una función compartida. El nuevo endpoint: (a) resuelve `token → empleado_id` vía `CredencialEmpleado` (404 si no existe, 410 Gone si `activa=false` con mensaje "credencial revocada, contacte a RH"), (b) valida que el empleado esté en el conjunto de `obtenerEmpleadoIdsDelProyecto` del proyecto activo del JWT (mismo helper del change de periodicidad — cierra el caso de escanear una credencial de otro proyecto), (c) valida cooldown, (d) valida geolocalización si está configurada, (e) llama a la función compartida de doble-scan con `tipo_registro='QR'`.

**4. Cooldown vía campo nuevo `RegistroAsistencia.ultimo_scan_en`, no vía `hora_entrada`/`hora_salida`.**
Esos campos son `VARCHAR(5)` (`HH:MM`), sin fecha ni precisión de segundos — insuficientes para un cooldown correcto cerca de medianoche o para escaneos muy seguidos. Se agrega `ultimo_scan_en DateTime?`, actualizado en cada escaneo exitoso (vía QR o manual). Cooldown por defecto: **2 minutos** entre escaneos del mismo empleado — configurable vía env var (`ASISTENCIA_COOLDOWN_MINUTOS`) porque es un parámetro operativo, no de negocio por tenant.

**5. Geolocalización opcional, por proyecto, sin entidad `Proyecto` propia.**
Igual que `ConfigNominaProyecto`, se agrega `ConfigAsistenciaProyecto` (`tenant_id`, `proyecto_id`, `lat`, `lng`, `radio_metros`, `configurado_por`). Si no existe config para el proyecto → el escaneo no valida ubicación (opt-in explícito de RH, no un requisito bloqueante desde el día uno). Si existe, el frontend envía `navigator.geolocation` del dispositivo que escanea junto con el request; el backend calcula distancia Haversine contra `lat`/`lng` y rechaza con `403` si excede `radio_metros`.
Alternativa descartada: exigir coordenadas del proyecto vía llamada backend-to-backend a `gerencia-tecnica` o `auth` (donde vive `Proyecto`) — el modelo `Proyecto` de `auth` no tiene campos de coordenadas hoy, agregarlos ahí es un change de otro servicio, fuera de alcance; configurarlo localmente en `personal` mantiene la independencia del microservicio.

**6. Foto de credencial: nuevo `tipo_documento = FOTO_CREDENCIAL` en el expediente existente, sin tabla nueva.**
Reutiliza `DocumentoEmpleado` (ya construido en `expediente-asignacion-periodicidad-personal`). La "foto vigente" para imprimir es la más reciente con ese tipo — no se fuerza unicidad a nivel de BD (mismo criterio que el resto del expediente). Esto también deja la foto lista para que la fase 2 de reconocimiento facial la reuse sin recapturar nada.

**7. Lector de QR por cámara en el navegador, sin backend nuevo.**
El decodificado del QR ocurre 100% en el cliente (librería tipo `jsQR` sobre frames de `<video>`), extrayendo el token del string `BOCAM:CRED:{token}` y enviándolo al endpoint de escaneo — igual que cualquier otro POST autenticado del frontend. No se necesita infraestructura de video/streaming en el backend.

## Risks / Trade-offs

- **[Riesgo] Sesión de checador compartida o dejada abierta** (ej. una tablet de control de acceso con sesión de `control_obra` permanentemente logueada) reduce el candado #1 a "quien tenga acceso físico a esa tablet". → Mitigación: fuera de alcance de este change (es un problema de gestión de dispositivos/sesiones, no de este endpoint específico) pero documentado como dependencia operativa — RH debe tratar las tablets de checador como un dispositivo controlado, igual que ya se trataría cualquier terminal con sesión de `personal_rh`.
- **[Riesgo] Cooldown fijo por env var, no por tenant** — un proyecto con checadores múltiples muy cercanos entre sí en el tiempo podría chocar contra el cooldown legítimamente. → Mitigación: 2 minutos es conservador para el caso real (una persona no puede escanear entrada dos veces en 2 minutos por accidente, pero tampoco es tan largo como para bloquear un reintento tras un error de escaneo). Ajustable sin redeploy de schema si se vuelve problema real.
- **[Riesgo] Geolocalización del navegador puede fallar o el usuario negar el permiso.** → Mitigación: si `ConfigAsistenciaProyecto` no existe, no se exige; si existe pero el navegador no puede obtener ubicación, el escaneo se rechaza con mensaje claro pidiendo activar el permiso — no se hace fallback silencioso a "sin validar" cuando RH configuró explícitamente que sí lo requiere.
- **[Trade-off] Revocar y reemitir credencial no invalida copias físicas ya impresas** — el candado real (sesión autenticada) sigue protegiendo aunque la tarjeta vieja siga circulando; solo dejaría de *identificar* correctamente (el token viejo resuelve a 410 Gone).

## Migration Plan

1. Migración Prisma: `CredencialEmpleado`, `ConfigAsistenciaProyecto`, campo `ultimo_scan_en` en `RegistroAsistencia`.
2. Sin backfill de datos — no existen credenciales previas que migrar (el sistema anterior era 100% decorativo, sin tokens reales que preservar).
3. Desplegar backend (`apps/personal`) y frontend (`PersonalView.tsx` + `ResidenciaView.tsx`) en el mismo release — el lector de cámara depende del endpoint nuevo.
4. RH genera credenciales para los empleados activos de cada proyecto antes de imprimir el primer lote.
5. Rollback: las tablas nuevas no afectan datos existentes; si el endpoint de escaneo falla en producción, el registro manual de asistencia (`POST /asistencia/registro`, ya existente) sigue funcionando como respaldo sin cambios.

## Open Questions

- ¿El cooldown de 2 minutos es el valor correcto para el ritmo real de entrada de personal en obra (cuadrillas grandes entrando casi simultáneo por el mismo checador)? — a validar con RH/Residencia antes de fijar el default en producción.
- ¿Quién captura la foto de credencial — el propio empleado se toma una selfie desde un dispositivo, o RH la toma con cámara en el módulo de alta? Afecta el flujo de UI de la tarea de captura (cámara embebida vs subida de archivo simple, ya cubierta por el expediente existente).
