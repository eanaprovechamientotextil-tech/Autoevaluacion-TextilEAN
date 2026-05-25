create extension if not exists pgcrypto;

create table if not exists public.company_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  company_name text not null,
  employee_count int4 not null,
  company_size text not null,
  address text not null,
  city text not null,
  waste_manager_name text not null,
  contact_phone text not null,
  contact_role text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  constraint company_requests_company_size_check
    check (company_size in ('Pequeña', 'Mediana', 'Grande'))
);

create unique index if not exists company_requests_request_number_idx
  on public.company_requests (request_number);

alter table public.company_requests enable row level security;

create policy "Authenticated users can insert own company requests"
  on public.company_requests
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Authenticated users can select own company requests"
  on public.company_requests
  for select
  to authenticated
  using (created_by = auth.uid());
