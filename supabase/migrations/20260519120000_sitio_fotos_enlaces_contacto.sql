-- Sitio institucional ampliado: fotos, reglamentos, enlaces y mensajes de contacto

-- ---------------------------------------------------------------------------
-- Galería de fotos (metadatos; archivos en Storage bucket "galeria")
-- ---------------------------------------------------------------------------

create table public.fotos_galeria (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  ruta_storage text not null,
  orden smallint not null default 0,
  publicada boolean not null default true,
  creado_en timestamptz not null default now()
);

create index idx_fotos_galeria_orden on public.fotos_galeria (orden desc, creado_en desc);

alter table public.fotos_galeria enable row level security;

create policy "Fotos: lectura pública si publicada"
  on public.fotos_galeria for select
  using (publicada = true or public.usuario_es_admin(auth.uid()));

create policy "Fotos: escritura solo administradores"
  on public.fotos_galeria for all
  using (public.usuario_es_admin(auth.uid()))
  with check (public.usuario_es_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Reglamentos descargables (ruta en /reglamentos/*.pdf)
-- ---------------------------------------------------------------------------

create table public.reglamentos_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  nombre_archivo text not null,
  orden smallint not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint reglamentos_nombre_archivo_formato check (nombre_archivo ~ '^[-a-z0-9_.]+\.pdf$')
);

alter table public.reglamentos_documentos enable row level security;

create policy "Reglamentos: lectura pública si activo"
  on public.reglamentos_documentos for select
  using (activo = true or public.usuario_es_admin(auth.uid()));

create policy "Reglamentos: escritura solo administradores"
  on public.reglamentos_documentos for all
  using (public.usuario_es_admin(auth.uid()))
  with check (public.usuario_es_admin(auth.uid()));

insert into public.reglamentos_documentos (titulo, nombre_archivo, orden, activo)
values
  ('Reglamento nacional', 'reglamento-nacional.pdf', 10, true),
  ('Reglamento inglés', 'reglamento-ingles.pdf', 20, true),
  ('Reglamento traducido', 'reglamento-traducido.pdf', 30, true);

-- ---------------------------------------------------------------------------
-- Enlaces a clubes y redes (escudo opcional en url_logo)
-- ---------------------------------------------------------------------------

create table public.enlaces_asociados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  telefono text,
  correo text,
  url_instagram text,
  url_web text,
  url_logo text,
  orden smallint not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create index idx_enlaces_asociados_orden on public.enlaces_asociados (orden, nombre);

alter table public.enlaces_asociados enable row level security;

create policy "Enlaces: lectura pública si activo"
  on public.enlaces_asociados for select
  using (activo = true or public.usuario_es_admin(auth.uid()));

create policy "Enlaces: escritura solo administradores"
  on public.enlaces_asociados for all
  using (public.usuario_es_admin(auth.uid()))
  with check (public.usuario_es_admin(auth.uid()));

insert into public.enlaces_asociados (
  nombre, direccion, telefono, correo, url_instagram, orden, activo
)
values
  (
    'Federación Argentina de Bowls',
    null,
    null,
    'info@bowlsargentina.org',
    'https://www.instagram.com/federacionargentinadebowl',
    0,
    true
  ),
  (
    'Belgrano Athletic Club',
    'Virrey del Pino 3456, CABA',
    '1145522259',
    null,
    'https://www.instagram.com',
    10,
    true
  ),
  (
    'Club Atlético de San Isidro',
    'Roque Sáenz Peña 499, San Isidro, BS AS',
    '1170799001',
    null,
    'https://www.instagram.com',
    20,
    true
  ),
  (
    'Club Deportivo Ferrocarril Mitre',
    'Gral. Savio 3002, San Martín, BS AS',
    '1147553627',
    null,
    'https://www.instagram.com',
    30,
    true
  ),
  (
    'Lomas Athletic Club',
    'Arenales 601, Lomas de Zamora, BS AS',
    '1172925343',
    null,
    'https://www.instagram.com',
    40,
    true
  ),
  (
    'Club Atlético Ferrocarril San Martín (PRAC)',
    'Lope de Vega 2598, 3 de Febrero, BS AS',
    '1147570103',
    null,
    'https://www.instagram.com',
    50,
    true
  );

-- ---------------------------------------------------------------------------
-- Mensajes del formulario de contacto
-- ---------------------------------------------------------------------------

create table public.mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  correo text not null,
  mensaje text not null,
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);

create index idx_mensajes_contacto_creado on public.mensajes_contacto (creado_en desc);

alter table public.mensajes_contacto enable row level security;

create policy "Contacto: cualquiera puede enviar"
  on public.mensajes_contacto for insert
  with check (true);

create policy "Contacto: solo administradores leen"
  on public.mensajes_contacto for select
  using (public.usuario_es_admin(auth.uid()));

create policy "Contacto: solo administradores actualizan"
  on public.mensajes_contacto for update
  using (public.usuario_es_admin(auth.uid()))
  with check (public.usuario_es_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: bucket galería
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'galeria',
  'galeria',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Storage galeria: lectura pública"
  on storage.objects for select
  using (bucket_id = 'galeria');

create policy "Storage galeria: subida administradores"
  on storage.objects for insert
  with check (bucket_id = 'galeria' and public.usuario_es_admin(auth.uid()));

create policy "Storage galeria: borrado administradores"
  on storage.objects for delete
  using (bucket_id = 'galeria' and public.usuario_es_admin(auth.uid()));
