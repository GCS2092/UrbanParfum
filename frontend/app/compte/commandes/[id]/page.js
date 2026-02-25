'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, orders as ordersApi } from '../../../../lib/api';
import Alert from '../../../../components/Alert';
import { useLocale } from '../../../../context/LocaleContext';
import { useCurrency } from '../../../../context/CurrencyContext';

export default function CompteCommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { t, locale } = useLocale();
  const { formatPrix } = useCurrency();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token || !id) {
      if (!token) router.replace('/compte?redirect=/compte/commandes/' + id);
      setLoading(false);
      return;
    }
    auth.me().then((user) => {
      if (user?.role === 'admin') { router.replace('/admin'); return; }
      return ordersApi.get(id);
    }).then((data) => { if (data && data.order_id) setOrder(data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p className="text-urbans-warm/70 py-6 container-page">{t('loading')}</p>;
  if (error || !order) {
    return (
      <div className="container-page py-8">
        <Alert type="error" message={error || t('orderNotFound')}>
          <Link href="/compte/commandes" className="underline font-medium">{t('backToOrders')}</Link>
        </Alert>
      </div>
    );
  }

  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';
  const dateStr = order.date_commande
    ? new Date(order.date_commande).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="container-page py-8 min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/compte/commandes" className="text-urbans-warm/80 hover:text-urbans-noir transition-colors">← {t('myOrders')}</Link>
      </div>

      <div className="card overflow-hidden p-0 mb-6">
        <div className="bg-urbans-sand/60 px-5 py-4 sm:px-6 sm:py-5 border-b border-urbans-stone/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-urbans-noir">{t('order')} #{order.order_id}</h1>
              <p className="text-sm text-urbans-warm/70 mt-1">{dateStr}</p>
            </div>
            <span className="inline-flex rounded-full bg-urbans-gold/20 text-urbans-noir px-3 py-1.5 text-sm font-medium">
              {t('status_' + order.statut) || order.statut}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-6">
        <div className="card p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">{t('deliveryAddressLabel')}</span>
          <p className="mt-2 text-urbans-noir">{order.adresse_ligne1}</p>
          {order.adresse_ligne2 && <p className="text-sm text-urbans-warm/80">{order.adresse_ligne2}</p>}
          <p className="text-sm text-urbans-warm/80 mt-1">{[order.code_postal, order.ville, order.pays].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 sm:px-6 border-b border-urbans-stone/40 bg-urbans-sand/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">{t('orderDetail')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-urbans-stone/40">
                <th className="text-left p-4 font-semibold text-urbans-noir">{t('item')}</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-20">{t('qty')}</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-28">{t('unitPrice')}</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-28">{t('subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => {
                const qty = item.quantite || 0;
                const pu = parseFloat(item.prix_unitaire) || 0;
                const st = qty * pu;
                return (
                  <tr key={item.product_id} className="border-b border-urbans-stone/30 last:border-0">
                    <td className="p-4 text-urbans-noir">{item.nom_parfum}</td>
                    <td className="p-4 text-right text-urbans-warm/80">{qty}</td>
                    <td className="p-4 text-right text-urbans-warm/80">{formatPrix(pu)}</td>
                    <td className="p-4 text-right font-medium text-urbans-noir">{formatPrix(st)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 sm:px-6 bg-urbans-sand/40 border-t border-urbans-stone/40 flex justify-end">
          <p className="text-lg font-semibold text-urbans-noir">{t('orderTotal')} : {formatPrix(order.total)}</p>
        </div>
      </div>
    </div>
  );
}
