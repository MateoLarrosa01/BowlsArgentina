# Guía para grabar la mini presentación (5–8 minutos)

Usá esta secuencia para mostrar el MVP al cliente. Conviene tener **dos ventanas** (o dos navegadores): una sesión **admin** y otra **capitán**, más una **incógnito** para el público.

**Antes de grabar:** `npm run dev` → [http://localhost:3000](http://localhost:3000). Torneo de prueba **publicado** con al menos un encuentro **jugado** (para ver tabla con datos).

---

## 1. Apertura — sitio público (≈1 min)

| Qué decir (sugerido) | Qué mostrar |
|----------------------|-------------|
| “Plataforma de Bowls Argentina para torneos interclubes.” | Inicio con logo en la cabecera. |
| “Cualquiera entra sin cuenta.” | Menú: Torneos, Quiénes somos, **Autoridades**, Contacto. |
| “Autoridades de la federación, como en el sitio actual.” | **Autoridades** → listado de cargos. |

---

## 2. Torneo público (≈1,5 min)

| Qué decir | Qué mostrar |
|-----------|-------------|
| “Torneos publicados por la federación.” | **Torneos** → elegir torneo. |
| “Fixture con jornada, fecha y estado.” | Sección **Fixture**; probá un **filtro** (división o jornada). |
| “Tabla con puntos, shots y parciales.” | **Tabla de posiciones**: PJ, PG, PE, PP, Pts, Sh+, Sh−, Par+, Par−. |

---

## 3. Gestión federación (≈2 min)

| Qué decir | Qué mostrar |
|-----------|-------------|
| “La federación ingresa con su usuario.” | **Iniciar sesión** → admin. |
| “Área de gestión centralizada.” | **Gestión** → tarjetas Clubes, Jugadores, Torneos, Contenido. |
| “Armo el torneo: divisiones, equipos, capitán.” | Entrar al torneo → división, equipo (correo capitán), **programar encuentro**. |
| “Publico y queda visible al público.” | Estado **publicado**; enlace vista pública. |
| “Edito textos institucionales.” | **Contenido institucional** (opcional, 20 s). |

---

## 4. Capitán — carga de resultados (≈1,5 min)

| Qué decir | Qué mostrar |
|-----------|-------------|
| “El capitán solo ve sus partidos.” | **Salir** → login capitán → **Mis encuentros**. |
| “Carga los cuatro parciales y los shots.” | Abrir encuentro → completar single, doble, terceto, cuarteto → **Guardar**. |
| “El sistema actualiza el marcador y la tabla.” | Mensaje de éxito. |

---

## 5. Cierre — verificación pública (≈30 s)

| Qué decir | Qué mostrar |
|-----------|-------------|
| “El público ve el resultado al instante.” | Ventana **incógnito** → mismo torneo → encuentro **jugado** y tabla actualizada. |

---

## Tips de grabación

- Resolución **1920×1080**, zoom navegador **100–110%**.
- Ocultá barra de marcadores y notificaciones.
- Si algo falla en vivo, tené el torneo ya cargado de antes.
- PDF para el cliente: `Documentacion/Bowls-Argentina-Funcionalidades-MVP.pdf`.

---

## Checklist pre-grabación

- [ ] Admin con rol `admin_fab`
- [ ] Capitán registrado y asignado a un equipo
- [ ] Torneo publicado con fixture y (ideal) un resultado cargado
- [ ] Logo visible en cabecera
- [ ] Página Autoridades accesible
