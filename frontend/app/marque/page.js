'use client';

import { useLocale } from '../../context/LocaleContext';

export default function MarquePage() {
  const { t } = useLocale();

  return (
    <div className="container-narrow py-8 sm:py-12 text-center min-w-0">
      <h1 className="page-title mb-6">{t('brandTitle')} UrbanS</h1>
      <p className="mb-4 text-sm leading-relaxed text-urbans-warm/80 sm:text-base">
        {t('brandP1')}
      </p>
      <p className="text-sm leading-relaxed text-urbans-warm/80 sm:text-base">
        {t('brandP2')}
      </p>
    </div>
  );
}
