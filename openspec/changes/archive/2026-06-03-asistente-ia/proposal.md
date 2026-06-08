# Proposal — Asistente IA

## Why

El ERP ya captura todos los datos clave de una obra: presupuesto, avances, compras,
nómina, seguridad, calidad. Pero esos datos siguen exigiendo que un humano los lea,
los interprete y actúe. Tres fricciones concretas tienen solución directa con IA:

1. **Captura manual de cotizaciones:** un proveedor manda su cotización en PDF y alguien
   en compras teclea cada renglón en el cuadro comparativo. Con 3 proveedores y 40 conceptos
   son 2-4 horas de trabajo por ciclo de compra. Es pura transcripción.

2. **El director lee números, no narrativa:** el Dashboard Ejecutivo muestra KPIs pero
   no explica qué significan juntos. ¿El 68% de avance con 69% de presupuesto ejercido
   es preocupante? ¿Qué riesgo es el más urgente esta semana?

3. **Los sobrecostos se descubren tarde:** cuando la desviación presupuestal se hace
   visible en el informe mensual, ya no hay margen de maniobra. La tendencia existía
   semanas antes en los datos.

## What Changes

- **NUEVO** microservicio `apps/asistente/` (puerto 3011) — sin base de datos propia,
  sin Prisma. Consume la API de Anthropic (claude-sonnet-4-6) y llama a los módulos
  existentes vía HTTP con el JWT del usuario.
- **NUEVO** endpoint `POST /api/v1/asistente/leer-cotizacion` — recibe un PDF de
  cotización, lo envía a Claude como documento base64, y devuelve los renglones
  estructurados (descripción, unidad, cantidad, precio_unitario) listos para poblar
  el cuadro comparativo.
- **NUEVO** endpoint `GET /api/v1/asistente/resumen-ejecutivo` — consulta los 6
  módulos del dashboard, consolida KPIs y pide a Claude que genere un análisis
  narrativo en español con eficiencia presupuestal, riesgos activos y tendencias.
- **NUEVO** endpoint `GET /api/v1/asistente/alertas-predictivas` — consulta avances
  físicos y movimientos presupuestales, calcula la tasa de consumo por capítulo de
  gasto y pide a Claude que identifique dónde el presupuesto se agotará antes de que
  termine el trabajo.
- **MODIFICADO** `ComprasView.tsx` — botón "Subir cotización PDF" en el panel del
  cuadro comparativo. Modal de revisión antes de aplicar los renglones extraídos.
- **MODIFICADO** `DashboardView.tsx` — botón "¿Cómo va la obra?" en el dashboard
  ejecutivo. Panel con resumen narrativo. Sección de alertas predictivas.

## Capabilities

### New Capabilities

- `leer-cotizacion`: extracción automática de renglones de cotizaciones en PDF usando
  visión de documentos de Claude. El usuario sube el PDF y revisa/confirma antes de
  aplicar al cuadro.
- `resumen-ejecutivo`: análisis narrativo del estado de la obra en lenguaje natural,
  generado en tiempo real a partir de los datos reales del proyecto.
- `alertas-predictivas`: detección anticipada de capítulos de gasto con tendencia de
  sobrecosto, con proyección cuantificada antes de que ocurra.

## Impact

- **Nuevo microservicio:** `apps/asistente/` (puerto 3011), Dockerfile via
  `Dockerfile.reportes` (mismo patrón: COPY . . primero).
- **Frontend:** cambios en `ComprasView.tsx` y `DashboardView.tsx`.
- **Infraestructura:** nuevo servicio en `docker-compose.vps.yml`,
  nuevo bloque proxy en `docker/nginx.qnap.conf`, nueva variable
  `ANTHROPIC_API_KEY` en `.env` del VPS.
- **Sin cambios de schema Prisma** — el módulo no tiene BD propia.
- **Sin cambios de RBAC** — usa los roles existentes (procurement para
  lectura de cotizaciones, superintendent/admin para resumen y alertas).
