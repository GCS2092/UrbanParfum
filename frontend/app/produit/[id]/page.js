'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { products as productsApi, reviews as reviewsApi } from '../../../lib/api';
import { getImageUrl } from '../../../lib/image';
import { useLocale } from '../../../context/LocaleContext';
import { useCurrency } from '../../../context/CurrencyContext';

const maxQty = (product) => Math.max(1, parseInt(product?.stock, 10) || 99);

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { t } = useLocale();
  const { formatPrix } = useCurrency();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    productsApi.get(id).then((p) => {
      setProduct(p);
      return reviewsApi.list(id).catch(() => []);
    }).then(setReviews).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    setAdding(true);
    const cart = JSON.parse(localStorage.getItem('urbans_cart') || '[]');
    const existing = cart.find((i) => i.product_id === product.product_id);
    if (existing) existing.quantity += quantity;
    else cart.push({ product_id: product.product_id, quantity, nom_parfum: product.nom_parfum, prix: product.prix, image_principale: product.image_principale });
    localStorage.setItem('urbans_cart', JSON.stringify(cart));
    setAdding(false);
    router.push('/panier');
  };

  const changeQty = (delta) => {
    const cap = maxQty(product);
    setQuantity((q) => Math.min(cap, Math.max(1, q + delta)));
  };

  if (loading) return <div className="container-form py-12 text-center text-urbans-warm/70 min-w-0">{t('loading')}</div>;
  if (!product) return <div className="container-form py-12 text-center text-red-600 min-w-0">{t('productNotFound')}</div>;

  const notesByType = (type) => (product.notes || []).filter((n) => n.type_note === type).map((n) => n.nom_note).join(', ') || '–';
  const cap = maxQty(product);

  return (
    <div className="container-page py-6 sm:py-10 min-w-0">
      <div className="mx-auto max-w-4xl">
        <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-sm text-urbans-warm/70 hover:text-urbans-gold transition-colors mb-6">
          <span aria-hidden>←</span> {t('backToCatalog')}
        </Link>

        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          <div className="aspect-[3/4] sm:aspect-square max-w-full overflow-hidden rounded-2xl bg-urbans-sand border border-urbans-stone/50 shadow-soft">
            {product.image_principale ? (
              <img src={getImageUrl(product.image_principale)} alt={product.nom_parfum} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex h-full items-center justify-center text-urbans-blush">{t('image')}</span>
            )}
          </div>

          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{product.genre}</span>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-urbans-noir break-words mt-1 sm:text-3xl">
              {product.nom_parfum}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.type_parfum && <span className="rounded-full bg-urbans-sand border border-urbans-stone/60 px-3 py-1 text-xs font-medium text-urbans-warm">{product.type_parfum}</span>}
              {product.volume_ml && <span className="rounded-full bg-urbans-sand border border-urbans-stone/60 px-3 py-1 text-xs font-medium text-urbans-warm">{product.volume_ml} ml</span>}
            </div>

            <p className="mt-6 font-display text-3xl font-semibold text-urbans-gold">{formatPrix(product.prix)}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-0">
                <label className="sr-only">{t('quantity')}</label>
                <button
                  type="button"
                  onClick={() => changeQty(-1)}
                  disabled={quantity <= 1}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-l-xl border border-urbans-stone bg-urbans-cream/80 text-urbans-noir transition-colors hover:bg-urbans-sand disabled:opacity-50 disabled:pointer-events-none"
                  aria-label={t('decreaseQty')}
                >
                  −
                </button>
                <span className="flex h-11 min-w-[3rem] items-center justify-center border-y border-urbans-stone bg-white px-3 text-sm font-medium text-urbans-noir" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(1)}
                  disabled={quantity >= cap}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-r-xl border border-urbans-stone bg-urbans-cream/80 text-urbans-noir transition-colors hover:bg-urbans-sand disabled:opacity-50 disabled:pointer-events-none"
                  aria-label={t('increaseQty')}
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button type="button" onClick={addToCart} disabled={adding} className="btn-primary w-full sm:w-auto min-w-[160px]">
                  {adding ? t('adding') : t('addToCart')}
                </button>
                <button type="button" onClick={() => router.push('/checkout?product=' + product.product_id + '&qty=' + quantity)} className="btn-secondary w-full sm:w-auto">
                  {t('buyNow')}
                </button>
              </div>
            </div>

            {product.description && (
              <div className="mt-8 pt-6 border-t border-urbans-stone/50">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{t('description')}</h2>
                <p className="mt-3 text-base leading-relaxed text-urbans-warm/80">{product.description}</p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-urbans-stone/60 bg-urbans-cream/60 p-4 sm:p-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{t('olfactoryPyramid')}</h2>
              <dl className="mt-3 space-y-3 text-sm text-urbans-warm/80">
                <div>
                  <dt className="font-medium text-urbans-noir">{t('topNotes')}</dt>
                  <dd className="mt-0.5">{notesByType('tête')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-urbans-noir">{t('heartNotes')}</dt>
                  <dd className="mt-0.5">{notesByType('cœur')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-urbans-noir">{t('baseNotes')}</dt>
                  <dd className="mt-0.5">{notesByType('fond')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <section className="mt-14 border-t border-urbans-stone/60 pt-10">
            <h2 className="page-title-sm text-xl">{t('customerReviews')}</h2>
            <ul className="mt-5 space-y-4">
              {reviews.map((r) => (
                <li key={r.review_id} className="card p-4">
                  <span className="font-medium text-urbans-noir">{r.author_name}</span>
                  <span className="text-urbans-warm/70"> · {r.note}/5</span>
                  {r.commentaire && <p className="mt-1 text-sm text-urbans-warm/80">{r.commentaire}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
