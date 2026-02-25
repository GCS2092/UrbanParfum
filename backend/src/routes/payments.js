import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../config/db.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Paiement non configuré (STRIPE_SECRET_KEY manquant)' });
  }
  try {
    const { order_id, success_url, cancel_url } = req.body;
    if (!order_id || !success_url || !cancel_url) {
      return res.status(400).json({ error: 'order_id, success_url et cancel_url requis' });
    }
    const order = await query(
      'SELECT order_id, total FROM orders WHERE order_id = $1 AND statut = $2',
      [order_id, 'en_cours']
    );
    if (!order.rows[0]) return res.status(404).json({ error: 'Commande non trouvée ou déjà payée' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Commande UrbanS #' + order_id, description: 'Parfums UrbanS' },
          unit_amount: Math.round(parseFloat(order.rows[0].total) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url + (success_url.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}&order_id=' + order_id,
      cancel_url: cancel_url,
      metadata: { order_id: String(order_id) },
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Webhook non configuré');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook Error: ' + err.message);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order_id = session.metadata?.order_id;
    if (order_id) {
      await query("UPDATE orders SET statut = 'payee', mode_paiement = 'stripe' WHERE order_id = $1", [order_id]);
      await query(
        "INSERT INTO payments (order_id, montant, moyen_paiement, statut_paiement, date_paiement, reference_externe) SELECT $1, total, 'stripe', 'accepte', NOW(), $2 FROM orders WHERE order_id = $1",
        [order_id, session.payment_intent || session.id]
      );
    }
  }
  res.json({ received: true });
});

export default router;
