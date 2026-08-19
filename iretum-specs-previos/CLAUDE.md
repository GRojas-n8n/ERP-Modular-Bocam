# CLAUDE.md — iRetum ERP

## Stack técnico
- **Backend:** Node.js + TypeScript — 12 microservicios (uno por módulo)
- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind CSS v4 — SPA única (app shell)
- **Base de datos:** PostgreSQL — una base por microservicio, SIN JOINs cruzados
- **ORM/Query:** Prisma (o cliente nativo PostgreSQL según microservicio)
- **Mensajería:** RabbitMQ — topic exchange `bocam.events`
- **Caché:** Redis
- **Proxy:** Caddy con HTTPS automático
- **Contenedores:** Docker Compose en VPS Ubuntu
- **Testing:** Jest + Supertest para APIs

## Convenciones
- **Nombres:** camelCase en TypeScript, snake_case en tablas BD
- **Commits:** conventional commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`)
- **Branch:** `{tipo}/{numero}-{descripcion}` ej. `test/auth-42-login-timeout`
- **Puertos:** cada microservicio tiene puerto asignado (3001-3012)

## Estructura del repo
```
iretum/
├── services/           ← microservicios (auth, gerencia-tecnica, compras...)
│   ├── auth/           ← puerto 3003
│   ├── gerencia-tecnica/ ← puerto 3001
│   └── ...
├── frontend/           ← app shell React 19
├── specs/              ← specs SDD para módulos nuevos y cambios
├── tests/              ← tests E2E / integración entre servicios
└── docs/               ← documentación general
```

## Reglas para Claude Code

### ⚠️ PROYECTO EXISTENTE (~60%) — REGLAS ESPECIALES

1. **No refactorizar código legacy sin spec.** El 60% existente se toca SOLO para bug-fixes documentados en spec.
2. **Bug-fix cycle:** spec del bug → tests que reproducen el bug → fix → PR. Sin spec, no hay fix.
3. **Código nuevo requiere spec en `/specs/modules/`.** Sin spec aprobado, no implementar.
4. **No modificar archivos que no están cubiertos por un spec.** El legacy se protege.
5. **Cada microservicio es independiente.** Un spec cubre UN microservicio, no cruces entre servicios (el event bus es la excepción).

### Testing
- **Tests para código nuevo:** obligatorio — TDD estricto (test → código)
- **Tests para bugs:** el test que reproduce el bug se escribe PRIMERO, luego el fix
- **Cobertura mínima:** 80% en módulos nuevos, 60% en módulos legacy
- **Tests de integración:** probar comunicación entre microservicios vía RabbitMQ

### PR workflow
- `test/` branch para bugs
- `feat/` branch para features nuevos
- PR siempre contra `main`
- QA gate: 3 approvals mínimos (o 1 humano + tests pasando)

### Stack prohibido (en iRetum)
- NO usar SQLite — iRetum es PostgreSQL puro
- NO usar Hostinger — iRetum es Docker en VPS
- NO mezclar stacks — el stack base es innegociable a estas alturas