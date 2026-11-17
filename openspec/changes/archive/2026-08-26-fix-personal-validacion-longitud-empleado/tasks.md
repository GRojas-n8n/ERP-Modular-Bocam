## 1. Reproducir el bug (TDD: test primero)

- [x] 1.1 Test que reproduce el bug reportado: `POST /api/v1/personal/empleados` con `rfc` de más de 13 caracteres (y el resto de campos obligatorios válidos) responde `500` con el mensaje crudo de Prisma. Rojo confirmado (`500 !== 400`, mismo mensaje que el reportado: "The provided value for the column is too long for the column's type. Column: (not available)").
- [x] 1.2 Test equivalente para `PATCH /api/v1/personal/empleados/:id` con `contacto_emergencia_telefono` de más de 30 caracteres sobre un empleado existente. Rojo confirmado.
- [x] 1.3 Test equivalente para `POST /api/v1/personal/empleados/importar-lote`: una fila con `curp` de más de 18 caracteres dentro de un lote con otras filas válidas. Rojo confirmado (el lote entero fallaba con 500 en vez de reportar solo esa fila).

Ver `apps/personal/test/integration/validacion-longitud-empleado.integration.test.ts`.

## 2. Fundamentos (copiados del patrón de `apps/auth`)

- [x] 2.1 Agregada dependencia `zod` a `apps/personal/package.json`.
- [x] 2.2 Copiado `apps/auth/src/validation/parse-or-respond.ts` a `apps/personal/src/validation/parse-or-respond.ts`, adaptado para usar el `createApiError` propio de `apps/personal/src/types.ts` (código `VALIDATION_ERROR`, mismo formato `{ success, error: { code, message, details }, meta }` que ya usa el resto del servicio).

## 3. Schema

- [x] 3.1 `apps/personal/src/validation/schemas/empleado.schema.ts`: un único `longitudEmpleadoSchema` (no dos schemas separados para alta/edición como se planteó originalmente — más simple y de menor riesgo: **todos** los campos son opcionales, así que el mismo schema sirve para create, update parcial y cada fila de importación sin duplicar límites). Cubre `rfc` ≤13, `curp` ≤18, `nss` ≤11, `telefono` ≤20, `puesto` ≤100, `contacto_emergencia_nombre` ≤200, `contacto_emergencia_telefono` ≤30, `contacto_emergencia_parentesco` ≤50, `nombre` ≤150, `apellido_paterno`/`apellido_materno` ≤100, `email` ≤100 — límites tomados directo de `schema.prisma`.
- [x] 3.2 A propósito NO reemplaza el chequeo de obligatorios existente (`PER_MISSING_FIELDS` en POST/PATCH) — corre como validación *adicional*, después del chequeo manual. Evita romper el comportamiento/error-code ya cubierto por los tests existentes (`edicion-datos-empleado.integration.test.ts`, `testCampoObligatorioVacioRechazado`).
- [x] 3.3 Mismo schema reutilizado para cada fila de `importar-lote` vía `safeParse` directo (sin `parseOrRespond`, porque el error se agrega a `errores` por fila en vez de cortar el request completo).

## 4. Integración en los 3 endpoints

- [x] 4.1 `POST /api/v1/personal/empleados`: `parseOrRespond(longitudEmpleadoSchema, req.body, res)` después del chequeo de obligatorios existente (sin eliminarlo).
- [x] 4.2 `PATCH /api/v1/personal/empleados/:id`: mismo `parseOrRespond`, después de las reglas de negocio existentes (`modo_asistencia === 'POR_HORAS'`, `horas_jornada` 1-24), sin tocarlas.
- [x] 4.3 `POST /api/v1/personal/empleados/importar-lote`: `longitudEmpleadoSchema.safeParse(registro)` dentro del bucle existente, agregando a `errores` (mismo mecanismo que "RFC duplicado"/"salario_diario no numérico") en vez de responder 400 para todo el request.
- [x] 4.4 Los tres catch de error inesperado dejan de responder `error.message` crudo — mensaje genérico por endpoint ('Error al crear el empleado.' / 'Error al actualizar el empleado.' / 'Error al importar el lote de empleados.').
- [x] 4.5 Tests 1.1-1.3 en verde.

## 5. Frontend

- [x] 5.1 `maxLength` en los `<Input>` de RFC, CURP, NSS, teléfono, email, puesto, contacto de emergencia (nombre/teléfono/parentesco) en el formulario de "Nuevo Empleado" (`PersonalView.tsx`).
- [x] 5.2 Mismo `maxLength` en el formulario de edición de empleado.

## 6. Verificación

- [x] 6.1 Suite relevante de `apps/personal` corrida en verde: los 4 tests nuevos + `edicion-datos-empleado` (7/7) + `empleados-importar-lote` (4/4) + `contacto-emergencia-estructurado` (3/3) + `listado-empleados-incluye-frente-residente` (4/4) + `rbac-endpoints-personal-sin-rol` (6/6) — sin regresiones.
- [x] 6.2 `npx tsc --noEmit` en `apps/personal` y `apps/app-shell` — limpio.
- [x] 6.3 Confirmado por el test `testAltaConCamposValidosSigueFuncionando` y por la suite de regresión completa: un alta con campos dentro de los límites (caso normal) sigue respondiendo `201` igual que antes.

## 7. Deploy y cierre

- [x] 7.1 Desplegado vía CI (push a `main`, PR #100 mergeado). Backend (`personal`) desplegado exitosamente por `deploy-vps-backend.yml` (el rojo del gate de smoke test es el ruido de consola por 403 ya conocido de RBAC, decidido dejar así en la sesión anterior — no relacionado a este fix). Frontend (`app-shell`) desplegado por `deploy-vps.yml` — falló una vez en el paso de SSH (transitorio) y se reintentó con éxito. `https://iretum.com` responde 200 tras ambos.
- [x] 7.2 Verificado en `iretum.com` (2026-08-26, sesión real rol `admin`, proyecto "CONSTRUCCIÓN DE OBRAS EN MEDIA Y BAJA TENSIÓN EN ZONA LÁZARO CÁRDENAS"): en "Nuevo Empleado", el campo RFC trunca a 13 caracteres al escribir más (`maxLength` de la tarea 5.1 confirmado en prod — el escenario original de 500 crudo por RFC largo ya no es alcanzable desde el formulario normal, la UI lo previene antes del submit). Mismo resultado en "Editar Empleado" para `contacto_emergencia_telefono` (trunca a 30, tarea 5.2). Alta normal con datos válidos (RFC de 13 chars) respondió `201` — "Empleado EMP-003 creado." — sin regresión. **Nota:** no se forzó el mensaje de error del backend vía `importar-lote` (hubiera requerido descargar/editar un CSV sin permiso previo del usuario); el camino de error ya está cubierto por los tests de integración 1.1-1.3/4.5. El empleado de prueba `EMP-003 (QA Prueba Longitud)` quedó creado en producción bajo ese proyecto — pendiente que el usuario decida si lo conserva o lo da de baja.
- [x] 7.3 `openspec archive fix-personal-validacion-longitud-empleado` tras verificación en producción.
