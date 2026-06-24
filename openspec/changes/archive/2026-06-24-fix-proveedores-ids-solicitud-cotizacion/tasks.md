## Fix: proveedores_ids y archivo en solicitud-cotizacion

- [x] 1.1 En `ComprasView.tsx` línea 989: cambiar `proveedores:` a `proveedores_ids:` en el body del POST
- [x] 1.2 En `ComprasView.tsx` línea 1002: cambiar `fd.append('pdf', file)` a `fd.append('archivo', file)` en el FormData del PUT
- [x] 1.3 Deploy app-shell en VPS y verificar que enviar solicitud de cotización funciona E2E
- [x] 1.4 Verificar que subir PDF de respuesta de proveedor funciona E2E
