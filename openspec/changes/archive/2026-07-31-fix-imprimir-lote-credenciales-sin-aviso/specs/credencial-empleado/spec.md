## MODIFIED Requirements

### Requirement: Impresión en lote de una, varias o todas las credenciales de un proyecto
El sistema SHALL permitir a RH seleccionar uno, varios, o todos los empleados elegibles de un proyecto (mismo criterio de `obtenerEmpleadoIdsDelProyecto` usado en `calcular`) y generar una hoja imprimible (frente y reverso) con sus credenciales, incluyendo QR real codificado como `BOCAM:CRED:{token}` — generando una credencial nueva automáticamente para cualquier empleado seleccionado que aún no tenga una `activa`. Si alguno de los empleados seleccionados no es elegible del proyecto activo, el sistema SHALL informar explícitamente al usuario cuáles/cuántos quedaron excluidos, sin generar una hoja de impresión vacía o incompleta en silencio.

#### Scenario: Imprimir credenciales de todo un proyecto
- **WHEN** RH selecciona "todos" en el selector de impresión para el proyecto activo
- **THEN** el sistema genera la hoja con una credencial por cada empleado elegible del proyecto, emitiendo credencial nueva a quien no tenía

#### Scenario: Ningún empleado seleccionado es elegible del proyecto activo
- **WHEN** RH selecciona uno o más empleados para imprimir y ninguno de ellos está asignado (vía `AsignacionFrente` o `Cuadrilla`) al proyecto activo
- **THEN** el sistema NO abre ninguna hoja de impresión y notifica al usuario que ningún empleado seleccionado pertenece al proyecto activo

#### Scenario: Exclusión parcial de empleados no elegibles
- **WHEN** RH selecciona varios empleados y solo algunos están asignados al proyecto activo
- **THEN** el sistema genera la hoja de impresión únicamente con los empleados elegibles y notifica al usuario cuántos fueron excluidos por no pertenecer al proyecto activo
