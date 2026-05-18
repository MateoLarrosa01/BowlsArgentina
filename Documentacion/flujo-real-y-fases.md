# Flujo real del producto (post-demo MVP)

El demo mergeado en `main` sirvió para validar stack, Supabase y una recorrida visual. **No es el flujo definitivo de operación.** Este documento ordena cómo queda el sistema real, alineado al análisis funcional.

## Dos caras de la misma app

| Audiencia | Acceso | Qué hace |
|-----------|--------|----------|
| **Público** | Sin cuenta | Inicio institucional, listado de torneos **publicados**, fixture, resultados y tabla por división |
| **Federación** (`admin_fab`, `super_admin`) | Login | ABM clubes, jugadores, torneos, divisiones, equipos, fixture; asignar capitanes; publicar torneos |
| **Capitán** (`capitan`) | Login | Cargar parciales y cerrar encuentros **solo de sus equipos** (mobile first) |

## Flujo operativo interclubes (real)

1. Federación crea torneo en **borrador** → divisiones → equipos (con club y **capitán asignado**) → programa encuentros.
2. Federación **publica** el torneo → visible en `/torneos`.
3. Capitán entra a **Mis encuentros**, carga los 4 parciales (single, doble, terceto, cuarteto) con ganador y disparos.
4. El sistema calcula puntos del encuentro (regla 2–2 en parciales = 1–1 en tabla de partido), actualiza **clasificación** y el público ve resultados.

## Fases de implementación (ramas sugeridas)

| Fase | Rama / PR | Entregable |
|------|-----------|------------|
| **1** (actual) | `feat/flujo-real-carga-resultados-capitán` | Capitán en equipo, RLS capitán, dominio de puntos, UI carga parciales, tabla pública básica |
| **2** | `feat/gestion-jugadores-y-plantel` | ABM jugadores, plantel por equipo *(en curso)* |
| **3** | `feat/gestion-federacion-refactor` | Renombrar copy “demo”, rutas `/gestion`, contenido institucional admin |
| **4** | `feat/fixture-avanzado` | Fechas, filtros, estados masivos |
| **5** | `feat/estadisticas-fase-2` | Fuera del MVP contractual |

## Reglas de negocio (recordatorio)

- Parcial ganado: **+2** al bando en el marcador de parciales del encuentro.
- **2–2 en parciales** → puntos de partido **1–1** (no 4–4).
- Desempates finos (shots, parciales netos) → orden en **tabla**, no en el 1–1 del partido.

## Qué queda del demo sin tocar aún

- Textos “demo MVP” en panel (se limpian en fase 3).
- ABM de jugadores y plantel en gestión de torneo (fase 2).
- Sin CMS institucional completo.
