## ADDED Requirements

### Requirement: ContabilidadView con 3 tabs

El sistema SHALL proveer una vista `ContabilidadView.tsx` accesible desde el sidebar con rol `finance` o `admin`, con tabs: **Pólizas**, **Conciliación** y **Reportes**.

#### Scenario: Acceso desde sidebar
- **WHEN** usuario con rol `finance` o `admin` está autenticado
- **THEN** el sidebar muestra el ítem "Contabilidad" que navega a `ContabilidadView`

#### Scenario: Tab activo por defecto
- **WHEN** el usuario abre ContabilidadView
- **THEN** el tab "Pólizas" está activo por defecto

### Requirement: Tab Pólizas — lista de asientos con movimientos expandibles

El sistema SHALL mostrar una tabla de `AsientoContable` con columnas: folio, fecha, tipo, concepto, monto, estatus CFDI, estatus banco. Cada fila es expandible para mostrar los `MovimientoPoliza` (cargo/abono por cuenta).

#### Scenario: Lista de pólizas cargada
- **WHEN** el usuario abre el tab Pólizas
- **THEN** se llama `GET /api/v1/contabilidad/asientos` y se renderizan las pólizas en tabla

#### Scenario: Filtros por tipo y fecha
- **WHEN** el usuario selecciona tipo `EGRESO` y un rango de fechas
- **THEN** la tabla muestra solo las pólizas que coinciden con los filtros (filtrado client-side sobre los datos cargados)

#### Scenario: Expandir fila — movimientos visibles
- **WHEN** el usuario hace clic en el ícono expandir de una póliza post-cutoff
- **THEN** se llama `GET /api/v1/contabilidad/asientos/:id/movimientos` y se muestra tabla anidada con `clave | nombre cuenta | cargo | abono`

#### Scenario: Fila pre-cutoff expandida muestra mensaje
- **WHEN** el usuario expande una póliza anterior al cutoff (sin movimientos)
- **THEN** muestra texto "Póliza en partida simple (anterior al 29/06/2026)"

### Requirement: Tab Conciliación — CFDI y banco pendientes

El sistema SHALL mostrar en el tab Conciliación dos sub-secciones: (1) pólizas pendientes de CFDI (`cfdi_status = PENDIENTE`) y (2) pólizas pendientes de conciliación bancaria (`bancario_status = PENDIENTE_MOVIMIENTO`), con acciones para conciliar.

#### Scenario: Lista de pendientes CFDI
- **WHEN** el usuario abre el tab Conciliación
- **THEN** se muestran los asientos con `cfdi_status IN (PENDIENTE, CONCILIADO)` y sus datos de conciliación fiscal

#### Scenario: Acción conciliar CFDI
- **WHEN** el usuario hace clic en "Conciliar CFDI" en un asiento pendiente
- **THEN** se abre modal con campos `uuid_fiscal`, `rfc_emisor`, `rfc_receptor`, `monto_total`, `fecha_emision`
- **THEN** al confirmar, llama `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`

#### Scenario: Conciliación bancaria manual
- **WHEN** el usuario hace clic en "Conciliar Banco" en un asiento pendiente
- **THEN** se abre modal con campos `referencia_bancaria`, `banco`, `monto_banco`, `fecha_movimiento_bancario`
- **THEN** al confirmar, llama `POST /api/v1/contabilidad/asientos/:id/conciliar-banco`

### Requirement: Tab Reportes — 4 reportes con selector y filtros de fecha

El sistema SHALL mostrar en el tab Reportes un selector de reporte (Balanza de Comprobación, Estado de Resultados, Balance General, Libro Diario), un date picker para `desde` y `hasta`, y la tabla de resultados renderizada al hacer clic en "Generar".

#### Scenario: Generar balanza de comprobación
- **WHEN** usuario selecciona "Balanza de Comprobación", ingresa fechas y hace clic en "Generar"
- **THEN** se llama `GET /api/v1/contabilidad/reportes/balanza-comprobacion?desde=&hasta=`
- **THEN** se muestra tabla con columnas: Clave | Nombre | Tipo | Cargos | Abonos | Saldo

#### Scenario: Generar estado de resultados
- **WHEN** usuario selecciona "Estado de Resultados" y genera
- **THEN** se llama el endpoint correspondiente y se muestra sección Ingresos / Costos / Gastos / Utilidad Neta con subtotales

#### Scenario: Generar balance general
- **WHEN** usuario selecciona "Balance General" y genera (solo requiere fecha `hasta`)
- **THEN** se llama el endpoint con `?fecha=` y se muestra sección Activos / Pasivos / Capital

#### Scenario: Generar libro diario paginado
- **WHEN** usuario selecciona "Libro Diario" y genera
- **THEN** se muestra lista de pólizas con sus movimientos, paginada de 25 en 25

#### Scenario: Estado de carga y error
- **WHEN** el reporte está siendo generado
- **THEN** se muestra spinner en lugar de la tabla
- **WHEN** el endpoint retorna error
- **THEN** se muestra mensaje de error sin romper la vista

### Requirement: Proxy nginx y vite para contabilidad

El sistema SHALL enrutar `/api/v1/contabilidad/*` desde nginx (prod) y vite.config.ts (dev) hacia el servicio de contabilidad en puerto 3008.

#### Scenario: Request en desarrollo
- **WHEN** la app-shell en modo dev hace `fetch('/api/v1/contabilidad/asientos')`
- **THEN** vite proxy reenvía la request a `http://localhost:3008/api/v1/contabilidad/asientos`

#### Scenario: Request en producción
- **WHEN** la app-shell en prod hace `fetch('/api/v1/contabilidad/dashboard')`
- **THEN** nginx redirige a `bocam-vps-contabilidad:3008/api/v1/contabilidad/dashboard`
