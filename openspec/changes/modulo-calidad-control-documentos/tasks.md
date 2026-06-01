# Tasks — Módulo Calidad: Control de Documentos ISO 9001:2015

## 1. Scaffold del Microservicio

- [ ] 1.1 Crear directorio `apps/calidad/` con estructura estándar:
  ```
  apps/calidad/
    prisma/schema.prisma
    src/
      main.ts
      db.ts
      types.ts
    package.json
    tsconfig.json
    .env
  ```

- [ ] 1.2 Crear `apps/calidad/package.json` siguiendo el patrón de `apps/compras/package.json`:
  - `name: "calidad"`, `version: "1.0.0"`, `type: "module"`
  - Dependencies: `express`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `multer`, `uuid`
  - DevDependencies: `prisma`, `typescript`, `@types/...`, `ts-node`
  - Scripts: `dev`, `build`, `start`, `migrate`

- [ ] 1.3 Crear `apps/calidad/tsconfig.json` copiando el de otro módulo (target ES2022, module NodeNext, strict: true, verbatimModuleSyntax: true).

- [ ] 1.4 Crear `apps/calidad/.env` con variables:
  ```
  DATABASE_URL=postgresql://bocam_user:bocam_pass@localhost:5432/bocam_db
  JWT_SECRET=<mismo que los demás módulos>
  PORT=3009
  UPLOAD_DIR=/data/calidad/uploads
  ```

## 2. Schema Prisma

- [ ] 2.1 Crear `apps/calidad/prisma/schema.prisma` con los modelos `Documento` y `VersionDocumento` según el design.md. Incluir `generator client`, `datasource db` y RLS setup.

- [ ] 2.2 Ejecutar `npx prisma migrate dev --name init-calidad` en `apps/calidad/`.

- [ ] 2.3 Verificar que el SQL generado incluye las tablas `documentos` y `versiones_documento` con todos los índices y la restricción `@@unique([tenant_id, codigo])`.

- [ ] 2.4 Ejecutar `npx prisma generate` y verificar que `src/generated/prisma/` contiene los tipos TypeScript.

- [ ] 2.5 Aplicar políticas RLS en PostgreSQL para ambas tablas:
  ```sql
  ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON documentos USING (tenant_id = get_current_tenant_id());

  ALTER TABLE versiones_documento ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON versiones_documento USING (tenant_id = get_current_tenant_id());
  ```

## 3. Backend — db.ts y types.ts

- [ ] 3.1 Crear `apps/calidad/src/db.ts` copiando el patrón de otro módulo: exportar `createTenantContext`, `runAsSystem`, `disconnectDb`. Usar `PrismaClient` del `generated/prisma/`.

- [ ] 3.2 Crear `apps/calidad/src/types.ts` con:
  - Enums: `TipoDocumento`, `EstadoDocumento`, `AccionEstadoVersion`
  - Tipos de respuesta para documentos y versiones
  - Constantes: `TIPOS_PERMITIDOS` (array de extensiones), `MIMES_PERMITIDOS` (map ext → MIME), `MAX_FILE_SIZE = 50 * 1024 * 1024`

## 4. Backend — main.ts (Express + Endpoints)

- [ ] 4.1 Crear `apps/calidad/src/main.ts` con:
  - Express app + `express.json()` + observabilityMiddleware
  - `createAuthMiddleware` excluyendo `/health`
  - `requireProjectAccess()` NO se aplica (scope corporativo, no por proyecto)
  - Endpoint `GET /health`
  - `startServer()` exportado

- [ ] 4.2 Implementar `GET /api/v1/calidad/dashboard`:
  - `requireRoles('calidad', 'admin', 'superintendent')`
  - Una sola query con `groupBy` o `count` en Prisma para `documentos_por_estado`, `documentos_por_tipo`
  - Query adicional para `versiones_pendientes_revision` y `versiones_en_borrador_sin_archivo`
  - Respuesta `{ success: true, data: { ... } }`

- [ ] 4.3 Implementar `GET /api/v1/calidad/documentos`:
  - `requireRoles('calidad', 'admin', 'superintendent')`
  - Query params opcionales: `tipo`, `estado`, `q` (ILIKE en `codigo` y `titulo`)
  - Incluir `_count: { versiones: true }` en el select para mostrar total de versiones

- [ ] 4.4 Implementar `POST /api/v1/calidad/documentos`:
  - `requireRoles('calidad', 'admin')`
  - Validar campos requeridos: `codigo`, `titulo`, `tipo`, `responsable_id`
  - Validar que `tipo` esté en enum
  - Capturar error de unique constraint → `409`
  - `tenant_id` del JWT

- [ ] 4.5 Implementar `GET /api/v1/calidad/documentos/:id`:
  - `requireRoles('calidad', 'admin', 'superintendent')`
  - Include `versiones` ordenadas por `created_at DESC`
  - `404` si no existe en el tenant

- [ ] 4.6 Implementar `PATCH /api/v1/calidad/documentos/:id`:
  - `requireRoles('calidad', 'admin')`
  - Solo actualizar campos permitidos: `titulo`, `descripcion`, `responsable_id`, `proyecto_id`
  - `404` si no existe

- [ ] 4.7 Implementar `DELETE /api/v1/calidad/documentos/:id`:
  - `requireRoles('calidad', 'admin')`
  - Verificar que no haya versiones en `VIGENTE` o `EN_REVISION` → `409`
  - Eliminar el documento (cascade a versiones en BD, y archivos del disco)
  - Para los archivos: iterar versiones con `archivo_ruta` y eliminar cada archivo con `fs.unlink`

- [ ] 4.8 Configurar middleware `multer` para upload:
  ```typescript
  import multer from 'multer';
  import path from 'path';
  const upload = multer({
    dest: process.env.UPLOAD_DIR || '/tmp/calidad-uploads',
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => { /* validar extensión y MIME */ }
  });
  ```

- [ ] 4.9 Implementar `POST /api/v1/calidad/documentos/:id/versiones`:
  - `requireRoles('calidad', 'admin')`
  - Middleware `upload.single('archivo')` (archivo opcional)
  - Validar `numero_version` y `cambios` presentes
  - Verificar unicidad de `numero_version` en el documento → `409`
  - Verificar que no haya versión en `EN_REVISION` → `409`
  - Si hay archivo: mover de `req.file.path` (temp de multer) a la ruta final en el volumen
  - Crear registro `VersionDocumento` en BD
  - Si falla BD: borrar archivo ya movido → `500`
  - Actualizar `version_actual` del documento padre

- [ ] 4.10 Implementar `PATCH /api/v1/calidad/documentos/:id/versiones/:vid/estado`:
  - `requireRoles('calidad', 'admin')`
  - Leer `accion` del body: `enviar_revision` | `aprobar` | `rechazar` | `obsoleto`
  - Implementar máquina de estados según spec control-versiones
  - La transición `aprobar` debe ser atómica (una sola transacción Prisma)
  - Retornar `400` con mensaje descriptivo para transiciones inválidas

- [ ] 4.11 Implementar `GET /api/v1/calidad/documentos/:id/versiones/:vid/archivo`:
  - `requireRoles('calidad', 'admin', 'superintendent')`
  - Verificar que `documento.tenant_id === req.securityContext.tenantId`
  - Verificar que la versión tiene `archivo_ruta`
  - Construir ruta absoluta: `path.join(UPLOAD_DIR, version.archivo_ruta)`
  - Verificar que el archivo existe en disco con `fs.existsSync`
  - `res.download(rutaAbsoluta, version.archivo_nombre)` con headers correctos

## 5. Frontend — CalidadView

- [ ] 5.1 Crear `apps/app-shell/src/views/CalidadView.tsx`:
  - Prop: `activeSubView?: string`
  - Sub-vistas: `'documentos'` (única por ahora, default)
  - Header con badge "ISO 9001:2015", ícono de escudo/checklist
  - KPI cards desde `GET /api/v1/calidad/dashboard`

- [ ] 5.2 Implementar sección **Dashboard / KPIs** (visible siempre arriba):
  - 4 `MetricCard` de `@bocam/ui-core`: Total Docs, Vigentes, En Revisión, Borradores
  - Sección de "Tipos de Documento" con barras proporcionales simples
  - Sección de "Pendientes de Acción" con contador de versiones pendientes

- [ ] 5.3 Implementar sección **Lista de Documentos**:
  - Barra de búsqueda (`q`) + filtros por `tipo` y `estado` (selects)
  - Tabla o lista de tarjetas con: código, título, tipo badge, estado badge, versión actual, botón "Ver"
  - Badge de estado con colores: BORRADOR (gray), EN_REVISION (amber), VIGENTE (emerald), OBSOLETO (slate)
  - Badge de tipo con colores por categoría: PLANO (blue), PROCEDIMIENTO (violet), INSTRUCTIVO (sky), etc.
  - Botón "Nuevo Documento" (visible solo para `calidad` y `admin`)

- [ ] 5.4 Implementar **SlidePanel "Nuevo Documento"**:
  - Campos: Código, Título, Tipo (select), Descripción (textarea), Responsable (input userId o nombre)
  - `accentColor="emerald"`
  - `POST /api/v1/calidad/documentos`
  - Toast de confirmación + recargar lista

- [ ] 5.5 Implementar **vista de Detalle de Documento** (inline o SlidePanel ancho):
  - Metadatos del documento en la parte superior
  - Tabla de versiones: número versión, estado, cambios, archivo (nombre + tamaño), acciones
  - Acciones por versión según estado y rol:
    - BORRADOR: "Enviar a Revisión" (si tiene archivo), "Subir Archivo"
    - EN_REVISION: "Aprobar", "Rechazar" (solo calidad/admin)
    - VIGENTE: "Obsoleto" (con confirmación), "Descargar"
    - OBSOLETO: "Descargar"
  - Botón "Nueva Versión" para agregar siguiente versión

- [ ] 5.6 Implementar **SlidePanel "Nueva Versión"**:
  - Campos: Número de versión (text), Descripción de cambios (textarea), Archivo (input type=file)
  - Validación client-side de tipo de archivo y tamaño (50MB)
  - Submit con `FormData` multipart a `POST /api/v1/calidad/documentos/:id/versiones`
  - `accentColor="violet"`

- [ ] 5.7 Implementar **descarga de archivo**:
  - Botón "Descargar" llama a `GET /documentos/:id/versiones/:vid/archivo` con el token en header
  - Usar `api.get(..., { responseType: 'blob' })` y crear un link temporal para forzar descarga
  - Mostrar nombre del archivo y tamaño junto al botón

- [ ] 5.8 Implementar confirmación para acción "Marcar como Obsoleto":
  - Modal de confirmación antes de llamar al endpoint
  - Mensaje: "¿Confirmas marcar esta versión como obsoleta? El documento quedará sin versión vigente."

## 6. Frontend — Integración en Layout y App

- [ ] 6.1 En `Layout.tsx`, agregar en `ALL_NAV_ITEMS`:
  ```typescript
  {
    name: 'Calidad',
    icon: IconShieldCheck,   // o crear IconClipboard2 si se prefiere
    id: 'calidad',
    roles: ['calidad', 'admin'],
    subItems: [
      { id: 'documentos', label: 'Documentos',  icon: IconFileText },
    ],
  },
  ```
  Agregar antes de `Ventas` para mantener orden lógico.

- [ ] 6.2 En `App.tsx`, agregar en `renderView()`:
  ```typescript
  case 'calidad':
    return <CalidadView activeSubView={currentSubView} />;
  ```
  Importar `CalidadView` al inicio del archivo.

## 7. Infraestructura Docker

- [ ] 7.1 Crear `docker/Dockerfile.calidad` siguiendo el patrón de `docker/Dockerfile.compras` (o similar):
  - Base: `node:20-bookworm-slim`
  - `WORKDIR /app`
  - `COPY apps/calidad/package*.json ./`
  - `RUN npm ci`
  - `COPY apps/calidad/ .`
  - `RUN npx prisma generate`
  - `RUN npm run build`
  - `EXPOSE 3009`
  - `CMD ["node", "dist/main.js"]` (o `ts-node src/main.ts` si el patrón del proyecto es ESM directo)

- [ ] 7.2 Agregar servicio `calidad` en `docker-compose.vps.yml`:
  ```yaml
  calidad:
    profiles: ["core", "full"]
    build:
      context: .
      dockerfile: docker/Dockerfile.calidad
    container_name: bocam-vps-calidad
    environment:
      DATABASE_URL: ${CALIDAD_DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3009
      UPLOAD_DIR: /data/calidad/uploads
    volumes:
      - vps_calidad_uploads:/data/calidad/uploads
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - bocam-vps-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3009/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  ```

- [ ] 7.3 Agregar volumen `vps_calidad_uploads` en la sección `volumes:` de `docker-compose.vps.yml`.

- [ ] 7.4 Agregar variable de entorno `CALIDAD_DATABASE_URL` al `.env` del VPS.

## 8. Nginx — Proxy hacia calidad

- [ ] 8.1 En `docker/nginx.qnap.conf`, agregar bloque de proxy para calidad:
  ```nginx
  location /api/v1/calidad {
      client_max_body_size 55m;
      set $upstream_calidad "calidad:3009";
      proxy_pass http://$upstream_calidad;
      proxy_read_timeout 120s;
  }
  ```
  Agregar **antes** del bloque `location /` o entre los otros bloques de módulos.

## 9. Rol de Calidad en Auth

- [ ] 9.1 Verificar que el rol `calidad` esté en el catálogo de roles del módulo `auth` (`apps/auth/src/main.ts` o donde se define el ROLES_CATALOG). Si no está, agregarlo.

- [ ] 9.2 En `AdminView.tsx` del frontend, verificar que `calidad` aparezca en el selector de roles al crear/editar usuarios. Está en el array `ROLES_CATALOG` del `AdminView`. Si no está, agregarlo:
  ```typescript
  { value: 'calidad', label: 'Calidad / SGC' },
  ```

## 10. Ajuste en CLAUDE.md

- [ ] 10.1 Actualizar la tabla de puertos (§16): agregar `calidad | 3009 | módulo SGC ISO 9001`
- [ ] 10.2 Actualizar la tabla de roles (§11): agregar `calidad | Gestión de Calidad — documentos, versiones, SGC ISO 9001`

## 11. Deploy a VPS

- [ ] 11.1 Aplicar migración en VPS:
  ```bash
  docker compose -f docker-compose.vps.yml exec calidad npx prisma migrate deploy
  ```
  O verificar que el contenedor aplica migraciones al arrancar si está configurado así.

- [ ] 11.2 Build y deploy del módulo calidad:
  ```bash
  docker compose -f docker-compose.vps.yml --profile core build --no-cache calidad
  docker compose -f docker-compose.vps.yml --profile core up -d calidad
  ```

- [ ] 11.3 Rebuild y deploy del app-shell (cambios en Layout, App y CalidadView):
  ```bash
  docker compose -f docker-compose.vps.yml --profile core build --no-cache app-shell
  docker compose -f docker-compose.vps.yml --profile core up -d app-shell
  ```

- [ ] 11.4 Verificar health checks:
  ```bash
  curl https://iretum.com/api/v1/calidad/health
  # Esperado: {"status":"ok","module":"calidad","version":"1.0.0"}
  ```

- [ ] 11.5 Verificar en producción:
  - Login con admin → debe aparecer "Calidad" en el sidebar con sub-item "Documentos"
  - Crear un documento de prueba tipo PROCEDIMIENTO
  - Subir una versión 1.0 con un PDF de prueba
  - Transicionar: BORRADOR → EN_REVISION → VIGENTE
  - Descargar el archivo desde la versión VIGENTE
  - Verificar dashboard muestra los KPIs correctos
