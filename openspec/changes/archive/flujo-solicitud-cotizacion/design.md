# Design — Flujo Completo de Solicitud de Cotización

## Context

El flujo actual (simplificado):
```
Residente → [crea req con insumos] → Compras → [crea cuadro comparativo manualmente] → Residente evalúa → firma
```

El flujo propuesto:
```
Residente → [crea req con insumos + N specs por partida]
         → Compras → [selecciona proveedores → registra SolicitudCotizacion]
                   → [plazo 3-5 días hábiles]
                   → [alerta si vence sin respuesta]
                   → [sube PDFs / marca DECLINO por proveedor]
                   → [crea cuadro comparativo — auto-populado desde req]
         → Residente → [evalúa cuadro: C/NC/DA/? por partida + anotaciones por spec]
                     → [firma y bloquea]
```

## Goals

- G1: El Residente captura especificaciones en la fuente (req) — no en el cuadro
- G2: Trazabilidad completa: quién fue solicitado, cuándo, qué respondió, con qué PDF
- G3: Alerta automática por plazo vencido (sin cron externo — cálculo on-the-fly al cargar ComprasView)
- G4: El cuadro comparativo se forma desde la req — sin re-captura de specs

## Non-Goals

- No email automático a proveedores (v2)
- No portal de proveedor (v2)
- No catálogo maestro de materiales con specs predefinidas (v2)
- No modificar el módulo `finanzas` ni el flujo de OC

## Decisiones de Diseño

### D1 — EspecificacionDetalleReq: tabla separada (no campo JSON)

Las especificaciones son texto libre, orden importa, y el usuario puede agregar/quitar individualmente. Una tabla normalizada permite CRUD limpio. Campo `orden` INT para preservar el orden visual que el Residente define.

### D2 — SolicitudCotizacion: 1 por req (no múltiples rondas en v1)

En v1 solo existe una solicitud activa por req. Si Compras necesita re-solicitar (proveedor no respondió), actualiza el plazo. Múltiples rondas es complejidad para v2.

### D3 — SolicitudCotizacionProveedor: estado + PDF opcional

Tres estados: `PENDIENTE` (default) → `RESPONDIO` (cuando sube PDF) | `DECLINO` (marcado manualmente). El PDF se guarda con el mismo patrón de multer que fichas técnicas (`/data/compras/cotizaciones/<tenantId>/<solId>/<provId>.<ext>`).

### D4 — Alerta por plazo: cálculo on-the-fly, no cron

Al hacer `GET /compras/requisiciones` (listado de Compras), el backend calcula `diasHabilesRestantes` para cada req con solicitud activa. Si `diasHabilesRestantes < 0` y hay proveedores PENDIENTE → incluye flag `alerta_plazo: true`. Sin scheduler, sin Redis TTL.

Cálculo de días hábiles: se excluyen sábado y domingo. Feriados mexicanos no se incluyen en v1 (complejidad innecesaria para el MVP).

### D5 — Auto-populate de ComparativaLinea desde EspecificacionDetalleReq

Al `POST /compras/comparativas` con `requisicion_id`, el handler:
1. Lee los detalles de la req con sus especificaciones
2. Crea una `ComparativaLinea` por cada detalle con `especificaciones_requeridas` = join de todas las specs del detalle (texto concatenado, separado por `\n`) para compatibilidad con el campo existente
3. Además almacena la referencia al `detalle_id` original en `ComparativaLinea.detalle_req_id` (nuevo campo nullable) para que el frontend pueda mostrar specs como chips individuales

### D6 — Anotaciones por celda [spec × proveedor]: tabla AnotacionEspecificacion

Nueva tabla `AnotacionEspecificacion` con:
- `especificacion_id` (FK a `EspecificacionDetalleReq`)
- `proveedor_id` (UUID del proveedor en la comparativa)
- `cuadro_id` (FK a `CuadroComparativo`)
- `tipo`: `pregunta` | `respuesta`
- `texto`: Text

La evaluación C/NC/DA/? a nivel partida se mantiene como está (no se rompe `comparativa-evaluacion-v2`). Esta tabla es adicional para el flujo de aclaración granular.

### D7 — PDF de cotización: volumen Docker separado

Nuevo volume `vps_cotizaciones_uploads:/data/compras/cotizaciones` en `docker-compose.vps.yml`. Variable de entorno `COTIZACIONES_UPLOAD_DIR` con default `/tmp/cotizaciones`.

## Esquema de Tablas Nuevas

```prisma
// En apps/compras/prisma/schema.prisma

model EspecificacionDetalleReq {
  id_especificacion  String   @id @default(uuid()) @db.Uuid
  tenant_id          String   @db.Uuid
  proyecto_id        String   @db.Uuid
  detalle_id         String   @db.Uuid        // ref a DetalleRequisicion.id_detalle
  descripcion        String   @db.Text
  orden              Int      @default(0)
  created_at         DateTime @default(now())

  @@index([tenant_id, detalle_id])
  @@map("especificaciones_detalle_req")
}

model SolicitudCotizacion {
  id_solicitud       String   @id @default(uuid()) @db.Uuid
  tenant_id          String   @db.Uuid
  proyecto_id        String   @db.Uuid
  requisicion_id     String   @db.Uuid
  dias_habiles       Int      @default(3)       // 3 o 5
  fecha_solicitud    DateTime @default(now())
  fecha_limite       DateTime
  creado_por         String   @db.Uuid
  notas              String?  @db.Text
  created_at         DateTime @default(now())

  proveedores        SolicitudCotizacionProveedor[]

  @@unique([tenant_id, requisicion_id])
  @@index([tenant_id, proyecto_id])
  @@map("solicitudes_cotizacion")
}

model SolicitudCotizacionProveedor {
  id_scp             String   @id @default(uuid()) @db.Uuid
  tenant_id          String   @db.Uuid
  solicitud_id       String   @db.Uuid
  proveedor_id       String   @db.Uuid
  estado             String   @default("PENDIENTE")  // PENDIENTE | RESPONDIO | DECLINO
  pdf_nombre         String?  @db.VarChar(255)
  pdf_ruta           String?  @db.Text
  pdf_mime           String?  @db.VarChar(100)
  notas_proveedor    String?  @db.Text
  fecha_respuesta    DateTime?
  updated_at         DateTime @updatedAt

  @@unique([solicitud_id, proveedor_id])
  @@index([tenant_id, solicitud_id])
  @@map("solicitudes_cotizacion_proveedores")
}

model AnotacionEspecificacion {
  id_anotacion       String   @id @default(uuid()) @db.Uuid
  tenant_id          String   @db.Uuid
  cuadro_id          String   @db.Uuid
  especificacion_id  String   @db.Uuid
  proveedor_id       String   @db.Uuid
  tipo               String   @db.VarChar(20)  // "pregunta" | "respuesta"
  texto              String   @db.Text
  creado_por         String   @db.Uuid
  created_at         DateTime @default(now())

  @@index([tenant_id, cuadro_id])
  @@index([tenant_id, especificacion_id])
  @@map("anotaciones_especificacion")
}
```

Modificación a `ComparativaLinea` (tabla existente):
```prisma
// Agregar campo nullable — no rompe registros existentes
detalle_req_id     String?  @db.Uuid
```

## Risks

| Riesgo | Mitigación |
|---|---|
| ComparativaDetail ya tiene evaluación C/NC/DA/? — las anotaciones de spec no deben confundirse con las aclaraciones existentes | Mostrar las anotaciones en sección separada "Consultas por especificación" debajo de la evaluación |
| Cuadros comparativos anteriores sin `detalle_req_id` | El campo es nullable — el frontend muestra specs inline solo si existen; sino, usa el campo texto `especificaciones_requeridas` existente |
| Cálculo de días hábiles on-the-fly puede ser lento si hay muchas reqs | Indexar `fecha_limite` en `SolicitudCotizacion`; la consulta de alertas filtra solo `WHERE fecha_limite < NOW() AND estado IN ('PENDIENTE')` |

## Migration Plan

1. Añadir nuevas tablas en schema.prisma
2. `prisma migrate dev` local
3. Implementar backend
4. Implementar frontend
5. En VPS: `prisma migrate deploy` en contenedor `compras`
6. Rebuild `compras` + `app-shell`
