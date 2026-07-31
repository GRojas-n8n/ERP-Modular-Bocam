# Feature — Revisión de nómina (fiscal y complementaria) por Residencia

> Feature nuevo sobre módulos legacy (Residencia en `app-shell` + Personal/RH, puerto 3006).
> Ubicación: `specs/features/` según `specs/README.md` — feature sobre legacy, no módulo nuevo.

> **Estado (2026-07-29): implementado.** `tsc -b`/`tsc --noEmit` limpios en
> ambos apps, tests de frontend en verde. Los integration tests de backend
> (`apps/personal/test/integration/revision-nomina-residencia.integration.test.ts`
> y la actualización a `rol-personal-rh-autorizar-pagar-nomina.integration.test.ts`)
> type-checkean pero **no se ejecutaron** — no había Postgres/Docker local en
> la sesión. La migración `20260729120000_revision_nomina_residencia`
> tampoco se aplicó contra ninguna DB real. Pendiente antes de mergear:
> correr los integration tests contra Postgres real y aplicar la migración
> en el próximo deploy.

## 1. Contexto

El usuario pidió que el Residente pueda revisar la nómina fiscal y la
complementaria al generarse. Auditoría previa (2026-07-24, reproducida en
vivo 2026-07-27) encontró que la UI de este flujo **ya existe mas está
desconectada del backend real** — no es un feature desde cero, es un tab
roto que hay que arreglar antes de construir la revisión formal encima.

Componente: `apps/app-shell/src/views/ResidenciaView.tsx` (tab "Nómina").
Backend: `apps/personal/src/main.ts` + `apps/personal/prisma/schema.prisma`.

## 2. Problemas confirmados (deben resolverse como prerequisito)

Estos son bug-fixes sobre código legacy — requieren su propio ciclo
spec-corto → test que reproduce el bug → fix (regla CLAUDE.md), documentados
aquí como prerequisito explícito del feature porque construir la revisión
formal sobre el tab actual heredaría los tres bugs.

### 2.1 — Contrato de datos no coincide con el backend real

`ResidenciaView.tsx` (interfaz `Prenomina`, línea ~166-178) fue escrito
contra la forma de `DEMO_PRENOMINAS_RESIDENCIA` (`apps/app-shell/src/lib/demoData.ts`),
no contra la respuesta real de `GET /api/v1/personal/prenominas`:

| Campo usado en frontend | Campo real (`PreNomina` en Prisma) |
|---|---|
| `id` | `id_prenomina` |
| `total_bruto` | `total_percepciones` |
| `cuadrillas: CuadrillaNomina[]` | no existe — hay `detalles: PreNominaDetalle[]` por EMPLEADO |

**Reproducido en vivo:** con una fila real sembrada en `personal.pre_nominas`,
el modal de detalle (línea ~1615, `nominaDetalle.cuadrillas.map(...)`) lanza
`TypeError: Cannot read properties of undefined (reading 'toLocaleString')`
en `fmt$` (`ResidenciaView.tsx:90`) y tumba toda la vista vía
`AppErrorBoundary` genérico.

**Fix:** reescribir la interfaz `Prenomina` del frontend contra la forma
real de `PreNomina`/`PreNominaDetalle`, y el modal de detalle para iterar
`detalles` por empleado en vez de `cuadrillas`.

### 2.2 — "Aprobar" no llama al backend (y llama al endpoint equivocado)

`handleAprobarNomina` (línea ~670-682) solo hace
`setPrenominas(prev => prev.map(p => p.id === confirmAprobar.id ? {...p, estado: 'APROBADA'} : p))`
y muestra un `notify()` de éxito. Nunca llama al backend. Compara `p.id`
(inexistente en datos reales, sería `undefined`), y usa el estado
`'APROBADA'`, que no existe en `EstadoPreNomina` (`apps/personal/src/types.ts`
usa `AUTORIZADA`).

Además, conceptualmente el botón está mal wireado incluso si se conectara:
`PATCH /prenominas/:id/autorizar` es la acción de RH que libera el pago
(separación de funciones — ver decisión D2). El Residente no debe poder
autorizar el pago de su propia obra. El fix correcto NO es conectar este
botón a `/autorizar`, sino renombrarlo/rewirearlo a la acción nueva
`marcar-revisado` (D2).

**Fix:** renombrar el botón/flujo de "Aprobar" a "Marcar revisado".
`handleAprobarNomina` debe llamar
`PATCH /api/v1/personal/prenominas/:id_prenomina/marcar-revisado` (endpoint
nuevo, ver D2), actualizar estado local con la respuesta real del backend
(no un valor inventado), y manejar el error si el backend rechaza (ej. rol
sin permiso — ver 2.3). El endpoint `/autorizar` existente no cambia su
gate de rol (`personal_rh`/`admin`) y no se expone a Residencia.

### 2.3 — Endpoints de lectura sin gate de rol

`GET /api/v1/personal/prenominas` y `GET /api/v1/personal/prenominas/:id`
(`main.ts:449-486`) no tienen `requireRoles(...)` — a diferencia de
`/prenominas/:id/detalle` y todo `/complementos/*`, que sí exigen
`personal_rh`/`admin`. Hoy cualquier rol con acceso al proyecto (incluido
`residencia`, `control_obra`) puede leer nómina fiscal completa (salarios,
deducciones, neto por empleado) sin que exista una decisión de diseño
detrás — es simplemente que nadie puso el candado.

**Fix:** decidir explícitamente qué roles pueden leer estos dos endpoints
(ver decisión D1 abajo) y agregar `requireRoles(...)` acorde. Esto es un
cambio de comportamiento, no solo un candado — validar que no rompa el uso
actual de RH (`personal_rh`/`admin`) antes de mergear.

## 3. Feature nuevo — Revisión formal de Residencia

Una vez resueltos 2.1-2.3, agregar:

- Lectura de nómina **complementaria** (`/complementos/*`) en el tab de
  Residencia — hoy no tiene ningún punto de entrada ahí.
- Acción `marcar-revisado` del Residente sobre ambas nóminas (fiscal +
  complementaria) — ver D2. RH no puede autorizar el pago
  (`PATCH /autorizar`) hasta que exista esa revisión.

## 4. Decisiones de diseño (resueltas)

**D1 — ¿Qué roles leen `GET /prenominas` y `/prenominas/:id`?**

**Decisión: agregar `residencia` explícitamente a `requireRoles` junto con
`personal_rh`/`admin`** (`requireRoles(['personal_rh', 'admin', 'residencia'])`),
sin restricción de campos.

Razones:
- Es precondición dura para la feature — sin esto, Residencia no puede
  revisar nada.
- No amplía la exposición real: `residencia` ya lee estos datos hoy en
  producción (es el gap que 2.3 documenta); esto solo lo vuelve una
  decisión explícita en vez de un descuido.
- Restringir campos (ej. ocultar deducciones IMSS/ISR por empleado a
  Residencia) añade complejidad de proyección de datos que nadie pidió y
  que el propio propósito de la revisión contradice: si Residencia va a
  detectar errores en la nómina, necesita ver las mismas cifras que ve RH.
- Cierra el acceso de otros roles que hoy también caen dentro de "acceso al
  proyecto" (ej. `control_obra`) sin necesidad real de ver nómina — antes
  quedaban adentro por descuido, ahora quedan afuera por diseño.

**D2 — ¿Qué significa "revisar" para el Residente?**

**Decisión: opción (c) — revisión es un prerequisito que bloquea la
autorización de RH**, con endpoint y campo nuevos, más bypass explícito
para `admin`.

Razones:
- La UI legacy ya tenía un botón "Aprobar" con confirmación pensado para
  que Residencia tomara una acción activa, no solo lectura — la intención
  original de diseño ya apuntaba a un checkpoint, no a un dashboard pasivo.
- Nómina ya tuvo un incidente real de doble pago en tenants multi-proyecto
  (ver `[[hallazgo-nomina-doble-pago-multiproyecto]]` en memoria) — el
  costo de un error de nómina es alto y Residencia es quien tiene
  visibilidad real de asistencia/cuadrillas en obra, así que su revisión
  añade una verificación de negocio genuina, no burocracia.
- La opción (b) — "marcar revisado" puramente informativo, sin gate — no
  resuelve el problema real: si RH puede autorizar sin importar lo que
  Residencia haya marcado, nada garantiza que alguien lea la revisión antes
  de pagar.
- Para no crear un bloqueo permanente si Residencia no está disponible
  (vacaciones, cambio de proyecto, cuenta inactiva), `admin` puede
  autorizar sin revisión previa (bypass explícito, auditado — ver 6).

**Cambios de modelo que implica D2:**
- `apps/personal/prisma/schema.prisma`: agregar a `PreNomina`
  `revisado_por_residencia: Boolean @default(false)`, `revisado_at: DateTime?`,
  `revisado_por_usuario_id: String?` (requiere migración Prisma).
- `apps/personal/src/main.ts`: nuevo `PATCH /prenominas/:id_prenomina/marcar-revisado`
  con `requireRoles(['residencia', 'admin'])`, escribe los tres campos.
- `apps/personal/src/main.ts`: `PATCH /prenominas/:id_prenomina/autorizar`
  existente agrega chequeo — si `revisado_por_residencia === false` y el
  rol que llama no es `admin`, responde 409 con mensaje explícito ("nómina
  pendiente de revisión por Residencia").
- Mismo patrón para nómina complementaria (`/complementos/*`) si ese
  endpoint tiene su propio paso de autorización — confirmar contra el
  código real de `/complementos/*` antes de implementar, no asumir que
  espeja `/prenominas` 1:1.

## 5. Casos borde

- Prenómina con `detalles: []` (nómina de 0 empleados) — el modal no debe
  crashear.
- Residente sin acceso al proyecto de la prenómina — debe dar 403, no
  filtrar por error.
- Doble clic en "Marcar revisado" — el backend debe ser idempotente
  (segunda llamada no debe fallar con error genérico si ya estaba
  revisado, solo no-op).
- Nómina complementaria de un empleado que no aparece en la fiscal del
  mismo periodo (o viceversa) — la UI debe mostrar ambas sin asumir que
  coinciden 1:1.
- RH (`personal_rh`) intenta `PATCH /autorizar` antes de que Residencia
  marque revisado — debe dar 409, no autorizar silenciosamente.
- `admin` usa el bypass para autorizar sin revisión previa — debe quedar
  registrado de forma distinguible (ej. en el log/evento de autorización)
  que fue un bypass, para auditoría posterior.
- Prenómina ya `AUTORIZADA` — `marcar-revisado` después de ese punto no
  debe tener efecto sobre el pago ya liberado (es solo metadata a esas
  alturas).

## 6. Tests requeridos

Bug-fix cycle (2.1-2.3): el test que reproduce el bug se escribe primero.

- `apps/personal`: test de integración que confirma
  `requireRoles(['personal_rh','admin','residencia'])` en `/prenominas` y
  `/prenominas/:id`, y que otros roles (ej. `control_obra`) reciben 403.
- `apps/personal`: test de que `residencia` NO puede llamar
  `PATCH /prenominas/:id/autorizar` (403) — separación de funciones.
- `apps/personal`: test de `PATCH /prenominas/:id/marcar-revisado` con rol
  `residencia`/`admin` — escribe `revisado_por_residencia`, `revisado_at`,
  `revisado_por_usuario_id`; rechaza con 403 para otros roles.
- `apps/personal`: test de que `/autorizar` responde 409 cuando
  `revisado_por_residencia === false` y el llamante no es `admin`.
- `apps/personal`: test de que `admin` SÍ puede autorizar sin revisión
  previa (bypass) y que el bypass queda distinguible en la respuesta/log.
- `apps/app-shell`: test (Playwright o unit con mock de API) que confirma
  que el modal de detalle renderiza `detalles` reales sin crashear.
- `apps/app-shell`: test que confirma que el botón renombrado
  "Marcar revisado" llama `PATCH .../marcar-revisado` (no `/autorizar`)
  con `id_prenomina` real y refleja el estado que devuelve el backend.

## 7. Fuera de alcance

- Reconocimiento facial u otras features de asistencia — no relacionado.
- Cambios al cálculo de nómina (`calcular`) — este spec es solo sobre
  visibilidad/aprobación, no sobre el motor de cálculo.
- Rediseño visual del tab — solo lo necesario para que los datos reales no
  crasheen la vista.

## 8. Orden de implementación sugerido

1. Fix 2.1 (contrato de datos) — desbloquea poder ver el detalle sin crash.
2. Fix 2.3 (gate de rol, D1) — agrega `residencia` a `requireRoles` en
   `/prenominas` y `/prenominas/:id`.
3. Migración Prisma (D2) — campos nuevos en `PreNomina` + endpoint
   `marcar-revisado` + chequeo 409 en `/autorizar`.
4. Fix 2.2 — rewire del botón a `marcar-revisado` en `ResidenciaView.tsx`.
5. Feature nuevo — punto de entrada de nómina complementaria en el tab de
   Residencia, mismo patrón de revisión que la fiscal (confirmar contra
   código real de `/complementos/*` primero).
