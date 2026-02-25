'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messages, defaultLocale, supportedLocales } from '../lib/i18n/messages.js';

const STORAGE_KEY = 'urbans_locale';

const LocaleContext = createContext({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored && supportedLocales.includes(stored)) setLocaleState(stored);
    } catch (_) {}
    setMounted(true);
  }, []);

  const setLocale = useCallback((next) => {
    const value = supportedLocales.includes(next) ? next : defaultLocale;
    setLocaleState(value);
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }, []);

  const t = useCallback((key) => {
    const dict = messages[locale] || messages[defaultLocale];
    const value = dict[key];
    return value !== undefined ? value : (messages[defaultLocale][key] ?? key);
  }, [locale]);

  const value = { locale, setLocale, t, mounted };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
