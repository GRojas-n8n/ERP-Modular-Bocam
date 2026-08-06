## Context

`apps/control-proyectos` implementa parcialmente el EVM que ya describe `openspec/specs/control-proyectos-modulo/spec.md`: existe el schema completo (`ProgramacionObra.cpi/spi/eac/bac`, `ProyeccionCierre` con pv/ev/ac/cpi/spi/cv/sv/eac/etc/vac) y los endpoints `GET /evm` y `GET /dashboard` ya leen `ProyeccionCierre`. Pero:

- `recalcularEVMPorAvanceValidado` (`src/main.ts:443-488`) hace `const ac = acAcumulado ?? ev` (línea 461) y su único llamador, en `PATCH /avances/:id/validar` (línea ~751-758), pasa `Number(updated.importe_acumulado)` — el avance físico valorizado — tanto para `evAcumulado` como para `acAcumulado`. AC nunca es un costo real; siempre es idéntico a EV, así que `cpi = ev/ac` da exactamente 1.
- `pv = bac * (pct / 100)` (línea 463) reutiliza el mismo `pct` de avance físico que ya se usó para EV, en vez de leer `ProgramacionObra.curva_programada` (JSONB con puntos `{ semana, pct_acumulado }`) interpolado a la fecha actual. PV y EV terminan siendo prácticamente el mismo número.
- `ProyeccionCierre` nunca se escribe (confirmado por grep en todo el repo) — solo se lee en `GET /dashboard` (línea 1379) y `GET /evm` (línea 1438). Por diseño (`spec.md` regla 3: "las proyecciones son snapshots... calculado y guardado como snapshot diario"), debería alimentarse de un job periódico; ese job (`initJobNocturno`, línea 1853-1870) hoy solo recalcula alertas, no EVM global.

## Goals / Non-Goals

**Goals:**
- CPI y SPI dejan de ser cosméticos: CPI usa un AC compuesto de dinero realmente comprometido y pagado a proveedores por partida; SPI usa un PV interpolado del baseline programado, no una copia del avance físico.
- `GET /evm` y `GET /dashboard` dejan de mostrar el bloque global en `null` — `ProyeccionCierre` se calcula y persiste diariamente.
- El AC por partida distingue comprometido (OC activa, dinero apartado) de ejercido (pago real ya hecho), igual que ya lo hace `finanzas` internamente con `MovimientoPresupuestal.tipo` (`COMPROMISO`/`EJERCIDO`).

**Non-Goals:**
- **No se distribuye el costo de mano de obra (nómina) por partida/concepto.** `PreNominaDetalle` (`apps/personal/prisma/schema.prisma:192-217`) no tiene `concepto_id` ni `frente_trabajo` — no existe hoy ninguna forma de saber a qué partida correspondió el trabajo de un empleado en un período. Intentar inferirlo sería inventar un dato que el negocio no captura. La mano de obra sí se incluye en el AC **global** del proyecto (`ProyeccionCierre.ac`), tomada de `finanzas.pago_registrado` con `referencia_entidad === 'PreNomina'`, pero no en `ProgramacionObra.ac_*` (que es por partida). Atribuir nómina a partidas requeriría agregar `concepto_id` a `PreNominaDetalle` en el módulo `personal` — cambio de otro microservicio, fuera del alcance de este spec (regla de CLAUDE.md: un spec cubre un microservicio).
- No se toca el subscriber de `almacen.salida_obra` / `MaterialConsumidoObra` (usado hoy solo por `GET /conceptos/:id/costo-real`, un endpoint informativo aparte). Es una fuente de costo real de materiales que **no** se integra al AC en este change para no duplicar con `ac_ejercido` de OC (el material comprado vía OC ya se cuenta al pagarse la OC; sumar también `MaterialConsumidoObra` doble-contaría el mismo gasto). Queda como dato informativo independiente, igual que hoy.
- No se cambia el criterio de "trigger" del recálculo (sigue siendo síncrono al validar un avance + el job nocturno para alertas/snapshot). No se agrega recálculo en tiempo real por cada evento de compra/pago — el snapshot de `ProyeccionCierre` es diario por diseño explícito del spec ("Reglas de diseño" #3).

## Decisions

**1. AC por partida = `ac_comprometido + ac_ejercido`, ambos en `ProgramacionObra`, alimentados por eventos que `control-proyectos` ya puede consumir sin tocar otros servicios.**
`compras.oc_creada` (`apps/compras/src/main.ts:3048`) trae `concepto_id` en el payload — se usa para incrementar `ac_comprometido` de esa partida. `compras.oc_cancelada` (líneas 4494 y 4665) **no** trae `concepto_id` (solo `oc_id`, `codigo`, `total`, `presupuesto_id`, y en un caso `requisicion_id`) — se resuelve buscando el `concepto_id` guardado al procesar el `oc_creada` correspondiente.

**2. Nueva tabla `OrdenCompraSeguimiento` (oc_id → concepto_id, tenant_id, proyecto_id, monto_comprometido, monto_ejercido) en vez de intentar derivar `concepto_id` de otra forma en cancelación/pago.**
Alternativa descartada: pedirle a `compras` que agregue `concepto_id` al payload de `oc_cancelada` — se descarta porque `compras` es un microservicio ajeno a este spec (regla "un spec cubre un microservicio"; el bus de eventos es la única excepción permitida, no modificar el publisher). Alternativa descartada: llamar B2B a `compras` para resolver el concepto en el momento de la cancelación/pago — más frágil (dependencia síncrona nueva) que guardar el dato la primera vez que se ve (`oc_creada`), que es cuando sí está disponible.

**3. AC-ejercido viene de `finanzas.pago_registrado` con `referencia_entidad === 'OrdenCompra'`, NO de la rama que este subscriber ya maneja (`referencia_entidad === 'Estimacion'`).**
Son conceptualmente opuestos: el pago de una `Estimacion` es dinero que el **cliente** paga a BOCAM (ingreso/cobro, ya reconciliado por este mismo subscriber desde el change `fix-estimaciones-residente-desconectado`); el pago de una `OrdenCompra` es dinero que **BOCAM** paga a un proveedor (el costo real que pide PMBOK para AC). Confirmado en `apps/finanzas/src/main.ts`: el mismo evento `PAGO_REGISTRADO` se dispara para ambos casos (línea 1396, tras mover `monto_comprometido → monto_ejercido` en `PresupuestoAsignado`), distinguibles solo por `referencia_entidad`/`referencia_id` en el payload — el subscriber ya hace ese `if (referencia_modulo !== 'control-obra' || referencia_entidad !== 'Estimacion') { ignorar }` (línea 98); se agrega una rama hermana para `referencia_entidad === 'OrdenCompra'`.

**4. PV se interpola de `curva_programada` (JSONB `[{semana, pct_acumulado}]`) contra la fecha de corte actual, no contra el % de avance físico.**
Se toma el último punto de la curva con `semana <= hoy` (formato ISO week `"2026-W22"`); si `hoy` es anterior al primer punto, PV = 0; si `curva_programada` está vacío (partida sin programación cargada), PV = `null` y no se calcula SPI para esa partida — consistente con la regla ya documentada del spec ("Sin datos de programación, no hay Curva S ni SPI").

**5. El snapshot diario de `ProyeccionCierre` se agrega a `initJobNocturno` (mismo job que ya recalcula alertas cada 24h), no un cron/proceso separado.**
Ya itera por cada `(tenant_id, proyecto_id)` activo (vía `programacion_obra`) dentro de `createTenantContext`; agregar el cálculo de `ProyeccionCierre` ahí evita un segundo mecanismo de scheduling y reutiliza el mismo contexto tenant/RLS ya resuelto por iteración.

**6. `ac_mano_obra` NO es una columna de `ProgramacionObra`.**
Ver Non-Goals: no hay dato de atribución por partida. El AC global de `ProyeccionCierre` sí suma nómina pagada (`finanzas.pago_registrado` con `referencia_entidad === 'PreNomina'`) además de la suma de `ac_comprometido+ac_ejercido` de todas las partidas — es la única forma honesta de no subestimar el AC total del proyecto sin inventar una distribución por partida que el dato no soporta.

## Risks / Trade-offs

- **[Riesgo] Cambiar `cpi`/`eac` de "siempre ≈1" a un valor real hará que aparezcan alertas `SOBRE_COSTO_PROYECTADO` en proyectos donde antes nunca se disparaban (porque CPI nunca bajaba de 0.9).** → Es el comportamiento correcto y el objetivo del fix, pero es un cambio de UX visible para el Director de Proyectos: pasará de un dashboard "verde" falso a uno que puede mostrar alertas reales de un día para otro en proyectos con sobrecosto ya existente. Mitigación: comunicar el cambio al desplegar, no es un bug del fix sino el fix exponiendo un problema que ya existía sin detectarse.
- **[Riesgo] Órdenes de compra creadas antes de este change no tienen registro en `OrdenCompraSeguimiento`.** → Su `ac_comprometido`/`ac_ejercido` histórico no se recupera retroactivamente (mismo patrón ya aceptado en `fix-estimaciones-residente-desconectado` para `concepto_id` en avances históricos: sin backfill, solo aplica hacia adelante). El AC empieza a ser confiable desde el deploy de este change, no reconstruye el pasado.
- **[Riesgo] Doble conteo si a futuro alguien integra `MaterialConsumidoObra` al AC sin quitar `ac_ejercido` de OC.** → Documentado explícitamente en Non-Goals para que un change futuro no lo introduzca sin decidirlo conscientemente.
- **[Trade-off] El snapshot es diario, no en tiempo real** — el dashboard puede mostrar CPI/SPI de hasta 24h de antigüedad. Aceptado porque ya es la regla de diseño documentada del módulo (spec.md regla 3) y evita recalcular EVM de proyecto completo en cada request.

## Migration Plan

- Migración de schema en `control-proyectos`: agregar `ac_comprometido`/`ac_ejercido` (Decimal, default 0) a `ProgramacionObra`, y modelo nuevo `OrdenCompraSeguimiento`. Columnas aditivas, sin backfill.
- Deploy: un solo servicio (`control-proyectos`) — no requiere coordinar con `compras`/`finanzas`/`personal`, solo empieza a consumir eventos que ya publican.
- Rollback: revertir el commit; migración aditiva, revertible sin pérdida de datos existentes (`ProgramacionObra` conserva sus columnas actuales intactas).

## Open Questions

Ninguna — las dos preguntas de diseño más importantes (de dónde sale AC real, y por qué no se puede atribuir nómina por partida) quedaron resueltas por la investigación de este documento (Decisions 3 y 6).
