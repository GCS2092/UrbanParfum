'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { admin } from '../../../lib/api';
import Alert from '../../../components/Alert';

function AdminDiscussionsContent() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get('user');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.conversations.list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Si ?user=X, créer ou ouvrir la conversation avec ce user et rediriger vers la page de chat
  useEffect(() => {
    if (!userParam || loading || error) return;
    const userId = parseInt(userParam, 10);
    if (isNaN(userId)) return;
    admin.conversations.create(userId)
      .then((conv) => { window.location.href = '/admin/discussions/' + conv.conversation_id; })
      .catch(() => {});
  }, [userParam, loading, error]);

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.conversations.list().then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">Réessayer</button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title-sm mb-6">Discussion avec les clients</h1>
      <p className="text-sm text-urbans-warm/70 mb-6">Cliquez sur une conversation pour échanger avec un client.</p>

      {/* Démarrer une conversation avec un utilisateur existant */}
      <div className="card p-5 mb-6 border-urbans-gold/30 bg-urbans-cream/50">
        <p className="text-sm font-medium text-urbans-noir">Démarrer une conversation</p>
        <p className="text-sm text-urbans-warm/70 mt-1">
          {list.length === 0
            ? "Aucune conversation pour l'instant. Choisissez un utilisateur inscrit pour en démarrer une."
            : "Vous pouvez aussi ouvrir une nouvelle discussion avec un utilisateur inscrit."}
        </p>
        <Link
          href="/admin/utilisateurs"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-urbans-gold px-4 py-2.5 text-sm font-medium text-white hover:bg-urbans-gold/90 transition-colors"
        >
          Choisir un utilisateur
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-urbans-noir mb-3">Conversations en cours</h2>
      <div className="space-y-3 sm:hidden">
        {list.length === 0 && <p className="text-urbans-warm/70">Aucune conversation en cours.</p>}
        {list.map((c) => (
          <Link key={c.conversation_id} href={'/admin/discussions/' + c.conversation_id} className="block rounded-2xl border border-urbans-stone/50 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg">
            <p className="font-semibold text-urbans-noir">{c.prenom} {c.nom}</p>
            <p className="text-sm text-urbans-warm/80 mt-0.5">{c.email}</p>
            {c.last_message && (
              <p className="text-xs text-urbans-warm/70 mt-2 truncate">{c.last_from_admin ? 'Vous: ' : ''}{c.last_message}</p>
            )}
            <p className="text-xs text-urbans-warm/60 mt-2">{c.updated_at ? new Date(c.updated_at).toLocaleString('fr-FR') : ''}</p>
          </Link>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-urbans-stone/50 bg-white shadow-soft">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-b border-urbans-stone/60 bg-urbans-sand/60">
            <tr>
              <th className="p-4 font-semibold text-urbans-noir">Client</th>
              <th className="p-4 font-semibold text-urbans-noir">Dernier message</th>
              <th className="p-4 font-semibold text-urbans-noir">Date</th>
              <th className="p-4 font-semibold text-urbans-noir">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.conversation_id} className="border-b border-urbans-stone/40 last:border-0 hover:bg-urbans-cream/50">
                <td className="p-4">
                  <p className="font-medium text-urbans-noir">{c.prenom} {c.nom}</p>
                  <p className="text-urbans-warm/80 text-xs">{c.email}</p>
                </td>
                <td className="p-4 text-urbans-warm/80 max-w-[200px] truncate">{c.last_message || '—'}</td>
                <td className="p-4 text-urbans-warm/80">{c.updated_at ? new Date(c.updated_at).toLocaleString('fr-FR') : '—'}</td>
                <td className="p-4">
                  <Link href={'/admin/discussions/' + c.conversation_id} className="text-urbans-gold hover:text-urbans-noir font-medium">Ouvrir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDiscussionsPage() {
  return (
    <Suspense fallback={<p className="text-urbans-warm/70 py-6">Chargement…</p>}>
      <AdminDiscussionsContent />
    </Suspense>
  );
}
