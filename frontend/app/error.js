'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '../context/LocaleContext';

export default function Error({ error, reset }) {
  const { t } = useLocale();

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    <div className="container-narrow py-16 sm:py-24 text-center min-w-0">
      <h1 className="page-title-sm">{t('errorTitle')}</h1>
      <p className="mt-4 text-urbans-warm/80">
        {t('errorMessage')}
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={reset} className="btn-primary w-full sm:w-auto">{t('retry')}</button>
        <Link href="/" className="btn-secondary w-full sm:w-auto">{t('backToHome')}</Link>
      </div>
    </div>
  );
}
