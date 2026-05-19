# MCP de Supabase en Cursor

Permite que el asistente consulte tu proyecto **DB_BowlsArgentina** (tablas, SQL de lectura, migraciones) sin pegar resultados a mano.

## 1. Obtener el `project_ref`

En el dashboard de Supabase → **Project Settings** → **General** → **Reference ID**.

También está en la URL del proyecto: `https://supabase.com/dashboard/project/<project_ref>`.

O en `.env.local`: si `NEXT_PUBLIC_SUPABASE_URL` es `https://abcdefgh.supabase.co`, el ref suele ser `abcdefgh`.

## 2. Configurar Cursor

El repo incluye [`.cursor/mcp.json`](../.cursor/mcp.json). Reemplazá `TU_PROJECT_REF` por tu Reference ID.

Alternativa (recomendada por Supabase): **Cursor Settings → Tools & MCP → Add MCP server** y elegí el conector **Supabase**; te pedirá login OAuth y el proyecto.

Documentación oficial: [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)

## 3. Verificar

Reiniciá Cursor. En **Tools & MCP** el servidor `supabase` debe aparecer en verde.

Probá en el chat: *“Listá las tablas con MCP”* o *“Mostrá encuentros duplicados en la tabla encuentros”*.

## 4. Seguridad

- Usá `read_only=true` en la URL si solo querés análisis (ya viene en el ejemplo del repo).
- No compartas tokens en el repositorio.
- MCP es para **desarrollo**, no para datos productivos sensibles.

## 5. Consulta útil para duplicados (antes de aplicar la migración de unicidad)

```sql
select
  e.id_torneo,
  e.id_division,
  e.numero_fecha,
  e.id_equipo_local,
  e.id_equipo_visitante,
  count(*) as cantidad
from public.encuentros e
group by 1, 2, 3, 4, 5
having count(*) > 1;
```

Tras aplicar `20260518200000_encuentro_unico_por_jornada.sql`, eliminá manualmente el encuentro duplicado sobrante y volvé a intentar crear; el sistema ya no debería permitir repetir el cruce.
