## Context

El flujo vive completo dentro del microservicio `compras` (3002) a nivel de
datos — `Requisicion`, `RequisicionItem`, `CuadroComparativo`,
`ComparativaLinea`, `SolicitudCotizacion` y `SolicitudCotizacionProveedor`
están en el mismo `apps/compras/prisma/schema.prisma`, sin cruce de base de
datos entre microservicios. El frontend (`app-shell`) es el que reparte la
experiencia en 3 vistas (`ResidenciaView.tsx`, `ComprasView.tsx`,
`ComparativaDetail.tsx`). Esto simplifica el diseño: la mayoría de los
cambios son de frontend + ajustes puntuales de qué escribe/lee cada endpoint
existente de `compras`, no una reestructuración de datos entre servicios.

Hallazgo clave que reduce el riesgo de este change: `ComparativaLinea` ya
tiene una columna `detalle_req_id` (FK lógica, nullable, hacia
`RequisicionItem`) — ver `schema.prisma:384`. Los cuadros creados a partir de
ahora pueden usarla para leer la especificación en vivo desde
`RequisicionItem` en lugar de depender solo de la copia
(`marca_modelo_ref`/`especificaciones_requeridas`). Cuadros viejos sin
`detalle_req_id` (creados antes de esta capability) siguen usando la copia
como fallback.

## Goals / Non-Goals

**Goals:**
- Una sola superficie de edición por dato: especificación técnica, ficha
  técnica y notas para proveedores tienen un único lugar de captura/edición.
- Selección de proveedores unificada entre invitación y alta en el Cuadro
  Comparativo, sin perder trazabilidad de quién fue invitado formalmente.
- Reducir clics en el tramo Requisición-aprobada → Invitación-enviada para
  roles que ya tienen permiso de hacer ambas cosas.
- Cero migración de base de datos requerida.

**Non-Goals:**
- No se toca la máquina de estados del Cuadro Comparativo
  (`BORRADOR → ... → CERRADO`) ni el loop de revisión con `?` — spec futuro
  aparte.
- No se cambia el modelo de roles/permisos de aprobación.
- No se construye un portal de proveedor ni se automatiza la captura de
  cotizaciones más allá de lo ya existente (PDF + IA).
- No se elimina la columna `marca_modelo_ref`/`especificaciones_requeridas`
  de `ComparativaLinea` en este change (se deja de escribir, no se borra el
  campo — soporte a cuadros legacy).

## Decisions

**1. Especificación técnica: lectura en vivo vía `detalle_req_id`, no copia.**
Al crear un `ComparativaLinea`, se sigue guardando `detalle_req_id` pero se
deja de copiar `marca_modelo_ref`/`especificaciones_requeridas`. El endpoint
`GET` que arma el Cuadro Comparativo para el frontend resuelve esos dos
campos por join a `RequisicionItem` cuando `detalle_req_id` no es null; si es
null (cuadro legacy o línea imprevisto sin ítem de origen), usa el valor
copiado como está hoy. La edición desde `ComparativaDetail.tsx` se retira
cuando hay `detalle_req_id`; se mantiene solo para el caso legacy/imprevisto.
- *Alternativa descartada:* sync bidireccional (Compras edita en el cuadro y
  el cambio se escribe de vuelta a `RequisicionItem`). Se rechaza por
  ambigüedad de dueño del dato (el Residente es quien certifica qué pidió) y
  por abrir una vía de condición de carrera si el Residente edita la
  Requisición al mismo tiempo.

**2. Ficha técnica: un solo control de carga, en Nueva Requisición.**
El endpoint `POST /api/v1/gerencia-tecnica/insumos/:insumoId/fichas` no
cambia (es compartido con Gerencia Técnica). Se retira el botón de subida en
`ComparativaDetail.tsx`; esa pantalla pasa a listar/descargar solamente.
- *Alternativa descartada:* dejar ambos botones con una advertencia visual.
  No resuelve la confusión de "quién debe subir", solo la maquilla.

**3. Selección de proveedores unificada.**
Se extrae un componente `ProveedorPicker` (y su hook de datos de catálogo)
usado tanto en el panel de invitación (`ComprasView.tsx`) como en el alta de
proveedores del Cuadro Comparativo (`ComparativaDetail.tsx`). Se elimina el
tope fijo de 3 proveedores en el cuadro. Un proveedor presente en el cuadro
sin fila correspondiente en `SolicitudCotizacionProveedor` para esa
requisición se marca en la UI como "agregado sin invitación" (bandera
calculada en el join, no columna nueva).
- *Alternativa descartada:* bloquear altas directas y exigir invitación
  previa siempre. Se rechaza porque hay casos reales de cotización por
  contacto directo/telefónico sin invitación formal (urgencias) que hoy el
  sistema soporta y no se quiere romper.

**4. Aprobar + invitar en una sola acción de UI (sin endpoint nuevo).**
Para `procurement`/`admin` (los únicos roles con permiso de aprobar), el
botón único encadena en el frontend la llamada existente
`PATCH .../aprobar` y, solo si la respuesta confirma `estado: 'APROBADA'`,
abre directamente el panel de invitación ya pre-cargado. Si la aprobación
resulta en `PENDIENTE_TRANSFERENCIA` (gate presupuestal), se corta ahí y se
muestra el mensaje existente sin abrir el panel.
- *Alternativa descartada:* endpoint backend combinado
  `aprobar-e-invitar`. Mayor riesgo/superficie de cambio en `compras` para un
  beneficio que se logra igual encadenando en el cliente.

**5. Notas para proveedores: fetch fresco, no snapshot de estado viejo.**
El panel de invitación, al abrirse, siempre lee el valor vigente de
`Requisicion.observaciones` (ya se hace `GET` al abrir; el cambio es no
cachear ese valor en un estado que sobreviva a una edición posterior del
Residente sin refrescar). No requiere cambio de contrato de API.

## Risks / Trade-offs

- [Cuadros BORRADOR viejos sin `detalle_req_id`] → Mitigación: fallback a
  columna copiada existente; edición directa se mantiene habilitada solo en
  ese caso.
- [Compras detecta error de especificación cuando la Requisición ya no es
  editable] → Mitigación: permitir edición de `RequisicionItem` mientras la
  Requisición esté en `PENDIENTE` o `APROBADA` (no solo antes de aprobar);
  corrección post-`COMPRADA` queda fuera de alcance de este change.
- [Picker unificado duplica fetch de catálogo entre las dos pantallas] →
  Mitigación: un solo hook `useProveedoresCatalogo` compartido, no solo el
  componente visual.
- [Encadenar aprobar+invitar dispara la 2ª llamada aunque la 1ª haya fallado
  parcialmente] → Mitigación: el frontend solo abre el panel de invitación
  si la respuesta de `aprobar` trae `estado === 'APROBADA'` explícito.

## Migration Plan

- Sin migración de base de datos: `detalle_req_id` ya existe;
  `marca_modelo_ref`/`especificaciones_requeridas` se dejan de escribir pero
  no se eliminan.
- Orden de deploy: (1) backend `compras` — dejar de copiar spec al crear
  cuadro, exponer resolución en vivo en el `GET`; (2) frontend — retirar
  ediciones/cargas duplicadas, picker unificado, acción combinada
  aprobar+invitar, notas en vivo.
- Compatible hacia atrás durante el ciclo de deploy: si el backend se
  despliega antes que el frontend, el frontend viejo sigue funcionando
  porque el `GET` todavía devuelve los mismos nombres de campo (solo cambia
  su origen de dato).
- Rollback: revertir frontend es suficiente para restaurar el comportamiento
  visible; revertir backend implica volver a escribir la copia al crear el
  cuadro (cambio acotado a una función).

## Open Questions

- ¿Compras debe poder agregar proveedor sin invitación en cualquier momento,
  o solo cuando la Solicitud de Cotización ya venció su plazo (`dias_habiles`)?
  Definir la regla exacta al escribir specs/tasks.
- Corrección de especificación técnica cuando la Requisición ya está
  `COMPRADA`: ¿queda deliberadamente sin mecanismo en este change, o se
  necesita un camino de excepción (ej. solo `admin`)?
