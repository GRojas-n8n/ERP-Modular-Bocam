# control-acceso-rol-finanzas-nivel-tenant Specification

## Purpose

El middleware compartido `requireProjectAccess()` (`packages/auth-middleware`, usado por todos los microservicios) trata al rol real `'finanzas'` (español) como rol de nivel tenant (acceso a todos los proyectos), igual que `'admin'`, `'superintendent'` y `'procurement'`.

## Requirements

### Requirement: requireProjectAccess SHALL tratar a Finanzas como rol de nivel tenant
El middleware compartido `requireProjectAccess()` (`packages/auth-middleware`, usado por todos los microservicios) SHALL conceder acceso sin exigir `proyecto_id` activo ni `authorizedProjects` explícito a cualquier request cuyo `securityContext.roles` incluya `'finanzas'` — al mismo nivel que `'admin'`, `'superintendent'` y `'procurement'`.

#### Scenario: Request con rol finanzas y sin proyecto activo pasa requireProjectAccess
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` incluyendo `'finanzas'`, `proyectoId` vacío y `authorizedProjects` vacío
- **THEN** el middleware llama a `next()` sin responder 403

#### Scenario: Request con rol de nivel proyecto y sin acceso explícito sigue rechazándose
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` que NO incluye ninguno de `'admin'`, `'superintendent'`, `'procurement'` o `'finanzas'`, y sin `proyecto_id` activo
- **THEN** el middleware responde 403 con código `AUTH_PROJECT_REQUIRED` o `AUTH_PROJECT_FORBIDDEN`, sin cambios respecto al comportamiento anterior
