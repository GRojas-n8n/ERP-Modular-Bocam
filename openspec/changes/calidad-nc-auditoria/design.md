# Design — Calidad: No Conformidades y Auditorías Internas

## Context

El módulo `calidad` ya cubre ISO 9001:2015 pilar 7.5 (Información Documentada).
Los siguientes pilares críticos: 10.2 (No Conformidades + Acciones Correctivas) y
9.2 (Auditorías Internas). Sin ellos no hay evidencia de mejora continua.

## Goals

1. Ciclo completo de No Conformidades: ABIERTA → EN_ANALISIS → ACCION_CORRECTIVA → EN_VERIFICACION → CERRADA
2. Gestión de Auditorías Internas con hallazgos clasificados (MAYOR | MENOR | OBSERVACION)
3. Integrado en CalidadView como sub-vistas adicionales

## Non-Goals

- Integración con módulo Seguridad para NCs de incidentes (iteración futura)
- Notificaciones por email cuando vence fecha límite
- Reportes en PDF desde esta iteración

## Schema — 4 modelos nuevos

### NoConformidad
- `id_nc`, `tenant_id`, `proyecto_id?`, `codigo` (NC-YYYY-NNN), `titulo`, `descripcion?`
- `fuente`: INTERNA | CLIENTE | PROVEEDOR | AUDITORIA | PROCESO
- `estado`: ABIERTA | EN_ANALISIS | ACCION_CORRECTIVA | EN_VERIFICACION | CERRADA
- `detectado_por`, `responsable_id`, `fecha_deteccion`, `fecha_limite?`, `fecha_cierre?`
- `causa_raiz?` (Text — análisis 5 Por Qués)

### AccionCorrectiva
- `id_accion`, `tenant_id`, `nc_id` (FK → NoConformidad, CASCADE)
- `descripcion`, `responsable_id`, `fecha_compromiso?`
- `estado`: PENDIENTE | EN_PROCESO | COMPLETADA | VERIFICADA | CANCELADA
- `evidencia?`

### AuditoriaInterna
- `id_auditoria`, `tenant_id`, `proyecto_id?`, `codigo` (AUD-YYYY-NN), `titulo`
- `alcance?`, `criterios?`, `auditor_lider_id`
- `fecha_inicio?`, `fecha_fin?`
- `estado`: PROGRAMADA | EN_CURSO | COMPLETADA | CANCELADA
- `observaciones?`

### HallazgoAuditoria
- `id_hallazgo`, `tenant_id`, `auditoria_id` (FK → AuditoriaInterna, CASCADE)
- `descripcion`, `tipo`: MAYOR | MENOR | OBSERVACION
- `proceso_afectado?`, `evidencia?`, `accion_requerida?`
- `estado`: ABIERTO | EN_SEGUIMIENTO | CERRADO

## Endpoints (10 nuevos)

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/calidad/no-conformidades` | calidad, admin, superintendent |
| POST | `/api/v1/calidad/no-conformidades` | calidad, admin |
| GET | `/api/v1/calidad/no-conformidades/:id` | calidad, admin, superintendent |
| PATCH | `/api/v1/calidad/no-conformidades/:id` | calidad, admin |
| POST | `/api/v1/calidad/no-conformidades/:id/acciones` | calidad, admin |
| PATCH | `/api/v1/calidad/no-conformidades/:id/acciones/:aid` | calidad, admin |
| GET | `/api/v1/calidad/auditorias` | calidad, admin, superintendent |
| POST | `/api/v1/calidad/auditorias` | calidad, admin |
| GET | `/api/v1/calidad/auditorias/:id` | calidad, admin, superintendent |
| POST | `/api/v1/calidad/auditorias/:id/hallazgos` | calidad, admin |

## Frontend

- `Layout.tsx`: 2 sub-items nuevos en calidad: `no-conformidades`, `auditorias`
- `CalidadView.tsx`: routing por `activeSubView` → `documentos` | `no-conformidades` | `auditorias`
- Vista NC: tabla de NCs + SlidePanel crear + detalle con acciones correctivas
- Vista Auditorías: tabla + SlidePanel crear + detalle con hallazgos
