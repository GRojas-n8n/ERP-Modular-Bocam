## Why

Una auditoría del flujo alta-de-personal → asignación → asistencia → nómina
en `apps/personal/src/main.ts` encontró seis endpoints que mutan datos
sensibles de RH (altas, bajas, cuadrillas, asignaciones a frente de
trabajo, cálculo de pre-nómina) sin `requireRoles(...)`, mientras que sus
endpoints hermanos en el mismo archivo (`importar-lote`, `PATCH
/empleados/:id`, `autorizar`, `pagar`, `marcar-revisado`) sí exigen
`personal_rh` o `admin`. Hoy, cualquier usuario autenticado con acceso al
proyecto activo (`requireProjectAccess`) — sin importar su rol de
negocio — puede dar de alta o dar de baja empleados, crear/asignar
cuadrillas, crear asignaciones a frente de trabajo, o disparar el cálculo
de una pre-nómina real. Es una inconsistencia de RBAC dentro del mismo
módulo, no una decisión de diseño documentada.

## What Changes

- Agregar `requireRoles('personal_rh', 'admin')` a:
  - `POST /api/v1/personal/empleados` (alta individual)
  - `PATCH /api/v1/personal/empleados/:id/baja`
  - `POST /api/v1/personal/cuadrillas`
  - `POST /api/v1/personal/cuadrillas/:id/asignar`
  - `POST /api/v1/personal/asignaciones` (asignación a frente de trabajo)
  - `POST /api/v1/personal/prenominas/calcular`
- **BREAKING** para cualquier usuario que hoy use estos endpoints sin el
  rol `personal_rh` o `admin` (por ejemplo, `residencia` o
  `control_obra`) — a partir de este cambio recibirá `403
  PER_FORBIDDEN` en vez de la operación exitosa. Según el flujo de
  negocio documentado (RH da de alta y asigna; Residencia solo consulta,
  asiste y revisa), no se espera que ningún rol legítimo dependa hoy de
  este acceso, pero se marca como breaking por si algún flujo real en
  producción lo estuviera usando sin que conste en las specs existentes.

## Capabilities

### New Capabilities
- `control-acceso-gestion-personal`: RBAC de los endpoints de gestión de
  personal (alta/baja de empleados, cuadrillas, asignaciones a frente de
  trabajo y disparo de cálculo de pre-nómina) — solo `personal_rh` o
  `admin` pueden ejecutarlos.

### Modified Capabilities
(ninguna — `control-acceso-autorizacion-nomina` cubre `autorizar`/`pagar`
y no cambia; `alta-individual-empleado` cubre el formulario de frontend y
no cambia de contrato, solo empieza a recibir 403 si el usuario no tiene
el rol correcto, lo cual ya está fuera del alcance de esa spec)

## Impact

- **Código afectado**: `apps/personal/src/main.ts` (6 endpoints, un
  `requireRoles(...)` agregado por ruta, sin cambios de lógica interna).
- **Tests**: nuevos casos en `apps/personal/test/` que reproduzcan 403
  para un rol no autorizado (p. ej. `residencia` o `control_obra`) antes
  del fix, y verifiquen 2xx para `personal_rh`/`admin` después.
- **Frontend**: ningún cambio de contrato esperado — `PersonalView.tsx`
  ya opera con sesiones de `personal_rh`/`admin`. Si algún flujo de
  `ResidenciaView.tsx` llegara a llamar alguno de estos endpoints, se
  detectaría como regresión en QA manual.
- **Otros microservicios**: ninguno — cambio contenido en `personal`.
