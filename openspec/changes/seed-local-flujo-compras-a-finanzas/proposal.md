## Why

Para probar cómo llega una orden de compra a Finanzas (compromiso, factura, pago) hoy hay que recorrer a mano, con varios usuarios, todo el flujo Gerencia Técnica → Residencia → Compras → GT → OC en el entorno local. Un juego de datos reproducible, sembrado por las mismas APIs que usa la aplicación, permite repetir la prueba en minutos y ver solo lo que los eventos reales hacen llegar a Finanzas.

## What Changes

- Nuevo script local `scripts/local/seed-flujo-compras.mjs` que, contra el entorno `iretum-local`:
  - **Bloquea** la ejecución si la API no es `localhost` o si la base no es el contenedor `iretum-local-postgres`.
  - **Limpia** únicamente los datos del tenant local de pruebas (`8e07a7ac-8157-4e5d-8499-e985a9fcdbfc`) en las 11 bases, y luego restaura su usuario administrador local.
  - Crea por API usuarios por rol (Gerencia Técnica, Residencia, Compras, Finanzas), un cliente en Ventas, un centro de costos en Auth, insumos, catálogo de 12 conceptos con APU y explosión en Gerencia Técnica, presupuesto aprobado y 4 proveedores en Compras.
  - Deja 4 requisiciones en estados distintos: **a)** recién creada; **b)** cotizaciones capturadas y cuadro comparativo sin firmar; **c)** cuadro firmado por Residencia y aprobado por GT con compra dividida por partida a 2 proveedores; **d)** OC generada (`convertir-oc`) y enviada (`enviar-correo`) por la API real de Compras.
  - No crea ningún registro en Finanzas: lo que haya allí llega solo por los eventos y llamadas reales del flujo.
- Nuevo servicio **Mailpit** en `docker-compose.local.yml` (SMTP de captura local) y `SMTP_*` locales apuntando a él, para que la invitación a cotizar y el envío de OC se ejecuten de verdad sin que ningún correo salga de la máquina. `verificar-env-local.mjs` acepta `mailpit` como único host SMTP permitido.
- Nuevo comando `seed-compras` en `scripts/local/iretum-local.ps1` y sección en `LOCAL.md` (usuarios, folios, estados, guía de prueba en Finanzas).
- Sin cambios en el código ni en el esquema de ningún microservicio.

## Capabilities

### New Capabilities
- `seed-local-flujo-compras`: juego de datos de prueba reproducible del flujo de compras hasta la OC en el entorno local, sembrado por APIs reales, con guardas de entorno local y limpieza acotada al tenant de pruebas.

### Modified Capabilities
<!-- Ninguna: no cambia el comportamiento de ningún servicio. -->

## Impact

- **Archivos nuevos/modificados:** `scripts/local/seed-flujo-compras.mjs`, `scripts/local/iretum-local.ps1`, `scripts/local/verificar-env-local.mjs`, `docker-compose.local.yml`, `LOCAL.md`.
- **Servicios usados (solo lectura de su código, llamados por API):** auth, ventas, gerencia-tecnica, compras; Finanzas solo se consulta para verificar.
- **Dependencia nueva solo local:** imagen `axllent/mailpit`.
- **Hallazgos que el seed deja visibles y este change NO corrige** (cada uno requiere su propio change):
  - `Proveedor` no tiene campo de tiempo de entrega; solo existe `ComparativaDetalle.fecha_entrega_estimada` por cotización.
  - El evento `compras.oc_creada` no incluye `presupuesto_id` y `handleOrdenCompraCreadaEvent` de Finanzas lo descarta como `invalid_payload`; el compromiso real llega por `gerencia_tecnica.partida_comprometida`.
  - Finanzas no tiene modelo de factura (sí `PagoOC`, `DetallePagoOC`, `ProgramaPagos`).
