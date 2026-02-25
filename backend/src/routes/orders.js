import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Valider un code promo (sans créer de commande) : body { code, subtotal }
router.post('/validate-promo', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const sub = parseFloat(subtotal);
    if (sub == null || isNaN(sub) || sub < 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    const c = (code && String(code).trim()) ? String(code).trim().toUpperCase() : '';
    if (!c) {
      return res.json({ valid: false, discount: 0, total_after: sub });
    }
    const r = await query(
      `SELECT type, valeur, usage_max FROM promotions
       WHERE UPPER(code) = $1 AND actif = true AND date_debut <= NOW() AND date_fin >= NOW()`,
      [c]
    );
    const promo = r.rows[0];
    if (!promo) {
      return res.json({ valid: false, discount: 0, total_after: sub, error: 'Code invalide ou expiré' });
    }
    if (promo.usage_max != null) {
      const used = await query('SELECT COUNT(*) AS c FROM orders WHERE UPPER(code_promo) = $1', [c]);
      if (parseInt(used.rows[0].c, 10) >= promo.usage_max) {
        return res.json({ valid: false, discount: 0, total_after: sub, error: 'Code épuisé' });
      }
    }
    let discount = 0;
    if (promo.type === 'pourcentage') {
      discount = (sub * parseFloat(promo.valeur)) / 100;
    } else {
      discount = Math.min(parseFloat(promo.valeur), sub);
    }
    const totalAfter = Math.max(0, sub - discount);
    res.json({ valid: true, discount, total_after: totalAfter });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, address, guestInfo, code_promo } = req.body;
    if (!items?.length || !address?.adresse_ligne1 || !address?.ville || !address?.pays) {
      return res.status(400).json({ error: 'Items et adresse de livraison (adresse, ville, pays) requis' });
    }

    let user_id = null;
    let guest_id = null;

    if (req.user) {
      user_id = req.user.userId;
    } else {
      if (!guestInfo?.email || !guestInfo?.nom || !guestInfo?.prenom) {
        return res.status(400).json({ error: 'Pour une commande invité : nom, prénom et email requis' });
      }
      const guest = await query(
        'INSERT INTO guests (nom, prenom, email, telephone) VALUES ($1, $2, $3, $4) RETURNING guest_id',
        [guestInfo.nom, guestInfo.prenom, guestInfo.email, guestInfo.telephone || null]
      );
      guest_id = guest.rows[0].guest_id;
    }

    const productIds = items.map((i) => i.product_id);
    const products = await query(
      'SELECT product_id, prix, stock FROM products WHERE product_id = ANY($1::int[]) AND actif = true',
      [productIds]
    );
    const priceMap = Object.fromEntries(products.rows.map((r) => [r.product_id, parseFloat(r.prix)]));
    const stockMap = Object.fromEntries(products.rows.map((r) => [r.product_id, r.stock]));

    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const prix = priceMap[it.product_id];
      const stock = stockMap[it.product_id];
      if (prix == null || stock == null) {
        return res.status(400).json({ error: 'Produit introuvable ou inactif' });
      }
      if (stock < it.quantity) {
        return res.status(400).json({ error: 'Stock insuffisant pour « ' + it.product_id + ' »' });
      }
      const subtotal = prix * it.quantity;
      total += subtotal;
      orderItems.push({ product_id: it.product_id, quantite: it.quantity, prix_unitaire: prix });
    }

    let discount = 0;
    const codePromo = (code_promo && String(code_promo).trim()) ? String(code_promo).trim().toUpperCase() : null;
    if (codePromo) {
      const promos = await query(
        `SELECT promotion_id, type, valeur, usage_max FROM promotions
         WHERE UPPER(code) = $1 AND actif = true AND date_debut <= NOW() AND date_fin >= NOW()`,
        [codePromo]
      );
      const promo = promos.rows[0];
      if (promo) {
        if (promo.usage_max != null) {
          const used = await query('SELECT COUNT(*) AS c FROM orders WHERE UPPER(code_promo) = $1', [codePromo]);
          if (parseInt(used.rows[0].c, 10) >= promo.usage_max) {
            return res.status(400).json({ error: 'Code promo épuisé' });
          }
        }
        if (promo.type === 'pourcentage') {
          discount = (total * parseFloat(promo.valeur)) / 100;
        } else {
          discount = Math.min(parseFloat(promo.valeur), total);
        }
        total = Math.max(0, total - discount);
      } else {
        return res.status(400).json({ error: 'Code promo invalide ou expiré' });
      }
    }

    const order = await query(
      `INSERT INTO orders (user_id, guest_id, total, adresse_ligne1, adresse_ligne2, code_postal, ville, pays, mode_paiement, code_promo, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'carte', $9, 'en_cours')
       RETURNING order_id, date_commande, total, statut`,
      [
        user_id,
        guest_id,
        total,
        address.adresse_ligne1,
        address.adresse_ligne2 || null,
        (address.code_postal && address.code_postal.trim()) ? address.code_postal.trim() : null,
        address.ville,
        address.pays,
        codePromo || null,
      ]
    );
    const order_id = order.rows[0].order_id;

    for (const it of orderItems) {
      await query(
        'INSERT INTO order_items (order_id, product_id, quantite, prix_unitaire) VALUES ($1, $2, $3, $4)',
        [order_id, it.product_id, it.quantite, it.prix_unitaire]
      );
      await query('UPDATE products SET stock = stock - $1 WHERE product_id = $2', [it.quantite, it.product_id]);
    }

    res.status(201).json({
      order_id,
      total: order.rows[0].total,
      statut: order.rows[0].statut,
      date_commande: order.rows[0].date_commande,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const r = await query(
      'SELECT order_id, date_commande, total, statut, ville, pays FROM orders WHERE user_id = $1 ORDER BY date_commande DESC',
      [req.user.userId]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:orderId', optionalAuth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const { email } = req.query;
    let order;
    if (req.user) {
      const r = await query('SELECT * FROM orders WHERE order_id = $1 AND user_id = $2', [orderId, req.user.userId]);
      order = r.rows[0];
    } else if (email) {
      const r = await query(
        'SELECT o.* FROM orders o JOIN guests g ON g.guest_id = o.guest_id WHERE o.order_id = $1 AND g.email = $2',
        [orderId, email]
      );
      order = r.rows[0];
    } else {
      return res.status(400).json({ error: 'Connectez-vous ou fournissez l\'email de la commande' });
    }
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    const items = await query(
      'SELECT oi.quantite, oi.prix_unitaire, p.nom_parfum, p.image_principale, p.product_id FROM order_items oi JOIN products p ON p.product_id = oi.product_id WHERE oi.order_id = $1',
      [orderId]
    );
    res.json({ ...order, items: items.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
