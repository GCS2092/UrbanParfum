'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '../../lib/api';
import { formatPrix } from '../../lib/format';

const STATUT_OPTIONS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'payee', label: 'Payée' },
  { value: 'expediee', label: 'Expédiée' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];
const STATUT_LABELS = Object.fromEntries(STATUT_OPTIONS.map((o) => [o.value, o.label]));

const STOCK_FAIBLE_SEUIL = 5;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0 });
  const [lastOrders, setLastOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(false);

  useEffect(() => {
    Promise.all([admin.products.list(), admin.orders.list()])
      .then(([products, orders]) => {
        setStats({ products: (products || []).length, orders: (orders || []).length });
        const sorted = [...(orders || [])].sort(
          (a, b) => new Date(b.date_commande || 0) - new Date(a.date_commande || 0)
        );
        setLastOrders(sorted.slice(0, 10));
        const low = (products || []).filter((p) => p.stock != null && p.stock < STOCK_FAIBLE_SEUIL && p.actif);
        setLowStockProducts(low);
      })
      .catch(() => {});
  }, []);

  const handleStatusChange = async (orderId, newStatut) => {
    setUpdatingId(orderId);
    setStatusSuccess(false);
    try {
      await admin.orders.updateStatus(orderId, newStatut);
      setLastOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, statut: newStatut } : o))
      );
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3500);
    } catch (_) {
      // erreur silencieuse ou toast si tu en ajoutes
    } finally {
      setUpdatingId(null);
    }
  };

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

      <h1 className="page-title mb-8">Tableau de bord</h1>
      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        <Link href="/admin/produits" className="card-hover card p-6 sm:p-8 block">
          <span className="text-xs font-medium uppercase tracking-wider text-urbans-gold">Catalogue</span>
          <h2 className="mt-2 font-display text-xl font-semibold text-urbans-noir">Produits</h2>
          <p className="mt-3 text-3xl font-semibold text-urbans-noir">{stats.products}</p>
          <p className="mt-1 text-sm text-urbans-warm/70">Gérer le catalogue et le stock</p>
        </Link>
        <Link href="/admin/commandes" className="card-hover card p-6 sm:p-8 block">
          <span className="text-xs font-medium uppercase tracking-wider text-urbans-gold">Suivi</span>
          <h2 className="mt-2 font-display text-xl font-semibold text-urbans-noir">Commandes</h2>
          <p className="mt-3 text-3xl font-semibold text-urbans-noir">{stats.orders}</p>
          <p className="mt-1 text-sm text-urbans-warm/70">Voir et mettre à jour les statuts</p>
        </Link>
      </div>

      {lowStockProducts.length > 0 && (
        <section className="card p-5 sm:p-6 mb-6 border-amber-200 bg-amber-50/50">
          <h2 className="font-display text-base font-semibold text-urbans-noir mb-2">Stock faible (&lt; {STOCK_FAIBLE_SEUIL })</h2>
          <p className="text-sm text-urbans-warm/80 mb-3">{lowStockProducts.length} produit(s) à réapprovisionner.</p>
          <ul className="space-y-1 text-sm">
            {lowStockProducts.slice(0, 8).map((p) => (
              <li key={p.product_id}>
                <Link href={'/admin/produits/' + p.product_id} className="text-urbans-gold hover:text-urbans-noir font-medium">
                  {p.nom_parfum}
                </Link>
                <span className="text-urbans-warm/70 ml-2">— Stock : {p.stock}</span>
              </li>
            ))}
          </ul>
          {lowStockProducts.length > 8 && <p className="text-xs text-urbans-warm/60 mt-2">… et {lowStockProducts.length - 8} autre(s)</p>}
          <Link href="/admin/produits" className="inline-block mt-3 text-sm font-medium text-urbans-gold hover:text-urbans-noir">Voir tous les produits →</Link>
        </section>
      )}

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-urbans-noir mb-4">10 dernières commandes</h2>
        {lastOrders.length === 0 ? (
          <p className="text-urbans-warm/70 text-sm">Aucune commande.</p>
        ) : (
          <>
            {/* Mobile: cartes avec select statut + lien détail */}
            <div className="space-y-3 sm:hidden">
              {lastOrders.map((o) => (
                <div
                  key={o.order_id}
                  className="rounded-2xl border border-urbans-stone/50 bg-white p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-urbans-noir">N° {o.order_id}</p>
                      <p className="text-sm text-urbans-warm/80 mt-0.5">
                        {o.date_commande ? new Date(o.date_commande).toLocaleDateString('fr-FR') : '—'} · {formatPrix(o.total)}
                      </p>
                    </div>
                    <select
                      value={o.statut || ''}
                      onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                      disabled={updatingId === o.order_id}
                      className="rounded-lg border border-urbans-stone/60 bg-white px-2 py-1.5 text-urbans-noir text-xs focus:border-urbans-gold focus:outline-none focus:ring-1 focus:ring-urbans-gold shrink-0"
                    >
                      {STATUT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <Link
                    href={'/admin/commandes/' + o.order_id}
                    className="text-urbans-gold hover:text-urbans-noir font-medium text-sm"
                  >
                    Voir détail →
                  </Link>
                </div>
              ))}
            </div>
            {/* Desktop: tableau */}
            <div className="hidden sm:block overflow-x-auto -mx-2">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-urbans-stone/60">
                  <tr>
                    <th className="p-3 font-semibold text-urbans-noir">N°</th>
                    <th className="p-3 font-semibold text-urbans-noir">Date</th>
                    <th className="p-3 font-semibold text-urbans-noir">Total</th>
                    <th className="p-3 font-semibold text-urbans-noir">Statut</th>
                    <th className="p-3 font-semibold text-urbans-noir">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrders.map((o) => (
                    <tr key={o.order_id} className="border-b border-urbans-stone/40 last:border-0 hover:bg-urbans-cream/50">
                      <td className="p-3 font-medium text-urbans-noir">{o.order_id}</td>
                      <td className="p-3 text-urbans-warm/80">
                        {o.date_commande ? new Date(o.date_commande).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="p-3 text-urbans-warm/80">{formatPrix(o.total)}</td>
                      <td className="p-3">
                        <select
                          value={o.statut || ''}
                          onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                          disabled={updatingId === o.order_id}
                          className="rounded-lg border border-urbans-stone/60 bg-white px-2 py-1.5 text-urbans-noir text-xs focus:border-urbans-gold focus:outline-none focus:ring-1 focus:ring-urbans-gold"
                        >
                          {STATUT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <Link
                          href={'/admin/commandes/' + o.order_id}
                          className="text-urbans-gold hover:text-urbans-noir font-medium transition-colors text-xs"
                        >
                          Détail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
