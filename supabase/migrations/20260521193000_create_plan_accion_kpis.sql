create extension if not exists pgcrypto;

create table if not exists public.plan_accion_kpis (
  id uuid primary key default gen_random_uuid(),
  id_empresa uuid not null,
  numero_solicitud text not null,
  objetivo text not null,
  acciones_alta_prioridad int4 not null default 0,
  acciones_cerradas int4 not null default 0,
  acciones_en_riesgo int4 not null default 0,
  cumplimiento_promedio_kpi numeric(7,2) not null default 0,
  estado_general text not null default 'En seguimiento',
  creado_por uuid null,
  fecha_creacion timestamptz not null default now()
);

create table if not exists public.plan_accion_detalle (
  id uuid primary key default gen_random_uuid(),
  id_plan uuid not null references public.plan_accion_kpis(id) on delete cascade,
  fase text not null,
  accion text not null,
  responsable text not null,
  fecha_inicio date null,
  fecha_fin date null,
  impacto int4 not null,
  esfuerzo int4 not null,
  indice_prioridad numeric(8,2) not null default 0,
  prioridad text not null,
  estado text not null default 'No iniciado',
  fecha_creacion timestamptz not null default now(),
  constraint plan_accion_detalle_impacto_check check (impacto between 1 and 5),
  constraint plan_accion_detalle_esfuerzo_check check (esfuerzo between 1 and 5)
);

create table if not exists public.plan_kpi_detalle (
  id uuid primary key default gen_random_uuid(),
  id_plan uuid not null references public.plan_accion_kpis(id) on delete cascade,
  indicador text not null,
  valor_actual numeric(14,2) not null default 0,
  valor_meta numeric(14,2) not null default 0,
  porcentaje_cumplimiento numeric(7,2) not null default 0,
  fecha_creacion timestamptz not null default now(),
  constraint plan_kpi_detalle_valor_actual_non_negative check (valor_actual >= 0),
  constraint plan_kpi_detalle_valor_meta_non_negative check (valor_meta >= 0)
);

create index if not exists plan_accion_kpis_empresa_solicitud_idx
  on public.plan_accion_kpis (id_empresa, numero_solicitud);

create index if not exists plan_accion_detalle_plan_idx
  on public.plan_accion_detalle (id_plan);

create index if not exists plan_kpi_detalle_plan_idx
  on public.plan_kpi_detalle (id_plan);

alter table public.plan_accion_kpis enable row level security;
alter table public.plan_accion_detalle enable row level security;
alter table public.plan_kpi_detalle enable row level security;

create policy "Authenticated users can insert own plan accion kpis"
  on public.plan_accion_kpis
  for insert
  to authenticated
  with check (creado_por = auth.uid());

create policy "Authenticated users can select own plan accion kpis"
  on public.plan_accion_kpis
  for select
  to authenticated
  using (creado_por = auth.uid());

create policy "Authenticated users can insert own plan accion detalle"
  on public.plan_accion_detalle
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.plan_accion_kpis parent
      where parent.id = id_plan
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can select own plan accion detalle"
  on public.plan_accion_detalle
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plan_accion_kpis parent
      where parent.id = id_plan
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can insert own plan kpi detalle"
  on public.plan_kpi_detalle
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.plan_accion_kpis parent
      where parent.id = id_plan
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can select own plan kpi detalle"
  on public.plan_kpi_detalle
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plan_accion_kpis parent
      where parent.id = id_plan
        and parent.creado_por = auth.uid()
    )
  );
