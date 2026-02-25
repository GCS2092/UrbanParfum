'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '../../../lib/api';
import { formatPrix } from '../../../lib/format';
import Alert from '../../../components/Alert';

const STATUT_LABELS = { en_cours: 'En cours', payee: 'Payée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' };

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.orders.list()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.orders.list().then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">
            Réessayer
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title-sm mb-6">Commandes</h1>

      {/* Mobile: cartes */}
      <div className="space-y-3 sm:hidden">
        {orders.length === 0 && <p className="text-urbans-warm/70">Aucune commande.</p>}
        {orders.map((o) => (
          <Link
            key={o.order_id}
            href={'/admin/commandes/' + o.order_id}
            className="block rounded-2xl border border-urbans-stone/50 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-urbans-noir">N° {o.order_id}</p>
                <p className="text-sm text-urbans-warm/80 mt-0.5">
                  {o.date_commande ? new Date(o.date_commande).toLocaleDateString('fr-FR') : '—'} · {formatPrix(o.total)}
                </p>
                <p className="text-xs text-urbans-warm/70 mt-1 truncate">{o.user_email || o.guest_email || '—'}</p>
              </div>
              <span className="shrink-0 rounded-full bg-urbans-sand px-2.5 py-1 text-xs font-medium text-urbans-noir">
                {STATUT_LABELS[o.statut] || o.statut}
              </span>
            </div>
            <p className="mt-3 text-urbans-gold text-sm font-medium">Voir détail →</p>
          </Link>
        ))}
      </div>

      {/* Desktop: tableau */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-urbans-stone/50 bg-white shadow-soft">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-urbans-stone/60 bg-urbans-sand/60">
            <tr>
              <th className="p-4 font-semibold text-urbans-noir">N°</th>
              <th className="p-4 font-semibold text-urbans-noir">Date</th>
              <th className="p-4 font-semibold text-urbans-noir">Total</th>
              <th className="p-4 font-semibold text-urbans-noir">Statut</th>
              <th className="p-4 font-semibold text-urbans-noir">Client</th>
              <th className="p-4 font-semibold text-urbans-noir">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id} className="border-b border-urbans-stone/40 last:border-0 hover:bg-urbans-cream/50 transition-colors">
                <td className="p-4 font-medium text-urbans-noir">{o.order_id}</td>
                <td className="p-4 text-urbans-warm/80">{new Date(o.date_commande).toLocaleDateString('fr-FR')}</td>
                <td className="p-4 text-urbans-warm/80">{formatPrix(o.total)}</td>
                <td className="p-4"><span className="inline-flex rounded-full bg-urbans-sand px-2.5 py-0.5 text-xs font-medium text-urbans-noir">{STATUT_LABELS[o.statut] || o.statut}</span></td>
                <td className="p-4 text-urbans-warm/80">{o.user_email || o.guest_email || '—'}</td>
                <td className="p-4">
                  <Link href={'/admin/commandes/' + o.order_id} className="text-urbans-gold hover:text-urbans-noir font-medium transition-colors">Détail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p className="mt-6 text-urbans-warm/70 sm:hidden">Aucune commande.</p>}
    </div>
  );
}
