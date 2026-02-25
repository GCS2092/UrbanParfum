'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatPrix as formatPrixUtil } from '../lib/format.js';
import { convertFromFCFA, CURRENCIES, BASE_CURRENCY } from '../lib/currency.js';
import { useLocale } from './LocaleContext.js';

const STORAGE_KEY = 'urbans_currency';

const CurrencyContext = createContext({
  currency: BASE_CURRENCY,
  setCurrency: () => {},
  formatPrix: (amount) => amount,
  convert: (amount) => amount,
});

export function CurrencyProvider({ children }) {
  const { locale } = useLocale();
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored && CURRENCIES.includes(stored)) setCurrencyState(stored);
    } catch (_) {}
    setMounted(true);
  }, []);

  const setCurrency = useCallback((next) => {
    const value = CURRENCIES.includes(next) ? next : BASE_CURRENCY;
    setCurrencyState(value);
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }, []);

  const numberLocale = locale === 'en' ? 'en-US' : 'fr-FR';
  const formatPrix = useCallback((amountFCFA) => {
    return formatPrixUtil(amountFCFA, currency, numberLocale);
  }, [currency, numberLocale]);

  const convert = useCallback((amountFCFA) => {
    return convertFromFCFA(amountFCFA, currency);
  }, [currency]);

  const value = { currency, setCurrency, formatPrix, convert, mounted };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
