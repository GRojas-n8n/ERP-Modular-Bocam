# Proposal: fix-proveedores-ids-solicitud-cotizacion

## Problema

Al enviar una solicitud de cotización a proveedores desde ComprasView, el sistema retorna 400 con el mensaje `"proveedores_ids debe ser un array no vacío"` aunque el usuario haya seleccionado proveedores.

Adicionalmente, al subir el PDF de respuesta de un proveedor, el archivo no se procesa porque el campo FormData no coincide con lo que espera multer en el backend.

## Causa raíz

Dos desajustes entre frontend y backend introducidos en el commit `57bf30c`:

| # | Ubicación | Frontend envía | Backend espera |
|---|---|---|---|
| 1 | `POST /solicitud-cotizacion` body | `proveedores` | `proveedores_ids` |
| 2 | `PUT /solicitud-cotizacion/proveedores/:id` FormData | `pdf` | `archivo` |

## Fix

Dos cambios de una línea cada uno en `apps/app-shell/src/views/ComprasView.tsx`:
- Línea 989: `proveedores` → `proveedores_ids`
- Línea 1002: `fd.append('pdf', ...)` → `fd.append('archivo', ...)`

## Alcance

Solo frontend (`app-shell`). El backend es correcto.
