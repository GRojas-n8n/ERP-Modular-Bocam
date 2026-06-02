# Tasks — Reportes Exportables (PDF / Excel)

## 1. Microservicio base

- [ ] 1.1 Crear `apps/reportes/package.json` con deps: `express`, `pdfkit`, `@types/pdfkit`, `exceljs`, `@types/express`, `ts-node-dev`, `typescript`
- [ ] 1.2 Crear `apps/reportes/tsconfig.json` (clonar de calidad, cambiar outDir y paths)
- [ ] 1.3 Crear `apps/reportes/src/main.ts` — Express app con `/health`, auth middleware, 5 endpoints stub que devuelven 501

## 2. Generadores PDF

- [ ] 2.1 `src/generators/oc-pdf.ts` — genera PDF de OC: membrete (tenant nombre), datos proveedor, tabla de ítems (desc, unidad, cant, precio, importe), subtotal, IVA 16%, total, bloque de autorización con nombre del aprobador
- [ ] 2.2 `src/generators/comparativa-pdf.ts` — genera PDF de comparativa: tabla con columnas por proveedor, filas por ítem, celda ganador resaltada con fondo gris, total por proveedor al pie
- [ ] 2.3 `src/generators/prenomina-pdf.ts` — genera PDF de pre-nómina: encabezado con periodo y proyecto, tabla por empleado (nombre, puesto, días trabajados, salario diario, percepciones, deducciones IMSS/ISR, neto), total al pie

## 3. Generadores Excel

- [ ] 3.1 `src/generators/prenomina-excel.ts` — genera Excel con ExcelJS: hoja "Prenomina", fila de encabezados en negrita, una fila por empleado con todas las columnas de cálculo, fila de totales al final, autofit de columnas
- [ ] 3.2 `src/generators/presupuesto-excel.ts` — genera Excel con ExcelJS: hoja "Presupuesto", dos niveles (conceptos + subconceptos con indentación), columnas Clave/Descripción/Unidad/Cantidad/P.Unit/Total, fila de totales, formato moneda en columnas numéricas

## 4. Endpoints en main.ts

- [ ] 4.1 `POST /api/v1/reportes/oc-pdf` — valida body, llama `generateOcPdf(data)`, stream con `res.setHeader('Content-Disposition', 'attachment; filename="OC-{numero}.pdf"')` + `Content-Type: application/pdf`
- [ ] 4.2 `POST /api/v1/reportes/comparativa-pdf` — igual, llama `generateComparativaPdf(data)`, filename `"Comparativa-{titulo}.pdf"`
- [ ] 4.3 `POST /api/v1/reportes/prenomina-pdf` — llama `generatePrenominaPdf(data)`, filename `"Prenomina-{periodo}.pdf"`
- [ ] 4.4 `POST /api/v1/reportes/prenomina-excel` — llama `generatePrenominaExcel(data)`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename `"Prenomina-{periodo}.xlsx"`
- [ ] 4.5 `POST /api/v1/reportes/presupuesto-excel` — llama `generatePresupuestoExcel(data)`, filename `"Presupuesto-{version}.xlsx"`

## 5. Infraestructura

- [ ] 5.1 `apps/app-shell/nginx.conf` — agregar bloque `location /api/v1/reportes` → `proxy_pass http://reportes:3010` con headers estándar. Agregar también bloques faltantes: `/api/v1/auth` → auth:3003, `/api/v1/finanzas` → finanzas:3004, `/api/v1/control-obra` → control-obra:3005, `/api/v1/personal` → personal:3006, `/api/v1/seguridad` → seguridad:3007, `/api/v1/calidad` → calidad:3009, `/api/v1/ventas` → ventas:3012
- [ ] 5.2 `apps/app-shell/vite.config.ts` — agregar `'/api/v1/reportes': 'http://localhost:3010'` al proxy de dev
- [ ] 5.3 `docker-compose.vps.yml` — agregar servicio `reportes` (profile: core, port 3010, healthcheck `/health`, misma red bocam-vps-network, env JWT_SECRET)
- [ ] 5.4 Crear `apps/reportes/.env.example` con `PORT=3010` y `JWT_SECRET=`

## 6. Frontend — ComprasView

- [ ] 6.1 Agregar función `exportarOcPdf(oc)` que construye el body y llama `api.post('/api/v1/reportes/oc-pdf', body, { responseType: 'blob' })` y dispara la descarga con `URL.createObjectURL`
- [ ] 6.2 En la sección de detalle de OC (cuando `selectedOc` no es null), agregar botón "Exportar PDF" (variant `outline`, tamaño `sm`) que llama `exportarOcPdf`
- [ ] 6.3 Agregar función `exportarComparativaPdf(comp)` en ComprasView
- [ ] 6.4 En `ComparativaDetail.tsx`, agregar prop `onExportPdf?: () => void` y botón "Exportar PDF" visible cuando hay ganador seleccionado

## 7. Frontend — PersonalView

- [ ] 7.1 Agregar función `exportarPrenominaPdf(prenomina)` que llama al endpoint y descarga el blob
- [ ] 7.2 Agregar función `exportarPrenominaExcel(prenomina)` con `responseType: 'blob'` y descarga `.xlsx`
- [ ] 7.3 En la vista de pre-nómina (cuando hay empleados listos), agregar botones "PDF" y "Excel" junto al título de sección

## 8. Frontend — InsumosView

- [ ] 8.1 Agregar función `exportarPresupuestoExcel(presupuesto)` que construye el body con los conceptos del presupuesto activo
- [ ] 8.2 En la cabecera del presupuesto activo, agregar botón "Exportar Excel" visible cuando `presupuestoActivo` tiene conceptos

## 9. Deploy

- [ ] 9.1 Build `reportes`: confirmar que compila sin errores TypeScript
- [ ] 9.2 Build y redeploy `app-shell` (nginx.conf actualizado)
- [ ] 9.3 `docker compose -f docker-compose.vps.yml --profile core up -d reportes app-shell` en VPS
- [ ] 9.4 Verificar `/health` del servicio reportes en producción
- [ ] 9.5 Probar descarga de OC PDF desde ComprasView en iretum.com
