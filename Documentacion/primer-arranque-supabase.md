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

2b. **Flujo real (capitán y resultados):** ejecutá también en el SQL Editor el archivo  
   `supabase/migrations/20260516100000_capitan_en_equipo_y_rls_carga.sql`  
   (columna capitán en equipos, políticas de carga y función de tabla de posiciones).

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

## 4. Variables para crear capitanes (service role)

En `.env.local` agregá la clave **service_role** (solo servidor, nunca en el navegador):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

La encontrás en **Project Settings** → **API** → `service_role` (secret).

En **Authentication** → **Providers** podés **desactivar Sign ups** para que nadie se registre por fuera de la app; los capitanes se crean en **Gestión → Capitanes**.

---

## 5. Tu usuario como administrador de la federación

1. En Supabase **Authentication** → **Users** → **Add user** (o invitación por correo), creá tu cuenta de federación.
2. En el **SQL Editor** ejecutá (reemplazá el correo por el tuyo):

   ```sql
   update public.perfiles
   set rol = 'admin_fab'
   where id = (
     select id from auth.users where email = 'tu-correo@ejemplo.com' limit 1
   );
   ```

3. Cerrá sesión en la web y volvé a **Iniciar sesión** (o refrescá con **Salir** y entrá de nuevo).  
   Deberías ver **Gestión** en la cabecera y poder entrar a `/gestion`.

Si necesitás el `id` a mano: **Authentication** → **Users** → copiá el UUID del usuario y usá:

```sql
update public.perfiles set rol = 'admin_fab' where id = 'PEGA-UUID-AQUÍ';
```

---

## 6. Recorrida operativa completa

Para validar federación + capitán + público en una sola vuelta, seguí:

→ **[`Documentacion/recorrida-operativa-completa.md`](recorrida-operativa-completa.md)**

Resumen mínimo: clubes → torneo (borrador) → división/equipos/encuentro → **publicar** → capitán carga parciales → ver fixture y tabla sin login.

> Proyecto ya existente: aplicá también las migraciones listadas en la sección 0 de esa guía (capitán, institucional, unicidad de encuentros).

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
