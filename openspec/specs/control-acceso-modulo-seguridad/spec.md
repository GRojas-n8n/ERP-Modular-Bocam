# control-acceso-modulo-seguridad Specification

## Purpose
TBD - created by archiving change rbac-seguridad-endpoints-sin-rol. Update Purpose after archive.
## Requirements
### Requirement: Las rutas de negocio de Seguridad SHALL exigir un rol autorizado
Toda ruta bajo `/api/v1/seguridad` (excepto `/health`) SHALL rechazar con 403
las peticiones cuyo JWT no incluya al menos uno de `seguridad_hse`,
`superintendent` o `admin`. Estar autenticado y tener acceso al proyecto
activo NO SHALL ser suficiente para reportar o cerrar incidentes, autorizar
permisos de trabajo de alto riesgo, programar/completar capacitaciones, ni
gestionar registros de EPP.

#### Scenario: Rol sin acceso al módulo intenta reportar un incidente
- **WHEN** un usuario con rol `warehouse` (o cualquier rol distinto de
  `seguridad_hse`, `superintendent`, `admin`) hace
  `POST /api/v1/seguridad/incidentes`
- **THEN** la respuesta SHALL ser 403 con `error.code: 'AUTH_FORBIDDEN'`

#### Scenario: Rol sin acceso al módulo intenta autorizar un permiso de trabajo
- **WHEN** un usuario sin `seguridad_hse`/`superintendent`/`admin` hace
  `PATCH /api/v1/seguridad/permisos/:id/autorizar`
- **THEN** la respuesta SHALL ser 403 con `error.code: 'AUTH_FORBIDDEN'`, sin
  depender del chequeo manual previo (`roles.includes('hse_manager')`), que
  este requisito reemplaza

#### Scenario: seguridad_hse, superintendent y admin siguen operando el módulo
- **WHEN** un usuario con rol `seguridad_hse`, `superintendent` o `admin`
  hace cualquiera de las 18 rutas de negocio recién protegidas por este
  requisito (todas menos `/resumen-dashboard`, que ya exigía rol y no cambia)
- **THEN** la petición SHALL pasar el control de acceso y llegar al handler
  de negocio (no SHALL responder 403)

