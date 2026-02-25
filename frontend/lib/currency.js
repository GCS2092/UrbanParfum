/**
 * Devises et conversion depuis la devise de base (FCFA).
 * Les prix en BDD et dans le panier sont toujours en FCFA.
 */
export const BASE_CURRENCY = 'FCFA';

/** Taux de change 1 unité devise → FCFA (approximatifs, à mettre à jour ou via API) */
export const RATES_TO_FCFA = {
  FCFA: 1,
  EUR: 656,
  USD: 600,
  XOF: 1, // 1 FCFA ≈ 1 XOF pour affichage
};

/** Libellés courts pour l’UI */
export const CURRENCY_LABELS = {
  FCFA: 'FCFA',
  EUR: 'EUR',
  USD: 'USD',
  XOF: 'XOF',
};

/** Devises proposées dans le sélecteur */
export const CURRENCIES = ['FCFA', 'EUR', 'USD'];

/**
 * Convertit un montant depuis FCFA vers la devise cible.
 * @param {number} amountFCFA - Montant en FCFA
 * @param {string} toCurrency - Code devise (FCFA, EUR, USD)
 * @returns {number}
 */
export function convertFromFCFA(amountFCFA, toCurrency) {
  const n = typeof amountFCFA === 'number' ? amountFCFA : parseFloat(amountFCFA);
  if (Number.isNaN(n)) return 0;
  if (toCurrency === BASE_CURRENCY || !toCurrency) return n;
  const rate = RATES_TO_FCFA[toCurrency];
  if (!rate || rate <= 0) return n;
  return n / rate;
}

/**
 * Convertit un montant depuis une devise vers FCFA (pour envoi backend si besoin).
 */
export function convertToFCFA(amount, fromCurrency) {
  const n = typeof amount === 'number' ? amount : parseFloat(amount);
  if (Number.isNaN(n)) return 0;
  if (fromCurrency === BASE_CURRENCY || !fromCurrency) return n;
  const rate = RATES_TO_FCFA[fromCurrency];
  if (!rate || rate <= 0) return n;
  return n * rate;
}
