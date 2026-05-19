export function urlPublicaGaleria(supabase, rutaStorage) {
  if (!rutaStorage) return null;
  const { data } = supabase.storage.from("galeria").getPublicUrl(rutaStorage);
  return data.publicUrl;
}
