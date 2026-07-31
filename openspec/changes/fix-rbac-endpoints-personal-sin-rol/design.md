## Context

`apps/personal/src/main.ts` monta un único middleware global de
autenticación (`createAuthMiddleware`) y de acceso a proyecto
(`requireProjectAccess()`), pero el candado de rol de negocio
(`requireRoles(...)`) se aplica ruta por ruta, no de forma centralizada.
Eso ya produjo, en este mismo archivo, endpoints hermanos con protección
distinta para operaciones equivalentes: `POST /empleados/importar-lote`
exige `personal_rh`/`admin` pero `POST /empleados` (alta individual) no
exige nada; `PATCH /empleados/:id` exige rol pero `PATCH
/empleados/:id/baja` no. No hay una capa de política central (se
verificó que `packages/auth-middleware/src` no contiene un mapa de
rutas→roles) — cada ruta declara su propio candado inline, así que un
candado faltante no se nota hasta que alguien audita el archivo completo.

## Goals / Non-Goals

**Goals:**
- Cerrar el gap de RBAC en los 6 endpoints identificados, alineándolos
  con el patrón `requireRoles('personal_rh', 'admin')` que ya usan sus
  endpoints hermanos.
- Dejar test de regresión por endpoint que falle en rojo sin el fix
  (403 esperado, hoy responde 2xx) y pase en verde con el fix.

**Non-Goals:**
- No se audita ni corrige el resto del archivo `main.ts` en este change
  (por ejemplo, la asimetría de validación de proyecto entre
  `/asistencia/registro` manual y `/asistencia/escanear` QR, o el
  cálculo inconsistente de horas extra semanales) — son hallazgos
  distintos, cada uno necesita su propio spec.
- No se introduce una capa de política de roles centralizada
  (route→roles map). Se sigue el patrón existente de `requireRoles(...)`
  inline por ruta para minimizar el diff y el riesgo de este fix.
- No se cambian los roles de negocio existentes (`personal_rh`,
  `admin`) ni se crean roles nuevos.

## Decisions

- **Rol requerido: `personal_rh` o `admin` en los 6 endpoints.**
  Alternativa considerada: usar roles distintos por endpoint (p. ej.
  permitir `residencia` en `POST /asignaciones` ya que Residencia es
  quien coordina frentes de trabajo en campo). Se descarta porque no hay
  evidencia en las specs existentes ni en el frontend
  (`ResidenciaView.tsx` solo hace `GET /cuadrillas`, ninguna llamada
  mutable a estos 6 endpoints) de que Residencia deba tener este acceso
  hoy; y porque `personal_rh`/`admin` es exactamente el par ya usado en
  los endpoints hermanos de alta/baja/asignación-a-residente dentro del
  mismo archivo. Ampliar el acceso a otro rol puede proponerse después
  como un change aparte, con su propia justificación de negocio.
- **Un solo capability spec (`control-acceso-gestion-personal`) para los
  6 endpoints**, en vez de 6 specs separadas. Se agrupan porque
  comparten el mismo requirement de fondo ("solo personal_rh/admin
  puede mutar datos de gestión de personal") y el mismo patrón de
  scenario (403 sin rol / 2xx con rol) — separarlos en 6 archivos
  agregaría ruido sin valor de trazabilidad adicional.
- **Fix inline (`requireRoles(...)` por ruta), no refactor a política
  centralizada.** Ver Non-Goals. Ir a un mapa central de rutas→roles
  sería una mejora arquitectónica válida pero excede el alcance de un
  bug-fix de RBAC y CLAUDE.md prohíbe refactorizar legacy sin spec
  propio.

## Risks / Trade-offs

- [Riesgo: algún flujo real en producción hoy depende de que un rol
  distinto a `personal_rh`/`admin` llame alguno de estos 6 endpoints,
  sin que conste en el frontend auditado] → Mitigación: verificar en
  logs/BD de producción (o con el usuario) si hay peticiones recientes a
  estas rutas desde `roles` distintos a `personal_rh`/`admin` antes de
  desplegar; si las hay, ese caso de uso debe documentarse como
  requirement adicional antes del fix, no descubrirse después como
  incidente.
- [Riesgo: `POST /prenominas/calcular` sin rol pudo haber sido usado
  intencionalmente por algún script de integración o prueba] →
  Mitigación: revisar `apps/personal/test/` y cualquier script en
  `scripts/` que llame este endpoint antes de aplicar el fix, y
  actualizarlos para autenticar con `personal_rh`/`admin` si es
  necesario.

## Migration Plan

- Cambio de una sola release, sin migración de datos (solo agrega
  middleware a rutas existentes).
- Deploy: mismo pipeline que cualquier fix de `personal`
  (`deploy-vps-backend.yml`), sin pasos manuales adicionales.
- Rollback: revertir el commit — no hay estado persistente nuevo que
  limpiar.

## Open Questions

- ¿Existe algún usuario o integración en producción que hoy llame estos
  6 endpoints con un rol distinto a `personal_rh`/`admin`? Si el usuario
  confirma que no, se procede tal cual; si confirma que sí, hay que
  decidir si ese rol se agrega a `requireRoles(...)` o si ese flujo
  estaba mal y debe corregirse aparte.
