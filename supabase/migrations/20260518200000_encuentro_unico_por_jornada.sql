-- Evita duplicar el mismo cruce en una jornada y división (ej. San Martín A vs B, fecha 1, Liga A).
-- También impide el cruce invertido (B vs A) en la misma jornada.
--
-- Si ya tenés duplicados, borrá el sobrante antes de ejecutar (ver Documentacion/mcp-supabase.md).

create unique index if not exists idx_encuentros_unico_con_jornada
  on public.encuentros (
    id_torneo,
    id_division,
    numero_fecha,
    id_equipo_local,
    id_equipo_visitante
  )
  where numero_fecha is not null;

create unique index if not exists idx_encuentros_unico_sin_jornada
  on public.encuentros (
    id_torneo,
    id_division,
    id_equipo_local,
    id_equipo_visitante
  )
  where numero_fecha is null;

-- Pareja de equipos (sin importar local/visitante) por jornada
create unique index if not exists idx_encuentros_pareja_jornada
  on public.encuentros (
    id_torneo,
    id_division,
    numero_fecha,
    least(id_equipo_local, id_equipo_visitante),
    greatest(id_equipo_local, id_equipo_visitante)
  )
  where numero_fecha is not null;

comment on index public.idx_encuentros_unico_con_jornada is
  'Un solo encuentro por local, visitante, división y número de fecha.';

comment on index public.idx_encuentros_pareja_jornada is
  'Una sola pareja de equipos por jornada (A vs B o B vs A, no ambos).';
