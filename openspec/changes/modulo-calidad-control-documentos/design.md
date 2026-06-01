# Design — Módulo Calidad: Control de Documentos ISO 9001:2015

## Context

El ERP ya tiene 10 microservicios operando bajo el mismo patrón: TypeScript + Express + Prisma + PostgreSQL, con RLS, JWT y bus de eventos RabbitMQ. El nuevo módulo `calidad` replica exactamente este patrón — nada se inventa, todo se hereda del stack existente.

**Alcance corporativo:** a diferencia de módulos transaccionales (Compras, Control de Obra) donde cada registro lleva `proyecto_id`, los documentos del SGC son del tenant. Un procedimiento o un manual de calidad aplica a toda la organización. Los documentos _pueden_ referenciar un proyecto (`proyecto_id` opcional) cuando aplica (ej. planos de una obra específica), pero el identificador de aislamiento es siempre `tenant_id`.

**Almacenamiento de archivos:** se usa el filesystem local del contenedor con un volumen Docker persistente. No se requiere S3 ni servicio externo. Cada archivo se guarda en la ruta:
```
/data/calidad/uploads/{tenant_id}/{documento_id}/{version_id}{extension}
```
El endpoint de descarga sirve el archivo con cabeceras correctas. El módulo guarda solo la ruta relativa en BD, nunca la ruta absoluta.

## Goals

1. Registro y búsqueda de documentos del SGC con código único por tenant
2. Control de versiones completo con flujo de estados ISO 9001:2015
3. Upload y descarga de archivos de forma segura (autenticado)
4. Vista frontend integrada en el sidebar de navegación
5. Dashboard básico de KPIs de documentación

## Non-Goals

- No Conformidades / Acciones Correctivas (siguiente iteración)
- Auditorías internas (siguiente iteración)
- Firma digital o validación criptográfica de documentos
- Integración con SharePoint/Google Drive/S3
- Notificaciones por email al cambiar estado
- Preview de PDF/DWG en el navegador (solo descarga)
- Multi-idioma del documento

## Schema Prisma

```prisma
// apps/calidad/prisma/schema.prisma

model Documento {
  id_documento   String    @id @default(uuid()) @db.Uuid
  tenant_id      String    @db.Uuid
  codigo         String    @db.VarChar(30)  // DOC-2026-001
  titulo         String    @db.VarChar(255)
  tipo           String    @db.VarChar(30)  // PLANO | PROCEDIMIENTO | INSTRUCTIVO | ESPECIFICACION | MANUAL | REGISTRO | OTRO
  descripcion    String?   @db.Text
  proyecto_id    String?   @db.Uuid         // Opcional: plano de obra específica
  responsable_id String    @db.Uuid         // userId del responsable del documento
  estado_actual  String    @default("BORRADOR") // BORRADOR | EN_REVISION | VIGENTE | OBSOLETO
  version_actual String?   @db.VarChar(10)  // "1.0", "2.3" — nullable hasta tener versión
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt

  versiones      VersionDocumento[]

  @@unique([tenant_id, codigo])
  @@index([tenant_id])
  @@index([tenant_id, tipo])
  @@index([tenant_id, estado_actual])
  @@map("documentos")
}

model VersionDocumento {
  id_version       String    @id @default(uuid()) @db.Uuid
  tenant_id        String    @db.Uuid
  documento_id     String    @db.Uuid
  numero_version   String    @db.VarChar(10)  // "1.0", "1.1", "2.0"
  estado           String    @default("BORRADOR") // BORRADOR | EN_REVISION | VIGENTE | OBSOLETO
  cambios          String?   @db.Text          // Descripción de cambios respecto a versión anterior
  archivo_nombre   String?   @db.VarChar(255)  // Nombre original del archivo
  archivo_ruta     String?   @db.VarChar(500)  // Ruta relativa en volumen
  archivo_mime     String?   @db.VarChar(100)  // MIME type
  archivo_tamano   Int?                         // Bytes
  creado_por       String    @db.Uuid
  revisado_por     String?   @db.Uuid
  aprobado_por     String?   @db.Uuid
  fecha_emision    DateTime?                    // Cuando pasó a VIGENTE
  fecha_obsoleto   DateTime?                    // Cuando pasó a OBSOLETO
  created_at       DateTime  @default(now())

  documento        Documento @relation(fields: [documento_id], references: [id_documento], onDelete: Cascade)

  @@unique([documento_id, numero_version])
  @@index([tenant_id, estado])
  @@index([documento_id])
  @@map("versiones_documento")
}
```

## Endpoints REST

Todos bajo `/api/v1/calidad/`. Todos requieren JWT válido.

### Documentos

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `GET` | `/documentos` | `calidad`, `admin`, `superintendent` | Listar documentos con filtros (tipo, estado, búsqueda) |
| `POST` | `/documentos` | `calidad`, `admin` | Crear documento (sin versión inicial) |
| `GET` | `/documentos/:id` | `calidad`, `admin`, `superintendent` | Detalle del documento con todas sus versiones |
| `PATCH` | `/documentos/:id` | `calidad`, `admin` | Actualizar metadatos (título, descripción, responsable) |
| `DELETE` | `/documentos/:id` | `calidad`, `admin` | Eliminar (solo si todas sus versiones están en BORRADOR u OBSOLETO) |

### Versiones

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `POST` | `/documentos/:id/versiones` | `calidad`, `admin` | Crear nueva versión + upload de archivo (multipart/form-data) |
| `PATCH` | `/documentos/:id/versiones/:vid/estado` | `calidad`, `admin` | Transicionar estado de la versión |
| `GET` | `/documentos/:id/versiones/:vid/archivo` | `calidad`, `admin`, `superintendent` | Descargar archivo (stream) |

### Dashboard

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `GET` | `/dashboard` | `calidad`, `admin`, `superintendent` | KPIs: totales por estado/tipo, pendientes de revisión |

## Decisiones de Diseño

**D1 — Transiciones de estado válidas**
```
BORRADOR → EN_REVISION    (enviar a revisión)
EN_REVISION → VIGENTE     (aprobar — marca versiones anteriores VIGENTES como OBSOLETAS)
EN_REVISION → BORRADOR    (rechazar — vuelve a borrador para corrección)
VIGENTE → OBSOLETO        (obsolescencia manual, por ejemplo al crear versión nueva)
```
Solo se puede tener UNA versión en estado `VIGENTE` por documento simultáneamente. La transición a `VIGENTE` es atómica: en la misma transacción se pone la versión actual como VIGENTE y las anteriores VIGENTES como OBSOLETAS.

**D2 — Códigos de documento**
Formato sugerido: `{TIPO_ABREV}-{AÑO}-{SEQ3}` — ej. `PLN-2026-001`, `PRO-2026-012`.
El backend **no genera** el código automáticamente — lo proporciona el usuario para que el responsable de calidad siga su propia nomenclatura ISO. Solo garantiza unicidad por tenant.

**D3 — Número de versión**
El backend tampoco genera el número de versión automáticamente. El usuario proporciona `"1.0"`, `"1.1"`, `"2.0"` según su propio criterio. El backend garantiza unicidad por documento.

**D4 — Upload de archivos**
Se usa `multer` como middleware de Express para recibir multipart/form-data. Límite: 50 MB por archivo. Tipos permitidos: `.pdf`, `.dwg`, `.dxf`, `.docx`, `.xlsx`, `.png`, `.jpg`, `.jpeg`. El archivo se guarda antes de crear el registro en BD — si el registro falla, el archivo se borra (limpieza en catch).

**D5 — Download de archivos**
`GET /documentos/:id/versiones/:vid/archivo` verifica RLS (tenant_id), lee el archivo del volumen y hace stream con `res.sendFile()`. El header `Content-Disposition` usa el `archivo_nombre` original para que el navegador descargue con el nombre correcto.

**D6 — `proyecto_id` opcional**
`Documento` tiene `proyecto_id?: String` — los documentos corporativos (manuales, procedimientos generales) no llevan `proyecto_id`. Los planos de una obra específica sí pueden llevarlo. El filtro de RLS aplica solo por `tenant_id`, no por `proyecto_id`.

**D7 — Sin eventos en MVP**
No se publican eventos al bus en esta primera versión. El módulo opera de forma autónoma. En futuras iteraciones se publicará `calidad.documento_vigente` para que otros módulos puedan reaccionar.

## Risks

**R1 — Volumen Docker en VPS**
Si el volumen `vps_calidad_uploads` no se crea antes del primer arranque, el contenedor fallará al intentar escribir archivos. El `docker-compose.vps.yml` debe declarar el volumen explícitamente.

**R2 — Archivos grandes y timeouts**
Uploads de DWG/PDF de construcción pueden superar 10 MB. El nginx de app-shell tiene un `client_max_body_size` que debe ajustarse. Por defecto nginx limita a 1 MB.

**R3 — Seguridad del endpoint de descarga**
El endpoint de descarga sirve archivos del filesystem. Es crítico validar que la ruta del archivo pertenezca al tenant del JWT antes de hacer stream. Nunca usar el `archivo_ruta` del body del request — solo el que está en BD.
