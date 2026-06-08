# Tasks — comparativa-evaluacion-v2

> Prerequisito: `proveedores-catalogo-v2` debe estar desplegado en producción antes del deploy de este change.

## 1. Schema compras — Ampliar CuadroComparativo

- [ ] 1.1 Agregar en modelo `CuadroComparativo` en `apps/compras/prisma/schema.prisma`: `revision` (VarChar 5, default `"A"`), `firmado_por` (Uuid, nullable), `fecha_firma` (DateTime, nullable), `revision_padre_id` (Uuid, nullable — self-reference sin `@relation` ya que Prisma no requiere FK explícita aquí), `primera_opcion_proveedor_id` (Uuid, nullable), `segunda_opcion_proveedor_id` (Uuid, nullable)
- [ ] 1.2 Agregar los nuevos estados al comentario de estados del modelo: `LOCKED`, `SUPERSEDIDO`
- [ ] 1.3 Agregar relación `aclaraciones AclaracionComparativa[]` en `CuadroComparativo`

## 2. Schema compras — Ampliar ComparativaDetalle

- [ ] 2.1 Agregar campo `valor_ofrecido_spec` (Text, nullable) en modelo `ComparativaDetalle`
- [ ] 2.2 Actualizar el comentario del campo `evaluacion_tecnica` para documentar los nuevos valores válidos: `PENDIENTE | C | NC | DA | ?` (los valores históricos `APROBADO | RECHAZADO` se aceptan en lectura pero no en escritura nueva)

## 3. Schema compras — Modelo AclaracionComparativa

- [ ] 3.1 Crear modelo `AclaracionComparativa` en `apps/compras/prisma/schema.prisma` con campos: `id_aclaracion` (UUID PK), `tenant_id` (Uuid), `proyecto_id` (Uuid), `cuadro_id` (Uuid, FK → CuadroComparativo onDelete Cascade), `insumo_id` (Uuid), `proveedor_id` (Uuid), `autor_id` (Uuid), `tipo` (VarChar 20 — `PREGUNTA` | `RESPUESTA`), `mensaje` (Text), `resuelta` (Boolean, default false), `created_at` (DateTime default now). Índices: `@@index([tenant_id, cuadro_id])`, `@@index([cuadro_id, insumo_id, proveedor_id])`. Map: `aclaraciones_comparativa`
- [ ] 3.2 Ejecutar `npx prisma migrate dev --name add_comparativa_evaluacion_v2` en `apps/compras`
- [ ] 3.3 Ejecutar `npx prisma generate` en `apps/compras`

## 4. Trigger SQL de inmutabilidad

- [ ] 4.1 Crear script SQL `migrations/manual/add_locked_comparativa_trigger.sql` con la función `fn_prevent_locked_comparativa_modification()` y el trigger `trg_comparativa_locked` (ver spec `revision-firma-lock`)
- [ ] 4.2 Documentar en el script que para deshabilitar temporalmente en futuras migraciones usar: `ALTER TABLE cuadros_comparativos DISABLE TRIGGER trg_comparativa_locked;` ... `ENABLE TRIGGER ...;`

## 5. Backend — Endpoint firmar

- [ ] 5.1 Implementar `POST /api/v1/compras/comparativas/:id/firmar` — roles: `resident`, `admin`
  - Validar estado `EN_EVALUACION_TECNICA` → 400 `ESTADO_INVALIDO_FIRMA` si no
  - Validar que no hay detalles con `evaluacion_tecnica = PENDIENTE` → 400 `EVALUACION_INCOMPLETA`
  - Validar que no hay detalles con `evaluacion_tecnica = ?` → 400 `EVALUACION_CON_PREGUNTAS_ABIERTAS`
  - Validar `primera_opcion_proveedor_id != null` → 400 `PRIMERA_OPCION_REQUERIDA`
  - Validar que primera opción no tenga detalles `NC` ni `?` en ese cuadro → 400 `SELECCION_INVALIDA_NC`
  - En transacción: setear `firmado_por`, `fecha_firma`, `estado = LOCKED`
  - Después de la transacción: `logInfo` con `cuadro_id`, `codigo`, `requisicion_id`, `firmado_por`, `primera_opcion_proveedor_id`, `resumen_evaluacion: { total, c, nc, da }` — registro auditable permanente
  - Respuesta 200 con cuadro actualizado incluyendo `firmado_por` y `fecha_firma`

## 6. Backend — Endpoint nueva revisión

- [ ] 6.1 Implementar `POST /api/v1/compras/comparativas/:id/nueva-revision` — roles: `procurement`, `admin`
  - Validar estado `EN_EVALUACION_TECNICA` o `LOCKED` → 400 si no
  - Calcular `siguiente_revision` (A→B, B→C, C→D...)
  - En transacción: clonar `CuadroComparativo` con nuevo UUID, `revision = siguiente_revision`, `revision_padre_id = id_original`, `estado = BORRADOR`; clonar todos sus `ComparativaDetalle` (nuevos UUIDs, `evaluacion_tecnica = PENDIENTE`, `valor_ofrecido_spec` copiado) y `ComparativaLinea` (nuevos UUIDs)
  - Cambiar cuadro original a `estado = SUPERSEDIDO`
  - Respuesta 201 con el nuevo cuadro clonado

## 7. Backend — Endpoints aclaraciones

- [ ] 7.1 Implementar `POST /api/v1/compras/comparativas/:id/aclaraciones` — roles: `procurement`, `resident`, `admin`
  - Validar que el cuadro no está en `LOCKED`, `SUPERSEDIDO`, `CERRADO` → 403 si está en esos estados
  - Validar que existe `ComparativaDetalle` para el par `(insumo_id, proveedor_id)` → 404 si no
  - Crear `AclaracionComparativa`; respuesta 201
- [ ] 7.2 Implementar `GET /api/v1/compras/comparativas/:id/aclaraciones` — mismos roles que ver comparativa; retorna array ordenado por `created_at ASC`; incluir campo `autor_nombre` (resolverlo desde `autor_id` llamando `GET /api/v1/auth/admin/users/:id` o simplemente devolver `autor_id` — preferir simplicidad)
- [ ] 7.3 Implementar `PATCH /api/v1/compras/comparativas/:id/aclaraciones/:aid` — roles: `procurement`, `resident`, `admin`; solo acepta `{ resuelta: boolean }`; valida que el autor sea el del JWT o sea admin; respuesta 200

## 8. Backend — Actualizar endpoint de evaluación técnica

- [ ] 8.1 Actualizar `PUT /api/v1/compras/comparativas/:id/evaluar` (o el endpoint equivalente que actualiza `ComparativaDetalle`) para:
  - Aceptar `evaluacion_tecnica` con valores `C | NC | DA | ? | PENDIENTE`
  - Continuar aceptando `APROBADO | RECHAZADO` en lectura (sin error) pero en escritura nueva solo permitir C/NC/DA/?/PENDIENTE
  - Validar que si `evaluacion_tecnica = NC`, `DA` o `?`, `comentario_tecnico` no sea nulo/vacío → 400
  - Si `evaluacion_tecnica = ?`: crear automáticamente `AclaracionComparativa { tipo: 'PREGUNTA', autor_id: userId, insumo_id, proveedor_id, mensaje: comentario_tecnico, resuelta: false }` en la misma transacción
  - Si `evaluacion_tecnica` cambia de `?` a `C/NC/DA`: marcar como `resuelta = true` todas las `AclaracionComparativa` de esa celda `(cuadro_id, insumo_id, proveedor_id)` en la misma transacción
  - Validar que el cuadro no esté LOCKED → 403 `COMPARATIVA_LOCKED`
  - Aceptar y guardar `valor_ofrecido_spec` (Text libre)
- [ ] 8.2 Implementar `PUT /api/v1/compras/comparativas/:id/seleccion` — roles: `resident`, `admin`
  - Validar cuadro en `EN_EVALUACION_TECNICA` y no LOCKED
  - Aceptar `{ primera_opcion_proveedor_id, segunda_opcion_proveedor_id? }`
  - Retorna 200 con cuadro actualizado

## 9. Backend — Ampliar GET comparativa con nuevos campos

- [ ] 9.1 Verificar que `GET /api/v1/compras/comparativas/:id` incluye en la respuesta: `revision`, `firmado_por`, `fecha_firma`, `revision_padre_id`, `primera_opcion_proveedor_id`, `segunda_opcion_proveedor_id`
- [ ] 9.2 Verificar que los `detalles` en la respuesta incluyen `valor_ofrecido_spec`
- [ ] 9.3 Agregar campo `aclaraciones_count` en el payload de cada detalle (COUNT de aclaraciones no resueltas para esa celda) para que la UI pueda mostrar el indicador `?` sin un fetch extra

## 10. Frontend — ComparativaDetail: evaluación C/NC/DA

- [ ] 10.1 Actualizar la interfaz `ComparativaDetalle` local con: `evaluacion_tecnica: 'PENDIENTE' | 'C' | 'NC' | 'DA' | 'APROBADO' | 'RECHAZADO'` (mantener legacy en tipo para compatibilidad de lectura), `valor_ofrecido_spec?: string`, `aclaraciones_count?: number`
- [ ] 10.2 Reemplazar el selector binario APROBADO/RECHAZADO por cuatro botones: **C** (verde), **NC** (rojo), **DA** (amber), **?** (azul/indigo). Mostrar input de `comentario_tecnico` obligatorio cuando se elige NC, DA o ?. Para `?`, el label del input es "¿Qué información falta?" para guiar al Residente.
- [ ] 10.3 Agregar celda editable `valor_ofrecido_spec` en cada par (partida × proveedor) de la matriz — visible en modo lectura como texto, editable en `EN_EVALUACION_TECNICA` por el Residente
- [ ] 10.4 Celdas con `evaluacion_tecnica = ?`: mostrar fondo azul/indigo tenue y badge `?` prominente. El badge `?` también aparece (color gris) cuando hay aclaraciones no resueltas aunque la celda ya tenga C/NC/DA (señal de que hay contexto histórico). Al click en el badge abre el SideSheet de aclaraciones de esa celda.

## 11. Frontend — ComparativaDetail: aclaraciones

- [ ] 11.1 Agregar estado `aclaraciones: AclaracionComparativa[]` y `aclaracionCelda: { insumo_id: string, proveedor_id: string } | null`
- [ ] 11.2 Implementar `fetchAclaraciones(cuadroId)` que llama `GET /comparativas/:id/aclaraciones` y almacena por celda
- [ ] 11.3 Implementar SideSheet de aclaraciones: hilo de mensajes con `tipo` (PREGUNTA = azul, RESPUESTA = gris), `autor_id` (mostrar userId truncado), `created_at`, `resuelta` (badge verde si ya resuelta). Botón "Agregar mensaje" con Select de tipo y Textarea. Botón "Marcar resuelta" por mensaje abierto.
- [ ] 11.4 Al agregar un mensaje: `POST /comparativas/:id/aclaraciones`; refrescar fetch de aclaraciones; actualizar `aclaraciones_count` local

## 12. Frontend — ComparativaDetail: selección de proveedor y firma

- [ ] 12.1 Agregar sección "Recomendación del Residente" al final del cuadro (visible cuando estado = `EN_EVALUACION_TECNICA`): dos selects — "1ª opción" y "2ª opción" (lista de proveedores del cuadro); botón "Guardar selección" que llama `PUT /comparativas/:id/seleccion`
- [ ] 12.2 Implementar modal de firma (dos pasos, no-dismissible):
  - Botón "Firmar evaluación" visible solo para `resident`/`admin` cuando estado = `EN_EVALUACION_TECNICA` y todos los renglones tienen C/NC/DA (sin PENDIENTE ni `?`). Color `red`.
  - **Paso 1 — modal no-dismissible** (no cierra con Escape ni clic fuera): mostrar código del cuadro, código de la requisición origen, nombre del firmante (del contexto de sesión), tabla resumen (total renglones, conteo C/NC/DA, 1ª y 2ª opción de proveedor), advertencia en rojo "Esta acción es irreversible. Una vez firmada, la evaluación técnica no podrá modificarse por ningún usuario.", checkbox con texto "Confirmo que revisé personalmente cada renglón de esta requisición y acepto responsabilidad técnica por esta evaluación."
  - Botón "Firmar y Bloquear" deshabilitado hasta que el checkbox esté marcado.
  - **Paso 2 — al confirmar**: llamar `POST /comparativas/:id/firmar`; si éxito cerrar modal y actualizar vista a LOCKED; si error mostrar mensaje específico sin cerrar modal.
- [ ] 12.3 Cuando estado = `LOCKED`: mostrar badge "🔒 LOCKED — Firmado por [userId] el [fecha_firma]" en el header. Todos los inputs de evaluación en modo solo lectura.

## 13. Frontend — ComparativaDetail: revisiones

- [ ] 13.1 Mostrar badge "Rev A" (o B, C...) en el header del cuadro junto al código CC-2026-001
- [ ] 13.2 Si el cuadro tiene `revision_padre_id`, mostrar enlace "Ver Rev anterior" que navega al cuadro padre (en modo solo lectura)
- [ ] 13.3 Para `procurement`/`admin`: mostrar botón "Crear nueva revisión" cuando el cuadro está en `EN_EVALUACION_TECNICA` o `LOCKED`. Al click: modal de confirmación → `POST /comparativas/:id/nueva-revision` → redirigir al nuevo cuadro clonado.
- [ ] 13.4 Cuadros en estado `SUPERSEDIDO` se muestran con fondo gris y badge "SUPERSEDIDO — Ver Rev activa" que enlaza al cuadro hijo

## 14. Frontend — ResidenciaView: actualizar panel de evaluación técnica

- [ ] 14.1 El panel de evaluación técnica del Residente (SideSheet) debe mostrar los nuevos controles C/NC/DA en lugar de APROBADO/RECHAZADO
- [ ] 14.2 Agregar campo `valor_ofrecido_spec` visible en el panel (solo lectura — el Residente lo ve para tomar decisión técnica informada)
- [ ] 14.3 Agregar indicador de aclaraciones por celda en el panel del Residente (mismo mecanismo del task 10.4)

## 15. Deploy y verificación en producción

- [ ] 15.1 Migrar schema en VPS: `docker exec bocam-vps-compras npx prisma migrate deploy`
- [ ] 15.2 Aplicar trigger SQL manualmente: `docker exec -i bocam-vps-postgres psql -U bocam_user -d compras_db < migrations/manual/add_locked_comparativa_trigger.sql`
- [ ] 15.3 Build y restart: `docker compose -f docker-compose.vps.yml up -d --build compras app-shell`
- [ ] 15.4 Verificar: crear cuadro, evaluar partidas con C/NC/DA, intentar firmar sin primera opción (debe fallar 400), asignar primera opción, firmar → badge LOCKED aparece
- [ ] 15.5 Verificar: intentar editar un cuadro LOCKED desde Postman → debe retornar 403
- [ ] 15.6 Verificar: ejecutar `UPDATE cuadros_comparativos SET notas='test' WHERE estado='LOCKED'` directo en DB → debe lanzar excepción del trigger
- [ ] 15.7 Verificar: crear aclaración en celda → indicador `?` aparece → marcar resuelta → indicador desaparece
- [ ] 15.8 Verificar: crear nueva revisión desde un cuadro → cuadro original pasa a SUPERSEDIDO → nuevo cuadro tiene Rev B con evaluaciones en PENDIENTE
- [ ] 15.9 Verificar: cuadros comparativos históricos con evaluaciones `APROBADO`/`RECHAZADO` cargan sin error en la UI
