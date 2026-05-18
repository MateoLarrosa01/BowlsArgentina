# Primer arranque: Supabase y la app en tu máquina

Esta guía asume que **todavía no tenés** proyecto en Supabase ni archivo `.env.local`. Al final deberías poder entrar a [http://localhost:3000](http://localhost:3000) con datos reales (registro, login y panel de administración).

---

## 1. Crear un proyecto en Supabase (gratis)

1. Entrá a [https://supabase.com](https://supabase.com) e iniciá sesión (GitHub o correo).
2. **New project**  
   - **Name**: por ejemplo `bowls-argentina`  
   - **Database password**: guardala en un gestor de contraseñas (la vas a necesitar si usás herramientas externas con la base).  
   - **Region**: elegí la más cercana (p. ej. `South America` si aparece).
3. Esperá a que el proyecto termine de provisionarse (aparece el estado “Active / Healthy” en el dashboard).

---

## 2. Crear tablas y seguridad (SQL)

1. En el menú del proyecto: **SQL Editor** → **New query**.
2. En tu computadora, abrí el archivo del repo:

   `supabase/bootstrap-inicial.sql`

3. **Copiá todo el contenido** (Ctrl+A, Ctrl+C) y pegalo en el editor de Supabase.
4. Pulsá **Run** (o Ctrl+Enter).

   - Si todo va bien, deberías ver “Success” sin errores en rojo.
   - Ese archivo incluye el **esquema** (clubes, torneos, etc.) y las **políticas RLS** + tabla `perfiles` + trigger en `auth.users`.

**Si preferís no usar el archivo único:** ejecutá en orden, en dos queries separadas, el contenido de:

- `supabase/migrations/20260515120000_esquema_mvp_interclubes.sql`  
- `supabase/migrations/20260515140000_politicas_rls_y_perfiles.sql`

**Si aparece error de “already exists”:** probablemente ya corriste el script antes. En un proyecto **nuevo** vacío no debería pasar.

---

## 3. Claves para la app (`.env.local`)

1. En Supabase: **Project Settings** (engranaje) → **API**.
2. Copiá:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (clave pública, no la `service_role`) → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. En la raíz del repo de Bowls Argentina, creá el archivo **`.env.local`** (al lado de `package.json`) con este formato:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Guardá el archivo y **reiniciá** `npm run dev` si ya lo tenías corriendo (Next solo lee env al arrancar).

> La clave `anon` es pública por diseño (va al navegador). Las reglas **RLS** en la base limitan qué puede hacer cada usuario.

---

## 4. Auth: que el registro funcione sin fricción (recomendado en local)

Para probar rápido sin abrir el correo:

1. **Authentication** → **Providers** → **Email**: dejá habilitado.
2. **Authentication** → **Sign In / Providers** (o en versiones nuevas: **Authentication** → **Emails**): desactivá **“Confirm email”** (confirmación de correo) mientras desarrollás, así el usuario queda logueado al instante después de **Registro**.

En producción conviene volver a activar la confirmación.

---

## 5. Tu usuario como administrador de la federación

1. Arrancá la app: `npm run dev` y andá a **Registro**. Creá una cuenta con tu correo y contraseña.
2. Volvé al **SQL Editor** de Supabase y ejecutá (reemplazá el correo por el tuyo):

   ```sql
   update public.perfiles
   set rol = 'admin_fab'
   where id = (
     select id from auth.users where email = 'tu-correo@ejemplo.com' limit 1
   );
   ```

3. Cerrá sesión en la web y volvé a **Iniciar sesión** (o refrescá con **Salir** y entrá de nuevo).  
   Deberías ver **Administración** en la cabecera y poder entrar a `/panel/admin`.

Si necesitás el `id` a mano: **Authentication** → **Users** → copiá el UUID del usuario y usá:

```sql
update public.perfiles set rol = 'admin_fab' where id = 'PEGA-UUID-AQUÍ';
```

---

## 6. Probar el flujo demo (cliente)

1. **Administración** → **Clubes**: cargá al menos dos clubes.  
2. **Torneos** → **Nuevo torneo** → agregá división, equipos y encuentros.  
3. En el torneo, cambiá el estado a **Publicado** y guardá.  
4. Abrí **Torneos** en el menú principal (sin sesión) y verificá que el torneo y el fixture se ven públicos.

---

## Problemas frecuentes

| Síntoma | Qué revisar |
|--------|-------------|
| La app sigue diciendo que faltan variables | Que `.env.local` esté en la **raíz** del repo, con los nombres exactos, y reiniciar `npm run dev`. |
| Error al ejecutar el SQL del trigger `auth.users` | Debe ejecutarse en el **SQL Editor** del dashboard (rol suficiente). Si falla, copiá el mensaje exacto. |
| No puedo crear clubes / torneos | Que tu usuario tenga `admin_fab` o `super_admin` en `public.perfiles` (paso 5). |
| Registro no inicia sesión | Confirmación de email activada: desactivala en Auth o abrí el link del mail. |

---

## Referencia rápida de archivos en el repo

| Archivo | Uso |
|---------|-----|
| `supabase/bootstrap-inicial.sql` | Un solo pegado en SQL Editor para proyecto nuevo |
| `supabase/migrations/*.sql` | Misma lógica, en dos pasos (mantenimiento versionado) |
| `.env.example` | Plantilla de variables (sin secretos) |

Cuando tengas el OK del cliente y entornos separados (staging/prod), conviene usar la **CLI de Supabase** o migraciones gestionadas en CI en lugar de repetir pegados manuales.
