'use client';

import { useEffect } from 'react';
import { useLocale } from '../context/LocaleContext';

/** Met à jour document.documentElement.lang selon la locale (accessibilité + SEO). */
export default function LangSync() {
  const { locale } = useLocale();
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale === 'en' ? 'en' : 'fr';
  }, [locale]);
  return null;
}
