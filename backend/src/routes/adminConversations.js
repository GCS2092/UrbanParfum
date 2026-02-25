import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

// GET /admin/conversations -> liste des conversations (avec infos user + dernier message)
router.get('/', async (req, res) => {
  try {
    const r = await query(
      `SELECT c.conversation_id, c.user_id, c.created_at, c.updated_at,
              u.nom, u.prenom, u.email,
              (SELECT content FROM messages m WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1) as last_message,
              (SELECT from_admin FROM messages m WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1) as last_from_admin
       FROM conversations c
       JOIN users u ON u.user_id = c.user_id
       ORDER BY c.updated_at DESC NULLS LAST`
    );
    res.json(r.rows);
  } catch (e) {
    console.error('[API admin/conversations]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /admin/conversations -> créer une conversation avec un client (user_id)
router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });
    const existing = await query('SELECT conversation_id FROM conversations WHERE user_id = $1', [user_id]);
    if (existing.rows[0]) {
      return res.status(201).json(existing.rows[0]);
    }
    const r = await query(
      'INSERT INTO conversations (user_id) VALUES ($1) RETURNING conversation_id, user_id, created_at, updated_at',
      [user_id]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[API admin/conversations POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /admin/conversations/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const conv = await query(
      'SELECT c.conversation_id, c.user_id, u.nom, u.prenom, u.email FROM conversations c JOIN users u ON u.user_id = c.user_id WHERE c.conversation_id = $1',
      [id]
    );
    if (!conv.rows[0]) return res.status(404).json({ error: 'Conversation non trouvée' });
    const messages = await query(
      'SELECT message_id, conversation_id, from_admin, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json({ conversation: conv.rows[0], messages: messages.rows });
  } catch (e) {
    console.error('[API admin/conversations/:id/messages]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /admin/conversations/:id/messages
router.post('/:id/messages', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }
    const conv = await query('SELECT conversation_id FROM conversations WHERE conversation_id = $1', [id]);
    if (!conv.rows[0]) return res.status(404).json({ error: 'Conversation non trouvée' });
    const r = await query(
      'INSERT INTO messages (conversation_id, from_admin, content) VALUES ($1, true, $2) RETURNING message_id, conversation_id, from_admin, content, created_at',
      [id, content.trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[API admin/conversations/:id/messages POST]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
