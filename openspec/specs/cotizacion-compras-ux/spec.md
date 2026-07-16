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
El sistema SHALL prepoblar la lista de proveedores del cuadro comparativo de una
requisición, con los proveedores que ya fueron invitados en la Solicitud de Cotización de
esa misma requisición, sin requerir que Compras los vuelva a capturar manualmente. Esto
SHALL aplicar tanto al crear el cuadro por primera vez ("Iniciar comparativa") como al
reabrir un cuadro ya creado previamente ("Continuar comparativa"), incluyendo después de
recargar la página o de haber abandonado y vuelto a entrar en otra sesión. El prepoblado
SHALL conservar cualquier proveedor que ya tenga precios capturados en el cuadro (incluyendo
proveedores agregados manualmente del catálogo general que no estén en la Solicitud de
Cotización), sin descartarlos al fusionar con los invitados. Compras SHALL poder seguir
agregando proveedores adicionales del catálogo general para casos no cubiertos por la
invitación original, respetando el tope máximo de proveedores por cuadro.

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

#### Scenario: Compras reabre un cuadro ya creado ("Continuar comparativa") en una sesión nueva
- **WHEN** Compras hace clic en "Continuar comparativa" sobre una requisición cuyo cuadro ya
  fue creado anteriormente (en esta sesión o en una sesión previa, incluyendo tras recargar
  la página) y cuya Solicitud de Cotización tiene proveedores invitados
- **THEN** el cuadro se abre mostrando los proveedores invitados en la Solicitud de
  Cotización, sin que Compras tenga que volver a buscarlos y agregarlos manualmente desde el
  catálogo general

#### Scenario: Cuadro reabierto que ya tiene precios capturados para algunos proveedores
- **WHEN** Compras reabre un cuadro que ya tiene precios capturados (`ComparativaDetalle`)
  para 1 proveedor, y la Solicitud de Cotización de la misma requisición tiene 2 proveedores
  invitados adicionales sin precios capturados aún
- **THEN** el cuadro muestra los 3 proveedores: el que ya tiene precios capturados (sin
  perder su información) más los 2 invitados adicionales

#### Scenario: Falla la consulta de la Solicitud de Cotización al reabrir el cuadro
- **WHEN** Compras reabre un cuadro comparativo y la consulta a la Solicitud de Cotización
  de esa requisición falla (error de red o del servidor)
- **THEN** el cuadro se abre igualmente con los proveedores que ya tenía (los que cuentan
  con precios capturados), sin bloquear a Compras para seguir trabajando el cuadro

### Requirement: El PDF de cotización SHALL subirse y persistirse únicamente desde el cuadro comparativo
El cuadro comparativo (`ComparativaDetail`) SHALL ser el único lugar donde Compras
sube el PDF de cotización de un proveedor. Al aplicar una cotización extraída por
IA (botón "Aplicar cotización" sobre los renglones revisados), el sistema SHALL
persistir el archivo PDF original asociado a ese proveedor dentro del cuadro
comparativo, para que quede disponible como respaldo/auditoría independientemente
de futuras ediciones de precios.

El emparejamiento entre cada renglón extraído del PDF y la línea del cuadro correspondiente
SHALL basarse en el solapamiento de palabras significativas entre ambas descripciones
(tokenizado, normalizado sin acentos/mayúsculas), no en una comparación literal de prefijo.
El sistema SHALL informar explícitamente al usuario, tras aplicar la cotización, cuántas
líneas del cuadro no lograron emparejarse automáticamente con ningún renglón del PDF, en vez
de mostrar siempre el mismo mensaje de éxito genérico.

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

#### Scenario: El renglón del PDF describe el ítem con palabras en distinto orden o redacción
- **WHEN** Compras aplica una cotización cuyo renglón extraído describe el ítem con las
  mismas palabras significativas que la línea del cuadro, pero en distinto orden o con
  redacción propia del proveedor (ej. línea "Mini Split Inverter de 1 Tonelada (12,000 BTU)
  a 220V" vs renglón del PDF "Minisplit Inverter 1 Ton 220V")
- **THEN** el sistema empareja correctamente el renglón con la línea por solapamiento de
  palabras significativas y aplica su precio, aunque las cadenas no compartan un prefijo
  literal

#### Scenario: Ninguna línea del cuadro logra emparejarse con los renglones del PDF
- **WHEN** Compras aplica una cotización cuyos renglones extraídos no comparten ninguna
  palabra significativa con ninguna línea del cuadro
- **THEN** el sistema no aplica ningún precio, persiste igualmente el PDF como respaldo, y
  muestra una advertencia indicando que ninguna línea pudo emparejarse automáticamente y que
  deben capturarse los precios manualmente — no un mensaje de éxito genérico

#### Scenario: Solo algunas líneas del cuadro logran emparejarse con los renglones del PDF
- **WHEN** Compras aplica una cotización donde, de varias líneas del cuadro, solo algunas
  encuentran un renglón del PDF con al menos una palabra significativa en común
- **THEN** el sistema aplica el precio a las líneas que sí emparejaron, persiste el PDF como
  respaldo, y muestra una advertencia indicando cuántas líneas (de cuántas en total) no se
  pudieron relacionar automáticamente y deben capturarse manualmente

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
sin remover compatibilidad existente. Esto SHALL aplicar por igual a
cuadros cuyas líneas provienen de un insumo de catálogo y a cuadros cuyas
líneas son de texto libre (imprevisto, sin catálogo).

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

#### Scenario: Usuario con rol `admin` abre el panel de evaluación técnica
- **WHEN** un usuario con rol `admin` (sin `residencia` ni `superintendent`)
  abre un cuadro comparativo en estado `EN_EVALUACION_TECNICA`, en un
  cuadro con líneas de catálogo o de texto libre
- **THEN** ve el botón "Registrar Evaluación Técnica →" y, al hacer clic,
  el panel muestra los controles C/NC/DA/? para cada renglón, igual que
  para un usuario con rol `residencia`

### Requirement: La descripción de una línea de texto libre SHALL conservarse al releer el cuadro desde el backend
El sistema SHALL mostrar la descripción real del ítem de requisición (capturada como texto
libre por el Residente) en `insumo_descripcion` de una línea del Cuadro Comparativo sin
`insumo_id` de catálogo, tanto al crear el cuadro como al releerlo desde el backend
(recarga de página, bandeja de pendientes de evaluación técnica, bandeja de aprobación GT).

#### Scenario: Recargar la página tras crear un cuadro con líneas de texto libre
- **WHEN** Compras crea un cuadro con una línea de texto libre (sin `insumo_id`) y luego
  recarga la página o vuelve a abrir el cuadro en otra sesión
- **THEN** la línea sigue mostrando la descripción real capturada en la requisición, no un
  guion (`—`)

#### Scenario: El Residente ve la línea de texto libre en su bandeja de evaluación técnica
- **WHEN** el Residente abre, desde la pestaña "Eval. Técnica", un cuadro con una línea de
  texto libre enviado a evaluación
- **THEN** ve la descripción real del ítem, no un guion (`—`)

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
capturadas, directamente en "TABLA DE COTIZACIONES" — sin abrir un panel modal separado —
y SHALL persistir la evaluación de todos los proveedores al guardar, no solo la del
primero. El botón "🔒 Firmar y Bloquear →" SHALL permanecer deshabilitado mientras exista
al menos un proveedor de algún renglón sin evaluar.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** el Residente abre "TABLA DE COTIZACIONES" y ve un renglón sin especificaciones
  cotizado por 3 proveedores
- **THEN** ve, sin ningún clic adicional, una fila justo debajo del renglón con 3 bloques
  de evaluación independientes (uno por proveedor, alineado bajo la columna de ese
  proveedor), cada uno con sus propios controles C/NC/DA/? y comentario — sin salir de la
  tabla ni abrir un modal

#### Scenario: Guardar una línea sin "?" persiste los 3 proveedores de esa línea
- **WHEN** el Residente evalúa los 3 proveedores de un renglón con decisiones C/NC/DA
  (ninguna "?") y hace clic en "Guardar" de esa sub-fila
- **THEN** los 3 `ComparativaDetalle` de ese renglón quedan con su `evaluacion_tecnica`
  correspondiente, sin afectar la evaluación de otros renglones no guardados aún

#### Scenario: Una decisión "?" en cualquier línea requiere el guardado agregado de "?"
- **WHEN** el Residente marca "?" en al menos un proveedor de cualquier renglón
- **THEN** esa línea no ofrece guardado individual — aparece un botón agregado a nivel de
  tabla ("Guardar y Crear Revisión") que, al presionarlo, envía en una sola llamada todas
  las evaluaciones pendientes (incluyendo los "?" con su pregunta) y crea una única
  revisión nueva del cuadro

#### Scenario: Firmar exige evaluar a todos los proveedores, no solo uno por renglón
- **WHEN** el Residente evaluó solo 1 de 3 proveedores de un renglón y falta el resto
- **THEN** el botón "🔒 Firmar y Bloquear →" no está habilitado, aunque el renglón
  muestre alguna evaluación

#### Scenario: Proveedor sin precio capturado en un renglón no requiere evaluación
- **WHEN** un renglón tiene 3 proveedores en el cuadro pero solo 2 capturaron precio para
  ese renglón específico
- **THEN** la sub-fila solo pide evaluar a los 2 proveedores que sí cotizaron ese renglón


### Requirement: La evaluación económica de Gerencia Técnica SHALL registrarse C/NC/DA/? por proveedor, con costo, días de suministro y condiciones de crédito visibles
El sistema SHALL permitir a Gerencia Técnica (roles `gerencia_tecnica`, `superintendent`,
`admin`) registrar una decisión C/NC/DA/? independiente para cada proveedor de cada
renglón de un cuadro en `EN_APROBACION_GT`, mostrando el costo cotizado, los días de
suministro estimados y las condiciones de crédito (si el proveedor otorga crédito y a
cuántos días) de cada proveedor en el momento de evaluar — directamente en "TABLA DE
COTIZACIONES", sin un panel modal separado. GT SHALL persistir la evaluación de todos los
proveedores, no solo la del primero agrupado.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** Gerencia Técnica revisa un renglón cotizado por 3 proveedores en un cuadro
  `EN_APROBACION_GT`
- **THEN** ve, por cada proveedor, su costo cotizado, sus días de suministro estimados,
  sus condiciones de crédito y controles C/NC/DA/? independientes

#### Scenario: Proveedor sin crédito frente a proveedor con crédito
- **WHEN** Gerencia Técnica compara dos proveedores del mismo renglón, uno con
  `ofrece_credito = true` y `dias_credito = 30`, y otro con `ofrece_credito = false`
- **THEN** ve claramente "Crédito 30 días" para el primero y "Sin crédito" para el
  segundo, sin necesidad de consultar el catálogo de Proveedores por separado

#### Scenario: GT no puede aprobar un proveedor que el Residente rechazó técnicamente
- **WHEN** Gerencia Técnica intenta marcar `C` en un proveedor cuya `evaluacion_tecnica`
  es `NC`
- **THEN** el sistema rechaza la evaluación con un mensaje explicando que ese proveedor
  fue rechazado en la evaluación técnica

#### Scenario: Guardar evaluaciones de GT no finaliza el cuadro
- **WHEN** Gerencia Técnica guarda evaluaciones C/NC/DA de algunos proveedores mediante
  `PATCH /comparativas/:id/evaluar-gt`
- **THEN** el cuadro permanece en `EN_APROBACION_GT`, sin transicionar a
  `APROBADO_GT`/`RECHAZADO_GT`, hasta que se ejecute la finalización explícita

#### Scenario: Finalizar exige evaluar a todos los proveedores de todos los renglones
- **WHEN** Gerencia Técnica intenta finalizar (`PATCH /comparativas/:id/revisar-gt`) con
  al menos un proveedor de algún renglón en `PENDIENTE` o `?`
- **THEN** el sistema rechaza la finalización con un mensaje indicando qué falta evaluar

### Requirement: Un "?" de Gerencia Técnica SHALL crear una nueva revisión que hereda la evaluación técnica ya aprobada
El sistema SHALL crear una nueva revisión del cuadro cuando Gerencia Técnica marca `?` en
cualquier proveedor de cualquier renglón y redacta una pregunta (mismo mecanismo de
incremento de letra A→B→C... ya usado para las preguntas del Residente). Esa nueva
revisión SHALL conservar la `evaluacion_tecnica`/`comentario_tecnico` del cuadro original
sin reiniciarlos, y SHALL iniciar directamente en estado `EN_APROBACION_GT` — no en
`BORRADOR` — de modo que no se le exige al Residente evaluar de nuevo lo técnico.

#### Scenario: Pregunta de GT sobre un proveedor
- **WHEN** Gerencia Técnica marca `?` en un proveedor con la pregunta "¿Puede sostener
  este precio con entrega en 15 días?" y guarda
- **THEN** se crea la revisión siguiente del cuadro (ej. si la evaluación técnica quedó en
  revisión B, la nueva es C), heredando la evaluación técnica de la revisión anterior tal
  cual, y el cuadro nuevo queda en `EN_APROBACION_GT`

#### Scenario: Compras responde la pregunta de GT
- **WHEN** Compras abre la revisión creada por la pregunta de GT y responde
- **THEN** la respuesta queda visible para Gerencia Técnica al retomar la evaluación
  económica de esa línea/proveedor, sin que el Residente participe de nuevo

#### Scenario: La evaluación técnica no se pierde al crear la revisión de GT
- **WHEN** se crea una revisión nueva por una pregunta de GT
- **THEN** los renglones de la revisión nueva muestran la misma `evaluacion_tecnica` y
  `comentario_tecnico` que tenían en la revisión anterior — no aparecen como `PENDIENTE`


### Requirement: El botón para crear/continuar el Cuadro Comparativo SHALL reflejar el estado real de la Solicitud de Cotización sin depender de una acción previa en la sesión
El sistema SHALL cargar el estado de la Solicitud de Cotización de cada requisición
`APROBADA` al mostrar la lista de requisiciones, sin requerir que el usuario abra
previamente el panel "Ver Solicitud de Cotización" en la sesión actual. El botón "Crear
Cuadro Comparativo" (o "Continuar comparativa") SHALL estar visible siempre que exista al
menos un proveedor con estado `RESPONDIO`, independientemente de si la página se acaba de
cargar, recargar, o si el usuario recién volvió a la vista.

#### Scenario: Recargar la página tras proveedores respondidos
- **WHEN** Compras marca proveedores como `RESPONDIO` en la Solicitud de Cotización de una
  requisición, sale de la vista o recarga la página, y vuelve a la tarjeta de esa
  requisición
- **THEN** el botón "Crear Cuadro Comparativo" está visible sin que Compras tenga que abrir
  de nuevo el panel "Ver Solicitud de Cotización"

#### Scenario: Requisición sin Solicitud de Cotización enviada
- **WHEN** Compras ve la tarjeta de una requisición `APROBADA` que nunca tuvo una Solicitud
  de Cotización enviada
- **THEN** el botón "Crear Cuadro Comparativo" no aparece (comportamiento actual sin
  cambios), y no se generan errores por la precarga

#### Scenario: Solicitud de Cotización sin ningún proveedor respondido aún
- **WHEN** Compras ve la tarjeta de una requisición `APROBADA` con Solicitud de Cotización
  enviada pero ningún proveedor ha respondido todavía
- **THEN** el botón "Crear Cuadro Comparativo" no aparece, igual que el comportamiento actual


### Requirement: La creación del Cuadro Comparativo SHALL tolerar el rango completo de longitud de marca/modelo de la requisición
El sistema SHALL crear el Cuadro Comparativo correctamente para cualquier ítem cuya
`especificacion_marca_modelo` use el rango completo permitido en la requisición (hasta 200
caracteres), sin fallar por límite de longitud de columna. Si la creación del cuadro falla
por cualquier motivo, el sistema SHALL informar el error explícitamente a Compras y NO SHALL
abrir una vista de cuadro comparativo que no fue persistido en el backend.

#### Scenario: Ítem con marca/modelo de más de 100 caracteres
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem tiene
  `especificacion_marca_modelo` de entre 101 y 200 caracteres
- **THEN** el cuadro se crea correctamente, con esa marca/modelo completa (sin truncar)
  visible en el panel de "Detalles técnicos"

#### Scenario: Falla la creación del cuadro por cualquier motivo
- **WHEN** Compras hace clic en "Crear Cuadro Comparativo" y la llamada al backend falla
- **THEN** el sistema muestra un mensaje de error explícito y Compras permanece en la lista
  de requisiciones — no se abre ningún cuadro comparativo local no persistido


### Requirement: El Cuadro Comparativo SHALL prepoblarse con la marca/modelo y especificación técnica de la requisición
Al crear el Cuadro Comparativo, cada línea SHALL prepoblarse con la marca/modelo y la
especificación técnica que el Residente capturó en el ítem correspondiente de la
requisición (`especificacion_marca_modelo` / `especificacion_detalle`), sin requerir que
Compras las vuelva a capturar manualmente. Si el ítem ya tiene especificaciones
estructuradas registradas por el mecanismo de evaluación técnica por especificación, esas
SHALL tener prioridad sobre el texto libre de la requisición para el campo de
especificaciones. Compras SHALL poder seguir editando ambos campos manualmente después de
la creación del cuadro, sin cambios en ese flujo existente.

#### Scenario: Requisición con marca/modelo y especificación en texto libre
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem tiene
  `especificacion_marca_modelo` y `especificacion_detalle` capturados, y no tiene
  especificaciones estructuradas registradas
- **THEN** la línea del cuadro se crea con esa marca/modelo y esa especificación ya
  visibles en el panel de "Detalles técnicos", sin que Compras tenga que escribirlas de nuevo

#### Scenario: Requisición con especificaciones estructuradas ya registradas
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem sí tiene
  especificaciones estructuradas registradas (mecanismo de evaluación técnica por
  especificación)
- **THEN** el campo de especificaciones de la línea se puebla con esas especificaciones
  estructuradas, no con el texto libre de la requisición

#### Scenario: Requisición sin marca/modelo ni especificación capturados
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem no tiene
  `especificacion_marca_modelo` ni `especificacion_detalle` capturados
- **THEN** la línea del cuadro se crea con ambos campos vacíos, igual que el comportamiento
  actual, y Compras los captura manualmente si lo necesita


### Requirement: El Cuadro Comparativo SHALL registrar la fecha de entrega estimada por partida y proveedor
Al capturar los precios de una cotización en el Cuadro Comparativo,
Compras SHALL poder registrar una fecha de entrega estimada estructurada
(no texto libre) para cada combinación de partida (línea/insumo) y
proveedor. El sistema SHALL persistir esta fecha junto con el precio
ofertado de esa misma línea.

#### Scenario: Compras registra la fecha de entrega al capturar un precio
- **WHEN** Compras ingresa un precio para un proveedor en una línea del
  Cuadro Comparativo y también captura una fecha de entrega estimada para
  esa misma línea
- **THEN** al guardar la cotización, la fecha queda asociada a esa
  combinación específica de partida y proveedor

#### Scenario: Fecha de entrega ausente no bloquea guardar la cotización
- **WHEN** Compras guarda una cotización con precios capturados pero sin
  fecha de entrega estimada en alguna línea
- **THEN** el sistema guarda el precio de todas formas — la fecha de
  entrega es opcional, no bloquea el flujo

#### Scenario: La fecha de entrega se conserva al crear una nueva revisión
- **WHEN** se crea una nueva revisión de un cuadro comparativo
  (`nueva-revision` o `revision-con-preguntas`)
- **THEN** la fecha de entrega estimada capturada en el cuadro original se
  copia a la línea correspondiente del cuadro de la nueva revisión


### Requirement: Los ítems de requisición sin insumo de catálogo SHALL poder cotizarse en el Cuadro Comparativo
El sistema SHALL crear una línea en el Cuadro Comparativo para todo ítem de requisición,
incluyendo los capturados como texto libre (imprevisto, sin `insumo_id` de catálogo) —
identificada por el ítem de requisición de origen en vez de por un insumo de catálogo, sin
requerir crear ningún registro nuevo en el catálogo de insumos. Compras SHALL poder
capturar el precio de esa línea por proveedor (manualmente o vía aplicación de PDF), y ese
precio SHALL persistir de la misma forma que para líneas con insumo de catálogo. El panel
de marca/modelo y especificaciones técnicas SHALL funcionar igual para estas líneas.

#### Scenario: Crear el cuadro con un ítem de texto libre
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem no tiene
  `insumo_id` (capturado como texto libre)
- **THEN** el cuadro se crea con una línea para ese ítem, identificada por el ítem de
  requisición de origen

#### Scenario: Capturar precio manualmente en una línea de texto libre
- **WHEN** Compras captura manualmente el precio de un proveedor para una línea sin
  `insumo_id` y guarda las cotizaciones
- **THEN** el precio persiste correctamente y es visible al recargar el cuadro, igual que
  para una línea con insumo de catálogo

#### Scenario: Aplicar un PDF de cotización sobre una línea de texto libre
- **WHEN** Compras sube y aplica un PDF de cotización cuyo renglón emparejado corresponde a
  una línea sin `insumo_id`
- **THEN** el precio extraído se persiste para esa línea, igual que para una línea con
  insumo de catálogo

#### Scenario: Editar marca/especificaciones de una línea de texto libre
- **WHEN** Compras edita la marca/modelo o la especificación técnica de una línea sin
  `insumo_id` desde el panel de "Detalles técnicos"
- **THEN** los cambios se guardan y persisten correctamente

#### Scenario: Líneas con insumo de catálogo no cambian de comportamiento
- **WHEN** Compras trabaja con un cuadro cuyos ítems todos tienen `insumo_id` de catálogo
- **THEN** el comportamiento de creación, captura de precios y edición de detalles técnicos
  es idéntico al actual, sin regresión


### Requirement: El proveedor ganador SHALL determinarse automáticamente al aprobar GT, sin selección manual

Cuando un Cuadro Comparativo transiciona a `APROBADO_GT`, el sistema SHALL marcar
automáticamente `es_ganador = true` en el renglón del proveedor correspondiente para cada
línea, sin requerir que Compras seleccione manualmente un ganador en la tabla de precios.

#### Scenario: Primera opción aprobada económicamente
- **WHEN** el Gerente Técnico aprueba el cuadro y el proveedor de `primera_opcion_proveedor_id`
  tiene `aprobacion_gt` en C, DA o APROBADO para un renglón
- **THEN** ese renglón queda con `es_ganador = true` para ese proveedor, sin intervención
  manual

#### Scenario: Primera opción rechazada económicamente, segunda opción aprobada
- **WHEN** el proveedor de `primera_opcion_proveedor_id` no está aprobado económicamente
  para un renglón pero el de `segunda_opcion_proveedor_id` sí
- **THEN** ese renglón queda con `es_ganador = true` para el proveedor de la segunda
  opción

#### Scenario: Sin primera ni segunda opción aplicable — desempate por precio
- **WHEN** ni la primera ni la segunda opción tienen `aprobacion_gt` aprobado para un
  renglón específico, pero hay al menos un proveedor aprobado
- **THEN** ese renglón queda con `es_ganador = true` para el proveedor aprobado con menor
  `precio_ofertado`

### Requirement: Los renglones de requisición de texto libre (imprevisto) SHALL poder generar Orden de Compra

`convertir-oc` SHALL incluir renglones sin `insumo_id` de catálogo (identificados por
`detalle_req_id`, vinculados a una partida real vía el flujo de imprevistos del
Residente) al generar Órdenes de Compra, con la misma cobertura de suficiencia
financiera y partida presupuestal que los renglones de catálogo.

#### Scenario: Cuadro con renglón de texto libre aprobado por GT
- **WHEN** Compras convierte a OC un cuadro `APROBADO_GT` que incluye un renglón de
  texto libre (imprevisto) con proveedor ganador determinado
- **THEN** se genera la Orden de Compra correspondiente con la cantidad real de la
  requisición y la descripción/unidad capturadas por el Residente

#### Scenario: PDF de la OC muestra la descripción del ítem de texto libre
- **WHEN** se genera el PDF de una Orden de Compra que incluye un ítem de texto libre
- **THEN** el PDF muestra la descripción y unidad capturadas, no "Insumo no encontrado en
  catálogo"

### Requirement: Agregar un proveedor o una línea manualmente SHALL preservar el estado del cuadro

Agregar un proveedor desde el catálogo o una línea/ítem manualmente al
Cuadro Comparativo, mientras está en `BORRADOR`, SHALL preservar
`estado: 'BORRADOR'` en la actualización local — NO SHALL introducir un
estado distinto que el backend no reconozca.

#### Scenario: Agregar proveedor no bloquea "Enviar a Evaluación Técnica"
- **WHEN** Compras agrega un proveedor desde el catálogo a un cuadro en
  `BORRADOR`
- **THEN** el cuadro permanece en `estado: 'BORRADOR'` y el botón "Enviar
  a Evaluación Técnica →" sigue disponible

#### Scenario: Agregar una línea manualmente no bloquea "Enviar a Evaluación Técnica"
- **WHEN** Compras agrega una línea/ítem manualmente a un cuadro en
  `BORRADOR`
- **THEN** el cuadro permanece en `estado: 'BORRADOR'` y el botón "Enviar
  a Evaluación Técnica →" sigue disponible
