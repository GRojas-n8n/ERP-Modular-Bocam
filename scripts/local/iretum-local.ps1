# iRetum - Entorno LOCAL aislado (docker-compose.local.yml). Ver LOCAL.md.
#
#   .\scripts\local\iretum-local.ps1 up        # levantar (la 1a vez: migra, aplica RLS y siembra)
#   .\scripts\local\iretum-local.ps1 down      # detener (conserva datos)
#   .\scripts\local\iretum-local.ps1 reset     # borrar TODO lo local y empezar de cero
#   .\scripts\local\iretum-local.ps1 status    # estado de los contenedores
#   .\scripts\local\iretum-local.ps1 logs [servicio]
#   .\scripts\local\iretum-local.ps1 migrate   # migraciones + RLS + dueno bocam_app (sin seeds)
#   .\scripts\local\iretum-local.ps1 rls-test  # prueba de aislamiento entre tenants con bocam_app
#   .\scripts\local\iretum-local.ps1 seed-compras  # datos de prueba del flujo de compras (ver LOCAL.md)
param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'down', 'reset', 'status', 'logs', 'migrate', 'rls-test', 'seed-compras')]
  [string]$Comando = 'up',
  [Parameter(Position = 1)]
  [string]$Servicio
)

# Continue: docker escribe su progreso en stderr y PowerShell 5.1 lo trataria
# como error fatal; los fallos se detectan con $LASTEXITCODE.
$ErrorActionPreference = 'Continue'
$Raiz = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $Raiz

$EnvFile = '.env.local'
$Compose = @('compose', '-f', 'docker-compose.local.yml', '--env-file', $EnvFile)

# Servicio -> base (mismos nombres que el VPS). Solo los que tienen Prisma.
$Bases = [ordered]@{
  'auth'              = 'bocam_auth'
  'gerencia-tecnica'  = 'bocam_gerencia_tecnica'
  'compras'           = 'bocam_compras'
  'finanzas'          = 'bocam_finanzas'
  'personal'          = 'bocam_personal'
  'seguridad'         = 'bocam_seguridad'
  'ventas'            = 'bocam_ventas'
  'contabilidad'      = 'bocam_contabilidad'
  'calidad'           = 'bocam_calidad'
  'almacen'           = 'bocam_almacen'
  'control-proyectos' = 'bocam_control_proyectos'
}

# Servicios cuyas migraciones NO arman la base desde cero (verificado contra una
# base vacia el 2026-10-29). Valor: migraciones con SQL que db push no genera y
# que hay que aplicar a mano tras el push (mismo criterio que backend-e2e.yml).
$HistoriaIncompleta = @{
  'auth'             = @()
  'gerencia-tecnica' = @()
  'compras'          = @('manual')   # trigger de inmutabilidad de cuadros LOCKED
  'finanzas'         = @('20260930120000_blindar_compromiso_oc')
}

function Paso($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

function Invoke-Docker {
  & docker.exe @args
  if ($LASTEXITCODE -ne 0) { throw "Fallo: docker $($args -join ' ')" }
}

function Leer-Env {
  $vars = @{}
  foreach ($l in Get-Content $EnvFile) {
    if ($l -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $vars[$Matches[1]] = $Matches[2].Trim() }
  }
  return $vars
}

function Asegurar-EnvLocal {
  if (Test-Path $EnvFile) { return }
  Paso "Creando $EnvFile con secretos aleatorios de desarrollo"
  $texto = [IO.File]::ReadAllText((Join-Path $Raiz '.env.local.example'))
  foreach ($token in 'admin', 'app', 'rmq', 'jwt', 'master', 'sat') {
    $bytes = New-Object byte[] 24
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $hex = -join ($bytes | ForEach-Object { $_.ToString('x2') })
    $texto = $texto.Replace("local_${token}_CAMBIAR", "local_${token}_$hex")
  }
  [IO.File]::WriteAllText((Join-Path $Raiz $EnvFile), $texto, (New-Object Text.UTF8Encoding $false))
}

function Verificar {
  node scripts/local/verificar-rama.mjs
  if ($LASTEXITCODE -ne 0) { exit 1 }
  Asegurar-EnvLocal
  node scripts/local/verificar-env-local.mjs $EnvFile docker-compose.local.yml
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

function Psql($base, [string[]]$extra) {
  $e = Leer-Env
  Invoke-Docker @Compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $e['LOCAL_DB_ADMIN_USER'] -d $base @extra
}

function Ya-Inicializado {
  $e = Leer-Env
  $r = & docker @Compose exec -T postgres psql -tA -U $e['LOCAL_DB_ADMIN_USER'] -d bocam_auth `
    -c "select to_regclass('public._prisma_migrations') is not null"
  return ($LASTEXITCODE -eq 0 -and "$r".Trim() -eq 't')
}

function Migrar([switch]$ConSeeds) {
  $e = Leer-Env
  $admin = $e['LOCAL_DB_ADMIN_USER']; $pass = $e['LOCAL_DB_ADMIN_PASSWORD']
  foreach ($svc in $Bases.Keys) {
    $base = $Bases[$svc]
    $url = "postgresql://${admin}:${pass}@postgres:5432/$base"
    $varSvc = ($svc.ToUpper() -replace '-', '_') + '_DATABASE_URL'

    # Funciones de contexto RLS que el VPS tiene y ninguna migracion crea.
    Psql $base @('-q', '-f', '/iretum/sql/funciones-contexto-rls.sql')

    $schema = "apps/$svc/prisma/schema.prisma"
    $vacia = "$(& docker @Compose exec -T postgres psql -tA -U $admin -d $base `
      -c "select to_regclass('public._prisma_migrations') is null")".Trim() -eq 't'

    if ($vacia -and $HistoriaIncompleta.Contains($svc)) {
      # Sus migraciones no crean las tablas base (en el VPS se crearon con
      # db push antes de adoptar migraciones): se crea el schema actual, se
      # aplica el SQL que schema.prisma no expresa y se marcan TODAS como
      # aplicadas, para que _prisma_migrations quede igual que en el VPS.
      Paso "$svc -> db push + migraciones marcadas como aplicadas ($base, como $admin)"
      Invoke-Docker @Compose run --rm --no-deps -e "DATABASE_URL=$url" $svc `
        node_modules/.bin/prisma db push --skip-generate --schema $schema
      foreach ($m in $HistoriaIncompleta[$svc]) {
        Psql $base @('-q', '-f', "/iretum/apps/$svc/prisma/migrations/$m/migration.sql")
      }
      Invoke-Docker @Compose run --rm --no-deps -e "DATABASE_URL=$url" $svc sh -c `
        "for d in apps/$svc/prisma/migrations/*/; do node_modules/.bin/prisma migrate resolve --schema $schema --applied `$(basename `$d) || exit 1; done"
    } else {
      Paso "$svc -> prisma migrate deploy ($base, como $admin)"
      Invoke-Docker @Compose run --rm --no-deps -e "DATABASE_URL=$url" $svc `
        node_modules/.bin/prisma migrate deploy --schema $schema
    }

    # rls-policies.sql se aplica al crear la base. No todos son idempotentes
    # (auth no hace DROP POLICY IF EXISTS), asi que no se re-aplica en cada up;
    # para re-aplicarlos: reset.
    if ($vacia -and (Test-Path "apps/$svc/prisma/rls-policies.sql")) {
      Paso "$svc -> rls-policies.sql"
      Psql $base @('-f', "/iretum/apps/$svc/prisma/rls-policies.sql")
    }

    if ($ConSeeds) {
      if (Test-Path "apps/$svc/prisma/seed.ts") {
        Paso "$svc -> seed (como $admin)"
        & docker @Compose run --rm --no-deps -e "DATABASE_URL=$url" -e "$varSvc=$url" -w "/workspace/apps/$svc" $svc `
          ../../node_modules/.bin/ts-node --transpile-only prisma/seed.ts
        if ($LASTEXITCODE -ne 0) { Write-Warning "El seed de $svc fallo; se continua (ver LOCAL.md)." }
      }
      if ($svc -eq 'auth') {
        Paso 'auth -> usuario administrador local (seed-usuario-local.sql)'
        Psql $base @('-q', '-f', '/iretum/sql/seed-usuario-local.sql')
      }
      if ($svc -eq 'contabilidad') {
        Paso 'contabilidad -> seed_catalogo_cuentas.sql'
        Psql $base @('-f', '/iretum/apps/contabilidad/prisma/seed_catalogo_cuentas.sql')
      }
    }

    Paso "$svc -> objetos de $base pasan a bocam_app"
    Psql $base @('-f', '/iretum/sql/transferir-a-bocam-app.sql')
  }
}

function Up {
  Verificar
  Paso 'Infraestructura: Postgres, Redis, RabbitMQ'
  Invoke-Docker @Compose up -d --wait postgres redis rabbitmq

  Paso 'Construyendo imagenes (12 servicios + app-shell; asistente solo con perfil ia)'
  Invoke-Docker @Compose build

  if (Ya-Inicializado) { Migrar } else { Migrar -ConSeeds }

  Paso 'Levantando microservicios y frontend'
  Invoke-Docker @Compose up -d --wait
  Invoke-Docker @Compose ps
  Write-Host "`nListo: http://localhost:8080  (usuario de prueba en LOCAL.md)" -ForegroundColor Green
}

function Rls-Test {
  # Usa los usuarios del seed de auth (tenant Alfa y tenant Beta), leidos como bocam_app.
  $e = Leer-Env
  $tA = '11111111-aaaa-bbbb-cccc-111111111111'
  $tB = '22222222-aaaa-bbbb-cccc-222222222222'
  Paso 'Prueba RLS: un tenant no debe ver usuarios de otro (como bocam_app)'
  $prueba = @"
select current_user as rol, rolsuper, rolbypassrls from pg_roles where rolname = current_user;
select 'sin tenant' as sesion, count(*) as usuarios_visibles from public.users;
select set_config('app.current_tenant_id', '$tA', false) is not null as tenant_alfa_fijado;
select 'tenant Alfa' as sesion, count(*) as visibles,
       count(*) filter (where tenant_id::text <> '$tA') as de_otro_tenant from public.users;
select set_config('app.current_tenant_id', '$tB', false) is not null as tenant_beta_fijado;
select 'tenant Beta' as sesion, count(*) as visibles,
       count(*) filter (where tenant_id::text <> '$tB') as de_otro_tenant from public.users;
"@
  $prueba | & docker @Compose exec -T -e "PGPASSWORD=$($e['LOCAL_APP_DB_PASSWORD'])" postgres `
    psql -v ON_ERROR_STOP=1 -h 127.0.0.1 -U bocam_app -d bocam_auth
}

switch ($Comando) {
  'up'      { Up }
  'down'    { Paso 'Deteniendo (los datos se conservan)'; Invoke-Docker @Compose --profile ia down }
  'reset'   {
    Paso 'BORRANDO contenedores, red y volumenes de iretum-local'
    Invoke-Docker @Compose --profile ia down -v --remove-orphans
    Up
  }
  'status'  { Invoke-Docker @Compose ps }
  'logs'    { if ($Servicio) { Invoke-Docker @Compose logs --tail 200 -f $Servicio } else { Invoke-Docker @Compose logs --tail 50 } }
  'migrate' { Verificar; Invoke-Docker @Compose up -d --wait postgres; Migrar }
  'rls-test' { Rls-Test }
  'seed-compras' {
    Verificar
    node scripts/local/seed-flujo-compras.mjs
    if ($LASTEXITCODE -ne 0) { exit 1 }
  }
}
