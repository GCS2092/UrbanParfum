'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '../../lib/api';
import Alert from '../../components/Alert';
import { useLocale } from '../../context/LocaleContext';

function CompteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const redirect = searchParams.get('redirect') || '/';
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token) { setAuthLoading(false); return; }
    auth.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      const token = data.token;
      const user = data.user;
      if (!token) throw new Error('Réponse serveur invalide');
      localStorage.setItem('urbans_token', token);
      const target = user?.role === 'admin'
        ? (redirect.startsWith('/admin') ? redirect : '/admin')
        : (redirect === '/' ? '/' : redirect);
      window.location.href = target;
    } catch (err) {
      setError(err.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.register({ email, password, nom, prenom });
      const token = data.token;
      if (!token) throw new Error('Réponse serveur invalide');
      localStorage.setItem('urbans_token', token);
      window.location.href = redirect === '/' ? '/' : redirect;
    } catch (err) {
      setError(err.message || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container-page py-10 sm:py-16 min-w-0 flex justify-center items-center min-h-[40vh]">
        <p className="text-urbans-warm/70">{t('loading')}</p>
      </div>
    );
  }
  if (user && user.role === 'admin') {
    router.replace('/admin');
    return null;
  }
  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('urbans_token');
    router.push('/compte');
  };

  if (user && user.role === 'client') {
    return (
      <div className="container-page py-10 sm:py-16 min-w-0">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-urbans-gold">{t('clientArea')}</span>
            <h1 className="page-title mt-3">{t('myAccount')}</h1>
            <p className="mt-2 text-sm text-urbans-warm/70">
              {t('welcome').replace('{name}', user.prenom || user.email)}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/compte/commandes" className="card-hover card p-6 sm:p-8 block">
              <span className="text-xs font-medium uppercase tracking-wider text-urbans-gold">{t('trackOrderShort')}</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-urbans-noir">{t('myOrders')}</h2>
              <p className="mt-3 text-sm text-urbans-warm/70">{t('orderHistoryDesc')}</p>
            </Link>
            <Link href="/compte/discussion" className="card-hover card p-6 sm:p-8 block">
              <span className="text-xs font-medium uppercase tracking-wider text-urbans-gold">{t('support')}</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-urbans-noir">{t('discussion')}</h2>
              <p className="mt-3 text-sm text-urbans-warm/70">{t('discussionDesc')}</p>
            </Link>
          </div>
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={handleLogout} className="btn-secondary">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-16 min-w-0">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-urbans-gold">{t('clientArea')}</span>
          <h1 className="page-title mt-3">{t('account')}</h1>
          <p className="mt-2 text-sm text-urbans-warm/70">
            {t('connectOrCreate')}
          </p>
        </div>

        <div className="card overflow-hidden shadow-soft-lg">
          <div className="flex border-b border-urbans-stone/60 bg-urbans-sand/50">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login'
                ? 'border-b-2 border-urbans-gold text-urbans-noir bg-white'
                : 'text-urbans-warm/60 hover:text-urbans-noir'}`}
            >
              {t('loginTab')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'register'
                ? 'border-b-2 border-urbans-gold text-urbans-noir bg-white'
                : 'text-urbans-warm/60 hover:text-urbans-noir'}`}
            >
              {t('registerTab')}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && <Alert type="error" message={error} className="mb-6" />}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('email')}</label>
                  <input
                    id="login-email"
                    type="email"
                    className="input-field"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('passwordLabel')}</label>
                  <input
                    id="login-password"
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? t('connecting') : t('connectButton')}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-prenom" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('firstName')}</label>
                    <input id="reg-prenom" className="input-field" placeholder={t('firstName')} value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" />
                  </div>
                  <div>
                    <label htmlFor="reg-nom" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('lastName')}</label>
                    <input id="reg-nom" className="input-field" placeholder={t('lastName')} value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('email')}</label>
                  <input id="reg-email" type="email" className="input-field" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-medium text-urbans-warm/80 mb-1.5">{t('passwordMin')}</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? t('creatingAccount') : t('createAccountButton')}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-urbans-warm/50">
          {t('testAccountNote')}
        </p>
      </div>
    </div>
  );
}

export default function ComptePage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-10 text-center text-urbans-warm/70">{t('loading')}</div>}>
      <CompteForm />
    </Suspense>
  );
}
