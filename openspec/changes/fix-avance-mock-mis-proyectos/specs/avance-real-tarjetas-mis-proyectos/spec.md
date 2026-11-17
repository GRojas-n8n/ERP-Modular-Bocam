## ADDED Requirements

### Requirement: Avance real en las tarjetas de "Mis Proyectos"
El sistema SHALL mostrar en cada tarjeta de proyecto de la sección "Mis Proyectos" del Dashboard estándar (`DashboardView`) el porcentaje de avance físico real del proyecto, obtenido desde `control-proyectos`, y NUNCA un valor calculado a partir de la posición del proyecto en la lista o cualquier otro dato no relacionado con avance real.

#### Scenario: Proyecto sin avances físicos registrados
- **WHEN** un usuario abre el Dashboard estándar y uno de sus proyectos no tiene ningún registro de `avanceFisico` validado
- **THEN** la tarjeta de ese proyecto muestra "Sin avances registrados" (o 0% con indicación explícita de que no hay datos), nunca un porcentaje sintético mayor a 0%

#### Scenario: Proyecto con avances físicos validados
- **WHEN** un usuario abre el Dashboard estándar y uno de sus proyectos tiene registros de `avanceFisico` con `estado: 'VALIDADO'`
- **THEN** la tarjeta de ese proyecto muestra el promedio real de `porcentaje_avance` de esos registros, redondeado, consistente con el cálculo que usa `DashboardEjecutivo`

#### Scenario: Avance en carga
- **WHEN** el Dashboard estándar todavía está obteniendo el avance real de los proyectos del usuario
- **THEN** cada tarjeta muestra un estado de carga (skeleton/placeholder) en el lugar del porcentaje, y no un número, hasta que el dato real llegue o falle

#### Scenario: Falla el fetch de avance
- **WHEN** la llamada al endpoint de avance por proyecto falla o hace timeout
- **THEN** la tarjeta muestra un estado de error o "Avance no disponible" en vez de cualquier porcentaje numérico

### Requirement: Endpoint de avance por lote de proyectos
El sistema SHALL exponer en `control-proyectos` un endpoint que reciba una lista de `proyecto_id` y devuelva, para cada uno, el avance físico promedio validado y si tiene o no avances registrados, restringido a los proyectos a los que el usuario autenticado tiene acceso.

#### Scenario: Solicitud de avance para proyectos propios
- **WHEN** un usuario autenticado solicita el avance de una lista de `proyecto_id` que están todos entre sus proyectos asignados
- **THEN** el sistema responde con `{ proyecto_id, avance_pct, tiene_avances }` por cada uno de esos proyectos

#### Scenario: Solicitud incluye un proyecto sin acceso
- **WHEN** la lista de `proyecto_id` solicitada incluye un proyecto al que el usuario autenticado no tiene acceso
- **THEN** el sistema excluye ese proyecto de la respuesta (o responde error), sin filtrar su avance
