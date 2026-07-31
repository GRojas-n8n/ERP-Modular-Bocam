## Why

Auditoría del flujo alta-de-personal → asignación → asistencia → nómina en
Recursos Humanos encontró tres problemas concretos que hacen el módulo
confuso o directamente inoperable en partes: (1) los botones "Nueva
Cuadrilla" y "Calcular Nomina" no tienen efecto — el backend ya soporta
ambas operaciones pero nadie los conectó; (2) la sección "Residente(s)
asignado(s)" siempre muestra el UUID crudo en vez del nombre porque la
llamada de resolución en `personal` apunta a una ruta de `auth` que no
existe (`GET /api/v1/auth/usuarios/:id`), y encima pide capturar ese UUID
a mano; y (3) no existe ninguna pantalla para crear la asignación a frente
de trabajo (`AsignacionFrente`) — el paso que realmente hace elegible a un
empleado para asistencia y nómina en un proyecto — así que asignar un
residente se siente como "ya quedó" cuando en realidad falta un segundo
paso invisible.

## What Changes

- Conectar los botones "Nueva Cuadrilla" y "Calcular Nomina" a paneles
  reales (mismo patrón que "Nuevo Empleado"), y usar el slot `action` que
  ya soporta `EmptyStatePanel` para poner el CTA correspondiente en los
  estados vacíos de Cuadrillas y Pre-Nómina.
- **Fix de bug**: `GET /api/v1/personal/empleados/:id/residentes` deja de
  llamar a una ruta inexistente de `auth` (`/api/v1/auth/usuarios/:id`) y
  resuelve nombres con una sola llamada de listado en vez de N llamadas
  rotas.
- Nueva ruta en `auth`: `GET /api/v1/auth/usuarios?rol=<rol>`, accesible
  para `personal_rh`/`admin` (no solo `admin` como el único listado que
  existía hoy, `GET /api/v1/auth/admin/users`), con campos mínimos
  (id, nombre, email) — no expone `proyectos_acceso` ni otros campos
  administrativos.
- Nueva ruta proxy en `personal`: `GET /api/v1/personal/residentes-disponibles`,
  que consulta la ruta nueva de `auth` con `?rol=residencia` — respeta la
  regla de que una vista de `app-shell` solo llama a su propio servicio.
- El campo de texto libre "ID del usuario Residente" se reemplaza por un
  selector poblado con nombres reales, y se agrega una nota visible
  aclarando que asignar un residente no hace elegible al empleado para el
  proyecto.
- Nueva sección "Asignación a Frente de Trabajo" en el panel de detalle de
  empleado (junto a "Residente(s) asignado(s)"): lista las asignaciones
  activas y permite crear una nueva contra el endpoint que ya existe en el
  backend (`POST /api/v1/personal/asignaciones`).

Nada de esto es **BREAKING** — todos los endpoints de backend que se
reutilizan (`POST /cuadrillas`, `POST /prenominas/calcular`,
`POST /asignaciones`) ya existen y ya validan rol; el contrato de
`GET /empleados/:id/residentes` no cambia (sigue devolviendo
`residente_nombre`/`parcial`), solo deja de estar siempre roto.

## Capabilities

### New Capabilities
- `directorio-usuarios-por-rol`: en `auth`, listado de usuarios del tenant
  filtrado por rol, con campos mínimos, accesible a roles no-admin
  autorizados.
- `gestion-cuadrillas-prenomina-ui`: paneles de alta de cuadrilla y de
  cálculo de pre-nómina en `app-shell`, con sus CTA en los empty states.
- `asignacion-frente-trabajo-ui`: sección para crear/listar asignaciones a
  frente de trabajo desde el panel de detalle de empleado en `app-shell`.

### Modified Capabilities
- `asignacion-residente-empleado`: la resolución de nombre de residente
  deja de depender de una ruta inexistente; se agrega el directorio de
  residentes disponibles como soporte del formulario de asignación, y el
  formulario en `app-shell` pasa de un campo de texto libre a un selector
  con aviso de elegibilidad de proyecto.

## Impact

- **Código afectado**: `apps/auth/src/main.ts` (ruta nueva),
  `apps/personal/src/main.ts` (fix + ruta proxy nueva),
  `apps/app-shell/src/views/PersonalView.tsx` (3 paneles/secciones
  nuevas + 2 empty states).
- **Tests**: nuevos tests de integración en `apps/auth/test` y
  `apps/personal/test` (incluye un test que reproduce el bug del 404 en
  rojo antes del fix); tests de componente nuevos en `apps/app-shell/src/views`
  siguiendo el patrón de `PersonalView.nuevo-empleado.test.tsx`.
- **Otros microservicios**: ninguno — cambio contenido en auth, personal
  y app-shell.
