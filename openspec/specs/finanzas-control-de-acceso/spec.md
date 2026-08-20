# finanzas-control-de-acceso Specification

## Purpose

Las mutaciones de la saga de fondos del módulo Finanzas
(`comprometer-fondos` y `liberar-fondos`) exigen un rol autorizado antes de
ejecutar cualquier lectura o escritura contra la base de datos y antes de
publicar cualquier evento de dominio. El conjunto de roles autorizados
preserva la saga Compras → Finanzas, en la que Compras invoca a Finanzas
reenviando el JWT del usuario original en vez de una credencial de
servicio.

## Requirements

### Requirement: Las mutaciones de la saga de fondos SHALL exigir un rol autorizado
Los endpoints `POST /api/v1/finanzas/comprometer-fondos` y `POST /api/v1/finanzas/liberar-fondos` SHALL rechazar con 403 toda petición cuyo JWT no incluya al menos uno de los roles `finanzas`, `admin`, `superintendent` o `procurement`, antes de ejecutar cualquier lectura o escritura contra la base de datos y antes de publicar cualquier evento de dominio.

Estar autenticado y tener acceso al proyecto (`requireProjectAccess`) NO SHALL
ser suficiente para congelar ni liberar fondos.

#### Scenario: Rol sin autorización intenta comprometer fondos
- **WHEN** un usuario autenticado con acceso al proyecto y rol `resident`
  (o cualquier otro fuera del conjunto autorizado) hace
  `POST /api/v1/finanzas/comprometer-fondos`
- **THEN** la respuesta SHALL ser 403 con `error.code: 'AUTH_FORBIDDEN'`, no
  SHALL modificarse ningún presupuesto ni movimiento, y no SHALL publicarse el
  evento `FondosComprometidos`

#### Scenario: Rol sin autorización intenta liberar fondos
- **WHEN** un usuario autenticado con acceso al proyecto y rol `seguridad_hse`
  (o cualquier otro fuera del conjunto autorizado) hace
  `POST /api/v1/finanzas/liberar-fondos`
- **THEN** la respuesta SHALL ser 403 con `error.code: 'AUTH_FORBIDDEN'`, no
  SHALL modificarse ningún presupuesto ni movimiento, y no SHALL publicarse el
  evento `FondosLiberados`

#### Scenario: Rol de Finanzas opera directamente
- **WHEN** un usuario con rol `finanzas` o `admin` hace
  `POST /api/v1/finanzas/comprometer-fondos` o `.../liberar-fondos`
- **THEN** la petición SHALL pasar el control de acceso por rol y continuar a la
  validación de negocio existente (suficiencia presupuestal, idempotencia,
  límites), sin cambio de comportamiento respecto al estado previo

### Requirement: El conjunto de roles autorizados SHALL preservar la saga Compras → Finanzas
El conjunto de roles autorizado para las mutaciones de la saga de fondos SHALL
incluir todos los roles que pueden disparar esas llamadas desde Compras, dado que
Compras invoca a Finanzas reenviando el JWT del usuario original en vez de una
credencial de servicio.

Concretamente, SHALL incluir `procurement` y `superintendent`, que junto con
`admin` son los roles exigidos por
`POST /api/v1/compras/comparativas/:id/convertir-oc`,
`POST /api/v1/compras/ordenes-compra/:id/cancelar` y
`POST /api/v1/compras/ordenes-compra/:id/reconciliar-finanzas`.

#### Scenario: Emisión de orden de compra por un usuario de Compras
- **WHEN** un usuario con rol `procurement` convierte una comparativa en orden de
  compra, y Compras llama a `POST /api/v1/finanzas/comprometer-fondos`
  reenviando el token de ese usuario
- **THEN** Finanzas SHALL aceptar la llamada, comprometer los fondos y la OC
  SHALL quedar en estado `EMITIDA` — no SHALL caer en `ERROR_FINANZAS` por un
  403 de control de acceso

#### Scenario: Cancelación de orden de compra por un usuario de Compras
- **WHEN** un usuario con rol `procurement` o `superintendent` cancela una orden
  de compra y Compras llama a `POST /api/v1/finanzas/liberar-fondos` reenviando
  su token
- **THEN** Finanzas SHALL aceptar la llamada y liberar los fondos comprometidos
