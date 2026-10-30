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
- **Revisión antes de arrancar:** `scripts/local/verificar-env-local.mjs` revisa `.env.local` y `docker-compose.local.yml`. **Bloquea el arranque** si encuentra:
  - una URL hacia un host que no sea `localhost` o un servicio de la red local (la IP del VPS, `iretum.com`, etc.);
  - SAT, Sentry o Anthropic con valor;
  - un `SMTP_HOST` distinto de `mailpit`.
- **Correo:** Compras entrega las invitaciones a cotizar y las OC a **Mailpit**, una captura local. Ningún correo sale de la máquina; se ven en http://localhost:8025.
- **Apagado:** adaptador SAT, Sentry, despachador del outbox de Compras y asistente IA.

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
| `... iretum-local.ps1 seed-compras` | Datos de prueba del flujo de compras hasta la OC (ver abajo) |

La primera vez tarda (~10–15 min) porque construye 13 imágenes. Después usa la caché de Docker.

## URLs

| Qué | URL |
|---|---|
| Frontend (app-shell + nginx que enruta `/api/v1/*`) | http://localhost:8080 |
| Panel de RabbitMQ | http://localhost:15673 (usuario `bocam_broker`, contraseña `RMQ_PASSWORD` de `.env.local`) |
| Mailpit (correos capturados) | http://localhost:8025 |
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

---

# Datos de prueba: flujo de compras hasta Finanzas

Script `scripts/local/seed-flujo-compras.mjs` (change OpenSpec `seed-local-flujo-compras-a-finanzas`). Deja el tenant **"Constructora Local (pruebas)"** con un proyecto completo y 4 requisiciones, cada una detenida en un paso distinto del flujo, para luego probar a mano qué hace Finanzas con la orden de compra.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/local/iretum-local.ps1 seed-compras
```

Tarda ~10 s y se puede correr cuantas veces quieras.

## Qué hace y qué no

- **Solo corre en local:**
  - la API tiene que ser `localhost`;
  - la base tiene que ser el contenedor `iretum-local-postgres` del proyecto `iretum-local`;
  - además pasa por `verificar-env-local.mjs` y el aviso de rama.
  - Si algo no cuadra, se detiene **sin borrar nada**.
- **Limpia solo su tenant:** antes de sembrar, borra en las 11 bases las filas del tenant `8e07a7ac-…` y restaura `admin@iretum.local`. Alfa y Beta no se tocan; está verificado contando sus filas antes y después.
- **Todo por las APIs reales** (auth, ventas, gerencia-tecnica, compras), cada paso con el usuario del rol que el endpoint exige. Así se disparan los mismos eventos de RabbitMQ que en producción.
  - Solo la limpieza y el admin local usan SQL.
- **No escribe nada en Finanzas.** Lo que aparece ahí llegó solo:

| Evento / llamada | Lo publica | Qué crea en Finanzas |
|---|---|---|
| `auth.centro_costos_creado` | alta del centro de costos | `proyectos_finanzas` (anticipo 0/0) |
| `gerencia_tecnica.saldo_partida_creado` | aprobación del presupuesto en GT | 12 `presupuestos_asignados`, uno por concepto |
| `gerencia_tecnica.partida_comprometida` | `convertir-oc`, vía GT | 1 `movimientos_presupuestales` COMPROMISO por el total de la OC |
| `compras.oc_creada` | `convertir-oc` | **nada**: Finanzas lo descarta (ver pendientes) |

- **Límite de logins:** auth permite 10 logins cada 15 min y cada corrida usa 5, así que caben **2 corridas seguidas**.
  - A la tercera, el script se detiene y te lo dice.
  - Para seguir sin esperar, reinicia el contador local: `docker restart iretum-local-auth`.

## Usuarios de prueba (tenant "Constructora Local (pruebas)")

| Rol | Email | Contraseña | Límite de aprobación |
|---|---|---|---|
| Administrador | `admin@iretum.local` | `Local.2026` | $5,000,000 |
| Gerencia Técnica | `gt@iretum.local` | `Gt.Local.2026` | $2,000,000 |
| Residente de Obra | `residente@iretum.local` | `Res.Local.2026` | — |
| Compras | `compras@iretum.local` | `Comp.Local.2026` | — |
| Finanzas | `finanzas@iretum.local` | `Fin.Local.2026` | $500,000 |

Proyecto: **CIB2026049001 — Bodega Industrial Logística Querétaro Norte — Nave A**. Cliente: Desarrolladora Logística Querétaro (Ventas, código 049).

## Qué se siembra

- **Gerencia Técnica:**
  - 25 insumos: materiales, mano de obra y equipo.
  - Catálogo de **12 conceptos** en 6 capítulos (Preliminares, Cimentación, Estructura, Albañilería, Pisos, Instalaciones), importe $7,519,038.30.
  - APU de cada concepto (36 vínculos concepto-insumo, que es la explosión de insumos).
  - Presupuesto **aprobado**.
- **4 proveedores:**

| Proveedor | RFC de prueba | Ciudad | Crédito | Entrega* |
|---|---|---|---|---|
| Aceros y Varillas del Bajío | `AVB150310KQ1` | Querétaro (local) | 30 días, límite $500,000 | 4 días |
| Concretos y Agregados del Centro | `CAC120518T27` | Querétaro (local) | 15 días, límite $800,000 | 1 día |
| Ferretera y Materiales La Cantera | `FMC180905HN4` | San Juan del Río (local) | contado | 2 días |
| Distribuidora Eléctrica Industrial del Norte | `DEI110222PZ8` | Monterrey (foráneo) | 45 días, límite $300,000 | 7 días |

\* `Proveedor` no tiene campo de tiempo de entrega. El tiempo va en cada cotización, como `fecha_entrega_estimada` del renglón del cuadro.

## Requisiciones y en qué estado quedan

Los folios de requisición son fijos. Los de cuadro (`CC-<timestamp>`) y OC (`OC-AUTO-<timestamp>-1`) los genera Compras en cada corrida; el script los imprime al final.

| Caso | Folio | Partida | Estado final | Qué probar |
|---|---|---|---|---|
| a) | `REQ-LOCAL-A` | PIS-001 Firme (concreto f'c=200 + malla) | Requisición `PENDIENTE` | Aprobarla e invitar a cotizar (Compras) |
| b) | `REQ-LOCAL-B` | ALB-001 Muro de block (block, cemento, arena) | Req `APROBADA`; 4 invitados (1 declinó); cuadro `BORRADOR` con 3 cotizaciones | Enviar a evaluación (Compras) y calificar C/NC (Residente) |
| c) | `REQ-LOCAL-C` | CIM-002 Acero de refuerzo (varilla 3/8", 1/2", alambre) | Cuadro firmado por Residencia → `APROBADO_GT`. **Compra dividida:** varillas a Aceros del Bajío, alambre a La Cantera | Generar las 2 OC (Compras → "Convertir a OC") |
| d) | `REQ-LOCAL-D` | CIM-003 Concreto f'c=250 (120 m³) | Req `COMPRADA`, cuadro `CERRADO`, **OC `EMITIDA` y enviada** a Concretos del Centro: $285,600 + IVA = **$331,296** | La guía de abajo |

El caso d) pasó por la API, en este orden:
1. aprobación de la requisición (Compras);
2. invitación a cotizar (Compras);
3. captura de cotizaciones (Compras);
4. evaluación técnica, selección y firma (Residente);
5. aprobación económica (GT);
6. `convertir-oc` y `enviar-correo` (Compras).

El correo de la OC, con su PDF, está en Mailpit.

## Guía de prueba: la OC del caso d) en Finanzas

1. Entra a http://localhost:8080 con `finanzas@iretum.local` / `Fin.Local.2026` y abre **Finanzas**.
2. **Presupuestos asignados:** las 12 partidas llegaron por evento desde GT. En **CIM-003** debe verse:
   - Autorizado $1,076,816.00
   - **Comprometido $331,296.00**
   - Disponible $745,520.00
3. **Tarjetas superiores:** Autorizado total $7,519,038.30, Comprometido (OC) $331,296.00, Ejercido $0.00.
4. **Pagos de OCs** debe estar vacío: nadie ha pagado todavía.
5. Para probar el pago:
   - El pago necesita una fuente. El anticipo del proyecto es $0, así que primero registra una **cuenta bancaria** en Finanzas; el seed no crea nada en Finanzas a propósito.
   - Luego usa **Registrar pago** contra la OC `OC-AUTO-…-1`. El límite de $500,000 de este usuario cubre los $331,296.
6. Del lado de Compras (`compras@iretum.local` → Órdenes de compra), la OC aparece como `EMITIDA`, pago `PENDIENTE_PAGO` y enviada a `pedidos@concretos-centro.test`.

Para ver los eventos en los logs:

```bash
docker logs --since 10m iretum-local-finanzas
```

Busca `centro_costos_creado.processed`, `saldo_partida_creado.processed`, `partida_comprometida.processed` y `orden_compra_creada.invalid_payload`.

## Hallazgos que deja visibles el seed (no corregidos; cada uno necesita su change)

- **`compras.oc_creada` llega a Finanzas sin `presupuesto_id`:**
  - `handleOrdenCompraCreadaEvent` lo descarta como `invalid_payload` en cada OC.
  - El compromiso sí se registra, pero por el otro camino (`gerencia_tecnica.partida_comprometida`), que no revalida suficiencia. Compras ya la revisó antes con `GET /finanzas/suficiencia`.
  - Hoy el evento no sirve para nada en Finanzas.
- **Finanzas no tiene modelo de factura:**
  - Existen `PagoOC`, `DetallePagoOC` y `ProgramaPagos`, pero no la factura del proveedor (CFDI de egreso) ligada a la OC.
  - Lo más cercano es CFDI en Contabilidad.
- **`Proveedor` no tiene tiempo de entrega:** solo se captura por cotización.
- **Panel "Inteligencia financiera"** (Finanzas): sus textos son fijos y no salen de los datos. Desde el change `fix-encabezados-tablas-finanzas-y-panel-inteligencia` está **oculto** detrás de `VITE_FLAG_INTELIGENCIA_FINANCIERA`, apagada por defecto, hasta que use datos reales.
- **PDF de la OC** (`reportes`): en el encabezado, el número de OC se encima con la fecha, y la descripción larga se sale de su renglón.
