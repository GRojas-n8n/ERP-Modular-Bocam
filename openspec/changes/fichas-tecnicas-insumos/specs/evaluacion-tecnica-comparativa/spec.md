## MODIFIED Requirements

### Requirement: Panel de evaluación técnica del Residente muestra contexto técnico por partida
El panel de evaluación técnica (SideSheet que abre el Residente en estado `EN_EVALUACION_TECNICA`) SHALL mostrar, por cada partida, además del precio de cada proveedor y los controles de decisión APROBADO/RECHAZADO:
- `marca_modelo_ref` (si está capturado)
- `especificaciones_requeridas` (si está capturado)
- Badge o botón de acceso a fichas técnicas del insumo (número de fichas disponibles o "Sin fichas")

El flujo de evaluación (decisión por partida, comentario, envío) NO cambia.

#### Scenario: Panel muestra detalles técnicos cuando están capturados
- **WHEN** el Residente abre el panel de evaluación técnica y la partida tiene `marca_modelo_ref` y/o `especificaciones_requeridas` capturados
- **THEN** esos campos se muestran en modo solo lectura dentro del card de cada partida, antes de los precios por proveedor

#### Scenario: Panel muestra badge de fichas técnicas
- **WHEN** el Residente abre el panel de evaluación técnica y la partida (insumo) tiene fichas técnicas registradas
- **THEN** se muestra un badge `📎 N fichas` clicable que abre el SideSheet de fichas para ese insumo

#### Scenario: Panel funciona igual cuando no hay detalles técnicos
- **WHEN** la partida no tiene `ComparativaLinea` registrada (cuadro antiguo) ni fichas técnicas
- **THEN** los campos se omiten silenciosamente y el panel muestra solo precios y controles de decisión — sin errores ni campos vacíos visibles
