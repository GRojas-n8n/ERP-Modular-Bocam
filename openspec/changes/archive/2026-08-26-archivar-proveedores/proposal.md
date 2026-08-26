## Why

El catálogo de Proveedores (`apps/compras`, model `Proveedor`) no tiene ninguna forma de retirar un registro de circulación: solo existen `POST /proveedores` (alta), `PUT /proveedores/:id` (edición completa) y `GET /proveedores` (listado). Un proveedor que ya no se quiere seguir invitando a cotizar (dado de baja, vetado por desempeño, duplicado) sigue apareciendo en los selectores de "Nueva Requisición" / "Cuadro Comparativo" indefinidamente, sin manera de ocultarlo — la única opción hoy es dejarlo como está o editar `estatus` a `VETADO`, que no lo saca de los selectores. Esto es el primero de una serie de módulos (personal/empleados, auth/usuarios) que necesitan la misma capacidad de ciclo de vida; este change establece el patrón a replicar.

## What Changes

- Nuevo estado `ARCHIVADO` para el campo `estatus` de `Proveedor` (hoy `ACTIVO | VETADO | PENDIENTE`).
- Nuevo endpoint `POST /api/v1/compras/proveedores/:id/archivar` — pone `estatus = 'ARCHIVADO'`. Acción reversible, no borra ninguna fila ni toca `ordenes`, `comparativas`, `documentos`, `calificaciones`, `solicitudes_cotizacion` ni `evaluaciones_especificacion` existentes del proveedor.
- Nuevo endpoint `POST /api/v1/compras/proveedores/:id/activar` — revierte: `estatus` vuelve a `ACTIVO`.
- `GET /api/v1/compras/proveedores` y cualquier selector usado en flujos de alta (Solicitud de Cotización, Cuadro Comparativo) deben excluir por default los proveedores con `estatus = 'ARCHIVADO'`; el listado de administración del catálogo sí debe poder mostrarlos (con filtro) para poder activarlos de vuelta.
- **Sin borrado físico.** Este change NO incluye un `DELETE` real de la fila — decisión explícita para la primera iteración, dado que `documentos`/`calificaciones` tienen `onDelete: Cascade` y `ordenes`/`comparativas`/`solicitudes_cotizacion` no, lo que exigiría validar referencias activas en 3 tablas transaccionales antes de permitirlo. Queda fuera de alcance; se evalúa en un change futuro si surge la necesidad real.
- **BREAKING (menor):** ningún contrato de API existente cambia de forma incompatible — `estatus` ya era un `String` libre documentado por comentario, no un enum de Prisma, así que agregar un valor no rompe consumidores existentes. Se marca aquí solo porque el frontend (selectores) debe empezar a filtrar por este nuevo valor o mostrará proveedores archivados como si fueran activos.

## Capabilities

### New Capabilities
- `archivo-proveedores`: ciclo de vida reversible (archivar/activar) del catálogo de Proveedores en `compras`, sin afectar el histórico transaccional que ya los referencia.

### Modified Capabilities
(ninguna — no existe spec previo de gestión del catálogo de Proveedores; los specs existentes como `carga-masiva-proveedores`, `seleccion-proveedores-unificada`, etc. cubren procesos que consumen proveedores, no su ciclo de vida)

## Impact

- **Backend:** `apps/compras/src/main.ts` (2 endpoints nuevos + filtro en `GET /proveedores` y en cualquier query interna que arme la lista de selectores). `apps/compras/prisma/schema.prisma` no requiere migración de columna (reutiliza `estatus` existente), solo documentar el nuevo valor válido.
- **Frontend:** `apps/app-shell` — vista/selector de Proveedores en Compras: botón "Archivar"/"Activar" en vez de cualquier "Eliminar", y los selectores de proveedores en Solicitud de Cotización / Cuadro Comparativo deben dejar de listar `ARCHIVADO`.
- **Sin impacto** en otros microservicios ni en el event bus — es estado interno de `compras`, no se proyecta a otros servicios.
- **Establece el patrón** (nombre de acción "Archivar/Activar", endpoint `POST /:id/archivar` + `POST /:id/activar`, exclusión por default en selectores) a replicar después en `personal` (empleados) y `auth` (usuarios) en changes separados.
