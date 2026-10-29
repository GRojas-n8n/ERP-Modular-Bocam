# LOCAL.md — Trabajo en el entorno local

Las pruebas locales se hacen en la rama **`entorno-local`**. A `main` nunca se le hace commit ni push directo: los cambios llegan solo por Pull Request.

## Aviso de rama al arrancar

`npm run dev` y `npm run dev:ventas` ejecutan primero `scripts/local/verificar-rama.mjs`:

- Siempre muestra la rama activa: `[rama] Rama activa: entorno-local`.
- Si la rama **no** es `entorno-local`, avisa y pregunta `¿Arrancar de todos modos? (s/N)`. Cualquier respuesta distinta de `s` cancela el arranque.
- Si la terminal no es interactiva (sin teclado), el arranque se detiene. Para forzarlo:
  - PowerShell: `$env:PERMITIR_OTRA_RAMA='1'; npm run dev`
  - Git Bash: `PERMITIR_OTRA_RAMA=1 npm run dev`

## 1. ¿En qué rama estoy?

```bash
git branch --show-current
```

`git status` también lo dice en la primera línea (`On branch ...`) y además lista los archivos con cambios.

## 2. Cambiarme de rama

Antes de cambiar, guarda o descarta lo que estés editando (`git status` debe salir limpio, salvo archivos nuevos que no quieras subir).

```bash
git switch entorno-local      # ir a la rama de pruebas
git switch main               # ir a main (solo para leer o actualizar)
```

Traer a `entorno-local` lo último de `main`:

```bash
git switch main
git pull
git switch entorno-local
git merge main
git push
```

## 3. Unir a `main` cambios ya probados

1. En `entorno-local`, guarda y sube tus cambios:
   ```bash
   git add <archivos>
   git commit -m "feat: descripción corta"
   git push
   ```
2. Abre un Pull Request de `entorno-local` hacia `main`:
   ```bash
   gh pr create --base main --head entorno-local
   ```
   (o en GitHub: *Compare & pull request*).
3. Espera a que pasen los checks de CI y la revisión (gate de QA en `CLAUDE.md`).
4. Haz merge del PR en GitHub. **No** hagas `git push origin main`.
5. Actualiza tu copia local:
   ```bash
   git switch main
   git pull
   git switch entorno-local
   git merge main
   ```

---

# Entorno local aislado con Docker Desktop

Copia de producción (`docker-compose.vps.yml`) que corre solo en tu máquina: **nunca** se conecta a la base ni a servicios de producción.

## Qué lo mantiene aislado

- **Proyecto Docker propio, `iretum-local`:** contenedores `iretum-local-*`, red `iretum-local-network` y volúmenes `iretum-local_*`. No se mezcla con `bocam-vps-*` ni con el `docker-compose.yml` viejo.
- **Puertos solo en `127.0.0.1`:** no son visibles desde la red de la oficina.
- **`.env.local` con valores de desarrollo** y secretos aleatorios generados en tu equipo. Git lo ignora.
- **Revisión antes de arrancar:** `scripts/local/verificar-env-local.mjs` revisa `.env.local` y `docker-compose.local.yml`. Si encuentra una URL hacia un host que no sea `localhost` o un servicio de la red local (la IP del VPS, `iretum.com`, etc.), o SMTP, SAT, Sentry o Anthropic con valor, **bloquea el arranque**.
- **Apagado:** correo SMTP, adaptador SAT, Sentry, despachador del outbox de Compras y asistente IA.

## Requisitos

- Docker Desktop abierto ("Engine running").
- Node.js en el PATH (para los scripts de verificación).
- Estar en la rama `entorno-local`. Si no, el script avisa y pregunta antes de arrancar.

## Comandos

Desde la raíz del repo, en PowerShell:

```powershell
# Levantar. La primera vez: crea .env.local, construye imágenes, migra, aplica RLS y carga datos de prueba
powershell -ExecutionPolicy Bypass -File scripts/local/iretum-local.ps1 up
```

```powershell
# Detener (los datos se conservan)
powershell -ExecutionPolicy Bypass -File scripts/local/iretum-local.ps1 down
```

```powershell
# Reiniciar DESDE CERO: borra contenedores y volúmenes locales y vuelve a levantar todo
powershell -ExecutionPolicy Bypass -File scripts/local/iretum-local.ps1 reset
```

Otros:

| Comando | Qué hace |
|---|---|
| `... iretum-local.ps1 status` | Estado de los contenedores |
| `... iretum-local.ps1 logs auth` | Logs en vivo de un servicio (Ctrl+C para salir) |
| `... iretum-local.ps1 migrate` | Aplica migraciones nuevas sin borrar datos |
| `... iretum-local.ps1 rls-test` | Prueba de aislamiento entre tenants conectado como `bocam_app` |

La primera vez tarda (~10–15 min) porque construye 13 imágenes. Después usa la caché de Docker.

## URLs

| Qué | URL |
|---|---|
| Frontend (app-shell + nginx que enruta `/api/v1/*`) | http://localhost:8080 |
| Panel de RabbitMQ | http://localhost:15673 (usuario `bocam_broker`, contraseña `RMQ_PASSWORD` de `.env.local`) |
| Postgres (DBeaver, pgAdmin) | `localhost:5433`, usuario `bocam_admin`, contraseña `LOCAL_DB_ADMIN_PASSWORD` de `.env.local` |

## Usuarios de prueba (solo locales)

| Para qué | Email | Contraseña | Tenant |
|---|---|---|---|
| **Entrar desde el navegador** | `admin@iretum.local` | `Local.2026` | Constructora Local (pruebas) |
| API / pruebas de RLS (seed de auth) | `admin@alfa.bocam.com` | `Admin.2026` | Alfa `11111111-aaaa-bbbb-cccc-111111111111` |
| API / pruebas de RLS (seed de auth) | `admin@beta.bocam.com` | `Admin.2026` | Beta `22222222-aaaa-bbbb-cccc-222222222222` |

¿Por qué hay un usuario aparte para el navegador? `LoginView.tsx` no pide tenant: siempre manda `VITE_DEFAULT_TENANT_ID`. En el build, igual al de producción, ese valor es el ID del tenant de producción `8e07a7ac-…`. Los usuarios del seed viven en Alfa/Beta, así que con ellos el navegador responde "Credenciales incorrectas".

`docker/local/sql/seed-usuario-local.sql` crea un tenant **local** con ese mismo ID, sin datos reales, más `admin@iretum.local`. Así el frontend no se construye distinto a producción.

## Base de datos: igual que el VPS

- **Un solo Postgres, con una base por servicio y los mismos nombres que producción:** `bocam_auth`, `bocam_gerencia_tecnica`, `bocam_compras`, `bocam_finanzas`, `bocam_personal`, `bocam_seguridad`, `bocam_ventas`, `bocam_contabilidad`, `bocam_calidad`, `bocam_almacen`, `bocam_control_proyectos`.
- **Tablas en `public`, con su propia `_prisma_migrations` en cada base.**
- **Roles:**
  - `bocam_admin`: superusuario, solo para migraciones, seeds y `rls-policies.sql`.
  - `bocam_app`: sin SUPERUSER ni BYPASSRLS, es el único usuario con el que se conectan las apps. Es dueño de todos los objetos, como en el VPS. Como las tablas tienen `FORCE ROW LEVEL SECURITY`, ser dueño no salta RLS.
- **Fuente:** `openspec/changes/archive/2026-07-11-fix-rls-bypass-bocam-admin/tasks.md`.

### Cómo se arma cada base (lo hace `iretum-local.ps1`)

1. Crea las funciones `get_current_tenant_id()`, `get_current_proyecto_id()` y `set_app_context()` (`docker/local/sql/funciones-contexto-rls.sql`). Existen en el VPS, pero ninguna migración las crea.
2. Migraciones como `bocam_admin`:
   - **7 servicios** (personal, seguridad, ventas, contabilidad, calidad, almacen, control-proyectos): `prisma migrate deploy` normal.
   - **4 servicios** (auth, gerencia-tecnica, compras, finanzas): sus migraciones no crean las tablas base, porque en el VPS se crearon con `db push` antes de adoptar migraciones. Se hace `prisma db push` del schema actual, luego se aplica a mano el SQL que `db push` no genera (`compras/manual`: trigger de cuadros LOCKED; `finanzas/20260930120000_blindar_compromiso_oc`) y se marcan **todas** sus migraciones como aplicadas. `_prisma_migrations` queda igual que en el VPS.
3. `rls-policies.sql` de cada servicio. Se aplica al crear la base; para volver a aplicarlo, `reset`.
4. Seeds, como `bocam_admin`.
5. Todos los objetos pasan a ser de `bocam_app` (`docker/local/sql/transferir-a-bocam-app.sql`).

## Pendientes conocidos (no corregidos a propósito)

- **Puerto 3012 duplicado:** `almacen` y `ventas` usan los dos el puerto 3012. En Docker no chocan (contenedores distintos), pero fuera de Docker, con `npm run dev` y el proxy de `vite.config.ts`, sí.
- **`.env.vps.example` desactualizado:** muestra una sola base para todos los servicios. El VPS real usa una base por servicio y el rol `bocam_app` (ver arriba).
- **El historial de migraciones no reconstruye producción desde cero:**
  - En 4 servicios faltan las migraciones de las tablas base.
  - Personal y calidad dependen de funciones creadas fuera de las migraciones.
  - Localmente las tablas de esos 4 vienen del `schema.prisma` actual. Si alguien cambió el VPS a mano sin reflejarlo en el repo, aquí no aparece. La única forma de confirmarlo es comparar con un volcado solo de esquema de producción (`pg_dump --schema-only`).
- **Seed de finanzas roto:** `apps/finanzas/prisma/seed.ts` inserta movimientos que violan `chk_movimiento_oc_referencia_id`, constraint agregada después por la migración `blindar_compromiso_oc`. El script avisa y sigue; finanzas queda con datos de prueba parciales.
- **Seed de gerencia-tecnica roto:** falla con `@prisma/client did not initialize yet` (importa el cliente por defecto en lugar del generado del servicio). El script avisa y sigue.
- **Asistente IA apagado:** exige `ANTHROPIC_API_KEY` al arrancar, y con cualquier key intentaría llamar a Anthropic. Está en el perfil `ia` y no arranca por defecto; `/api/v1/asistente/*` devuelve 502.
- **`rls-policies.sql` de auth no es idempotente:** no hace `DROP POLICY IF EXISTS`, por eso solo se aplica al crear la base.
