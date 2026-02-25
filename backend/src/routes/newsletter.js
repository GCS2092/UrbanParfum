import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email valide requis' });
    }
    await query(
      `INSERT INTO newsletter (email, source) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET actif = true, source = COALESCE(EXCLUDED.source, newsletter.source)`,
      [email, source || 'site']
    );
    res.status(201).json({ message: 'Inscription enregistrée' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
