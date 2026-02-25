/**
 * Format des prix. Les valeurs en base sont en FCFA.
 * Si currency est fourni, le montant est affiché dans cette devise (conversion via lib/currency).
 */
import { convertFromFCFA, CURRENCY_LABELS, BASE_CURRENCY } from './currency.js';

/**
 * Formate un montant (en FCFA en base) dans la devise demandée.
 * @param {number} prixFCFA - Prix en FCFA
 * @param {string} [currency='FCFA'] - Code devise (FCFA, EUR, USD)
 * @param {string} [locale='fr-FR'] - Locale pour les nombres
 */
export function formatPrix(prixFCFA, currency = BASE_CURRENCY, locale = 'fr-FR') {
  const n = typeof prixFCFA === 'number' ? prixFCFA : parseFloat(prixFCFA);
  if (Number.isNaN(n)) return `0 ${CURRENCY_LABELS[currency] || currency}`;
  const amount = currency === BASE_CURRENCY ? n : convertFromFCFA(n, currency);
  const isInteger = currency === 'FCFA' || currency === 'XOF';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: isInteger ? 0 : 2,
  }).format(amount);
  return `${formatted} ${CURRENCY_LABELS[currency] || currency}`;
}
