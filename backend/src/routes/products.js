import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// Liste des produits avec filtres optionnels
router.get('/', async (req, res) => {
  try {
    const { genre, family_id, occasion_id, universe_id, intensite, minPrice, maxPrice, search } = req.query;
    let sql = `
      SELECT p.product_id, p.nom_parfum, p.description, p.prix, p.stock, p.intensite, p.type_parfum, p.volume_ml,
             p.saison, p.genre, p.image_principale, p.moment_utilisation, p.date_ajout
      FROM products p
      WHERE p.actif = true
    `;
    const params = [];
    let i = 1;

    if (genre) { params.push(genre); sql += ` AND p.genre = $${i++}`; }
    if (intensite) { params.push(intensite); sql += ` AND p.intensite = $${i++}`; }
    if (minPrice != null) { params.push(parseFloat(minPrice)); sql += ` AND p.prix >= $${i++}`; }
    if (maxPrice != null) { params.push(parseFloat(maxPrice)); sql += ` AND p.prix <= $${i++}`; }
    if (search) { params.push(`%${search}%`, `%${search}%`); sql += ` AND (p.nom_parfum ILIKE $${i++} OR p.description ILIKE $${i++})`; }
    if (family_id) {
      params.push(family_id);
      sql += ` AND EXISTS (SELECT 1 FROM product_families pf WHERE pf.product_id = p.product_id AND pf.family_id = $${i++})`;
    }
    if (occasion_id) {
      params.push(occasion_id);
      sql += ` AND EXISTS (SELECT 1 FROM product_occasions po WHERE po.product_id = p.product_id AND po.occasion_id = $${i++})`;
    }
    if (universe_id) {
      params.push(universe_id);
      sql += ` AND EXISTS (SELECT 1 FROM product_emotional_universes peu WHERE peu.product_id = p.product_id AND peu.universe_id = $${i++})`;
    }

    sql += ' ORDER BY p.date_ajout DESC';
    const r = await query(sql, params);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Détail d'un produit (avec familles, occasions, univers, notes, images)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const product = await query(
      'SELECT * FROM products WHERE product_id = $1 AND actif = true',
      [id]
    );
    if (!product.rows[0]) return res.status(404).json({ error: 'Produit non trouvé' });
    const p = product.rows[0];

    const [families, occasions, universes, notes, images] = await Promise.all([
      query(`SELECT f.family_id, f.nom_famille FROM product_families pf
             JOIN olfactive_families f ON f.family_id = pf.family_id WHERE pf.product_id = $1`, [id]),
      query(`SELECT o.occasion_id, o.libelle FROM product_occasions po
             JOIN occasions o ON o.occasion_id = po.occasion_id WHERE po.product_id = $1`, [id]),
      query(`SELECT u.universe_id, u.libelle FROM product_emotional_universes peu
             JOIN emotional_universes u ON u.universe_id = peu.universe_id WHERE peu.product_id = $1`, [id]),
      query(`SELECT n.note_id, n.nom_note, n.type_note FROM product_notes pn
             JOIN olfactive_notes n ON n.note_id = pn.note_id WHERE pn.product_id = $1 ORDER BY n.type_note`, [id]),
      query('SELECT image_id, url, ordre, legende FROM product_images WHERE product_id = $1 ORDER BY ordre', [id]),
    ]);

    res.json({
      ...p,
      families: families.rows,
      occasions: occasions.rows,
      emotional_universes: universes.rows,
      notes: notes.rows,
      images: images.rows,
    });
  } catch (e) {
    console.error('[API /products/:id]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
