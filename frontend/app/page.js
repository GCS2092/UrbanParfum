'use client';

import Link from 'next/link';
import { useLocale } from '../context/LocaleContext';

export default function HomePage() {
  const { t } = useLocale();

  return (
    <div className="min-w-0">
      <section className="relative bg-gradient-hero py-32 sm:py-40 md:py-48">
        <div className="container-page text-center animate-fade-in-up">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-urbans-gold-light sm:text-sm">
            {t('homeSubtitle')}
          </p>
          <div className="mt-4 h-px w-16 mx-auto bg-urbans-gold/60" aria-hidden />
          <h1 className="mt-8 font-display text-5xl font-medium tracking-tight text-urbans-cream sm:text-6xl md:text-7xl">
            UrbanS
          </h1>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-urbans-blush">
            {t('homeTagline')}
          </p>
          <div className="mt-14">
            <Link
              href="/catalogue"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-urbans-gold bg-urbans-gold px-8 py-3 text-sm font-medium text-urbans-noir transition-all hover:bg-urbans-gold-light hover:border-urbans-gold-light focus-visible:outline focus-visible:ring-2 focus-visible:ring-urbans-gold focus-visible:ring-offset-2 focus-visible:ring-offset-urbans-noir"
            >
              {t('discoverCollection')}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-urbans-cream py-20 sm:py-28 animate-fade-in-up animate-delay-1">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{t('theCollection')}</span>
            <h2 className="mt-3 font-display text-2xl font-semibold text-urbans-noir sm:text-3xl">
              {t('collectionTitle')}
            </h2>
            <p className="mt-5 text-urbans-warm/80">
              {t('collectionDesc')}
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/catalogue" className="btn-primary w-full sm:w-auto">
                {t('viewCatalog')}
              </Link>
              <Link href="/marque" className="btn-secondary w-full sm:w-auto">
                {t('brand')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-urbans-stone/60 bg-urbans-sand py-20 sm:py-28 animate-fade-in-up animate-delay-2">
        <div className="container-page">
          <span className="block text-center text-xs font-medium uppercase tracking-[0.2em] text-urbans-gold">{t('ourUniverse')}</span>
          <h2 className="mt-3 text-center font-display text-2xl font-semibold text-urbans-noir sm:text-3xl">
            {t('whatGuidesUs')}
          </h2>
          <ul className="mx-auto mt-16 grid max-w-4xl gap-14 sm:grid-cols-3 sm:gap-10">
            <li className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-urbans-gold/50 bg-urbans-cream/80 font-display text-lg font-semibold text-urbans-gold">1</span>
              <h3 className="mt-6 font-display text-lg font-semibold text-urbans-noir">{t('emotionIdentity')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-urbans-warm/70">
                {t('emotionDesc')}
              </p>
            </li>
            <li className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-urbans-gold/50 bg-urbans-cream/80 font-display text-lg font-semibold text-urbans-gold">2</span>
              <h3 className="mt-6 font-display text-lg font-semibold text-urbans-noir">{t('qualityPremium')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-urbans-warm/70">
                {t('qualityDesc')}
              </p>
            </li>
            <li className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-urbans-gold/50 bg-urbans-cream/80 font-display text-lg font-semibold text-urbans-gold">3</span>
              <h3 className="mt-6 font-display text-lg font-semibold text-urbans-noir">{t('accessible')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-urbans-warm/70">
                {t('accessibleDesc')}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-urbans-stone/60 bg-urbans-cream py-12 sm:py-14 animate-fade-in-up animate-delay-3">
        <div className="container-page">
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center text-sm text-urbans-warm/70 sm:gap-x-16">
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-urbans-gold" aria-hidden />
              {t('fastDelivery')}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-urbans-gold" aria-hidden />
              {t('orderWithoutAccount')}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-urbans-gold" aria-hidden />
              {t('securePayment')}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
