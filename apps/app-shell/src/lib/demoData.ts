// ---------------------------------------------------------------------------
// Demo Mode — Datos simulados para exploración sin backend
// Proyecto: Torre Corporativa Norte (TCN-2024)
// ---------------------------------------------------------------------------

// ─── GERENCIA TÉCNICA — Catálogo de Insumos ─────────────────────────────────
export const DEMO_INSUMOS = [
  { id: 'ins-001', clave: 'MAT-001', descripcion: 'Cemento Portland CPC 30R saco 50kg', unidad: 'SAC', costo: 285.00, clase: 'MATERIALES' },
  { id: 'ins-002', clave: 'MAT-002', descripcion: 'Varilla corrugada 3/8" x 12m G60', unidad: 'PZA', costo: 189.00, clase: 'MATERIALES' },
  { id: 'ins-003', clave: 'MAT-003', descripcion: 'Block de concreto 15x20x40 cm', unidad: 'PZA', costo: 18.50, clase: 'MATERIALES' },
  { id: 'ins-004', clave: 'MAT-004', descripcion: 'Impermeabilizante acrílico blanco 19L', unidad: 'CUB', costo: 890.00, clase: 'MATERIALES' },
  { id: 'ins-005', clave: 'MAT-005', descripcion: 'Grava 3/4" puesta en obra m³', unidad: 'M3', costo: 420.00, clase: 'MATERIALES' },
  { id: 'ins-006', clave: 'MAT-006', descripcion: 'Arena lavada m³', unidad: 'M3', costo: 380.00, clase: 'MATERIALES' },
  { id: 'ins-007', clave: 'MAT-007', descripcion: 'Tablaroca 1/2" x 1.22x2.44m', unidad: 'PZA', costo: 210.00, clase: 'MATERIALES' },
  { id: 'ins-008', clave: 'EQU-001', descripcion: 'Renta retroexcavadora CAT 416F por día', unidad: 'DIA', costo: 7500.00, clase: 'EQUIPOS' },
  { id: 'ins-009', clave: 'EQU-002', descripcion: 'Renta andamio multidireccional por mes', unidad: 'MES', costo: 3200.00, clase: 'EQUIPOS' },
  { id: 'ins-010', clave: 'MAN-001', descripcion: 'Mano de obra colado de losa m²', unidad: 'M2', costo: 125.00, clase: 'MANO_OBRA' },
  { id: 'ins-011', clave: 'MAN-002', descripcion: 'Mano de obra instalación block m²', unidad: 'M2', costo: 85.00, clase: 'MANO_OBRA' },
  { id: 'ins-012', clave: 'SUB-001', descripcion: 'Subcontrato instalación eléctrica por punto', unidad: 'PTO', costo: 850.00, clase: 'SUBCONTRATOS' },
  { id: 'ins-013', clave: 'SUB-002', descripcion: 'Subcontrato plomería — suministro y colocación', unidad: 'ML', costo: 380.00, clase: 'SUBCONTRATOS' },
  { id: 'ins-014', clave: 'SUB-003', descripcion: 'Subcontrato cancelería aluminio natural', unidad: 'M2', costo: 1850.00, clase: 'SUBCONTRATOS' },
  { id: 'ins-015', clave: 'MAT-008', descripcion: 'Concreto premezclado f\'c=250 kg/cm²', unidad: 'M3', costo: 1680.00, clase: 'MATERIALES' },
];

// ─── COMPRAS — Requisiciones ─────────────────────────────────────────────────
export const DEMO_REQUISICIONES = [
  { id: 'req-001', folio: 'REQ-2024-041', fecha: '2024-04-01', solicitante: 'Ing. Juan Pérez — Residente', prioridad: 'ALTA' as const, estado: 'APROBADA' },
  { id: 'req-002', folio: 'REQ-2024-042', fecha: '2024-04-05', solicitante: 'María López — Almacén', prioridad: 'MEDIA' as const, estado: 'PENDIENTE' },
  { id: 'req-003', folio: 'REQ-2024-043', fecha: '2024-04-08', solicitante: 'Ing. Carlos Ruiz — Supervisor', prioridad: 'ALTA' as const, estado: 'COMPRADA' },
  { id: 'req-004', folio: 'REQ-2024-044', fecha: '2024-04-10', solicitante: 'Ana Martínez — Residente Nivel 8', prioridad: 'MEDIA' as const, estado: 'APROBADA' },
  { id: 'req-005', folio: 'REQ-2024-045', fecha: '2024-04-12', solicitante: 'Ing. Pedro Sánchez — Instalaciones', prioridad: 'BAJA' as const, estado: 'BORRADOR' },
  { id: 'req-006', folio: 'REQ-2024-046', fecha: '2024-04-15', solicitante: 'Arq. Laura Gómez — Acabados', prioridad: 'MEDIA' as const, estado: 'PENDIENTE' },
];

// ─── FINANZAS — Resumen y Pagos ──────────────────────────────────────────────
export const DEMO_RESUMEN_FINANCIERO = {
  total_autorizado: 8500000,
  total_ejercido: 2125000,
  total_comprometido: 1700000,
  total_disponible: 4675000,
  porcentaje_ejercido: 25,
};

export const DEMO_PAGOS = [
  { id_pago: 'pago-001', concepto: 'Concreto premezclado — Estimación 03', beneficiario: 'CEMEX México SA de CV', monto_programado: 285000, fecha_programada: '2024-04-05', estado: 'PAGADO', referencia_modulo: 'COMPRAS' },
  { id_pago: 'pago-002', concepto: 'Acero estructural suministro y colocación', beneficiario: 'Deacero Monterrey SA de CV', monto_programado: 420000, fecha_programada: '2024-04-15', estado: 'PENDIENTE', referencia_modulo: 'COMPRAS' },
  { id_pago: 'pago-003', concepto: 'Nómina quincenal — 1a quincena abril', beneficiario: 'Planilla Obra TCN-2024', monto_programado: 187500, fecha_programada: '2024-04-01', estado: 'PAGADO', referencia_modulo: 'PERSONAL' },
  { id_pago: 'pago-004', concepto: 'Renta maquinaria retroexcavadora abril', beneficiario: 'Arrendadora Caterpillar SA', monto_programado: 52500, fecha_programada: '2024-04-20', estado: 'PENDIENTE', referencia_modulo: 'COMPRAS' },
  { id_pago: 'pago-005', concepto: 'Subcontrato impermeabilización niveles 10-12', beneficiario: 'Impermeabilizaciones del Norte SA', monto_programado: 165000, fecha_programada: '2024-05-01', estado: 'PENDIENTE', referencia_modulo: 'COMPRAS' },
  { id_pago: 'pago-006', concepto: 'Cancelería aluminio — fachada sur', beneficiario: 'Aluminios Industriales de GDL', monto_programado: 310000, fecha_programada: '2024-05-10', estado: 'PENDIENTE', referencia_modulo: 'COMPRAS' },
];

// ─── CONTROL DE OBRA ─────────────────────────────────────────────────────────
export const DEMO_BITACORAS = [
  { id_bitacora: 'bit-001', numero_entrada: 127, fecha: '2024-04-15', frente_trabajo: 'Niveles 10-12 — Estructura', actividades_realizadas: 'Colado de losa nivel 12, armado de castillos eje C-D, recepción de varilla 3/8" (120 piezas)', personal_en_sitio: 38, estado: 'CERRADA', clima: 'Soleado 28°C' },
  { id_bitacora: 'bit-002', numero_entrada: 128, fecha: '2024-04-16', frente_trabajo: 'Niveles 7-9 — Acabados', actividades_realizadas: 'Instalación de tablaroca en muros interiores, aplicación de aplanado en departamentos 701-710', personal_en_sitio: 24, estado: 'CERRADA', clima: 'Parcialmente nublado 26°C' },
  { id_bitacora: 'bit-003', numero_entrada: 129, fecha: '2024-04-17', frente_trabajo: 'Planta baja — Instalaciones', actividades_realizadas: 'Tendido de tubería hidráulica zona de cisterna, prueba hidrostática red contra incendios', personal_en_sitio: 15, estado: 'CERRADA', clima: 'Lluvioso 22°C' },
  { id_bitacora: 'bit-004', numero_entrada: 130, fecha: '2024-04-18', frente_trabajo: 'Niveles 10-12 — Estructura', actividades_realizadas: 'Cimbrado de losa nivel 13, colocación de acero de refuerzo, instalaciones embebidas nivel 12', personal_en_sitio: 42, estado: 'ABIERTA', clima: 'Soleado 30°C' },
];

export const DEMO_AVANCES = [
  { id_avance: 'av-001', concepto_presupuesto: 'ESTR-001', descripcion_concepto: 'Colado de losas de concreto f\'c=250', cantidad_periodo: 285.5, cantidad_acumulada: 1820.0, unidad: 'M3', porcentaje_avance: 62, importe_periodo: 479640, estado: 'VALIDADO' },
  { id_avance: 'av-002', concepto_presupuesto: 'ESTR-002', descripcion_concepto: 'Suministro y colocación de acero de refuerzo', cantidad_periodo: 18.4, cantidad_acumulada: 95.2, unidad: 'TON', porcentaje_avance: 48, importe_periodo: 331200, estado: 'VALIDADO' },
  { id_avance: 'av-003', concepto_presupuesto: 'ACB-001', descripcion_concepto: 'Aplanado de cemento en muros interiores', cantidad_periodo: 1240, cantidad_acumulada: 3850, unidad: 'M2', porcentaje_avance: 35, importe_periodo: 124000, estado: 'PENDIENTE' },
  { id_avance: 'av-004', concepto_presupuesto: 'INS-001', descripcion_concepto: 'Instalación eléctrica — puntos de iluminación', cantidad_periodo: 48, cantidad_acumulada: 210, unidad: 'PTO', porcentaje_avance: 28, importe_periodo: 40800, estado: 'PENDIENTE' },
];

export const DEMO_ESTIMACIONES = [
  { id_estimacion: 'est-001', codigo: 'EST-TCN-003', numero_estimacion: 3, subtotal: 875000, total_neto: 875000, estado: 'AUTORIZADA', periodo_inicio: '2024-03-01', periodo_fin: '2024-03-31', avances: [{}, {}, {}, {}] },
  { id_estimacion: 'est-002', codigo: 'EST-TCN-004', numero_estimacion: 4, subtotal: 975640, total_neto: 975640, estado: 'EN_REVISION', periodo_inicio: '2024-04-01', periodo_fin: '2024-04-30', avances: [{}, {}, {}, {}, {}] },
];

// ─── PERSONAL ────────────────────────────────────────────────────────────────
export const DEMO_EMPLEADOS = [
  { id_empleado: 'emp-001', numero_empleado: 'E-0142', nombre: 'Roberto', apellido_paterno: 'Hernández', puesto: 'Maestro de Obra', categoria: 'SUPERVISOR', estado: 'ACTIVO', salario_diario: 850, certificaciones: 'IMSS, STPS-Altura', cuadrilla: { nombre: 'Cuadrilla Estructura A', codigo: 'CU-EA-01' } },
  { id_empleado: 'emp-002', numero_empleado: 'E-0178', nombre: 'Miguel', apellido_paterno: 'Torres', puesto: 'Oficial Albañil', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 420, certificaciones: null, cuadrilla: { nombre: 'Cuadrilla Estructura A', codigo: 'CU-EA-01' } },
  { id_empleado: 'emp-003', numero_empleado: 'E-0195', nombre: 'Francisco', apellido_paterno: 'Ramírez', puesto: 'Electricista Oficial', categoria: 'TECNICO', estado: 'ACTIVO', salario_diario: 520, certificaciones: 'Instalaciones Eléctricas CFE', cuadrilla: { nombre: 'Cuadrilla Instalaciones', codigo: 'CU-INS-01' } },
  { id_empleado: 'emp-004', numero_empleado: 'E-0201', nombre: 'José Luis', apellido_paterno: 'Mendoza', puesto: 'Ayudante General', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 280, certificaciones: null, cuadrilla: { nombre: 'Cuadrilla Estructura A', codigo: 'CU-EA-01' } },
  { id_empleado: 'emp-005', numero_empleado: 'E-0215', nombre: 'Alejandro', apellido_paterno: 'García', puesto: 'Plomero Oficial', categoria: 'TECNICO', estado: 'ACTIVO', salario_diario: 490, certificaciones: 'Instalaciones Hidráulicas', cuadrilla: { nombre: 'Cuadrilla Instalaciones', codigo: 'CU-INS-01' } },
  { id_empleado: 'emp-006', numero_empleado: 'E-0088', nombre: 'Arturo', apellido_paterno: 'Vega', puesto: 'Residente de Obra', categoria: 'ADMINISTRATIVO', estado: 'ACTIVO', salario_diario: 1200, certificaciones: 'Ing. Civil UANL, PMP', cuadrilla: null },
  { id_empleado: 'emp-007', numero_empleado: 'E-0232', nombre: 'Guillermo', apellido_paterno: 'Morales', puesto: 'Oficial Carpintero', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 390, certificaciones: null, cuadrilla: { nombre: 'Cuadrilla Acabados', codigo: 'CU-ACB-01' } },
  { id_empleado: 'emp-008', numero_empleado: 'E-0155', nombre: 'Salvador', apellido_paterno: 'Jiménez', puesto: 'Soldador Estructural', categoria: 'TECNICO', estado: 'INCAPACIDAD', salario_diario: 580, certificaciones: 'Certificado 3G AWS', cuadrilla: { nombre: 'Cuadrilla Estructura A', codigo: 'CU-EA-01' } },
];

export const DEMO_CUADRILLAS = [
  { id_cuadrilla: 'cua-001', nombre: 'Cuadrilla Estructura A', codigo: 'CU-EA-01', especialidad: 'Estructura y Concreto', capataz_nombre: 'Roberto Hernández', estado: 'ACTIVA', _count: { miembros: 12 } },
  { id_cuadrilla: 'cua-002', nombre: 'Cuadrilla Instalaciones', codigo: 'CU-INS-01', especialidad: 'Instalaciones Hidrosanitarias y Eléctricas', capataz_nombre: 'Francisco Ramírez', estado: 'ACTIVA', _count: { miembros: 8 } },
  { id_cuadrilla: 'cua-003', nombre: 'Cuadrilla Acabados', codigo: 'CU-ACB-01', especialidad: 'Acabados Finos e Interiores', capataz_nombre: 'Arturo Morales', estado: 'ACTIVA', _count: { miembros: 10 } },
  { id_cuadrilla: 'cua-004', nombre: 'Cuadrilla Subcontrato Cancelería', codigo: 'CU-SUB-01', especialidad: 'Cancelería y Vidrio Templado', capataz_nombre: null, estado: 'EN_PAUSA', _count: { miembros: 6 } },
];

export const DEMO_PRENOMINAS = [
  { id_prenomina: 'pn-001', codigo: 'NOM-2024-07', periodo_tipo: 'QUINCENAL', periodo_inicio: '2024-04-01', periodo_fin: '2024-04-15', total_neto: 187500, total_empleados: 38, estado: 'PAGADA' },
  { id_prenomina: 'pn-002', codigo: 'NOM-2024-08', periodo_tipo: 'QUINCENAL', periodo_inicio: '2024-04-16', periodo_fin: '2024-04-30', total_neto: 191200, total_empleados: 40, estado: 'EN_PROCESO' },
];

// ─── SEGURIDAD — HSE ─────────────────────────────────────────────────────────
export const DEMO_INCIDENTES = [
  { id_incidente: 'inc-001', codigo: 'INC-2024-012', tipo: 'CUASI_ACCIDENTE', severidad: 'BAJA', fecha_incidente: '2024-04-10', hora_incidente: '09:30', ubicacion: 'Nivel 11 — Frente C', descripcion: 'Trabajador resbaló en andamio mojado por lluvia de la mañana. Sin lesiones. Se aplicó limpieza y marcado de zona resbaladiza.', empleado_afectado_nombre: 'José García López', estado: 'CERRADO', dias_incapacidad: 0, requirio_atencion_medica: false },
  { id_incidente: 'inc-002', codigo: 'INC-2024-013', tipo: 'ACCIDENTE', severidad: 'MEDIA', fecha_incidente: '2024-04-14', hora_incidente: '14:15', ubicacion: 'Planta baja — Cisterna', descripcion: 'Trabajador sufrió corte en mano derecha al manipular tubo galvanizado sin guantes. Se atendió en clínica y regresó al trabajo.', empleado_afectado_nombre: 'Salvador Jiménez Vega', estado: 'EN_SEGUIMIENTO', dias_incapacidad: 2, requirio_atencion_medica: true },
];

export const DEMO_INSPECCIONES = [
  { id_inspeccion: 'ins-001', codigo: 'INS-2024-018', tipo_inspeccion: 'SEGURIDAD_ALTURA', fecha_inspeccion: '2024-04-12', area_inspeccionada: 'Niveles 10-13 — Perimetrales', items_revisados: 24, items_conformes: 22, items_no_conformes: 2, porcentaje_cumplimiento: 91.7, resultado: 'CONFORME', inspector_nombre: 'Ing. Patricia Salinas' },
  { id_inspeccion: 'ins-002', codigo: 'INS-2024-019', tipo_inspeccion: 'ORDEN_LIMPIEZA', fecha_inspeccion: '2024-04-15', area_inspeccionada: 'Niveles 7-9 — Acabados', items_revisados: 18, items_conformes: 14, items_no_conformes: 4, porcentaje_cumplimiento: 77.8, resultado: 'CONDICIONADO', inspector_nombre: 'Téc. Luis Moreno' },
  { id_inspeccion: 'ins-003', codigo: 'INS-2024-020', tipo_inspeccion: 'HERRAMIENTA_EQUIPO', fecha_inspeccion: '2024-04-17', area_inspeccionada: 'Bodega general y taller', items_revisados: 32, items_conformes: 30, items_no_conformes: 2, porcentaje_cumplimiento: 93.8, resultado: 'CONFORME', inspector_nombre: 'Ing. Patricia Salinas' },
];

export const DEMO_PERMISOS = [
  { id_permiso: 'per-001', codigo: 'PER-2024-055', tipo_permiso: 'TRABAJO_ALTURA', area_trabajo: 'Nivel 13 — Azotea perimetral', descripcion_trabajo: 'Instalación de andamio colgante para fachada norte', fecha_inicio: '2024-04-18', fecha_fin: '2024-04-20', estado: 'VIGENTE', solicitante_nombre: 'Roberto Hernández', autorizador_nombre: 'Ing. Juan Pérez', checklist_previo: true },
  { id_permiso: 'per-002', codigo: 'PER-2024-056', tipo_permiso: 'TRABAJO_EN_CALIENTE', area_trabajo: 'Planta baja — Cuarto de bombas', descripcion_trabajo: 'Soldadura de colector hidráulico DN150', fecha_inicio: '2024-04-17', fecha_fin: '2024-04-17', estado: 'CERRADO', solicitante_nombre: 'Alejandro García', autorizador_nombre: 'Ing. Juan Pérez', checklist_previo: true },
  { id_permiso: 'per-003', codigo: 'PER-2024-057', tipo_permiso: 'ESPACIO_CONFINADO', area_trabajo: 'Sótano — Cisterna de agua potable', descripcion_trabajo: 'Impermeabilización interior de cisterna 250,000L', fecha_inicio: '2024-04-22', fecha_fin: '2024-04-23', estado: 'VIGENTE', solicitante_nombre: 'Arturo Vega', autorizador_nombre: null, checklist_previo: false },
];

export const DEMO_CAPACITACIONES = [
  { id_capacitacion: 'cap-001', codigo: 'CAP-2024-008', titulo: 'Trabajo en Alturas — Nivel II STPS', tipo: 'OBLIGATORIA', instructor: 'Ing. Sandra Flores — STPS', fecha: '2024-04-05', duracion_horas: 16, estado: 'COMPLETADA', _count: { registros: 22 } },
  { id_capacitacion: 'cap-002', codigo: 'CAP-2024-009', titulo: 'Uso correcto de EPP y primeros auxilios', tipo: 'INDUCCION', instructor: 'Téc. Luis Moreno — HSE Interno', fecha: '2024-04-08', duracion_horas: 4, estado: 'COMPLETADA', _count: { registros: 38 } },
  { id_capacitacion: 'cap-003', codigo: 'CAP-2024-010', titulo: 'Manejo de residuos peligrosos NOM-052', tipo: 'ESPECIALIZADA', instructor: 'Ing. Sandra Flores — STPS', fecha: '2024-04-25', duracion_horas: 8, estado: 'PROGRAMADA', _count: { registros: 0 } },
];

// ─── COMPRAS — Comparativas de Cotización ────────────────────────────────────
export const DEMO_COMPARATIVAS = [
  {
    id: 'comp-001',
    requisicion_id: 'req-001',
    estado: 'EN_PROCESO',
    proveedores: [
      { id: 'pv-a', nombre: 'CEMEX México SA de CV' },
      { id: 'pv-b', nombre: 'Deacero Monterrey SA de CV' },
    ],
    lineas: [
      {
        id: 'lin-001', insumo_id: 'ins-001', insumo_clave: 'MAT-001',
        insumo_descripcion: 'Cemento Portland CPC 30R saco 50kg', insumo_unidad: 'SAC', cantidad: 200,
        precios: { 'pv-a': '285', 'pv-b': '295' }, ganador: 'pv-a',
      },
      {
        id: 'lin-002', insumo_id: 'ins-002', insumo_clave: 'MAT-002',
        insumo_descripcion: 'Varilla corrugada 3/8" x 12m G60', insumo_unidad: 'PZA', cantidad: 150,
        precios: { 'pv-a': '198', 'pv-b': '189' }, ganador: 'pv-b',
      },
      {
        id: 'lin-003', insumo_id: 'ins-015', insumo_clave: 'MAT-008',
        insumo_descripcion: "Concreto premezclado f'c=250 kg/cm²", insumo_unidad: 'M3', cantidad: 30,
        precios: { 'pv-a': '1680', 'pv-b': '' }, ganador: null,
      },
    ],
    ordenes_compra: [],
  },
  {
    id: 'comp-002',
    requisicion_id: 'req-004',
    estado: 'AUTORIZADA',
    proveedores: [
      { id: 'pv-x', nombre: 'Bloquera del Norte SA de CV' },
      { id: 'pv-y', nombre: 'Materiales Construcción GDL' },
    ],
    lineas: [
      {
        id: 'lin-004', insumo_id: 'ins-003', insumo_clave: 'MAT-003',
        insumo_descripcion: 'Block de concreto 15x20x40 cm', insumo_unidad: 'PZA', cantidad: 1000,
        precios: { 'pv-x': '17.5', 'pv-y': '18.9' }, ganador: 'pv-x',
      },
      {
        id: 'lin-005', insumo_id: 'ins-007', insumo_clave: 'MAT-007',
        insumo_descripcion: 'Tablaroca 1/2" x 1.22x2.44m', insumo_unidad: 'PZA', cantidad: 80,
        precios: { 'pv-x': '', 'pv-y': '205' }, ganador: 'pv-y',
      },
    ],
    ordenes_compra: [
      { codigo: 'OC-2024-045', proveedor_nombre: 'Bloquera del Norte SA de CV', total: 17500 },
      { codigo: 'OC-2024-046', proveedor_nombre: 'Materiales Construcción GDL', total: 16400 },
    ],
  },
];

// ─── COMPRAS — Almacén: Inventario ───────────────────────────────────────────
export const DEMO_INVENTARIO = [
  { id: 'inv-001', insumo_id: 'ins-001', clave: 'MAT-001', descripcion: 'Cemento Portland CPC 30R saco 50kg',         unidad: 'SAC', stock_actual:  45, stock_minimo: 100, ubicacion: 'Bodega A-01' },
  { id: 'inv-002', insumo_id: 'ins-002', clave: 'MAT-002', descripcion: 'Varilla corrugada 3/8" x 12m G60',           unidad: 'PZA', stock_actual: 280, stock_minimo: 200, ubicacion: 'Patio Exterior' },
  { id: 'inv-003', insumo_id: 'ins-003', clave: 'MAT-003', descripcion: 'Block de concreto 15x20x40 cm',              unidad: 'PZA', stock_actual:   0, stock_minimo: 500, ubicacion: 'Bodega B-02' },
  { id: 'inv-004', insumo_id: 'ins-005', clave: 'MAT-005', descripcion: 'Grava 3/4" puesta en obra m³',               unidad: 'M3',  stock_actual:  12, stock_minimo:  10, ubicacion: 'Patio Norte' },
  { id: 'inv-005', insumo_id: 'ins-006', clave: 'MAT-006', descripcion: 'Arena lavada m³',                            unidad: 'M3',  stock_actual:   3, stock_minimo:   8, ubicacion: 'Patio Norte' },
  { id: 'inv-006', insumo_id: 'ins-007', clave: 'MAT-007', descripcion: 'Tablaroca 1/2" x 1.22x2.44m',               unidad: 'PZA', stock_actual:  95, stock_minimo:  50, ubicacion: 'Bodega A-03' },
  { id: 'inv-007', insumo_id: 'ins-015', clave: 'MAT-008', descripcion: "Concreto premezclado f'c=250 kg/cm²",        unidad: 'M3',  stock_actual:   0, stock_minimo:  20, ubicacion: 'N/A — pedido directo' },
  { id: 'inv-008', insumo_id: 'ins-004', clave: 'MAT-004', descripcion: 'Impermeabilizante acrílico blanco 19L',      unidad: 'CUB', stock_actual:   8, stock_minimo:   5, ubicacion: 'Bodega A-02' },
];

// ─── COMPRAS — Almacén: Movimientos ─────────────────────────────────────────
export const DEMO_MOVIMIENTOS_ALMACEN = [
  { id: 'mov-001', tipo: 'INGRESO',  fecha: '2024-04-18', insumo_clave: 'MAT-002', insumo_descripcion: 'Varilla corrugada 3/8" x 12m G60',      cantidad: 150, unidad: 'PZA', origen: 'Proveedor: Deacero Monterrey',           destino: 'Patio Exterior',                 responsable: 'María López',      referencia: 'OC-2024-038' },
  { id: 'mov-002', tipo: 'EGRESO',   fecha: '2024-04-18', insumo_clave: 'MAT-001', insumo_descripcion: 'Cemento Portland CPC 30R saco 50kg',    cantidad:  80, unidad: 'SAC', origen: 'Bodega A-01',                           destino: 'Frente Nivel 12',                responsable: 'Roberto Hernández', referencia: 'REQ-2024-041' },
  { id: 'mov-003', tipo: 'EGRESO',   fecha: '2024-04-17', insumo_clave: 'MAT-007', insumo_descripcion: 'Tablaroca 1/2" x 1.22x2.44m',           cantidad:  40, unidad: 'PZA', origen: 'Bodega A-03',                           destino: 'Niveles 7-9 — Acabados',         responsable: 'Arturo Morales',   referencia: 'REQ-2024-043' },
  { id: 'mov-004', tipo: 'INGRESO',  fecha: '2024-04-17', insumo_clave: 'MAT-006', insumo_descripcion: 'Arena lavada m³',                        cantidad:   5, unidad: 'M3',  origen: 'Proveedor: Áridos del Norte SA',        destino: 'Patio Norte',                    responsable: 'María López',      referencia: 'OC-2024-035' },
  { id: 'mov-005', tipo: 'TRASPASO', fecha: '2024-04-16', insumo_clave: 'MAT-004', insumo_descripcion: 'Impermeabilizante acrílico blanco 19L', cantidad:   4, unidad: 'CUB', origen: 'Bodega A-02 (TCN-2024)',                destino: 'Bodega B-01 (Proy. RLP-2024)',   responsable: 'Ing. Juan Pérez', referencia: 'TRP-2024-005' },
  { id: 'mov-006', tipo: 'EGRESO',   fecha: '2024-04-15', insumo_clave: 'MAT-005', insumo_descripcion: 'Grava 3/4" puesta en obra m³',           cantidad:   8, unidad: 'M3',  origen: 'Patio Norte',                           destino: 'Zapatas PB — Zona D',            responsable: 'Ing. Carlos Ruiz', referencia: 'REQ-2024-042' },
  { id: 'mov-007', tipo: 'INGRESO',  fecha: '2024-04-14', insumo_clave: 'MAT-003', insumo_descripcion: 'Block de concreto 15x20x40 cm',          cantidad: 500, unidad: 'PZA', origen: 'Proveedor: Bloquera del Norte SA',      destino: 'Bodega B-02',                    responsable: 'María López',      referencia: 'OC-2024-032' },
  { id: 'mov-008', tipo: 'EGRESO',   fecha: '2024-04-14', insumo_clave: 'MAT-003', insumo_descripcion: 'Block de concreto 15x20x40 cm',          cantidad: 500, unidad: 'PZA', origen: 'Bodega B-02',                           destino: 'Muro perimetral — Eje NP',       responsable: 'Roberto Hernández', referencia: 'REQ-2024-038' },
  { id: 'mov-009', tipo: 'TRASPASO', fecha: '2024-04-12', insumo_clave: 'MAT-001', insumo_descripcion: 'Cemento Portland CPC 30R saco 50kg',    cantidad:  20, unidad: 'SAC', origen: 'Bodega A-01',                           destino: 'Bodega C-01 — Alm. Temporal N12', responsable: 'María López',     referencia: 'TRP-2024-004' },
  { id: 'mov-010', tipo: 'INGRESO',  fecha: '2024-04-10', insumo_clave: 'MAT-001', insumo_descripcion: 'Cemento Portland CPC 30R saco 50kg',    cantidad: 200, unidad: 'SAC', origen: 'Proveedor: CEMEX México SA de CV',      destino: 'Bodega A-01',                    responsable: 'María López',      referencia: 'OC-2024-029' },
];

// ─── VENTAS ──────────────────────────────────────────────────────────────────
export const DEMO_CLIENTES = [
  { id: 'cli-001', nombre: 'Inmobiliaria Monterrey Norte SA de CV', rfc: 'IMN920315AB1', email: 'contacto@inmobiliariamty.com', telefono: '81-4523-7890', estatus: 'ACTIVO' },
  { id: 'cli-002', nombre: 'Desarrollos Residenciales del Bajío', rfc: 'DRB010820CD3', email: 'compras@drb.mx', telefono: '477-318-4520', estatus: 'ACTIVO' },
  { id: 'cli-003', nombre: 'Grupo Inmobiliario Reforma SAPI de CV', rfc: 'GIR150601EF5', email: 'legal@gruporeforma.com.mx', telefono: '55-9125-6340', estatus: 'ACTIVO' },
  { id: 'cli-004', nombre: 'Torres Corporativas de Occidente SA', rfc: 'TCO050318GH7', email: 'administracion@torrescorp.mx', telefono: '33-3821-5670', estatus: 'INACTIVO' },
];

export const DEMO_COTIZACIONES = [
  { id: 'cot-001', folio: 'COT-2024-018', cliente: { nombre: 'Inmobiliaria Monterrey Norte SA de CV' }, monto_total: 12500000, estatus: 'ACEPTADA', created_at: '2024-03-20' },
  { id: 'cot-002', folio: 'COT-2024-019', cliente: { nombre: 'Desarrollos Residenciales del Bajío' }, monto_total: 8750000, estatus: 'ENVIADA', created_at: '2024-04-02' },
  { id: 'cot-003', folio: 'COT-2024-020', cliente: { nombre: 'Grupo Inmobiliario Reforma SAPI de CV' }, monto_total: 21300000, estatus: 'BORRADOR', created_at: '2024-04-15' },
];

export const DEMO_FACTURAS = [
  { id: 'fac-001', folio: 'FAC-A-00234', cliente: { nombre: 'Inmobiliaria Monterrey Norte SA de CV' }, monto_total: 3125000, estatus: 'PAGADA', fecha_emision: '2024-03-31' },
  { id: 'fac-002', folio: 'FAC-A-00235', cliente: { nombre: 'Inmobiliaria Monterrey Norte SA de CV' }, monto_total: 3125000, estatus: 'EMITIDA', fecha_emision: '2024-04-30' },
];

// ─── RESIDENCIA DE OBRA ───────────────────────────────────────────────────────

export const DEMO_ESTIMACIONES_RESIDENCIA = [
  { id: 'est-r-001', codigo: 'EST-TCN-001', numero: 1, periodo_inicio: '2024-02-01', periodo_fin: '2024-02-29', frente: 'Frente A — Cimentación', descripcion: 'Excavación y plantilla, zapatas y muro de cimentación', conceptos: 8, subtotal: 625000, iva: 100000, total_neto: 725000, estado: 'PAGADA',     fecha_autorizacion: '2024-03-15', autorizador: 'Ing. Juan Pérez Garza' },
  { id: 'est-r-002', codigo: 'EST-TCN-002', numero: 2, periodo_inicio: '2024-03-01', periodo_fin: '2024-03-31', frente: 'Frente A — Estructura',   descripcion: 'Colado de columnas y losas niveles 1-5',          conceptos: 12, subtotal: 780000, iva: 124800, total_neto: 904800, estado: 'PAGADA',     fecha_autorizacion: '2024-04-10', autorizador: 'Ing. Juan Pérez Garza' },
  { id: 'est-r-003', codigo: 'EST-TCN-003', numero: 3, periodo_inicio: '2024-04-01', periodo_fin: '2024-04-30', frente: 'Frente B — Instalaciones', descripcion: 'Instalaciones hidráulicas y eléctricas niveles 1-8', conceptos: 15, subtotal: 875000, iva: 140000, total_neto: 1015000, estado: 'AUTORIZADA', fecha_autorizacion: '2024-05-02', autorizador: 'Ing. Juan Pérez Garza' },
  { id: 'est-r-004', codigo: 'EST-TCN-004', numero: 4, periodo_inicio: '2024-05-01', periodo_fin: '2024-05-15', frente: 'Frente C — Acabados',      descripcion: 'Acabados nivel 7-10, cancelería fachada norte',   conceptos: 9,  subtotal: 975640, iva: 156102, total_neto: 1131742, estado: 'EN_REVISION', fecha_autorizacion: null, autorizador: null },
  { id: 'est-r-005', codigo: 'EST-TCN-005', numero: 5, periodo_inicio: '2024-05-16', periodo_fin: '2024-05-31', frente: 'Frente A — Impermeabilización', descripcion: 'Impermeabilización azotea y cisternas',        conceptos: 5,  subtotal: 342000, iva:  54720, total_neto:  396720, estado: 'BORRADOR',    fecha_autorizacion: null, autorizador: null },
];

export const DEMO_PRENOMINAS_RESIDENCIA = [
  {
    id: 'pnr-001', codigo: 'NOM-2024-07', periodo_tipo: 'QUINCENAL',
    periodo_inicio: '2024-04-01', periodo_fin: '2024-04-15',
    total_bruto: 198500, total_deducciones: 11000, total_neto: 187500,
    total_empleados: 38, estado: 'PAGADA',
    cuadrillas: [
      { nombre: 'Cuadrilla Estructura A',  empleados: 12, total: 79200 },
      { nombre: 'Cuadrilla Instalaciones', empleados:  8, total: 52400 },
      { nombre: 'Cuadrilla Acabados',      empleados: 10, total: 41800 },
      { nombre: 'Administrativos',          empleados:  8, total: 25100 },
    ],
  },
  {
    id: 'pnr-002', codigo: 'NOM-2024-08', periodo_tipo: 'QUINCENAL',
    periodo_inicio: '2024-04-16', periodo_fin: '2024-04-30',
    total_bruto: 202800, total_deducciones: 11600, total_neto: 191200,
    total_empleados: 40, estado: 'EN_PROCESO',
    cuadrillas: [
      { nombre: 'Cuadrilla Estructura A',  empleados: 13, total: 83200 },
      { nombre: 'Cuadrilla Instalaciones', empleados:  8, total: 53400 },
      { nombre: 'Cuadrilla Acabados',      empleados: 11, total: 42100 },
      { nombre: 'Subcontrato Cancelería',  empleados:  2, total:  6900 },
      { nombre: 'Administrativos',          empleados:  6, total: 16200 },
    ],
  },
  {
    id: 'pnr-003', codigo: 'NOM-2024-09', periodo_tipo: 'QUINCENAL',
    periodo_inicio: '2024-05-01', periodo_fin: '2024-05-15',
    total_bruto: 195600, total_deducciones: 10400, total_neto: 185200,
    total_empleados: 37, estado: 'PENDIENTE',
    cuadrillas: [
      { nombre: 'Cuadrilla Estructura A',  empleados: 11, total: 77400 },
      { nombre: 'Cuadrilla Instalaciones', empleados:  8, total: 52200 },
      { nombre: 'Cuadrilla Acabados',      empleados: 10, total: 41400 },
      { nombre: 'Administrativos',          empleados:  8, total: 24600 },
    ],
  },
];

export const DEMO_ASISTENCIA = [
  // ── 2024-05-21 · Cuadrilla Estructura A ────────────────────────────────────
  { id: 'a-001', fecha: '2024-05-21', cuadrilla_id: 'cua-001', cuadrilla_nombre: 'Cuadrilla Estructura A',  empleado_nombre: 'Roberto Hernández', puesto: 'Maestro de Obra',      hora_entrada: '07:03', hora_salida: '17:05', estado: 'PRESENTE',    tipo_registro: 'QR'     },
  { id: 'a-002', fecha: '2024-05-21', cuadrilla_id: 'cua-001', cuadrilla_nombre: 'Cuadrilla Estructura A',  empleado_nombre: 'Miguel Torres',      puesto: 'Oficial Albañil',       hora_entrada: '07:11', hora_salida: null,    estado: 'PRESENTE',    tipo_registro: 'QR'     },
  { id: 'a-003', fecha: '2024-05-21', cuadrilla_id: 'cua-001', cuadrilla_nombre: 'Cuadrilla Estructura A',  empleado_nombre: 'José Luis Mendoza',  puesto: 'Ayudante General',      hora_entrada: null,    hora_salida: null,    estado: 'AUSENTE',     tipo_registro: null     },
  { id: 'a-004', fecha: '2024-05-21', cuadrilla_id: 'cua-001', cuadrilla_nombre: 'Cuadrilla Estructura A',  empleado_nombre: 'Salvador Jiménez',   puesto: 'Soldador Estructural',  hora_entrada: null,    hora_salida: null,    estado: 'INCAPACIDAD', tipo_registro: null     },
  // ── 2024-05-21 · Cuadrilla Instalaciones ───────────────────────────────────
  { id: 'a-005', fecha: '2024-05-21', cuadrilla_id: 'cua-002', cuadrilla_nombre: 'Cuadrilla Instalaciones', empleado_nombre: 'Francisco Ramírez',  puesto: 'Electricista Oficial',  hora_entrada: '07:05', hora_salida: '17:00', estado: 'PRESENTE',    tipo_registro: 'QR'     },
  { id: 'a-006', fecha: '2024-05-21', cuadrilla_id: 'cua-002', cuadrilla_nombre: 'Cuadrilla Instalaciones', empleado_nombre: 'Alejandro García',   puesto: 'Plomero Oficial',       hora_entrada: '07:22', hora_salida: null,    estado: 'PRESENTE',    tipo_registro: 'MANUAL' },
  // ── 2024-05-21 · Cuadrilla Acabados ────────────────────────────────────────
  { id: 'a-007', fecha: '2024-05-21', cuadrilla_id: 'cua-003', cuadrilla_nombre: 'Cuadrilla Acabados',      empleado_nombre: 'Guillermo Morales',  puesto: 'Oficial Carpintero',    hora_entrada: '07:08', hora_salida: null,    estado: 'PRESENTE',    tipo_registro: 'QR'     },
  { id: 'a-008', fecha: '2024-05-21', cuadrilla_id: 'cua-003', cuadrilla_nombre: 'Cuadrilla Acabados',      empleado_nombre: 'Arturo Vega',        puesto: 'Residente de Obra',     hora_entrada: '08:01', hora_salida: null,    estado: 'PRESENTE',    tipo_registro: 'MANUAL' },
];
