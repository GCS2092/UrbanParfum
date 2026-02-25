import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = (file.originalname && path.extname(file.originalname)) || '.jpg';
    cb(null, `img-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);
router.use(requireAdmin);

// ---- Utilisateurs inscrits (liste) ----
router.get('/users', async (req, res) => {
  try {
    const r = await query(
      `SELECT user_id, nom, prenom, email, telephone, date_creation
       FROM users WHERE role = 'client' ORDER BY date_creation DESC`
    );
    res.json(r.rows);
  } catch (e) {
    console.error('[API admin/users]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- Upload image (admin) ----
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fichier image requis' });
    const relativePath = `/uploads/${req.file.filename}`;
    res.json({ url: relativePath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Produits (CRUD) ----
router.get('/products', async (req, res) => {
  try {
    const r = await query(
      'SELECT product_id, nom_parfum, prix, stock, genre, type_parfum, actif, date_ajout FROM products ORDER BY date_ajout DESC'
    );
    res.json(r.rows);
  } catch (e) {
    console.error('[API admin/products]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    const p = await query('SELECT * FROM products WHERE product_id = $1', [id]);
    if (!p.rows[0]) return res.status(404).json({ error: 'Produit non trouvé' });
    const [families, occasions, universes] = await Promise.all([
      query('SELECT family_id FROM product_families WHERE product_id = $1', [id]),
      query('SELECT occasion_id FROM product_occasions WHERE product_id = $1', [id]),
      query('SELECT universe_id FROM product_emotional_universes WHERE product_id = $1', [id]),
    ]);
    res.json({
      ...p.rows[0],
      family_ids: families.rows.map((r) => r.family_id),
      occasion_ids: occasions.rows.map((r) => r.occasion_id),
      universe_ids: universes.rows.map((r) => r.universe_id),
    });
  } catch (e) {
    console.error('[API admin/products/:id]', e.message);
    res.status(500).json({ error: e.message });
  }
});

function syncProductCategories(productId, familyIds, occasionIds, universeIds) {
  const tasks = [];
  tasks.push(query('DELETE FROM product_families WHERE product_id = $1', [productId]));
  tasks.push(query('DELETE FROM product_occasions WHERE product_id = $1', [productId]));
  tasks.push(query('DELETE FROM product_emotional_universes WHERE product_id = $1', [productId]));
  const fa = Array.isArray(familyIds) ? familyIds.filter((x) => x != null && x !== '') : [];
  const oc = Array.isArray(occasionIds) ? occasionIds.filter((x) => x != null && x !== '') : [];
  const un = Array.isArray(universeIds) ? universeIds.filter((x) => x != null && x !== '') : [];
  fa.forEach((fid) => tasks.push(query('INSERT INTO product_families (product_id, family_id) VALUES ($1, $2)', [productId, fid])));
  oc.forEach((oid) => tasks.push(query('INSERT INTO product_occasions (product_id, occasion_id) VALUES ($1, $2)', [productId, oid])));
  un.forEach((uid) => tasks.push(query('INSERT INTO product_emotional_universes (product_id, universe_id) VALUES ($1, $2)', [productId, uid])));
  return Promise.all(tasks);
}

router.post('/products', async (req, res) => {
  try {
    const {
      nom_parfum, description, prix, stock, intensite, type_parfum, volume_ml, saison, genre,
      image_principale, moment_utilisation, actif, family_ids, occasion_ids, universe_ids
    } = req.body;
    if (!nom_parfum || prix == null) {
      return res.status(400).json({ error: 'nom_parfum et prix requis' });
    }
    const r = await query(
      `INSERT INTO products (nom_parfum, description, prix, stock, intensite, type_parfum, volume_ml, saison, genre, image_principale, moment_utilisation, actif)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING product_id, nom_parfum, prix, stock, actif`,
      [
        nom_parfum, description || null, parseFloat(prix), parseInt(stock, 10) || 0,
        intensite || null, type_parfum || null, volume_ml || null, saison || null, genre || null,
        image_principale || null, moment_utilisation || null, actif !== false
      ]
    );
    const productId = r.rows[0].product_id;
    await syncProductCategories(productId, family_ids, occasion_ids, universe_ids);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[API admin/products POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    const {
      nom_parfum, description, prix, stock, intensite, type_parfum, volume_ml, saison, genre,
      image_principale, moment_utilisation, actif, family_ids, occasion_ids, universe_ids
    } = req.body;
    await query(
      `UPDATE products SET
        nom_parfum = COALESCE($2, nom_parfum), description = COALESCE($3, description), prix = COALESCE($4, prix),
        stock = COALESCE($5, stock), intensite = $6, type_parfum = $7, volume_ml = $8, saison = $9, genre = $10,
        image_principale = $11, moment_utilisation = $12, actif = COALESCE($13, actif)
       WHERE product_id = $1`,
      [
        id, nom_parfum, description, prix != null ? parseFloat(prix) : null, stock != null ? parseInt(stock, 10) : null,
        intensite || null, type_parfum || null, volume_ml || null, saison || null, genre || null,
        image_principale || null, moment_utilisation || null, actif
      ]
    );
    await syncProductCategories(id, family_ids, occasion_ids, universe_ids);
    const r = await query('SELECT product_id, nom_parfum, prix, stock, actif FROM products WHERE product_id = $1', [id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('[API admin/products PUT]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    const r = await query('DELETE FROM products WHERE product_id = $1 RETURNING product_id', [id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ deleted: id });
  } catch (e) {
    console.error('[API admin/products DELETE]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- Commandes ----
router.get('/orders', async (req, res) => {
  try {
    const r = await query(
      `SELECT o.order_id, o.date_commande, o.total, o.statut, o.ville, o.pays,
              u.email as user_email, g.email as guest_email
       FROM orders o
       LEFT JOIN users u ON u.user_id = o.user_id
       LEFT JOIN guests g ON g.guest_id = o.guest_id
       ORDER BY o.date_commande DESC`
    );
    res.json(r.rows);
  } catch (e) {
    console.error('[API admin/orders]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = await query(
      `SELECT o.*, u.email as user_email, u.nom as user_nom, u.prenom as user_prenom,
              g.email as guest_email, g.nom as guest_nom, g.prenom as guest_prenom
       FROM orders o
       LEFT JOIN users u ON u.user_id = o.user_id
       LEFT JOIN guests g ON g.guest_id = o.guest_id
       WHERE o.order_id = $1`,
      [id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Commande non trouvée' });
    const items = await query(
      'SELECT oi.*, p.nom_parfum FROM order_items oi JOIN products p ON p.product_id = oi.product_id WHERE oi.order_id = $1',
      [id]
    );
    res.json({ ...r.rows[0], items: items.rows });
  } catch (e) {
    console.error('[API admin/orders/:id]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { statut } = req.body;
    const allowed = ['en_cours', 'payee', 'expediee', 'livree', 'annulee'];
    if (!statut || !allowed.includes(statut)) {
      return res.status(400).json({ error: 'statut invalide (en_cours, payee, expediee, livree, annulee)' });
    }
    const r = await query('UPDATE orders SET statut = $2 WHERE order_id = $1 RETURNING order_id, statut', [id, statut]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('[API admin/orders PATCH]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
