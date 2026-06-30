# Ejercicios de Prueba en Producción — iRetum ERP
**URL:** https://iretum.com  
**Tenant:** Bocam  
**Proyecto:** CFE Carbonser (CIB2026033001)  
**Contraseña todos los usuarios:** `Bocam2026!`  
**Fecha:** 2026-06-29

---

## Cómo usar este documento

Cada ejercicio indica:
- **Usuario** — quién ejecuta la acción
- **Módulo** — dónde se hace
- **Pasos** — instrucciones exactas
- **Resultado esperado** — qué debe pasar
- **Qué valida** — la funcionalidad que se está probando

Ejecuta los ejercicios **en el orden presentado** dentro de cada sección, ya que algunos dependen del resultado del anterior.

---

---

# BLOQUE A — CICLO CENTRAL DE OBRA (E2E)

Este bloque prueba el flujo completo desde presupuesto hasta pago. Hacerlo completo valida la integración entre 7 módulos.

---

## A.1 — Cargar presupuesto e insumos
**Usuario:** gt@bocam.com  
**Módulo:** Gerencia Técnica (InsumosView)

**Pasos:**
1. Ingresa como `gt@bocam.com`
2. Ve al tab **"Insumos"**
3. Clic en **"+ Nuevo Insumo"**
4. Agrega: Clave: `VAR-38`, Descripción: `Varilla corrugada 3/8"`, Unidad: `KG`, Precio unitario: `22.50`, Tipo: `MATERIAL`
5. Clic en **"Guardar"**
6. Ve al tab **"Presupuesto"** — confirma que hay un presupuesto activo
7. Ve al tab **"Saldos"** — observa el estado de las partidas

**Resultado esperado:** El insumo aparece en el catálogo. El tab Saldos muestra partidas en LIBRE.

**Qué valida:** CRUD de insumos, visualización de saldos presupuestales.

---

## A.2 — Crear requisición desde campo
**Usuario:** residente@bocam.com  
**Módulo:** ResidenciaView

**Pasos:**
1. Ingresa como `residente@bocam.com`
2. Ve a **"Requisiciones"** → clic **"Nueva Requisición"**
3. Selecciona una partida del catálogo
4. Agrega el insumo `VAR-38`, cantidad: `200`, unidad: `KG`
5. Fecha requerida: la semana próxima
6. Notas: "Para colado de trabes eje A"
7. Clic **"Enviar a Compras"**

**Resultado esperado:** La requisición aparece en estado **PENDIENTE** en la lista.

**Qué valida:** Creación de requisiciones por el residente, gate presupuestal (si la partida tiene saldo).

---

## A.3 — Aprobar requisición en Compras
**Usuario:** compras@bocam.com  
**Módulo:** ComprasView

**Pasos:**
1. Ingresa como `compras@bocam.com`
2. Tab **"Requisiciones"** — busca la requisición de varilla del residente
3. Observa el badge de estado: **PENDIENTE**
4. Clic en la requisición → clic **"Aprobar"**
5. Confirma que cambia a estado **APROBADA**

**Resultado esperado:** La requisición ahora está APROBADA y lista para cotizar.

**Qué valida:** Flujo de aprobación de compras.

---

## A.4 — Crear cotización y cuadro comparativo
**Usuario:** compras@bocam.com  
**Módulo:** ComprasView

**Pasos:**
1. En ComprasView → tab **"Cuadros Comparativos"** → clic **"Nuevo Comparativo"**
2. **Paso 1 (Datos):** asocia la requisición de varilla, agrega descripción
3. **Paso 2 (Cotizaciones):** agrega 2 proveedores ficticios con sus precios:
   - Proveedor A: `21.00/kg` por 200 kg = `$4,200`
   - Proveedor B: `22.00/kg` por 200 kg = `$4,400`
4. Clic **"Guardar Cotizaciones"** → avanza al **Paso 3 (Evaluación GT)**

**Resultado esperado:** El comparativo queda en espera de evaluación de Gerencia Técnica.

**Qué valida:** Creación de cuadros comparativos multi-proveedor.

---

## A.5 — Evaluar y firmar comparativo (GT)
**Usuario:** gt@bocam.com  
**Módulo:** InsumosView → tab "Comparativa"

**Pasos:**
1. Ingresa como `gt@bocam.com`
2. Tab **"Comparativa"** → abre el cuadro pendiente de evaluación
3. Para el ítem de varilla:
   - Proveedor A: marca **C** (Cumple)
   - Proveedor B: marca **C** (Cumple)
4. Observación técnica: "Proveedor A tiene mejor precio unitario"
5. Clic **"Firmar Evaluación"**

**Resultado esperado:** El cuadro queda en estado FIRMADO (bloqueado para edición).

**Qué valida:** Flujo de evaluación técnica por GT, firma y bloqueo.

---

## A.6 — Generar Orden de Compra
**Usuario:** compras@bocam.com  
**Módulo:** ComprasView

**Pasos:**
1. Abre el comparativo firmado → **Paso 4 (Resolución)**
2. Selecciona **Proveedor A** como ganador
3. Clic **"Generar OC"**
4. El sistema valida saldo de la partida — si hay saldo suficiente procede
5. Confirma en tab **"Órdenes de Compra"** → OC con estado **EMITIDA**

**Resultado esperado:** OC creada. En Contabilidad se genera automáticamente el asiento PASIVO_PROYECTADO (cargo 6100, abono 2100).

**Qué valida:** Generación de OC, gate presupuestal, evento `compras.oc_creada` → Contabilidad.

---

## A.7 — Recibir materiales en almacén
**Usuario:** admin@bocam.com o compras@bocam.com  
**Módulo:** AlmacenView

**Pasos:**
1. Ingresa al módulo **Almacén**
2. Tab **"Entradas"** → clic **"Registrar Entrada"**
3. Selecciona la OC de varilla → cantidad recibida: `200 kg`, condición: `Bueno`
4. Fecha de recepción: hoy
5. Clic **"Registrar"**

**Resultado esperado:**
- El inventario de `VAR-38` aumenta en 200 kg
- La OC pasa a estado **RECIBIDA** en Compras
- En Contabilidad se genera asiento EGRESO (cargo 2100, abono 1100)
- El saldo comprometido en la partida de GT se ajusta a ejercido

**Qué valida:** Recepción de materiales, evento `oc_recibida_total`, integración Almacén→Contabilidad.

---

## A.8 — Registrar avance físico
**Usuario:** control-obra@bocam.com  
**Módulo:** ControlObraView

**Pasos:**
1. Ingresa como `control-obra@bocam.com`
2. Tab **"Avances"** → clic **"Nuevo Avance"**
3. Selecciona la partida de trabes/estructura
4. % de avance: `25`, período: junio 2026
5. Observaciones: "Trabes eje A coladas al 25%"
6. Clic **"Validar Avance"**

**Resultado esperado:** El avance queda registrado. Control de Proyectos actualiza el EVM.

**Qué valida:** Registro de avances, evento `avance_fisico_validado` → Control Proyectos.

---

## A.9 — Registrar pago al proveedor
**Usuario:** finanzas@bocam.com  
**Módulo:** FinanzasView

**Pasos:**
1. Ingresa como `finanzas@bocam.com`
2. Tab **"Pagos"** → clic **"Registrar Pago"**
3. Vincula a la OC de varilla, monto: `$4,200`, cuenta bancaria: la disponible
4. Clic **"Procesar Pago"**

**Resultado esperado:** El pago queda registrado. En Contabilidad se genera el asiento de egreso bancario.

**Qué valida:** Registro de pagos, evento `pago_registrado` → Contabilidad.

---

## A.10 — Verificar asientos en Contabilidad
**Usuario:** admin@bocam.com  
**Módulo:** ContabilidadView

**Pasos:**
1. Ingresa como `admin@bocam.com`
2. Ve a **ContabilidadView** → tab **"Pólizas"**
3. Filtra por el período actual (junio 2026)
4. Debes ver:
   - Una póliza **PASIVO_PROYECTADO** (OC creada) — cargo 6100, abono 2100
   - Una póliza **EGRESO** (OC recibida/pago) — cargo 2100, abono 1100
5. Expande cada póliza para ver los movimientos de partida doble
6. Tab **"Reportes"** → genera **"Estado de Resultados"** para junio 2026

**Resultado esperado:** Los asientos están cuadrados (cargos = abonos). El Estado de Resultados muestra el gasto del período.

**Qué valida:** Integración contable automática, reportes financieros.

---

---

# BLOQUE B — NÓMINA

---

## B.1 — Alta de empleado
**Usuario:** rrhh@bocam.com  
**Módulo:** PersonalView

**Pasos:**
1. Ingresa como `rrhh@bocam.com`
2. Tab **"Empleados"** → clic **"+ Nuevo Empleado"**
3. Datos: Nombre: `Carlos Reyes`, Puesto: `Maestro de obra`, Jornada: `TIEMPO_COMPLETO`, Salario diario: `650`
4. IMSS, RFC (ficticios para prueba)
5. Guardar

**Resultado esperado:** Empleado aparece en la lista con estado ACTIVO.

---

## B.2 — Registrar asistencias
**Usuario:** rrhh@bocam.com  
**Módulo:** PersonalView

**Pasos:**
1. Tab **"Asistencia"** → clic **"Registrar Asistencia"**
2. Selecciona a Carlos Reyes, fecha: hoy, entrada: 07:00, salida: 17:00
3. Guarda
4. Opción alternativa: usa **"Bulk Upload"** con un CSV de asistencias de varios trabajadores

---

## B.3 — Calcular y autorizar prenómina
**Usuario:** rrhh@bocam.com  
**Módulo:** PersonalView

**Pasos:**
1. Tab **"Prenóminas"** → clic **"Nueva Prenómina"**
2. Tipo: QUINCENAL, período: 16-30 junio 2026
3. Clic **"Calcular"** — el sistema toma las asistencias del período
4. Revisa el desglose de Carlos Reyes: 15 días × $650 = $9,750 percepciones brutas
5. Clic **"Autorizar"**

**Resultado esperado:** La prenómina pasa a estado AUTORIZADA. En Contabilidad se genera automáticamente el asiento de nómina (cargo 5100 — Mano de Obra, abono 2200 — Nómina por Pagar).

**Qué valida:** Cálculo de nómina, autorización, evento `nomina_autorizada` → Contabilidad.

---

## B.4 — Registrar pago de nómina
**Usuario:** rrhh@bocam.com  
**Módulo:** PersonalView

**Pasos:**
1. Tab **"Prenóminas"** → abre la prenómina AUTORIZADA
2. Clic **"Registrar Pago"** (indica que ya se dispersó el dinero vía transferencia bancaria)

**Resultado esperado:** La prenómina pasa a PAGADA. En Contabilidad se genera asiento PAGO_NOMINA (cargo 2200 — Nómina por Pagar, abono 1100 — Banco).

**Qué valida:** Ciclo completo de nómina y su reflejo contable automático.

---

---

# BLOQUE C — CALIDAD ISO 9001

---

## C.1 — Registrar No Conformidad
**Usuario:** calidad@bocam.com  
**Módulo:** CalidadView

**Pasos:**
1. Ingresa como `calidad@bocam.com`
2. Tab **"No Conformidades"** → clic **"Nueva NC"**
3. Descripción: "Impermeabilizante aplicado con humedad en superficie — losa nivel 2"
4. Fuente: `INSPECCIÓN`, Clasificación: `MAYOR`
5. Guardar → NC en estado **ABIERTA**
6. Clic **"→ EN_ANALISIS"**
7. Edita campo Causa Raíz: "Aplicación sin respetar tiempo de secado post-lluvia (mínimo 48 h)"

**Resultado esperado:** NC en estado EN_ANALISIS con causa raíz documentada.

---

## C.2 — Agregar acción correctiva y cerrar NC
**Usuario:** calidad@bocam.com  
**Módulo:** CalidadView

**Pasos:**
1. Abre la NC del ejercicio C.1
2. Clic **"→ ACCION_CORRECTIVA"**
3. Agrega acción: "Retirar impermeabilizante defectuoso, preparar superficie y reaplicar según especificación", responsable: `residente`, fecha límite: en 10 días
4. Cuando la acción esté ejecutada: clic en la acción → cambia estado a **VERIFICADA**
5. Clic **"→ EN_VERIFICACION"**
6. Clic **"→ CERRADA"**

**Resultado esperado:** NC cerrada con todo el flujo ISO 9001 documentado. El dashboard muestra una NC menos abierta.

**Qué valida:** Máquina de estados NC, acciones correctivas, cierre.

---

## C.3 — Crear auditoría y convertir hallazgo en NC
**Usuario:** calidad@bocam.com  
**Módulo:** CalidadView

**Pasos:**
1. Tab **"Auditorías"** → clic **"Nueva Auditoría"**
2. Tipo: `INTERNA`, área auditada: `Estructura`, fecha: hoy
3. Guardar → Auditoría en estado **PROGRAMADA**
4. Clic **"Iniciar"** → estado **EN_CURSO**
5. Agrega hallazgo: "Acero sin protección anticorrosiva en esperas de columna eje C", tipo: `MAYOR`
6. En el hallazgo → clic **"→ Crear NC"**

**Resultado esperado:** Se crea automáticamente una NC vinculada al hallazgo. El hallazgo muestra el badge "NC vinculada". Si haces clic en "→ Crear NC" una segunda vez, el sistema responde 409 (idempotente, no crea duplicado).

**Qué valida:** Flujo auditoría, conversión hallazgo→NC, idempotencia.

---

---

# BLOQUE D — CONTROL DE PROYECTOS (EVM)

---

## D.1 — Cargar programación de obra
**Usuario:** director@bocam.com  
**Módulo:** ControlProyectosView

**Pasos:**
1. Ingresa como `director@bocam.com`
2. Ve a **ControlProyectosView** → tab **"Programación"**
3. Agrega una partida de ejemplo:
   - Concepto: "Cimentación", fecha inicio: 2026-06-01, fecha fin: 2026-07-15
   - Distribución: junio = 60%, julio = 40% (debe sumar 100%)
4. Clic **"Guardar Programación"**

**Resultado esperado:** La programación queda cargada. El tab "Curva S" ahora puede trazar la línea de planeado.

---

## D.2 — Verificar EVM y alertas
**Usuario:** director@bocam.com  
**Módulo:** ControlProyectosView

**Pasos:**
1. Tab **"Dashboard"** — observa el semáforo global del proyecto
2. Tab **"EVM"** — revisa los indicadores por partida:
   - ¿SPI > 1? El proyecto va adelantado
   - ¿CPI > 1? El proyecto va bajo costo
   - Si hay avances registrados en Control de Obra, deben aparecer reflejados aquí
3. Tab **"Curva S"** — verifica que la línea planeada se traza correctamente
4. Tab **"Alertas"** — si hay partidas bloqueadas o atrasos detectados, deben aparecer aquí

**Resultado esperado:** Los KPIs de EVM reflejan el avance del ejercicio A.8.

**Qué valida:** Integración Control de Obra → Control Proyectos vía evento.

---

## D.3 — Reconocer una alerta
**Usuario:** director@bocam.com  
**Módulo:** ControlProyectosView

**Pasos:**
1. Tab **"Alertas"** → selecciona cualquier alerta activa
2. Clic **"Reconocer"** — indica que el director está al tanto
3. La alerta cambia de estado (ACTIVA → RECONOCIDA)

**Resultado esperado:** La alerta queda marcada como reconocida.

---

---

# BLOQUE E — SEGURIDAD HSE

---

## E.1 — Registrar incidente de seguridad
**Usuario:** seguridad@bocam.com  
**Módulo:** SeguridadView

**Pasos:**
1. Ingresa como `seguridad@bocam.com`
2. Tab **"Incidentes"** → clic **"Nuevo Incidente"**
3. Tipo: `CASI_ACCIDENTE`, gravedad: `LEVE`
4. Descripción: "Trabajador casi resbala por derrame de aceite en área de maquinaria — sin lesiones"
5. Fecha/hora: hoy 14:30, área: Zona de maquinaria
6. Acción inmediata: "Limpieza del área, colocación de señalización"
7. Acción preventiva: "Plática de orden y limpieza a la brigada"
8. Guardar

---

## E.2 — Crear permiso de trabajo en altura
**Usuario:** seguridad@bocam.com  
**Módulo:** SeguridadView

**Pasos:**
1. Tab **"Permisos de Trabajo"** → clic **"Nuevo Permiso"**
2. Tipo: `EN_ALTURA`, área: "Nivel 3 — Losa"
3. Solicitante: residente@bocam.com
4. Vigencia: hoy 08:00 a 18:00
5. Medidas de seguridad: arnés, línea de vida, casco
6. Clic **"Crear Permiso"** → estado SOLICITADO
7. Clic **"Aprobar"** → estado APROBADO

---

---

# BLOQUE F — ADMINISTRACIÓN

---

## F.1 — Crear usuario nuevo
**Usuario:** admin@bocam.com  
**Módulo:** AdminView

**Pasos:**
1. Ingresa como `admin@bocam.com`
2. Tab **"Usuarios"** → clic **"+ Nuevo Usuario"**
3. Email: `supervisor.prueba@bocam.com`, Nombre: `Supervisor Prueba`, Rol: `control_obra`
4. Contraseña: `Temporal2026!`
5. Guardar
6. Cierra sesión → ingresa como `supervisor.prueba@bocam.com` con `Temporal2026!`
7. Verifica que ve el módulo **Control de Obra**

**Resultado esperado:** El usuario nuevo puede acceder con sus credenciales y solo ve lo que corresponde a su rol.

**Qué valida:** Gestión de usuarios, control de acceso por rol.

---

## F.2 — Cambiar rol de usuario
**Usuario:** admin@bocam.com  
**Módulo:** AdminView

**Pasos:**
1. Tab **"Usuarios"** → busca a `supervisor.prueba@bocam.com`
2. Clic **"Editar"** → cambia rol a `gerencia_tecnica`
3. Guarda
4. Cierra sesión → ingresa como supervisor.prueba
5. Verifica que ahora ve el módulo Gerencia Técnica en lugar de Control de Obra

**Qué valida:** Cambio de roles en tiempo real.

---

---

# BLOQUE G — TOPES PRESUPUESTALES (GT + Compras)

Este bloque valida el sistema de control de topes presupuestales por partida.

---

## G.1 — Verificar saldo de partida
**Usuario:** gt@bocam.com  
**Módulo:** InsumosView → tab "Saldos"

**Pasos:**
1. Tab **"Saldos"** — localiza la partida usada en el ejercicio A
2. Verifica los montos:
   - **Aprobado:** monto del presupuesto OPUS
   - **Comprometido:** monto de OCs emitidas
   - **Ejercido:** monto pagado
   - **Disponible:** aprobado − comprometido − ejercido

---

## G.2 — Simular partida agotada (escenario de bloqueo)
**Usuario:** residente@bocam.com → compras@bocam.com  
**Módulo:** ResidenciaView → ComprasView

**Pasos:**
1. Como residente, crea una requisición **por un monto mayor al disponible** en la partida
2. Como compras, intenta generar una OC que exceda el saldo disponible
3. El sistema debe mostrar el **modal de partidas bloqueadas** con el monto faltante
4. Observa el badge **"🔒 BLOQUEADO"** en la columna Saldo de la fila correspondiente

**Resultado esperado:** El sistema impide emitir la OC y muestra la alerta de tope. La requisición pasa a `PENDIENTE_TRANSFERENCIA`.

**Qué valida:** Gate presupuestal duro por partida, flujo de bloqueo.

---

## G.3 — Anular bloqueo (director / admin)
**Usuario:** admin@bocam.com  
**Módulo:** InsumosView

**Pasos:**
1. Ingresa como `admin@bocam.com` → ve a InsumosView → tab **"Saldos"**
2. Localiza la partida BLOQUEADA
3. Clic **"Anular Bloqueo"** → escribe justificación: "Autorización de emergencia por director — partida aprobada verbalmente"
4. Confirma

**Resultado esperado:** El bloqueo se levanta y la requisición puede volver a procesarse.

**Qué valida:** Escape de director para situaciones de emergencia, audit log de justificaciones.

---

---

# BLOQUE H — PROVEEDOR COMPLETO

---

## H.1 — Dar de alta proveedor con documentos
**Usuario:** compras@bocam.com  
**Módulo:** ComprasView

**Pasos:**
1. Tab **"Proveedores"** → clic **"Nuevo Proveedor"**
2. Datos: Nombre: `Aceros Norte SA`, RFC: `ANO990101XXX`, especialidad: `Materiales estructurales`
3. Guardar
4. Abre el proveedor → tab Documentos → sube una constancia de situación fiscal (PDF de prueba)
5. Verifica que el proveedor aparece con nivel "En evaluación"

---

## H.2 — Verificar calificación automática
**Usuario:** compras@bocam.com  
**Módulo:** ComprasView

**Pasos:**
1. Después de que el Proveedor A del ejercicio A.6 haya recibido al menos una OC recibida completa
2. Abre el perfil del proveedor → tab "Calificación"
3. Verifica los indicadores automáticos: puntualidad (días de entrega vs. prometido), calidad (OCs sin rechazo)

---

---

# Resumen — Matriz de cobertura

| Bloque | Módulos involucrados | Eventos validados |
|--------|----------------------|-------------------|
| A — Ciclo central | GT, Residente, Compras, Almacén, Finanzas, Contabilidad | oc_creada, oc_recibida_total, pago_registrado |
| B — Nómina | Personal, Contabilidad | nomina_autorizada, nomina_pagada |
| C — Calidad | Calidad | — (flujo interno) |
| D — Control Proyectos | Control Obra, Control Proyectos | avance_fisico_validado |
| E — Seguridad | Seguridad HSE | — (flujo interno) |
| F — Administración | Auth, Admin | — |
| G — Topes presupuestales | GT, Compras | partida_bloqueada, transferencia_partida_aprobada |
| H — Proveedores | Compras | — |

**Total de módulos ejercitados:** 10 de 12  
**Total de eventos RabbitMQ validados:** 7 de 11

---

## Problemas conocidos y qué hacer si algo falla

| Síntoma | Causa probable | Solución |
|---------|---------------|---------|
| "Error al cargar datos" en cualquier módulo | El microservicio está caído | Avisar al administrador para revisar los containers VPS |
| La OC no aparece en Contabilidad | RabbitMQ no entregó el evento | Revisar logs del container: `docker logs bocam-vps-contabilidad` |
| El avance no actualiza EVM | Control Proyectos no recibió el evento | Verificar que existe una programación cargada en tab "Programación" |
| Badge "Nómina por Pagar" no aparece | cuenta 2200 no existe en el catálogo | SQL ya aplicado: `INSERT INTO cuentas_contables ... clave '2200'` ✅ |
| Bloqueo de partida no se resuelve | `transferencia_partida_aprobada` no entregado | Verificar RabbitMQ y logs de compras |
