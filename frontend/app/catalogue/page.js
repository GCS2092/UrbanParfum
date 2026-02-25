'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products as productsApi, filters as filtersApi } from '../../lib/api';
import { getImageUrl } from '../../lib/image';
import Alert from '../../components/Alert';
import { useLocale } from '../../context/LocaleContext';
import { useCurrency } from '../../context/CurrencyContext';

const GENRES = [
  { value: '', labelKey: 'all' },
  { value: 'Homme', labelKey: 'man' },
  { value: 'Femme', labelKey: 'woman' },
  { value: 'Unisexe', labelKey: 'unisex' },
];

export default function CataloguePage() {
  const { t } = useLocale();
  const { formatPrix } = useCurrency();
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [genre, setGenre] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [occasionId, setOccasionId] = useState('');
  const [universeId, setUniverseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      filtersApi.families().then(setFamilies).catch(() => []),
      filtersApi.occasions().then(setOccasions).catch(() => []),
      filtersApi.emotionalUniverses().then(setUniverses).catch(() => []),
    ]);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (genre) params.genre = genre;
    if (familyId) params.family_id = familyId;
    if (occasionId) params.occasion_id = occasionId;
    if (universeId) params.universe_id = universeId;
    productsApi.list(params).then(setProducts).catch((e) => { setError(e.message); setProducts([]); }).finally(() => setLoading(false));
  }, [genre, familyId, occasionId, universeId]);

  const hasFilters = genre || familyId || occasionId || universeId;
  const refetch = () => {
    setError('');
    setLoading(true);
    const params = {};
    if (genre) params.genre = genre;
    if (familyId) params.family_id = familyId;
    if (occasionId) params.occasion_id = occasionId;
    if (universeId) params.universe_id = universeId;
    productsApi.list(params).then(setProducts).catch((e) => { setError(e.message); setProducts([]); }).finally(() => setLoading(false));
  };

  return (
    <div className="container-page py-10 sm:py-14 min-w-0">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{t('catalog')}</span>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-urbans-noir sm:text-4xl mt-2 mb-10">
        {t('ourPerfumes')}
      </h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-urbans-warm/60 mr-1">{t('genre')}</span>
          {GENRES.map(({ value, labelKey }) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => setGenre(value)}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                genre === value
                  ? 'bg-urbans-noir text-urbans-cream'
                  : 'bg-white border border-urbans-stone/70 text-urbans-warm hover:border-urbans-gold/50 hover:text-urbans-noir'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-urbans-warm/60">{t('family')}</label>
          <select className="input-field w-full sm:w-auto min-w-[140px] max-w-[180px] py-2 text-sm" value={familyId} onChange={(e) => setFamilyId(e.target.value)} aria-label={t('family')}>
            <option value="">{t('allFilters')}</option>
            {families.map((f) => <option key={f.family_id} value={f.family_id}>{f.nom_famille}</option>)}
          </select>
          <label className="text-xs font-medium uppercase tracking-wider text-urbans-warm/60 sm:ml-2">{t('occasion')}</label>
          <select className="input-field w-full sm:w-auto min-w-[140px] max-w-[180px] py-2 text-sm" value={occasionId} onChange={(e) => setOccasionId(e.target.value)} aria-label={t('occasion')}>
            <option value="">{t('allFilters')}</option>
            {occasions.map((o) => <option key={o.occasion_id} value={o.occasion_id}>{o.libelle}</option>)}
          </select>
          <label className="text-xs font-medium uppercase tracking-wider text-urbans-warm/60 sm:ml-2">{t('universe')}</label>
          <select className="input-field w-full sm:w-auto min-w-[140px] max-w-[180px] py-2 text-sm" value={universeId} onChange={(e) => setUniverseId(e.target.value)} aria-label={t('universe')}>
            <option value="">{t('allFiltersM')}</option>
            {universes.map((u) => <option key={u.universe_id} value={u.universe_id}>{u.libelle}</option>)}
          </select>
          {hasFilters && (
            <button type="button" onClick={() => { setGenre(''); setFamilyId(''); setOccasionId(''); setUniverseId(''); }} className="text-sm text-urbans-warm/70 hover:text-urbans-gold underline underline-offset-2">
              {t('resetFilters')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-8">
          <button type="button" onClick={refetch} className="underline font-medium">{t('retry')}</button>
        </Alert>
      )}
      {loading && <p className="py-16 text-center text-urbans-warm/70">{t('loading')}</p>}
      {!loading && products.length === 0 && (
        <p className="py-16 text-center text-urbans-warm/70">{t('noProducts')}</p>
      )}
      {!loading && products.length > 0 && (
        <ul className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.product_id}>
              <Link
                href={'/produit/' + p.product_id}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-urbans-sand border border-urbans-stone/50 shadow-soft transition-all duration-300 group-hover:shadow-soft-lg group-hover:border-urbans-gold/40">
                  {p.image_principale ? (
                    <img
                      src={getImageUrl(p.image_principale)}
                      alt={p.nom_parfum}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-urbans-blush text-sm">{t('image')}</div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-urbans-noir/0 transition-all duration-300 group-hover:bg-urbans-noir/15">
                    <span className="rounded-full bg-urbans-cream/95 border border-urbans-gold/30 px-4 py-2 text-sm font-medium text-urbans-noir opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                      {t('view')}
                    </span>
                  </span>
                </div>
                <div className="mt-4">
                  <h2 className="font-display text-lg font-semibold text-urbans-noir line-clamp-2 group-hover:text-urbans-gold transition-colors">
                    {p.nom_parfum}
                  </h2>
                  <p className="mt-1 text-sm text-urbans-warm/70">
                    {p.genre}
                    {p.type_parfum && ` · ${p.type_parfum}`}
                    {p.volume_ml ? ` · ${p.volume_ml} ml` : ''}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-urbans-gold">
                    {formatPrix(p.prix)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
