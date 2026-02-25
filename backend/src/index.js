import 'dotenv/config';
import os from 'os';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

function getLocalNetworkIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';
import reviewsRoutes from './routes/reviews.js';
import newsletterRoutes from './routes/newsletter.js';
import filtersRoutes from './routes/filters.js';
import adminRoutes from './routes/admin.js';
import conversationsRoutes from './routes/conversations.js';
import adminConversationsRoutes from './routes/adminConversations.js';
import adminCategoriesRoutes from './routes/adminCategories.js';

const app = express();
const PORT = process.env.PORT || 4000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/health', async (_, res) => {
  try {
    const { query } = await import('./config/db.js');
    await query('SELECT 1');
    return res.json({ ok: true, message: 'UrbanS API', database: 'connected' });
  } catch (e) {
    console.error('[API health] Database:', e.message);
    return res.status(503).json({ ok: false, message: 'UrbanS API', database: 'error', error: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/admin/conversations', adminConversationsRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

const HOST = process.env.HOST || '0.0.0.0';
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
app.listen(PORT, HOST, () => {
  console.log(`UrbanS API écoute sur http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    const ip = getLocalNetworkIP();
    if (ip) {
      console.log(`  → Depuis les autres appareils (même Wi‑Fi) : ouvrez http://${ip}:${FRONTEND_PORT}`);
    }
  }
});
