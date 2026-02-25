'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { admin } from '../../../../lib/api';
import Alert from '../../../../components/Alert';
import { getImageUrl } from '../../../../lib/image';

const GENRES = ['Homme', 'Femme', 'Unisexe'];
const TYPES = ['EDT', 'EDP', 'Extrait'];
const INTENSITES = ['Légère', 'Modérée', 'Intense'];

export default function AdminProduitEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const fileInputRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [families, setFamilies] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [universes, setUniverses] = useState([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      admin.products.get(id),
      import('../../../../lib/api').then((m) => m.filters.families()),
      import('../../../../lib/api').then((m) => m.filters.occasions()),
      import('../../../../lib/api').then((m) => m.filters.emotionalUniverses()),
    ])
      .then(([p, f, o, u]) => {
        setProduct(p);
        setFamilies(f || []);
        setOccasions(o || []);
        setUniverses(u || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await admin.products.update(id, {
        nom_parfum: product.nom_parfum,
        description: product.description,
        prix: product.prix != null && product.prix !== '' ? parseFloat(product.prix) : product.prix,
        stock: product.stock != null && product.stock !== '' ? parseInt(product.stock, 10) : product.stock,
        genre: product.genre,
        type_parfum: product.type_parfum,
        volume_ml: product.volume_ml != null && product.volume_ml !== '' ? parseInt(product.volume_ml, 10) : product.volume_ml,
        intensite: product.intensite,
        saison: product.saison,
        moment_utilisation: product.moment_utilisation,
        image_principale: product.image_principale || null,
        actif: product.actif,
        family_ids: product.family_ids || [],
        occasion_ids: product.occasion_ids || [],
        universe_ids: product.universe_ids || [],
      });
      router.push('/admin/produits');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error && !product) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); admin.products.get(id).then(setProduct).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline font-medium">Réessayer</button>
        </Alert>
      </div>
    );
  }
  if (!product) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/produits" className="text-urbans-warm/80 hover:text-urbans-noir transition-colors">← Produits</Link>
        <h1 className="page-title-sm">Modifier : {product.nom_parfum}</h1>
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-urbans-noir">Nom *</label>
          <input className="input-field mt-1" value={product.nom_parfum || ''} onChange={(e) => setProduct({ ...product, nom_parfum: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-urbans-noir">Description</label>
          <textarea className="input-field mt-1 min-h-[100px]" value={product.description || ''} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Prix (FCFA) *</label>
            <input type="number" min="0" step="1" className="input-field mt-1" value={product.prix ?? ''} onChange={(e) => setProduct({ ...product, prix: e.target.value })} placeholder="Ex. 50000" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Stock</label>
            <input type="number" min="0" className="input-field mt-1" value={product.stock ?? ''} onChange={(e) => setProduct({ ...product, stock: e.target.value })} placeholder="0 = pas de gestion" />
            <p className="text-xs text-urbans-warm/60 mt-0.5">Commande bloquée si stock insuffisant.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Familles olfactives</label>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-urbans-stone/60 bg-white p-2 space-y-1">
              {families.map((f) => (
                <label key={f.family_id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(product.family_ids || []).includes(f.family_id)} onChange={(e) => setProduct({ ...product, family_ids: e.target.checked ? [...(product.family_ids || []), f.family_id] : (product.family_ids || []).filter((id) => id !== f.family_id) })} />
                  <span className="text-sm">{f.nom_famille}</span>
                </label>
              ))}
              {families.length === 0 && <p className="text-xs text-urbans-warm/60">Créez-en dans Catégories.</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Occasions</label>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-urbans-stone/60 bg-white p-2 space-y-1">
              {occasions.map((o) => (
                <label key={o.occasion_id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(product.occasion_ids || []).includes(o.occasion_id)} onChange={(e) => setProduct({ ...product, occasion_ids: e.target.checked ? [...(product.occasion_ids || []), o.occasion_id] : (product.occasion_ids || []).filter((id) => id !== o.occasion_id) })} />
                  <span className="text-sm">{o.libelle}</span>
                </label>
              ))}
              {occasions.length === 0 && <p className="text-xs text-urbans-warm/60">Créez-en dans Catégories.</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Univers émotionnels</label>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-urbans-stone/60 bg-white p-2 space-y-1">
              {universes.map((u) => (
                <label key={u.universe_id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(product.universe_ids || []).includes(u.universe_id)} onChange={(e) => setProduct({ ...product, universe_ids: e.target.checked ? [...(product.universe_ids || []), u.universe_id] : (product.universe_ids || []).filter((id) => id !== u.universe_id) })} />
                  <span className="text-sm">{u.libelle}</span>
                </label>
              ))}
              {universes.length === 0 && <p className="text-xs text-urbans-warm/60">Créez-en dans Catégories.</p>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Genre</label>
            <select className="input-field mt-1" value={product.genre || ''} onChange={(e) => setProduct({ ...product, genre: e.target.value })}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Type</label>
            <select className="input-field mt-1" value={product.type_parfum || ''} onChange={(e) => setProduct({ ...product, type_parfum: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Volume (ml)</label>
            <input type="number" className="input-field mt-1" value={product.volume_ml ?? ''} onChange={(e) => setProduct({ ...product, volume_ml: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-urbans-noir">Intensité</label>
            <select className="input-field mt-1" value={product.intensite || ''} onChange={(e) => setProduct({ ...product, intensite: e.target.value })}>
              <option value="">—</option>
              {INTENSITES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-urbans-noir">Saison</label>
          <input className="input-field mt-1" value={product.saison || ''} onChange={(e) => setProduct({ ...product, saison: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-urbans-noir">Moment d&apos;utilisation</label>
          <input className="input-field mt-1" value={product.moment_utilisation || ''} onChange={(e) => setProduct({ ...product, moment_utilisation: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-urbans-noir">Image du produit</label>
          <div className="mt-1 flex flex-wrap items-start gap-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="input-field w-full min-w-[280px]"
                value={product.image_principale || ''}
                onChange={(e) => setProduct({ ...product, image_principale: e.target.value })}
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
                      setProduct((p) => ({ ...p, image_principale: url }));
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
            {product.image_principale && (
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-amber-900/20 bg-neutral-50">
                <img src={getImageUrl(product.image_principale)} alt="Aperçu" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="actif" checked={product.actif !== false} onChange={(e) => setProduct({ ...product, actif: e.target.checked })} />
          <label htmlFor="actif" className="text-urbans-warm/90">Actif (visible au catalogue)</label>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">Enregistrer</button>
          <Link href="/admin/produits" className="btn-secondary">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
