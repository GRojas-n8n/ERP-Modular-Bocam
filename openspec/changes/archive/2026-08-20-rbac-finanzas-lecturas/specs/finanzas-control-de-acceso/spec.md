## ADDED Requirements

### Requirement: Las lecturas de Finanzas SHALL exigir un rol autorizado
Toda ruta `GET` bajo `/api/v1/finanzas` (excepto `/health`) SHALL rechazar con
403 las peticiones cuyo JWT no incluya al menos uno de los roles autorizados para
esa ruta. Estar autenticado y tener acceso al proyecto NO SHALL ser suficiente
para leer información presupuestal, de pagos ni de movimientos.

#### Scenario: Rol operativo consulta el resumen presupuestal
- **WHEN** un usuario con rol `seguridad_hse`, `calidad` o `warehouse` hace
  `GET /api/v1/finanzas/dashboard`
- **THEN** la respuesta SHALL ser 403 con `error.code: 'AUTH_FORBIDDEN'`

#### Scenario: La pantalla de inicio degrada sin romperse
- **WHEN** un usuario sin acceso a Finanzas carga la pantalla de inicio y la
  petición a `GET /api/v1/finanzas/dashboard` responde 403
- **THEN** el resto de las tarjetas del dashboard SHALL renderizarse
  normalmente, y la tarjeta financiera SHALL ocultarse — no mostrarse en estado
  de error

### Requirement: Los conjuntos de lectura SHALL preservar los consumos cruzados existentes
El conjunto autorizado de cada lectura SHALL incluir todos los roles que hoy la
alcanzan a través de un consumidor legítimo, sea una vista del app-shell, un
componente compartido montado en otro módulo, o una llamada backend-to-backend
que reenvía el JWT del usuario original.

#### Scenario: Compras resuelve suficiencia al emitir una OC
- **WHEN** un usuario con rol `procurement` convierte una comparativa en orden de
  compra y Compras llama a `GET /suficiencia` y
  `GET /presupuestos/por-concepto/:conceptoId` con su token
- **THEN** Finanzas SHALL aceptar ambas lecturas

#### Scenario: Control presupuestal por partida en dos módulos
- **WHEN** un usuario con rol `gerencia_tecnica` abre el control presupuestal en
  Gerencia Técnica, o uno con rol `control_obra` lo abre en Control de Obra, y el
  componente compartido llama a `GET /movimientos?concepto_id=...`
- **THEN** Finanzas SHALL aceptar la lectura en ambos casos
