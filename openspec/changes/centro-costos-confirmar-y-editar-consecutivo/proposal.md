## Why

Al dar de alta un Centro de Costos normal, el formulario de `AdminView` (`ProyectoModal`) muestra una "vista previa" incompleta: `HCO2018004···`. Los últimos 3 dígitos (el consecutivo) los calcula el servidor **en el momento de guardar** (`apps/auth/src/main.ts`, `POST /api/v1/auth/admin/proyectos`), así que el usuario:

1. **No ve el código final** hasta después de haberlo creado.
2. **No puede aceptarlo ni modificarlo** antes de guardar. Si el consecutivo asignado no era el que esperaba (por ejemplo, quería respetar una numeración de contratos ya existente en papel), la única salida es editar o archivar el proyecto después.

El código del Centro de Costos es el identificador que aparece en selectores, reportes y en los eventos hacia los demás módulos (`auth.centro_costos_creado`), y `codigo_centro_costos` es inmutable tras crear (el modal de edición lo muestra deshabilitado). Equivocarse en el alta es costoso; la corrección debe ocurrir **antes** de guardar.

Además, el cálculo actual del consecutivo (`conteo de existentes + 1`) no tolera consecutivos con huecos: en cuanto se permita elegir manualmente uno (por ejemplo `005` con solo 2 existentes), el siguiente automático (`003`, `004`, …) terminaría chocando con él.

## What Changes

**Backend (`apps/auth`):**
- Nuevo endpoint `GET /api/v1/auth/admin/proyectos/siguiente-consecutivo?empresa_grupo=&anio_centro_costos=&cliente_id=&codigo_cliente=` que devuelve `{ consecutivo, codigo_centro_costos }`: el código completo de 13 posiciones que se asignaría hoy. Mismos roles que el alta (`ROLES_ALTA_CENTRO_COSTOS`). No reserva ni escribe nada.
- `POST /api/v1/auth/admin/proyectos` acepta un `consecutivo_centro_costos` opcional (entero 1–999). Si viene, **se usa exactamente ese valor**, sin reintentos automáticos; si el código resultante ya existe responde `409 ADMIN_CODIGO_DUPLICADO` e incluye el `consecutivo_sugerido` vigente. Si no viene, se conserva el comportamiento automático actual (clientes de la API que no lo envían no se rompen).
- El siguiente consecutivo pasa a calcularse como **máximo existente + 1** (no conteo + 1) para el mismo `(tenant, empresa, año, cliente)`, de modo que no colisione con consecutivos manuales con huecos. Si el máximo ya es 999, responde `409 ADMIN_CONSECUTIVO_AGOTADO`.
- Validación de `consecutivo_centro_costos` en el schema Zod y en la política pura (`centro-costos-policy.ts`).

**Frontend (`apps/app-shell`, `ProyectoModal`):**
- En el alta normal, al tener empresa + año + cliente, se consulta el siguiente consecutivo y el bloque "Código" pasa de vista previa incompleta a mostrar **el código completo**, con el consecutivo como campo numérico editable de 3 dígitos (`EMPRESA·AÑO·CLIENTE·[003]`), prellenado con el sugerido.
- Al pulsar **Guardar** aparece un paso de confirmación con el código final y dos acciones: **"Aceptar y guardar"** y **"Modificar"** (vuelve al formulario con el foco en el consecutivo). Nada se envía al backend hasta aceptar.
- El frontend siempre envía el `consecutivo_centro_costos` confirmado: lo que el usuario ve y acepta es exactamente lo que se guarda.
- Si el servidor responde `409 ADMIN_CODIGO_DUPLICADO` (alguien más tomó ese consecutivo entre la vista previa y el guardado), se muestra el aviso, se actualiza el consecutivo sugerido y se **vuelve a pedir confirmación**; no se guarda nada en silencio con otro valor.
- Los Centros de Costos **especiales** (código libre) y la **edición** no cambian.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `centro-costos-alta`: el código se muestra completo y con consecutivo editable antes de guardar, con paso de confirmación (hoy: "de solo lectura"); el consecutivo automático pasa de `conteo + 1` a `máximo + 1` y puede ser indicado explícitamente por el usuario con validación de unicidad y rango.

## Impact

- **Modificado:** `apps/auth/src/main.ts` (nuevo GET y ajuste del POST), `apps/auth/src/centro-costos-policy.ts`, `apps/auth/src/validation/schemas/admin-proyectos.schema.ts`, `apps/app-shell/src/views/AdminView.tsx` (`ProyectoModal`), `apps/app-shell/src/lib/` (llamada al nuevo endpoint), ayuda contextual `apps/app-shell/src/help/content/admin.ts`.
- **Tests a ampliar:** `apps/auth/test/integration/centro-costos-alta.integration.test.ts` y `validacion-zod-admin-proyectos.integration.test.ts`; nuevo test unitario de la política; nuevo test de `AdminView` para el flujo de confirmación.
- **Contrato de API:** aditivo (campo opcional en POST y endpoint nuevo). El algoritmo `max+1` puede dar un consecutivo distinto al de `conteo+1` únicamente cuando ya existen huecos; en datos sin huecos el resultado es idéntico.
- **Eventos:** `auth.centro_costos_creado` no cambia de forma; sigue llevando `consecutivo_centro_costos`.
- **Sin cambios** en base de datos: `consecutivo_centro_costos` y el único `(tenant_id, codigo_centro_costos)` ya existen.
- **Fuera de alcance:** editar el código de un Centro de Costos ya creado; permitir cambiar empresa/año/cliente tras crear; el código libre de los especiales; reservar consecutivos entre la vista previa y el guardado.
