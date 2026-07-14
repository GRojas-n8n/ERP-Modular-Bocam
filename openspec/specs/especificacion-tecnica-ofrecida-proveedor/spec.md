## Requirements

### Requirement: Compras SHALL poder capturar la especificación técnica que cada proveedor ofrece por renglón del Cuadro Comparativo

Mientras el Cuadro Comparativo está en estado `BORRADOR`, Compras SHALL poder capturar un
texto libre opcional por cada combinación (renglón, proveedor) describiendo la
especificación, marca o modelo que ese proveedor está ofreciendo — en la misma pantalla
donde ya captura precio y fecha de entrega estimada por proveedor.

#### Scenario: Compras captura la especificación ofrecida junto al precio
- **WHEN** Compras está armando el Cuadro Comparativo (estado `BORRADOR`) y escribe un
  texto en el campo de especificación ofrecida para un proveedor en un renglón
- **THEN** ese texto queda asociado a esa combinación específica (renglón, proveedor),
  independiente de los valores de otros proveedores en el mismo renglón

#### Scenario: El campo es opcional
- **WHEN** Compras guarda el cuadro sin haber llenado la especificación ofrecida para
  algún (renglón, proveedor)
- **THEN** el guardado y el envío a evaluación técnica proceden sin error — el campo
  vacío no bloquea el flujo

#### Scenario: El campo deja de ser editable fuera de BORRADOR
- **WHEN** el cuadro ya no está en estado `BORRADOR` (fue enviado a evaluación técnica o
  a etapas posteriores)
- **THEN** el campo de especificación ofrecida ya no es editable — mismo comportamiento
  que ya aplica hoy a precio y fecha de entrega estimada

### Requirement: El Residente SHALL ver la especificación ofrecida por cada proveedor, separada por proveedor, durante la evaluación técnica

En la vista de evaluación técnica del Residente, el Cuadro Comparativo SHALL mostrar,
para cada renglón, la especificación técnica ofrecida por CADA proveedor de forma
independiente — nunca colapsada a un solo valor compartido entre proveedores distintos.

#### Scenario: Renglón con especificación ofrecida capturada por dos proveedores distintos
- **WHEN** el Residente abre un Cuadro Comparativo en evaluación técnica donde Compras
  capturó especificaciones ofrecidas distintas para 2 proveedores en el mismo renglón
- **THEN** el Residente ve ambos valores correctamente separados, cada uno bajo la
  columna de su proveedor correspondiente

#### Scenario: Renglón sin especificación ofrecida capturada
- **WHEN** el Residente abre un renglón donde Compras no capturó ninguna especificación
  ofrecida para un proveedor
- **THEN** esa celda se muestra vacía (sin texto ni error), sin bloquear la evaluación
  C/NC/DA/? de ese renglón
