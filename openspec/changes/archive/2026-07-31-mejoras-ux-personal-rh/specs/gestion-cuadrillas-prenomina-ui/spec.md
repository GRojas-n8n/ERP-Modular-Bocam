## ADDED Requirements

### Requirement: El botón "Nueva Cuadrilla" abre un panel de alta
El sistema SHALL abrir un panel de alta de cuadrilla cuando el usuario
hace clic en el botón del header estando en la pestaña Cuadrillas (el
botón muestra "Nueva Cuadrilla" en ese estado), exponiendo los campos que
acepta `POST /api/v1/personal/cuadrillas`: obligatorios (`nombre`,
`especialidad`) y opcionales (`capataz_id`, `capataz_nombre`).

#### Scenario: Clic en "Nueva Cuadrilla" abre el panel
- **WHEN** el usuario está en la pestaña Cuadrillas y hace clic en el
  botón del header
- **THEN** el sistema muestra un panel con el formulario de alta de
  cuadrilla, vacío

#### Scenario: Alta exitosa crea la cuadrilla y refresca la lista
- **WHEN** el usuario completa `nombre` y `especialidad` y confirma, y el
  backend responde 201
- **THEN** el sistema cierra el panel, refresca la lista de cuadrillas y
  la nueva cuadrilla aparece en la grilla

#### Scenario: Intento de guardar sin campos obligatorios
- **WHEN** el usuario deja vacío `nombre` o `especialidad` e intenta
  guardar
- **THEN** el sistema muestra un error y no envía la petición

### Requirement: El estado vacío de Cuadrillas ofrece un CTA para crear la primera
Cuando no hay cuadrillas registradas, el estado vacío SHALL incluir un
botón (usando el slot `action` de `EmptyStatePanel`) que abra el mismo
panel de alta de cuadrilla.

#### Scenario: Estado vacío con CTA funcional
- **WHEN** el tenant no tiene cuadrillas registradas
- **THEN** el estado vacío muestra un botón "Nueva Cuadrilla" que abre el
  panel de alta al hacer clic

### Requirement: El botón "Calcular Nomina" abre un panel para calcular pre-nómina
El sistema SHALL abrir un panel para calcular pre-nómina cuando el
usuario hace clic en el botón del header estando en la pestaña
Pre-Nómina (el botón muestra "Calcular Nomina" en ese estado), con un
formulario que pida `periodo_inicio` y `periodo_fin` (ambos obligatorios)
y llame a `POST /api/v1/personal/prenominas/calcular` con esos valores.
El formulario NO SHALL pedir `periodo_tipo` — se toma de
`ConfigNominaProyecto` en el backend.

#### Scenario: Clic en "Calcular Nomina" abre el panel
- **WHEN** el usuario está en la pestaña Pre-Nómina y hace clic en el
  botón del header
- **THEN** el sistema muestra un panel con campos de periodo de inicio y
  fin, vacío

#### Scenario: Cálculo exitoso crea la pre-nómina y refresca la lista
- **WHEN** el usuario completa `periodo_inicio` y `periodo_fin` y
  confirma, y el backend responde 201
- **THEN** el sistema cierra el panel, refresca la lista de pre-nóminas y
  la nueva pre-nómina aparece con estado `CALCULADA`

#### Scenario: El backend rechaza el cálculo (sin empleados elegibles)
- **WHEN** el backend responde con error (p. ej. "No hay empleados
  activos en este proyecto")
- **THEN** el sistema mantiene el panel abierto y muestra el mensaje de
  error devuelto por el backend, sin cerrar el panel

### Requirement: El estado vacío de Pre-Nómina ofrece un CTA para calcular la primera
Cuando no hay pre-nóminas registradas, el estado vacío SHALL incluir un
botón (usando el slot `action` de `EmptyStatePanel`) que abra el panel de
cálculo de pre-nómina, en vez de solo indicarlo en texto.

#### Scenario: Estado vacío con CTA funcional
- **WHEN** el proyecto activo no tiene pre-nóminas registradas
- **THEN** el estado vacío muestra un botón "Calcular Nomina" que abre el
  panel de cálculo al hacer clic
