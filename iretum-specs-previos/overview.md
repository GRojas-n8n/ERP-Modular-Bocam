# iRetum — ERP para Construcción (Bocam)

**Dominio:** iretum.com
**Cliente:** Bocam
**Stack:** Node.js + TypeScript — React 19 + Vite 7 — PostgreSQL — RabbitMQ — Docker
**Estado:** En desarrollo activo (~60%)

## Microservicios (12)

| Puerto | Módulo | Estado |
|---|---|---|
| 3003 | Auth | Implementado |
| 3001 | Gerencia Técnica | Implementado |
| 3002 | Compras | Implementado |
| 3004 | Finanzas | Implementado |
| 3005 | Control de Obra | Implementado |
| 3006 | Personal/RH | Implementado |
| 3007 | Seguridad HSE | Parcial |
| 3008 | Contabilidad | Parcial |
| 3009 | Calidad (ISO 9001) | Parcial |
| 3010 | Reportes/Dashboard | Parcial |
| 3011 | Asistente IA | Parcial |
| 3012 | Ventas | Skeleton — pendiente |

## SDD + QA

- `specs/README.md` — Cómo aplicar SDD en proyecto existente
- `specs/qa-strategy.md` — Estrategia completa de QA (6 niveles)
- `specs/modules/pendientes.md` — Módulos faltantes y prioridad
- `CLAUDE.md` — Reglas para Claude Code en este proyecto

> Ver `[[projects/iretum/overview]]` en wiki para arquitectura detallada.