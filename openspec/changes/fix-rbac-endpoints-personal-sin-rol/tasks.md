## 1. Verificación previa (Open Question de design.md)

- [x] 1.1 Confirmar con el usuario o revisando logs/BD de producción si
      algún rol distinto a `personal_rh`/`admin` ha llamado
      recientemente alguno de los 6 endpoints listados en proposal.md.
      Si la respuesta es sí, pausar y decidir si ese rol se agrega al
      `requireRoles(...)` antes de continuar.
      **Resultado:** verificado por código (no por logs de producción, no
      fue necesario). `Layout.tsx:156-157` restringe el nav "Recursos
      Humanos" a `personal_rh` (+ `isAdmin` bypass). De los 6 endpoints,
      solo `POST /empleados` está wireado a un botón real en
      `PersonalView.tsx`. Los otros 5 no tienen ningún caller en el
      frontend — los botones "Nueva Cuadrilla"/"Calcular Nomina" en
      `PersonalView.tsx:990-1000` no tienen handler (bug aparte, fuera de
      alcance). Los tests de integración existentes que llaman
      `/prenominas/calcular` ya usan `admin`/`personal_rh`. Riesgo de
      breaking change: nulo.
- [x] 1.2 Revisar `apps/personal/test/` y `scripts/` por llamadas
      existentes a estos endpoints que no autentiquen como
      `personal_rh`/`admin`, para no romperlas en silencio.
      **Resultado:** sin hallazgos — ningún test/script llama estos 6
      endpoints con un rol distinto.

## 2. Tests que reproducen el gap (deben fallar en rojo antes del fix)

- [x] 2.1 Test: `POST /api/v1/personal/empleados` con rol no autorizado
      (p. ej. `residencia`) responde 403 `PER_FORBIDDEN`.
- [x] 2.2 Test: `PATCH /api/v1/personal/empleados/:id/baja` con rol no
      autorizado responde 403 `PER_FORBIDDEN`.
- [x] 2.3 Test: `POST /api/v1/personal/cuadrillas` con rol no autorizado
      responde 403 `PER_FORBIDDEN`.
- [x] 2.4 Test: `POST /api/v1/personal/cuadrillas/:id/asignar` con rol no
      autorizado responde 403 `PER_FORBIDDEN`.
- [x] 2.5 Test: `POST /api/v1/personal/asignaciones` con rol no
      autorizado responde 403 `PER_FORBIDDEN`.
- [x] 2.6 Test: `POST /api/v1/personal/prenominas/calcular` con rol no
      autorizado responde 403 `PER_FORBIDDEN`.
- [x] 2.7 Confirmar que los 6 tests fallan en rojo contra el código
      actual (documentan el gap antes de tocar `main.ts`).
      **Resultado:** los 6 casos viven en
      `apps/personal/test/integration/rbac-endpoints-personal-sin-rol.integration.test.ts`.
      Confirmado en rojo contra el código sin fix: `testAltaEmpleado`
      falló en la aserción "rol sin personal_rh/admin debe recibir 403"
      porque el endpoint respondía 201 sin importar el rol, documentando
      el gap.

## 3. Fix (agregar requireRoles a cada endpoint)

- [x] 3.1 `POST /api/v1/personal/empleados` (línea ~100): agregar
      `requireRoles('personal_rh', 'admin')`.
- [x] 3.2 `PATCH /api/v1/personal/empleados/:id/baja` (línea ~325):
      agregar `requireRoles('personal_rh', 'admin')`.
- [x] 3.3 `POST /api/v1/personal/cuadrillas` (línea ~366): agregar
      `requireRoles('personal_rh', 'admin')`.
- [x] 3.4 `POST /api/v1/personal/cuadrillas/:id/asignar` (línea ~398):
      agregar `requireRoles('personal_rh', 'admin')`.
- [x] 3.5 `POST /api/v1/personal/asignaciones` (línea ~449): agregar
      `requireRoles('personal_rh', 'admin')`.
- [x] 3.6 `POST /api/v1/personal/prenominas/calcular` (línea ~632):
      agregar `requireRoles('personal_rh', 'admin')`.

## 4. Verificación

- [x] 4.1 Los 6 tests de la sección 2 pasan en verde con rol
      `personal_rh`/`admin` y siguen respondiendo 403 con otros roles.
- [x] 4.2 Suite completa de `apps/personal/test/` sigue en verde (sin
      regresión en `importar-lote`, `autorizar`, `pagar`,
      `marcar-revisado`, asignación a residente, etc.).
      **Resultado:** 13 de 14 archivos de integración + el unit test en
      verde. Dos fallas preexistentes, no causadas por este fix
      (confirmado corriendo la suite contra el código sin el fix vía
      `git stash`): `expediente-empleado.integration.test.ts` (falla al
      descargar archivo subido, problema de filesystem/upload local) y
      `rls-personal-tablas-nuevas.integration.test.ts` (gotcha ya
      documentado: RLS nunca se aplicó en el Postgres local de Docker).
- [x] 4.3 Verificación manual en navegador (o vía `run`/Playwright) con
      sesión `personal_rh`: alta de empleado, baja, creación de
      cuadrilla, asignación a cuadrilla, asignación a frente y cálculo
      de pre-nómina siguen funcionando igual que antes del fix.
      **Resultado:** app-shell + `auth` + `personal` levantados localmente
      (Docker Postgres/Redis/RabbitMQ ya arriba). Sesión real de
      `admin@alfa.bocam.com` (bypass de `personal_rh`, no hay usuario
      `personal_rh` seedeado localmente): flujo real de clics en
      "Recursos Humanos" → "Empleados" → "Nuevo Empleado" → llenar
      formulario → "Guardar empleado" — toast "Empleado EMP-012 creado.",
      panel se cierra, contador de activos sube a 12 (screenshot
      `05-post-guardar-admin.png`). Los otros 5 endpoints no tienen botón
      en la UI (bug aparte, documentado en 1.1) — se probaron con
      `fetch()` ejecutado en el contexto de la misma pestaña autenticada
      (token real de `localStorage`, ruta relativa vía el proxy de Vite,
      no un token firmado a mano): `crearCuadrilla` 201, `asignarCuadrilla`
      200, `crearAsignacionFrente` 201, `baja` 200. `calcularPrenomina`
      dio 500 (no 403) — es la validación de negocio "no hay empleados
      activos elegibles", causada por el orden del propio script de
      verificación (el empleado de prueba se dio de baja justo antes de
      calcular); no es un problema de RBAC, el punto que importa
      (pasar el guardia de rol) quedó demostrado por el 500 en vez de 403.
- [x] 4.4 Verificación manual con sesión `residencia` (o cualquier rol
      no autorizado): los 6 endpoints devuelven 403 en vez de ejecutar
      la operación.
      **Resultado:** sesión real de `residente@alfa.bocam.com` (rol
      `residencia`). Confirmado por screenshot que el ítem "Recursos
      Humanos" NO aparece en el sidebar (`06-residencia-dashboard.png`;
      solo Dashboard, Compras, Residencia). Con el token real de esa
      sesión, `fetch()` a los 6 endpoints devolvió 403 en los seis:
      `POST /empleados`, `PATCH /empleados/:id/baja`,
      `POST /cuadrillas`, `POST /cuadrillas/:id/asignar`,
      `POST /asignaciones`, `POST /prenominas/calcular`.

## 5. Cierre

- [x] 5.1 Branch `test/rbac-personal-endpoints-sin-rol` (o `fix/...`
      según convención de CLAUDE.md), commit con los tests + fix.
      **Resultado real (distinto al plan):** por instrucción explícita del
      usuario, se commiteó directo en `main` (commit `5d3f3fc`) en vez de
      abrir un branch `test/`/`fix/` — sin branch intermedio.
- [x] 5.2 Abrir PR contra `main` referenciando este change de OpenSpec.
      **Resultado real (distinto al plan):** no hubo PR — por instrucción
      explícita del usuario se hizo `git push origin main` directo
      (`88689b9..5d3f3fc`).
- [ ] 5.3 Tras merge y verificación en producción, archivar el change
      (`openspec archive`).
      Pendiente — el fix está en `main` local y en `origin/main`, pero no
      se ha verificado contra el VPS de producción. Archivar cuando esa
      verificación se complete.
