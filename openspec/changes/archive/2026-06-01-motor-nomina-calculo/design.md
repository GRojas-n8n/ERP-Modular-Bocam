# Design — Motor de Cálculo de Nómina

## Context

El módulo `personal` ya tiene `Empleado`, `PreNomina` y `PreNominaDetalle` con los campos
correctos (`deduccion_imss`, `deduccion_isr`, `dias_trabajados`, etc.). El problema es el
motor que los llena. El endpoint actual (`POST /prenominas/calcular`) usa tasas quemadas y
asume días fijos — debe reemplazarse con un motor basado en tablas oficiales SAT/IMSS 2025
alimentado por registros de asistencia reales.

**Principio del Complemento Salarial:** en construcción mexicana es práctica estándar que
el trabajador tenga dos salarios: uno formal (registrado ante el IMSS, base de las cuotas)
y uno acordado (el salario real total). La diferencia se paga como "Complemento Salarial"
sin deducciones. El ERP debe modelar ambos flujos de forma independiente y trazable.

## Goals

1. Asistencia QR persiste en BD y alimenta automáticamente el cálculo de días trabajados
2. Motor IMSS/ISR correcto, parametrizable y auditabe (log de qué tasas se usaron)
3. Complemento Salarial como flujo independiente, opcional por empleado
4. Deducciones configurables por empleado sin tocar código
5. Solo empleados PLANTA y EVENTUAL con NSS se someten al cálculo IMSS

## Non-Goals

- Cálculo de cuota patronal IMSS (la empresa la calcula aparte, no en este ERP)
- Timbrado CFDI de nómina (requiere integración SAT — siguiente iteración)
- Nómina de subcontratistas
- AFORE / retiro (cuota patronal, no obrera)
- Partes proporcionales de vacaciones/aguinaldo (siguiente iteración)

---

## Tablas Fiscales 2025

### UMA Diario 2025
```
UMA_DIARIO = $113.14 MXN
```

### IMSS Cuota Obrera — 4 Conceptos

| Concepto | Base | Tasa |
|---|---|---|
| Enf. y Mat. — proporcional | (SBC − 3 × UMA_DIARIO) × días (si positivo) | 0.40% |
| Invalidez y Vida | SBC × días | 0.625% |
| Cesantía y Vejez | SBC × días | 1.125% |
| *(Guarderías — solo patronal)* | — | — |

`SBC = salario_integrado` del Empleado (campo ya existente).
Si `SBC ≤ 3 × UMA_DIARIO`, la cuota de Enf.Mat. proporcional = 0.

### ISR — Tabla Semanal 2025 (SAT)

```typescript
const ISR_TABLA_SEMANAL = [
  { li: 0.01,   ls: 172.92,   cuota: 0.00,   tasa: 0.0192 },
  { li: 172.93, ls: 1467.87,  cuota: 3.32,   tasa: 0.0640 },
  { li: 1467.88,ls: 2578.12,  cuota: 86.26,  tasa: 0.1088 },
  { li: 2578.13,ls: 2994.12,  cuota: 206.82, tasa: 0.1600 },
  { li: 2994.13,ls: 3584.62,  cuota: 273.48, tasa: 0.1792 },
  { li: 3584.63,ls: 7230.69,  cuota: 379.07, tasa: 0.2136 },
  { li: 7230.70,ls: 11371.00, cuota: 1157.73,tasa: 0.2352 },
  { li: 11371.01,ls:16030.77, cuota: 2131.55,tasa: 0.3000 },
  { li: 16030.78,ls:30576.92, cuota: 3529.44,tasa: 0.3200 },
  { li: 30576.93,ls:40788.46, cuota: 8173.69,tasa: 0.3400 },
  { li: 40788.47,ls: Infinity, cuota:11645.15,tasa: 0.3500 },
];
```

### ISR — Tabla Quincenal 2025 (SAT)

```typescript
const ISR_TABLA_QUINCENAL = [
  { li: 0.01,    ls: 371.83,   cuota: 0.00,    tasa: 0.0192 },
  { li: 371.84,  ls: 3153.45,  cuota: 7.14,    tasa: 0.0640 },
  { li: 3153.46, ls: 5539.56,  cuota: 185.27,  tasa: 0.1088 },
  { li: 5539.57, ls: 6429.88,  cuota: 444.77,  tasa: 0.1600 },
  { li: 6429.89, ls: 7699.34,  cuota: 586.90,  tasa: 0.1792 },
  { li: 7699.35, ls: 15534.34, cuota: 814.44,  tasa: 0.2136 },
  { li: 15534.35,ls: 24445.35, cuota: 2488.39, tasa: 0.2352 },
  { li: 24445.36,ls: 34452.42, cuota: 4582.45, tasa: 0.3000 },
  { li: 34452.43,ls: 65669.38, cuota: 7584.08, tasa: 0.3200 },
  { li: 65669.39,ls: 87628.46, cuota: 17570.40,tasa: 0.3400 },
  { li: 87628.47,ls: Infinity,  cuota: 25040.13,tasa: 0.3500 },
];
```

### Subsidio al Empleo — Semanal 2025

```typescript
const SUBSIDIO_SEMANAL = [
  { li: 0,       ls: 1092.89, subsidio: 143.45 },
  { li: 1092.90, ls: 1732.99, subsidio: 143.45 },
  { li: 1733.00, ls: 2316.44, subsidio: 143.45 },
  { li: 2316.45, ls: 2677.73, subsidio: 104.00 },
  { li: 2677.74, ls: 2904.00, subsidio: 63.12 },
  { li: 2904.01, ls: 3341.30, subsidio: 30.92 },
  { li: 3341.31, ls: Infinity, subsidio: 0 },
];
```

*(Subsidio quincenal = subsidio semanal × 15/7)*

---

## Schema Prisma — Nuevos Modelos

### RegistroAsistencia
```prisma
model RegistroAsistencia {
  id_registro    String   @id @default(uuid()) @db.Uuid
  tenant_id      String   @db.Uuid
  proyecto_id    String   @db.Uuid
  empleado_id    String   @db.Uuid
  cuadrilla_id   String?  @db.Uuid
  fecha          DateTime @db.Date
  estado         String   // PRESENTE | AUSENTE | INCAPACIDAD | JUSTIFICADA | FALTA
  tipo_registro  String   @default("MANUAL") // QR | MANUAL
  horas_extra    Decimal  @default(0) @db.Decimal(4,1)
  registrado_por String   @db.Uuid   // userId quien registró
  created_at     DateTime @default(now())

  @@unique([tenant_id, empleado_id, fecha])
  @@index([tenant_id, proyecto_id, fecha])
  @@index([tenant_id, empleado_id])
  @@map("registros_asistencia")
}
```

### ConfigDeduccionEmpleado
```prisma
model ConfigDeduccionEmpleado {
  id_config      String   @id @default(uuid()) @db.Uuid
  tenant_id      String   @db.Uuid
  empleado_id    String   @db.Uuid
  aplica_imss    Boolean  @default(true)
  aplica_isr     Boolean  @default(true)
  aplica_infonavit Boolean @default(false)
  infonavit_num  String?  @db.VarChar(30)    // Número de crédito
  infonavit_monto Decimal? @db.Decimal(10,2) // Monto fijo de descuento
  updated_at     DateTime @updatedAt

  @@unique([tenant_id, empleado_id])
  @@index([tenant_id])
  @@map("config_deducciones_empleados")
}
```

### NominaComplementaria (Complemento Salarial)
```prisma
model NominaComplementaria {
  id_complemento String   @id @default(uuid()) @db.Uuid
  tenant_id      String   @db.Uuid
  proyecto_id    String   @db.Uuid
  prenomina_id   String   @db.Uuid  // FK a PreNomina del mismo período
  codigo         String   @db.VarChar(30) // CS-2026-S01
  periodo_inicio DateTime @db.Date
  periodo_fin    DateTime @db.Date
  periodo_tipo   String   // SEMANAL | QUINCENAL
  total_complemento Decimal @db.Decimal(12,2)
  estado         String   @default("BORRADOR") // BORRADOR | AUTORIZADA | PAGADA
  elaborado_por  String   @db.Uuid
  autorizado_por String?  @db.Uuid
  created_at     DateTime @default(now())

  detalles       NominaComplementariaDetalle[]

  @@index([tenant_id, proyecto_id])
  @@map("nominas_complementarias")
}

model NominaComplementariaDetalle {
  id_detalle       String   @id @default(uuid()) @db.Uuid
  tenant_id        String   @db.Uuid
  complemento_id   String   @db.Uuid
  empleado_id      String   @db.Uuid
  dias_trabajados  Decimal  @db.Decimal(4,1)
  salario_acordado Decimal  @db.Decimal(10,2) // Salario real total acordado
  salario_imss_dia Decimal  @db.Decimal(10,2) // salario_integrado del Empleado
  complemento_dia  Decimal  @db.Decimal(10,2) // salario_acordado - salario_imss_dia
  monto_complemento Decimal @db.Decimal(10,2) // complemento_dia × dias_trabajados
  // Sin deducciones por definición

  complemento     NominaComplementaria @relation(fields: [complemento_id], references: [id_complemento], onDelete: Cascade)

  @@index([tenant_id, complemento_id])
  @@map("nominas_complementarias_detalle")
}
```

### Campo adicional en Empleado
```prisma
// Agregar en model Empleado:
salario_acordado  Decimal? @db.Decimal(10,2)  // Salario real acordado (para Complemento Salarial)
```

---

## Endpoints Nuevos / Modificados

### Asistencia

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `POST` | `/asistencia/registro` | `residencia`, `control_obra`, `personal_rh`, `admin` | Registrar asistencia de un empleado (QR o manual) |
| `POST` | `/asistencia/bulk` | `residencia`, `control_obra`, `personal_rh`, `admin` | Registrar asistencia de toda la cuadrilla en un batch |
| `GET` | `/asistencia` | `residencia`, `control_obra`, `personal_rh`, `admin` | Listar registros por fecha/cuadrilla/empleado |
| `PATCH` | `/asistencia/:id` | `personal_rh`, `admin` | Corregir un registro (cambiar estado, horas extra) |
| `GET` | `/asistencia/resumen` | `personal_rh`, `admin` | Resumen del período: días trabajados y horas extra por empleado |

### Nómina (endpoints modificados)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `POST` | `/prenominas/calcular` | `personal_rh`, `admin` | **MODIFICADO** — motor real IMSS/ISR + lee asistencia |
| `GET` | `/prenominas/:id/detalle` | `personal_rh`, `admin` | **NUEVO** — detalle por empleado con desglose de cálculo |

### Complemento Salarial

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `POST` | `/complementos/calcular` | `personal_rh`, `admin` | Generar Complemento Salarial a partir de una PreNomina existente |
| `GET` | `/complementos` | `personal_rh`, `admin` | Listar complementos por período |
| `PATCH` | `/complementos/:id/autorizar` | `personal_rh`, `admin` | Autorizar complemento (BORRADOR → AUTORIZADA) |

### Configuración de Deducciones

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/empleados/:id/config-deducciones` | `personal_rh`, `admin` | Leer configuración de deducciones del empleado |
| `PUT` | `/empleados/:id/config-deducciones` | `personal_rh`, `admin` | Crear o actualizar configuración |

---

## Algoritmo del Motor de Cálculo

```
PARA CADA empleado ACTIVO del proyecto con tipo_contrato IN (PLANTA, EVENTUAL):

  1. CONSULTAR RegistroAsistencia del período → dias_trabajados, total horas_extra
  2. SI diasTrabajados == 0 → saltar empleado

  3. BASE GRAVABLE ISR:
     salario_base = salario_diario × diasTrabajados
     horas_extra = calcularHorasExtra(horasExtra, diasEnSemana)
       → primeras 9h/semana: 200% del salario-hora
       → excedente: 300% del salario-hora
       → 50% del monto de HE está exento de ISR (LFT art. 93)
     percepciones_totales = salario_base + horas_extra + bonos
     base_isr = percepciones_totales - (horas_extra_exentas)

  4. ISR:
     usar tabla según periodo_tipo (SEMANAL | QUINCENAL)
     isr_art96 = cuota_fija + (base_isr - limite_inferior) × tasa_marginal
     subsidio = buscarSubsidio(percepciones_totales, periodo_tipo)
     isr_neto = MAX(0, isr_art96 - subsidio)

  5. IMSS (solo si empleado.nss != null Y config.aplica_imss):
     sbc = salario_integrado ?? salario_diario
     em_prop = MAX(0, (sbc - 3 × UMA_DIARIO) × diasTrabajados × 0.0040)
     iv = sbc × diasTrabajados × 0.00625
     cev = sbc × diasTrabajados × 0.01125
     imss_total = em_prop + iv + cev

  6. INFONAVIT (solo si config.aplica_infonavit):
     infonavit = config.infonavit_monto (monto fijo pactado)

  7. TOTALES:
     total_percepciones = percepciones_totales
     total_deducciones = isr_neto + imss_total + infonavit
     neto_a_pagar = total_percepciones - total_deducciones

  8. CREAR PreNominaDetalle con todos los campos
```

---

## Algoritmo Complemento Salarial

```
PARA CADA detalle de la PreNomina (empleados calculados):
  empleado = buscar Empleado
  SI empleado.salario_acordado == null O
     empleado.salario_acordado <= empleado.salario_integrado:
    → No genera complemento para este empleado

  complemento_dia = salario_acordado - salario_integrado (salario_diario del IMSS)
  monto = complemento_dia × diasTrabajados
  → CREAR NominaComplementariaDetalle sin deducciones
```

---

## Decisions

**D1 — Tablas fiscales en código (no en BD)**
Las tablas ISR y las tasas IMSS se definen en un archivo `tablas-fiscales.ts` dentro del
módulo personal. No se guardan en BD para evitar complejidad de migración. Cuando cambien
para 2026, se actualiza el archivo y se redeploya. Se incluye el año en el nombre de la
constante (`ISR_TABLA_SEMANAL_2025`) para trazabilidad.

**D2 — Asistencia en módulo personal (no residencia)**
Los registros `RegistroAsistencia` pertenecen al módulo `personal` — son datos de RH.
La vista de Residencia llama a `/api/v1/personal/asistencia/...` con su JWT (el rol
`residencia` tiene permiso en esos endpoints). No hay cross-module DB JOIN.

**D3 — Complemento Salarial siempre referenciado a una PreNomina**
`NominaComplementaria.prenomina_id` vincula ambos documentos del mismo período.
Esto garantiza trazabilidad y evita complementos huérfanos.

**D4 — UMA y tablas actualizables sin spec**
El archivo `tablas-fiscales.ts` se considera "configuración de negocio" — puede actualizarse
sin abrir un nuevo spec, solo con PR de 1 archivo y revisión del equipo de RH.

**D5 — Días fijos como fallback**
Si no hay `RegistroAsistencia` para el período pero la nómina se solicita de todas formas,
el motor usa los días del período como fallback (comportamiento anterior) y marca el detalle
con `origen_dias = 'ESTIMADO'` en lugar de `'ASISTENCIA'` para visibilidad.

## Risks

**R1 — Tablas ISR desactualizadas**
El SAT actualiza las tablas anualmente. Si el ERP no se actualiza en enero de cada año,
los cálculos serán incorretos. Mitigación: documentar en CLAUDE.md que las tablas deben
actualizarse al inicio de cada ejercicio fiscal.

**R2 — Salario integrado no capturado**
`salario_integrado` es opcional en el schema actual. Si un empleado no lo tiene, el motor
usa `salario_diario` como SBC, lo que puede subestimar las cuotas. Mitigación: el motor
loguea un warning en el detalle cuando usa fallback a `salario_diario`.

**R3 — Recálculo de nóminas históricas**
Las pre-nóminas existentes en producción fueron calculadas con tasas incorrectas.
Mitigación: al desplegar, marcar todas las pre-nóminas en estado `BORRADOR` o `CALCULADA`
como `REQUIERE_RECALCULO = true` (nuevo campo booleano en `PreNomina`) para que RH sepa
cuáles regenerar.
