## 1. Prisma / esquema

- [x] 1.1 Crear modelo `CredencialEmpleado` (tenant_id, empleado_id, token único por tenant, activa, emitida_en, emitida_por, revocada_en?, revocada_por?, motivo_revocacion?) con índice `[tenant_id, token]` único y `[tenant_id, empleado_id]`
- [x] 1.2 Crear modelo `ConfigAsistenciaProyecto` (tenant_id, proyecto_id, lat, lng, radio_metros, configurado_por) único por `[tenant_id, proyecto_id]`
- [x] 1.3 Agregar `ultimo_scan_en DateTime?` a `RegistroAsistencia`
- [x] 1.4 Agregar `FOTO_CREDENCIAL` a `TIPOS_DOCUMENTO_EMPLEADO` en `types.ts`
- [x] 1.5 Generar migración Prisma y correr `prisma generate` — aplicado contra Postgres real (`db push` + migración SQL manual escrita para VPS/staging)

## 2. Credencial de empleado (TDD)

- [x] 2.1 Escribir tests: `POST /empleados/:id/credencial` crea credencial con token de 32+ bytes; una segunda llamada revoca la anterior (`activa=false`, `revocada_en`/`revocada_por`) y crea una nueva `activa=true`
- [x] 2.2 Implementar `POST /api/v1/personal/empleados/:id/credencial`, restringido a `personal_rh`/`admin`
- [x] 2.3 Escribir tests y luego implementar `GET /api/v1/personal/empleados/:id/credencial` (consulta sin regenerar) y `DELETE /api/v1/personal/empleados/:id/credencial` (revocar sin reemitir)
- [x] 2.4 Verificar que el token nunca sea derivable de `id_empleado` (aleatoriedad real, no hash determinista del ID) — `crypto.randomBytes(32).toString('base64url')`

## 3. Endpoint de escaneo seguro (TDD)

- [x] 3.1 Extraer la lógica de doble-scan (entrada/salida/idempotente) de `POST /asistencia/registro` a una función compartida (`aplicarDobleScan`), reutilizable desde el nuevo endpoint
- [x] 3.2 Escribir tests: `POST /asistencia/escanear` sin `Authorization` responde `401` sin registrar nada, aunque el token de credencial sea válido
- [x] 3.3 Escribir tests: rol sin permiso (`procurement`, etc.) responde `403`
- [x] 3.4 Escribir tests: token inexistente → `404`; token de credencial revocada → `410`
- [x] 3.5 Escribir tests: empleado de otro proyecto → `403` (reusa `obtenerEmpleadoIdsDelProyecto`)
- [x] 3.6 Escribir tests: segundo escaneo del mismo empleado antes del cooldown → `429`; después del cooldown → se procesa
- [x] 3.7 Implementar `POST /api/v1/personal/asistencia/escanear` con las validaciones de 3.2-3.6 en orden (auth de sesión → rol → token → proyecto → cooldown → geofencing → doble-scan)
- [x] 3.8 Escribir tests y luego implementar `PUT/GET /api/v1/personal/config-asistencia` (geofencing por proyecto, roles `personal_rh`/`admin`)
- [x] 3.9 Escribir tests: sin config de geofencing, escaneo procede sin exigir `lat`/`lng`; con config, dentro del radio pasa, fuera del radio `403`, sin coordenadas del dispositivo `400`
- [x] 3.10 Implementar validación Haversine de geofencing en el endpoint de escaneo

## 4. Foto de credencial en expediente

- [x] 4.1 Escribir test: `POST /empleados/:id/documentos` acepta `tipo_documento = FOTO_CREDENCIAL`
- [x] 4.2 "Foto vigente" resuelta como el `FOTO_CREDENCIAL` más reciente (`orderBy created_at desc` + tomar el primero), verificado dentro del test de impresión en lote — no ameritó endpoint propio

## 5. Impresión en lote

- [x] 5.1 Escribir tests: endpoint que arma los datos de impresión (nombre, puesto, foto vigente o null, token) para uno, varios o todos los empleados elegibles de un proyecto — `POST /empleados/credenciales/imprimir-lote`
- [x] 5.2 Implementar generación automática de credencial para cualquier empleado seleccionado que aún no tenga una `activa`

## 6. Frontend — `PersonalView.tsx`

- [x] 6.1 Agregar acción "Generar/Regenerar credencial" y "Revocar credencial" en el panel de configuración de empleado
- [x] 6.2 Agregar captura de foto de credencial (reusa el flujo de expediente ya existente con `tipo_documento = FOTO_CREDENCIAL`, ya seleccionable en el dropdown)
- [x] 6.3 Agregar selector de empleados (checkbox por fila + "seleccionar todos") para imprimir credenciales en lote
- [x] 6.4 Conectar el diseño de credencial con datos reales: QR real (`qrcode`, codificando `BOCAM:CRED:{token}`) y foto real cuando exista (fetch autenticado → data URL, ya que el visor de impresión no puede mandar headers de auth), en `apps/app-shell/src/lib/credencialesPrint.ts`

## 7. Frontend — `ResidenciaView.tsx` (lector de cámara real)

- [x] 7.1 Reemplazar `QrVisual` (SVG decorativo, eliminado) por un lector de QR por cámara (`jsQR` sobre frames de `<video>`/`<canvas>`, `getUserMedia`)
- [x] 7.2 Al decodificar un string con prefijo `BOCAM:CRED:`, extraer el token y llamar a `POST /asistencia/escanear`
- [x] 7.3 Se solicita `navigator.geolocation` de forma oportunista en cada escaneo (sin bloquear si el permiso no existe); si el proyecto exige geofencing y no hay coordenadas, el backend responde `400` y ese mensaje se muestra tal cual en el modal
- [x] 7.4 Mostrar el resultado del escaneo (Entrada registrada / Salida registrada / mensaje de error del backend) con botón "Escanear otro"
- [x] 7.5 Quitados los botones "Imprimir QR"/"Compartir QR" y el QR por cuadrilla; el modal de cuadrilla ahora solo tiene registro manual, y el escaneo real es un botón/modal independiente no atado a ninguna cuadrilla

## 8. Verificación end-to-end

- [x] 8.1 Correr la suite completa de tests nuevos y la existente (`asistencia`/`prenominas`/expediente/residentes/periodicidad) — corrida contra Postgres real, **todos los archivos en verde, sin regresiones** (13 casos nuevos de este change + toda la suite previa de `apps/personal`)
- [ ] 8.2 Verificación manual: emitir credencial → imprimir → escanear con sesión `residencia` → confirmar entrada registrada → escanear de nuevo tras el cooldown → confirmar salida registrada → calcular pre-nómina del período — **el flujo de API está cubierto end-to-end por tests de integración reales; falta la verificación visual con cámara real en navegador (no disponible en este entorno de agente)**
- [ ] 8.3 Verificación manual: escanear el mismo token con una sesión de `procurement` (rol sin permiso) — **cubierto por test de integración (403); falta confirmar visualmente en el modal del navegador**
- [ ] 8.4 Verificación manual: revocar una credencial y confirmar que escanearla responde `410` — **cubierto por test de integración; falta confirmar visualmente en el modal del navegador**

**Nota**: `apps/personal` y `apps/auth` corrieron localmente contra el Postgres real de desarrollo (`bocam-postgres`, mismo que usa el resto del stack) durante esta sesión para poder correr los tests de integración reales. De paso se encontró y corrigió un bug de infraestructura no relacionado (ver commit aparte): `packages/auth-middleware/src/middleware.js` estaba desincronizado de su `.ts` desde el commit `128a316`, haciendo que `/health` fallara con 401 en cualquier servicio que lo usara — se resincronizó desde `dist/`. Lo único pendiente de este change es la verificación visual en navegador con cámara real (requiere un dispositivo con cámara, fuera del alcance de este entorno).
