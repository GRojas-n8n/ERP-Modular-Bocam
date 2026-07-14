## Why

El ERP está en fase de pruebas en producción con usuarios reales. Compras
necesita poder eliminar Requisiciones, Órdenes de Compra y Proveedores de
prueba para corregir observaciones, ajustar comportamiento y reiniciar
flujos de trabajo, sin depender de intervención manual en la base de datos.

## What Changes

- Nuevo panel de administrador ("Herramientas de Administrador") dentro de
  `ComprasView`, visible **solo** para rol `admin` — protegido a nivel
  servidor (`requireRoles('admin')`), no solo ocultando el botón en el
  frontend.
- Lista con checkboxes de Requisiciones, Órdenes de Compra y Proveedores del
  proyecto activo, con selección específica registro por registro (no
  "borrar todo de la categoría X").
- Modal de confirmación que exige escribir la palabra **ELIMINAR** antes de
  habilitar el botón de borrado definitivo, mostrando el conteo exacto de lo
  seleccionado.
- Borrado "cascada limpia" dentro del propio microservicio: eliminar una
  Requisición se lleva consigo sus renglones, especificaciones técnicas,
  cuadros comparativos, evaluaciones y solicitudes de cotización — pero
  **nunca** borra en silencio una OC ya generada ni deja huérfanos cruzando
  a otro proveedor no seleccionado (ver design.md, reglas de bloqueo).
- Liberación best-effort de fondos comprometidos en Finanzas al purgar una
  OC con presupuesto comprometido (mismo patrón que `cancelar-OC` ya
  existente).
- Auditoría: cada purga queda registrada (quién, qué, cuándo, cuántos
  registros) vía el logging de observabilidad ya usado en todo el módulo.

## Capabilities

### New Capabilities
- `panel-purga-datos-prueba-compras`: borrado selectivo, admin-only, de
  Requisiciones/OC/Proveedores en `apps/compras`, con confirmación explícita
  y manejo seguro de dependencias entre entidades.

### Modified Capabilities
(ninguna)

## Impact

- **Backend (`apps/compras`)**: nuevos endpoints admin-only de resumen y
  borrado por lote.
- **Frontend (`apps/app-shell`)**: nueva sección dentro de `ComprasView.tsx`,
  sin llamar a ningún otro microservicio (respeta "no cross-service en
  frontend" — el borrado de `Clientes` en `apps/ventas` es un change
  aparte, `panel-purga-datos-prueba-ventas`, con su propia sección en
  `VentasView.tsx`).
- **Fuera de alcance explícito** (decisión ya tomada con el usuario):
  `Proyectos` (Centro de Costos, referenciado en 11 de los 12
  microservicios) y `Usuarios` — ambos quedan fuera de este change por su
  radio de impacto; requieren diseño propio y más cuidadoso.
- **Sin cambios de schema** salvo los índices que ya existen — no se agregan
  columnas nuevas.
