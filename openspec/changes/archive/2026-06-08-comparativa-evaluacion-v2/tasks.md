# Tasks â€” comparativa-evaluacion-v2

> Prerequisito: `proveedores-catalogo-v2` debe estar desplegado en producciÃ³n antes del deploy de este change.

## 1. Schema compras â€” Ampliar CuadroComparativo

- [x] 1.1 Agregar en modelo `CuadroComparativo` en `apps/compras/prisma/schema.prisma`: `revision` (VarChar 5, default `"A"`), `firmado_por` (Uuid, nullable), `fecha_firma` (DateTime, nullable), `revision_padre_id` (Uuid, nullable â€” self-reference sin `@relation` ya que Prisma no requiere FK explÃ­cita aquÃ­), `primera_opcion_proveedor_id` (Uuid, nullable), `segunda_opcion_proveedor_id` (Uuid, nullable)
- [x] 1.2 Agregar los nuevos estados al comentario de estados del modelo: `LOCKED`, `SUPERSEDIDO`
- [x] 1.3 Agregar relaciÃ³n `aclaraciones AclaracionComparativa[]` en `CuadroComparativo`

## 2. Schema compras â€” Ampliar ComparativaDetalle

- [x] 2.1 Agregar campo `valor_ofrecido_spec` (Text, nullable) en modelo `ComparativaDetalle`
- [x] 2.2 Actualizar el comentario del campo `evaluacion_tecnica` para documentar los nuevos valores vÃ¡lidos: `PENDIENTE | C | NC | DA | ?` (los valores histÃ³ricos `APROBADO | RECHAZADO` se aceptan en lectura pero no en escritura nueva)

## 3. Schema compras â€” Modelo AclaracionComparativa

- [x] 3.1 Crear modelo `AclaracionComparativa` en `apps/compras/prisma/schema.prisma` con campos: `id_aclaracion` (UUID PK), `tenant_id` (Uuid), `proyecto_id` (Uuid), `cuadro_id` (Uuid, FK â†’ CuadroComparativo onDelete Cascade), `insumo_id` (Uuid), `proveedor_id` (Uuid), `autor_id` (Uuid), `tipo` (VarChar 20 â€” `PREGUNTA` | `RESPUESTA`), `mensaje` (Text), `resuelta` (Boolean, default false), `created_at` (DateTime default now). Ãndices: `@@index([tenant_id, cuadro_id])`, `@@index([cuadro_id, insumo_id, proveedor_id])`. Map: `aclaraciones_comparativa`
- [x] 3.2 Ejecutar `npx prisma migrate dev --name add_comparativa_evaluacion_v2` en `apps/compras`
- [x] 3.3 Ejecutar `npx prisma generate` en `apps/compras`

## 4. Trigger SQL de inmutabilidad

- [x] 4.1 Crear script SQL `migrations/manual/add_locked_comparativa_trigger.sql` con la funciÃ³n `fn_prevent_locked_comparativa_modification()` y el trigger `trg_comparativa_locked` (ver spec `revision-firma-lock`)
- [x] 4.2 Documentar en el script que para deshabilitar temporalmente en futuras migraciones usar: `ALTER TABLE cuadros_comparativos DISABLE TRIGGER trg_comparativa_locked;` ... `ENABLE TRIGGER ...;`

## 5. Backend â€” Endpoint firmar

- [x] 5.1 Implementar `POST /api/v1/compras/comparativas/:id/firmar` â€” roles: `resident`, `admin`
  - Validar estado `EN_EVALUACION_TECNICA` â†’ 400 `ESTADO_INVALIDO_FIRMA` si no
  - Validar que no hay detalles con `evaluacion_tecnica = PENDIENTE` â†’ 400 `EVALUACION_INCOMPLETA`
  - Validar que no hay detalles con `evaluacion_tecnica = ?` â†’ 400 `EVALUACION_CON_PREGUNTAS_ABIERTAS`
  - Validar `primera_opcion_proveedor_id != null` â†’ 400 `PRIMERA_OPCION_REQUERIDA`
  - Validar que primera opciÃ³n no tenga detalles `NC` ni `?` en ese cuadro â†’ 400 `SELECCION_INVALIDA_NC`
  - En transacciÃ³n: setear `firmado_por`, `fecha_firma`, `estado = LOCKED`
  - DespuÃ©s de la transacciÃ³n: `logInfo` con `cuadro_id`, `codigo`, `requisicion_id`, `firmado_por`, `primera_opcion_proveedor_id`, `resumen_evaluacion: { total, c, nc, da }` â€” registro auditable permanente
  - Respuesta 200 con cuadro actualizado incluyendo `firmado_por` y `fecha_firma`

## 6. Backend â€” Endpoint nueva revisiÃ³n

- [x] 6.1 Implementar `POST /api/v1/compras/comparativas/:id/nueva-revision` â€” roles: `procurement`, `admin`
  - Validar estado `EN_EVALUACION_TECNICA` o `LOCKED` â†’ 400 si no
  - Calcular `siguiente_revision` (Aâ†’B, Bâ†’C, Câ†’D...)
  - En transacciÃ³n: clonar `CuadroComparativo` con nuevo UUID, `revision = siguiente_revision`, `revision_padre_id = id_original`, `estado = BORRADOR`; clonar todos sus `ComparativaDetalle` (nuevos UUIDs, `evaluacion_tecnica = PENDIENTE`, `valor_ofrecido_spec` copiado) y `ComparativaLinea` (nuevos UUIDs)
  - Cambiar cuadro original a `estado = SUPERSEDIDO`
  - Respuesta 201 con el nuevo cuadro clonado

## 7. Backend â€” Endpoints aclaraciones

- [x] 7.1 Implementar `POST /api/v1/compras/comparativas/:id/aclaraciones` â€” roles: `procurement`, `resident`, `admin`
  - Validar que el cuadro no estÃ¡ en `LOCKED`, `SUPERSEDIDO`, `CERRADO` â†’ 403 si estÃ¡ en esos estados
  - Validar que existe `ComparativaDetalle` para el par `(insumo_id, proveedor_id)` â†’ 404 si no
  - Crear `AclaracionComparativa`; respuesta 201
- [x] 7.2 Implementar `GET /api/v1/compras/comparativas/:id/aclaraciones` â€” mismos roles que ver comparativa; retorna array ordenado por `created_at ASC`; incluir campo `autor_nombre` (resolverlo desde `autor_id` llamando `GET /api/v1/auth/admin/users/:id` o simplemente devolver `autor_id` â€” preferir simplicidad)
- [x] 7.3 Implementar `PATCH /api/v1/compras/comparativas/:id/aclaraciones/:aid` â€” roles: `procurement`, `resident`, `admin`; solo acepta `{ resuelta: boolean }`; valida que el autor sea el del JWT o sea admin; respuesta 200

## 8. Backend â€” Actualizar endpoint de evaluaciÃ³n tÃ©cnica

- [x] 8.1 Actualizar `PUT /api/v1/compras/comparativas/:id/evaluar` (o el endpoint equivalente que actualiza `ComparativaDetalle`) para:
  - Aceptar `evaluacion_tecnica` con valores `C | NC | DA | ? | PENDIENTE`
  - Continuar aceptando `APROBADO | RECHAZADO` en lectura (sin error) pero en escritura nueva solo permitir C/NC/DA/?/PENDIENTE
  - Validar que si `evaluacion_tecnica = NC`, `DA` o `?`, `comentario_tecnico` no sea nulo/vacÃ­o â†’ 400
  - Si `evaluacion_tecnica = ?`: crear automÃ¡ticamente `AclaracionComparativa { tipo: 'PREGUNTA', autor_id: userId, insumo_id, proveedor_id, mensaje: comentario_tecnico, resuelta: false }` en la misma transacciÃ³n
  - Si `evaluacion_tecnica` cambia de `?` a `C/NC/DA`: marcar como `resuelta = true` todas las `AclaracionComparativa` de esa celda `(cuadro_id, insumo_id, proveedor_id)` en la misma transacciÃ³n
  - Validar que el cuadro no estÃ© LOCKED â†’ 403 `COMPARATIVA_LOCKED`
  - Aceptar y guardar `valor_ofrecido_spec` (Text libre)
- [x] 8.2 Implementar `PUT /api/v1/compras/comparativas/:id/seleccion` â€” roles: `resident`, `admin`
  - Validar cuadro en `EN_EVALUACION_TECNICA` y no LOCKED
  - Aceptar `{ primera_opcion_proveedor_id, segunda_opcion_proveedor_id? }`
  - Retorna 200 con cuadro actualizado

## 9. Backend â€” Ampliar GET comparativa con nuevos campos

- [x] 9.1 Verificar que `GET /api/v1/compras/comparativas/:id` incluye en la respuesta: `revision`, `firmado_por`, `fecha_firma`, `revision_padre_id`, `primera_opcion_proveedor_id`, `segunda_opcion_proveedor_id`
- [x] 9.2 Verificar que los `detalles` en la respuesta incluyen `valor_ofrecido_spec`
- [x] 9.3 Agregar campo `aclaraciones_count` en el payload de cada detalle (COUNT de aclaraciones no resueltas para esa celda) para que la UI pueda mostrar el indicador `?` sin un fetch extra

## 10. Frontend â€” ComparativaDetail: evaluaciÃ³n C/NC/DA

- [x] 10.1 Actualizar la interfaz `ComparativaDetalle` local con: `evaluacion_tecnica: 'PENDIENTE' | 'C' | 'NC' | 'DA' | 'APROBADO' | 'RECHAZADO'` (mantener legacy en tipo para compatibilidad de lectura), `valor_ofrecido_spec?: string`, `aclaraciones_count?: number`
- [x] 10.2 Reemplazar el selector binario APROBADO/RECHAZADO por cuatro botones: **C** (verde), **NC** (rojo), **DA** (amber), **?** (azul/indigo). Mostrar input de `comentario_tecnico` obligatorio cuando se elige NC, DA o ?. Para `?`, el label del input es "Â¿QuÃ© informaciÃ³n falta?" para guiar al Residente.
- [x] 10.3 Agregar celda editable `valor_ofrecido_spec` en cada par (partida Ã— proveedor) de la matriz â€” visible en modo lectura como texto, editable en `EN_EVALUACION_TECNICA` por el Residente
- [x] 10.4 Celdas con `evaluacion_tecnica = ?`: mostrar fondo azul/indigo tenue y badge `?` prominente. El badge `?` tambiÃ©n aparece (color gris) cuando hay aclaraciones no resueltas aunque la celda ya tenga C/NC/DA (seÃ±al de que hay contexto histÃ³rico). Al click en el badge abre el SideSheet de aclaraciones de esa celda.

## 11. Frontend â€” ComparativaDetail: aclaraciones

- [x] 11.1 Agregar estado `aclaraciones: AclaracionComparativa[]` y `aclaracionCelda: { insumo_id: string, proveedor_id: string } | null`
- [x] 11.2 Implementar `fetchAclaraciones(cuadroId)` que llama `GET /comparativas/:id/aclaraciones` y almacena por celda
- [x] 11.3 Implementar SideSheet de aclaraciones: hilo de mensajes con `tipo` (PREGUNTA = azul, RESPUESTA = gris), `autor_id` (mostrar userId truncado), `created_at`, `resuelta` (badge verde si ya resuelta). BotÃ³n "Agregar mensaje" con Select de tipo y Textarea. BotÃ³n "Marcar resuelta" por mensaje abierto.
- [x] 11.4 Al agregar un mensaje: `POST /comparativas/:id/aclaraciones`; refrescar fetch de aclaraciones; actualizar `aclaraciones_count` local

## 12. Frontend â€” ComparativaDetail: selecciÃ³n de proveedor y firma

- [x] 12.1 Agregar secciÃ³n "RecomendaciÃ³n del Residente" al final del cuadro (visible cuando estado = `EN_EVALUACION_TECNICA`): dos selects â€” "1Âª opciÃ³n" y "2Âª opciÃ³n" (lista de proveedores del cuadro); botÃ³n "Guardar selecciÃ³n" que llama `PUT /comparativas/:id/seleccion`
- [x] 12.2 Implementar modal de firma (dos pasos, no-dismissible):
  - BotÃ³n "Firmar evaluaciÃ³n" visible solo para `resident`/`admin` cuando estado = `EN_EVALUACION_TECNICA` y todos los renglones tienen C/NC/DA (sin PENDIENTE ni `?`). Color `red`.
  - **Paso 1 â€” modal no-dismissible** (no cierra con Escape ni clic fuera): mostrar cÃ³digo del cuadro, cÃ³digo de la requisiciÃ³n origen, nombre del firmante (del contexto de sesiÃ³n), tabla resumen (total renglones, conteo C/NC/DA, 1Âª y 2Âª opciÃ³n de proveedor), advertencia en rojo "Esta acciÃ³n es irreversible. Una vez firmada, la evaluaciÃ³n tÃ©cnica no podrÃ¡ modificarse por ningÃºn usuario.", checkbox con texto "Confirmo que revisÃ© personalmente cada renglÃ³n de esta requisiciÃ³n y acepto responsabilidad tÃ©cnica por esta evaluaciÃ³n."
  - BotÃ³n "Firmar y Bloquear" deshabilitado hasta que el checkbox estÃ© marcado.
  - **Paso 2 â€” al confirmar**: llamar `POST /comparativas/:id/firmar`; si Ã©xito cerrar modal y actualizar vista a LOCKED; si error mostrar mensaje especÃ­fico sin cerrar modal.
- [x] 12.3 Cuando estado = `LOCKED`: mostrar badge "ðŸ”’ LOCKED â€” Firmado por [userId] el [fecha_firma]" en el header. Todos los inputs de evaluaciÃ³n en modo solo lectura.

## 13. Frontend â€” ComparativaDetail: revisiones

- [x] 13.1 Mostrar badge "Rev A" (o B, C...) en el header del cuadro junto al cÃ³digo CC-2026-001
- [x] 13.2 Si el cuadro tiene `revision_padre_id`, mostrar enlace "Ver Rev anterior" que navega al cuadro padre (en modo solo lectura)
- [x] 13.3 Para `procurement`/`admin`: mostrar botÃ³n "Crear nueva revisiÃ³n" cuando el cuadro estÃ¡ en `EN_EVALUACION_TECNICA` o `LOCKED`. Al click: modal de confirmaciÃ³n â†’ `POST /comparativas/:id/nueva-revision` â†’ redirigir al nuevo cuadro clonado.
- [x] 13.4 Cuadros en estado `SUPERSEDIDO` se muestran con fondo gris y badge "SUPERSEDIDO â€” Ver Rev activa" que enlaza al cuadro hijo

## 14. Frontend â€” ResidenciaView: actualizar panel de evaluaciÃ³n tÃ©cnica

- [x] 14.1 El panel de evaluaciÃ³n tÃ©cnica del Residente (SideSheet) debe mostrar los nuevos controles C/NC/DA en lugar de APROBADO/RECHAZADO
- [x] 14.2 Agregar campo `valor_ofrecido_spec` visible en el panel (solo lectura â€” el Residente lo ve para tomar decisiÃ³n tÃ©cnica informada)
- [x] 14.3 Agregar indicador de aclaraciones por celda en el panel del Residente (mismo mecanismo del task 10.4)

## 15. Deploy y verificaciÃ³n en producciÃ³n

- [x] 15.1 Migrar schema en VPS: `docker exec bocam-vps-compras npx prisma migrate deploy`
- [x] 15.2 Aplicar trigger SQL manualmente: `docker exec -i bocam-vps-postgres psql -U bocam_user -d compras_db < migrations/manual/add_locked_comparativa_trigger.sql`
- [x] 15.3 Build y restart: `docker compose -f docker-compose.vps.yml up -d --build compras app-shell`
- [x] 15.4 Verificar: crear cuadro, evaluar partidas con C/NC/DA, intentar firmar sin primera opciÃ³n (debe fallar 400), asignar primera opciÃ³n, firmar â†’ badge LOCKED aparece
- [x] 15.5 Verificar: intentar editar un cuadro LOCKED desde Postman â†’ debe retornar 403
- [x] 15.6 Verificar: ejecutar `UPDATE cuadros_comparativos SET notas='test' WHERE estado='LOCKED'` directo en DB â†’ debe lanzar excepciÃ³n del trigger
- [x] 15.7 Verificar: crear aclaraciÃ³n en celda â†’ indicador `?` aparece â†’ marcar resuelta â†’ indicador desaparece
- [x] 15.8 Verificar: crear nueva revisiÃ³n desde un cuadro â†’ cuadro original pasa a SUPERSEDIDO â†’ nuevo cuadro tiene Rev B con evaluaciones en PENDIENTE
- [x] 15.9 Verificar: cuadros comparativos histÃ³ricos con evaluaciones `APROBADO`/`RECHAZADO` cargan sin error en la UI
