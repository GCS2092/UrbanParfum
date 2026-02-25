import { Suspense } from 'react';
import CheckoutSuccessContent from './CheckoutSuccessContent';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}