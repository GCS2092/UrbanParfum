'use client';

import { LocaleProvider } from '../context/LocaleContext';
import { CurrencyProvider } from '../context/CurrencyContext';

export default function Providers({ children }) {
  return (
    <LocaleProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </LocaleProvider>
  );
}
