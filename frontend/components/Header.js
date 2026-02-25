'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../lib/api';
import { useLocale } from '../context/LocaleContext';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES, CURRENCY_LABELS } from '../lib/currency.js';

const clientLinksBase = [
  { href: '/catalogue', labelKey: 'catalog' },
  { href: '/marque', labelKey: 'brand' },
  { href: '/panier', labelKey: 'cart' },
  { href: '/suivi-commande', labelKey: 'trackOrder' },
  { href: '/contact', labelKey: 'contact' },
  { href: '/faq', labelKey: 'faq' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    setHasToken(!!token);
    if (!token) {
      setIsAdmin(false);
      setIsClient(false);
      return;
    }
    auth.me().then((u) => {
      setIsAdmin(u?.role === 'admin');
      setIsClient(u?.role === 'client');
    }).catch(() => { setIsAdmin(false); setIsClient(false); });
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('urbans_token');
    setHasToken(false);
    setIsAdmin(false);
    router.push(isAdmin ? '/compte' : '/');
  };

  const isAdminArea = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 border-b border-urbans-stone bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 min-h-[44px] items-center justify-between gap-3">
        <Link href={isAdmin ? '/admin' : '/'} className="shrink-0 min-h-[44px] min-w-[44px] md:min-w-0" aria-label={t('home')} />

        {!isAdminArea && (
          <div className="flex flex-1 min-w-0 items-center justify-end gap-2.5 md:hidden">
            <span className="sr-only">{t('language')}</span>
            <div className="header-pill shrink-0" role="group" aria-label={t('language')}>
              {['fr', 'en'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`header-pill-btn ${locale === loc ? 'header-pill-btn-active' : 'header-pill-btn-inactive'}`}
                  aria-pressed={locale === loc}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="header-currency-select w-[72px] shrink-0"
              aria-label={t('currency')}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
              ))}
            </select>
            {hasToken ? (
              <>
                <Link href="/compte" className="text-sm font-medium text-urbans-warm hover:text-urbans-noir py-2 px-2 transition-colors">{t('account')}</Link>
                <button type="button" onClick={handleLogout} className="btn-primary !py-2 !px-4 text-xs font-semibold rounded-full min-h-[36px]">
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link href="/compte" className="btn-primary !py-2 !px-4 text-xs font-semibold rounded-full min-h-[36px]">{t('login')}</Link>
            )}
          </div>
        )}
        {!isAdminArea && (
          <nav className="flex flex-1 min-w-0 items-center gap-4 text-sm flex-wrap justify-end sm:gap-6 hidden md:flex">
            <div className="flex items-center gap-4 sm:gap-6 mr-auto flex-wrap">
              {(isClient ? clientLinksBase.filter((l) => l.href !== '/suivi-commande') : clientLinksBase).map(({ href, labelKey }) => (
                <Link key={href} href={href} className="text-urbans-warm hover:text-urbans-noir whitespace-nowrap transition-colors py-2">
                  {t(labelKey)}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap border-l border-urbans-stone/40 pl-4 ml-2">
              <span className="text-[11px] font-semibold text-urbans-warm/80 uppercase tracking-widest">{t('language')}</span>
              <div className="header-pill" role="group" aria-label={t('language')}>
                {['fr', 'en'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocale(loc)}
                    className={`header-pill-btn ${locale === loc ? 'header-pill-btn-active' : 'header-pill-btn-inactive'}`}
                    aria-pressed={locale === loc}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-urbans-warm/80 uppercase tracking-widest">{t('currency')}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="header-currency-select min-w-[80px]"
                aria-label={t('currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasToken && (
                <Link href="/compte" className="text-sm font-medium text-urbans-warm hover:text-urbans-noir whitespace-nowrap transition-colors py-2 px-2">{t('account')}</Link>
              )}
              {hasToken && (
                <button type="button" onClick={handleLogout} className="header-btn-outline whitespace-nowrap">
                  {t('logout')}
                </button>
              )}
              {!hasToken && (
                <Link href="/compte" className="btn-primary !py-2 !px-5 text-sm font-semibold rounded-full min-h-[40px]">{t('login')}</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
