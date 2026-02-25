'use client';

import Link from 'next/link';
import { useLocale } from '../context/LocaleContext';

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-urbans-stone/60 bg-urbans-sand py-8 pb-28 sm:py-10 sm:pb-28">
      <div className="container-page text-center text-sm text-urbans-warm/70">
        <p>{t('footerCopy')}</p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/mentions" className="hover:text-urbans-gold underline-offset-2 hover:underline">{t('legal')}</Link>
          <Link href="/confidentialite" className="hover:text-urbans-gold underline-offset-2 hover:underline">{t('privacy')}</Link>
        </p>
      </div>
    </footer>
  );
}
