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
