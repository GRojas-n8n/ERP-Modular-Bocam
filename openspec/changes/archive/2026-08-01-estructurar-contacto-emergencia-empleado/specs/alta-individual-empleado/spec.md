## MODIFIED Requirements

### Requirement: El botón "+ Nuevo Empleado" SHALL abrir un panel de alta individual
El botón "+ Nuevo Empleado" SHALL abrir, en la pestaña Empleados del módulo
Personal, un panel (`SlidePanel`) con un formulario de alta individual
de empleado. El panel SHALL exponer los campos que acepta
`POST /api/v1/personal/empleados`: obligatorios (`nombre`,
`apellido_paterno`, `rfc`, `puesto`, `salario_diario`) y opcionales
(`apellido_materno`, `curp`, `nss`, `categoria`, `tipo_contrato`,
`fecha_ingreso`, `telefono`, `email`, `contacto_emergencia_nombre`,
`contacto_emergencia_telefono`, `contacto_emergencia_parentesco`).

#### Scenario: Clic en "+ Nuevo Empleado" abre el panel
- **WHEN** el usuario está en la pestaña Empleados y hace clic en el
  botón "+ Nuevo Empleado"
- **THEN** el sistema muestra un panel con el formulario de alta de
  empleado, vacío
