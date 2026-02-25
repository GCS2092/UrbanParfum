'use client';

/**
 * Bandeau d’alerte pour erreurs, succès ou infos.
 * @param {string} type - 'error' | 'success' | 'info'
 * @param {string} message - Texte affiché
 * @param {string} [className] - Classes CSS additionnelles
 * @param {React.ReactNode} [children] - Contenu optionnel (ex. bouton Réessayer)
 */
export default function Alert({ type = 'error', message, className = '', children }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-urbans-cream border-urbans-gold/40 text-urbans-warm',
    info: 'bg-urbans-sand/80 border-urbans-stone text-urbans-warm',
  };
  const base = 'rounded-xl border px-4 py-3 text-sm';

  if (!message && !children) return null;

  return (
    <div role="alert" className={`${base} ${styles[type] || styles.error} ${className}`}>
      {message && <p className="font-medium">{message}</p>}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}
