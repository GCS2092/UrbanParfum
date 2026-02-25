import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// ---------- Client: ma conversation et mes messages ----------
// GET /conversations -> ma conversation (ou null)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const r = await query(
      'SELECT conversation_id, user_id, created_at, updated_at FROM conversations WHERE user_id = $1',
      [userId]
    );
    if (!r.rows[0]) return res.json({ conversation: null });
    res.json({ conversation: r.rows[0] });
  } catch (e) {
    console.error('[API conversations GET]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /conversations -> créer ma conversation (si pas encore)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const existing = await query('SELECT conversation_id FROM conversations WHERE user_id = $1', [userId]);
    if (existing.rows[0]) {
      return res.status(201).json(existing.rows[0]);
    }
    const r = await query(
      'INSERT INTO conversations (user_id) VALUES ($1) RETURNING conversation_id, user_id, created_at, updated_at',
      [userId]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[API conversations POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /conversations/:id/messages (client: seulement si c'est ma conversation)
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const conv = await query('SELECT conversation_id, user_id FROM conversations WHERE conversation_id = $1', [id]);
    if (!conv.rows[0] || conv.rows[0].user_id !== userId) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    const r = await query(
      'SELECT message_id, conversation_id, from_admin, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(r.rows);
  } catch (e) {
    console.error('[API conversations/:id/messages GET]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /conversations/:id/messages (client: envoyer un message)
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }
    const conv = await query('SELECT conversation_id, user_id FROM conversations WHERE conversation_id = $1', [id]);
    if (!conv.rows[0] || conv.rows[0].user_id !== userId) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    const r = await query(
      'INSERT INTO messages (conversation_id, from_admin, content) VALUES ($1, false, $2) RETURNING message_id, conversation_id, from_admin, content, created_at',
      [id, content.trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[API conversations/:id/messages POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
