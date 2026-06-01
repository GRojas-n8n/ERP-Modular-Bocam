# Spec: Configuración de Deducciones por Empleado

## CA-1 — Defaults seguros
- Si no existe `ConfigDeduccionEmpleado` para un empleado, el motor asume:
  `aplica_imss = true`, `aplica_isr = true`, `aplica_infonavit = false`.
- Los defaults garantizan que un empleado nuevo recibe el cálculo correcto sin configuración previa.

## CA-2 — Regla INFONAVIT
- `aplica_infonavit = true` solo es válido si `infonavit_num` y `infonavit_monto` están presentes.
- Si se intenta activar INFONAVIT sin esos campos → `400`.
- `infonavit_monto` es un monto fijo en MXN que se descuenta del neto (no un porcentaje).

## CA-3 — Lectura y escritura
- `GET /empleados/:id/config-deducciones` → retorna la config existente o los defaults si no hay registro.
- `PUT /empleados/:id/config-deducciones` → upsert. Crea si no existe, actualiza si ya existe.

## CA-4 — Visibilidad en UI
- El panel de configuración de deducciones aparece en la ficha del empleado (tab `empleados` de PersonalView), solo visible para roles `personal_rh` y `admin`.
- Muestra 3 toggles: IMSS, ISR, INFONAVIT.
- Al activar INFONAVIT, aparecen dos campos: número de crédito y monto mensual de descuento.
