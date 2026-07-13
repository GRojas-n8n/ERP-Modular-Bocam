## ADDED Requirements

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
sin remover compatibilidad existente.

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
