-- Políticas RLS y perfiles de aplicación (Bowls Argentina)
-- Lectura pública para torneos en estado "publicado"; ABM operativo reservado a roles admin.
-- Convención: nombres de políticas y comentarios en español.

-- ---------------------------------------------------------------------------
-- Roles y tabla de perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------

create type public.rol_sistema as enum (
  'super_admin',
  'admin_fab',
  'capitan'
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_sistema not null default 'capitan',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_perfiles_rol on public.perfiles (rol);

comment on table public.perfiles is 'Perfil de aplicación vinculado a Supabase Auth; define rol para RLS.';

-- ---------------------------------------------------------------------------
-- Alta automática de perfil al registrarse
-- ---------------------------------------------------------------------------

create or replace function public.alta_perfil_para_usuario_nuevo() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, rol)
  values (new.id, 'capitan');
  return new;
end;
$$;

-- Disparador en auth: requiere privilegios de migración (postgres en Supabase).
create trigger tr_auth_alta_perfil
after insert on auth.users for each row
execute procedure public.alta_perfil_para_usuario_nuevo();

-- ---------------------------------------------------------------------------
-- Función auxiliar: administración de la federación
-- ---------------------------------------------------------------------------

create or replace function public.usuario_es_admin(p_id uuid) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_id is not null
    and exists (
      select 1
      from public.perfiles p
      where
        p.id = p_id
        and p.rol in ('super_admin', 'admin_fab')
    );
$$;

comment on function public.usuario_es_admin(uuid) is 'True si el usuario tiene rol super_admin o admin_fab (uso en políticas RLS).';

grant execute on function public.usuario_es_admin(uuid) to anon, authenticated;

-- Reutiliza public.establecer_actualizado_en() definida en la migración de esquema.
create trigger tr_perfiles_actualizado_en
before update on public.perfiles for each row
execute procedure public.establecer_actualizado_en();

-- ---------------------------------------------------------------------------
-- Activar RLS en todas las tablas de dominio
-- ---------------------------------------------------------------------------

alter table public.perfiles enable row level security;

alter table public.clubes enable row level security;

alter table public.jugadores enable row level security;

alter table public.torneos enable row level security;

alter table public.divisiones enable row level security;

alter table public.equipos enable row level security;

alter table public.equipo_jugadores enable row level security;

alter table public.encuentros enable row level security;

alter table public.parciales_encuentro enable row level security;

alter table public.clasificacion_equipos enable row level security;

-- ---------------------------------------------------------------------------
-- Políticas: perfiles
-- ---------------------------------------------------------------------------

create policy "Perfiles: cada usuario lee el suyo" on public.perfiles for
select
  using (auth.uid() = id);

create policy "Perfiles: administradores leen todos" on public.perfiles for
select
  using (public.usuario_es_admin(auth.uid()));

create policy "Perfiles: solo administradores modifican" on public.perfiles for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Políticas: clubes y jugadores (catálogo; lectura amplia en MVP)
-- ---------------------------------------------------------------------------

create policy "Clubes: lectura para todos" on public.clubes for
select
  using (true);

create policy "Clubes: escritura solo administradores" on public.clubes for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Jugadores: lectura para todos" on public.jugadores for
select
  using (true);

create policy "Jugadores: escritura solo administradores" on public.jugadores for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Políticas: torneos y estructura
-- ---------------------------------------------------------------------------

create policy "Torneos: lectura pública si publicado" on public.torneos for
select
  using (estado = 'publicado');

create policy "Torneos: administradores leen todos los estados" on public.torneos for
select
  using (public.usuario_es_admin(auth.uid()));

create policy "Torneos: escritura solo administradores" on public.torneos for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Divisiones: lectura si torneo publicado o admin" on public.divisiones for
select
  using (
    exists (
      select 1
      from public.torneos t
      where
        t.id = divisiones.id_torneo
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Divisiones: escritura solo administradores" on public.divisiones for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Equipos: lectura si torneo publicado o admin" on public.equipos for
select
  using (
    exists (
      select 1
      from public.torneos t
      where
        t.id = equipos.id_torneo
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Equipos: escritura solo administradores" on public.equipos for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Equipo jugadores: lectura si torneo publicado o admin" on public.equipo_jugadores for
select
  using (
    exists (
      select 1
      from public.equipos e
      join public.torneos t on t.id = e.id_torneo
      where
        e.id = equipo_jugadores.id_equipo
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Equipo jugadores: escritura solo administradores" on public.equipo_jugadores for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Políticas: encuentros, parciales y clasificación
-- ---------------------------------------------------------------------------

create policy "Encuentros: lectura si torneo publicado o admin" on public.encuentros for
select
  using (
    exists (
      select 1
      from public.torneos t
      where
        t.id = encuentros.id_torneo
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Encuentros: escritura solo administradores" on public.encuentros for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Parciales: lectura si torneo publicado o admin" on public.parciales_encuentro for
select
  using (
    exists (
      select 1
      from public.encuentros enc
      join public.torneos t on t.id = enc.id_torneo
      where
        enc.id = parciales_encuentro.id_encuentro
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Parciales: escritura solo administradores" on public.parciales_encuentro for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));

create policy "Clasificación: lectura si torneo publicado o admin" on public.clasificacion_equipos for
select
  using (
    exists (
      select 1
      from public.torneos t
      where
        t.id = clasificacion_equipos.id_torneo
        and (
          t.estado = 'publicado'
          or public.usuario_es_admin(auth.uid())
        )
    )
  );

create policy "Clasificación: escritura solo administradores" on public.clasificacion_equipos for all using (public.usuario_es_admin(auth.uid()))
with
  check (public.usuario_es_admin(auth.uid()));
