export type CaracterizacionRow = {
  etapa_generacion: string;
  tipo_residuo: string;
  material: string;
  nombre_rango_etapa?: string | null;
  nombre_rango_tipo?: string | null;
  cantidad_residuos_kg_mes: number;
  cantidad_aprovechable_kg_mes: number;
  estrategia: string;
  potencial: string;
  observaciones: string;
};
