create extension if not exists pgcrypto;

create table if not exists public.caracterizacion_residuos (
  id uuid primary key default gen_random_uuid(),
  id_empresa uuid not null,
  numero_solicitud text not null,
  total_residuos_kg_mes numeric(14,2) not null default 0,
  total_aprovechable_kg_mes numeric(14,2) not null default 0,
  porcentaje_total_aprovechable numeric(7,2) not null default 0,
  conclusion_automatica text not null,
  creado_por uuid null,
  created_at timestamptz not null default now(),
  constraint caracterizacion_residuos_residuos_non_negative
    check (total_residuos_kg_mes >= 0),
  constraint caracterizacion_residuos_aprovechable_non_negative
    check (total_aprovechable_kg_mes >= 0)
);

create table if not exists public.caracterizacion_residuos_detalle (
  id uuid primary key default gen_random_uuid(),
  id_caracterizacion uuid not null references public.caracterizacion_residuos(id) on delete cascade,
  etapa_generacion text not null,
  tipo_residuo text not null,
  material text not null,
  cantidad_residuos_kg_mes numeric(14,2) not null default 0,
  cantidad_aprovechable_kg_mes numeric(14,2) not null default 0,
  porcentaje_aprovechable numeric(7,2) not null default 0,
  estrategia text not null,
  potencial text not null,
  observaciones text null,
  created_at timestamptz not null default now(),
  constraint caracterizacion_residuos_detalle_residuos_non_negative
    check (cantidad_residuos_kg_mes >= 0),
  constraint caracterizacion_residuos_detalle_aprovechable_non_negative
    check (cantidad_aprovechable_kg_mes >= 0)
);

create index if not exists caracterizacion_residuos_empresa_solicitud_idx
  on public.caracterizacion_residuos (id_empresa, numero_solicitud);

create index if not exists caracterizacion_residuos_detalle_parent_idx
  on public.caracterizacion_residuos_detalle (id_caracterizacion);

alter table public.caracterizacion_residuos enable row level security;
alter table public.caracterizacion_residuos_detalle enable row level security;

create policy "Authenticated users can insert own caracterizacion resumen"
  on public.caracterizacion_residuos
  for insert
  to authenticated
  with check (creado_por = auth.uid());

create policy "Authenticated users can select own caracterizacion resumen"
  on public.caracterizacion_residuos
  for select
  to authenticated
  using (creado_por = auth.uid());

create policy "Authenticated users can insert caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.caracterizacion_residuos parent
      where parent.id = id_caracterizacion
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can select caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.caracterizacion_residuos parent
      where parent.id = id_caracterizacion
        and parent.creado_por = auth.uid()
    )
  );
