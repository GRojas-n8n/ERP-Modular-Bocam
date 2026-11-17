## MODIFIED Requirements

### Requirement: Un rol sin endpoints SHALL advertirse al asignarlo
Cuando un rol está catalogado pero ningún servicio lo comprueba todavía, la
interfaz de alta de usuarios SHALL indicarlo al seleccionarlo, para que el
administrador sepa que el usuario verá el módulo en el menú y recibirá acceso
denegado al usarlo. El rol `seguridad_hse` SHALL dejar de estar en este
estado: el microservicio de Seguridad ya verifica este rol en sus 18 rutas
protegidas (fijado en `df8b858`, fuera de este change).

#### Scenario: Alta de un responsable de HSE ya no muestra advertencia
- **WHEN** un administrador selecciona el rol `seguridad_hse`
- **THEN** la interfaz NO SHALL mostrar el aviso de rol sin backend, porque
  el microservicio de Seguridad ya concede acceso a ese rol

### Requirement: El catálogo SHALL mantenerse consistente con el backend real
Un rol NO SHALL permanecer catalogado como `sin-backend` si algún
`requireRoles(...)` de un microservicio ya lo exige — esa combinación
significa que el catálogo quedó desactualizado tras un fix de backend, no que
el rol siga sin abrir nada.

#### Scenario: Un rol recién habilitado en el backend se detecta como catálogo desactualizado
- **WHEN** un microservicio agrega un rol `X` (marcado `sin-backend` en el
  catálogo) a uno de sus `requireRoles(...)`
- **AND** nadie actualiza `packages/roles/src/index.ts` en el mismo cambio
- **THEN** el test guardián de `catalogo.test.ts` SHALL fallar, señalando que
  `X` sigue marcado `sin-backend` pese a estar exigido por el backend
