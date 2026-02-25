/**
 * Retourne l'URL complète d'une image (lien externe ou chemin relatif).
 * En accès réseau (téléphone, etc.), on garde le chemin relatif pour que /uploads/* passe par le proxy.
 */
export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  let apiBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || '/api';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') apiBase = '/api';
  }
  if (apiBase.startsWith('/')) return url.startsWith('/') ? url : '/' + url;
  const origin = apiBase.replace(/\/api\/?$/, '');
  return origin + (url.startsWith('/') ? url : '/' + url);
}
