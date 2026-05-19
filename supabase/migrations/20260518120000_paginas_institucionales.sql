-- Páginas institucionales editables por la federación (MVP fase 3)
-- Lectura pública solo si publicada = true; ABM reservado a administradores.

create table public.paginas_institucionales (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  contenido text not null default '',
  publicada boolean not null default true,
  orden smallint not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint paginas_institucionales_slug_formato check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index idx_paginas_institucionales_orden on public.paginas_institucionales (orden, titulo);

comment on table public.paginas_institucionales is 'Contenido institucional (quiénes somos, contacto, etc.) visible en /institucional/[slug].';

create trigger tr_paginas_institucionales_actualizado_en
before update on public.paginas_institucionales for each row
execute procedure public.establecer_actualizado_en();

alter table public.paginas_institucionales enable row level security;

create policy "Páginas institucionales: lectura pública si publicada"
  on public.paginas_institucionales for select
  using (publicada = true or public.usuario_es_admin(auth.uid()));

create policy "Páginas institucionales: escritura solo administradores"
  on public.paginas_institucionales for all
  using (public.usuario_es_admin(auth.uid()))
  with check (public.usuario_es_admin(auth.uid()));

insert into public.paginas_institucionales (slug, titulo, contenido, publicada, orden)
values
  (
    'quienes-somos',
    'Quiénes somos',
    'La Federación Argentina de Bowls agrupa a los clubes y promueve la práctica del deporte a nivel nacional.

Este sitio concentra la información de torneos interclubes: fixture, resultados y tablas de posiciones.',
    true,
    10
  ),
  (
    'contacto',
    'Contacto',
    'Para consultas sobre torneos interclubes o el uso de esta plataforma, escribinos a la federación.

Correo: contacto@bowlsargentina.org (ejemplo — actualizá este texto desde Gestión → Contenido institucional).',
    true,
    20
  )
on conflict (slug) do nothing;
