# Bowls Argentina

Plataforma web para gestionar torneos y competencias de Bowls Argentina: clubes, equipos, jugadores, fixture, carga de resultados y tablas de posiciones, alineada al análisis funcional del repositorio.

## Stack

- **Next.js** (App Router) con **React y JavaScript**
- **Vercel** para hosting
- **Supabase** (PostgreSQL + Auth) para datos y sesiones

## Requisitos

- **Node.js** 20.19 o superior (recomendado 22 LTS) — ver `engines` en `package.json`

## Configuración local

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm install
   ```

2. Variables de entorno: copiar `.env.example` a `.env.local` y completar las claves del proyecto en [Supabase](https://supabase.com/dashboard) (Project Settings → API).

3. Servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000).

   Vas a ver la cabecera, el inicio (público y gestión), el listado de **torneos publicados** (vacío hasta tener datos en Supabase), **inicio de sesión / registro** y un **panel** mínimo para usuarios con sesión.

4. **Demo para mostrar al cliente (MVP)**  
   Con un usuario **admin_fab** o **super_admin** en `perfiles`: entrá a **Administración** (`/panel/admin`), cargá **clubes**, creá un **torneo** en borrador, agregá **divisiones**, **equipos** y **encuentros**, cambiá el estado del torneo a **publicado** y abrí la **vista pública** desde el enlace del torneo o desde **Torneos** en el menú principal (sin cuenta).

## Base de datos (Supabase / PostgreSQL)

Las migraciones versionadas viven en `supabase/migrations/`. Para aplicarlas en un proyecto Supabase podés usar la [CLI de Supabase](https://supabase.com/docs/guides/cli) (`supabase link`, `supabase db push`) o pegar el SQL en el editor SQL del panel.

Los identificadores del esquema (tablas y columnas) están en **español**, alineados a las convenciones del proyecto.

Las migraciones posteriores al esquema inicial habilitan **RLS** y la tabla `perfiles` (rol vinculado a `auth.users`). El rol por defecto al registrarse es `capitan`. Las **escrituras** operativas (torneos, clubes, encuentros, etc.) exigen un usuario con rol `admin_fab` o `super_admin` en `perfiles`. Tras el primer registro en Auth, ejecutá en el SQL Editor un `update` sobre `public.perfiles` para asignar ese rol al `id` del usuario que administrará la federación.

## Scripts

| Comando        | Descripción              |
| -------------- | ------------------------ |
| `npm run dev`  | Desarrollo               |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción   |
| `npm run lint` | ESLint                   |

## Documentación

El análisis funcional y material de referencia están en `Documentacion/`.

## Despliegue

El proyecto está pensado para **Vercel**: conectar el repositorio, definir las mismas variables `NEXT_PUBLIC_*` en el panel del proyecto y desplegar la rama principal tras revisión en PR.
