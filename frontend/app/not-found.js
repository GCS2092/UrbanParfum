'use client';

import Link from 'next/link';
import { useLocale } from '../context/LocaleContext';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="container-narrow py-16 sm:py-24 text-center min-w-0">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-urbans-noir sm:text-5xl">404</h1>
      <p className="mt-4 text-lg text-urbans-warm/80">{t('notFoundMessage')}</p>
      <p className="mt-2 text-sm text-urbans-warm/60">{t('notFoundHint')}</p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="btn-primary w-full sm:w-auto">{t('backToHome')}</Link>
        <Link href="/catalogue" className="btn-secondary w-full sm:w-auto">{t('viewCatalog')}</Link>
      </div>
    </div>
  );
}
