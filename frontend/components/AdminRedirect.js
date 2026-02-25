'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../lib/api';

/**
 * Si l'utilisateur est admin et se trouve sur une page "client" (accueil, catalogue, panier, etc.),
 * on le redirige vers le dashboard admin. Il ne peut accéder qu'à /admin/* et /compte.
 */
export default function AdminRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token) {
      setCheckDone(true);
      return;
    }
    auth
      .me()
      .then((user) => {
        if (user?.role === 'admin') {
          const isAdminRoute = pathname?.startsWith('/admin');
          const isCompte = pathname === '/compte';
          if (!isAdminRoute && !isCompte) {
            router.replace('/admin');
            return;
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckDone(true));
  }, [pathname, router]);

  return null;
}
