## MODIFIED Requirements

### Requirement: requireProjectAccess SHALL tratar a Finanzas como rol de nivel tenant
El middleware compartido `requireProjectAccess()` (`packages/auth-middleware`, usado por todos los microservicios) SHALL conceder acceso sin exigir `proyecto_id` activo ni `authorizedProjects` explícito a cualquier request cuyo `securityContext.roles` incluya `'finanzas'` — al mismo nivel que `'admin'` y `'superintendent'`. `'procurement'` (Compras) SHALL NOT recibir este bypass: Compras debe permanecer estrictamente acotado por proyecto, sin excepción de rol — cualquier request de un usuario con rol `'procurement'` sigue las mismas reglas que cualquier otro rol de nivel proyecto (requiere `proyecto_id` activo incluido en `authorizedProjects`).

#### Scenario: Request con rol finanzas y sin proyecto activo pasa requireProjectAccess
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` incluyendo `'finanzas'`, `proyectoId` vacío y `authorizedProjects` vacío
- **THEN** el middleware llama a `next()` sin responder 403

#### Scenario: Request con rol de nivel proyecto y sin acceso explícito sigue rechazándose
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` que NO incluye ninguno de `'admin'`, `'superintendent'` o `'finanzas'`, y sin `proyecto_id` activo
- **THEN** el middleware responde 403 con código `AUTH_PROJECT_REQUIRED` o `AUTH_PROJECT_FORBIDDEN`

#### Scenario: Request con rol procurement y sin proyecto activo ya NO pasa requireProjectAccess
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` incluyendo únicamente `'procurement'`, `proyectoId` vacío y `authorizedProjects` vacío
- **THEN** el middleware responde 403 con código `AUTH_PROJECT_REQUIRED`, a diferencia del comportamiento anterior a este cambio

#### Scenario: Request con rol procurement y proyecto activo autorizado sigue pasando
- **WHEN** un request llega a una ruta protegida por `requireProjectAccess()` con `securityContext.roles` incluyendo `'procurement'`, `proyectoId` fijado a un proyecto, y ese proyecto incluido en `authorizedProjects`
- **THEN** el middleware llama a `next()` sin responder 403 — Compras sigue operando con normalidad dentro de sus proyectos asignados
