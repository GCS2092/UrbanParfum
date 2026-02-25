'use client';

import { useState } from 'react';
import { newsletter } from '../../lib/api';
import Alert from '../../components/Alert';
import { useLocale } from '../../context/LocaleContext';

export default function ContactPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await newsletter.subscribe(email, 'contact');
      setSent(true);
      setEmail('');
    } catch (err) {
      setError(err?.message || t('retry'));
    }
  };

  return (
    <div className="container-form py-8 sm:py-12 min-w-0">
      <h1 className="page-title-sm mb-6">{t('contactTitle')}</h1>
      <p className="mb-2 text-sm text-urbans-warm/80 sm:text-base">{t('contactIntro')}</p>
      <p className="mb-8 text-sm text-urbans-warm/80 sm:text-base">{t('phoneLabel')}</p>
      <h2 className="mb-4 font-medium text-urbans-noir">{t('newsletterTitle')}</h2>
      {sent ? <Alert type="success" message={t('subscribeSuccess')} className="mb-4" /> : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <input type="email" className="input-field flex-1 min-w-0" placeholder={t('yourEmail')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn-primary w-full sm:w-auto sm:flex-shrink-0">{t('subscribeButton')}</button>
        </form>
      )}
      {error && <Alert type="error" message={error} className="mt-4" />}
    </div>
  );
}
