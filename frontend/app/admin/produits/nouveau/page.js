'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, filters as filtersApi } from '../../../../lib/api';
import Alert from '../../../../components/Alert';
import { getImageUrl } from '../../../../lib/image';

const GENRES = ['Homme', 'Femme', 'Unisexe'];
const TYPES = ['EDT', 'EDP', 'Extrait'];
const INTENSITES = ['Légère', 'Modérée', 'Intense'];
const STOCK_MIN_ALERT = 5;

export default function AdminProduitNouveauPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [form, setForm] = useState({
    nom_parfum: '', description: '', prix: '', stock: 0, genre: 'Unisexe', type_parfum: 'EDP',
    volume_ml: '', intensite: '', saison: '', moment_utilisation: '', image_principale: '', actif: true,
    family_ids: [], occasion_ids: [], universe_ids: [],
  });

  useEffect(() => {
    Promise.all([
      filtersApi.families().then(setFamilies).catch(() => setFamilies([])),
      filtersApi.occasions().then(setOccasions).catch(() => setOccasions([])),
      filtersApi.emotionalUniverses().then(setUniverses).catch(() => setUniverses([])),
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await admin.products.create({
        ...form,
        prix: parseFloat(form.prix) || 0,
        stock: parseInt(form.stock, 10) || 0,
        volume_ml: form.volume_ml ? parseInt(form.volume_ml, 10) : null,
        family_ids: form.family_ids || [],
        occasion_ids: form.occasion_ids || [],
        universe_ids: form.universe_ids || [],
      });
      router.push('/admin/produits');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/produits" className="text-urbans-warm/80 hover:text-urbans-noir transition-colors">← Produits</Link>
        <h1 className="page-title-sm">Nouveau parfum</h1>
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-900">Nom *</label>
          <input className="input-field mt-1" value={form.nom_parfum} onChange={(e) => setForm({ ...form, nom_parfum: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900">Description</label>
          <textarea className="input-field mt-1 min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900">Prix (FCFA) *</label>
            <input type="number" min="0" step="1" className="input-field mt-1" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} placeholder="Ex. 50000" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Stock</label>
            <input type="number" min="0" className="input-field mt-1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0 = pas de limite" />
            <p className="text-xs text-urbans-warm/60 mt-1">Gestion du stock : si stock insuffisant, la commande est refusée.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Familles olfactives</label>
            <select multiple className="input-field mt-1 h-24" value={form.family_ids || []} onChange={(e) => setForm({ ...form, family_ids: Array.from(e.target.selectedOptions, (o) => parseInt(o.value, 10)) })}>
              {families.map((f) => <option key={f.family_id} value={f.family_id}>{f.nom_famille}</option>)}
            </select>
            <p className="text-xs text-urbans-warm/60 mt-1">Ctrl+clic pour plusieurs</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Occasions</label>
            <select multiple className="input-field mt-1 h-24" value={form.occasion_ids || []} onChange={(e) => setForm({ ...form, occasion_ids: Array.from(e.target.selectedOptions, (o) => parseInt(o.value, 10)) })}>
              {occasions.map((o) => <option key={o.occasion_id} value={o.occasion_id}>{o.libelle}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Univers émotionnels</label>
            <select multiple className="input-field mt-1 h-24" value={form.universe_ids || []} onChange={(e) => setForm({ ...form, universe_ids: Array.from(e.target.selectedOptions, (o) => parseInt(o.value, 10)) })}>
              {universes.map((u) => <option key={u.universe_id} value={u.universe_id}>{u.libelle}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Genre</label>
            <select className="input-field mt-1" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-900">Type</label>
            <select className="input-field mt-1" value={form.type_parfum} onChange={(e) => setForm({ ...form, type_parfum: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900">Volume (ml)</label>
            <input type="number" className="input-field mt-1" value={form.volume_ml} onChange={(e) => setForm({ ...form, volume_ml: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-900">Intensité</label>
            <select className="input-field mt-1" value={form.intensite} onChange={(e) => setForm({ ...form, intensite: e.target.value })}>
              <option value="">—</option>
              {INTENSITES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900">Saison</label>
          <input className="input-field mt-1" value={form.saison} onChange={(e) => setForm({ ...form, saison: e.target.value })} placeholder="ex. Printemps, Été" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900">Moment d&apos;utilisation</label>
          <input className="input-field mt-1" value={form.moment_utilisation} onChange={(e) => setForm({ ...form, moment_utilisation: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900">Image du produit</label>
          <div className="mt-1 flex flex-wrap items-start gap-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="input-field w-full min-w-[280px]"
                value={form.image_principale}
                onChange={(e) => setForm({ ...form, image_principale: e.target.value })}
                placeholder="URL de l'image (https://...)"
              />
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError('');
                    try {
                      const { url } = await admin.uploadImage(file);
                      setForm((f) => ({ ...f, image_principale: url }));
                    } catch (err) {
                      setError(err.message || 'Échec de l\'upload');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-sm"
                >
                  {uploading ? 'Envoi…' : 'Ou envoyer un fichier'}
                </button>
              </div>
            </div>
            {form.image_principale && (
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-urbans-stone bg-urbans-sand/50">
                <img src={getImageUrl(form.image_principale)} alt="Aperçu" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="actif" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
          <label htmlFor="actif" className="text-urbans-warm/90">Actif (visible au catalogue)</label>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary">Enregistrer</button>
          <Link href="/admin/produits" className="btn-secondary">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
