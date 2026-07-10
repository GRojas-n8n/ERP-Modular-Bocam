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

