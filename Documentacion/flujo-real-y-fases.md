# Flujo real del producto

El MVP inicial validó stack, Supabase y recorridas operativas. Este documento ordena el sistema en producción, alineado al análisis funcional.

## Dos caras de la misma app

| Audiencia | Acceso | Qué hace |
|-----------|--------|----------|
| **Público** | Sin cuenta | Inicio institucional, listado de torneos **publicados**, fixture, resultados y tabla por división |
| **Federación** (`admin_fab`, `super_admin`) | Login | ABM clubes, jugadores, torneos, divisiones, equipos, fixture; contenido institucional; asignar capitanes; publicar torneos |
| **Capitán** (`capitan`) | Login | Cargar parciales y cerrar encuentros **solo de sus equipos** (mobile first) |

## Flujo operativo interclubes (real)

1. Federación crea torneo en **borrador** → divisiones → equipos (con club y **capitán asignado**) → programa encuentros.
2. Federación **publica** el torneo → visible en `/torneos`.
3. Capitán entra a **Mis encuentros**, carga los 4 parciales (single, doble, terceto, cuarteto) con ganador y disparos.
4. El sistema calcula puntos del encuentro (regla 2–2 en parciales = 1–1 en tabla de partido), actualiza **clasificación** y el público ve resultados.

## Fases de implementación

| Fase | Rama / PR | Entregable | Estado |
|------|-----------|------------|--------|
| **1** | `feat/flujo-real-carga-resultados-capitán` | Capitán en equipo, RLS capitán, dominio de puntos, UI carga parciales, tabla pública básica | Hecho |
| **2** | `feat/gestion-jugadores-y-plantel` | ABM jugadores, plantel por equipo | Hecho |
| **3** | PR #8 | Rutas `/gestion`, redirects, contenido institucional | Hecho |
| **4** | PR #8 | Fixture: día/hora, filtros, edición y cambio masivo | Hecho |
| **5** | `feat/estadisticas-fase-2` | Fuera del MVP contractual | Pendiente |

**Validación MVP:** [`recorrida-operativa-completa.md`](recorrida-operativa-completa.md)

## Reglas de negocio (recordatorio)

- Parcial ganado: **+2** al bando en el marcador de parciales del encuentro.
- **2–2 en parciales** → puntos de partido **1–1** (no 4–4).
- Desempates finos (shots, parciales netos) → orden en **tabla**, no en el 1–1 del partido.

## Rutas principales

| Ruta | Uso |
|------|-----|
| `/gestion` | Hub federación (antes `/panel/admin`) |
| `/gestion/contenido` | Editar páginas institucionales |
| `/institucional/[slug]` | Quiénes somos, contacto (público) |
| `/panel/mis-encuentros` | Carga de resultados (capitán) |
| `/torneos/[id]#fixture` | Fixture público con filtros por división, jornada y estado |
