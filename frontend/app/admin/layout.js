'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';
import AdminNav from '../../components/AdminNav';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('urbans_token');
    if (!token) {
      setLoading(false);
      router.replace('/compte?redirect=/admin');
      return;
    }
    auth.me()
      .then((user) => {
        if (user?.role !== 'admin') {
          setOk(false);
          router.replace('/');
          return;
        }
        setOk(true);
      })
      .catch(() => {
        router.replace('/compte?redirect=/admin');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-urbans-cream">
        <p className="text-urbans-warm/70">Vérification des droits…</p>
      </div>
    );
  }
  if (!ok) return null;

  return (
    <div className="min-w-0 bg-urbans-cream min-h-screen">
      <div className="container-page py-8 pb-24">{children}</div>
      <AdminNav />
    </div>
  );
}
