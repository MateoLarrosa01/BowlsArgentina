/** Busca usuario en Auth por correo (service role, solo servidor). */
export async function buscarUsuarioAuthPorCorreo(admin, correo) {
  const normalizado = correo.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return { user: null, error: error.message };

    const user = (data.users ?? []).find(
      (u) => u.email?.trim().toLowerCase() === normalizado,
    );
    if (user) return { user, error: null };

    if ((data.users ?? []).length < perPage) break;
    page += 1;
  }

  return { user: null, error: null };
}
