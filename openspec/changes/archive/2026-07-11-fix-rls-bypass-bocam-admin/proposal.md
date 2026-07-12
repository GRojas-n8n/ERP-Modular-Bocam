## Why

Los 12 microservicios se conectan a sus 12 bases de datos Postgres con el rol
`bocam_admin`, que es `SUPERUSER` con `rolbypassrls=true` (verificado en el
VPS de producción). Postgres bypasea RLS incondicionalmente para
superusuarios, sin importar `ENABLE`/`FORCE ROW LEVEL SECURITY` en las
tablas — así que las políticas RLS de los 9 módulos que las tienen
(`auth`, `calidad`, `compras`, `control-obra`, `finanzas`,
`gerencia-tecnica`, `personal`, `seguridad`, `ventas`) no aíslan nada hoy.

No es un riesgo teórico: un test de integración nuevo demostró que una OC de
un proyecto es visible desde la sesión de otro proyecto cuando el endpoint
confía solo en RLS, y la tabla `proveedores` de `bocam_compras` ya tiene 2
`tenant_id` distintos coexistiendo en producción.

## What Changes

- Crear un nuevo rol de Postgres `bocam_app` — `NOSUPERUSER`, `NOBYPASSRLS`,
  `LOGIN`, contraseña propia. Un solo rol compartido por las 12 bases (mismo
  modelo de credenciales que `bocam_admin` hoy, sin los privilegios
  peligrosos).
- En cada una de las 12 bases: `REASSIGN OWNED BY bocam_admin TO bocam_app`
  — transfiere el ownership de tablas/secuencias/vistas/funciones. Al no ser
  superusuario, `bocam_app` sí queda sujeto a `FORCE ROW LEVEL SECURITY`
  (ya declarado en cada `rls-policies.sql`, nunca aplicado hasta ahora).
- Actualizar las 12 variables `<SERVICIO>_DATABASE_URL` en el `.env` del VPS
  para usar `bocam_app` en vez de `bocam_admin`.
- `bocam_admin` NO se toca ni se elimina — sigue existiendo como cuenta de
  administración para operaciones manuales (psql ad-hoc, backups, etc.), deja
  de ser la credencial de runtime de las apps.
- **BREAKING (operacional, no de API):** rollout requiere reiniciar cada uno
  de los 12 contenedores backend para tomar la nueva `DATABASE_URL` — breve
  interrupción por servicio durante el rollout escalonado.

## Capabilities

### New Capabilities
(ninguna — este change no agrega comportamiento de producto nuevo)

### Modified Capabilities
- `despliegue-completo-microservicios`: el requisito existente "Todo
  microservicio con datos propios SHALL tener base de datos inicializada...
  con las políticas RLS correspondientes aplicadas" se extiende: además de
  que las políticas RLS existan en el schema, el ROL de conexión usado por
  el microservicio SHALL ser no-superusuario y sin `BYPASSRLS`, para que esas
  políticas efectivamente apliquen.

## Impact

- **Infraestructura del VPS**: nuevo rol Postgres, reasignación de ownership
  en 12 bases, edición de `.env`, reinicio escalonado de 12 contenedores.
- **Sin cambios de código de aplicación** — ningún `main.ts`, schema Prisma,
  ni endpoint se modifica en este change. Es remediación de infraestructura.
- **Dependencia con `envio-oc-correo-proveedores`**: ese change ya agregó
  filtro explícito `tenant_id`/`proyecto_id` en su endpoint nuevo como
  mitigación puntual — este change es el arreglo de raíz que cierra el hueco
  para ese endpoint y para todos los demás (auditados o no) de los 9 módulos
  afectados.
- **Rollback**: por servicio, revertir su `<SERVICIO>_DATABASE_URL` a
  `bocam_admin` y reiniciar ese contenedor — instantáneo, sin necesidad de
  revertir la reasignación de ownership.
