# Spec: aprobacion-requisicion

## Comportamiento esperado

### Endpoint: PATCH /api/v1/compras/requisiciones/:id/aprobar

**Roles autorizados:** `procurement`, `admin`, `superintendent`

**Precondición:** La requisición existe y pertenece al tenant+proyecto del JWT.

| Estado actual | Resultado | HTTP |
|---|---|---|
| `PENDIENTE` | Actualiza a `APROBADA`, retorna la requisición completa con items | `200` |
| `BORRADOR` | Actualiza a `APROBADA`, retorna la requisición completa con items | `200` |
| `APROBADA` | Retorna la requisición sin modificar (idempotente) | `200` |
| `COMPRADA`, `CANCELADA`, `RECHAZADA` | Retorna error indicando estado actual | `400` |
| No existe | Retorna `{ success: false, message: 'Requisición no encontrada.' }` | `404` |
| Rol no autorizado | Manejado por `requireRoles` | `403` |

**Evento publicado (best-effort):**
```
event_type: 'compras.requisicion_aprobada'
payload: { id_requisicion, codigo, proyecto_id }
```
Si el EventBus no está disponible, la transición de estado se persiste de todas formas.

### Flujo en ComprasView (frontend)

1. El usuario con rol `procurement`/`admin`/`superintendent` ve el botón "Aprobar Requisición" en tarjetas con estado `PENDIENTE` o `BORRADOR`.
2. Al hacer clic, el botón cambia a "Aprobando…" y se deshabilita.
3. Si la llamada es exitosa: la tarjeta actualiza su estado a `APROBADA` y aparece el botón "Iniciar comparativa".
4. Si la llamada falla: se muestra un toast de error con el mensaje del backend.
5. En modo demo: la aprobación se simula localmente sin llamada al backend.

### Invariante de negocio

Una requisición en estado `APROBADA` es la única que puede convertirse en cuadro comparativo. El botón "Iniciar comparativa" en `ComprasView` está condicionado a `req.estado === 'APROBADA'`.
