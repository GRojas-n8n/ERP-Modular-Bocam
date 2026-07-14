## MODIFIED Requirements

### Requirement: El rol `residencia` SHALL poder registrar la evaluación técnica y firmar el cuadro comparativo
El sistema SHALL reconocer el rol real `residencia` (el único rol asignable
a un Residente de Obra desde el catálogo de roles de administración) para
mostrar y habilitar, en `ComparativaDetail` sobre un cuadro comparativo en
estado `EN_EVALUACION_TECNICA`:
- el botón "Registrar Evaluación Técnica →"
- la sección "Veredicto del Residente" (veredicto técnico + selección de
  proveedor recomendado / 2ª opción), independientemente de si el
  componente se abrió en modo `residente`, `compras` o `gt`
- el botón "🔒 Firmar y Bloquear →" una vez que el veredicto y la selección
  de proveedor están completos y todos los renglones fueron evaluados

Estas mismas acciones SHALL seguir disponibles para el rol `admin` y para
los sinónimos legacy de rol ya soportados (`resident`, `control_obra`),
sin remover compatibilidad existente. Esto SHALL aplicar por igual a
cuadros cuyas líneas provienen de un insumo de catálogo y a cuadros cuyas
líneas son de texto libre (imprevisto, sin catálogo).

#### Scenario: Residente con rol `residencia` abre su cuadro pendiente de evaluación
- **WHEN** un usuario cuyo único rol es `residencia` abre, desde la pestaña
  "Eval. Técnica" de `ComprasView`, un cuadro comparativo en estado
  `EN_EVALUACION_TECNICA` (el componente se renderiza con `modo="residente"`)
- **THEN** el usuario ve el botón "Registrar Evaluación Técnica →" y, tras
  evaluar todos los renglones, la sección "Veredicto del Residente" con los
  campos para llenar el veredicto técnico y seleccionar el proveedor
  recomendado

#### Scenario: Residente completa veredicto y selección de proveedor
- **WHEN** un usuario con rol `residencia`, en modo `residente`, llena el
  veredicto técnico, selecciona una 1ª opción de proveedor y evalúa todos
  los renglones del cuadro
- **THEN** el botón "🔒 Firmar y Bloquear →" se habilita y, al hacer clic,
  el cuadro pasa a estado `FIRMADO_BLOQUEADO`

#### Scenario: Rol sin permiso no ve las acciones de evaluación
- **WHEN** un usuario cuyo rol no incluye `residencia`, `resident`,
  `control_obra`, `admin`, ni `superintendent` abre el mismo cuadro
- **THEN** no ve el botón "Registrar Evaluación Técnica →" ni la sección
  "Veredicto del Residente" ni el botón de firma

#### Scenario: Usuario con rol `admin` abre el panel de evaluación técnica
- **WHEN** un usuario con rol `admin` (sin `residencia` ni `superintendent`)
  abre un cuadro comparativo en estado `EN_EVALUACION_TECNICA`, en un
  cuadro con líneas de catálogo o de texto libre
- **THEN** ve el botón "Registrar Evaluación Técnica →" y, al hacer clic,
  el panel muestra los controles C/NC/DA/? para cada renglón, igual que
  para un usuario con rol `residencia`

## ADDED Requirements

### Requirement: La descripción de una línea de texto libre SHALL conservarse al releer el cuadro desde el backend
El sistema SHALL mostrar la descripción real del ítem de requisición (capturada como texto
libre por el Residente) en `insumo_descripcion` de una línea del Cuadro Comparativo sin
`insumo_id` de catálogo, tanto al crear el cuadro como al releerlo desde el backend
(recarga de página, bandeja de pendientes de evaluación técnica, bandeja de aprobación GT).

#### Scenario: Recargar la página tras crear un cuadro con líneas de texto libre
- **WHEN** Compras crea un cuadro con una línea de texto libre (sin `insumo_id`) y luego
  recarga la página o vuelve a abrir el cuadro en otra sesión
- **THEN** la línea sigue mostrando la descripción real capturada en la requisición, no un
  guion (`—`)

#### Scenario: El Residente ve la línea de texto libre en su bandeja de evaluación técnica
- **WHEN** el Residente abre, desde la pestaña "Eval. Técnica", un cuadro con una línea de
  texto libre enviado a evaluación
- **THEN** ve la descripción real del ítem, no un guion (`—`)
