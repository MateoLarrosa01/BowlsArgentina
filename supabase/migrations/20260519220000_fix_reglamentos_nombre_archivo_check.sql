-- Corrige CHECK de nombre_archivo: el patrón con \\.pdf exigía backslash literal
-- (falla con standard_conforming_strings = on).

alter table public.reglamentos_documentos
  drop constraint if exists reglamentos_nombre_archivo_formato;

alter table public.reglamentos_documentos
  add constraint reglamentos_nombre_archivo_formato
  check (nombre_archivo ~ '^[-a-z0-9_.]+\.pdf$');

insert into public.reglamentos_documentos (titulo, nombre_archivo, orden, activo)
select v.titulo, v.nombre_archivo, v.orden, v.activo
from (
  values
    ('Reglamento nacional', 'reglamento-nacional.pdf', 10::smallint, true),
    ('Reglamento inglés', 'reglamento-ingles.pdf', 20::smallint, true),
    ('Reglamento traducido', 'reglamento-traducido.pdf', 30::smallint, true)
) as v(titulo, nombre_archivo, orden, activo)
where not exists (
  select 1
  from public.reglamentos_documentos r
  where r.nombre_archivo = v.nombre_archivo
);
