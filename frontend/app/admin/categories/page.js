'use client';

import { useEffect, useState } from 'react';
import { admin } from '../../../lib/api';
import Alert from '../../../components/Alert';

function CategoryBlock({ title, labelKey, listKey, list, onCreate, onDelete, loading, error, placeholder }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v || submitting) return;
    setSubmitting(true);
    try {
      await onCreate(v);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (deletingId || !confirm('Supprimer cette catégorie ? Les associations avec les produits seront retirées.')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const nameKey = labelKey === 'nom_famille' ? 'nom_famille' : 'libelle';
  const idKey = listKey === 'families' ? 'family_id' : listKey === 'occasions' ? 'occasion_id' : 'universe_id';

  return (
    <div className="card p-5 sm:p-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-urbans-gold">{title}</span>
      {error && <Alert type="error" message={error} className="mt-3" />}
      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="input-field flex-1 min-w-[180px]"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !value.trim()} className="btn-primary shrink-0">
          {submitting ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>
      {loading ? (
        <p className="mt-4 text-sm text-urbans-warm/70">Chargement…</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.length === 0 && <p className="text-sm text-urbans-warm/60">Aucune entrée.</p>}
          {list.map((item) => (
            <li key={item[idKey]} className="flex items-center justify-between gap-3 rounded-lg border border-urbans-stone/40 bg-urbans-cream/30 px-3 py-2">
              <span className="text-urbans-noir">{item[nameKey]}</span>
              <button
                type="button"
                onClick={() => handleDelete(item[idKey])}
                disabled={deletingId === item[idKey]}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 shrink-0"
              >
                {deletingId === item[idKey] ? 'Suppression…' : 'Supprimer'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [families, setFamilies] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [emotionalUniverses, setEmotionalUniverses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorFamilies, setErrorFamilies] = useState('');
  const [errorOccasions, setErrorOccasions] = useState('');
  const [errorUniverses, setErrorUniverses] = useState('');

  const load = () => {
    setLoading(true);
    setErrorFamilies('');
    setErrorOccasions('');
    setErrorUniverses('');
    Promise.all([
      admin.categories.families.list().then(setFamilies).catch((e) => setErrorFamilies(e.message)),
      admin.categories.occasions.list().then(setOccasions).catch((e) => setErrorOccasions(e.message)),
      admin.categories.emotionalUniverses.list().then(setEmotionalUniverses).catch((e) => setErrorUniverses(e.message)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="page-title-sm mb-2">Catégories</h1>
      <p className="text-sm text-urbans-warm/70 mb-6">
        Gérez les familles olfactives, occasions et univers émotionnels utilisés pour les filtres et les produits. La suppression retire les associations avec les produits.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CategoryBlock
          title="Familles olfactives"
          labelKey="nom_famille"
          listKey="families"
          list={families}
          loading={loading}
          error={errorFamilies}
          placeholder="Ex. Oriental, Boisée"
          onCreate={async (v) => {
            const created = await admin.categories.families.create(v);
            setFamilies((prev) => [...prev, created].sort((a, b) => a.nom_famille.localeCompare(b.nom_famille)));
          }}
          onDelete={async (id) => {
            await admin.categories.families.delete(id);
            setFamilies((prev) => prev.filter((f) => f.family_id !== id));
          }}
        />
        <CategoryBlock
          title="Occasions"
          labelKey="libelle"
          listKey="occasions"
          list={occasions}
          loading={loading}
          error={errorOccasions}
          placeholder="Ex. Quotidien, Soirée"
          onCreate={async (v) => {
            const created = await admin.categories.occasions.create(v);
            setOccasions((prev) => [...prev, created].sort((a, b) => a.libelle.localeCompare(b.libelle)));
          }}
          onDelete={async (id) => {
            await admin.categories.occasions.delete(id);
            setOccasions((prev) => prev.filter((o) => o.occasion_id !== id));
          }}
        />
        <CategoryBlock
          title="Univers émotionnels"
          labelKey="libelle"
          listKey="emotionalUniverses"
          list={emotionalUniverses}
          loading={loading}
          error={errorUniverses}
          placeholder="Ex. Sensualité, Fraîcheur"
          onCreate={async (v) => {
            const created = await admin.categories.emotionalUniverses.create(v);
            setEmotionalUniverses((prev) => [...prev, created].sort((a, b) => a.libelle.localeCompare(b.libelle)));
          }}
          onDelete={async (id) => {
            await admin.categories.emotionalUniverses.delete(id);
            setEmotionalUniverses((prev) => prev.filter((u) => u.universe_id !== id));
          }}
        />
      </div>
    </div>
  );
}
