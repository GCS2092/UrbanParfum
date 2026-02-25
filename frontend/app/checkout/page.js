'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { orders as ordersApi, payments as paymentsApi } from '../../lib/api';
import Alert from '../../components/Alert';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';

const VILLES_SENEGAL = [
  'Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Thiès', 'Mbour', 'Touba', 'Mbacké',
  'Saint-Louis', 'Louga', 'Kaolack', 'Fatick', 'Diourbel', 'Tambacounda', 'Kolda',
  'Ziguinchor', 'Matam', 'Kédougou', 'Sédhiou', 'Kaffrine', 'Tivaouane', 'Joal-Fadiout',
  'Richard-Toll', 'Bambey', 'Kébémer', 'Linguère', 'Nioro du Rip', 'Gossas', 'Autre'
].sort((a, b) => a.localeCompare(b, 'fr'));

const PAYS_FIXE = 'Sénégal';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const { formatPrix } = useCurrency();
  const [step, setStep] = useState('form');
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({ adresse_ligne1: '', adresse_ligne2: '', code_postal: '', ville: '', pays: PAYS_FIXE });
  const [guest, setGuest] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [codePromo, setCodePromo] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const productParam = searchParams.get('product');
    const qtyParam = searchParams.get('qty');
    if (productParam && qtyParam) {
      const product_id = parseInt(productParam, 10);
      const quantity = parseInt(qtyParam, 10);
      if (product_id && quantity) {
        setItems([{ product_id, quantity }]);
        setCart([]);
        return;
      }
    }
    const stored = JSON.parse(localStorage.getItem('urbans_cart') || '[]');
    setCart(stored);
    setItems(stored.map((i) => ({ product_id: i.product_id, quantity: i.quantity })));
  }, [searchParams]);

  const token = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('urbans_token') : null;
  const totalEstimate = cart.reduce((s, i) => s + parseFloat(i.prix || 0) * (i.quantity || 0), 0);
  const nbArticles = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalToPay = (promoResult?.valid && promoResult?.total_after != null) ? promoResult.total_after : totalEstimate;

  const handleApplyPromo = async () => {
    if (!codePromo.trim() || totalEstimate <= 0) return;
    setCheckingPromo(true);
    setPromoResult(null);
    try {
      const res = await ordersApi.validatePromo(codePromo.trim(), totalEstimate);
      setPromoResult(res);
    } catch {
      setPromoResult({ valid: false, error: t('verifying') });
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!items.length) {
      setError(t('cartEmptyError'));
      setLoading(false);
      return;
    }
    try {
      const body = {
        items,
        address: { adresse_ligne1: address.adresse_ligne1.trim(), adresse_ligne2: (address.adresse_ligne2 || '').trim() || undefined, code_postal: (address.code_postal || '').trim() || undefined, ville: address.ville.trim(), pays: PAYS_FIXE },
        guestInfo: token ? undefined : guest,
        code_promo: (codePromo && promoResult?.valid) ? codePromo.trim() : undefined,
      };
      if (!token && (!guest.email?.trim() || !guest.nom?.trim() || !guest.prenom?.trim())) {
        setError(t('fillNameEmail'));
        setLoading(false);
        return;
      }
      const order = await ordersApi.create(body);
      setOrderId(order.order_id);
      setStep('payment');
    } catch (err) {
      setError(err.message || t('orderCreateError'));
    } finally {
      setLoading(false);
    }
  };

  const goToStripe = async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const { url } = await paymentsApi.createCheckoutSession(orderId, base + '/checkout/success?order_id=' + orderId, base + '/checkout');
      if (url) window.location.href = url;
      else setError(t('paymentError'));
    } catch (err) {
      setError(err.message || t('redirecting'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'payment' && orderId) {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        router.push('/checkout/success?order_id=' + orderId);
        return;
      }
    }
  }, [step, orderId, searchParams, router]);

  const articleLabel = nbArticles > 1 ? t('articles') : t('article');

  return (
    <div className="container-page py-8 sm:py-12 min-w-0 max-w-2xl mx-auto">
      <h1 className="page-title-sm mb-2">{t('checkoutTitle')}</h1>
      <p className="text-sm text-urbans-warm/70 mb-6">{t('checkoutIntro')}</p>
      {error && <Alert type="error" message={error} className="mb-6" />}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {cart.length > 0 && (
            <>
              <div className="rounded-2xl border border-urbans-stone/50 bg-urbans-cream/50 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-urbans-warm/80">{nbArticles} {articleLabel}</span>
                  <span className="font-semibold text-urbans-noir">{formatPrix(totalEstimate)}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center border-t border-urbans-stone/40 pt-3">
                  <input
                    type="text"
                    placeholder={t('promoCode')}
                    className="input-field flex-1 min-w-[120px] py-2 text-sm"
                    value={codePromo}
                    onChange={(e) => { setCodePromo(e.target.value); setPromoResult(null); }}
                  />
                  <button type="button" onClick={handleApplyPromo} disabled={checkingPromo || !codePromo.trim()} className="btn-secondary text-sm py-2">
                    {checkingPromo ? t('verifying') : t('apply')}
                  </button>
                </div>
                {promoResult && !promoResult.valid && promoResult.error && (
                  <p className="text-xs text-red-600">{promoResult.error}</p>
                )}
                {promoResult?.valid && promoResult.discount > 0 && (
                  <p className="text-sm text-urbans-gold">{t('discount')} : −{formatPrix(promoResult.discount)}</p>
                )}
                <div className="flex items-center justify-between font-semibold text-urbans-noir pt-1">
                  <span>{t('total')}</span>
                  <span className="text-urbans-gold">{formatPrix(totalToPay)}</span>
                </div>
              </div>
            </>
          )}

          <div className="card p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-urbans-noir uppercase tracking-wider">{t('deliveryAddress')}</h2>
            <div>
              <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('address')} *</label>
              <input className="input-field" placeholder={t('addressPlaceholder')} value={address.adresse_ligne1} onChange={(e) => setAddress({ ...address, adresse_ligne1: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('complement')} <span className="text-urbans-blush/80">({t('optionalShort')})</span></label>
              <input className="input-field" placeholder={t('complementPlaceholder')} value={address.adresse_ligne2} onChange={(e) => setAddress({ ...address, adresse_ligne2: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('postalCode')} <span className="text-urbans-blush/80">({t('optionalFacultative')})</span></label>
                <input type="text" className="input-field" placeholder={t('postalCodePlaceholder')} value={address.code_postal} onChange={(e) => setAddress({ ...address, code_postal: e.target.value })} aria-required="false" />
              </div>
              <div>
                <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('city')} *</label>
                <select className="input-field" value={address.ville} onChange={(e) => setAddress({ ...address, ville: e.target.value })} required>
                  <option value="">{t('chooseCity')}</option>
                  {VILLES_SENEGAL.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-urbans-warm/60">{t('deliverySenegalOnly')}</p>
          </div>

          {!token && (
            <div className="card p-4 sm:p-5 space-y-4">
              <h2 className="text-sm font-semibold text-urbans-noir uppercase tracking-wider">{t('yourDetails')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('firstName')} *</label>
                  <input className="input-field" placeholder={t('firstName')} value={guest.prenom} onChange={(e) => setGuest({ ...guest, prenom: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('lastName')} *</label>
                  <input className="input-field" placeholder={t('lastName')} value={guest.nom} onChange={(e) => setGuest({ ...guest, nom: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('email')} *</label>
                <input type="email" className="input-field" placeholder="email@exemple.com" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-urbans-warm/80 mb-1">{t('phone')} <span className="text-urbans-blush/80">({t('optionalShort')})</span></label>
                <input type="tel" className="input-field" placeholder={t('phonePlaceholder')} value={guest.telephone} onChange={(e) => setGuest({ ...guest, telephone: e.target.value })} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? t('creatingOrder') : t('createOrder')}
          </button>
        </form>
      )}

      {step === 'payment' && orderId && (
        <div className="card p-6">
          <p className="text-urbans-warm/80 text-sm sm:text-base">{(t('orderCreatedPay').replace('{id}', orderId))}</p>
          <button type="button" onClick={goToStripe} disabled={loading} className="btn-primary mt-5 w-full py-3.5">
            {loading ? t('redirecting') : t('payByCard')}
          </button>
          <p className="mt-4 text-sm text-urbans-warm/60">{t('stripeNotConfigured')}</p>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-10 text-center text-urbans-warm/70">{t('loading')}</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
