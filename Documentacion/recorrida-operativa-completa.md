# Recorrida operativa completa (MVP interclubes)

Objetivo: validar **una vuelta entera** del producto con roles reales (federación, capitán, público) antes de pulir detalles.

**Tiempo estimado:** 45–60 minutos la primera vez (con dos usuarios de prueba).

**Requisitos:** proyecto Supabase activo, `.env.local` configurado, migraciones aplicadas (ver abajo), `npm run dev` en [http://localhost:3000](http://localhost:3000).

---

## 0. Checklist de base de datos

Si el proyecto **ya existía** antes del merge de fases 3–4, confirmá en el SQL Editor que corriste (en orden):

| Orden | Archivo |
|-------|---------|
| 1 | `supabase/bootstrap-inicial.sql` *(solo proyecto nuevo)* |
| 2 | `supabase/migrations/20260516100000_capitan_en_equipo_y_rls_carga.sql` |
| 3 | `supabase/migrations/20260518120000_paginas_institucionales.sql` |
| 4 | `supabase/migrations/20260518200000_encuentro_unico_por_jornada.sql` |
| 5 | `supabase/migrations/20260519120000_sitio_fotos_enlaces_contacto.sql` |

Proyecto **nuevo**: alcanza con `bootstrap-inicial.sql` (incluye todo lo anterior, incluida la fila 5).

---

## 1. Usuarios de prueba (dos cuentas)

| Rol | Cómo obtenerlo | Correo ejemplo |
|-----|----------------|----------------|
| **Federación** (`admin_fab`) | Registro + SQL `update perfiles set rol = 'admin_fab'` | tu correo principal |
| **Capitán** (`capitan`) | Segundo registro (otro correo o navegador incógnito) | `capitan.prueba@ejemplo.com` |

SQL admin (reemplazá el correo):

```sql
update public.perfiles
set rol = 'admin_fab'
where id = (select id from auth.users where email = 'TU_CORREO_ADMIN@ejemplo.com' limit 1);
```

El capitán queda con rol `capitan` por defecto al registrarse.

---

## 2. Público — sitio institucional (≈5 min, sin login)

En ventana incógnito, recorré:

| Página | Qué validar |
|--------|-------------|
| `/fotos` | Galería vacía o con fotos si el admin subió alguna |
| `/reglamentos` | Tres PDF con botón Descargar |
| `/links` | Listado de federación y clubes |
| `/contacto` | Formulario + correo/Instagram; enviar mensaje de prueba |
| `/institucional/autoridades` | Nómina visible |

Luego como **admin**: **Gestión → Galería de fotos** (subir una imagen), **Enlaces** (editar un club), **Mensajes de contacto** (ver el mensaje de prueba y marcar leído).

---

## 3. Federación — armar el torneo

Iniciá sesión como **admin**. Andá a **Gestión** (`/gestion`).

### 2.1 Clubes

- **Gestión → Clubes**
- Creá al menos **2 clubes** (ej. *San Martín*, *Racing*).

### 2.2 Jugadores (opcional pero recomendado)

- **Gestión → Jugadores**
- Alta de 2–4 jugadores repartidos entre clubes (para probar plantel después).

### 2.3 Torneo en borrador

- **Gestión → Torneos → Nuevo torneo**
  - Nombre: `Interclubes prueba 2026`
  - Temporada: `2026`
  - Estado: **borrador**

### 2.4 División y equipos

En el detalle del torneo:

1. **Nueva división:** `Liga A`, orden `1`.
2. **Equipo 1:** club San Martín, nombre `San Martín A`, correo capitán = correo del usuario capitán de prueba.
3. **Equipo 2:** club Racing, nombre `Racing B` (sin capitán o con otro correo si probás dos capitanes).

### 2.5 Encuentro

En la misma división, **Nuevo encuentro**:

- Local: San Martín A  
- Visitante: Racing B  
- Jornada: `1`  
- Día y hora: elegí una fecha futura  

Guardá. **Intentá crear el mismo cruce otra vez** → debe fallar con mensaje de duplicado.

### 2.6 Plantel (opcional)

- En el equipo, agregá jugadores del club al plantel.

### 2.7 Publicar

- Formulario del torneo: estado **publicado** → Guardar.
- Abrí el enlace **vista pública** del torneo.

**Verificación pública (sin sesión):**

- Menú **Torneos** → entrá al torneo.
- Fixture con filtros, fecha/hora, equipos.
- Tabla vacía o en cero (aún sin resultados).

### 2.8 Contenido institucional

- **Gestión → Contenido institucional**
- Editá *Quiénes somos* o *Contacto* → Guardar.
- Menú **Quiénes somos** en la cabecera → texto actualizado.

---

## 4. Capitán — cargar resultados

1. **Salir** de la sesión admin.
2. **Iniciar sesión** con el correo del capitán asignado a San Martín A.
3. **Mis encuentros** → debe aparecer *San Martín A vs Racing B*.
4. Entrá al encuentro y cargá los **4 parciales**:

| Parcial | Ganador | Disparos (ejemplo) |
|---------|---------|-------------------|
| Single | local | 21 – 18 |
| Doble | visitante | 20 – 22 |
| Terceto | local | 23 – 19 |
| Cuarteto | visitante | 20 – 21 |

Resultado esperado en parciales: **2–2** → puntos de partido **1–1** (no 4–4).

5. Guardar → mensaje de éxito y tabla actualizada.

---

## 5. Público — ver resultados

Sin sesión (o en otra ventana):

- **Torneos** → torneo publicado.
- Fixture: encuentro en estado **Jugado**, marcador **1 – 1**.
- **Tabla de posiciones:** ambos equipos con PJ=1, puntos según reglas (empate 1–1 en puntos de torneo).

Filtros del fixture: probá filtrar por **Jornada 1** y por estado **Jugado**.

---

## 6. Federación — cierre de jornada (opcional)

Volvé como admin → **Gestión → Torneo → Fixture del torneo**:

- **Cambio masivo:** jornada 1 → estado **Cancelado** solo si querés probar lluvia (luego reprogramá a programado).
- Editá un encuentro: cambiá horario o jornada y guardá.

---

## 7. Criterios de “app lista” (MVP)

Marcá cuando cada ítem pase:

- [ ] Admin entra a `/gestion` y gestiona clubes, jugadores, torneos y contenido.
- [ ] `/panel/admin` redirige a `/gestion`.
- [ ] Torneo **publicado** visible sin login.
- [ ] No se duplica el mismo cruce en la misma jornada/división.
- [ ] Capitán solo ve y carga **sus** encuentros.
- [ ] Regla 2–2 en parciales → **1–1** en fixture y coherente en tabla.
- [ ] Filtros de fixture funcionan (público y gestión).
- [ ] Páginas institucionales editables y visibles (Quiénes somos).
- [ ] Fotos, reglamentos, links y contacto públicos operativos.
- [ ] Formulario de contacto guarda mensajes; admin los ve en Gestión.

---

## 8. Consultas SQL útiles (Supabase)

Duplicados en encuentros:

```sql
select id_division, numero_fecha, id_equipo_local, id_equipo_visitante, count(*)
from public.encuentros
group by 1,2,3,4
having count(*) > 1;
```

Clasificación de una división:

```sql
select e.nombre, c.partidos_jugados, c.puntos, c.disparos_a_favor, c.disparos_en_contra
from public.clasificacion_equipos c
join public.equipos e on e.id = c.id_equipo
order by c.puntos desc;
```

---

## 9. Después de esta recorrida

Con el MVP validado, los siguientes temas son **mejoras puntuales** (no bloquean operación):

- Estadísticas avanzadas (fase 5 del roadmap).
- Exportar fixture / PDF.
- Más validaciones de plantel o inscripciones.
- Deploy a Vercel + Supabase producción.

Anotá en un issue o lista cualquier fallo de la recorrida (pantalla, mensaje, dato incorrecto) para abordarlo uno por uno.
