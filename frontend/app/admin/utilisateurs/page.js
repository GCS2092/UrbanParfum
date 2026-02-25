'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '../../../lib/api';
import Alert from '../../../components/Alert';

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.users.list()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.users.list().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">Réessayer</button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title-sm mb-6">Utilisateurs inscrits</h1>
      <p className="text-sm text-urbans-warm/70 mb-6">Liste des clients ayant un compte sur la plateforme.</p>

      <div className="space-y-3 sm:hidden">
        {users.length === 0 && <p className="text-urbans-warm/70">Aucun utilisateur.</p>}
        {users.map((u) => (
          <div key={u.user_id} className="rounded-2xl border border-urbans-stone/50 bg-white p-4 shadow-soft">
            <p className="font-semibold text-urbans-noir">{u.prenom} {u.nom}</p>
            <p className="text-sm text-urbans-warm/80 mt-0.5">{u.email}</p>
            {u.telephone && <p className="text-xs text-urbans-warm/70 mt-1">{u.telephone}</p>}
            <p className="text-xs text-urbans-warm/60 mt-2">
              Inscrit le {u.date_creation ? new Date(u.date_creation).toLocaleDateString('fr-FR') : '—'}
            </p>
            <Link href={`/admin/discussions?user=${u.user_id}`} className="mt-3 inline-block text-urbans-gold hover:text-urbans-noir text-sm font-medium">
              Ouvrir la discussion →
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-urbans-stone/50 bg-white shadow-soft">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-b border-urbans-stone/60 bg-urbans-sand/60">
            <tr>
              <th className="p-4 font-semibold text-urbans-noir">Nom</th>
              <th className="p-4 font-semibold text-urbans-noir">Email</th>
              <th className="p-4 font-semibold text-urbans-noir">Téléphone</th>
              <th className="p-4 font-semibold text-urbans-noir">Inscription</th>
              <th className="p-4 font-semibold text-urbans-noir">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b border-urbans-stone/40 last:border-0 hover:bg-urbans-cream/50">
                <td className="p-4 font-medium text-urbans-noir">{u.prenom} {u.nom}</td>
                <td className="p-4 text-urbans-warm/80">{u.email}</td>
                <td className="p-4 text-urbans-warm/80">{u.telephone || '—'}</td>
                <td className="p-4 text-urbans-warm/80">{u.date_creation ? new Date(u.date_creation).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="p-4">
                  <Link href={`/admin/discussions?user=${u.user_id}`} className="text-urbans-gold hover:text-urbans-noir font-medium">
                    Discussion
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
