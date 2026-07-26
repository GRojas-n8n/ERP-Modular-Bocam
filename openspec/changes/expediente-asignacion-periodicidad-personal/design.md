## Context

`apps/personal` ya tiene un modelo `Empleado` maduro (puesto, salario, jornada, `ConfigDeduccionEmpleado` con Infonavit) y un motor de nómina (`PreNomina`/`PreNominaDetalle`/`NominaComplementaria`) que calcula IMSS/ISR a partir de `RegistroAsistencia`. Falta cerrar tres huecos de datos que RH necesita antes de calcular una nómina correcta: expediente documental, responsable (Residente) del empleado, y periodicidad de pago persistente. Por regla del proyecto, este change toca únicamente `apps/personal` (backend + Prisma + `PersonalView.tsx`); el rol `residencia` y su identidad viven en `auth`, así que la relación empleado↔residente se guarda como referencia opaca (mismo patrón ya usado para `capataz_id`, `elaborado_por`, `autorizado_por`: `String @db.Uuid` sin relation cruzada), resuelta a nombre vía llamada backend-to-backend a `auth` solo para mostrar en UI.

Ya existe en Calidad un patrón de almacenamiento de archivos en volumen (`almacenamiento-archivos`: tipos permitidos, límite 50 MB, ruta `/data/{servicio}/uploads/{tenant_id}/...`). Este change replica ese patrón dentro de `apps/personal` en vez de depender del servicio de Calidad, respetando que cada microservicio es independiente.

## Goals / Non-Goals

**Goals:**
- Permitir a RH adjuntar y consultar documentos de contratación por empleado (INE, comprobante de domicilio, constancias DC-3/capacitación).
- Permitir a RH asignar uno o más Residentes responsables a cada empleado.
- Configurar la periodicidad de pago (`SEMANAL`/`QUINCENAL`/`MENSUAL`) de forma persistente **por proyecto**, heredada automáticamente por todo empleado asignado a ese proyecto, y que el motor de nómina la use en vez de recibirla como parámetro libre de la corrida.
- Extender el motor IMSS/ISR para calcular correctamente en periodicidad `MENSUAL`.

**Non-Goals:**
- No se corrige aquí el hallazgo de doble pago en multiproyecto **en su generalidad**, el tope de horas extra inconsistente, el mock de QR, ni el tab de nómina desconectado en `ResidenciaView.tsx` — cada uno requiere su propio bug-fix cycle (spec de bug → test que reproduce → fix), por regla de CLAUDE.md. Excepción explícita (ver Decisión 4.1): el scoping de empleados por proyecto dentro de `calcular` SÍ se corrige aquí, porque es un prerequisito funcional de `ConfigNominaProyecto` — sin él, la periodicidad por proyecto no tiene ningún efecto real.
- No se construye un sistema de permisos de documentos por tipo (versionado, aprobación) como el de Calidad — el expediente es de solo carga/consulta/baja, sin flujo de versiones.
- No se modela aquí un rol nuevo ni cambios en `auth`; se asume que los usuarios con rol `residencia` ya existen y se consultan por id.

## Decisions

**1. Expediente como tabla propia `DocumentoEmpleado`, no campo JSON.**
Reemplaza el uso de `certificaciones` (texto libre) para el caso de archivos reales. Campos: `id_documento`, `tenant_id`, `empleado_id`, `tipo_documento` (`INE` | `COMPROBANTE_DOMICILIO` | `CURSO_CAPACITACION` | `CONTRATO` | `OTRO`), `nombre_archivo`, `ruta_archivo`, `mime_type`, `tamano_bytes`, `fecha_vigencia` (nullable — aplica a cursos con caducidad como DC-3), `subido_por`, `created_at`. El campo `certificaciones` existente NO se elimina (es legacy, protegido por regla de no tocar código sin spec que lo cubra); queda en desuso a favor del expediente nuevo. Se agrega índice `[tenant_id, fecha_vigencia]` para soportar la consulta de vencimientos sin escanear toda la tabla.
Alternativa descartada: extender `certificaciones` a JSON estructurado con URLs — no permite metadatos por archivo (vigencia, tipo, tamaño) ni queries/índices, y mezclaría concerns de "cuadro de certificaciones" con "archivo binario".

**2. Almacenamiento en volumen propio, mismo patrón que Calidad.**
Ruta `/data/personal/uploads/{tenant_id}/{empleado_id}/{documento_id}{extension}`. Mismos límites que `almacenamiento-archivos`: tipos permitidos `.pdf .jpg .jpeg .png .docx` (INE/comprobantes/constancias, sin `.dwg/.dxf` que no aplican a RH), máximo 50 MB, transacción archivo+registro con rollback igual que Calidad (si falla BD tras guardar archivo, se borra el archivo).
Alternativa descartada: reusar el endpoint de Calidad (`/api/v1/calidad/documentos`) desde `apps/personal` — viola la regla de "no cross-service en frontend" y acopla el ciclo de vida de RH al de Calidad.

**3. Asignación a Residente(s) como tabla puente N:N con historial simple.**
`AsignacionResidente`: `id_asignacion`, `tenant_id`, `empleado_id`, `residente_id` (`String @db.Uuid`, sin relation — igual que `capataz_id`), `fecha_inicio`, `fecha_fin` (nullable = vigente), `asignado_por`. Permite múltiples residentes vigentes simultáneos para el mismo empleado (turnos, coberturas), tal como pidió el usuario ("o residentes"). El nombre del residente se resuelve en el endpoint de lectura con una llamada opcional a `auth` (`GET /api/v1/auth/usuarios/:id` o equivalente ya existente); si falla, se retorna solo el `residente_id` (`parcial: true`, siguiendo la convención ya usada en dashboards backend-to-backend de CLAUDE.md).
Alternativa descartada: campo único `residente_id` en `Empleado` — no cubre "o residentes" (múltiples) y no deja historial de reasignación.

**4. Periodicidad de pago persistente por proyecto (`ConfigNominaProyecto`), no por empleado ni en la corrida de `PreNomina`.**
`apps/personal` no tiene entidad `Proyecto` propia (el `proyecto_id` es una referencia opaca a GT, sin JOIN cruzado — mismo patrón que el resto del schema). Se agrega una tabla nueva `ConfigNominaProyecto` (`id_config`, `tenant_id`, `proyecto_id`, `periodicidad_pago` [`SEMANAL`|`QUINCENAL`|`MENSUAL`, default `SEMANAL`], `configurado_por`, `updated_at`), única por `[tenant_id, proyecto_id]`. RH la edita desde un selector general (no por empleado). El endpoint `calcular` deja de recibir `periodo_tipo` en el body: lee `ConfigNominaProyecto.periodicidad_pago` del `proyecto_id` de la corrida (si no existe config, usa default `SEMANAL`) y genera la `PreNomina` de ese proyecto con esa periodicidad. Todo empleado asignado al proyecto (vía `Cuadrilla.proyecto_id`, `AsignacionFrente.proyecto_id` o el nuevo residente) hereda la periodicidad automáticamente — no hay campo de periodicidad en `Empleado`. Esto es **BREAKING** para el contrato del endpoint.
Alternativa descartada (per-empleado, diseño anterior de este mismo change): campo `Empleado.periodicidad_pago` con agrupado en múltiples `PreNomina` por corrida — el usuario aclaró explícitamente que el selector debe ser general por proyecto, no por empleado, para que la asignación de un empleado a un proyecto (vía su Residente) determine su periodicidad automáticamente sin configuración individual.
Alternativa descartada (mantener en el body de `calcular`): igual que antes, no resuelve que RH deba re-elegir en cada corrida en vez de que sea una propiedad estable del proyecto.

**4.1. Prerequisito ahora IN SCOPE: `calcular` debe filtrar empleados por proyecto real, no solo por tenant.**
Al implementar la Decisión 4 se encontró que `Empleado` **no tiene columna `proyecto_id`** y que `POST /prenominas/calcular` (main.ts:500) hoy hace `prisma.empleado.findMany({ where: { estado: 'ACTIVO' } })` — sin filtro de proyecto, solo el `tenant_id` que impone RLS. Es decir, el "filtro por proyecto ya existente" que asumía la Decisión 4 originalmente **no existe**: es el mecanismo central del hallazgo ya documentado de doble pago multiproyecto. Sin corregirlo, `ConfigNominaProyecto` no tiene nada real que agrupar (todo proyecto del tenant calcularía sobre el mismo pool de empleados). El usuario confirmó incluir este fix de scoping aquí como prerequisito.
Implementación: `calcular` obtiene el conjunto de `empleado_id` elegibles del proyecto como la unión de (a) empleados con `AsignacionFrente` en estado `ACTIVA` y `proyecto_id` = el de la corrida, y (b) empleados cuyo `cuadrilla_id` apunta a una `Cuadrilla` con ese mismo `proyecto_id` (fallback para empleados asignados solo por cuadrilla, sin frente explícito). Luego se aplica `estado = 'ACTIVO'` como ya hacía.
Alcance de lo que este fix NO cierra: no toca cómo otros endpoints de `apps/personal` (fuera de `calcular`) leen `Empleado`, ni corrige el hallazgo en su generalidad si existieran más síntomas del mismo bug reportados en otros flujos — solo asegura que `calcular` (y por tanto `ConfigNominaProyecto`) escoge al empleado correcto por proyecto.

**5. Motor IMSS/ISR: `MENSUAL` como periodicidad de primera clase.**
`calcularISR`/`calcularSubsidio` (hoy solo `SEMANAL`/`QUINCENAL`) reciben tabla de ISR mensual real (tarifa del artículo 96 LISR mensual, ya tabulada en `tablas-fiscales.ts` para otros usos fiscales del sistema si existe, o se agrega). Días del período para `MENSUAL` se calculan por mes calendario (no por factor 30.4 aproximado), consistente con cómo `QUINCENAL` ya usa fechas calendario exactas.

**6. Alertas de vencimiento calculadas en tiempo real, sin cron ni tabla propia.**
El vencimiento se deriva directamente de `DocumentoEmpleado.fecha_vigencia` en cada lectura (`dashboard` y el nuevo endpoint `documentos/por-vencer`), igual que `asistencia_hoy` en el dashboard actual ya se calcula en tiempo real "no cacheado". Umbral por defecto: **30 días** antes de `fecha_vigencia` para severidad `advertencia`, y vencido (`fecha_vigencia < hoy`) para severidad `critica`. El umbral es un query param opcional (`?dias=N`) en el endpoint de detalle, no una configuración persistida por tenant (se puede agregar después si RH lo pide).
Alternativa descartada: job programado (cron) que precalcule alertas en una tabla — agrega infraestructura (scheduler) y una fuente de verdad adicional que puede desincronizarse; con el volumen esperado de documentos por tenant, una query en tiempo real con índice en `fecha_vigencia` es suficiente.

## Risks / Trade-offs

- **[Riesgo] Migración de `PreNomina.periodo_tipo` histórico → `ConfigNominaProyecto` puede clasificar mal proyectos sin corridas recientes.** → Mitigación: default explícito `SEMANAL` para proyectos sin `PreNomina` previa; RH revisa y ajusta el selector general antes de la primera corrida post-deploy (tarea de migración incluye reporte de proyectos migrados por default vs por histórico).
- **[Riesgo] Cambio breaking en `POST /prenominas/calcular` rompe a `PersonalView.tsx` si no se actualiza en el mismo PR.** → Mitigación: el frontend se actualiza en el mismo change (tasks.md lo cubre); no se despliega backend y frontend por separado.
- **[Riesgo → ahora mitigado con fix incluido] Leer la periodicidad desde `ConfigNominaProyecto` sin corregir el scoping agravaría el hallazgo ya conocido de doble pago multiproyecto.** → Mitigación (decisión 4.1, IN SCOPE): `calcular` ahora filtra empleados por `AsignacionFrente`/`Cuadrilla` del `proyecto_id` real antes de aplicar la periodicidad, en vez de asumir un filtro que no existía. Esto cierra el mecanismo central del bug para este endpoint específico, aunque no se declara resuelto el hallazgo en su generalidad (podría haber otros síntomas en otros endpoints que sigan pendientes de su propio bug-fix cycle).
- **[Riesgo] Un proyecto que en la práctica necesite periodicidades mixtas (ej. personal de planta semanal + administrativos mensuales) no queda soportado.** → Aceptado como decisión de producto explícita del usuario: la periodicidad es una propiedad del proyecto, no del empleado. Si surge la necesidad real de mezclar, requiere un change futuro.
- **[Riesgo] Expediente con documentos sensibles (INE) en un módulo ya marcado "Estrictamente Confidencial".** → Mitigación: endpoints de documentos requieren rol `personal_rh` o `admin` (mismo `requireRoles` que el resto de endpoints de ficha de empleado); sin acceso de solo-lectura para otros roles, a diferencia de Calidad que sí da lectura a `superintendent`.
- **[Trade-off] `residente_id` sin FK a `auth` (por regla "sin JOINs cruzados")** implica que si el usuario residente se borra en `auth`, `AsignacionResidente` puede quedar con un id huérfano. → Aceptado: mismo trade-off ya existente en `capataz_id`/`autorizado_por`; se resuelve mostrando "Usuario no encontrado" en UI si la consulta a `auth` no encuentra el id, no bloquea el dato.

- **[Riesgo] Documentos sin vigencia (INE, contrato) no deben generar falsas alertas.** → Mitigación: la consulta de vencimientos solo considera `DocumentoEmpleado` con `fecha_vigencia != null`; documentos sin vigencia (INE, contrato) quedan naturalmente excluidos.

## Migration Plan

1. Migración Prisma: crear tablas `DocumentoEmpleado`, `AsignacionResidente` y `ConfigNominaProyecto`.
2. Script de backfill: para cada `proyecto_id` distinto visto en `PreNomina`, buscar su `PreNomina` más reciente y crear `ConfigNominaProyecto` con ese `periodo_tipo`; proyectos sin histórico quedan sin registro (el endpoint usa default `SEMANAL` en ausencia de config). Loggear cuántos proyectos quedaron migrados por histórico vs por default.
3. Desplegar backend (`apps/personal`) y frontend (`PersonalView.tsx`) en el mismo release — el cambio de contrato de `calcular` es breaking.
4. Verificación manual post-deploy: RH sube un documento de prueba, asigna un residente, configura la periodicidad del proyecto, corre una nómina y confirma que usa la periodicidad correcta.
5. Rollback: si la lectura de periodicidad por proyecto causa corridas incorrectas, revertir el deploy del backend+frontend juntos (no hay forma segura de revertir solo uno dado el cambio de contrato); las tablas nuevas (`DocumentoEmpleado`, `AsignacionResidente`, `ConfigNominaProyecto`) no afectan datos existentes y no requieren rollback de schema.

## Open Questions

- ¿El motor IMSS/ISR mensual ya tiene tabla fiscal disponible en `tablas-fiscales.ts` o hay que agregarla desde cero con las tarifas SAT vigentes? — a confirmar durante tasks (afecta esfuerzo de la tarea del motor).
- ¿RH puede desasignar un residente (poner `fecha_fin`) sin borrar el historial, o basta con reemplazar? Se asume que sí se conserva historial (soft-end), a validar con el usuario si RH pide borrado físico.
