drop policy if exists "Authenticated users can update own caracterizacion resumen"
  on public.caracterizacion_residuos;

create policy "Authenticated users can update own caracterizacion resumen"
  on public.caracterizacion_residuos
  for update
  to authenticated
  using (creado_por = auth.uid())
  with check (creado_por = auth.uid());

drop policy if exists "Authenticated users can delete own caracterizacion resumen"
  on public.caracterizacion_residuos;

create policy "Authenticated users can delete own caracterizacion resumen"
  on public.caracterizacion_residuos
  for delete
  to authenticated
  using (creado_por = auth.uid());

drop policy if exists "Authenticated users can update caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle;

create policy "Authenticated users can update caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.caracterizacion_residuos parent
      where parent.id = id_caracterizacion
        and parent.creado_por = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.caracterizacion_residuos parent
      where parent.id = id_caracterizacion
        and parent.creado_por = auth.uid()
    )
  );

drop policy if exists "Authenticated users can delete caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle;

create policy "Authenticated users can delete caracterizacion detalle from own resumen"
  on public.caracterizacion_residuos_detalle
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.caracterizacion_residuos parent
      where parent.id = id_caracterizacion
        and parent.creado_por = auth.uid()
    )
  );
