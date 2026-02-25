'use client';

import { useLocale } from '../../context/LocaleContext';

export default function ConfidentialitePage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16 min-w-0">
      <h1 className="page-title mb-6 sm:mb-8">{t('privacyTitle')}</h1>
      <p className="text-sm text-urbans-warm/80 sm:text-base">{t('privacyPolicyContent')}</p>
    </div>
  );
}
