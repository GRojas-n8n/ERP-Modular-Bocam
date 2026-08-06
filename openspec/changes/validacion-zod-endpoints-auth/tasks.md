## 1. Fundamentos

- [x] 1.1 Agregar dependencia `zod` a `apps/auth/package.json`.
- [x] 1.2 Crear `apps/auth/src/validation/parse-or-respond.ts` con el helper que ejecuta `safeParse` y responde 400 en el formato estándar del proyecto si falla.
- [x] 1.3 Test unitario del helper: payload válido pasa, payload inválido responde 400 con `error.details` por cada issue.

## 2. Schemas por endpoint (auth, sesión y admin)

- [x] 2.1 `login.schema.ts` — reemplazar los chequeos manuales de `POST /api/v1/auth/login`.
- [x] 2.2 `register.schema.ts` — `POST /api/v1/auth/register`.
- [x] 2.3 `refresh.schema.ts` — `POST /api/v1/auth/refresh`.
- [x] 2.4 `switch-project.schema.ts` — `POST /api/v1/auth/switch-project`.
- [x] 2.5 `admin-users.schema.ts` — `POST /api/v1/auth/admin/users` y `PATCH /api/v1/auth/admin/users/:id`.
- [x] 2.6 `admin-proyectos.schema.ts` — `POST /api/v1/auth/admin/proyectos` y `PATCH /api/v1/auth/admin/proyectos/:id`.

## 3. Schemas por endpoint (master)

- [x] 3.1 `master-tenants.schema.ts` — `POST /api/v1/master/tenants` y `PATCH /api/v1/master/tenants/:id`.

## 4. Integración y verificación

- [x] 4.1 Aplicar cada schema en su handler correspondiente en `apps/auth/src/main.ts`, eliminando los chequeos manuales que reemplaza.
- [x] 4.2 Test de integración por endpoint: un payload real capturado de `apps/app-shell` (o equivalente) sigue funcionando sin cambios.
- [x] 4.3 Test de integración por endpoint: un payload con un campo de forma inesperada (objeto en vez de string, campo faltante) responde 400 con `VALIDATION_ERROR`.
- [x] 4.4 Correr la suite completa de `apps/auth` y confirmar que no se rompe ningún flujo existente (login real, registro, admin).
- [ ] 4.5 Desplegar y verificar login real en `iretum.com` tras el cambio. *(Diferido: se hace después del deploy final de todos los changes en curso, no como parte de este PR — instrucción explícita del alcance de esta tarea.)*

## 5. Documentar seguimiento

- [x] 5.1 Dejar registrado (en el `proposal.md` de este change o en memoria del proyecto) que el patrón queda listo para replicarse en los otros 12 microservicios, priorizando `compras`, `finanzas` y `contabilidad`.

  **Patrón validado en `auth`, listo para copiar tal cual a otro microservicio:**
  1. `npm install zod --workspace=apps/<servicio>` (o edición manual del `package.json` del workspace + `npm install` en la raíz).
  2. Copiar `apps/auth/src/validation/parse-or-respond.ts` sin cambios — es agnóstico del microservicio (solo depende de `express` y `zod`).
  3. Crear `apps/<servicio>/src/validation/schemas/<endpoint>.schema.ts`, uno por endpoint de escritura, leyendo los chequeos manuales `if (!campo)` actuales del handler para replicar el contrato real (no inventar campos nuevos).
  4. En el handler: `const parsed = parseOrRespond(schema, req.body, res); if (!parsed) return;` como primera línea, eliminando los chequeos de forma/tipo que reemplaza. Las reglas de negocio (enums válidos, validaciones cruzadas entre campos, límites de dominio) se dejan intactas y corren DESPUÉS del parseo — Zod solo reemplaza forma/tipo, nunca lógica de negocio (ver design.md, Non-Goals).
  5. Un test de integración por endpoint: payload válido preexistente sigue funcionando (mismo contrato de éxito) + payload con forma inesperada responde 400 `VALIDATION_ERROR`.
  6. Extraer `parseOrRespond` a un paquete compartido (`packages/validation`) recién en el change que migre el **segundo** microservicio — no antes (ver design.md, Open Questions).

  **Orden de prioridad sugerido para los changes de seguimiento** (mayor riesgo de datos primero, siguiendo el mismo criterio incremental que se usó para cerrar el drift de RLS servicio por servicio): `compras` → `finanzas` → `contabilidad` → resto de los 9 microservicios restantes, cada uno como su propio change independiente.
