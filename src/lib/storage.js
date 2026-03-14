/**
 * Converts a Supabase public storage URL to the clean proxy path.
 *
 * Stored URL:  https://<project>.supabase.co/storage/v1/object/public/servicios/abc.png
 * Clean URL:   /img/servicios/abc.png
 *
 * In dev  → Vite proxy forwards /img/* to Supabase storage.
 * In prod → Vercel rewrite forwards /img/* to Supabase storage.
 */
const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public`;

export function getStorageUrl(url) {
  if (!url) return null;
  return url.startsWith(STORAGE_BASE)
    ? url.replace(STORAGE_BASE, '/img')
    : url;
}
