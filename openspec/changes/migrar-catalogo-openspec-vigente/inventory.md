# Inventario de migración de specs — 2026-09-25

Tarea 1.3 de `migrar-catalogo-openspec-vigente`. Línea base: `openspec validate --all --strict` sobre `main` (`31172f5`): 163 specs canónicas, 71 válidas y **92 inválidas**, todas por falta de `## Purpose`/`## Requirements`. Este documento no modifica ninguna spec.

## Método

Cada spec se clasificó midiendo su estructura real, no por su nombre. Para separar lo mecánico de lo manual se simuló la transformación estructural en una copia de trabajo **fuera del repositorio**, con un `Purpose` marcador, y se ejecutó `openspec validate --strict` sobre el resultado. Lo que valida tras la simulación no necesita intervención más allá del encabezado; lo demás se agrupa por la causa del fallo.

## Niveles de intervención

| Nivel | Qué requiere | Specs | Verificación del contrato |
|---|---|---:|---|
| T1 | Solo `## Purpose` (redactado a mano) y encabezado `## Requirements`. | 45 | Secuencia de palabras idéntica a `HEAD`, salvo el `Purpose` añadido. |
| T2 | T1 más unir líneas partidas para que la primera línea del requisito contenga `SHALL`/`MUST` (la palabra ya está en el cuerpo). | 7 | Igual que T1; el cambio adicional es solo espacio en blanco. |
| T3a | Ya existen bloques `### Requirement:` fuera de `## Requirements`; hay que reubicarlos bajo esa sección y conservar las demás secciones técnicas. | 11 | Comparación por bloque (requisito y escenarios) contra `HEAD`. |
| T3b | Prosa sin requisitos (criterios de aceptación, schema, endpoints, layout). Hay que **redactar** requisitos con `SHALL`/`MUST` y escenarios. | 29 | **No es mecánica**: cada requisito nuevo es una interpretación. Exige revisión funcional y trazabilidad línea a línea al texto original. |
| | **Total** | **92** | |

Los niveles T1 y T2 (52 specs) son migración estructural en el sentido de la decisión 1 del diseño. T3b (29 specs) no lo es: no debe presentarse como "migración mecánica" ni mezclarse con lotes T1/T2.

## Resumen por dominio

| # | Dominio | Specs | T1 | T2 | T3a | T3b | Complejidad alta |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Autenticación, sesión, usuarios, roles y tenant | 1 | 0 | 1 | 0 | 0 | 0 |
| 2 | Proyectos, navegación, dashboard y administración | 20 | 7 | 1 | 0 | 12 | 0 |
| 3 | Gerencia técnica y control presupuestal | 11 | 5 | 1 | 3 | 2 | 4 |
| 4 | Control de obra, residencia y avances | 4 | 2 | 0 | 1 | 1 | 2 |
| 5 | Compras, proveedores y órdenes de compra | 13 | 9 | 1 | 3 | 0 | 0 |
| 6 | Almacén e inventarios | 8 | 7 | 0 | 1 | 0 | 0 |
| 7 | Finanzas y contabilidad | 12 | 3 | 1 | 2 | 6 | 2 |
| 8 | Personal, nómina y asistencia | 12 | 8 | 0 | 0 | 4 | 0 |
| 9 | Seguridad, calidad, ventas y asistente | 5 | 1 | 0 | 1 | 3 | 1 |
| 10 | CI, despliegue, archivos e infraestructura transversal | 6 | 3 | 2 | 0 | 1 | 0 |
| | **Total** | **92** | **45** | **7** | **11** | **29** | **9** |

El dominio 1 contiene una sola de las 92 (`permisos-catalogo-gerencia-tecnica`). Las demás specs de autenticación, sesión y roles ya validan estructuralmente y solo tienen `Purpose` placeholder (ver la sección "Specs válidas con `Purpose` placeholder"), que es trabajo de la sección 4, no de la 3.

## Formatos actuales

| Formato | Specs |
|---|---:|
| Cabecera `## ADDED Requirements` (formato de delta) | 33 |
| `## Requirements` sin `Purpose` | 14 |
| Propósito + secciones técnicas (sin `## Requirements`) | 9 |
| Prosa: Schema/Endpoints/eventos | 6 |
| Prosa: UI Location/Layout/Behavior | 6 |
| Prosa: Interface/Logic | 6 |
| Prosa: Comportamiento esperado | 5 |
| Prosa: Criterios de Aceptación | 4 |
| Prosa: secciones CA-n | 4 |
| `## Propósito` + `## Requirements` | 4 |
| Requisitos sin secciones `##` | 1 |

## Detalle por dominio

Complejidad: **baja** = mecánica y menos de 80 líneas; **media** = mecánica de 80 o más líneas, o prosa/reubicación de menos de 60/150 líneas; **alta** = prosa de 60 o más líneas o reubicación de 150 o más.

### 1. Autenticación, sesión, usuarios, roles y tenant (1)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `permisos-catalogo-gerencia-tecnica` | Cabecera `## ADDED Requirements` (formato de delta) | T2 | 34 | 3/3 | baja |

### 2. Proyectos, navegación, dashboard y administración (20)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `dashboard-entrada-calidad` | Prosa: UI Location/Layout/Behavior | T3b | 31 | 0/0 | media |
| `dashboard-entrada-compras` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 27 | 1/4 | baja |
| `dashboard-entrada-control-obra` | Prosa: UI Location/Layout/Behavior | T3b | 36 | 0/0 | media |
| `dashboard-entrada-finanzas` | Prosa: UI Location/Layout/Behavior | T3b | 32 | 0/0 | media |
| `dashboard-entrada-gt` | Prosa: UI Location/Layout/Behavior | T3b | 32 | 0/0 | media |
| `dashboard-entrada-residentes` | Prosa: UI Location/Layout/Behavior | T3b | 30 | 0/0 | media |
| `dashboard-entrada-rrhh` | Prosa: UI Location/Layout/Behavior | T3b | 35 | 0/0 | media |
| `demo-mode-visibility` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 19 | 1/2 | baja |
| `endpoint-dashboard-calidad` | Prosa: Interface/Logic | T3b | 46 | 0/0 | media |
| `endpoint-dashboard-compras` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 65 | 1/9 | baja |
| `endpoint-dashboard-control-obra` | Prosa: Interface/Logic | T3b | 54 | 0/0 | media |
| `endpoint-dashboard-finanzas` | Prosa: Interface/Logic | T3b | 53 | 0/0 | media |
| `endpoint-dashboard-gt` | Prosa: Interface/Logic | T3b | 44 | 0/0 | media |
| `endpoint-dashboard-por-servicio` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 17 | 1/3 | baja |
| `endpoint-dashboard-residentes` | Prosa: Interface/Logic | T3b | 45 | 0/0 | media |
| `endpoint-dashboard-rrhh` | Prosa: Interface/Logic | T3b | 50 | 0/0 | media |
| `navegacion-multi-proyecto-compras` | `## Requirements` sin `Purpose` | T1 | 21 | 1/2 | baja |
| `patron-visual-dashboard` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 28 | 2/5 | baja |
| `regla-no-cross-service-frontend` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 20 | 2/3 | baja |
| `tabla-scroll-horizontal-affordance` | `## Requirements` sin `Purpose` | T2 | 43 | 2/5 | baja |

### 3. Gerencia técnica y control presupuestal (11)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `aislamiento-insumos-por-proyecto-gt` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 46 | 4/8 | baja |
| `cobertura-saldo-partida-limitado` | `## Propósito` + `## Requirements` | T2 | 31 | 1/2 | baja |
| `control-presupuestal-endpoint` | Propósito + secciones técnicas (sin `## Requirements`) | T3b | 120 | 0/7 | alta |
| `especificacion-tecnica-fuente-unica` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 57 | 3/7 | baja |
| `especificacion-tecnica-ofrecida-proveedor` | `## Requirements` sin `Purpose` | T1 | 45 | 2/5 | baja |
| `ficha-tecnica-carga-unica` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 32 | 2/3 | baja |
| `movimientos-partida-endpoint` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 57 | 2/7 | baja |
| `pre-req-gt` | Prosa: Comportamiento esperado | T3b | 58 | 0/0 | media |
| `presupuesto-tope-partida` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 240 | 5/11 | alta |
| `transferencia-entre-partidas` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 249 | 5/7 | alta |
| `trazabilidad-triangulo` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 204 | 6/6 | alta |

### 4. Control de obra, residencia y avances (4)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `avances-y-estimaciones` | `## Propósito` + `## Requirements` | T1 | 183 | 5/17 | media |
| `control-proyectos-modulo` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 463 | 7/15 | alta |
| `estimaciones-avance-fisico-residente` | `## Propósito` + `## Requirements` | T1 | 61 | 4/9 | baja |
| `residente-seleccion-insumos` | Prosa: Comportamiento esperado | T3b | 84 | 0/0 | alta |

### 5. Compras, proveedores y órdenes de compra (13)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `carga-masiva-proveedores` | `## Requirements` sin `Purpose` | T1 | 44 | 1/5 | baja |
| `ciclo-vida-oc` | Prosa: Comportamiento esperado | T3a | 57 | 3/7 | media |
| `envio-oc-proveedor` | `## Requirements` sin `Purpose` | T1 | 107 | 7/11 | media |
| `evaluacion-tecnica-por-especificacion` | `## Requirements` sin `Purpose` | T1 | 126 | 6/15 | media |
| `filtros-requisiciones-compras` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 45 | 2/6 | media |
| `multi-oc-generacion` | `## Requirements` sin `Purpose` | T1 | 110 | 7/18 | media |
| `panel-purga-datos-prueba-compras` | `## Requirements` sin `Purpose` | T1 | 138 | 9/15 | media |
| `presupuesto-resolucion-oc` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 43 | 3/8 | baja |
| `recepcion-oc` | Prosa: Comportamiento esperado | T3a | 70 | 4/11 | media |
| `seleccion-proveedor-recomendado-firma` | `## Requirements` sin `Purpose` | T2 | 78 | 5/9 | baja |
| `seleccion-proveedores-unificada` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 35 | 3/4 | baja |
| `validacion-longitud-proveedor` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 24 | 2/4 | baja |
| `validacion-stock-cotizacion-externa` | `## Requirements` sin `Purpose` | T1 | 80 | 5/10 | media |

### 6. Almacén e inventarios (8)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `activos-fijos-crud` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 42 | 4/7 | baja |
| `activos-fijos-traspasos` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 42 | 4/7 | baja |
| `almacen-dashboard` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 36 | 2/5 | baja |
| `almacen-eventos-oc` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 43 | 3/7 | baja |
| `almacen-frontend-raiz` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 50 | 4/9 | baja |
| `almacen-inventario` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 46 | 3/8 | baja |
| `almacen-movimientos` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 44 | 2/7 | baja |
| `salida-almacen-obra` | Prosa: Schema/Endpoints/eventos | T3a | 142 | 3/9 | media |

### 7. Finanzas y contabilidad (12)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `anticipo-proyecto` | Prosa: Schema/Endpoints/eventos | T3b | 42 | 0/0 | media |
| `cuentas-bancarias` | Prosa: Schema/Endpoints/eventos | T3b | 47 | 0/0 | media |
| `detalle-pago-concepto` | Prosa: Schema/Endpoints/eventos | T3b | 48 | 0/4 | media |
| `eventos-pago` | Prosa: Schema/Endpoints/eventos | T3b | 49 | 0/0 | media |
| `frontend-pagos` | Prosa: Comportamiento esperado | T3b | 64 | 0/0 | alta |
| `integracion-sat-externa` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 41 | 5/6 | baja |
| `nomina-a-contabilidad` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 131 | 5/7 | media |
| `oc-cierre-pago` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 101 | 4/8 | media |
| `pago-oc` | Prosa: Schema/Endpoints/eventos | T3b | 86 | 0/0 | alta |
| `periodicidad-pago-proyecto` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 84 | 6/16 | media |
| `presupuesto-mano-obra-proyecto` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 44 | 1/4 | baja |
| `resiliencia-eventos-contabilidad` | `## Propósito` + `## Requirements` | T2 | 44 | 1/3 | baja |

### 8. Personal, nómina y asistencia (12)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `asistencia-qr-backend` | Prosa: secciones CA-n | T3b | 37 | 0/0 | media |
| `asistencia-qr-segura` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 87 | 7/16 | media |
| `baja-reactivar-empleado` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 32 | 2/6 | baja |
| `calculo-nomina-por-horas` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 60 | 4/8 | baja |
| `carga-masiva-empleados` | `## Requirements` sin `Purpose` | T1 | 36 | 1/4 | baja |
| `complemento-salarial` | Prosa: secciones CA-n | T3b | 27 | 0/0 | media |
| `config-deducciones-empleado` | Prosa: secciones CA-n | T3b | 21 | 0/0 | media |
| `config-jornada-empleado` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 43 | 3/7 | baja |
| `expediente-empleado` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 106 | 8/20 | media |
| `motor-imss-isr` | Prosa: secciones CA-n | T3b | 41 | 0/0 | media |
| `qr-doble-scan` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 52 | 4/8 | baja |
| `registro-asistencia-por-horas` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 63 | 4/9 | baja |

### 9. Seguridad, calidad, ventas y asistente (5)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `carga-masiva-clientes` | `## Requirements` sin `Purpose` | T1 | 33 | 1/4 | baja |
| `control-versiones` | Prosa: Criterios de Aceptación | T3b | 49 | 0/0 | media |
| `dashboard-calidad` | Prosa: Criterios de Aceptación | T3b | 54 | 0/0 | media |
| `gestion-documentos` | Prosa: Criterios de Aceptación | T3b | 34 | 0/0 | media |
| `ventas-a-obra` | Propósito + secciones técnicas (sin `## Requirements`) | T3a | 169 | 5/8 | alta |

### 10. CI, despliegue, archivos e infraestructura transversal (6)

| Spec | Formato actual | Nivel | Líneas | Req./Esc. | Complejidad |
|---|---|---|---:|---:|---|
| `almacenamiento-archivos` | Prosa: Criterios de Aceptación | T3b | 40 | 0/0 | media |
| `carga-archivos-multer` | `## Requirements` sin `Purpose` | T2 | 50 | 3/6 | baja |
| `carga-masiva-archivos` | `## Requirements` sin `Purpose` | T1 | 26 | 1/3 | baja |
| `ci-playwright-smoke-post-deploy` | Requisitos sin secciones `##` | T1 | 41 | 3/8 | baja |
| `despliegue-completo-microservicios` | Cabecera `## ADDED Requirements` (formato de delta) | T2 | 160 | 8/18 | media |
| `http-security-headers` | Cabecera `## ADDED Requirements` (formato de delta) | T1 | 13 | 1/2 | baja |

## Specs válidas con `Purpose` placeholder (sección 4)

Treinta specs validan pero conservan `TBD - created by archiving change …` como propósito. No son parte de las 92; su `Purpose` se redacta en la sección 4 y cuenta para el criterio 4.11.

| # | Dominio | Specs |
|---:|---|---|
| 1 | Autenticación, sesión, usuarios, roles y tenant | `directorio-usuarios-por-rol`, `sesion-jwt-inactividad` |
| 2 | Proyectos, navegación, dashboard y administración | `auto-asignacion-acceso-proyecto`, `confirmacion-accion-critica-proyecto`, `confirmacion-proyecto-en-altas`, `contraste-modo-oscuro-ui-core`, `indicador-proyecto-activo`, `navegacion-teclado-catalogos`, `sidebar-submenu-flyout`, `tema-oscuro-controles-formulario`, `feedback-progreso-carga-masiva` |
| 4 | Control de obra, residencia y avances | `residencia-view-modularizacion-por-tab` |
| 5 | Compras, proveedores y órdenes de compra | `archivo-proveedores` |
| 8 | Personal, nómina y asistencia | `alta-individual-empleado`, `asignacion-frente-trabajo-ui`, `asignacion-residente-empleado`, `contacto-emergencia-empleado`, `control-acceso-autorizacion-nomina`, `control-acceso-gestion-personal`, `credencial-empleado`, `edicion-datos-empleado`, `gestion-cuadrillas-prenomina-ui` |
| 9 | Seguridad, calidad, ventas y asistente | `asistente-auditoria-consultas`, `asistente-conversacion-multi-servicio`, `asistente-degradacion-parcial-cross-servicio`, `progreso-en-vivo-chat-asistente`, `control-acceso-modulo-seguridad` |
| 10 | CI, despliegue, archivos e infraestructura transversal | `ci-app-shell-build-check`, `ci-rls-coverage-check`, `motor-archivos-exceljs` |

## Reglas de lote

1. Un PR por lote, exclusivamente documental, con validación estricta del lote y validación integral antes de abrirlo.
2. Nunca mezclar niveles T1/T2 con T3a/T3b en el mismo PR.
3. Tamaño máximo orientativo: 8 specs T1/T2, 4 specs T3a, 3 specs T3b.
4. Cada `Purpose` se redacta a mano a partir del texto de la propia spec y de su código; ninguno se genera ni se infiere sin revisión.
5. Cada PR adjunta la comparación contra `HEAD` (palabras para T1/T2, bloques para T3a, tabla de trazabilidad para T3b).
6. Tras cada lote se actualiza `validation-debt.md` y se recalcula el conteo restante.

## Orden propuesto

El orden de dominios sigue `validation-debt.md`, pero cada dominio se divide en lotes por nivel para mantener PR pequeños.

| Lote | Contenido | Nivel |
|---|---|---|
| 1 | Dominio 1 (1 spec) | T2 |
| 2 | Dominio 10, solo T1/T2 | T1/T2 |
| 3 | Dominio 3, solo T1/T2 | T1/T2 |
| 4 | Dominio 5, solo T1/T2 | T1/T2 |
| 5 | Dominio 8, solo T1/T2 | T1/T2 |
| 6 | Dominios 2, 4, 6, 7 y 9, solo T1/T2 (varios PR) | T1/T2 |
| 7 | Todas las T3a, por dominio | T3a |
| 8 | Todas las T3b, por dominio y formato | T3b |
