# Spec: Asistencia QR Backend

## CA-1 — Registro de asistencia diaria
- `POST /asistencia/registro` acepta: `empleado_id`, `fecha` (YYYY-MM-DD), `estado` (PRESENTE | AUSENTE | INCAPACIDAD | JUSTIFICADA | FALTA), `horas_extra?` (default 0), `tipo_registro?` (QR | MANUAL, default MANUAL).
- `proyecto_id` del JWT, `tenant_id` del JWT.
- Si ya existe un registro para ese `(tenant_id, empleado_id, fecha)` → hace upsert (actualiza estado y horas_extra).
- `registrado_por` = `userId` del JWT.

## CA-2 — Registro batch de cuadrilla
- `POST /asistencia/bulk` acepta: `fecha`, `cuadrilla_id?`, `registros: [{ empleado_id, estado, horas_extra? }]`.
- Todos los registros se upsert en una sola transacción.
- Si algún `empleado_id` no pertenece al tenant → `400`.

## CA-3 — Consulta de registros
- `GET /asistencia` filtra por: `fecha_inicio` (requerido), `fecha_fin` (requerido), `cuadrilla_id?`, `empleado_id?`.
- Retorna array con todos los campos del registro.
- Solo registros del `proyecto_id` del JWT.

## CA-4 — Corrección de registro (RH)
- `PATCH /asistencia/:id` permite cambiar `estado` y `horas_extra`.
- Solo roles `personal_rh` y `admin`.
- `404` si el registro no existe en el tenant.

## CA-5 — Resumen del período para cálculo de nómina
- `GET /asistencia/resumen?fecha_inicio=...&fecha_fin=...` retorna por empleado:
  ```json
  {
    "empleado_id": "...",
    "dias_trabajados": 5,
    "dias_ausente": 1,
    "dias_incapacidad": 0,
    "total_horas_extra": 3.5,
    "origen": "ASISTENCIA"
  }
  ```
- Si un empleado activo NO tiene ningún registro en el período → incluirlo con `dias_trabajados = diasDelPeriodo`, `origen = "ESTIMADO"`.
