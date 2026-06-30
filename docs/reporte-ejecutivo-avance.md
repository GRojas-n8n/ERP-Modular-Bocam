# Reporte Ejecutivo — Estado del Sistema iRetum ERP
**Fecha:** 2026-06-29  
**Versión:** 1.0  
**Proyecto piloto:** CFE Carbonser (CIB2026033001)

---

## Resumen Ejecutivo

El sistema iRetum ERP cubre hoy **11 módulos operativos** en producción. El proyecto avanza aproximadamente al **65% de su alcance total**, con el ciclo central de obra (presupuesto → requisición → compras → recepción → control) completamente funcional.

---

## Estado por Módulo

### 🟢 COMPLETADO Y EN PRODUCCIÓN

| Módulo | Puerto | DB | Descripción | % |
|--------|--------|----|-------------|---|
| **Gerencia Técnica** | 3001 | bocam_gerencia_tecnica | Presupuesto OPUS, catálogo insumos, APU, topes de partida, saldos, cuadro comparativo evaluación | 90% |
| **Autenticación** | 3003 | bocam_auth | JWT, roles, tenants, proyectos, cambio contraseña | 95% |
| **Compras** | 3004 | bocam_compras | Requisiciones, cotización, cuadro comparativo, OC multi-proveedor, recepción materiales, proveedores catálogo, calificación | 90% |
| **Finanzas** | 3006 | bocam_finanzas | Presupuesto asignado, pagos, estimaciones, dashboard, control de obra | 85% |
| **Asistente IA** | 3007 | — | Chat GPT/Claude integrado por módulo | 80% |
| **Contabilidad** | 3008 | bocam_contabilidad | Pólizas automáticas, partida doble, asientos por evento, reportes financieros, cuenta 2200 | 80% |
| **Control de Obra** | 3009 / 3013 | bocam_control_obra | Bitácora, avances físicos, estimaciones, materiales consumidos, EVM, Curva S, alertas automáticas, proyección de cierre, Gantt | 85% |
| **Personal / RRHH** | 3010 | bocam_personal | Empleados, asistencia QR, prenómina, autorización, pago, complemento salarial | 85% |
| **Calidad ISO 9001** | 3011 | bocam_calidad | No conformidades (5 estados), auditorías, hallazgos, acciones correctivas, flujo verificación | 90% |
| **Almacén** | 3005 | bocam_almacen | Entradas por OC, salidas a obra, inventario, kardex, alertas stock | 85% |
| **Seguridad HSE** | 3012 | bocam_seguridad | Incidentes, inspecciones, permisos trabajo, capacitaciones | 75% |

### 🟡 PARCIAL / SIN CONTENEDOR VPS

| Módulo | Estado | Observación |
|--------|--------|-------------|
| **Ventas** | Backend implementado, sin contenedor VPS | El evento `cotizacion_aceptada` enriquecido no corre en prod aún |
| **Nómina** | Sin servicio independiente | La lógica de prenómina está en Personal (puerto 3010) |

### 🔴 PENDIENTE / NO INICIADO

| Módulo | Prioridad | Descripción |
|--------|-----------|-------------|
| **Facturación Electrónica (SAT)** | Alta | CFDI 4.0, timbrado, cancelación |
| **CRM / Cotizaciones Externas** | Media | Pipeline de ventas desde prospecto |
| **Dashboard Ejecutivo consolidado** | Media | Vista cross-módulo para director |
| **Reportes regulatorios IMSS/SAT** | Alta | SUA, IDSE, declaraciones |

---

## Flujo Central de Obra — Estado E2E

```
Presupuesto OPUS ──▶ Catálogo Insumos/APU ──▶ Requisición ──▶ Cuadro Comparativo
     [GT✅]                [GT✅]               [Residente✅]      [Compras✅]
                                                                       │
                                                                       ▼
Contabilidad ◀── Pago ◀── Estimación ◀── OC Recibida ◀── Orden de Compra ──▶ Almacén
  [Auto✅]      [Fin✅]    [Ctrl.Obra✅]  [Almacén✅]      [Compras✅]          [✅]
                              │
                              ▼
              ┌─────────────────────────────────┐
              │        CONTROL DE OBRA          │
              │  Avance físico · Bitácora        │
              │  EVM · Curva S · Alertas · Gantt│
              └─────────────────────────────────┘
```

---

## Integraciones via RabbitMQ (Eventos activos)

| Evento | Origen | Consumidores |
|--------|--------|--------------|
| `compras.oc_creada` | Compras | Contabilidad, Control de Obra |
| `compras.oc_cancelada` | Compras | Contabilidad |
| `compras.oc_recibida_total` | Almacén | Contabilidad, GT |
| `finanzas.pago_registrado` | Finanzas | Contabilidad |
| `finanzas.estimacion_aprobada` | Finanzas | Contabilidad, Control de Obra |
| `control_obra.avance_fisico_validado` | Control de Obra | Contabilidad, EVM interno |
| `gerencia_tecnica.partida_bloqueada` | GT | Control de Obra (alerta), Compras |
| `gerencia_tecnica.transferencia_partida_aprobada` | GT | Compras (auto-desbloqueo) |
| `personal.nomina_autorizada` | Personal | Contabilidad (asiento MANO_OBRA) |
| `personal.nomina_pagada` | Personal | Contabilidad (asiento PAGO_NOMINA) |
| `ventas.cotizacion_aceptada` | Ventas | GT (vincula proyecto con contrato) |

---

## Cobertura Operativa del Sistema

### Ciclo de Abasto y Compras

| Indicador | Capacidad del sistema |
|-----------|----------------------|
| Proceso de requisición | Campo → Aprobación → Cotización → OC → Recepción → Pago (ciclo completo automatizado) |
| Control presupuestal por partida | Tope duro con bloqueo automático; escape con autorización de director registrada en bitácora |
| Órdenes de compra | Multi-proveedor por licitación; seguimiento EMITIDA → PARCIALMENTE_RECIBIDA → RECIBIDA |
| Cuadro comparativo | Evaluación técnica GT firmada y bloqueada; resolución con trazabilidad de decisión |
| Proveedores | Catálogo con calificación automática (puntualidad, calidad, precio) por historial de OCs |

### Control de Obra y Avance Físico

| Indicador | Capacidad del sistema |
|-----------|----------------------|
| Avance físico | Registro por concepto APU con % período + acumulado + evidencia fotográfica |
| Correlación costo-avance | EVM automático: PV, EV, AC, SPI y CPI calculados en tiempo real desde eventos |
| Alerta de atraso | Sistema detecta SPI < 0.9 y genera alerta ALTA automáticamente sin intervención manual |
| Estimaciones de avance | Generadas en Control de Obra, aprobadas en Finanzas, registradas en Contabilidad |
| Bitácora de obra | Libro digital con entradas cronológicas por tipo (entrega, incidente, visita, cambio) |

### Nómina y Personal

| Indicador | Capacidad del sistema |
|-----------|----------------------|
| Registro de asistencia | Por QR individual o carga masiva (bulk CSV) |
| Cálculo de prenómina | Automático por período con IMSS, ISR, faltas y deducciones configurables por trabajador |
| Ciclo nómina | BORRADOR → AUTORIZADA → PAGADA con reflejo contable automático en cada transición |
| Nómina complementaria | Bonos, finiquitos y liquidaciones fuera del ciclo regular |

### Calidad y Seguridad

| Indicador | Capacidad del sistema |
|-----------|----------------------|
| No conformidades | Flujo ISO 9001 completo: 5 estados, causa raíz, acciones correctivas con fecha límite y verificación |
| Hallazgos de auditoría | Conversión directa hallazgo → NC con trazabilidad bidireccional |
| Vencimiento de acciones | Badge automático VENCIDA + alerta en dashboard cuando se supera la fecha límite |
| Incidentes HSE | Registro con tipo, gravedad, investigación y acción preventiva |
| Permisos de trabajo | Flujo aprobación para trabajos de alto riesgo (altura, caliente, espacio confinado) |

### Finanzas y Contabilidad

| Indicador | Capacidad del sistema |
|-----------|----------------------|
| Presupuesto vs. gasto | Seguimiento en tiempo real con varianza y proyección de cierre |
| Asientos contables | Generación automática de partida doble desde 8 tipos de eventos operativos |
| Reportes financieros | Balanza de comprobación, Estado de Resultados, Balance General, Libro Diario |
| Trazabilidad de pago | OC → Recepción → Pago → Asiento contable — cadena completa auditable |

---

## Riesgos y Pendientes Críticos

1. **Ventas sin contenedor VPS** — los proyectos de obra no se vinculan automáticamente desde cotizaciones mientras Ventas no tenga su container.
2. **Tipos de datos pendientes de regenerar en GT y Control de Obra** — los modelos más recientes requieren un rebuild para quedar completamente tipados.
3. **Facturación electrónica (CFDI 4.0)** — sin esto, el ciclo de pagos y nómina no es fiscal.
4. **Pruebas E2E automatizadas** — los 60 tests son unitarios/integración por servicio; faltan tests cross-servicio vía RabbitMQ end-to-end.
