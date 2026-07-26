## Why

Hoy el alta de un empleado en `apps/personal` no abre un expediente real: no hay forma de adjuntar INE, comprobantes ni constancias de capacitación (DC-3/STPS); el único campo relacionado es `certificaciones`, un texto libre sin archivos. Tampoco existe vínculo de datos entre un empleado y el Residente que lo supervisa, ni una periodicidad de pago (semanal/quincenal/mensual) configurable y persistente por proyecto — hoy `PreNomina.periodo_tipo` solo soporta `SEMANAL`/`QUINCENAL` y se elige manualmente cada vez que RH corre el cálculo, en vez de ser una propiedad estable del proyecto que los empleados asignados heredan automáticamente. Sin estos tres datos completos, el ciclo asistencia → nómina fiscal/complementaria que RH necesita para operar no se puede cerrar correctamente.

## What Changes

- Nuevo submódulo de expediente digital por empleado: subir, listar y descargar documentos de contratación (INE, comprobante de domicilio, constancias de curso/capacitación) con metadatos (`tipo_documento`, `fecha_vigencia` opcional).
- Nuevo campo/relación de asignación de empleado a uno o más Residentes (usuarios con rol `residencia` del servicio `auth`), independiente de la cuadrilla y del frente de trabajo ya existentes.
- Nueva configuración persistente **por proyecto** de periodicidad de pago (`SEMANAL` | `QUINCENAL` | `MENSUAL`), reemplazando la elección ad-hoc por corrida de `PreNomina`. Todo empleado asignado a ese proyecto (vía cuadrilla, frente de trabajo o residente) hereda automáticamente esa periodicidad para su cálculo de nómina, sin configuración individual.
- **BREAKING**: `PreNomina.periodo_tipo` deja de aceptarse como parámetro libre en el cálculo; el motor de nómina lee la periodicidad configurada del proyecto. Corridas existentes en estado `BORRADOR`/`CALCULADA` deben recalcularse tras el despliegue.
- Soporte de `MENSUAL` en el motor de cálculo IMSS/ISR (tablas y prorrateo), que hoy solo contempla `SEMANAL`/`QUINCENAL`.
- Panel de RH con alertas de documentos próximos a vencer o ya vencidos (INE con vigencia, cursos/capacitaciones como DC-3), integrado al dashboard estándar de Personal y a una vista dedicada con el detalle por empleado.

## Capabilities

### New Capabilities
- `expediente-empleado`: alta, almacenamiento y consulta de documentos de contratación por empleado (INE, comprobante de domicilio, cursos/capacitaciones), con su propio almacenamiento en volumen scoped a `apps/personal` (sin depender del almacenamiento de Calidad).
- `asignacion-residente-empleado`: relación empleado ↔ residente(s), gestionada por RH, consultada por Residencia para acotar su vista de personal a cargo.
- `periodicidad-pago-proyecto`: configuración persistente de periodicidad de pago por proyecto, heredada automáticamente por los empleados asignados a él, y su uso en el cálculo de `PreNomina`.

### Modified Capabilities
- `motor-imss-isr`: agrega soporte de tabla ISR para periodicidad `MENSUAL` (hoy solo `SEMANAL`/`QUINCENAL`); la lectura de periodicidad del endpoint `calcular` se especifica en la nueva capability `periodicidad-pago-proyecto` (el acumulador semanal de horas extra de `calculo-nomina-por-horas` ya opera por semana natural y no requiere cambios).
- `endpoint-dashboard-rrhh`: agrega una alerta agregada de documentos por vencer/vencidos al array `alertas` ya existente.
- `dashboard-entrada-rrhh`: agrega el renglón de alerta de vencimiento de documentos al layout ya existente, con enlace al panel de detalle.

Nota: el detalle del panel (listado por empleado/documento) se especifica como requirement nuevo dentro de la capability `expediente-empleado`, ya creada en este mismo change — no amerita capability propia.

## Impact

- **Servicio afectado**: únicamente `apps/personal` (backend + Prisma schema + `PersonalView.tsx` en `app-shell`). Sin cruces a otros microservicios salvo lectura del catálogo de usuarios `residente` vía evento/consulta ya existente de `auth` (backend-to-backend, como permite CLAUDE.md).
- **Prisma**: nuevas tablas `DocumentoEmpleado`, `AsignacionResidente` y `ConfigNominaProyecto` (`tenant_id`, `proyecto_id`, `periodicidad_pago`, único por `[tenant_id, proyecto_id]`); migración de datos para poblar `ConfigNominaProyecto.periodicidad_pago` desde el `periodo_tipo` de la `PreNomina` más reciente de cada proyecto.
- **Endpoints nuevos**: `POST/GET/DELETE /api/v1/personal/empleados/:id/documentos`, `POST/GET /api/v1/personal/empleados/:id/residentes`, `GET /api/v1/personal/documentos/por-vencer`, `PUT/GET /api/v1/personal/config-nomina` (opera sobre el proyecto activo del JWT, como el resto de endpoints del servicio).
- **Endpoints modificados**: `POST /api/v1/personal/prenominas/calcular` dejará de aceptar `periodo_tipo` en el body (lo toma de `ConfigNominaProyecto`); `GET /api/v1/personal/dashboard` agrega alerta agregada de vencimientos.
- **Frontend**: nueva sección "Expediente" y "Residente(s) asignado(s)" en el panel de configuración de empleado de `PersonalView.tsx`; el selector de periodicidad se mueve de la pantalla de "Calcular nómina" a un selector general por proyecto (no por empleado); nuevo panel/tab "Vencimientos" con el detalle de documentos por vencer o vencidos.
- **Parcialmente en alcance**: el hallazgo de doble pago multiproyecto tiene su mecanismo central (falta de filtro por proyecto en `calcular`, ver design.md decisión 4.1) corregido aquí, porque es prerequisito de `ConfigNominaProyecto` — sin esto, la periodicidad por proyecto no tendría efecto real. No se declara resuelto el hallazgo en su generalidad.
- **Fuera de alcance** (hallazgos ya documentados, requieren bug-fix cycle propio con su propio spec, no se tocan en este change): tope semanal de horas extra inconsistente entre `JORNADA_COMPLETA`/`POR_HORAS`, asistencia QR decorativa en frontend, tab "Nómina" de `ResidenciaView.tsx` desconectado del backend.
