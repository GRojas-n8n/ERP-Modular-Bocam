## Why

Gerencia Técnica y Control de Proyectos necesitan poder rastrear, para cada
partida del presupuesto, qué órdenes de compra (u otros movimientos) la
afectaron — con monto, tipo, fecha y quién lo generó. Hoy esa trazabilidad
no existe de forma confiable: el audit trail real que respalda el gate de
bloqueo de partidas (`SaldoMovimiento` en GT, `MovimientoPresupuestal` en
Finanzas) no se expone en ningún endpoint ni vista, y Control de Proyectos
no tiene ningún acceso a datos de presupuesto por partida hoy. La única
"Trazabilidad" visible en el frontend hoy corre sobre un sistema paralelo
(`CompraProyectada`) desacoplado del gate real, por lo que no sirve como
fuente confiable de auditoría.

## What Changes

- Nuevo endpoint `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos`
  que expone el `SaldoMovimiento` existente (ya se escribe hoy en
  comprometer/ejercer/anular-bloqueo, solo faltaba el GET).
- Nuevo filtro `?concepto_id=` en `GET /api/v1/finanzas/movimientos` (o
  resolución documentada vía el `presupuesto_id` ya obtenible con
  `GET /presupuestos/por-concepto/:conceptoId`) para poder listar los
  movimientos de Finanzas de una partida sin conocer su `presupuesto_id`
  interno.
- Nuevo drill-down (fila expandible) en la tabla de "Control Presupuestal"
  existente en el módulo Gerencia Técnica (`InsumosView.tsx`), que al
  expandir una partida muestra su lista de movimientos (GT + Finanzas).
- Nueva pestaña "Presupuesto por Partida" en el módulo Control de Obra
  (`ControlObraView.tsx`, rol `control_proyectos`), que hoy no tiene ningún
  acceso a este tipo de dato — mismo componente de tabla + drill-down que
  Gerencia Técnica, en modo solo lectura.
- **Alcance explícito**: solo visibilidad/auditoría. No se modifica el gate
  de bloqueo de partidas ni se agrega ningún flujo de aprobación nuevo. El
  sistema de "Trazabilidad" existente (`CompraProyectada`,
  `/trazabilidad/resumen`, `/trazabilidad/triangulo`) no se toca ni se
  fusiona en este change — sigue existiendo tal cual, como un sistema
  distinto y ya documentado en la capacidad `trazabilidad-triangulo`.

## Capabilities

### New Capabilities
- `movimientos-partida-endpoint`: endpoints backend (GT + Finanzas) que
  exponen el audit trail real de movimientos por partida.
- `trazabilidad-partida-frontend`: drill-down de movimientos en la tabla de
  Control Presupuestal de GT, y nueva pestaña equivalente de solo lectura
  para Control de Proyectos.

### Modified Capabilities
(ninguna — el drill-down es aditivo sobre `frontend-control-presupuestal`
y no cambia ningún requirement ni scenario existente de esa capacidad)

## Impact

- `apps/gerencia-tecnica/src/main.ts`: nuevo endpoint GET.
- `apps/finanzas/src/main.ts`: nuevo filtro/parametro en endpoint existente.
- `apps/app-shell/src/views/InsumosView.tsx`: drill-down en tabla existente.
- `apps/app-shell/src/views/ControlObraView.tsx`: nueva pestaña.
- `apps/app-shell/src/components/Layout.tsx`: nuevo subItem de navegación
  para el rol `control_proyectos`.
- Ningún cambio de esquema de base de datos (los modelos `SaldoMovimiento`
  y `MovimientoPresupuestal` ya existen con todos los campos necesarios).
