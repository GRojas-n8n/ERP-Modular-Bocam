## ADDED Requirements

### Requirement: El acceso a la purga SHALL estar restringido al rol Administrador
El sistema SHALL rechazar cualquier llamada a los endpoints de resumen o
ejecución de purga que no provenga de un usuario con rol `admin`,
independientemente de lo que muestre u oculte la interfaz.

#### Scenario: Usuario sin rol admin intenta purgar
- **WHEN** un usuario con rol `procurement` (o cualquier rol distinto de
  `admin`) llama `POST /api/v1/compras/admin/purga`
- **THEN** el sistema responde 403 y no borra ningún registro

#### Scenario: Usuario admin accede al resumen
- **WHEN** un usuario con rol `admin` llama
  `GET /api/v1/compras/admin/purga/resumen`
- **THEN** el sistema responde 200 con los conteos de Requisiciones,
  Órdenes de Compra y Proveedores del proyecto activo

### Requirement: La purga SHALL requerir selección específica por checkbox
El sistema SHALL exigir una lista explícita de IDs por tipo de entidad en
cada solicitud de purga; no SHALL existir ninguna opción de "purgar toda la
categoría" sin enumerar los IDs.

#### Scenario: Solicitud sin IDs seleccionados
- **WHEN** se llama `POST /api/v1/compras/admin/purga` con
  `{ requisiciones: [], ordenes_compra: [], proveedores: [] }`
- **THEN** el sistema responde 400 y no ejecuta ninguna operación

#### Scenario: Solicitud con IDs específicos
- **WHEN** se llama `POST /api/v1/compras/admin/purga` con
  `{ requisiciones: ["id-1"], ordenes_compra: [], proveedores: [] }`
- **THEN** el sistema purga únicamente la requisición `id-1` y las entidades
  que dependen exclusivamente de ella

### Requirement: La purga de una Requisición SHALL bloquear si tiene Órdenes de Compra no seleccionadas
El sistema SHALL rechazar la purga de una Requisición cuando exista alguna
`OrdenCompra` que la referencia y que no esté incluida en la misma
solicitud de purga.

#### Scenario: Requisición con OC no seleccionada
- **WHEN** se solicita purgar una Requisición que tiene una `OrdenCompra`
  generada a partir de ella, sin incluir esa OC en `ordenes_compra`
- **THEN** el sistema responde 409 indicando cuántas OC bloquean la purga,
  y no borra la Requisición

#### Scenario: Requisición y su OC seleccionadas juntas
- **WHEN** se solicita purgar una Requisición junto con la `OrdenCompra`
  generada a partir de ella, en el mismo lote
- **THEN** el sistema borra ambas sin bloqueo

### Requirement: El cuadro comparativo y la solicitud de cotización de una Requisición SHALL purgarse automáticamente con ella
El sistema SHALL borrar, como parte de la purga de una Requisición, su
`CuadroComparativo` (y todo lo que cuelga de él) y su `SolicitudCotizacion`
asociada, sin requerir que el admin los seleccione por separado — son
artefactos internos del proceso, no documentos con valor de negocio propio.

#### Scenario: Requisición con cuadro comparativo y solicitud de cotización
- **WHEN** se solicita purgar una Requisición que tiene un
  `CuadroComparativo` y una `SolicitudCotizacion` asociados
- **THEN** el sistema borra ambos junto con todas sus entidades hijas
  (renglones, especificaciones técnicas, evaluaciones, anotaciones por
  especificación, `SolicitudCotizacionProveedor`) sin dejar huérfanos, sin
  exigir que estén listados aparte en la solicitud de purga

### Requirement: La purga de una Orden de Compra SHALL liberar fondos comprometidos de forma best-effort
El sistema SHALL intentar liberar el presupuesto comprometido en Finanzas
al purgar una Orden de Compra que tenga `presupuesto_id`, registrando el
resultado como advertencia sin bloquear el borrado si la liberación falla.

#### Scenario: OC con presupuesto comprometido
- **WHEN** se purga una `OrdenCompra` con `presupuesto_id` asignado
- **THEN** el sistema llama a Finanzas para liberar el monto comprometido
  y borra la OC independientemente de si esa llamada tuvo éxito

#### Scenario: Falla la liberación de fondos
- **WHEN** la llamada a Finanzas para liberar fondos falla (error de red o
  respuesta de error)
- **THEN** el sistema borra la OC de todas formas y devuelve una
  advertencia indicando que el presupuesto no pudo liberarse

### Requirement: La purga de un Proveedor SHALL bloquear si quedan referencias activas
El sistema SHALL rechazar la purga de un Proveedor cuando, después de
aplicar el resto del lote, sigan existiendo filas en `OrdenCompra`,
`ComparativaDetalle`, `EvaluacionEspecificacion` o
`SolicitudCotizacionProveedor` que lo referencien.

#### Scenario: Proveedor con OC vigente no seleccionada
- **WHEN** se solicita purgar un Proveedor que tiene una `OrdenCompra`
  activa no incluida en el mismo lote
- **THEN** el sistema responde 409 listando cuántas referencias bloquean
  la purga, y no borra el Proveedor

#### Scenario: Proveedor sin referencias restantes
- **WHEN** se solicita purgar un Proveedor cuyas OC, comparativas y
  evaluaciones fueron incluidas en el mismo lote o ya no existen
- **THEN** el sistema borra sus calificaciones, documentos y el registro
  del Proveedor

### Requirement: La purga SHALL ejecutarse en una sola transacción atómica
El sistema SHALL aplicar todo el lote de purga (Requisiciones, luego
Órdenes de Compra, luego Proveedores) dentro de una única transacción; si
cualquier bloqueo de integridad ocurre, el sistema SHALL revertir el lote
completo sin dejar borrados parciales.

#### Scenario: Un bloqueo a mitad del lote revierte todo
- **WHEN** un lote incluye una Requisición válida para purgar y un
  Proveedor que queda bloqueado por una referencia restante
- **THEN** el sistema no borra ni la Requisición ni ninguna otra entidad
  del lote, y responde 409 detallando el bloqueo

### Requirement: La purga SHALL exigir confirmación explícita mediante palabra escrita
La interfaz SHALL exigir que el usuario escriba la palabra exacta
`ELIMINAR` en un modal de confirmación, mostrando el conteo de lo
seleccionado, antes de habilitar el botón de borrado definitivo.

#### Scenario: Palabra de confirmación incorrecta o vacía
- **WHEN** el usuario abre el modal de confirmación y el campo de texto no
  contiene exactamente `ELIMINAR`
- **THEN** el botón de borrado definitivo permanece deshabilitado

#### Scenario: Palabra de confirmación correcta
- **WHEN** el usuario escribe `ELIMINAR` exactamente en el campo de
  confirmación
- **THEN** el botón de borrado definitivo se habilita y, al presionarlo,
  se envía la solicitud de purga con los IDs seleccionados

### Requirement: Cada purga ejecutada SHALL quedar registrada en auditoría
El sistema SHALL registrar, para cada purga ejecutada exitosamente, el
usuario que la ejecutó, el timestamp, y los IDs y conteos por tipo de
entidad borrada, usando el mecanismo de logging de observabilidad ya
existente en el módulo.

#### Scenario: Purga exitosa genera registro de auditoría
- **WHEN** una purga se ejecuta exitosamente sobre 2 Requisiciones y 1
  Proveedor
- **THEN** el sistema registra un evento de auditoría con el usuario, el
  timestamp y el detalle de los 3 registros borrados
