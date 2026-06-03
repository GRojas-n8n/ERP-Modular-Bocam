# Design — Asistente IA

## Context

El ERP tiene 10 microservicios con datos estructurados y un event bus RabbitMQ.
El módulo `asistente` es un **proxy inteligente**: no posee datos propios, los
toma de los módulos existentes vía HTTP (con el JWT del usuario propagado) y los
enriquece con razonamiento de Claude. Es completamente stateless.

## Goals

1. Extraer renglones de cotizaciones PDF con ≥ 90% de precisión en campos numéricos.
2. Generar resumen ejecutivo en < 8 segundos (latencia API Claude + 6 fetches paralelos).
3. Calcular alertas predictivas sin base de datos — solo con los datos disponibles en
   finanzas y control-obra en tiempo real.

## Non-Goals

- Aprobación automática de OCs o pagos — toda decisión financiera requiere un humano.
- Chatbot conversacional — sin historial de sesión, sin RAG sobre documentos internos.
- Procesamiento batch nocturno — todo es on-demand por request HTTP.
- Entrenamiento de modelos propios — se usa la API de Anthropic sin fine-tuning.

## Decisiones de Diseño

**D1 — PDF como base64 a Claude (no text extraction previa)**
Claude-sonnet-4-6 acepta documentos PDF directamente vía la propiedad `document` del
messages API. Enviar el PDF completo es más preciso que extraer texto primero, porque
Claude interpreta la estructura tabular de la cotización (alineación de columnas, totales)
que un extractor de texto pierde.

**D2 — Fetches paralelos para el resumen ejecutivo**
Los 6 endpoints de módulos (`/resumen-dashboard` de cada uno) se llaman en
`Promise.allSettled` con el JWT propagado. Si un módulo está caído, el resumen se
genera con los datos disponibles y se menciona el módulo inaccesible.

**D3 — Alertas predictivas sin DB: regresión lineal simple en memoria**
Para cada capítulo de gasto: si hay ≥ 3 puntos históricos (movimientos presupuestales
con fechas), se calcula la tasa de consumo (MXN/día) y se proyecta cuándo se agotará.
Si el agotamiento proyectado ocurre antes del 100% de avance físico, es una alerta.
Claude recibe los cálculos numéricos y genera la narrativa de la alerta.

**D4 — Rate limiting en endpoints de IA**
Las llamadas a Claude cuestan dinero. Se implementa un rate limiter de 10 requests
por tenant por 15 minutos en los tres endpoints de asistente, usando express-rate-limit
con MemoryStore (sin Redis — suficiente para volúmenes de construcción).

**D5 — Modelo: claude-sonnet-4-6 con prompt caching**
El system prompt (instrucciones de contexto de construcción) se marca como cacheable
para reducir costos en llamadas repetidas del mismo tenant en la misma sesión.

**D6 — ANTHROPIC_API_KEY como requireEnv**
Si la variable no está presente, el servicio no arranca. Los endpoints devuelven
503 si Claude no responde en 30 segundos (timeout configurable).

## Endpoints (3 nuevos)

### `POST /api/v1/asistente/leer-cotizacion`
- **Auth:** `requireRoles('procurement', 'admin')`
- **Content-Type:** `multipart/form-data` — campo `cotizacion` (PDF, max 10 MB)
- **Body adicional:** `proveedor_nombre` (string, opcional)
- **Proceso:**
  1. Leer PDF del request como buffer
  2. Convertir a base64
  3. Llamar Claude con el PDF y prompt de extracción estructurada
  4. Parsear JSON de respuesta: `{ renglones: [{ descripcion, unidad, cantidad, precio_unitario }] }`
  5. Devolver: `{ success: true, data: { proveedor: string, renglones: RenglonCotizacion[] } }`
- **Errores:** 400 si no es PDF, 413 si > 10MB, 503 si Claude no responde

### `GET /api/v1/asistente/resumen-ejecutivo`
- **Auth:** `requireRoles('superintendent', 'admin')`
- **Proceso:**
  1. Fetch paralelo de 6 módulos con `buildForwardHeaders(req)`
  2. Consolidar KPIs en un objeto estructurado
  3. Llamar Claude con los KPIs + system prompt de analista de construcción
  4. Devolver: `{ success: true, data: { resumen: string, modulos_con_error: string[], generado_en: string } }`
- **Timeout:** 30s total (6s fetch + 24s Claude)

### `GET /api/v1/asistente/alertas-predictivas`
- **Auth:** `requireRoles('superintendent', 'admin', 'finance')`
- **Proceso:**
  1. Fetch de presupuestos activos desde finanzas
  2. Fetch de avances físicos desde control-obra
  3. Calcular tasa de consumo y proyección por capítulo
  4. Identificar capítulos con riesgo (consumo > avance en > 5%)
  5. Llamar Claude solo si hay capítulos en riesgo (para la narrativa)
  6. Devolver: `{ success: true, data: { alertas: Alerta[], proyecto_saludable: boolean } }`
- **Sin Claude si no hay alertas** — devuelve `{ alertas: [], proyecto_saludable: true }` sin llamada a la API

## Variables de Entorno

```
PORT=3011
JWT_SECRET=
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_TIMEOUT_MS=30000
COMPRAS_URL=http://compras:3002/api/v1/compras
FINANZAS_URL=http://finanzas:3004/api/v1/finanzas
CONTROL_OBRA_URL=http://control-obra:3005/api/v1/control-obra
PERSONAL_URL=http://personal:3006/api/v1/personal
SEGURIDAD_URL=http://seguridad:3007/api/v1/seguridad
CALIDAD_URL=http://calidad:3009/api/v1/calidad
```

## Prompts

### Extracción de cotización
```
System: Eres un asistente de compras para una empresa constructora mexicana.
Tu tarea es extraer los renglones de una cotización de proveedor en formato JSON.

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "proveedor": "nombre del proveedor si aparece en el documento",
  "renglones": [
    {
      "descripcion": "descripción del material o servicio",
      "unidad": "unidad de medida (PZA, M2, KG, ML, etc.)",
      "cantidad": número,
      "precio_unitario": número (sin IVA si aparece desglosado)
    }
  ]
}

Reglas:
- Los números deben ser numéricos (no strings).
- Si no puedes determinar la cantidad o precio, usa null.
- Ignora encabezados, totales, condiciones de pago y pie de página.
- Limpia la descripción: quita códigos internos del proveedor si aparecen.
```

### Resumen ejecutivo
```
System: Eres el analista financiero-operativo de una empresa constructora mexicana.
Recibirás los KPIs actuales de una obra en construcción y debes generar un resumen
ejecutivo de máximo 4 párrafos en español para el Director de Construcción.

Estructura tu análisis:
1. Estado general (eficiencia presupuestal y de avance)
2. Riesgo más urgente esta semana (máximo 1, el más importante)
3. Áreas de buen desempeño (mencionar brevemente)
4. Recomendación ejecutiva (una acción concreta)

Usa lenguaje directo, sin tecnicismos. Menciona cifras concretas.
Si un módulo no tiene datos disponibles, indícalo brevemente sin dramatizar.
```

### Alertas predictivas
```
System: Eres un analista de control presupuestal para construcción.
Recibirás capítulos de gasto con su presupuesto autorizado, monto ejercido,
avance físico y proyección de sobrecosto calculada matemáticamente.

Para cada capítulo en riesgo, genera una alerta con:
- titulo: nombre del capítulo + problema central (max 10 palabras)
- descripcion: explicación con cifras concretas y plazo estimado de crisis
- recomendacion: acción específica que puede tomar el Director esta semana
- severidad: "alta" | "media" (alta = sobrecosto > 10% o < 30 días para crisis)

Devuelve JSON: { "alertas": [ { titulo, descripcion, recomendacion, severidad } ] }
```

## Frontend — ComprasView

En el panel del cuadro comparativo, cuando hay proveedores agregados:
- Botón "📄 Subir cotización PDF" junto al nombre del proveedor
- Al hacer click: file picker que acepta solo PDF
- Muestra spinner mientras Claude procesa
- Abre un `SideSheet` de revisión con los renglones extraídos en tabla editable
- Botón "Aplicar al cuadro" llena las celdas del proveedor en el cuadro comparativo
- El usuario puede editar cualquier campo antes de aplicar

## Frontend — DashboardView (superintendent)

- Botón "¿Cómo va la obra? ↗" en el `OperationalBanner` del dashboard ejecutivo
- Al hacer click: spinner 3-8 segundos + panel `SideSheet` con el texto del resumen
- Sección "⚠ Alertas" debajo del hero de avance, visible solo si hay alertas
  - Se carga automáticamente al entrar al dashboard
  - Máximo 3 alertas, con badge de severidad (rojo/ámbar)
  - Sin alertas: no se muestra la sección (no "no hay alertas" — solo silencio)

## Risks

| Riesgo | Mitigación |
|---|---|
| Costo API Claude (uso intensivo) | Rate limiting 10 req/15min por tenant; no llamar Claude si no hay alertas |
| PDF de cotización con layout complejo (tablas sin bordes) | Prompt incluye ejemplos; el usuario puede editar antes de aplicar |
| Latencia del resumen ejecutivo > 10s | Fetch paralelo + timeout 30s; mensaje de carga con progreso visual |
| API de Claude caída | Endpoints devuelven 503 con mensaje claro; el resto del ERP no se ve afectado |
| Prompt injection en PDF malicioso | Claude solo devuelve campos estructurados JSON; se valida el schema de la respuesta |
