'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, orders } from '../../../lib/api';
import Alert from '../../../components/Alert';
import { useLocale } from '../../../context/LocaleContext';
import { useCurrency } from '../../../context/CurrencyContext';

export default function CompteCommandesPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { formatPrix } = useCurrency();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token) {
      router.replace('/compte?redirect=/compte/commandes');
      return;
    }
    auth.me()
      .then((user) => {
        if (user?.role === 'admin') { router.replace('/admin'); return; }
        return orders.myOrders();
      })
      .then((data) => { if (Array.isArray(data)) setList(data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="text-urbans-warm/70 py-6">{t('loading')}</p>;
  if (error) return <Alert type="error" message={error}><Link href="/compte" className="underline font-medium">{t('backToAccount')}</Link></Alert>;

  return (
    <div className="container-page py-8 min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/compte" className="text-urbans-warm/80 hover:text-urbans-noir">← {t('account')}</Link>
        <h1 className="page-title-sm">{t('myOrders')}</h1>
      </div>
      {list.length === 0 ? (
        <p className="text-urbans-warm/70">{t('noOrders')}</p>
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <Link key={o.order_id} href={`/compte/commandes/${o.order_id}`} className="block rounded-2xl border border-urbans-stone/50 bg-white p-4 shadow-soft hover:shadow-soft-lg">
              <p className="font-semibold text-urbans-noir">{t('order')} #{o.order_id}</p>
              <p className="text-sm text-urbans-warm/80 mt-0.5">{o.date_commande ? new Date(o.date_commande).toLocaleDateString('fr-FR') : '—'} · {formatPrix(o.total)}</p>
              <span className="inline-block mt-2 rounded-full bg-urbans-sand px-2.5 py-0.5 text-xs font-medium text-urbans-noir">{t('status_' + o.statut) || o.statut}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
