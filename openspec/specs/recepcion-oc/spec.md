# Spec: recepcion-oc

## Comportamiento esperado

Procurement puede registrar recepciones de materiales contra una OC activa (EMITIDA o PARCIALMENTE_RECIBIDA), con seguimiento por línea de cantidad recibida y notas de discrepancia. El sistema acumula recepciones y transiciona la OC automáticamente al completarse.

---

### Requirement: Registrar recepción de materiales contra OC
El sistema SHALL permitir registrar una recepción de materiales contra una OC en estado `EMITIDA` o `PARCIALMENTE_RECIBIDA`. La recepción captura: fecha de recepción (default hoy), notas opcionales, y una lista de líneas con `orden_item_id`, `cantidad_recibida`, y opcionalmente `nota_discrepancia`.

#### Scenario: Recepción total exitosa
- **WHEN** procurement envía `POST /api/v1/compras/ordenes/:id/recepciones` con todas las líneas de la OC con `cantidad_recibida >= cantidad_pedida`
- **THEN** el sistema crea la recepción, actualiza el estado de la OC a `RECIBIDA`, y responde 201 con el registro creado

#### Scenario: Recepción parcial
- **WHEN** procurement envía `POST /api/v1/compras/ordenes/:id/recepciones` con al menos una línea con `cantidad_recibida < cantidad_pedida` o sin incluir todas las líneas
- **THEN** el sistema crea la recepción, actualiza el estado de la OC a `PARCIALMENTE_RECIBIDA`, y responde 201

#### Scenario: OC en estado no receptable
- **WHEN** se intenta registrar una recepción en una OC en estado `BORRADOR`, `PENDIENTE`, `APROBADA`, `RECIBIDA`, o `CANCELADA`
- **THEN** el sistema responde 400 con mensaje `"Solo se pueden registrar recepciones en OC con estado EMITIDA o PARCIALMENTE_RECIBIDA"`

#### Scenario: Cantidad recibida supera la pedida
- **WHEN** se envía `cantidad_recibida` mayor que la `cantidad` del `OrdenCompraItem`
- **THEN** el sistema responde 400 con mensaje `"La cantidad recibida no puede superar la cantidad pedida en la línea <id_item>"`

#### Scenario: Discrepancia registrada
- **WHEN** se envía una línea con `nota_discrepancia` no vacía
- **THEN** el sistema guarda la nota junto con la línea de recepción y la incluye en la respuesta

---

### Requirement: Listar recepciones de una OC
El sistema SHALL exponer `GET /api/v1/compras/ordenes/:id/recepciones` que retorne todas las recepciones registradas para esa OC, incluyendo sus líneas con cantidades recibidas y notas.

#### Scenario: OC con recepciones registradas
- **WHEN** se consulta `GET /api/v1/compras/ordenes/:id/recepciones`
- **THEN** el sistema responde 200 con array de recepciones ordenadas por `fecha_recepcion` descendente, cada una con sus `items` (orden_item_id, cantidad_recibida, nota_discrepancia)

#### Scenario: OC sin recepciones
- **WHEN** se consulta una OC que no tiene recepciones
- **THEN** el sistema responde 200 con `data: []`

---

### Requirement: Resumen de acumulados por línea en la OC
El endpoint `GET /api/v1/compras/ordenes/:id` SHALL incluir en cada item de la OC el campo `cantidad_acumulada_recibida` (suma de todas las recepciones para esa línea) y el campo `porcentaje_recibido` (0–100).

#### Scenario: Línea parcialmente recibida
- **WHEN** se consulta una OC con recepciones parciales
- **THEN** cada item de la OC incluye `cantidad_acumulada_recibida` y `porcentaje_recibido` calculados en tiempo real

#### Scenario: Línea sin recepciones
- **WHEN** ninguna recepción cubre una línea de la OC
- **THEN** esa línea muestra `cantidad_acumulada_recibida: 0` y `porcentaje_recibido: 0`

---

### Requirement: Control de acceso a recepciones
Solo los roles `procurement` y `admin` SHALL poder crear recepciones. Los roles `superintendent`, `gerencia_tecnica`, y `finance` SHALL poder consultar recepciones (solo lectura).

#### Scenario: Rol sin permiso intenta crear recepción
- **WHEN** un usuario con rol `resident` o `finance` llama `POST /recepciones`
- **THEN** el sistema responde 403

#### Scenario: Rol con permiso de lectura consulta recepciones
- **WHEN** un usuario con rol `superintendent` llama `GET /recepciones`
- **THEN** el sistema responde 200 con los datos
