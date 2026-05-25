create table if not exists public.matriz_seguimiento (
  id uuid primary key default gen_random_uuid(),
  id_empresa uuid not null,
  numero_solicitud text not null,
  promedio_cumplimiento numeric(6,2),
  nivel_cumplimiento text,
  interpretacion text,
  creado_por uuid,
  fecha_creacion timestamptz not null default now()
);

create table if not exists public.matriz_seguimiento_detalle (
  id uuid primary key default gen_random_uuid(),
  id_matriz uuid not null references public.matriz_seguimiento(id) on delete cascade,
  etapa text not null,
  accion text not null,
  kpi text not null,
  resultado text,
  cumplimiento numeric(4,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists matriz_seguimiento_empresa_solicitud_idx
  on public.matriz_seguimiento (id_empresa, numero_solicitud);

create index if not exists matriz_seguimiento_detalle_parent_idx
  on public.matriz_seguimiento_detalle (id_matriz);

alter table public.matriz_seguimiento enable row level security;
alter table public.matriz_seguimiento_detalle enable row level security;

create policy "Authenticated users can insert own matriz seguimiento"
  on public.matriz_seguimiento
  for insert
  to authenticated
  with check (creado_por = auth.uid());

create policy "Authenticated users can select own matriz seguimiento"
  on public.matriz_seguimiento
  for select
  to authenticated
  using (creado_por = auth.uid());

create policy "Authenticated users can update own matriz seguimiento"
  on public.matriz_seguimiento
  for update
  to authenticated
  using (creado_por = auth.uid())
  with check (creado_por = auth.uid());

create policy "Authenticated users can insert matriz detalle from own parent"
  on public.matriz_seguimiento_detalle
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.matriz_seguimiento parent
      where parent.id = id_matriz
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can select matriz detalle from own parent"
  on public.matriz_seguimiento_detalle
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.matriz_seguimiento parent
      where parent.id = id_matriz
        and parent.creado_por = auth.uid()
    )
  );

create policy "Authenticated users can delete matriz detalle from own parent"
  on public.matriz_seguimiento_detalle
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.matriz_seguimiento parent
      where parent.id = id_matriz
        and parent.creado_por = auth.uid()
    )
  );
