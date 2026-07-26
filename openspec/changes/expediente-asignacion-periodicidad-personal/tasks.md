## 1. Prisma / esquema

- [x] 1.1 Crear modelo `ConfigNominaProyecto` (tenant_id, proyecto_id, periodicidad_pago `String @default("SEMANAL")`, configurado_por, updated_at) único por `[tenant_id, proyecto_id]` en `apps/personal/prisma/schema.prisma`
- [x] 1.2 Crear modelo `DocumentoEmpleado` (tenant_id, empleado_id, tipo_documento, nombre_archivo, ruta_archivo, mime_type, tamano_bytes, fecha_vigencia?, subido_por, created_at) con índice `[tenant_id, empleado_id]` y `[tenant_id, fecha_vigencia]`
- [x] 1.3 Crear modelo `AsignacionResidente` (tenant_id, empleado_id, residente_id, fecha_inicio, fecha_fin?, asignado_por) con índice `[tenant_id, empleado_id]` y `[tenant_id, residente_id]`
- [x] 1.4 Generar migración Prisma y correr `prisma generate` — migración aplicada y verificada contra Postgres real (13 tablas del esquema `personal`, incluyendo las 3 nuevas)

## 2. Motor IMSS/ISR — soporte MENSUAL (TDD)

- [x] 2.1 Escribir tests que reproduzcan el gap actual: `calcularISR`/`calcularSubsidio` con `periodo_tipo = 'MENSUAL'` deben fallar o dar resultado incorrecto con el código actual
- [x] 2.2 Agregar/confirmar tabla ISR y tabla de subsidio mensuales en `apps/personal/src/tablas-fiscales.ts` (tarifa SAT vigente)
- [x] 2.3 Extender `calcularISR`/`calcularSubsidio` para aceptar `MENSUAL`, calculando días por mes calendario
- [x] 2.4 Validar y responder `400` si `periodo_tipo` no está en `SEMANAL`/`QUINCENAL`/`MENSUAL`
- [x] 2.5 Correr tests de 2.1 y confirmar que ahora pasan; agregar test de regresión para SEMANAL/QUINCENAL sin cambios — 5/5 OK (`test/unit/tablas-fiscales-mensual.test.ts`)

## 3. Periodicidad de pago por proyecto (TDD)

- [x] 3.1 Escribir tests: `PUT /config-nomina` (proyecto activo del JWT) acepta `periodicidad_pago` con valores válidos y rechaza inválidos con `400`; `GET` retorna `SEMANAL` por default si no hay config
- [x] 3.2 Implementar `PUT/GET /api/v1/personal/config-nomina`, restringido a `personal_rh`/`admin`
- [x] 3.3 Escribir tests: `POST /prenominas/calcular` ya no requiere `periodo_tipo`, lee `ConfigNominaProyecto.periodicidad_pago` del `proyecto_id` de la corrida (o `SEMANAL` si no existe) y genera la `PreNomina` con ese `periodo_tipo`
- [x] 3.4 Escribir test específico: el filtro por `proyecto_id` se aplica antes de leer la periodicidad (no debe ampliar el conjunto de empleados elegibles)
- [x] 3.5 Refactorizar el endpoint `calcular` para leer `ConfigNominaProyecto` en vez de `periodo_tipo` del body (ignorar el campo si viene, por compatibilidad)
- [x] 3.6 Escribir test que reproduzca el bug de scoping actual: un empleado ACTIVO asignado (vía `AsignacionFrente`/`Cuadrilla`) a otro proyecto NO debe aparecer al calcular la nómina del proyecto actual
- [x] 3.7 Implementar el filtro real de empleados por proyecto en `calcular` (unión de `AsignacionFrente.ACTIVA` + `Cuadrilla.proyecto_id`), reemplazando el `findMany({ estado: 'ACTIVO' })` sin scoping de proyecto
- [x] 3.8 Correr suite completa de nómina existente y confirmar que no hay regresiones — corrida contra Postgres real (Docker); encontró y corrigió una regresión real: `rol-personal-rh-autorizar-pagar-nomina.integration.test.ts` creaba empleados sin `AsignacionFrente`, lo cual el fix de scoping (3.7) ahora excluye correctamente del cálculo — se actualizó el helper de setup del test para asignar al proyecto. Tras el fix: **8/8 archivos de test, 30/30 casos en verde** (3 preexistentes + 4 nuevos de este change + 1 unitario)

## 4. Script de migración de datos

- [x] 4.1 Escribir script que, por cada `proyecto_id` distinto visto en `PreNomina`, busque su corrida más reciente y cree `ConfigNominaProyecto` con ese `periodo_tipo`
- [x] 4.2 Proyectos sin histórico quedan sin registro explícito (resuelven a `SEMANAL` por default); el script loggea el conteo (nota: el contador "sin histórico" siempre reporta 0 porque el script solo puede iterar proyectos que ya aparecen en `PreNomina` — `apps/personal` no tiene un registro propio de todos los proyectos existentes; es una limitación estructural documentada, no un bug)
- [x] 4.3 Probar el script contra datos reales (Postgres en Docker): se sembró una `PreNomina` con `periodo_tipo = QUINCENAL` sin config previa, se corrió el script, y se verificó que `ConfigNominaProyecto` quedó creado con `periodicidad_pago = QUINCENAL` — comportamiento correcto confirmado

## 5. Expediente digital (TDD)

- [x] 5.1 Escribir tests: `POST /empleados/:id/documentos` con archivo válido crea `DocumentoEmpleado`; rechaza tipo/tamaño inválido con `400`; rechaza rol sin permiso con `403`
- [x] 5.2 Implementar middleware de almacenamiento (multer o similar) con ruta `/data/personal/uploads/{tenant_id}/{empleado_id}/{documento_id}{extension}`, tipos permitidos y límite de 50 MB (usa `PERSONAL_UPLOAD_DIR`, default `/tmp/personal-uploads`)
- [x] 5.3 Implementar transacción archivo+registro con rollback (borrar archivo si falla el insert en BD)
- [x] 5.4 Escribir tests y luego implementar `GET /empleados/:id/documentos` (listado) y `GET /empleados/:id/documentos/:documentoId/archivo` (descarga), ambos restringidos a `personal_rh`/`admin`
- [x] 5.5 Escribir tests y luego implementar `DELETE /empleados/:id/documentos/:documentoId` (borra registro y archivo en disco)
- [x] 5.6 Actualizar `docker-compose`/nginx para exponer el volumen `/data/personal/uploads` (mismo patrón que Calidad): `docker-compose.vps.yml` — `PERSONAL_UPLOAD_DIR`, volumen `vps_personal_uploads`; `apps/app-shell/nginx.conf` y `docker/nginx.qnap.conf` — `client_max_body_size 55m` en el bloque `/api/v1/personal`. Nota: `docker-compose.qnap.yml` no tiene volumen de uploads para NINGÚN servicio (ni siquiera Calidad) — gap preexistente de esa plataforma, fuera de alcance de este change

## 6. Asignación a Residente(s) (TDD)

- [x] 6.1 Escribir tests: asignar uno o más residentes a un empleado sin remover asignaciones vigentes previas
- [x] 6.2 Implementar `POST /empleados/:id/residentes` (crear asignación) y `DELETE /empleados/:id/residentes/:asignacionId` (setea `fecha_fin`, no borra)
- [x] 6.3 Escribir tests y luego implementar `GET /empleados/:id/residentes` con resolución de nombre vía llamada backend-to-backend a `auth`, devolviendo `parcial: true` si `auth` no responde
- [x] 6.4 Escribir tests y luego implementar `GET /mis-empleados` para rol `residencia`, filtrando por asignaciones vigentes del usuario autenticado
- [x] 6.5 Verificar aislamiento: un residente sin asignaciones no ve ningún empleado en `/mis-empleados`

## 7. Panel de alertas de vencimiento (TDD)

- [x] 7.1 Escribir tests: `GET /documentos/por-vencer?dias=N` retorna documentos vencidos y por vencer con `dias_restantes`/`estado` correctos; excluye documentos sin `fecha_vigencia`; excluye los que caen fuera del umbral
- [x] 7.2 Implementar el endpoint con índice `[tenant_id, fecha_vigencia]` en `DocumentoEmpleado`
- [x] 7.3 Escribir test: `GET /dashboard` incluye alerta `DOCUMENTO_POR_VENCER` con severidad `critica`/`advertencia` según haya o no vencidos
- [x] 7.4 Implementar la alerta agregada en el handler existente de `/api/v1/personal/dashboard`

## 8. Frontend (`PersonalView.tsx`)

- [x] 8.1 Agregar sección "Expediente" en el panel de configuración de empleado: subir, listar, descargar y eliminar documentos
- [x] 8.2 Agregar sección "Residente(s) asignado(s)": listar, asignar y desasignar residentes (con nombre resuelto o fallback si `parcial: true`)
- [x] 8.3 Agregar selector general de periodicidad de pago por proyecto (no en la ficha del empleado) — tarjeta visible para `personal_rh`/`admin`, independiente de la pestaña activa
- [x] 8.4 Actualizar la llamada a `calcular` para dejar de enviar `periodo_tipo` en el body — nota: no existía llamada previa a `calcular` desde el frontend (el botón "Calcular Nómina" no estaba conectado a ningún handler); no había nada que actualizar
- [x] 8.5 Mostrar en la pantalla de nómina la periodicidad configurada del proyecto activo antes de calcular — cubierto por la tarjeta de 8.3, visible en todas las pestañas
- [x] 8.6 Agregar el renglón de alerta "Documentos por vencer/vencidos" al dashboard de RRHH existente — el renderizado de `alertas` ya era genérico (tipo/mensaje/severidad), la alerta `DOCUMENTO_POR_VENCER` aparece automáticamente sin cambios adicionales
- [x] 8.7 Crear panel "Vencimientos": tarjeta con tabla de documentos por vencer/vencidos, badge rojo (vencido) / amarillo (por vencer)

## 9. Verificación end-to-end

- [x] 9.1 Correr suite de tests nuevos contra Postgres real — 30/30 casos en verde (ver 3.8); no se midió cobertura numérica (no hay `nyc`/`jest --coverage` configurado para este estilo de test basado en `ts-node`), pero todo endpoint y función nueva tiene al menos un test que lo ejercita
- [ ] 9.2 Verificación manual local en navegador: alta de empleado → subir documentos → asignar residente(s) → configurar periodicidad → tomar asistencia → calcular nómina fiscal y complementaria — **pendiente: requiere levantar el stack completo (RabbitMQ/Redis/frontend) y navegador, fuera de alcance de esta sesión**
- [ ] 9.3 Confirmar que la migración de `ConfigNominaProyecto` corrió correctamente en el entorno de destino antes del primer cálculo post-deploy — **pendiente: acción de despliegue (VPS)**
- [ ] 9.4 Verificar en navegador que un usuario `residente` solo ve en `/mis-empleados` a los empleados que RH le asignó explícitamente — cubierto por test de integración (6.4/6.5); verificación visual en navegador real pendiente
- [ ] 9.5 Verificación manual del panel "Vencimientos" en navegador real — cubierto por test de integración (7.1/7.3); verificación visual en navegador real pendiente

**Nota de entorno**: se levantó Docker Desktop y un contenedor Postgres 15 desechable (`bocam-test-pg`, no persistente) para correr toda la suite de integración de `apps/personal` contra una base real, incluyendo las migraciones de este change. Los 3 archivos de test preexistentes del servicio y los 4 nuevos de este change corren en verde (30/30), igual que el test unitario del motor fiscal y una prueba manual del script de migración. Lo que queda pendiente es exclusivamente verificación visual en navegador con el stack completo (frontend + todos los microservicios) y el despliegue a VPS — no se levantó `app-shell` ni el resto de microservicios en esta sesión.
