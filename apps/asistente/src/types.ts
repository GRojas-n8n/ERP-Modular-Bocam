export interface RenglonCotizacion {
  descripcion: string;
  unidad: string;
  cantidad: number | null;
  precio_unitario: number | null;
}

export interface LecturaCotizacionResult {
  proveedor: string;
  renglones: RenglonCotizacion[];
}

export interface ResumenEjecutivo {
  resumen: string;
  modulos_con_error: string[];
  generado_en: string;
}

export type SeveridadAlerta = 'alta' | 'media';

export interface AlertaPredictiva {
  titulo: string;
  descripcion: string;
  recomendacion: string;
  severidad: SeveridadAlerta;
}

export interface AlertasPredictivas {
  alertas: AlertaPredictiva[];
  proyecto_saludable: boolean;
}
