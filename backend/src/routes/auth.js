import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, consentement_newsletter } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, mot_de_passe, nom, prenom, telephone, consentement_newsletter, date_consentement)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING user_id, email, nom, prenom, role, date_creation`,
      [email, hash, nom || null, prenom || null, telephone || null, !!consentement_newsletter]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.user_id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ user: { ...user, mot_de_passe: undefined }, token });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    res.status(500).json({ error: e.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const result = await query(
      'SELECT user_id, email, nom, prenom, mot_de_passe, role, date_creation FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.mot_de_passe))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    delete user.mot_de_passe;
    const token = jwt.sign({ userId: user.user_id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Profil (utilisateur connecté)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const r = await query(
      'SELECT user_id, email, nom, prenom, telephone, role, date_creation, consentement_newsletter FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
