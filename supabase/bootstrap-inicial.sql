-- =============================================================================
-- Bowls Argentina — bootstrap SQL (proyecto NUEVO en Supabase)
-- Ejecutá este archivo completo UNA vez en: Dashboard → SQL Editor → New query → Run
-- Si ya corriste las migraciones de supabase/migrations/, no repitas.
-- =============================================================================

-- Esquema MVP interclubes (Bowls Argentina)
-- Convención: tablas y columnas en español, snake_case.
-- Aplicar con Supabase CLI (`supabase db push`) o desde el SQL Editor del panel.
-- Las políticas RLS (público de lectura vs operaciones autenticadas) se agregan en migraciones posteriores.

-- ---------------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------------

create type public.estado_torneo as enum (
  'borrador',
  'publicado',
  'finalizado'
);

create type public.estado_encuentro as enum (
  'programado',
  'jugado',
  'cancelado'
);

create type public.ganador_lado as enum (
  'local',
  'visitante'
);

-- ---------------------------------------------------------------------------
-- Clubes y jugadores
-- ---------------------------------------------------------------------------

create table public.clubes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nombre_corto text,
  correo_contacto text,
  telefono text,
  notas text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_clubes_nombre on public.clubes (nombre);

create table public.jugadores (
  id uuid primary key default gen_random_uuid(),
  id_club uuid not null references public.clubes (id) on delete restrict,
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_jugadores_id_club on public.jugadores (id_club);
create index idx_jugadores_apellido_nombre on public.jugadores (apellido, nombre);

-- ---------------------------------------------------------------------------
-- Torneo y divisiones
-- ---------------------------------------------------------------------------

create table public.torneos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo_torneo text not null default 'interclubes' check (
    tipo_torneo in ('interclubes', 'abierto', 'invitacion')
  ),
  temporada text not null,
  estado public.estado_torneo not null default 'borrador',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_torneos_temporada on public.torneos (temporada);

create table public.divisiones (
  id uuid primary key default gen_random_uuid(),
  id_torneo uuid not null references public.torneos (id) on delete cascade,
  nombre text not null,
  orden smallint not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id_torneo, nombre)
);

create index idx_divisiones_id_torneo on public.divisiones (id_torneo);

-- ---------------------------------------------------------------------------
-- Equipos (bando) e integración por torneo
-- ---------------------------------------------------------------------------

create table public.equipos (
  id uuid primary key default gen_random_uuid(),
  id_torneo uuid not null references public.torneos (id) on delete cascade,
  id_division uuid not null references public.divisiones (id) on delete cascade,
  id_club uuid not null references public.clubes (id) on delete restrict,
  nombre text not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id_torneo, id_division, nombre)
);

create index idx_equipos_torneo_division on public.equipos (id_torneo, id_division);
create index idx_equipos_id_club on public.equipos (id_club);

create table public.equipo_jugadores (
  id uuid primary key default gen_random_uuid(),
  id_equipo uuid not null references public.equipos (id) on delete cascade,
  id_jugador uuid not null references public.jugadores (id) on delete restrict,
  creado_en timestamptz not null default now(),
  unique (id_equipo, id_jugador)
);

create index idx_equipo_jugadores_id_jugador on public.equipo_jugadores (id_jugador);

-- ---------------------------------------------------------------------------
-- Encuentros y parciales
-- ---------------------------------------------------------------------------

create table public.encuentros (
  id uuid primary key default gen_random_uuid(),
  id_torneo uuid not null references public.torneos (id) on delete cascade,
  id_division uuid not null references public.divisiones (id) on delete cascade,
  id_equipo_local uuid not null references public.equipos (id) on delete restrict,
  id_equipo_visitante uuid not null references public.equipos (id) on delete restrict,
  numero_fecha smallint,
  fecha_hora timestamptz,
  estado public.estado_encuentro not null default 'programado',
  puntos_encuentro_local smallint,
  puntos_encuentro_visitante smallint,
  disparos_totales_local integer,
  disparos_totales_visitante integer,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (id_equipo_local <> id_equipo_visitante)
);

create index idx_encuentros_torneo_division on public.encuentros (id_torneo, id_division);
create index idx_encuentros_fecha on public.encuentros (fecha_hora);

create table public.parciales_encuentro (
  id uuid primary key default gen_random_uuid(),
  id_encuentro uuid not null references public.encuentros (id) on delete cascade,
  orden smallint not null check (
    orden >= 1
    and orden <= 4
  ),
  tipo_parcial text not null check (
    tipo_parcial in (
      'single',
      'doble',
      'terceto',
      'cuarteto'
    )
  ),
  ganador public.ganador_lado,
  disparos_local integer,
  disparos_visitante integer,
  creado_en timestamptz not null default now(),
  unique (id_encuentro, orden),
  unique (id_encuentro, tipo_parcial)
);

create index idx_parciales_id_encuentro on public.parciales_encuentro (id_encuentro);

-- Tabla opcional para materializar la clasificación (RF-08); se recalcula desde la app o jobs.
create table public.clasificacion_equipos (
  id uuid primary key default gen_random_uuid(),
  id_torneo uuid not null references public.torneos (id) on delete cascade,
  id_division uuid not null references public.divisiones (id) on delete cascade,
  id_equipo uuid not null references public.equipos (id) on delete cascade,
  partidos_jugados smallint not null default 0,
  partidos_ganados smallint not null default 0,
  partidos_empatados smallint not null default 0,
  partidos_perdidos smallint not null default 0,
  disparos_a_favor integer not null default 0,
  disparos_en_contra integer not null default 0,
  parciales_ganados smallint not null default 0,
  parciales_perdidos smallint not null default 0,
  puntos smallint not null default 0,
  actualizado_en timestamptz not null default now(),
  unique (id_torneo, id_division, id_equipo)
);

create index idx_clasificacion_division on public.clasificacion_equipos (id_division);

-- ---------------------------------------------------------------------------
-- Comentarios (documentación en catálogo)
-- ---------------------------------------------------------------------------

comment on table public.clubes is 'Clubes afiliados.';
comment on table public.jugadores is 'Jugadores asociados a un club (MVP interclubes).';
comment on table public.torneos is 'Torneos o copas; MVP operativo en interclubes; tipos futuros en tipo_torneo.';
comment on column public.torneos.tipo_torneo is 'interclubes (MVP), abierto o invitacion para extensiones posteriores.';
comment on table public.divisiones is 'Ligas, zonas o divisiones dentro de un torneo.';
comment on table public.equipos is 'Equipos o bandos inscriptos en una división.';
comment on table public.equipo_jugadores is 'Plantel de un equipo por torneo.';
comment on table public.encuentros is 'Encuentro entre dos equipos; puntos del partido para tabla (ej. empate 2-2 en parciales = 1-1).';
comment on column public.encuentros.puntos_encuentro_local is 'Puntos de torneo del equipo local por este encuentro (no desempate fino).';
comment on column public.encuentros.puntos_encuentro_visitante is 'Puntos de torneo del equipo visitante por este encuentro.';
comment on table public.parciales_encuentro is 'Parciales single, doble, terceto y cuarteto; ganador define +2 al bando en el modelo FAB.';
comment on table public.clasificacion_equipos is 'Snapshot de tabla; desempates finos por shots/parciales se aplican al ordenar esta vista.';

-- ---------------------------------------------------------------------------
-- Triggers actualizado_en
-- ---------------------------------------------------------------------------

create or replace function public.establecer_actualizado_en ()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger tr_clubes_actualizado_en
before update on public.clubes
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_jugadores_actualizado_en
before update on public.jugadores
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_torneos_actualizado_en
before update on public.torneos
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_divisiones_actualizado_en
before update on public.divisiones
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_equipos_actualizado_en
before update on public.equipos
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_encuentros_actualizado_en
before update on public.encuentros
for each row
execute procedure public.establecer_actualizado_en ();

create trigger tr_clasificacion_actualizado_en
before update on public.clasificacion_equipos
for each row
execute procedure public.establecer_actualizado_en ();


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
