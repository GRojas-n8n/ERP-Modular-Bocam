## Why

Hoy el "Centro de Costos" ya existe como `Proyecto` en `apps/auth` (comentario
explícito en el schema: `// --- Entidad MDM: Proyecto (Centro de Costos / Sucursal) ---`),
con `codigo_centro_costos` como texto libre (`'CC-2026-GUA-01'`) sin ninguna
validación estructural. Esto permite códigos inconsistentes entre proyectos,
no captura de qué empresa del grupo ni de qué cliente proviene un contrato, y
el alta de un proyecto está limitada a un único rol (`admin`), aunque en la
práctica Gerencia Técnica y Control de Proyectos también necesitan darlos de
alta. Tampoco se capturan hoy las fechas contractuales ni el monto vendido,
por lo que no hay línea base para reportes financieros o de plazos.

## What Changes

- El campo `codigo_centro_costos` de `Proyecto` pasa a construirse (no
  capturarse a mano) a partir de 4 componentes estructurados y nuevos:
  `empresa_grupo` (enum `CIB`/`HCO`/`HSE`/`SEO`), `anio_centro_costos` (4
  dígitos, editable, default = año en curso), `cliente_id` (referencia lógica
  UUID al catálogo de `Cliente` de Ventas — sin FK cross-servicio) y
  `consecutivo_centro_costos` (3 dígitos, autogenerado por backend contando
  los centros de costos existentes con el mismo año + cliente).
- **BREAKING** (solo hacia adelante): los proyectos nuevos exigen estos 4
  campos y el código resultante debe tener exactamente 13 caracteres, salvo
  que se marque como Centro de Costos Especial (`OFICINA`, `TALLER`,
  `ALMACÉN`), caso en el que el código queda libre. Los proyectos ya
  existentes con código libre (`CC-2026-GUA-01`, etc.) **no se migran ni se
  bloquean** — quedan como registros legacy de solo lectura para ese campo.
- Se agrega `codigo_cliente` (3 dígitos, `000`-`050`) al modelo `Cliente` de
  `apps/ventas`, con los 51 clientes reales provistos por el usuario
  disponibles para seed (no se siembran automáticamente en producción; queda
  como tarea explícita).
- Se amplía `Proyecto` con los campos financieros y de plazos del punto 6:
  `fecha_inicio_real`, `fecha_firma_contrato`, `fecha_programada_inicio`,
  `fecha_programada_fin` (fechas), `monto_total_vendido` (decimal, sin IVA),
  `periodo_ejecucion` + `periodo_ejecucion_unidad` (`MESES`/`SEMANAS`),
  `total_dias_naturales`, `total_dias_laborables` (enteros). El frontend
  valida que `fecha_programada_fin >= fecha_programada_inicio` antes de
  guardar.
- El vocabulario de `estatus` cambia de
  `LICITACION | ADJUDICADO | CONSTRUCCION | CIERRE_TECNICO | CIERRE_FINANCIERO`
  a `ABIERTO | EN EJECUCIÓN | EN COBRO | TERMINADO | CERRADO`, con una
  migración de datos que mapea los valores existentes al nuevo vocabulario
  (ver design.md, Decisión 5).
- El endpoint `POST /api/v1/auth/admin/proyectos` (y su `PATCH`) deja de
  requerir exclusivamente `admin` — ahora acepta también `gerencia_tecnica` y
  `control_proyectos`. Cualquier otro rol recibe 403.
- El frontend (`AdminView.tsx`) reemplaza el input de texto libre del código
  por un flujo guiado: dropdown de empresa, año (prellenado, editable),
  dropdown de cliente (con "+ Agregar Cliente" para altas in-context sin
  perder el progreso del formulario), consecutivo mostrado como
  solo-lectura, y una vista previa del código ensamblado de 13 posiciones.
  Compras adicionales del formulario para los campos de fechas/montos del
  punto 6, con validación cruzada de fechas.

## Capabilities

### New Capabilities
- `centro-costos-alta`: reglas de construcción del código de 13 posiciones,
  campos financieros/de plazos, RBAC de creación, y la integración con el
  catálogo de clientes de Ventas.

### Modified Capabilities
(ninguna — no existe spec previo para `Proyecto`/Centro de Costos)

## Impact

- **Backend `apps/auth`**: `prisma/schema.prisma` (nuevos campos en
  `Proyecto`, migración de `estatus`), `src/main.ts` (RBAC del endpoint,
  algoritmo de consecutivo, validaciones), nueva función pura testeada para
  el ensamblado/validación del código de 13 posiciones (mismo patrón que
  `solicitud-cotizacion-policy.ts` en `apps/compras`).
- **Backend `apps/ventas`**: `prisma/schema.prisma` (`codigo_cliente` en
  `Cliente`), endpoint para exponer/crear clientes desde el modal in-context,
  seed opcional de los 51 clientes reales.
- **Frontend `apps/app-shell`**: `src/views/AdminView.tsx` (formulario guiado,
  modal "+ Agregar Cliente", vista previa del código, validación cruzada de
  fechas), posible ajuste de guard de ruta para que `gerencia_tecnica` y
  `control_proyectos` alcancen la pantalla de alta sin exponerles el resto de
  `AdminView` (gestión de usuarios, tenants).
- **Fuera de alcance de este change** (se cubre en un change posterior,
  dependiente de este): la publicación del evento
  `administracion.centro_costos_creado` en RabbitMQ y su consumo por los 9
  módulos (punto 3 del roadmap del usuario).
