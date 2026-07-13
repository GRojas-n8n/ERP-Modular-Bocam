## REMOVED Requirements

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

**Reason**: `ComparativaDetalle.tiempo_entrega` (texto libre, `VARCHAR(50)`) nunca se capturaba de verdad — el frontend no tenía ningún input para editarlo, solo aparecía en datos demo/seed (confirmado por grep en todo el repo). Se reemplaza por `fecha_entrega_estimada` (fecha estructurada), capturable de verdad desde la Tabla de Cotizaciones.

**Migration**: Ver la capability `cotizacion-compras-ux` (`fecha-entrega-estimada-por-partida`) para el reemplazo: la columna ahora se llama "Fecha entrega", es un input de fecha editable (no texto de solo lectura) en modo `compras`, y se alimenta de `ComparativaDetalle.fecha_entrega_estimada`. Migración de schema incluida en ese mismo change (`ALTER TABLE ... DROP COLUMN tiempo_entrega, ADD COLUMN fecha_entrega_estimada`); sin pérdida de datos de negocio porque el campo viejo nunca tuvo datos reales.

### Requirement: Posición de la columna Tiempo en la tabla
La columna "Tiempo" SHALL aparecer inmediatamente después de la columna de precio del proveedor y antes de las columnas de evaluación técnica, de modo que el GT pueda comparar costo y plazo de entrega en la misma visual.

#### Scenario: Orden de columnas en modo GT
- **WHEN** el GT visualiza la tabla con 2 proveedores
- **THEN** el orden de columnas por proveedor es: Precio | Tiempo | Evaluación Técnica | Ganador

**Reason**: Mismo reemplazo que el requirement anterior — la columna sigue existiendo (renombrada a "Fecha entrega"), en la misma posición.

**Migration**: Ninguna acción adicional — la posición de la columna no cambió, solo su contenido/interacción. Ver `cotizacion-compras-ux`.
