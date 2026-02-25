'use client';

import { useLocale } from '../../context/LocaleContext';

export default function FAQPage() {
  const { t } = useLocale();
  const faqs = [
    { qKey: 'faq1q', aKey: 'faq1a' },
    { qKey: 'faq2q', aKey: 'faq2a' },
    { qKey: 'faq3q', aKey: 'faq3a' },
    { qKey: 'faq4q', aKey: 'faq4a' },
  ];

  return (
    <div className="container-narrow py-8 sm:py-12 min-w-0">
      <h1 className="page-title-sm mb-8">{t('faqTitle')}</h1>
      <ul className="space-y-0">
        {faqs.map((item, i) => (
          <li key={i} className="border-b border-urbans-stone/60 py-6 first:pt-0">
            <h2 className="font-medium text-urbans-noir">{t(item.qKey)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-urbans-warm/80">{t(item.aKey)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
