#!/usr/bin/env node
// -----------------------------------------------------------------------------
// Chequeo estático de cobertura RLS: para cada microservicio con
// prisma/schema.prisma propio, verifica que todo modelo con campo tenant_id
// tenga ENABLE ROW LEVEL SECURITY + al menos una CREATE POLICY declarados en
// el rls-policies.sql del mismo servicio.
//
// No requiere base de datos ni servicios corriendo — parsea los archivos
// versionados como texto. Ver openspec/changes/ci-rls-coverage-check.
//
// Uso: node scripts/ci/check-rls-coverage.js
// -----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const APPS_DIR = path.join(REPO_ROOT, "apps");

function findServices() {
  return fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) =>
      fs.existsSync(path.join(APPS_DIR, name, "prisma", "schema.prisma"))
    )
    .sort();
}

// Extrae { tabla -> { modelo, hasMap } } para todo modelo con campo tenant_id.
function parseTenantScopedTables(schemaSource) {
  const tables = [];
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let match;
  while ((match = modelRegex.exec(schemaSource)) !== null) {
    const [, modelName, body] = match;
    const hasTenantId = /^\s*tenant_id\b/m.test(body);
    if (!hasTenantId) continue;

    const mapMatch = body.match(/@@map\("([^"]+)"\)/);
    tables.push({
      model: modelName,
      table: mapMatch ? mapMatch[1] : null,
    });
  }
  return tables;
}

// Extrae el set de tablas con ENABLE ROW LEVEL SECURITY y el set con al
// menos una CREATE POLICY, tolerando comillas dobles opcionales alrededor
// del nombre de tabla (ambos estilos coexisten en el repo).
function parseRlsCoverage(sqlSource) {
  const enabled = new Set();
  const policied = new Set();

  const enableRegex =
    /ALTER\s+TABLE\s+"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let match;
  while ((match = enableRegex.exec(sqlSource)) !== null) {
    enabled.add(match[1]);
  }

  const policyRegex =
    /CREATE\s+POLICY\s+\S+\s+ON\s+"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi;
  while ((match = policyRegex.exec(sqlSource)) !== null) {
    policied.add(match[1]);
  }

  return { enabled, policied };
}

function checkService(service) {
  const schemaPath = path.join(APPS_DIR, service, "prisma", "schema.prisma");
  const rlsPath = path.join(APPS_DIR, service, "prisma", "rls-policies.sql");

  const schemaSource = fs.readFileSync(schemaPath, "utf8");
  const tenantTables = parseTenantScopedTables(schemaSource);
  if (tenantTables.length === 0) return [];

  const gaps = [];

  const missingMap = tenantTables.filter((t) => !t.table);
  for (const t of missingMap) {
    gaps.push({
      service,
      table: null,
      model: t.model,
      reason: `el modelo '${t.model}' tiene tenant_id pero no declara @@map(...) — no se puede determinar el nombre de tabla`,
    });
  }

  if (!fs.existsSync(rlsPath)) {
    for (const t of tenantTables) {
      if (!t.table) continue;
      gaps.push({
        service,
        table: t.table,
        model: t.model,
        reason: `no existe apps/${service}/prisma/rls-policies.sql`,
      });
    }
    return gaps;
  }

  const rlsSource = fs.readFileSync(rlsPath, "utf8");
  const { enabled, policied } = parseRlsCoverage(rlsSource);

  for (const t of tenantTables) {
    if (!t.table) continue;
    const hasEnable = enabled.has(t.table);
    const hasPolicy = policied.has(t.table);

    if (!hasEnable) {
      gaps.push({
        service,
        table: t.table,
        model: t.model,
        reason: "sin ENABLE ROW LEVEL SECURITY en rls-policies.sql",
      });
    } else if (!hasPolicy) {
      gaps.push({
        service,
        table: t.table,
        model: t.model,
        reason:
          "tiene ENABLE ROW LEVEL SECURITY pero ninguna CREATE POLICY en rls-policies.sql",
      });
    }
  }

  return gaps;
}

function main() {
  const services = findServices();
  const allGaps = services.flatMap(checkService);

  if (allGaps.length === 0) {
    console.log(
      `✓ Cobertura RLS completa en los ${services.length} microservicios revisados (${services.join(", ")}).`
    );
    process.exit(0);
  }

  console.error(
    `✗ ${allGaps.length} tabla(s) tenant-scoped sin cobertura RLS completa:\n`
  );
  for (const gap of allGaps) {
    const tableLabel = gap.table ? `"${gap.table}"` : `(modelo ${gap.model})`;
    console.error(`  - [${gap.service}] ${tableLabel}: ${gap.reason}`);
  }
  console.error(
    "\nVer openspec/specs/despliegue-completo-microservicios/spec.md — toda tabla con tenant_id SHALL tener ENABLE ROW LEVEL SECURITY + al menos una CREATE POLICY en el rls-policies.sql de su servicio."
  );
  process.exit(1);
}

main();
