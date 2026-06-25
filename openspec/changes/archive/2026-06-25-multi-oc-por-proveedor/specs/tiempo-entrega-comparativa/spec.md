## ADDED Requirements

### Requirement: Columna "Tiempo de entrega" visible en la tabla del cuadro para el GT
En `ComparativaDetail`, cuando el componente se renderiza en modo `compras` (Gerencia Técnica / Procurement), la tabla del cuadro comparativo SHALL mostrar una columna **"Tiempo"** por proveedor, alimentada desde `ComparativaDetalle.tiempo_entrega` del backend.

#### Scenario: Proveedor con tiempo de entrega capturado
- **WHEN** el GT abre un cuadro comparativo y un proveedor tiene `tiempo_entrega = "7 días hábiles"` en su detalle
- **THEN** la columna "Tiempo" de ese proveedor muestra "7 días hábiles" en cada renglón donde ese proveedor tiene cotización

#### Scenario: Proveedor sin tiempo de entrega
- **WHEN** un proveedor no registró tiempo de entrega en su cotización (`tiempo_entrega = null`)
- **THEN** la celda muestra "—" (guión) sin error

#### Scenario: Columna oculta en modo residente
- **WHEN** un residente abre el cuadro comparativo para hacer su evaluación técnica (modo residente)
- **THEN** la columna "Tiempo" NO aparece en la tabla

### Requirement: Posición de la columna Tiempo en la tabla
La columna "Tiempo" SHALL aparecer inmediatamente después de la columna de precio del proveedor y antes de las columnas de evaluación técnica, de modo que el GT pueda comparar costo y plazo de entrega en la misma visual.

#### Scenario: Orden de columnas en modo GT
- **WHEN** el GT visualiza la tabla con 2 proveedores
- **THEN** el orden de columnas por proveedor es: Precio | Tiempo | Evaluación Técnica | Ganador
