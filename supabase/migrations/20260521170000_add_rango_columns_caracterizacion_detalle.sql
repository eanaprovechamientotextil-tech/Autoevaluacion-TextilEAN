alter table if exists public.caracterizacion_residuos_detalle
  add column if not exists nombre_rango_etapa text null,
  add column if not exists nombre_rango_tipo text null;
