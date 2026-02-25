import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/families', async (_, res) => {
  try {
    const r = await query('SELECT family_id, nom_famille FROM olfactive_families ORDER BY nom_famille');
    res.json(r.rows);
  } catch (e) {
    console.error('[API /filters/families]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/occasions', async (_, res) => {
  try {
    const r = await query('SELECT occasion_id, libelle FROM occasions ORDER BY libelle');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/emotional-universes', async (_, res) => {
  try {
    const r = await query('SELECT universe_id, libelle FROM emotional_universes ORDER BY libelle');
    res.json(r.rows);
  } catch (e) {
    console.error('[API /filters/emotional-universes]', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/notes', async (_, res) => {
  try {
    const r = await query('SELECT note_id, nom_note, type_note FROM olfactive_notes ORDER BY type_note, nom_note');
    res.json(r.rows);
  } catch (e) {
    console.error('[API /filters/notes]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
