import { Router } from 'express';
import { query } from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Liste des avis d'un produit
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const r = await query(
      `SELECT r.review_id, r.note, r.commentaire, r.date_avis,
              u.prenom as author_name
       FROM reviews r
       LEFT JOIN users u ON u.user_id = r.user_id
       LEFT JOIN guests g ON g.guest_id = r.guest_id
       WHERE r.product_id = $1 AND r.modere = false
       ORDER BY r.date_avis DESC`,
      [productId]
    );
    const rows = r.rows.map((x) => ({
      ...x,
      author_name: x.author_name || 'Invité',
    }));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Poster un avis (connecté ou invité avec guest_id)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { product_id, note, commentaire, guest_id } = req.body;
    if (!product_id || !note || note < 1 || note > 5) {
      return res.status(400).json({ error: 'product_id et note (1-5) requis' });
    }
    let user_id = null;
    let gid = guest_id || null;
    if (req.user) user_id = req.user.userId;
    if (!user_id && !gid) return res.status(400).json({ error: 'Connectez-vous ou fournissez guest_id' });

    await query(
      'INSERT INTO reviews (product_id, user_id, guest_id, note, commentaire) VALUES ($1, $2, $3, $4, $5)',
      [product_id, user_id, gid, note, commentaire || null]
    );
    res.status(201).json({ message: 'Avis enregistré' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
