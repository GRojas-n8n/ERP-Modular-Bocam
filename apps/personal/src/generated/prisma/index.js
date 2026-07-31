
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EmpleadoScalarFieldEnum = {
  id_empleado: 'id_empleado',
  tenant_id: 'tenant_id',
  numero_empleado: 'numero_empleado',
  nombre: 'nombre',
  apellido_paterno: 'apellido_paterno',
  apellido_materno: 'apellido_materno',
  rfc: 'rfc',
  curp: 'curp',
  nss: 'nss',
  puesto: 'puesto',
  categoria: 'categoria',
  tipo_contrato: 'tipo_contrato',
  fecha_ingreso: 'fecha_ingreso',
  fecha_baja: 'fecha_baja',
  salario_diario: 'salario_diario',
  salario_integrado: 'salario_integrado',
  salario_acordado: 'salario_acordado',
  telefono: 'telefono',
  email: 'email',
  contacto_emergencia: 'contacto_emergencia',
  certificaciones: 'certificaciones',
  estado: 'estado',
  modo_asistencia: 'modo_asistencia',
  tipo_jornada: 'tipo_jornada',
  hora_entrada_programada: 'hora_entrada_programada',
  hora_salida_programada: 'hora_salida_programada',
  horas_jornada: 'horas_jornada',
  cuadrilla_id: 'cuadrilla_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CuadrillaScalarFieldEnum = {
  id_cuadrilla: 'id_cuadrilla',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  nombre: 'nombre',
  codigo: 'codigo',
  especialidad: 'especialidad',
  capataz_id: 'capataz_id',
  capataz_nombre: 'capataz_nombre',
  estado: 'estado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AsignacionFrenteScalarFieldEnum = {
  id_asignacion: 'id_asignacion',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  empleado_id: 'empleado_id',
  cuadrilla_id: 'cuadrilla_id',
  frente_trabajo: 'frente_trabajo',
  turno: 'turno',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  horas_diarias: 'horas_diarias',
  estado: 'estado',
  es_prestamo: 'es_prestamo',
  created_at: 'created_at'
};

exports.Prisma.PreNominaScalarFieldEnum = {
  id_prenomina: 'id_prenomina',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  codigo: 'codigo',
  periodo_tipo: 'periodo_tipo',
  periodo_inicio: 'periodo_inicio',
  periodo_fin: 'periodo_fin',
  total_percepciones: 'total_percepciones',
  total_deducciones: 'total_deducciones',
  total_neto: 'total_neto',
  total_empleados: 'total_empleados',
  estado: 'estado',
  requiere_recalculo: 'requiere_recalculo',
  elaborado_por: 'elaborado_por',
  autorizado_por: 'autorizado_por',
  fecha_autorizacion: 'fecha_autorizacion',
  notas: 'notas',
  revisado_por_residencia: 'revisado_por_residencia',
  revisado_at: 'revisado_at',
  revisado_por_usuario_id: 'revisado_por_usuario_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PreNominaDetalleScalarFieldEnum = {
  id_detalle: 'id_detalle',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  prenomina_id: 'prenomina_id',
  empleado_id: 'empleado_id',
  origen_dias: 'origen_dias',
  dias_trabajados: 'dias_trabajados',
  horas_extra: 'horas_extra',
  salario_base: 'salario_base',
  monto_horas_extra: 'monto_horas_extra',
  bonos: 'bonos',
  total_percepciones: 'total_percepciones',
  deduccion_imss: 'deduccion_imss',
  deduccion_isr: 'deduccion_isr',
  otras_deducciones: 'otras_deducciones',
  total_deducciones: 'total_deducciones',
  neto_a_pagar: 'neto_a_pagar',
  horas_normales: 'horas_normales',
  monto_he_doble: 'monto_he_doble',
  monto_he_triple: 'monto_he_triple',
  origen_horas: 'origen_horas'
};

exports.Prisma.RegistroAsistenciaScalarFieldEnum = {
  id_registro: 'id_registro',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  empleado_id: 'empleado_id',
  cuadrilla_id: 'cuadrilla_id',
  fecha: 'fecha',
  estado: 'estado',
  tipo_registro: 'tipo_registro',
  horas_extra: 'horas_extra',
  registrado_por: 'registrado_por',
  hora_entrada: 'hora_entrada',
  hora_salida: 'hora_salida',
  horas_trabajadas: 'horas_trabajadas',
  horas_normales: 'horas_normales',
  horas_extra_dia: 'horas_extra_dia',
  origen_horas: 'origen_horas',
  ultimo_scan_en: 'ultimo_scan_en',
  created_at: 'created_at'
};

exports.Prisma.ConfigDeduccionEmpleadoScalarFieldEnum = {
  id_config: 'id_config',
  tenant_id: 'tenant_id',
  empleado_id: 'empleado_id',
  aplica_imss: 'aplica_imss',
  aplica_isr: 'aplica_isr',
  aplica_infonavit: 'aplica_infonavit',
  infonavit_num: 'infonavit_num',
  infonavit_monto: 'infonavit_monto',
  updated_at: 'updated_at'
};

exports.Prisma.NominaComplementariaScalarFieldEnum = {
  id_complemento: 'id_complemento',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  prenomina_id: 'prenomina_id',
  codigo: 'codigo',
  periodo_inicio: 'periodo_inicio',
  periodo_fin: 'periodo_fin',
  periodo_tipo: 'periodo_tipo',
  total_complemento: 'total_complemento',
  estado: 'estado',
  elaborado_por: 'elaborado_por',
  autorizado_por: 'autorizado_por',
  revisado_por_residencia: 'revisado_por_residencia',
  revisado_at: 'revisado_at',
  revisado_por_usuario_id: 'revisado_por_usuario_id',
  created_at: 'created_at'
};

exports.Prisma.NominaComplementariaDetalleScalarFieldEnum = {
  id_detalle: 'id_detalle',
  tenant_id: 'tenant_id',
  complemento_id: 'complemento_id',
  empleado_id: 'empleado_id',
  dias_trabajados: 'dias_trabajados',
  salario_acordado: 'salario_acordado',
  salario_imss_dia: 'salario_imss_dia',
  complemento_dia: 'complemento_dia',
  monto_complemento: 'monto_complemento'
};

exports.Prisma.ConfigNominaProyectoScalarFieldEnum = {
  id_config: 'id_config',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  periodicidad_pago: 'periodicidad_pago',
  configurado_por: 'configurado_por',
  updated_at: 'updated_at'
};

exports.Prisma.DocumentoEmpleadoScalarFieldEnum = {
  id_documento: 'id_documento',
  tenant_id: 'tenant_id',
  empleado_id: 'empleado_id',
  tipo_documento: 'tipo_documento',
  nombre_archivo: 'nombre_archivo',
  ruta_archivo: 'ruta_archivo',
  mime_type: 'mime_type',
  tamano_bytes: 'tamano_bytes',
  fecha_vigencia: 'fecha_vigencia',
  subido_por: 'subido_por',
  created_at: 'created_at'
};

exports.Prisma.AsignacionResidenteScalarFieldEnum = {
  id_asignacion: 'id_asignacion',
  tenant_id: 'tenant_id',
  empleado_id: 'empleado_id',
  residente_id: 'residente_id',
  fecha_inicio: 'fecha_inicio',
  fecha_fin: 'fecha_fin',
  asignado_por: 'asignado_por',
  es_principal: 'es_principal'
};

exports.Prisma.CredencialEmpleadoScalarFieldEnum = {
  id_credencial: 'id_credencial',
  tenant_id: 'tenant_id',
  empleado_id: 'empleado_id',
  token: 'token',
  activa: 'activa',
  emitida_en: 'emitida_en',
  emitida_por: 'emitida_por',
  revocada_en: 'revocada_en',
  revocada_por: 'revocada_por',
  motivo_revocacion: 'motivo_revocacion'
};

exports.Prisma.ConfigAsistenciaProyectoScalarFieldEnum = {
  id_config: 'id_config',
  tenant_id: 'tenant_id',
  proyecto_id: 'proyecto_id',
  lat: 'lat',
  lng: 'lng',
  radio_metros: 'radio_metros',
  configurado_por: 'configurado_por',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Empleado: 'Empleado',
  Cuadrilla: 'Cuadrilla',
  AsignacionFrente: 'AsignacionFrente',
  PreNomina: 'PreNomina',
  PreNominaDetalle: 'PreNominaDetalle',
  RegistroAsistencia: 'RegistroAsistencia',
  ConfigDeduccionEmpleado: 'ConfigDeduccionEmpleado',
  NominaComplementaria: 'NominaComplementaria',
  NominaComplementariaDetalle: 'NominaComplementariaDetalle',
  ConfigNominaProyecto: 'ConfigNominaProyecto',
  DocumentoEmpleado: 'DocumentoEmpleado',
  AsignacionResidente: 'AsignacionResidente',
  CredencialEmpleado: 'CredencialEmpleado',
  ConfigAsistenciaProyecto: 'ConfigAsistenciaProyecto'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\personal\\src\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "D:\\01_PROFESIONAL\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\apps\\personal\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// -----------------------------------------------------------------------------\n// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.\n// Módulo: Personal / RRHH\n// Clasificación: Estrictamente Confidencial.\n//\n// Entidades propias de este módulo:\n// 1. Empleado        — Ficha del trabajador (RFC, CURP, puesto, contrato)\n// 2. Cuadrilla        — Grupo de trabajo con capataz asignado\n// 3. AsignacionFrente — Registro de personal enviado a frentes por periodo\n// 4. PreNomina        — Cálculo pre-nómina semanal/quincenal\n// -----------------------------------------------------------------------------\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 1: Empleado\n// Ficha maestra del trabajador. Incluye datos fiscales, puesto,\n// tipo de contrato y estado activo/baja.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel Empleado {\n  id_empleado      String  @id @default(uuid()) @db.Uuid\n  tenant_id        String  @db.Uuid\n  numero_empleado  String  @db.VarChar(20) // Ej: \"EMP-001\"\n  nombre           String  @db.VarChar(150)\n  apellido_paterno String  @db.VarChar(100)\n  apellido_materno String? @db.VarChar(100)\n  rfc              String  @db.VarChar(13)\n  curp             String? @db.VarChar(18)\n  nss              String? @db.VarChar(11) // Número Seguro Social (IMSS)\n\n  // Puesto y contrato\n  puesto            String    @db.VarChar(100) // Ej: \"Fierrero\", \"Operador de Maquinaria\"\n  categoria         String    @default(\"OBRERO\") // OBRERO, TECNICO, ADMINISTRATIVO, SUPERVISOR\n  tipo_contrato     String    @default(\"PLANTA\") // PLANTA, EVENTUAL, SUBCONTRATO\n  fecha_ingreso     DateTime  @db.Date\n  fecha_baja        DateTime? @db.Date\n  salario_diario    Decimal   @db.Decimal(10, 2)\n  salario_integrado Decimal?  @db.Decimal(10, 2) // Para cálculo IMSS\n  salario_acordado  Decimal?  @db.Decimal(10, 2) // Salario real total acordado (para Complemento Salarial)\n\n  // Contacto\n  telefono            String? @db.VarChar(20)\n  email               String? @db.VarChar(100)\n  contacto_emergencia String? @db.VarChar(200)\n\n  // Certificaciones HSE\n  certificaciones String? @db.Text // JSON: [\"DC3-Alturas\", \"STyPS-01\"]\n\n  // Estado\n  estado String @default(\"ACTIVO\") // ACTIVO, BAJA, SUSPENDIDO, VACACIONES\n\n  // Jornada laboral\n  modo_asistencia         String  @default(\"JORNADA_COMPLETA\") // JORNADA_COMPLETA | POR_HORAS\n  tipo_jornada            String  @default(\"DIURNA\") // DIURNA | NOCTURNA | MIXTA\n  hora_entrada_programada String? @db.VarChar(5) // HH:MM — obligatorio si POR_HORAS\n  hora_salida_programada  String? @db.VarChar(5) // HH:MM\n  horas_jornada           Decimal @default(8) @db.Decimal(4, 2) // Duración jornada normal\n\n  // Relaciones\n  cuadrilla_id          String?               @db.Uuid\n  cuadrilla             Cuadrilla?            @relation(fields: [cuadrilla_id], references: [id_cuadrilla])\n  asignaciones          AsignacionFrente[]\n  prenominas            PreNominaDetalle[]\n  documentos            DocumentoEmpleado[]\n  asignacionesResidente AsignacionResidente[]\n  credenciales          CredencialEmpleado[]\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@unique([tenant_id, numero_empleado])\n  @@unique([tenant_id, rfc])\n  @@index([tenant_id])\n  @@index([tenant_id, estado])\n  @@map(\"empleados\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 2: Cuadrilla\n// Grupo de trabajo dirigido por un capataz. Se asigna completa a un frente.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel Cuadrilla {\n  id_cuadrilla   String  @id @default(uuid()) @db.Uuid\n  tenant_id      String  @db.Uuid\n  proyecto_id    String  @db.Uuid\n  nombre         String  @db.VarChar(100) // Ej: \"Cuadrilla Alfa - Cimentación\"\n  codigo         String  @db.VarChar(20) // Ej: \"CUA-01\"\n  especialidad   String  @db.VarChar(100) // Ej: \"Cimentación\", \"Estructura\", \"Acabados\"\n  capataz_id     String? @db.Uuid // ID del empleado líder\n  capataz_nombre String? @db.VarChar(200)\n  estado         String  @default(\"ACTIVA\") // ACTIVA, INACTIVA, REUBICADA\n\n  miembros     Empleado[]\n  asignaciones AsignacionFrente[]\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@unique([tenant_id, proyecto_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@map(\"cuadrillas\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 3: Asignación a Frente\n// Registra qué cuadrilla o empleado está asignado a qué frente de trabajo,\n// en qué turno y durante qué periodo. Permite calcular horas-hombre.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel AsignacionFrente {\n  id_asignacion  String    @id @default(uuid()) @db.Uuid\n  tenant_id      String    @db.Uuid\n  proyecto_id    String    @db.Uuid\n  empleado_id    String    @db.Uuid\n  cuadrilla_id   String?   @db.Uuid\n  frente_trabajo String    @db.VarChar(100) // Ej: \"Frente 1 — Cimentación\"\n  turno          String    @default(\"DIURNO\") // DIURNO, NOCTURNO, MIXTO\n  fecha_inicio   DateTime  @db.Date\n  fecha_fin      DateTime? @db.Date\n  horas_diarias  Decimal   @default(8) @db.Decimal(4, 2)\n  estado         String    @default(\"ACTIVA\") // ACTIVA, COMPLETADA, CANCELADA\n  // true = préstamo temporal a este proyecto (spec 02, sección 3), no\n  // asignación estructural — distingue en listados/UI sin cambiar la\n  // elegibilidad de nómina (obtenerEmpleadoIdsDelProyecto no filtra por esto).\n  es_prestamo    Boolean   @default(false)\n\n  empleado  Empleado   @relation(fields: [empleado_id], references: [id_empleado])\n  cuadrilla Cuadrilla? @relation(fields: [cuadrilla_id], references: [id_cuadrilla])\n\n  created_at DateTime @default(now())\n\n  @@index([tenant_id, proyecto_id])\n  @@index([tenant_id, proyecto_id, frente_trabajo])\n  @@map(\"asignaciones_frente\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 4: Pre-Nómina\n// Cálculo semanal/quincenal de la nómina antes de aprobación.\n// Agrupa detalles individuales por empleado.\n// Al autorizarse, emite evento PreNominaAutorizada → Finanzas.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel PreNomina {\n  id_prenomina       String    @id @default(uuid()) @db.Uuid\n  tenant_id          String    @db.Uuid\n  proyecto_id        String    @db.Uuid\n  codigo             String    @db.VarChar(50) // Ej: \"NOM-2026-S12\"\n  periodo_tipo       String    @default(\"SEMANAL\") // SEMANAL, QUINCENAL\n  periodo_inicio     DateTime  @db.Date\n  periodo_fin        DateTime  @db.Date\n  total_percepciones Decimal   @default(0) @db.Decimal(18, 2)\n  total_deducciones  Decimal   @default(0) @db.Decimal(18, 2)\n  total_neto         Decimal   @default(0) @db.Decimal(18, 2)\n  total_empleados    Int       @default(0)\n  estado             String    @default(\"BORRADOR\") // BORRADOR, CALCULADA, AUTORIZADA, PAGADA\n  requiere_recalculo Boolean   @default(false) // true = calculado con tasas antiguas\n  elaborado_por      String    @db.Uuid\n  autorizado_por     String?   @db.Uuid\n  fecha_autorizacion DateTime?\n  notas              String?   @db.Text\n\n  // Revisión de Residencia — prerequisito de /autorizar (con bypass admin).\n  // Ver specs/features/01-revision-nomina-residencia.md (D2).\n  revisado_por_residencia Boolean   @default(false)\n  revisado_at             DateTime?\n  revisado_por_usuario_id String?   @db.Uuid\n\n  detalles PreNominaDetalle[]\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@unique([tenant_id, codigo])\n  @@index([tenant_id, proyecto_id])\n  @@map(\"pre_nominas\")\n}\n\nmodel PreNominaDetalle {\n  id_detalle   String @id @default(uuid()) @db.Uuid\n  tenant_id    String @db.Uuid\n  proyecto_id  String @db.Uuid\n  prenomina_id String @db.Uuid\n  empleado_id  String @db.Uuid\n\n  // Cálculo\n  origen_dias        String  @default(\"ASISTENCIA\") // ASISTENCIA | ESTIMADO\n  dias_trabajados    Decimal @db.Decimal(4, 1)\n  horas_extra        Decimal @default(0) @db.Decimal(6, 2)\n  salario_base       Decimal @db.Decimal(10, 2) // salario_diario × días (JORNADA) o horas_normales × tarifa (POR_HORAS)\n  monto_horas_extra  Decimal @default(0) @db.Decimal(10, 2)\n  bonos              Decimal @default(0) @db.Decimal(10, 2)\n  total_percepciones Decimal @db.Decimal(10, 2)\n  deduccion_imss     Decimal @default(0) @db.Decimal(10, 2)\n  deduccion_isr      Decimal @default(0) @db.Decimal(10, 2)\n  otras_deducciones  Decimal @default(0) @db.Decimal(10, 2)\n  total_deducciones  Decimal @default(0) @db.Decimal(10, 2)\n  neto_a_pagar       Decimal @db.Decimal(10, 2)\n\n  // Campos exclusivos para modo POR_HORAS\n  horas_normales  Decimal? @db.Decimal(6, 2) // total horas normales del período\n  monto_he_doble  Decimal  @default(0) @db.Decimal(10, 2) // HE al 200% (primeras 9h/sem)\n  monto_he_triple Decimal  @default(0) @db.Decimal(10, 2) // HE al 300% (excedente 9h/sem)\n  origen_horas    String   @default(\"REAL\") // REAL | ESTIMADO\n\n  prenomina PreNomina @relation(fields: [prenomina_id], references: [id_prenomina], onDelete: Cascade)\n  empleado  Empleado  @relation(fields: [empleado_id], references: [id_empleado])\n\n  @@index([tenant_id, prenomina_id])\n  @@map(\"pre_nomina_detalles\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 5: Registro de Asistencia\n// Registro diario de asistencia por empleado. Alimenta el motor de nómina.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel RegistroAsistencia {\n  id_registro    String   @id @default(uuid()) @db.Uuid\n  tenant_id      String   @db.Uuid\n  proyecto_id    String   @db.Uuid\n  empleado_id    String   @db.Uuid\n  cuadrilla_id   String?  @db.Uuid\n  fecha          DateTime @db.Date\n  estado         String // PRESENTE | AUSENTE | INCAPACIDAD | JUSTIFICADA | FALTA\n  tipo_registro  String   @default(\"MANUAL\") // QR | MANUAL\n  horas_extra    Decimal  @default(0) @db.Decimal(4, 1)\n  registrado_por String   @db.Uuid\n\n  // Campos de jornada POR_HORAS\n  hora_entrada     String?   @db.VarChar(5) // HH:MM — primer scan / manual\n  hora_salida      String?   @db.VarChar(5) // HH:MM — segundo scan / manual\n  horas_trabajadas Decimal?  @db.Decimal(4, 2) // calculado: salida − entrada\n  horas_normales   Decimal?  @db.Decimal(4, 2) // min(horas_trabajadas, jornada)\n  horas_extra_dia  Decimal?  @db.Decimal(4, 2) // max(0, trabajadas − jornada)\n  origen_horas     String    @default(\"REAL\") // REAL | ESTIMADO\n  ultimo_scan_en   DateTime? // marca de tiempo exacta del último escaneo (cooldown anti-rescaneo)\n\n  created_at DateTime @default(now())\n\n  @@unique([tenant_id, empleado_id, fecha])\n  @@index([tenant_id, proyecto_id, fecha])\n  @@index([tenant_id, empleado_id])\n  @@map(\"registros_asistencia\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 6: Configuración de Deducciones por Empleado\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel ConfigDeduccionEmpleado {\n  id_config        String   @id @default(uuid()) @db.Uuid\n  tenant_id        String   @db.Uuid\n  empleado_id      String   @db.Uuid\n  aplica_imss      Boolean  @default(true)\n  aplica_isr       Boolean  @default(true)\n  aplica_infonavit Boolean  @default(false)\n  infonavit_num    String?  @db.VarChar(30)\n  infonavit_monto  Decimal? @db.Decimal(10, 2)\n\n  updated_at DateTime @updatedAt\n\n  @@unique([tenant_id, empleado_id])\n  @@index([tenant_id])\n  @@map(\"config_deducciones_empleados\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 7: Complemento Salarial\n// Segunda nómina sin deducciones: diferencia entre salario acordado y IMSS.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel NominaComplementaria {\n  id_complemento    String   @id @default(uuid()) @db.Uuid\n  tenant_id         String   @db.Uuid\n  proyecto_id       String   @db.Uuid\n  prenomina_id      String   @db.Uuid\n  codigo            String   @db.VarChar(30) // CS-2026-S01\n  periodo_inicio    DateTime @db.Date\n  periodo_fin       DateTime @db.Date\n  periodo_tipo      String // SEMANAL | QUINCENAL\n  total_complemento Decimal  @db.Decimal(12, 2)\n  estado            String   @default(\"BORRADOR\") // BORRADOR | AUTORIZADA\n  elaborado_por     String   @db.Uuid\n  autorizado_por    String?  @db.Uuid\n\n  // Revisión de Residencia — mismo patrón que PreNomina (D2).\n  revisado_por_residencia Boolean   @default(false)\n  revisado_at             DateTime?\n  revisado_por_usuario_id String?   @db.Uuid\n\n  created_at DateTime                      @default(now())\n  detalles   NominaComplementariaDetalle[]\n\n  @@index([tenant_id, proyecto_id])\n  @@map(\"nominas_complementarias\")\n}\n\nmodel NominaComplementariaDetalle {\n  id_detalle        String  @id @default(uuid()) @db.Uuid\n  tenant_id         String  @db.Uuid\n  complemento_id    String  @db.Uuid\n  empleado_id       String  @db.Uuid\n  dias_trabajados   Decimal @db.Decimal(4, 1)\n  salario_acordado  Decimal @db.Decimal(10, 2)\n  salario_imss_dia  Decimal @db.Decimal(10, 2)\n  complemento_dia   Decimal @db.Decimal(10, 2)\n  monto_complemento Decimal @db.Decimal(10, 2)\n\n  complemento NominaComplementaria @relation(fields: [complemento_id], references: [id_complemento], onDelete: Cascade)\n\n  @@index([tenant_id, complemento_id])\n  @@map(\"nominas_complementarias_detalle\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 8: Config Nómina por Proyecto\n// Periodicidad de pago (SEMANAL/QUINCENAL/MENSUAL) configurada por RH a\n// nivel proyecto. Los empleados asignados al proyecto la heredan\n// automáticamente — no existe periodicidad por empleado.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel ConfigNominaProyecto {\n  id_config         String   @id @default(uuid()) @db.Uuid\n  tenant_id         String   @db.Uuid\n  proyecto_id       String   @db.Uuid\n  periodicidad_pago String   @default(\"SEMANAL\") // SEMANAL | QUINCENAL | MENSUAL\n  configurado_por   String   @db.Uuid\n  updated_at        DateTime @updatedAt\n\n  @@unique([tenant_id, proyecto_id])\n  @@map(\"config_nomina_proyecto\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 9: Documento de Expediente del Empleado\n// INE, comprobante de domicilio, constancias de curso/capacitación, etc.\n// Almacenamiento en volumen propio (no depende de Calidad).\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel DocumentoEmpleado {\n  id_documento   String    @id @default(uuid()) @db.Uuid\n  tenant_id      String    @db.Uuid\n  empleado_id    String    @db.Uuid\n  tipo_documento String // INE | COMPROBANTE_DOMICILIO | CURSO_CAPACITACION | CONTRATO | OTRO\n  nombre_archivo String    @db.VarChar(255)\n  ruta_archivo   String    @db.VarChar(500)\n  mime_type      String    @db.VarChar(100)\n  tamano_bytes   Int\n  fecha_vigencia DateTime? @db.Date\n  subido_por     String    @db.Uuid\n  created_at     DateTime  @default(now())\n\n  empleado Empleado @relation(fields: [empleado_id], references: [id_empleado])\n\n  @@index([tenant_id, empleado_id])\n  @@index([tenant_id, fecha_vigencia])\n  @@map(\"documentos_empleado\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 10: Asignación de Empleado a Residente(s)\n// Relación N:N con historial simple (fecha_fin nula = vigente). residente_id\n// es una referencia opaca a un usuario de `auth` (sin JOIN cruzado).\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel AsignacionResidente {\n  id_asignacion String    @id @default(uuid()) @db.Uuid\n  tenant_id     String    @db.Uuid\n  empleado_id   String    @db.Uuid\n  residente_id  String    @db.Uuid\n  fecha_inicio  DateTime  @default(now())\n  fecha_fin     DateTime?\n  asignado_por  String    @db.Uuid\n  // Un empleado puede tener varias asignaciones vigentes a la vez (personal\n  // compartido, ver spec 02) — es_principal marca cuál es el residente \"a\n  // cargo por default\" sin cerrar ni afectar a las demás. No es exclusividad,\n  // es solo una etiqueta sobre asignaciones que siguen todas vigentes.\n  es_principal  Boolean   @default(true)\n\n  empleado Empleado @relation(fields: [empleado_id], references: [id_empleado])\n\n  @@index([tenant_id, empleado_id])\n  @@index([tenant_id, residente_id])\n  @@map(\"asignaciones_residente\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 11: Credencial de Empleado\n// Token opaco y revocable impreso como QR en la credencial física. Cada fila\n// es un evento de emisión — revocar = activa=false, reemitir = fila nueva.\n// El token NUNCA autentica por sí solo: la autorización real vive en la\n// sesión JWT de quien escanea (ver asistencia-qr-segura).\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel CredencialEmpleado {\n  id_credencial     String    @id @default(uuid()) @db.Uuid\n  tenant_id         String    @db.Uuid\n  empleado_id       String    @db.Uuid\n  token             String    @db.VarChar(64)\n  activa            Boolean   @default(true)\n  emitida_en        DateTime  @default(now())\n  emitida_por       String    @db.Uuid\n  revocada_en       DateTime?\n  revocada_por      String?   @db.Uuid\n  motivo_revocacion String?   @db.VarChar(200)\n\n  empleado Empleado @relation(fields: [empleado_id], references: [id_empleado])\n\n  @@unique([tenant_id, token])\n  @@index([tenant_id, empleado_id])\n  @@map(\"credenciales_empleado\")\n}\n\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n// ENTIDAD 12: Config de Asistencia por Proyecto (geofencing opcional)\n// Sin entidad Proyecto propia (mismo patrón que ConfigNominaProyecto). Si no\n// existe fila para un proyecto, el escaneo no valida ubicación.\n// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nmodel ConfigAsistenciaProyecto {\n  id_config       String   @id @default(uuid()) @db.Uuid\n  tenant_id       String   @db.Uuid\n  proyecto_id     String   @db.Uuid\n  lat             Decimal  @db.Decimal(9, 6)\n  lng             Decimal  @db.Decimal(9, 6)\n  radio_metros    Int      @default(300)\n  configurado_por String   @db.Uuid\n  updated_at      DateTime @updatedAt\n\n  @@unique([tenant_id, proyecto_id])\n  @@map(\"config_asistencia_proyecto\")\n}\n",
  "inlineSchemaHash": "a2b825dc915455fbec130f2473d1f981550697c6cda61962b22afb328b0ecc57",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma",
    "generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Empleado\":{\"dbName\":\"empleados\",\"fields\":[{\"name\":\"id_empleado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_empleado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"apellido_paterno\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"apellido_materno\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rfc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"curp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nss\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"puesto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"OBRERO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_contrato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PLANTA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_ingreso\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_baja\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_diario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_integrado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_acordado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefono\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contacto_emergencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"certificaciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ACTIVO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modo_asistencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"JORNADA_COMPLETA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_jornada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"DIURNA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora_entrada_programada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora_salida_programada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_jornada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":8,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadrilla_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadrilla\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Cuadrilla\",\"relationName\":\"CuadrillaToEmpleado\",\"relationFromFields\":[\"cuadrilla_id\"],\"relationToFields\":[\"id_cuadrilla\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"asignaciones\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AsignacionFrente\",\"relationName\":\"AsignacionFrenteToEmpleado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prenominas\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PreNominaDetalle\",\"relationName\":\"EmpleadoToPreNominaDetalle\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DocumentoEmpleado\",\"relationName\":\"DocumentoEmpleadoToEmpleado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"asignacionesResidente\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AsignacionResidente\",\"relationName\":\"AsignacionResidenteToEmpleado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"credenciales\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CredencialEmpleado\",\"relationName\":\"CredencialEmpleadoToEmpleado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"numero_empleado\"],[\"tenant_id\",\"rfc\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"numero_empleado\"]},{\"name\":null,\"fields\":[\"tenant_id\",\"rfc\"]}],\"isGenerated\":false},\"Cuadrilla\":{\"dbName\":\"cuadrillas\",\"fields\":[{\"name\":\"id_cuadrilla\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"especialidad\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capataz_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capataz_nombre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ACTIVA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"miembros\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"CuadrillaToEmpleado\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"asignaciones\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AsignacionFrente\",\"relationName\":\"AsignacionFrenteToCuadrilla\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"proyecto_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"proyecto_id\",\"codigo\"]}],\"isGenerated\":false},\"AsignacionFrente\":{\"dbName\":\"asignaciones_frente\",\"fields\":[{\"name\":\"id_asignacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadrilla_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frente_trabajo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"turno\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"DIURNO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_diarias\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":8,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ACTIVA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"es_prestamo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"AsignacionFrenteToEmpleado\",\"relationFromFields\":[\"empleado_id\"],\"relationToFields\":[\"id_empleado\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadrilla\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Cuadrilla\",\"relationName\":\"AsignacionFrenteToCuadrilla\",\"relationFromFields\":[\"cuadrilla_id\"],\"relationToFields\":[\"id_cuadrilla\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PreNomina\":{\"dbName\":\"pre_nominas\",\"fields\":[{\"name\":\"id_prenomina\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"SEMANAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_percepciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_deducciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_neto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_empleados\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requiere_recalculo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"elaborado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autorizado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_autorizacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_por_residencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_por_usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"detalles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PreNominaDetalle\",\"relationName\":\"PreNominaToPreNominaDetalle\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"codigo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"codigo\"]}],\"isGenerated\":false},\"PreNominaDetalle\":{\"dbName\":\"pre_nomina_detalles\",\"fields\":[{\"name\":\"id_detalle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prenomina_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origen_dias\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"ASISTENCIA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dias_trabajados\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_extra\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_base\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_horas_extra\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bonos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_percepciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduccion_imss\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deduccion_isr\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"otras_deducciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_deducciones\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"neto_a_pagar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_normales\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_he_doble\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_he_triple\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origen_horas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"REAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prenomina\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PreNomina\",\"relationName\":\"PreNominaToPreNominaDetalle\",\"relationFromFields\":[\"prenomina_id\"],\"relationToFields\":[\"id_prenomina\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"EmpleadoToPreNominaDetalle\",\"relationFromFields\":[\"empleado_id\"],\"relationToFields\":[\"id_empleado\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RegistroAsistencia\":{\"dbName\":\"registros_asistencia\",\"fields\":[{\"name\":\"id_registro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cuadrilla_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_registro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"MANUAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_extra\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registrado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora_entrada\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora_salida\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_trabajadas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_normales\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horas_extra_dia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origen_horas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"REAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultimo_scan_en\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"empleado_id\",\"fecha\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"empleado_id\",\"fecha\"]}],\"isGenerated\":false},\"ConfigDeduccionEmpleado\":{\"dbName\":\"config_deducciones_empleados\",\"fields\":[{\"name\":\"id_config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aplica_imss\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aplica_isr\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aplica_infonavit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"infonavit_num\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"infonavit_monto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"empleado_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"empleado_id\"]}],\"isGenerated\":false},\"NominaComplementaria\":{\"dbName\":\"nominas_complementarias\",\"fields\":[{\"name\":\"id_complemento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prenomina_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_complemento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BORRADOR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"elaborado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autorizado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_por_residencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revisado_por_usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"detalles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NominaComplementariaDetalle\",\"relationName\":\"NominaComplementariaToNominaComplementariaDetalle\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NominaComplementariaDetalle\":{\"dbName\":\"nominas_complementarias_detalle\",\"fields\":[{\"name\":\"id_detalle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"complemento_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dias_trabajados\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_acordado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salario_imss_dia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"complemento_dia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monto_complemento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"complemento\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NominaComplementaria\",\"relationName\":\"NominaComplementariaToNominaComplementariaDetalle\",\"relationFromFields\":[\"complemento_id\"],\"relationToFields\":[\"id_complemento\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ConfigNominaProyecto\":{\"dbName\":\"config_nomina_proyecto\",\"fields\":[{\"name\":\"id_config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodicidad_pago\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"SEMANAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"configurado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"proyecto_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"proyecto_id\"]}],\"isGenerated\":false},\"DocumentoEmpleado\":{\"dbName\":\"documentos_empleado\",\"fields\":[{\"name\":\"id_documento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_documento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nombre_archivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ruta_archivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mime_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tamano_bytes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_vigencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subido_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"DocumentoEmpleadoToEmpleado\",\"relationFromFields\":[\"empleado_id\"],\"relationToFields\":[\"id_empleado\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AsignacionResidente\":{\"dbName\":\"asignaciones_residente\",\"fields\":[{\"name\":\"id_asignacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"residente_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fecha_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"asignado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"es_principal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"AsignacionResidenteToEmpleado\",\"relationFromFields\":[\"empleado_id\"],\"relationToFields\":[\"id_empleado\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CredencialEmpleado\":{\"dbName\":\"credenciales_empleado\",\"fields\":[{\"name\":\"id_credencial\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emitida_en\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emitida_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revocada_en\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revocada_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"motivo_revocacion\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empleado\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Empleado\",\"relationName\":\"CredencialEmpleadoToEmpleado\",\"relationFromFields\":[\"empleado_id\"],\"relationToFields\":[\"id_empleado\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"token\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"token\"]}],\"isGenerated\":false},\"ConfigAsistenciaProyecto\":{\"dbName\":\"config_asistencia_proyecto\",\"fields\":[{\"name\":\"id_config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proyecto_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lng\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"radio_metros\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":300,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"configurado_por\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"proyecto_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"proyecto_id\"]}],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "src/generated/prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma")
