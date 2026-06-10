## ADDED Requirements

### Requirement: Residente accede a cuadros pendientes desde ResidenciaView

El sistema SHALL mostrar en `ResidenciaView` un tab o sección "Para evaluar" con los cuadros comparativos en estado `EN_EVALUACION_TECNICA` que correspondan al proyecto del Residente. El Residente NO necesita navegar al módulo de Compras para hacer su evaluación.

#### Scenario: Tab "Para evaluar" visible cuando hay cuadros pendientes

- **WHEN** el Residente abre ResidenciaView y hay cuadros en `EN_EVALUACION_TECNICA`
- **THEN** se muestra un tab o badge con el conteo de cuadros pendientes de evaluación

#### Scenario: Tab vacío cuando no hay pendientes

- **WHEN** no hay cuadros en `EN_EVALUACION_TECNICA` para el proyecto del Residente
- **THEN** el tab muestra estado vacío: "Sin cuadros pendientes de evaluación"

### Requirement: Vista del cuadro comparativo para el Residente — sin precios

Cuando el Residente abre un cuadro comparativo en modo evaluación, el sistema SHALL mostrar una vista que NO incluye columnas de precio unitario, precio total, subtotales por proveedor, ni fechas de entrega. La tabla mostrará únicamente:
- Clave y descripción del material
- Cantidad y unidad de medida
- Especificaciones requeridas (capturadas en la req)
- Lo que cada proveedor ofrece (campo `valor_ofrecido_spec` por renglón/proveedor)
- Fichas técnicas disponibles (badge 📎 N)
- Columna de evaluación técnica por renglón: C / NC / DA / ?

#### Scenario: El Residente no ve precios en ningún estado del cuadro

- **WHEN** el Residente abre un cuadro en `EN_EVALUACION_TECNICA`
- **THEN** la tabla NO contiene columnas de precio, subtotales ni totales

#### Scenario: El Residente ve lo que el proveedor ofrece (sin precio)

- **WHEN** Compras ha capturado el campo "lo que ofrece" para un proveedor en un renglón
- **THEN** el Residente ve ese valor en la columna del proveedor correspondiente

#### Scenario: Compras ve la tabla completa con precios

- **WHEN** un usuario con rol `procurement` o `admin` abre el mismo cuadro
- **THEN** ve la tabla completa con columnas de precio, totales y selección de ganador

### Requirement: Stepper del cuadro muestra estado actual claro para el Residente

El stepper visual SHALL usar labels descriptivos y mostrar el paso actual de forma inequívoca. Los pasos serán:
1. Especificaciones (req creada con specs)
2. Cotizando (Compras armando cuadro)
3. Evaluación técnica (Residente evaluando)
4. Revisión GT
5. OC Emitida

#### Scenario: Residente en paso de evaluación

- **WHEN** el cuadro está en `EN_EVALUACION_TECNICA`
- **THEN** el stepper resalta el paso "Evaluación técnica" y los anteriores aparecen como completados
