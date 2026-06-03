# Design — Reportes Exportables (PDF / Excel)

## Context

Los módulos producen datos correctos y los muestran en pantalla, pero no hay forma de
extraerlos como documentos compartibles. Un proveedor necesita la OC firmada en PDF,
RRHH necesita la nómina en Excel para el banco, y la Gerencia necesita el presupuesto
exportado para la auditoría. Sin exportación, el sistema obliga a capturas de pantalla
o reingreso manual de datos.

## Goals

1. Servicio dedicado `apps/reportes/` (puerto 3010) — sin base de datos propia, sin Prisma.
2. 5 tipos de documento: OC PDF, pre-nómina PDF, pre-nómina Excel, presupuesto GT Excel, comparativa PDF.
3. Botones de exportación integrados en ComprasView, PersonalView e InsumosView.
4. El servicio es stateless: recibe la data en el body del POST y devuelve el archivo.

## Non-Goals

- Exportaciones programadas / por email.
- Firma electrónica o timbrado de documentos.
- Historial de reportes generados.
- Estilos avanzados con logo gráfico (se usa nombre del tenant como texto).

## Decisiones de Diseño

**D1 — Data-in-body (no fetch inter-servicio)**
El frontend ya tiene los datos que necesita para generar el reporte (los cargó para mostrarlos
en pantalla). Los POST bodies transportan esa data estructurada. Esto mantiene el servicio
completamente stateless y sin dependencias de red hacia otros microservicios, eliminando
el riesgo de error downstream en el momento de generación.

**D2 — Sin Prisma / sin base de datos**
`apps/reportes/` no tiene schema.prisma. No hace queries a BD. Es un generador puro.

**D3 — Streaming directo del archivo**
Los endpoints devuelven el archivo con `Content-Disposition: attachment` + mime type
apropiado. No base64, no JSON wrapper — el browser descarga directamente con `window.open`
o `<a href>` con objeto URL.

**D4 — Proxy en nginx.conf (app-shell)**
Se agrega `location /api/v1/reportes` en el nginx.conf del contenedor app-shell. Todos
los demás módulos sin bloque proxy se registran en la misma sesión para completar la
configuración (D4b — backfill de módulos faltantes: auth, finanzas, personal, seguridad,
control-obra, calidad, ventas).

## Endpoints (5 nuevos)

| Método | Ruta | Formato | Roles |
|---|---|---|---|
| POST | `/api/v1/reportes/oc-pdf` | application/pdf | procurement, admin, superintendent |
| POST | `/api/v1/reportes/comparativa-pdf` | application/pdf | procurement, admin, superintendent |
| POST | `/api/v1/reportes/prenomina-pdf` | application/pdf | personal_rh, admin, superintendent |
| POST | `/api/v1/reportes/prenomina-excel` | application/vnd.openxmlformats-... | personal_rh, admin, superintendent |
| POST | `/api/v1/reportes/presupuesto-excel` | application/vnd.openxmlformats-... | gerencia_tecnica, admin, superintendent |

### Body shapes

**OC PDF** — `{ oc: { numero, fecha, proveedor, items[], subtotal, iva, total, aprobado_por, proyecto } }`
**Comparativa PDF** — `{ comparativa: { titulo, fecha, items[], proveedores[], lineas[], ganador_id } }`
**Prenomina PDF/Excel** — `{ prenomina: { periodo, proyecto, empleados[{ nombre, puesto, dias, salario_diario, imss, isr, deducciones[], percepciones[], neto }] } }`
**Presupuesto Excel** — `{ presupuesto: { version, proyecto, conceptos[{ clave, descripcion, unidad, cantidad, precio_unitario, total, subconceptos[] }] } }`

## Infraestructura

- `apps/reportes/src/main.ts` — Express + pdfkit + exceljs, sin Prisma.
- `apps/reportes/package.json` — deps: `pdfkit`, `exceljs`, `express`, `@types/*`.
- `apps/reportes/tsconfig.json` — igual que otros módulos backend.
- `apps/reportes/Dockerfile` — reutiliza `Dockerfile.backend` (build arg `APP_PATH=apps/reportes`).
- `docker-compose.vps.yml` — nuevo servicio `reportes` (profile: `core`).
- `apps/app-shell/nginx.conf` — bloque proxy `/api/v1/reportes` + backfill módulos faltantes.
- `apps/app-shell/vite.config.ts` — proxy dev `/api/v1/reportes`.

## Frontend

- **ComprasView.tsx**: botón "Exportar PDF" en el detalle de una OC (cuando estado = EMITIDA).
  Botón "Exportar PDF" en `ComparativaDetail` cuando hay ganador seleccionado.
- **PersonalView.tsx**: botones "PDF" y "Excel" en la vista de pre-nómina lista.
- **InsumosView.tsx**: botón "Exportar Excel" en la cabecera del presupuesto activo.

## Risks

| Riesgo | Mitigación |
|---|---|
| pdfkit genera PDFs básicos sin layout avanzado | Los documentos son tablas simples; se documenta en UI que el formato es funcional, no gráfico |
| Body grande para prenomina con muchos empleados | Límite de 100 empleados por request (Express body-parser 10 MB) |
| nginx.conf backfill puede romper módulos existentes | Probar en desarrollo antes de deploy; cada location block es independiente |
