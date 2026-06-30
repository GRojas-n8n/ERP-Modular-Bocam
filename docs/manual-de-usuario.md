# Manual de Usuario — iRetum ERP
**Sistema:** iRetum ERP Modular  
**URL producción:** https://iretum.com  
**Proyecto activo:** CFE Carbonser (CIB2026033001)  
**Fecha:** 2026-06-29

---

## Acceso al Sistema

1. Ingresa a **https://iretum.com**
2. Introduce tu correo y contraseña
3. El sistema te dirige automáticamente a tu módulo según tu rol

**Contraseña inicial de todos los usuarios de prueba:** `Bocam2026!`

---

## Usuarios y Roles

| Usuario | Email | Módulo principal |
|---------|-------|-----------------|
| Administrador | admin@bocam.com | Acceso total |
| Director / Superintendente | director@bocam.com | Dashboard ejecutivo |
| Gerencia Técnica | gt@bocam.com | Insumos y presupuesto |
| Residente de Obra | residente@bocam.com | Requisiciones de campo |
| Compras | compras@bocam.com | OC, proveedores, cotizaciones |
| Finanzas | finanzas@bocam.com | Pagos y estimaciones |
| Control de Obra | control-obra@bocam.com | Avances y bitácora |
| RRHH / Personal | rrhh@bocam.com | Nómina y asistencia |
| Seguridad HSE | seguridad@bocam.com | Incidentes y permisos |
| Calidad | calidad@bocam.com | No conformidades y auditorías |

---

---

# MÓDULO 1 — GERENCIA TÉCNICA
**Usuario:** gt@bocam.com  
**Rol:** gerencia_tecnica  
**Vista:** Insumos / Presupuesto

---

## ¿Qué hace este módulo?

Gerencia Técnica es el cerebro técnico del proyecto. Aquí se carga el presupuesto de la obra (formato OPUS), se gestiona el catálogo de insumos (materiales, mano de obra, equipo), se crean los precios unitarios (APU) y se controla el saldo disponible por partida presupuestal.

## Secciones principales

### Tab "Insumos"
Catálogo maestro de materiales, mano de obra y equipos. Cada insumo tiene: clave, descripción, unidad, precio unitario y tipo.

**Columna Saldo:** muestra el estado presupuestal de cada partida:
- 🟢 **LIBRE** — Más del 20% disponible
- 🟡 **LIMITADO** — Entre 5% y 20% disponible
- 🔴 **BLOQUEADO** — Menos del 5% o saldo insuficiente para la siguiente requisición

Al hacer clic en una fila BLOQUEADA se abre un panel lateral con el desglose completo: monto aprobado, comprometido en OCs, ejercido (pagado) y disponible.

**Botón "Preparar Requisición →":** abre un panel para crear una requisición de campo directamente desde el catálogo de insumos, prellenando el insumo seleccionado.

### Tab "Presupuesto"
Muestra el presupuesto OPUS importado por proyecto. Partidas con sus montos aprobados, % de avance y saldo disponible.

**Importar presupuesto:** botón en la esquina superior derecha. Acepta el formato de exportación OPUS (.xml o .json según configuración).

### Tab "APU" (Análisis de Precios Unitarios)
Desglose de cada concepto del catálogo: materiales, mano de obra, equipo y herramienta, con sus rendimientos y costos.

### Tab "Comparativa" (evaluación de cotizaciones)
Vista donde GT evalúa los cuadros comparativos de cotizaciones enviados por Compras. Puede marcar cada ítem como:
- **C** (Cumple)
- **NC** (No Cumple)
- **DA** (Con Desviación Aceptable)
- **?** (Requiere Aclaración)

Al firmar la evaluación el cuadro queda BLOQUEADO (no editable).

### Tab "Saldos por Partida"
Tabla con todas las partidas del presupuesto y su estado de tope:
- Monto aprobado, comprometido (OCs emitidas), ejercido (pagado), disponible
- Botón **"Anular bloqueo"** (admin/director) para operar sobre tope con justificación registrada

### Dashboard GT
KPIs en tiempo real:
- Insumos activos en catálogo
- Presupuesto total del proyecto
- Partidas BLOQUEADAS (alerta)
- Proyectos sin presupuesto cargado
- Proyectos en ejecución con contrato vinculado
- Monto contratado total activo

## Ejemplo de uso

> **Situación:** Llegó un nuevo proyecto, necesitas cargar el presupuesto y el catálogo.

1. Inicia sesión como `gt@bocam.com`
2. Ve al tab **"Presupuesto"** → clic en **"Importar"** → sube el archivo OPUS
3. El sistema crea automáticamente la tabla de `SaldoPartida` con los montos aprobados
4. Ve al tab **"Insumos"** para verificar que el catálogo se haya importado
5. Revisa el tab **"Saldos"** para confirmar que todas las partidas aparecen en LIBRE

---

---

# MÓDULO 2 — RESIDENTE DE OBRA
**Usuario:** residente@bocam.com  
**Rol:** residencia  
**Vista:** ResidenciaView

---

## ¿Qué hace este módulo?

El residente de obra es quien está en campo. Desde aquí se crean las requisiciones de materiales (solicitando lo que se necesita para construir), se registran los avances físicos y se consulta la bitácora de obra.

## Secciones principales

### Tab "Requisiciones"
Lista de todas las requisiciones del proyecto con sus estados:
- **BORRADOR** — En preparación
- **PENDIENTE** — Enviada a compras, esperando aprobación
- **APROBADA** — Compras la aprobó y ya busca cotizaciones
- **PENDIENTE_TRANSFERENCIA** — El presupuesto de la partida está agotado; espera que GT apruebe una transferencia entre partidas
- **RECHAZADA** — Fue rechazada con comentarios

**Nueva Requisición:** formulario con:
- Partida presupuestal (seleccionada del catálogo APU)
- Lista de insumos con cantidad y unidad
- Fecha requerida
- Notas de campo

**Modo "Por Insumo":** permite agregar materiales directamente buscando en el catálogo de insumos, sin necesidad de seleccionar la partida primero.

### Tab "Avances"
Registro de avances físicos por concepto:
- % completado en el período
- Evidencia fotográfica (URL)
- Observaciones del residente

### Tab "Bitácora"
Registro cronológico de eventos de obra: entregas de materiales, incidentes, visitas de supervisión, cambios de condiciones.

## Ejemplo de uso

> **Situación:** Necesitas pedir varilla del 3/8" para el colado de columnas del eje B.

1. Inicia sesión como `residente@bocam.com`
2. Clic en **"Nueva Requisición"**
3. Selecciona la partida: **"Estructura — Concreto y Acero"**
4. Agrega el insumo: **"Varilla corrugada 3/8""**, cantidad: **500 kg**, unidad: **KG**
5. Fecha requerida: la semana próxima
6. Clic en **"Enviar a Compras"**
7. La requisición aparece en estado **PENDIENTE** y llega a la bandeja de Compras

---

---

# MÓDULO 3 — COMPRAS
**Usuario:** compras@bocam.com  
**Rol:** procurement  
**Vista:** ComprasView

---

## ¿Qué hace este módulo?

Compras gestiona todo el ciclo de adquisición: recibe las requisiciones del residente, solicita cotizaciones a proveedores, genera los cuadros comparativos, emite Órdenes de Compra y da seguimiento a la recepción de materiales.

## Secciones principales

### Tab "Requisiciones"
Bandeja de requisiciones recibidas del residente.

**Acciones disponibles:**
- **Aprobar** — pasa a estado APROBADA, se puede cotizar
- **Rechazar** — requiere comentario de motivo
- Visualizar con badge **"🔒 Esperando transferencia"** cuando la partida está agotada

### Tab "Cotizaciones"
Solicitudes de cotización enviadas a proveedores:
- Lista de ítems cotizados por cada proveedor
- Estado: PENDIENTE / RECIBIDA / VENCIDA

### Tab "Cuadros Comparativos"
El comparativo agrupa todas las cotizaciones recibidas para una misma requisición:

**Flujo en 4 pasos (stepper):**
1. **Datos** — información general del comparativo
2. **Cotizaciones** — captura de precios por proveedor (columnas)
3. **Evaluación GT** — Gerencia Técnica evalúa y firma (C/NC/DA/?)
4. **Resolución** — Compras elige al proveedor ganador y genera la OC

**Generar OC:** al seleccionar al proveedor ganador, el sistema valida automáticamente el saldo de la partida presupuestal. Si hay insuficiencia, muestra el modal de partidas bloqueadas con los montos faltantes.

### Tab "Órdenes de Compra"
Lista de OCs emitidas:
- **BORRADOR → EMITIDA → PARCIALMENTE_RECIBIDA → RECIBIDA → CANCELADA**
- OC multi-proveedor: una misma licitación puede generar OCs a diferentes proveedores, una por proveedor
- Al recibir la OC se actualiza automáticamente el inventario de Almacén

### Tab "Proveedores"
Catálogo de proveedores con:
- Datos fiscales, contacto, especialidad
- **Calificación automática** calculada desde las OCs: puntualidad, calidad, precio
- Badge de nivel: ⭐ Preferente / Aprobado / En evaluación / Suspendido

### Tab "Insumos" (catálogo)
Vista del catálogo de insumos de GT accesible desde Compras (proxy B2B — Compras consulta GT internamente, el frontend no hace llamadas cruzadas).

### Dashboard Compras
KPIs: requisiciones pendientes de aprobar, cotizaciones activas, OCs en proceso, alertas de cotizaciones vencidas.

## Ejemplo de uso

> **Situación:** Llegó una requisición de varilla. Hay 3 proveedores interesados.

1. Inicia sesión como `compras@bocam.com`
2. Tab **"Requisiciones"** → busca la req de varilla → clic **"Aprobar"**
3. Tab **"Cotizaciones"** → clic **"Nueva Solicitud de Cotización"** → selecciona los 3 proveedores → envía
4. Cuando lleguen las respuestas, ve a tab **"Cuadros Comparativos"** → clic **"Nuevo Comparativo"**
5. En paso 2 (Cotizaciones) captura los precios de cada proveedor
6. En paso 3 (Evaluación) notifica a GT que firme
7. Cuando GT firme, en paso 4 (Resolución) selecciona al proveedor más conveniente
8. Clic **"Generar OC"** → aparece la OC en tab **"Órdenes de Compra"** con estado EMITIDA

---

---

# MÓDULO 4 — ALMACÉN
**Usuario:** (admin o compras pueden gestionar)  
**Vista:** AlmacenView

---

## ¿Qué hace este módulo?

Control del inventario físico en obra: entradas de materiales desde OCs recibidas, salidas a frentes de trabajo, kardex y alertas de stock mínimo.

## Secciones principales

### Tab "Inventario"
Lista de todos los materiales en existencia:
- Clave y descripción del insumo
- Stock actual vs. stock mínimo
- Badge de alerta: 🔴 Bajo stock / ⚠️ Stock crítico

### Tab "Entradas"
Registro de materiales que llegan a obra:
- Vinculadas a una OC específica
- Al registrar la entrada, la OC pasa a PARCIALMENTE_RECIBIDA o RECIBIDA automáticamente
- Se genera el evento `compras.oc_recibida_total` cuando la OC queda completamente surtida

### Tab "Salidas"
Salidas de material a frentes de trabajo:
- Se registra: insumo, cantidad, frente de trabajo, concepto APU al que aplica
- Al salir material relacionado a un APU, el sistema puede correlacionarlo con el avance de Control de Obra

### Tab "Kardex"
Historial completo de movimientos de cada insumo: entradas, salidas, ajustes, con saldo después de cada movimiento.

## Ejemplo de uso

> **Situación:** Llegaron las 500 kg de varilla de la OC. Hay que recibirlas.

1. Ve a **AlmacenView** → tab **"Entradas"**
2. Clic **"Registrar Entrada"** → selecciona la OC correspondiente
3. Captura: cantidad recibida (500 kg), fecha, condición (Bueno/Con observaciones)
4. El sistema actualiza automáticamente el inventario
5. La OC pasa a estado RECIBIDA en el módulo de Compras
6. Contabilidad recibe el evento y registra el asiento de egreso

---

---

# MÓDULO 5 — FINANZAS
**Usuario:** finanzas@bocam.com  
**Rol:** finance  
**Vista:** FinanzasView

---

## ¿Qué hace este módulo?

Finanzas controla el presupuesto financiero del proyecto (diferente al presupuesto técnico de GT): flujo de pagos, estimaciones de avance, asignación presupuestal y control de gastos vs. presupuesto.

## Secciones principales

### Tab "Presupuesto"
El presupuesto financiero asignado al proyecto. Diferente al presupuesto OPUS de GT: aquí se habla del monto total autorizado por el cliente para pagar la obra.

**Crear presupuesto:** monto total, fecha inicio/fin, descripción.

### Tab "Estimaciones"
Estimaciones de avance aprobadas para cobro al cliente:
- Período (quincenal/mensual)
- % de avance físico validado
- Monto a cobrar
- Estado: BORRADOR → ENVIADA → APROBADA → PAGADA

**Aprobar estimación:** activa el evento `finanzas.estimacion_aprobada` → Contabilidad registra el asiento de ingreso.

### Tab "Pagos"
Pagos registrados a proveedores y subcontratistas:
- Vinculados a una OC o estimación
- Estado: PENDIENTE → PROCESADO → RECHAZADO
- Al procesar un pago se publica `finanzas.pago_registrado` → Contabilidad registra el egreso

### Tab "Control de Obra"
Vista consolidada del flujo presupuestal:
- Presupuesto total vs. gasto acumulado
- Varianza (positiva o negativa)
- Proyección de cierre

### Dashboard Finanzas
KPIs: pagos pendientes, estimaciones por aprobar, saldo presupuestal, alerta de sobreejercicio.

## Ejemplo de uso

> **Situación:** El cliente aprobó la estimación 3 del mes. Hay que registrar el pago de la varilla al proveedor.

1. Inicia sesión como `finanzas@bocam.com`
2. Tab **"Estimaciones"** → busca la Estimación 3 → clic **"Aprobar"**
3. El sistema registra el ingreso en Contabilidad automáticamente
4. Tab **"Pagos"** → clic **"Registrar Pago"** → selecciona la OC de varilla → captura monto y fecha
5. Clic **"Procesar"** → el sistema registra el egreso en Contabilidad

---

---

# MÓDULO 6 — CONTROL DE OBRA
**Usuario:** control-obra@bocam.com  
**Rol:** control_obra  
**Vista:** ControlObraView

---

## ¿Qué hace este módulo?

Seguimiento detallado del avance físico de la obra por concepto del APU. Bitácora de campo, estimaciones de avance y registro de materiales consumidos.

## Secciones principales

### Tab "Avances"
Registro de avance físico por partida/concepto:
- % completado en el período actual
- Acumulado histórico
- Evidencia (foto URL)
- Al validar un avance se publica `control_obra.avance_fisico_validado` → Control Proyectos actualiza EVM

### Tab "Bitácora"
Libro de obra digital con entradas cronológicas:
- Fecha, autor, descripción del evento
- Tipo: entrega, incidente, visita, cambio, otro

### Tab "Estimaciones"
Estimaciones de avance para pago, alineadas con Finanzas.

### Tab "Materiales"
Consumo de materiales por frente de trabajo, vinculado con salidas de Almacén.

## Ejemplo de uso

> **Situación:** Se coló el eje B con las columnas. Hay que reportar el 35% de avance en "Estructura — Concreto".

1. Inicia sesión como `control-obra@bocam.com`
2. Tab **"Avances"** → clic **"Nuevo Avance"**
3. Selecciona partida: **"Estructura — Concreto y Acero"**, concepto: **"Columnas eje B"**
4. Captura: % avance = 35, período = junio 2026, observaciones, URL de foto
5. Clic **"Validar"** → el avance queda registrado
6. Control Proyectos actualiza automáticamente el EVM del proyecto

---

---

# MÓDULO 7 — PERSONAL / RRHH
**Usuario:** rrhh@bocam.com  
**Rol:** personal_rh  
**Vista:** PersonalView

---

## ¿Qué hace este módulo?

Gestión de la plantilla de trabajadores en obra: altas, asistencia por QR, prenómina, autorización de pago y complementos salariales.

## Secciones principales

### Tab "Empleados"
Catálogo de trabajadores activos:
- Datos personales, IMSS, RFC, puesto, categoría
- Estado: ACTIVO / BAJA / SUSPENDIDO
- Jornada: POR_HORAS / TIEMPO_COMPLETO / DESTAJO

### Tab "Asistencia"
Registro de entradas/salidas por QR:
- Cada trabajador tiene su código QR único
- Importación masiva de asistencias (bulk upload)
- Vista de faltas y retardos por período

### Tab "Prenóminas"
Cálculo de nómina por período:
- Percepciones: salario, horas extra, bonos, complementos
- Deducciones: IMSS, ISR, préstamos, faltas
- Estado: BORRADOR → AUTORIZADA → PAGADA

**Autorizar prenómina:** publica el evento `personal.nomina_autorizada` → Contabilidad registra asiento de nómina (Mano de Obra: cargo 5100, abono 2200).

**Pagar prenómina:** publica `personal.nomina_pagada` → Contabilidad registra el pago (cargo 2200, abono 1100 Banco).

### Tab "Nómina Complementaria"
Pagos extraordinarios fuera del ciclo regular: bonos, finiquitos, liquidaciones.

### Dashboard Personal
KPIs: empleados activos, asistencia del día, prenóminas pendientes de autorizar, costo nómina del período.

## Ejemplo de uso

> **Situación:** Fin de quincena. Hay que correr la nómina de 45 trabajadores.

1. Inicia sesión como `rrhh@bocam.com`
2. Tab **"Prenóminas"** → clic **"Nueva Prenómina"** → tipo: QUINCENAL, período: 16-30 junio 2026
3. El sistema calcula automáticamente con base en asistencias y tabulador
4. Revisa el desglose por empleado; ajusta si hay observaciones
5. Clic **"Autorizar"** → nómina queda en estado AUTORIZADA
6. Contabilidad registra automáticamente el asiento de nómina
7. Cuando se dispersa el pago (transferencia bancaria), clic **"Registrar Pago"**
8. Contabilidad registra el egreso bancario

---

---

# MÓDULO 8 — CALIDAD ISO 9001
**Usuario:** calidad@bocam.com  
**Rol:** calidad  
**Vista:** CalidadView

---

## ¿Qué hace este módulo?

Sistema de gestión de calidad ISO 9001:2015: registro y seguimiento de No Conformidades, auditorías internas, hallazgos y acciones correctivas con flujo completo de verificación.

## Secciones principales

### Tab "No Conformidades"
Lista de NCs con sus estados:
- **ABIERTA** → **EN_ANALISIS** → **ACCION_CORRECTIVA** → **EN_VERIFICACION** → **CERRADA**
- Una NC puede reabrirse (solo admin) si la acción correctiva no fue efectiva

**Detalle de NC:**
- Descripción, fuente (AUDITORIA / INSPECCIÓN / CLIENTE / PROPIA)
- Causa raíz editable
- Lista de acciones correctivas: descripción, responsable, fecha límite, estado (PENDIENTE → EN_PROCESO → VERIFICADA → INEFECTIVA)
- Botones de transición de estado con tooltip que explica la precondición
- Badge **VENCIDA** en rojo cuando la fecha límite pasó sin cierre

### Tab "Auditorías"
Auditorías programadas con sus hallazgos:
- **PROGRAMADA** → **EN_CURSO** → **COMPLETADA** (o CANCELADA)
- Botones: **"Iniciar"** / **"Completar"** / **"Cancelar"** (solo admin)

**Hallazgos por auditoría:**
- Estado: ABIERTO / EN_SEGUIMIENTO / CERRADO
- Tipo: MAYOR / MENOR / OBSERVACION / OFI
- Botón **"→ Crear NC"**: convierte el hallazgo en una No Conformidad formal (idempotente — solo crea una NC por hallazgo)
- Badge **"NC vinculada"** cuando ya tiene NC asociada

### Tab "Acciones Correctivas"
Vista transversal de todas las acciones correctivas del proyecto, con filtros por estado y responsable.

### Dashboard Calidad
KPIs:
- NCs abiertas / en análisis / vencidas
- Acciones correctivas vencidas (alerta roja)
- Hallazgos mayores sin NC creada (alerta naranja)
- Auditorías en curso / programadas

## Ejemplo de uso

> **Situación:** En inspección de concreto se detectó segregación en columnas. Hay que levantar una NC.

1. Inicia sesión como `calidad@bocam.com`
2. Tab **"No Conformidades"** → clic **"Nueva NC"**
3. Descripción: "Segregación detectada en columnas eje B, colado 2026-06-15"
4. Fuente: INSPECCIÓN, clasificación: MAYOR
5. Clic **"Guardar"** → NC queda en estado ABIERTA
6. Clic **"→ EN_ANALISIS"** → asigna responsable de análisis de causa raíz
7. Edita el campo **"Causa raíz"**: "Relación agua/cemento incorrecta en dosificación"
8. Clic **"→ ACCION_CORRECTIVA"** → agrega acciones: (1) Demoler y recolar, responsable: Residente, fecha límite: 2026-07-15
9. Una vez ejecutada la acción: clic en la acción → estado VERIFICADA
10. Clic **"→ EN_VERIFICACION"** → supervisor valida en campo
11. Clic **"→ CERRADA"** → NC queda cerrada con evidencia

---

---

# MÓDULO 9 — SEGURIDAD HSE
**Usuario:** seguridad@bocam.com  
**Rol:** seguridad_hse  
**Vista:** SeguridadView

---

## ¿Qué hace este módulo?

Gestión de seguridad, higiene y medio ambiente en obra: registro de incidentes, inspecciones de seguridad, permisos de trabajo de alto riesgo y capacitaciones.

## Secciones principales

### Tab "Incidentes"
Registro de accidentes, casi-accidentes y observaciones de seguridad:
- Tipo: ACCIDENTE / CASI_ACCIDENTE / OBSERVACION / CONDICION_INSEGURA
- Gravedad: LEVE / MODERADO / GRAVE / FATAL
- Investigación y acciones preventivas

### Tab "Inspecciones"
Listas de verificación de seguridad periódicas:
- Por área: andamios, equipos eléctricos, EPP, orden y limpieza
- Estado: PROGRAMADA / EN_CURSO / COMPLETADA
- Hallazgos con seguimiento

### Tab "Permisos de Trabajo"
Permisos para trabajos de alto riesgo:
- Tipos: en altura, en caliente, en espacios confinados, con energía eléctrica
- Flujo: SOLICITADO → APROBADO → EN_EJECUCION → CERRADO
- Validez: fecha y hora de inicio/fin

### Tab "Capacitaciones"
Registro de pláticas y cursos de seguridad:
- Asistentes, tema, instructor, duración
- Constancias

## Ejemplo de uso

> **Situación:** Hay un trabajador que tropezó y se torció el tobillo. Hay que reportarlo.

1. Inicia sesión como `seguridad@bocam.com`
2. Tab **"Incidentes"** → clic **"Nuevo Incidente"**
3. Tipo: ACCIDENTE, gravedad: LEVE
4. Descripción: "Trabajador Juan López tropieza con material mal almacenado en área de castillos, resultando en esguince de tobillo derecho"
5. Trabajador involucrado, fecha/hora: 2026-06-29 10:30
6. Acciones inmediatas: atención médica, señalización del área
7. Acción preventiva: reordenamiento de materiales, plática de orden y limpieza

---

---

# MÓDULO 10 — CONTABILIDAD
**Usuario:** (admin / finanzas tienen acceso)  
**Vista:** ContabilidadView

---

## ¿Qué hace este módulo?

Contabilidad automática de partida doble. La mayoría de los asientos se generan automáticamente desde los eventos del sistema. El contador puede revisar, conciliar y generar reportes.

## Secciones principales

### Tab "Pólizas"
Lista de todos los asientos contables generados:
- Automáticos: desde OC, pago, estimación, avance, nómina
- Manual: si el contador necesita un asiento de ajuste

Al expandir una póliza se ven los movimientos de partida doble (cargo/abono, cuenta, monto).

**Tipos de póliza automáticos:**
| Evento | Tipo | Cargo | Abono |
|--------|------|-------|-------|
| OC creada | PASIVO_PROYECTADO | 6100 (Gastos) | 2100 (CxP) |
| OC cancelada | REVERSION | 2100 | 6100 |
| OC recibida / pago registrado | EGRESO | 2100 | 1100 (Banco) |
| Estimación aprobada | ESTIMACION | 1200 (CxC) | 4100 (Ingresos) |
| Avance físico validado | AVANCE | 5100 (Costos) | 2100 |
| Nómina autorizada | MANO_OBRA | 5100 | 2200 (Nómina por Pagar) |
| Nómina pagada | PAGO_NOMINA | 2200 | 1100 (Banco) |
| Transferencia entre partidas | TRANSFERENCIA_INTERNA | Partida destino | Partida origen |

### Tab "Conciliación"
Revisión de asientos por período: cuadre de cargos y abonos, diferencias.

### Tab "Reportes"
Reportes financieros generados automáticamente:
- **Balanza de Comprobación:** saldos de todas las cuentas
- **Estado de Resultados:** ingresos vs. egresos del período
- **Balance General:** activos, pasivos y capital
- **Libro Diario:** historial cronológico de todos los movimientos

## Ejemplo de uso

> **Situación:** El director quiere ver cuánto gastamos en obra en junio.

1. Ve a **ContabilidadView** → tab **"Reportes"**
2. Selecciona **"Estado de Resultados"**, período: junio 2026
3. El reporte muestra: ingresos (estimaciones cobradas) vs. egresos (pagos, nómina, materiales)
4. Para ver el detalle de cada asiento: tab **"Pólizas"** → filtra por mes

---

---

# MÓDULO 11 — CONTROL DE PROYECTOS (EVM)
**Usuario:** director@bocam.com / admin  
**Vista:** ControlProyectosView

---

## ¿Qué hace este módulo?

Módulo analítico de seguimiento de proyectos. NO bloquea operaciones: solo analiza, alerta y proyecta. Usa la metodología EVM (Earned Value Management / Valor Ganado) para medir el desempeño del proyecto.

## Secciones principales

### Tab "Dashboard"
Semáforo global del proyecto:
- 🟢 / 🟡 / 🔴 según SPI (Schedule Performance Index) y CPI (Cost Performance Index)
- Top alertas activas del proyecto
- Partidas con atraso

**SPI < 0.9:** el proyecto va atrasado  
**CPI < 0.9:** el proyecto va por encima del presupuesto  

### Tab "EVM"
Tabla detallada de EVM por partida:
- **PV** (Planned Value / Valor Planeado): lo que debería estar avanzado según programación
- **EV** (Earned Value / Valor Ganado): lo que realmente avanzó según avances físicos
- **AC** (Actual Cost / Costo Real): lo que se ha pagado realmente
- **SPI** = EV/PV (>1 adelantado, <1 atrasado)
- **CPI** = EV/AC (>1 bajo costo, <1 sobre costo)

*Nota: SPI requiere que se haya cargado la programación de obra en el tab "Programación". Sin programación, el sistema reporta SIN_PROGRAMACION.*

### Tab "Curva S"
Gráfica de avance acumulado planeado vs. real:
- Eje X: tiempo (semanas/meses)
- Eje Y: % de avance acumulado
- Línea azul: planeado (Curva S)
- Línea verde: real (desde avances validados)

### Tab "Alertas"
Alertas automáticas generadas por el sistema:
- **PARTIDA_BLOQUEADA** (CRÍTICA) — partida presupuestal agotada
- **RETRASO_CRONOGRAMA** (ALTA) — SPI < 0.8 por 2+ períodos consecutivos
- **SOBRECOSTO** (ALTA) — CPI < 0.85
- **SIN_AVANCE** (MEDIA) — partida sin reporte de avance en 2+ semanas
- **PROYECCION_REBASE** (ALTA) — la proyección de cierre supera el presupuesto

**Acciones en alertas:**
- **"Reconocer"** — el usuario vio la alerta y está atendiendo
- **"Ignorar"** — se descarta (requiere justificación)

### Tab "Programación"
Carga de la programación de obra (Gantt por partida):
- Fecha inicio y fin por partida
- Distribución de avance por período (debe sumar 100%)
- Al cargarla, el sistema puede calcular SPI y trazar la Curva S

## Ejemplo de uso

> **Situación:** El director quiere saber cómo va el proyecto a mitad de junio.

1. Inicia sesión como `director@bocam.com`
2. Ve a **ControlProyectosView** → tab **"Dashboard"**
3. Verifica el semáforo global: SPI = 0.87 🟡 (ligero atraso), CPI = 0.95 🟡 (ligeramente sobre costo)
4. Tab **"Alertas"** → hay una alerta CRÍTICA: partida "Acabados" está BLOQUEADA
5. Comunica a GT para hacer una transferencia entre partidas
6. Tab **"EVM"** → revisa qué partidas jalan el indicador hacia abajo

---

---

# MÓDULO 12 — ADMINISTRACIÓN
**Usuario:** admin@bocam.com  
**Rol:** admin  
**Vista:** AdminView

---

## ¿Qué hace este módulo?

Panel de administración del sistema: gestión de usuarios, roles, tenants y proyectos.

## Secciones principales

### Tab "Usuarios"
Lista de todos los usuarios del tenant:
- Crear usuario: email, nombre, contraseña inicial, rol
- Cambiar rol o estado (activo/suspendido)
- Reset de contraseña

### Tab "Proyectos"
Proyectos activos del tenant:
- Crear nuevo proyecto: código, nombre, descripción, fechas
- Asignar proyecto a usuarios
- Activar/desactivar proyectos

### Tab "Tenants" (solo super-admin)
Gestión multi-empresa: crear nuevos clientes, configurar sus parámetros.

## Ejemplo de uso

> **Situación:** Entró un nuevo residente al proyecto. Hay que darle acceso.

1. Inicia sesión como `admin@bocam.com`
2. Tab **"Usuarios"** → clic **"Nuevo Usuario"**
3. Email: `nuevo.residente@bocam.com`, nombre, rol: `residencia`
4. Contraseña temporal, marca "cambiar al primer login"
5. El usuario recibe sus credenciales y puede ingresar al sistema

---

---

## Notas Generales

- **Todos los módulos tienen un asistente IA** accesible desde el botón 🤖 en la esquina superior derecha. Puedes hacer preguntas en lenguaje natural sobre el módulo actual.
- **El sistema trabaja en tiempo real** via eventos RabbitMQ — una acción en Compras actualiza automáticamente Almacén, Contabilidad y Control de Proyectos sin recargar páginas.
- **Los datos son por tenant y por proyecto** — cada empresa y cada proyecto son completamente independientes.
- **El modo oscuro** se puede activar desde el header del sistema.
