## MODIFIED Requirements

### Requirement: El botón "Editar" SHALL abrir un panel de edición precargado
En la pestaña Empleados del módulo Personal, cada fila de la tabla SHALL mostrar
un botón "Editar" junto a los botones existentes "Jornada" y "Deducciones". Al
hacer clic, el sistema SHALL abrir un panel (`SlidePanel`) con un formulario
precargado con los datos actuales del empleado: `nombre`, `apellido_paterno`,
`apellido_materno`, `rfc`, `curp`, `nss`, `puesto`, `salario_diario`, `telefono`,
`email`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`,
`contacto_emergencia_parentesco`.

#### Scenario: Clic en "Editar" abre el panel con los datos actuales
- **WHEN** el usuario está en la pestaña Empleados y hace clic en "Editar" sobre
  la fila de un empleado
- **THEN** el sistema muestra un panel con el formulario de edición, con cada
  campo precargado con el valor actual de ese empleado
