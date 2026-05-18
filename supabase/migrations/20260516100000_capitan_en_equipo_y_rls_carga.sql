-- Capitán asignado por equipo + políticas para carga de resultados
-- Ejecutar después del bootstrap inicial (proyectos ya creados).

alter table public.equipos
add column if not exists id_usuario_capitan uuid references auth.users (id) on delete set null;

create index if not exists idx_equipos_id_usuario_capitan on public.equipos (id_usuario_capitan);

comment on column public.equipos.id_usuario_capitan is 'Usuario Auth del capitán que puede cargar resultados de encuentros de este equipo.';

-- ---------------------------------------------------------------------------
-- Funciones auxiliares RLS
-- ---------------------------------------------------------------------------

create or replace function public.usuario_es_capitan_equipo(p_id_equipo uuid, p_id_usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_id_equipo is not null
    and p_id_usuario is not null
    and exists (
      select 1
      from public.equipos e
      where e.id = p_id_equipo
        and e.id_usuario_capitan = p_id_usuario
    );
$$;

create or replace function public.usuario_puede_cargar_encuentro(p_id_encuentro uuid, p_id_usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_id_encuentro is not null
    and p_id_usuario is not null
    and (
      public.usuario_es_admin(p_id_usuario)
      or exists (
        select 1
        from public.encuentros enc
        where enc.id = p_id_encuentro
          and (
            public.usuario_es_capitan_equipo(enc.id_equipo_local, p_id_usuario)
            or public.usuario_es_capitan_equipo(enc.id_equipo_visitante, p_id_usuario)
          )
      )
    );
$$;

grant execute on function public.usuario_es_capitan_equipo(uuid, uuid) to anon, authenticated;
grant execute on function public.usuario_puede_cargar_encuentro(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Políticas: capitán puede actualizar encuentros y parciales de sus partidos
-- ---------------------------------------------------------------------------

create policy "Encuentros: capitán carga resultados en sus partidos"
on public.encuentros
for update
using (public.usuario_puede_cargar_encuentro(id, auth.uid()))
with check (public.usuario_puede_cargar_encuentro(id, auth.uid()));

create policy "Parciales: capitán carga en sus partidos"
on public.parciales_encuentro
for all
using (
  public.usuario_puede_cargar_encuentro(id_encuentro, auth.uid())
)
with check (
  public.usuario_puede_cargar_encuentro(id_encuentro, auth.uid())
);

-- Recalcular clasificación (capitán y admin tras guardar resultados)
create or replace function public.recalcular_clasificacion_division(
  p_id_torneo uuid,
  p_id_division uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  eq record;
  enc record;
  par record;
  st record;
begin
  for eq in
    select id from public.equipos
    where id_torneo = p_id_torneo and id_division = p_id_division
  loop
    insert into public.clasificacion_equipos (
      id_torneo, id_division, id_equipo,
      partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
      disparos_a_favor, disparos_en_contra, parciales_ganados, parciales_perdidos, puntos
    )
    values (p_id_torneo, p_id_division, eq.id, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    on conflict (id_torneo, id_division, id_equipo) do update set
      partidos_jugados = 0,
      partidos_ganados = 0,
      partidos_empatados = 0,
      partidos_perdidos = 0,
      disparos_a_favor = 0,
      disparos_en_contra = 0,
      parciales_ganados = 0,
      parciales_perdidos = 0,
      puntos = 0,
      actualizado_en = now();
  end loop;

  for enc in
    select *
    from public.encuentros
    where id_torneo = p_id_torneo
      and id_division = p_id_division
      and estado = 'jugado'
  loop
    update public.clasificacion_equipos c
    set
      partidos_jugados = partidos_jugados + 1,
      disparos_a_favor = disparos_a_favor + coalesce(enc.disparos_totales_local, 0),
      disparos_en_contra = disparos_en_contra + coalesce(enc.disparos_totales_visitante, 0),
      puntos = puntos + coalesce(enc.puntos_encuentro_local, 0),
      partidos_ganados = partidos_ganados + case
        when coalesce(enc.puntos_encuentro_local, 0) > coalesce(enc.puntos_encuentro_visitante, 0) then 1 else 0 end,
      partidos_perdidos = partidos_perdidos + case
        when coalesce(enc.puntos_encuentro_local, 0) < coalesce(enc.puntos_encuentro_visitante, 0) then 1 else 0 end,
      partidos_empatados = partidos_empatados + case
        when coalesce(enc.puntos_encuentro_local, 0) = coalesce(enc.puntos_encuentro_visitante, 0) then 1 else 0 end,
      actualizado_en = now()
  where c.id_equipo = enc.id_equipo_local;

    update public.clasificacion_equipos c
    set
      partidos_jugados = partidos_jugados + 1,
      disparos_a_favor = disparos_a_favor + coalesce(enc.disparos_totales_visitante, 0),
      disparos_en_contra = disparos_en_contra + coalesce(enc.disparos_totales_local, 0),
      puntos = puntos + coalesce(enc.puntos_encuentro_visitante, 0),
      partidos_ganados = partidos_ganados + case
        when coalesce(enc.puntos_encuentro_visitante, 0) > coalesce(enc.puntos_encuentro_local, 0) then 1 else 0 end,
      partidos_perdidos = partidos_perdidos + case
        when coalesce(enc.puntos_encuentro_visitante, 0) < coalesce(enc.puntos_encuentro_local, 0) then 1 else 0 end,
      partidos_empatados = partidos_empatados + case
        when coalesce(enc.puntos_encuentro_visitante, 0) = coalesce(enc.puntos_encuentro_local, 0) then 1 else 0 end,
      actualizado_en = now()
    where c.id_equipo = enc.id_equipo_visitante;
  end loop;

  for par in
    select p.ganador, e.id_equipo_local, e.id_equipo_visitante
    from public.parciales_encuentro p
    join public.encuentros e on e.id = p.id_encuentro
    where e.id_torneo = p_id_torneo
      and e.id_division = p_id_division
      and e.estado = 'jugado'
  loop
    if par.ganador = 'local' then
      update public.clasificacion_equipos
      set parciales_ganados = parciales_ganados + 1, actualizado_en = now()
      where id_equipo = par.id_equipo_local;
      update public.clasificacion_equipos
      set parciales_perdidos = parciales_perdidos + 1, actualizado_en = now()
      where id_equipo = par.id_equipo_visitante;
    elsif par.ganador = 'visitante' then
      update public.clasificacion_equipos
      set parciales_ganados = parciales_ganados + 1, actualizado_en = now()
      where id_equipo = par.id_equipo_visitante;
      update public.clasificacion_equipos
      set parciales_perdidos = parciales_perdidos + 1, actualizado_en = now()
      where id_equipo = par.id_equipo_local;
    end if;
  end loop;
end;
$$;

grant execute on function public.recalcular_clasificacion_division(uuid, uuid) to authenticated;

-- Resolver correo → uuid (solo admins deberían invocarlo desde la app de gestión)
create or replace function public.id_usuario_por_correo(p_correo text)
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select id from auth.users where lower(email) = lower(trim(p_correo)) limit 1;
$$;

grant execute on function public.id_usuario_por_correo(text) to authenticated;
