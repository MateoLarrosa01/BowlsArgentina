# Bowls Argentina
## Plataforma web para torneos interclubes

**Documento para revisión del cliente**  
Versión MVP · Mayo 2026

![Federación Argentina de Bowls](logo-federacion.png)

---

## 1. Propósito del sistema

Bowls Argentina es una aplicación web que centraliza la **gestión de torneos interclubes** de la federación y la **consulta pública** de información deportiva: fixture, resultados y tablas de posiciones.

El sistema está pensado para tres tipos de uso:

| Perfil | ¿Necesita cuenta? | Rol principal |
|--------|-------------------|---------------|
| **Visitante / público** | No | Consultar torneos, fixture y clasificación |
| **Federación** | Sí | Administrar clubes, torneos, fixture y contenido institucional |
| **Capitán de equipo** | Sí | Cargar resultados de los partidos de su equipo |

La interfaz está en **español**, optimizada para uso en **computadora y celular**.

---

## 2. Qué puede ver y hacer el público (sin registrarse)

Cualquier persona puede entrar al sitio **sin crear cuenta**.

### Página de inicio
- Presentación de la plataforma y acceso rápido a torneos e inicio de sesión.

### Contenido institucional
- **Quiénes somos** y **Contacto** (textos editables por la federación).
- Enlaces en el menú principal y pie de página.

### Autoridades

Sección informativa con la nómina de autoridades de la federación (como en el sitio actual). Incluye cargos y nombres, por ejemplo:

| Cargo | Titular(es) |
|-------|-------------|
| Presidente | Sebastián Sánchez Keenan |
| Vicepresidente | Anabel Didlaukis |
| Secretaria | Elena Álvarez Indart |
| Tesorero | Ignacio Ramiro Giacchino |
| Vocales titulares | Javier García Lepre, Haydee Carmen Rodríguez, Guillermo Sesarego, Jorge Barreto, Mario Eduardo Rago, Marta Gesualdo |
| Vocales suplentes | Patricia Cervi, María José Tombeur, Lucila Bausili, Virginia Bianco, Raúl Pollet |
| Revisores de cuentas titulares | Rodolfo Müller, Alberto Maratea |
| Revisores de cuentas suplentes | Lautaro Ferreira, Roberto Castro |

*El detalle de diseño y actualización de nombres se definirá con la federación; la plataforma contempla esta página dentro del sitio público.*

### Torneos publicados
- Listado de torneos que la federación marcó como **publicados**.
- Solo se muestran torneos en estado visible al público (no borradores internos).

### Detalle de un torneo
Para cada torneo publicado, el visitante puede ver:

- **Nombre, temporada y divisiones** con los equipos inscriptos.
- **Fixture (programación de encuentros):**
  - Cruces entre equipos (local vs visitante).
  - Número de jornada (fecha del torneo).
  - Día y hora programados, cuando la federación los cargó.
  - Estado del encuentro: programado, jugado o cancelado.
  - Resultado del partido cuando ya fue cargado (puntos de torneo).
- **Filtros del fixture:** por división, jornada y estado, para encontrar partidos rápidamente.
- **Tabla de posiciones** por división, con columnas como en el modelo habitual:
  - Partidos jugados, ganados, empatados y perdidos (PJ, PG, PE, PP).
  - Puntos.
  - **Sh+** y **Sh−** (shots a favor y en contra).
  - **Parciales a favor** y **parciales en contra**.

---

## 3. Qué puede hacer la federación (gestión)

Usuarios con rol de **administración de la federación** acceden con correo y contraseña. En el menú aparece **Gestión**.

### Panel de gestión
Acceso centralizado a:

- **Clubes** — Alta y edición de clubes afiliados (nombre, contacto, activo/inactivo).
- **Jugadores** — Alta de jugadores por club; filtro por club.
- **Torneos** — Creación y administración completa del ciclo del torneo.
- **Contenido institucional** — Edición de textos públicos (Quiénes somos, Contacto).

### Gestión de torneos interclubes

**Crear un torneo** con nombre, temporada y estado:

| Estado | Significado |
|--------|-------------|
| **Borrador** | Solo visible para la federación; se arma la competencia en privado. |
| **Publicado** | Visible en el sitio público (listado y detalle). |
| **Finalizado** | Torneo cerrado (referencia histórica). |

**Por cada torneo, la federación puede:**

1. **Crear divisiones** (ej. Liga A, Liga B) con orden de visualización.
2. **Inscribir equipos** vinculados a un club, con nombre de equipo y **correo del capitán** (usuario registrado que cargará resultados).
3. **Armar el plantel** de cada equipo con jugadores del club.
4. **Programar encuentros** en cada división:
   - Equipo local y visitante.
   - Número de jornada.
   - Fecha y hora opcional.
5. **Editar cada encuentro:** cambiar jornada, horario o estado.
6. **Cambio masivo de estado** por jornada (ej. cancelar o reprogramar todos los partidos de la fecha 1 por lluvia).
7. **Publicar el torneo** cuando el fixture esté listo.

### Vista previa pública
Desde la gestión del torneo, la federación puede abrir la **vista pública** del torneo (la misma que ve cualquier visitante sin cuenta).

---

## 4. Qué puede hacer el capitán de equipo

El capitán es un usuario registrado cuyo correo fue asignado al crear el equipo en el torneo.

### Mi panel
- Resumen de sesión y accesos según su rol.

### Mis encuentros
- Lista **solo** de los partidos de equipos donde es capitán asignado.
- Filtros por división, jornada y estado.
- Muestra jornada, rivales, fecha/hora y estado del encuentro.

### Carga de resultados
Para cada encuentro, el capitán carga los **cuatro parciales** del modelo interclubes:

| Orden | Tipo de parcial |
|-------|-----------------|
| 1 | Single |
| 2 | Doble |
| 3 | Terceto |
| 4 | Cuarteto |

Por cada parcial indica:
- **Ganador** (local o visitante).
- **Shots** de cada equipo (para la tabla y desempates).

Al guardar, el sistema:
- Marca el encuentro como **jugado**.
- Calcula los **puntos del partido** según reglas acordadas.
- **Actualiza la tabla de posiciones** de la división.
- Los resultados quedan visibles en la **vista pública** del torneo.

---

## 5. Reglas de puntaje implementadas

El MVP aplica las reglas de negocio acordadas para interclubes:

- Cada **parcial ganado** suma **2 puntos** al equipo en el marcador de parciales del encuentro.
- Si el resultado en parciales es **2 a 2** (empate en cantidad de parciales ganados), el partido suma **1 punto para cada equipo** en la tabla de torneo.
- Los **shots** (Sh+ / Sh−) se acumulan en la tabla.
- Los **parciales a favor** y **parciales en contra** se reflejan en la clasificación.
- Los desempates por shots o parciales netos se aplican al **orden en la tabla**.

---

## 6. Seguridad y permisos (resumen)

- **Público:** solo lectura de torneos publicados y contenido institucional visible.
- **Federación:** puede crear y modificar clubes, jugadores, torneos, fixture y textos institucionales.
- **Capitán:** solo puede cargar resultados de encuentros de **sus** equipos; no accede a la gestión federativa.

---

*Bowls Argentina — Federación Argentina de Bowls · Documento de funcionalidades MVP*
