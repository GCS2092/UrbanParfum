'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '../../../context/LocaleContext';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16 text-center min-w-0">
      <h1 className="page-title-sm mb-4">{t('orderRecorded')}</h1>
      {orderId && <p className="text-sm text-urbans-warm/80 sm:text-base">{t('orderTakenIntoAccount').replace('{id}', orderId)}</p>}
      <p className="mt-4 text-sm text-urbans-warm/60">{t('emailConfirmation')}</p>

      <div className="mt-6 rounded-2xl border border-urbans-gold/30 bg-urbans-cream/50 px-4 py-4 text-left">
        <p className="text-sm font-medium text-urbans-noir">{t('trackMyOrder')}</p>
        <p className="mt-1 text-xs text-urbans-warm/70">
          {t('trackOrderBlurb').replace(/\{id\}/g, orderId || '…')}
        </p>
        <Link href="/suivi-commande" className="mt-3 inline-block text-sm font-medium text-urbans-gold hover:underline">
          {t('goToTrackOrder')}
        </Link>
      </div>

      <Link href="/catalogue" className="btn-primary mt-8 inline-block w-full sm:w-auto text-center">{t('viewCatalog')}</Link>
    </div>
  );
}
