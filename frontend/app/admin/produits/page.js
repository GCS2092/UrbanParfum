'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '../../../lib/api';
import { formatPrix } from '../../../lib/format';
import Alert from '../../../components/Alert';

export default function AdminProduitsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.products.list()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, nom) => {
    if (!confirm('Supprimer le parfum « ' + nom + ' » ?')) return;
    try {
      await admin.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="py-6 text-urbans-warm/70">Chargement…</p>;
  if (error) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.products.list().then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">
            Réessayer
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title-sm">Produits</h1>
        <Link href="/admin/produits/nouveau" className="btn-primary">Ajouter un parfum</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-urbans-stone/50 bg-white shadow-soft">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-urbans-stone/60 bg-urbans-sand/60">
            <tr>
              <th className="p-4 font-semibold text-urbans-noir">ID</th>
              <th className="p-4 font-semibold text-urbans-noir">Nom</th>
              <th className="p-4 font-semibold text-urbans-noir">Prix</th>
              <th className="p-4 font-semibold text-urbans-noir">Stock</th>
              <th className="p-4 font-semibold text-urbans-noir">Statut</th>
              <th className="p-4 font-semibold text-urbans-noir">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id} className="border-b border-urbans-stone/40 last:border-0 hover:bg-urbans-cream/50 transition-colors">
                <td className="p-4 text-urbans-warm/80">{p.product_id}</td>
                <td className="p-4 font-medium text-urbans-noir">{p.nom_parfum}</td>
                <td className="p-4 text-urbans-warm/80">{formatPrix(p.prix)}</td>
                <td className="p-4">
                  <span className={p.stock != null && p.stock < 5 ? 'font-medium text-red-600' : 'text-urbans-warm/80'}>{p.stock ?? 0}</span>
                  {p.stock != null && p.stock < 5 && <span className="ml-1 text-xs text-red-600">(faible)</span>}
                </td>
                <td className="p-4">{p.actif ? <span className="inline-flex rounded-full bg-urbans-gold/20 px-2.5 py-0.5 text-xs font-medium text-urbans-noir">Actif</span> : <span className="text-urbans-warm/50">Inactif</span>}</td>
                <td className="p-4">
                  <Link href={'/admin/produits/' + p.product_id} className="text-urbans-gold hover:text-urbans-noir font-medium transition-colors mr-4">Modifier</Link>
                  <button type="button" onClick={() => handleDelete(p.product_id, p.nom_parfum)} className="text-red-600/90 hover:text-red-600 font-medium transition-colors">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="mt-6 text-urbans-warm/70">Aucun produit.</p>}
    </div>
  );
}
