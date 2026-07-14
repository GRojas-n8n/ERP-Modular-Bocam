## Requirements

### Requirement: Consulta batch de stock por insumo en Almacén
`apps/almacen` SHALL exponer `GET /api/v1/almacen/stock?insumo_ids=<uuid,uuid,...>` que devuelve el `stock_actual` de cada `insumo_id` solicitado, filtrado por `tenant_id` y `proyecto_id` de la sesión.

#### Scenario: Consulta con insumos que tienen stock registrado
- **WHEN** se consulta el endpoint con una lista de `insumo_id` que incluye
  insumos con filas en `ItemInventario` del proyecto activo
- **THEN** la respuesta incluye `{ insumo_id, stock_actual }` para cada uno
  de esos insumos

#### Scenario: Insumo sin fila en ItemInventario
- **WHEN** uno de los `insumo_id` consultados no tiene ninguna fila en
  `ItemInventario` para ese `tenant_id`/`proyecto_id`
- **THEN** ese `insumo_id` simplemente no aparece en la respuesta
  (equivalente a stock cero, sin distinguirlo de "no existe")

#### Scenario: Lista vacía o sin parámetro
- **WHEN** se llama al endpoint sin `insumo_ids` o con una lista vacía
- **THEN** la respuesta es `{ success: true, data: [] }`, sin error

### Requirement: Consulta de stock al abrir el panel de solicitud de cotización
Al abrir el panel de "Solicitar Cotización" de una Requisición, `apps/compras` SHALL consultar el stock en Almacén de todos los insumos no imprevistos de esa requisición, en una sola llamada batch.

#### Scenario: Requisición con insumos catalogados
- **WHEN** Compras abre el panel de "Solicitar Cotización" de una
  requisición con ítems que tienen `insumo_id` (no imprevistos)
- **THEN** se consulta `GET /api/v1/almacen/stock` con todos esos
  `insumo_id` en una sola llamada, no una llamada por insumo

#### Scenario: Requisición solo con ítems imprevistos
- **WHEN** todos los ítems de la requisición tienen `es_imprevisto = true`
- **THEN** no se realiza ninguna llamada a Almacén (no hay `insumo_id` que
  consultar)

### Requirement: Ítems imprevistos excluidos de la validación de stock
Un `RequisicionItem` con `es_imprevisto = true` SHALL quedar fuera de la validación de stock — no se marca como "con stock" ni como "sin stock", simplemente no participa.

#### Scenario: Requisición mixta (catalogados + imprevistos)
- **WHEN** una requisición tiene ítems con `insumo_id` y también ítems
  `es_imprevisto = true`
- **THEN** solo los ítems con `insumo_id` se incluyen en la consulta y en
  la posible advertencia de stock; los imprevistos no aparecen en ningún
  lado de esa advertencia

### Requirement: Advertencia con confirmación antes de enviar si hay stock disponible
Si algún insumo no imprevisto de la requisición tiene `stock_actual > 0` en el proyecto activo, el panel de "Solicitar Cotización" SHALL mostrar una advertencia con el detalle (insumo, cantidad solicitada, stock disponible) y SHALL requerir una confirmación explícita adicional antes de habilitar el envío.

#### Scenario: Uno o más insumos con stock disponible
- **WHEN** Compras abre el panel y al menos un insumo no imprevisto tiene
  `stock_actual > 0`
- **THEN** se muestra la lista de esos insumos con su cantidad solicitada
  y su stock disponible, y el botón de envío normal queda reemplazado por
  un flujo que exige confirmar explícitamente ("Enviar de todos modos")
  antes de poder enviar la solicitud

#### Scenario: Ningún insumo con stock disponible
- **WHEN** ningún insumo no imprevisto de la requisición tiene stock
  registrado (o todos tienen `stock_actual = 0`)
- **THEN** el panel se comporta exactamente igual que hoy — el botón
  "Enviar Solicitud" está disponible sin ningún paso ni confirmación
  adicional

#### Scenario: Compras confirma el envío pese a la advertencia
- **WHEN** Compras hace clic en "Entiendo, enviar de todos modos" tras ver
  la advertencia
- **THEN** la solicitud de cotización se envía normalmente (mismo endpoint
  y comportamiento actual), sin ningún cambio en los datos que se
  persisten ni en los correos enviados a proveedores

### Requirement: Degradación fail-soft si Almacén no responde
Si la consulta de stock a Almacén falla (timeout, error, servicio caído), `apps/compras` SHALL permitir el envío de la solicitud de cotización sin mostrar advertencia de stock, sin bloquear ni degradar el resto del flujo.

#### Scenario: Almacén no disponible al abrir el panel
- **WHEN** la llamada `GET /api/v1/almacen/stock` falla o excede el
  timeout
- **THEN** el panel se comporta como si ningún insumo tuviera stock
  disponible — no se bloquea la apertura del panel ni el envío de la
  solicitud, y no se muestra ningún mensaje de error de Almacén al usuario
