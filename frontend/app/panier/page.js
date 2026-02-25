'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '../../lib/image';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { formatPrix } = useCurrency();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('urbans_cart') || '[]'));
  }, []);

  const updateQty = (productId, delta) => {
    const next = cart.map((i) =>
      i.product_id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    ).filter((i) => i.quantity > 0);
    setCart(next);
    localStorage.setItem('urbans_cart', JSON.stringify(next));
  };

  const remove = (productId) => {
    const next = cart.filter((i) => i.product_id !== productId);
    setCart(next);
    localStorage.setItem('urbans_cart', JSON.stringify(next));
  };

  const total = cart.reduce((s, i) => s + parseFloat(i.prix) * i.quantity, 0);

  return (
    <div className="container-page py-8 sm:py-12 min-w-0">
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title-sm mb-8">{t('cartTitle')}</h1>

        {cart.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-urbans-warm/70">{t('cartEmpty')}</p>
            <Link href="/catalogue" className="btn-primary mt-6 inline-block w-full sm:w-auto text-center">{t('viewCatalogLink')}</Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.map((i) => (
                <li key={i.product_id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <Link href={'/produit/' + i.product_id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-urbans-sand border border-urbans-stone/50">
                      {i.image_principale ? (
                        <img src={getImageUrl(i.image_principale)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-urbans-blush text-xs">{t('image')}</span>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link href={'/produit/' + i.product_id} className="font-medium text-urbans-noir hover:text-urbans-gold break-words">{(i.nom_parfum)}</Link>
                      <p className="mt-0.5 text-sm text-urbans-gold">{formatPrix(i.prix)} × {i.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={() => updateQty(i.product_id, -1)} className="h-9 w-9 rounded-full border border-urbans-stone text-urbans-warm hover:bg-urbans-sand transition-colors" aria-label={t('decrease')}>−</button>
                    <span className="w-8 text-center text-sm text-urbans-noir">{i.quantity}</span>
                    <button type="button" onClick={() => updateQty(i.product_id, 1)} className="h-9 w-9 rounded-full border border-urbans-stone text-urbans-warm hover:bg-urbans-sand transition-colors" aria-label={t('increase')}>+</button>
                    <button type="button" onClick={() => remove(i.product_id)} className="ml-2 text-sm text-red-600 hover:underline">{t('remove')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 border-t border-urbans-stone/60 pt-6">
              <Link href="/catalogue" className="btn-secondary w-full sm:w-auto inline-flex justify-center sm:justify-start">
                {t('addMoreProducts')}
              </Link>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-semibold text-urbans-gold">{t('total')} : {formatPrix(total)}</p>
                <button type="button" onClick={() => router.push('/checkout')} className="btn-primary w-full sm:w-auto">{t('checkout')}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
