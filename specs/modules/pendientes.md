# Módulos pendientes y prioridad

> Basado en la arquitectura documentada de 12 microservicios.
> Estado actual: ~60% del sistema implementado.

## Microservicios

| Puerto | Módulo | Estado | Tests | Prioridad |
|---|---|---|---|---|
| 3003 | Auth | 🟢 Implementado | ? | 🔴 Crítica |
| 3001 | Gerencia Técnica | 🟢 Implementado | ? | 🔴 Crítica |
| 3002 | Compras | 🟢 Implementado | ? | 🔴 Crítica |
| 3004 | Finanzas | 🟢 Implementado | ? | 🔴 Crítica |
| 3005 | Control de Obra | 🟢 Implementado | ? | 🔴 Crítica |
| 3006 | Personal/RH | 🟢 Implementado | ? | 🟡 Alta |
| 3007 | Seguridad HSE | 🟡 Parcial | ? | 🟡 Alta |
| 3008 | Contabilidad | 🟡 Parcial | ? | 🟢 Media |
| 3009 | Calidad (ISO 9001) | 🟡 Parcial | ? | 🟡 Alta |
| 3010 | Reportes/Dashboard | 🟡 Parcial | ? | 🟡 Alta |
| 3011 | Asistente IA | 🟡 Parcial | ? | 🔵 Baja |
| **3012** | **Ventas** | 🔴 **Skeleton** | ❌ No | 🔴 **Crítica** |

## Qué falta por hacer

### 1. 🆕 Ventas (puerto 3012) — Módulo nuevo completo
- Pipeline de ventas (prospecto → cotización → negociación → cierre)
- Catálogo de servicios/productos
- Comisiones y metas de vendedores
- Integración con facturación (contabilidad)
- Dashboard de ventas
- TDD desde el inicio — 0% legacy, SDD puro

### 2. 🟡 Seguridad HSE — Features faltantes
- Registro de incidentes (puede estar iniciado)
- Permisos de trabajo alto riesgo
- Capacitaciones

### 3. 🟡 Contabilidad — Features faltantes
- Timbrado SAT (puede estar iniciado)
- Pólizas contables automáticas desde eventos de finanzas
- Catálogo de cuentas

### 4. 🟡 Calidad — Features faltantes
- SGC versionado completo
- No conformidades con workflow de acciones correctivas
- Auditorías internas

### 5. 🟡 Reportes — Features faltantes
- Dashboard ejecutivo con KPIs
- Exportación PDF (puede estar iniciado)
- Exportación Excel

### 6. 🔵 Asistente IA — Features faltantes
- Narrativa automática de obra
- Alertas predictivas
- Integración con claude-sonnet-4-6

## Orden sugerido de implementación

1. **Ventas** (módulo nuevo, impacta ingreso del negocio)
2. **QA tests en auth + compras + finanzas** (evitan bugs costosos)
3. **Contabilidad + timbrado** (cierra el ciclo financiero)
4. **Calidad** (ISO 9001 es requisito de cliente)
5. **Reportes/Dashboard** (visibilidad ejecutiva)
6. **Asistente IA** (cuando el sistema base esté sólido)

## Notas

- Los 12 microservicios comparten paquetes comunes: `auth-middleware`, `event-bus`, `observability`, `tenant-idempotency`
- Cada módulo nuevo debe incluir en su spec: unit tests, integration tests, event tests si aplica
- QA gate documentado en `specs/qa-strategy.md`