'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '../../../../lib/api';
import { formatPrix } from '../../../../lib/format';
import Alert from '../../../../components/Alert';

const STATUT_OPTIONS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'payee', label: 'Payée' },
  { value: 'expediee', label: 'Expédiée' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

export default function AdminCommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    admin.orders.get(id)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatut) => {
    setUpdating(true);
    setError('');
    setStatusSuccess(false);
    try {
      await admin.orders.updateStatus(id, newStatut);
      setOrder((prev) => (prev ? { ...prev, statut: newStatut } : null));
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3500);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error && !order) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.orders.get(id).then(setOrder).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">Réessayer</button>
        </Alert>
      </div>
    );
  }
  if (!order) return null;

  const email = order.user_email || order.guest_email;
  const nom = order.user_nom || order.guest_nom;
  const prenom = order.user_prenom || order.guest_prenom;

  const dateStr = order.date_commande ? new Date(order.date_commande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const statutLabels = { en_cours: 'En cours', payee: 'Payée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' };

  return (
    <div className="relative">
      {/* Popup succès changement de statut */}
      {statusSuccess && (
        <div
          role="alert"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] rounded-2xl border border-urbans-gold/40 bg-urbans-cream shadow-soft-lg px-6 py-4 flex items-center gap-3 animate-fade-in-up"
        >
          <span className="text-urbans-gold text-xl" aria-hidden>✓</span>
          <div>
            <p className="font-semibold text-urbans-noir">Statut changé</p>
            <p className="text-sm text-urbans-warm/80">Profitez-en pour suivre la commande.</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
        <Link href="/admin/commandes" className="text-sm sm:text-base text-urbans-warm/80 hover:text-urbans-noir transition-colors">← Commandes</Link>
      </div>

      {/* En-tête commande */}
      <div className="card overflow-hidden p-0 mb-6">
        <div className="bg-urbans-sand/60 px-5 py-4 sm:px-6 sm:py-5 border-b border-urbans-stone/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-urbans-noir">Commande #{order.order_id}</h1>
              <p className="text-sm text-urbans-warm/70 mt-1">{dateStr}</p>
            </div>
            <span className="inline-flex rounded-full bg-urbans-noir/10 px-3 py-1.5 text-sm font-medium text-urbans-noir">
              {statutLabels[order.statut] || order.statut}
            </span>
          </div>
        </div>
        {error && <div className="px-5 py-3 sm:px-6"><Alert type="error" message={error} /></div>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">Client</span>
          <p className="mt-2 font-medium text-urbans-noir">{prenom} {nom}</p>
          <p className="text-sm text-urbans-warm/80 mt-0.5">{email}</p>
        </div>
        <div className="card p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">Livraison</span>
          <p className="mt-2 text-urbans-noir">{order.adresse_ligne1}</p>
          {order.adresse_ligne2 && <p className="text-sm text-urbans-warm/80">{order.adresse_ligne2}</p>}
          <p className="text-sm text-urbans-warm/80 mt-1">{[order.code_postal, order.ville, order.pays].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <div className="mt-5 card p-5 sm:p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">Statut</span>
        <div className="mt-3">
          <select
            className="input-field max-w-xs rounded-xl border-urbans-stone/60 focus:border-urbans-gold focus:ring-urbans-gold"
            value={order.statut}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
          >
            {STATUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 card overflow-hidden p-0">
        <div className="px-5 py-4 sm:px-6 border-b border-urbans-stone/40 bg-urbans-sand/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">Détail de la commande</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-urbans-stone/40">
                <th className="text-left p-4 font-semibold text-urbans-noir">Article</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-20">Qté</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-28">Prix unit.</th>
                <th className="text-right p-4 font-semibold text-urbans-noir w-28">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => {
                const st = (item.quantite || 0) * (parseFloat(item.prix_unitaire) || 0);
                return (
                  <tr key={item.product_id} className="border-b border-urbans-stone/30 last:border-0">
                    <td className="p-4 text-urbans-noir">{item.nom_parfum}</td>
                    <td className="p-4 text-right text-urbans-warm/80">{item.quantite}</td>
                    <td className="p-4 text-right text-urbans-warm/80">{formatPrix(item.prix_unitaire)}</td>
                    <td className="p-4 text-right font-medium text-urbans-noir">{formatPrix(st)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 sm:px-6 bg-urbans-sand/40 border-t border-urbans-stone/40 flex justify-end">
          <p className="text-lg font-semibold text-urbans-noir">Total : {formatPrix(order.total)}</p>
        </div>
      </div>
    </div>
  );
}
