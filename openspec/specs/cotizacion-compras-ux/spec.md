# cotizacion-compras-ux Specification

## Purpose

El ciclo de cotización tiene 4 estados visibles en la tarjeta de requisición en ComprasView. Procurement sabe siempre en qué paso está y qué acción le toca.

### Estados del ciclo (tarjeta de req)

```
PENDIENTE → APROBADA → [COTIZANDO] → [EN EVALUACIÓN] → [PENDIENTE GT] → AUTORIZADA → OC
```

| Estado req | Estado comparativo | Label en tarjeta | Acción disponible (Procurement) |
|---|---|---|---|
| `PENDIENTE` / `BORRADOR` | sin comparativo | 🟡 "Pendiente de aprobación" | **Aprobar Requisición** |
| `APROBADA` | sin comparativo | 🔵 "Lista para cotizar" | **Iniciar comparativa** |
| `APROBADA` | `BORRADOR` | 🔵 "Cotizando proveedores" | **Continuar comparativa** |
| `APROBADA` | `ENVIADO_EVALUACION` | 🟠 "En evaluación técnica" | Ver detalle (solo lectura hasta que el Residente responda) |
| `APROBADA` | `EVALUADO` | 🟣 "Evaluado — pendiente GT" | Ver detalle + **Enviar a GT** |
| `APROBADA` | `AUTORIZADA` | 🟢 "Autorizado" | **Ver OC generadas** |

### Flujo completo de cotización (Procurement)

#### Paso 1 — Aprobar la requisición
- Tarjeta en estado `PENDIENTE` → botón "Aprobar Requisición" (emerald)
- `PATCH /api/v1/compras/requisiciones/:id/aprobar`
- La tarjeta cambia a "Lista para cotizar"

#### Paso 2 — Iniciar / continuar la comparativa
- Botón "Iniciar comparativa" → abre `ComparativaDetail`
- En ComparativaDetail, Procurement:
  1. Agrega proveedores (nombre, contacto)
  2. Captura precios por proveedor y por ítem
  3. Puede guardar como borrador y retomar después
- Cuando todos los ítems tienen al menos un precio: aparece botón **"Enviar a Evaluación Técnica →"**

#### Paso 3 — Enviar a Residente para evaluación técnica
- Botón "Enviar a Evaluación Técnica" (amber, prominente)
- `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion`
- El comparativo pasa a `ENVIADO_EVALUACION`
- La tarjeta muestra "🟠 En evaluación técnica"
- **El Residente ve el comparativo en su tab "Eval. Técnica" en ComprasView**

#### Paso 4 — Residente evalúa (en su sesión)
- El Residente entra a ComprasView → tab "Eval. Técnica"
- Ve el comparativo con todos los proveedores y precios
- Marca su recomendación técnica por ítem (cuál proveedor recomienda)
- Agrega comentarios técnicos
- Botón "Enviar Evaluación a GT" → `PATCH /comparativas/:id/evaluar`
- El comparativo pasa a `EVALUADO`

#### Paso 5 — GT aprueba (en su sesión)
- El GT entra a ComprasView → tab "Aprob. GT"
- Ve el comparativo con la evaluación técnica del Residente resaltada
- Puede aprobar o rechazar con comentarios
- Botón "Autorizar Comparativa" → `PATCH /comparativas/:id/autorizar`
- El comparativo pasa a `AUTORIZADA`
- Se genera automáticamente la OC

### Cambios específicos en ComparativaDetail

#### Stepper visual (header del componente)

```
[1. Cotizando] → [2. En Evaluación] → [3. Aprobación GT] → [4. OC Emitida]
```

- Paso activo resaltado en color
- Pasos completados con ✓
- El stepper indica siempre en qué etapa está el usuario

#### Botón contextual por paso

| Paso | Condición | Botón |
|---|---|---|
| 1 | `estado = BORRADOR` y todos los ítems tienen precio | "Enviar a Evaluación Técnica →" (amber) |
| 2 | `estado = ENVIADO_EVALUACION`, rol = residente | "Registrar Evaluación Técnica →" (violet) |
| 3 | `estado = EVALUADO`, rol = gerencia_tecnica | "Autorizar Comparativa →" (emerald) |
| 4 | `estado = AUTORIZADA` | "Ver Orden de Compra →" (sky) |

### Routing del cuadro comparativo por rol

| Rol | Acceso | Acción disponible |
|---|---|---|
| `procurement` | ComprasView → tab Requisiciones → ComparativaDetail | Captura precios, envía a evaluación |
| `residencia` | ComprasView → tab **Eval. Técnica** | Ve comparativo, registra preferencia técnica |
| `gerencia_tecnica` | ComprasView → tab **Aprob. GT** | Ve comparativo + evaluación, autoriza o rechaza |
| `superintendent` | ComprasView → ambas bandejas | Solo lectura + aprobación final (mismo que GT) |

### Estado del tab "Eval. Técnica" (Residente)

El tab muestra una lista de comparativos en estado `ENVIADO_EVALUACION` asignados al proyecto del Residente.
Cada tarjeta muestra:
- Folio de la requisición
- Lista de proveedores cotizados (nombre + precio total)
- Botón "Evaluar" → abre ComparativaDetail en modo evaluación

### Estado del tab "Aprob. GT" (GT)

El tab muestra comparativos en estado `EVALUADO`.
Cada tarjeta muestra:
- Folio y descripción de la req
- Resumen: proveedor recomendado por el Residente
- Monto total del proveedor recomendado
- Botón "Revisar y Autorizar" → abre ComparativaDetail en modo aprobación
## Requirements
### Requirement: El cuadro comparativo SHALL prepoblarse con los proveedores ya invitados
El sistema SHALL prepoblar la lista de proveedores, al crear o abrir por primera vez el cuadro comparativo de una requisición (botón "Iniciar comparativa"), con los proveedores que ya fueron invitados en la Solicitud de Cotización de esa misma requisición, sin requerir que Compras los vuelva a capturar manualmente. Compras SHALL poder seguir agregando proveedores adicionales del catálogo general para casos no cubiertos por la invitación original.

#### Scenario: Requisición con Solicitud de Cotización ya enviada a 3 proveedores
- **WHEN** Compras hace clic en "Iniciar comparativa" en una requisición cuya
  Solicitud de Cotización ya fue enviada a 3 proveedores
- **THEN** el cuadro comparativo se crea con esos 3 proveedores ya listados,
  listos para capturar o aplicar precios, sin que Compras tenga que agregarlos de
  nuevo

#### Scenario: Requisición sin Solicitud de Cotización previa
- **WHEN** Compras hace clic en "Iniciar comparativa" en una requisición que nunca
  tuvo una Solicitud de Cotización enviada
- **THEN** el cuadro comparativo se crea sin proveedores prepoblados, igual que el
  comportamiento actual, y Compras los agrega manualmente desde el catálogo

### Requirement: El PDF de cotización SHALL subirse y persistirse únicamente desde el cuadro comparativo
El cuadro comparativo (`ComparativaDetail`) SHALL ser el único lugar donde Compras
sube el PDF de cotización de un proveedor. Al aplicar una cotización extraída por
IA (botón "Aplicar cotización" sobre los renglones revisados), el sistema SHALL
persistir el archivo PDF original asociado a ese proveedor dentro del cuadro
comparativo, para que quede disponible como respaldo/auditoría independientemente
de futuras ediciones de precios.

#### Scenario: Compras sube el PDF de un proveedor y aplica la cotización extraída
- **WHEN** Compras sube el PDF de un proveedor, revisa los renglones extraídos por
  la IA y confirma "Aplicar cotización"
- **THEN** el sistema guarda los precios aplicados en el cuadro comparativo Y
  persiste el archivo PDF original asociado a ese proveedor, recuperable
  posteriormente

#### Scenario: Compras sube un PDF pero no aplica la cotización
- **WHEN** Compras sube un PDF, revisa los renglones extraídos, pero cierra el
  panel de revisión sin pulsar "Aplicar cotización"
- **THEN** el sistema NO persiste ningún archivo — solo se guardan los PDF que el
  usuario confirma aplicar

#### Scenario: Servicio de extracción por IA no disponible
- **WHEN** Compras sube un PDF y el servicio de extracción por IA responde con
  error (p. ej. no disponible)
- **THEN** el sistema permite a Compras capturar los precios manualmente y, al
  aplicar, persiste igualmente el PDF original como respaldo de la cotización

### Requirement: El rol `residencia` SHALL poder registrar la evaluación técnica y firmar el cuadro comparativo
El sistema SHALL reconocer el rol real `residencia` (el único rol asignable
a un Residente de Obra desde el catálogo de roles de administración) para
mostrar y habilitar, en `ComparativaDetail` sobre un cuadro comparativo en
estado `EN_EVALUACION_TECNICA`:
- el botón "Registrar Evaluación Técnica →"
- la sección "Veredicto del Residente" (veredicto técnico + selección de
  proveedor recomendado / 2ª opción), independientemente de si el
  componente se abrió en modo `residente`, `compras` o `gt`
- el botón "🔒 Firmar y Bloquear →" una vez que el veredicto y la selección
  de proveedor están completos y todos los renglones fueron evaluados

Estas mismas acciones SHALL seguir disponibles para el rol `admin` y para
los sinónimos legacy de rol ya soportados (`resident`, `control_obra`),
sin remover compatibilidad existente.

#### Scenario: Residente con rol `residencia` abre su cuadro pendiente de evaluación
- **WHEN** un usuario cuyo único rol es `residencia` abre, desde la pestaña
  "Eval. Técnica" de `ComprasView`, un cuadro comparativo en estado
  `EN_EVALUACION_TECNICA` (el componente se renderiza con `modo="residente"`)
- **THEN** el usuario ve el botón "Registrar Evaluación Técnica →" y, tras
  evaluar todos los renglones, la sección "Veredicto del Residente" con los
  campos para llenar el veredicto técnico y seleccionar el proveedor
  recomendado

#### Scenario: Residente completa veredicto y selección de proveedor
- **WHEN** un usuario con rol `residencia`, en modo `residente`, llena el
  veredicto técnico, selecciona una 1ª opción de proveedor y evalúa todos
  los renglones del cuadro
- **THEN** el botón "🔒 Firmar y Bloquear →" se habilita y, al hacer clic,
  el cuadro pasa a estado `FIRMADO_BLOQUEADO`

#### Scenario: Rol sin permiso no ve las acciones de evaluación
- **WHEN** un usuario cuyo rol no incluye `residencia`, `resident`,
  `control_obra`, `admin`, ni `superintendent` abre el mismo cuadro
- **THEN** no ve el botón "Registrar Evaluación Técnica →" ni la sección
  "Veredicto del Residente" ni el botón de firma

### Requirement: El Cuadro Comparativo SHALL mostrar el estado de respuesta de cada proveedor invitado
El sistema SHALL mostrar, en el chip de cada proveedor dentro de
`ComparativaDetail`, un indicador visual de su estado de respuesta a la
Solicitud de Cotización (`RESPONDIO`, `DECLINO` o `PENDIENTE`), cuando ese
proveedor fue invitado a través de una Solicitud de Cotización de la misma
requisición. El sistema SHALL obtener este estado desde el registro
`SolicitudCotizacionProveedor` correspondiente sin requerir que Compras
navegue al panel de Solicitud de Cotización para consultarlo.

Este indicador es de solo lectura dentro del Cuadro Comparativo — el
cambio de estado (marcar "Respondió"/"Declinó") SHALL seguir haciéndose
únicamente desde el panel de Solicitud de Cotización, sin duplicar esa
acción aquí. La subida del PDF de cotización SHALL seguir ocurriendo
únicamente dentro del Cuadro Comparativo, sin cambios.

#### Scenario: Proveedor invitado que ya respondió
- **WHEN** Compras abre el Cuadro Comparativo de una requisición donde un
  proveedor invitado ya fue marcado como `RESPONDIO` en Solicitud de
  Cotización
- **THEN** el chip de ese proveedor muestra un badge verde "Respondió"

#### Scenario: Proveedor invitado que declinó
- **WHEN** un proveedor invitado fue marcado como `DECLINO` en Solicitud de
  Cotización
- **THEN** su chip en el Cuadro Comparativo muestra un badge rojo
  "Declinó"

#### Scenario: Proveedor invitado sin respuesta todavía
- **WHEN** un proveedor invitado sigue en estado `PENDIENTE` en Solicitud
  de Cotización
- **THEN** su chip en el Cuadro Comparativo muestra un badge gris
  "Pendiente"

#### Scenario: Proveedor agregado manualmente, sin invitación previa
- **WHEN** Compras agrega al Cuadro Comparativo un proveedor del catálogo
  general que nunca fue invitado vía Solicitud de Cotización para esa
  requisición
- **THEN** su chip no muestra ningún badge de estado de respuesta (no se
  asume "Pendiente" para proveedores sin invitación)

### Requirement: La evaluación técnica del panel simple SHALL registrarse por proveedor, no por renglón agregado
El sistema SHALL permitir al Residente (o `admin`) registrar una decisión C/NC/DA/?
independiente para cada proveedor de cada renglón sin especificaciones estructuradas
capturadas, y SHALL persistir la evaluación de todos los proveedores al guardar — no solo
la del primero. El botón "🔒 Firmar y Bloquear →" SHALL permanecer deshabilitado mientras
exista al menos un proveedor de algún renglón sin evaluar.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** el Residente abre el panel "Registrar Evaluación Técnica →" de un renglón
  cotizado por 3 proveedores
- **THEN** ve 3 bloques de evaluación independientes (uno por proveedor), cada uno con sus
  propios controles C/NC/DA/? y comentario

#### Scenario: Guardar la evaluación persiste los 3 proveedores
- **WHEN** el Residente evalúa los 3 proveedores de un renglón con decisiones distintas y
  guarda
- **THEN** los 3 `ComparativaDetalle` de ese renglón (uno por proveedor) quedan con su
  `evaluacion_tecnica` correspondiente — ninguno queda en `PENDIENTE`

#### Scenario: Firmar exige evaluar a todos los proveedores, no solo uno por renglón
- **WHEN** el Residente evaluó solo 1 de 3 proveedores de un renglón y falta el resto
- **THEN** el botón "🔒 Firmar y Bloquear →" no está habilitado, aunque el renglón
  muestre alguna evaluación

#### Scenario: Proveedor sin precio capturado en un renglón no requiere evaluación
- **WHEN** un renglón tiene 3 proveedores en el cuadro pero solo 2 capturaron precio para
  ese renglón específico
- **THEN** el panel solo pide evaluar a los 2 proveedores que sí cotizaron ese renglón

