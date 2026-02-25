// URL de base de l'API. En navigateur et hors localhost (ex. téléphone en 192.168.x.x), on force /api
// pour que les requêtes aillent vers le même hôte (proxy Next), pas vers localhost du téléphone.
function getApiBase() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('urbans_token');
}

/** Messages d’erreur utilisateur selon le code HTTP ou le type d’erreur */
function getApiErrorMessage(res, data, err) {
  if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
    return 'Connexion impossible. Vérifiez votre réseau ou réessayez plus tard.';
  }
  if (!res) return err?.message || 'Une erreur est survenue.';
  const msg = data?.error || data?.message;
  if (msg && typeof msg === 'string') return msg;
  switch (res.status) {
    case 401: return 'Session expirée. Veuillez vous reconnecter.';
    case 403: return 'Accès refusé.';
    case 404: return 'Ressource introuvable.';
    case 422: return 'Données invalides. Vérifiez le formulaire.';
    case 500:
    case 502:
    case 503: return 'Erreur serveur. Réessayez dans quelques instants.';
    default: return res.statusText || 'Une erreur est survenue.';
  }
}

export async function api(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(getApiBase() + endpoint, { ...options, headers });
  } catch (err) {
    throw new Error(getApiErrorMessage(null, null, err));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getApiErrorMessage(res, data));
  return data;
}

export const products = {
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return api('/products' + (q ? '?' + q : ''));
  },
  get: (id) => api('/products/' + id),
};

export const filters = {
  families: () => api('/filters/families'),
  occasions: () => api('/filters/occasions'),
  emotionalUniverses: () => api('/filters/emotional-universes'),
};

export const auth = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => api('/auth/me'),
};

export const orders = {
  create: (body) => api('/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => api('/orders/my-orders'),
  get: (orderId, email) => api('/orders/' + orderId + (email ? '?email=' + encodeURIComponent(email) : '')),
  validatePromo: (code, subtotal) => api('/orders/validate-promo', { method: 'POST', body: JSON.stringify({ code: code || '', subtotal }) }),
};

export const payments = {
  createCheckoutSession: (order_id, success_url, cancel_url) =>
    api('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ order_id, success_url, cancel_url }),
    }),
};

export const reviews = {
  list: (productId) => api('/reviews/product/' + productId),
  create: (body) => api('/reviews', { method: 'POST', body: JSON.stringify(body) }),
};

export const newsletter = {
  subscribe: (email, source) => api('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) }),
};

// Admin (nécessite token + rôle admin)
export const admin = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiBase = getApiBase();
    const uploadUrl = apiBase.startsWith('/') ? apiBase + '/admin/upload-image' : apiBase.replace(/\/api\/?$/, '') + '/api/admin/upload-image';
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    let res;
    try {
      res = await fetch(uploadUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
    } catch (err) {
      throw new Error(getApiErrorMessage(null, null, err));
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiErrorMessage(res, data));
    return { url: data.url };
  },
  products: {
    list: () => api('/admin/products'),
    get: (id) => api('/admin/products/' + id),
    create: (data) => api('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => api('/admin/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => api('/admin/products/' + id, { method: 'DELETE' }),
  },
  orders: {
    list: () => api('/admin/orders'),
    get: (id) => api('/admin/orders/' + id),
    updateStatus: (id, statut) => api('/admin/orders/' + id, { method: 'PATCH', body: JSON.stringify({ statut }) }),
  },
  users: {
    list: () => api('/admin/users'),
  },
  conversations: {
    list: () => api('/admin/conversations'),
    create: (user_id) => api('/admin/conversations', { method: 'POST', body: JSON.stringify({ user_id }) }),
    getMessages: (id) => api('/admin/conversations/' + id + '/messages'),
    sendMessage: (id, content) => api('/admin/conversations/' + id + '/messages', { method: 'POST', body: JSON.stringify({ content }) }),
  },
  categories: {
    families: {
      list: () => api('/admin/categories/families'),
      create: (nom_famille) => api('/admin/categories/families', { method: 'POST', body: JSON.stringify({ nom_famille }) }),
      delete: (id) => api('/admin/categories/families/' + id, { method: 'DELETE' }),
    },
    occasions: {
      list: () => api('/admin/categories/occasions'),
      create: (libelle) => api('/admin/categories/occasions', { method: 'POST', body: JSON.stringify({ libelle }) }),
      delete: (id) => api('/admin/categories/occasions/' + id, { method: 'DELETE' }),
    },
    emotionalUniverses: {
      list: () => api('/admin/categories/emotional-universes'),
      create: (libelle) => api('/admin/categories/emotional-universes', { method: 'POST', body: JSON.stringify({ libelle }) }),
      delete: (id) => api('/admin/categories/emotional-universes/' + id, { method: 'DELETE' }),
    },
  },
};

// Conversations côté client (utilisateur connecté)
export const conversations = {
  getMine: () => api('/conversations'),
  createMine: () => api('/conversations', { method: 'POST' }),
  getMessages: (id) => api('/conversations/' + id + '/messages'),
  sendMessage: (id, content) => api('/conversations/' + id + '/messages', { method: 'POST', body: JSON.stringify({ content }) }),
};
