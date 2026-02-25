import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

// ---- Familles olfactives ----
router.get('/families', async (_, res) => {
  try {
    const r = await query('SELECT family_id, nom_famille FROM olfactive_families ORDER BY nom_famille');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/families', async (req, res) => {
  try {
    const { nom_famille } = req.body;
    if (!nom_famille || !String(nom_famille).trim()) {
      return res.status(400).json({ error: 'Nom de la famille requis' });
    }
    const r = await query(
      'INSERT INTO olfactive_families (nom_famille) VALUES ($1) RETURNING family_id, nom_famille',
      [String(nom_famille).trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Cette famille existe déjà' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/families/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    await query('DELETE FROM olfactive_families WHERE family_id = $1', [id]);
    res.json({ deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Occasions ----
router.get('/occasions', async (_, res) => {
  try {
    const r = await query('SELECT occasion_id, libelle FROM occasions ORDER BY libelle');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/occasions', async (req, res) => {
  try {
    const { libelle } = req.body;
    if (!libelle || !String(libelle).trim()) {
      return res.status(400).json({ error: 'Libellé requis' });
    }
    const r = await query(
      'INSERT INTO occasions (libelle) VALUES ($1) RETURNING occasion_id, libelle',
      [String(libelle).trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Cette occasion existe déjà' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/occasions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    await query('DELETE FROM occasions WHERE occasion_id = $1', [id]);
    res.json({ deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Univers émotionnels ----
router.get('/emotional-universes', async (_, res) => {
  try {
    const r = await query('SELECT universe_id, libelle FROM emotional_universes ORDER BY libelle');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/emotional-universes', async (req, res) => {
  try {
    const { libelle } = req.body;
    if (!libelle || !String(libelle).trim()) {
      return res.status(400).json({ error: 'Libellé requis' });
    }
    const r = await query(
      'INSERT INTO emotional_universes (libelle) VALUES ($1) RETURNING universe_id, libelle',
      [String(libelle).trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Cet univers existe déjà' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/emotional-universes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    await query('DELETE FROM emotional_universes WHERE universe_id = $1', [id]);
    res.json({ deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
