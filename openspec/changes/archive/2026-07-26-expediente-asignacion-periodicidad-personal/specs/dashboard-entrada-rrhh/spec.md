## MODIFIED Requirements

### Requirement: Layout del dashboard de Recursos Humanos
El dashboard de RRHH en `PersonalView.tsx` (sección superior) SHALL mostrar, además de los tiles y alertas ya existentes (Empleados Activos, Asistencia Hoy, Incidencias Pendientes, distribución de jornada, próximo corte de nómina, alertas de ausencia), una alerta de "Documentos por vencer/vencidos" cuando el dashboard la retorne, con un enlace o botón que navegue al panel de detalle "Vencimientos".

#### Scenario: Sin documentos por vencer
- **WHEN** el dashboard no retorna alerta `DOCUMENTO_POR_VENCER`
- **THEN** la sección de alertas no muestra ningún renglón de vencimientos

#### Scenario: Con documentos por vencer o vencidos
- **WHEN** el dashboard retorna una alerta `DOCUMENTO_POR_VENCER`
- **THEN** se muestra un renglón `⚠ N documento(s) por vencer/vencidos` con el color correspondiente a su severidad, y un enlace que abre el panel "Vencimientos"

#### Scenario: Solo visible para rol RH/admin
- **WHEN** un usuario sin rol `personal_rh`/`admin` visualiza `PersonalView.tsx`
- **THEN** no ve la alerta de vencimientos (mismo comportamiento de visibilidad ya existente para el resto del dashboard de RRHH)
