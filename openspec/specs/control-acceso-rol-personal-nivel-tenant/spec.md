# control-acceso-rol-personal-nivel-tenant Specification

## Purpose

El middleware compartido `requireProjectAccess()` (`packages/auth-middleware`, usado por todos los microservicios) trata al rol real `'personal_rh'` como rol de nivel tenant (acceso a todos los proyectos), igual que `'admin'`, `'superintendent'` y `'finanzas'` — alineado con que las consultas de Personal ya son globales por diseño.

## Requirements

### Requirement: requireProjectAccess SHALL tratar a Personal (personal_rh) como rol de nivel tenant
El middleware compartido `requireProjectAccess()` (`packages/auth-middleware`, usado por todos los microservicios) SHALL conceder acceso sin exigir `proyecto_id` activo ni `authorizedProjects` explícito a cualquier request cuyo `securityContext.roles` incluya `'personal_rh'` — al mismo nivel que `'admin'`, `'superintendent'` y `'finanzas'`. Esto alinea el middleware con las consultas de Personal que ya son globales por diseño (`GET /api/v1/personal/empleados`, `GET /api/v1/personal/dashboard`), que hoy pueden recibir `403 AUTH_PROJECT_REQUIRED` antes de llegar a una consulta que de todas formas no filtra por proyecto.

#### Scenario: Request con rol personal_rh y sin proyecto activo pasa requireProjectAccess
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` incluyendo `'personal_rh'`, `proyectoId` vacío y `authorizedProjects` vacío
- **THEN** el middleware llama a `next()` sin responder 403

#### Scenario: GET /api/v1/personal/empleados con usuario personal_rh sin proyecto activo
- **WHEN** un usuario con rol `'personal_rh'` y sin proyecto activo seleccionado llama `GET /api/v1/personal/empleados`
- **THEN** el sistema responde 200 con la lista completa de empleados del tenant, en vez de 403 `AUTH_PROJECT_REQUIRED`
