'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, orders as ordersApi } from '../../lib/api';
import Alert from '../../components/Alert';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';

function formatDate(iso, locale) {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SuiviCommandePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { formatPrix } = useCurrency();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token) { setCheckingAuth(false); return; }
    auth.me()
      .then((u) => { if (u?.role === 'client') router.replace('/compte/commandes'); })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    const id = orderId.trim();
    const em = email.trim();
    if (!id || !em) {
      setError(t('fillOrderAndEmail'));
      return;
    }
    const num = parseInt(id, 10);
    if (Number.isNaN(num) || num < 1) {
      setError(t('invalidOrderId'));
      return;
    }
    setLoading(true);
    try {
      const data = await ordersApi.get(num, em);
      setOrder(data);
    } catch (err) {
      setError(err.message || t('orderNotFoundCheck'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return <div className="container-page py-12 text-center text-urbans-warm/70 min-w-0">{t('loading')}</div>;

  return (
    <div className="container-page py-8 sm:py-12 min-w-0 max-w-xl mx-auto">
      <h1 className="page-title-sm mb-2">{t('trackOrderTitle')}</h1>
      <p className="text-sm text-urbans-warm/70 mb-6">
        {t('trackOrderIntro')}
      </p>

      <div className="card p-4 sm:p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {error && <Alert type="error" message={error} className="mb-4" />}
          <div>
            <label htmlFor="suivi-order-id" className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('orderIdRequired')}</label>
            <input
              id="suivi-order-id"
              type="text"
              inputMode="numeric"
              className="input-field"
              placeholder={t('orderIdPlaceholderNum')}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="suivi-email" className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('email')} *</label>
            <input
              id="suivi-email"
              type="email"
              className="input-field"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? t('searching') : t('searchOrderButton')}
          </button>
        </form>
      </div>

      {order && (
        <div className="card p-4 sm:p-6 space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-urbans-stone/60 pb-3">
            <span className="text-sm text-urbans-warm/70">{t('orderNumberShort')} {order.order_id}</span>
            <span className="inline-flex items-center rounded-full bg-urbans-sand px-3 py-1 text-xs font-medium text-urbans-noir">
              {t('status_' + order.statut) || order.statut}
            </span>
          </div>
          <p className="text-sm text-urbans-warm/80">
            <strong>{t('dateLabel')} :</strong> {formatDate(order.date_commande, locale)}
          </p>
          <p className="text-sm text-urbans-warm/80">
            <strong>{t('total')} :</strong> {formatPrix(order.total)}
          </p>
          {order.items?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-urbans-warm/80 mb-2">{t('itemsLabel')} :</p>
              <ul className="space-y-1 text-sm text-urbans-warm/80">
                {order.items.map((item) => (
                  <li key={item.product_id}>
                    {item.nom_parfum} × {item.quantite} — {formatPrix(item.prix_unitaire * item.quantite)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/suivi-commande" className="text-sm text-urbans-gold hover:underline inline-block mt-2">
            {t('searchAnotherOrder')}
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-urbans-warm/50">
        {t('trackOrderFooter')} <Link href="/contact" className="text-urbans-gold hover:underline">{t('contact')}</Link>.
      </p>
    </div>
  );
}
