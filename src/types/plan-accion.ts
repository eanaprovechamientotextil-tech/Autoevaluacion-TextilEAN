export type ActionRow = {
  locked?: boolean;
  fase: string;
  accion: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  impacto: number | "";
  esfuerzo: number | "";
  estado: string;
};

export type KpiRow = {
  indicador: string;
  actual: number;
  meta: number;
};
