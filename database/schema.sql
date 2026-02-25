-- ============================================
-- UrbanS - Schéma PostgreSQL (base UrbanS)
-- Site e-commerce parfums
-- ============================================
-- Exécuter dans la base UrbanS (déjà créée)
-- ============================================

-- Extensions utiles (optionnel)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (clients avec compte)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(30),
  date_creation TIMESTAMP DEFAULT NOW(),
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  consentement_newsletter BOOLEAN DEFAULT false,
  consentement_cookies BOOLEAN DEFAULT false,
  date_consentement TIMESTAMP
);

-- 2. Guests (commandes sans compte)
CREATE TABLE IF NOT EXISTS guests (
  guest_id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(30),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- 3. Olfactive families (référentiel)
CREATE TABLE IF NOT EXISTS olfactive_families (
  family_id SERIAL PRIMARY KEY,
  nom_famille VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Occasions (référentiel)
CREATE TABLE IF NOT EXISTS occasions (
  occasion_id SERIAL PRIMARY KEY,
  libelle VARCHAR(100) UNIQUE NOT NULL
);

-- 5. Emotional universes (référentiel)
CREATE TABLE IF NOT EXISTS emotional_universes (
  universe_id SERIAL PRIMARY KEY,
  libelle VARCHAR(100) UNIQUE NOT NULL
);

-- 6. Olfactive notes (référentiel)
CREATE TABLE IF NOT EXISTS olfactive_notes (
  note_id SERIAL PRIMARY KEY,
  nom_note VARCHAR(100) NOT NULL,
  type_note VARCHAR(20) CHECK (type_note IN ('tête', 'cœur', 'fond'))
);

-- 7. Products (parfums)
CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  nom_parfum VARCHAR(200) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  intensite VARCHAR(30),
  type_parfum VARCHAR(30),
  volume_ml INTEGER,
  saison VARCHAR(50),
  genre VARCHAR(20) CHECK (genre IN ('Homme', 'Femme', 'Unisexe')),
  image_principale VARCHAR(500),
  moment_utilisation VARCHAR(100),
  date_ajout TIMESTAMP DEFAULT NOW(),
  actif BOOLEAN DEFAULT true
);

-- 8. Product images
CREATE TABLE IF NOT EXISTS product_images (
  image_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  ordre INTEGER DEFAULT 0,
  legende VARCHAR(255)
);

-- 9. Product families (N-N)
CREATE TABLE IF NOT EXISTS product_families (
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  family_id INTEGER NOT NULL REFERENCES olfactive_families(family_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, family_id)
);

-- 10. Product occasions (N-N)
CREATE TABLE IF NOT EXISTS product_occasions (
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  occasion_id INTEGER NOT NULL REFERENCES occasions(occasion_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, occasion_id)
);

-- 11. Product emotional universes (N-N)
CREATE TABLE IF NOT EXISTS product_emotional_universes (
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  universe_id INTEGER NOT NULL REFERENCES emotional_universes(universe_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, universe_id)
);

-- 12. Product notes (N-N)
CREATE TABLE IF NOT EXISTS product_notes (
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  note_id INTEGER NOT NULL REFERENCES olfactive_notes(note_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, note_id)
);

-- 13. Orders
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  guest_id INTEGER REFERENCES guests(guest_id) ON DELETE SET NULL,
  date_commande TIMESTAMP DEFAULT NOW(),
  statut VARCHAR(30) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'payee', 'expediee', 'livree', 'annulee')),
  total DECIMAL(10,2) NOT NULL,
  adresse_ligne1 VARCHAR(255) NOT NULL,
  adresse_ligne2 VARCHAR(255),
  code_postal VARCHAR(20),
  ville VARCHAR(100) NOT NULL,
  pays VARCHAR(100) NOT NULL,
  mode_paiement VARCHAR(50),
  code_promo VARCHAR(50),
  CONSTRAINT orders_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

-- 14. Order items
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  prix_unitaire DECIMAL(10,2) NOT NULL
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  order_id INTEGER UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  montant DECIMAL(10,2) NOT NULL,
  moyen_paiement VARCHAR(50),
  statut_paiement VARCHAR(30) DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente', 'accepte', 'refuse', 'rembourse')),
  date_paiement TIMESTAMP,
  reference_externe VARCHAR(255)
);

-- 16. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  guest_id INTEGER REFERENCES guests(guest_id) ON DELETE SET NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  date_avis TIMESTAMP DEFAULT NOW(),
  modere BOOLEAN DEFAULT false,
  CONSTRAINT reviews_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

-- 17. Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  delivery_id SERIAL PRIMARY KEY,
  order_id INTEGER UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  transporteur VARCHAR(100),
  numero_suivi VARCHAR(100),
  statut_livraison VARCHAR(30) DEFAULT 'en_preparation',
  date_expedition TIMESTAMP,
  date_livraison_estimee DATE
);

-- 18. Loyalty points
CREATE TABLE IF NOT EXISTS loyalty_points (
  loyalty_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  date_mise_a_jour TIMESTAMP DEFAULT NOW()
);

-- 19. Newsletter
CREATE TABLE IF NOT EXISTS newsletter (
  newsletter_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  date_inscription TIMESTAMP DEFAULT NOW(),
  actif BOOLEAN DEFAULT true,
  source VARCHAR(50),
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

-- 20. Promotions
CREATE TABLE IF NOT EXISTS promotions (
  promotion_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('pourcentage', 'montant_fixe')),
  valeur DECIMAL(10,2) NOT NULL,
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  usage_max INTEGER,
  actif BOOLEAN DEFAULT true
);

-- 21. Gift boxes
CREATE TABLE IF NOT EXISTS gift_boxes (
  gift_box_id SERIAL PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  image_principale VARCHAR(500),
  actif BOOLEAN DEFAULT true,
  date_ajout TIMESTAMP DEFAULT NOW()
);

-- 22. Gift box products (N-N)
CREATE TABLE IF NOT EXISTS gift_box_products (
  gift_box_id INTEGER NOT NULL REFERENCES gift_boxes(gift_box_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantite INTEGER DEFAULT 1,
  PRIMARY KEY (gift_box_id, product_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_products_actif ON products(actif);
CREATE INDEX IF NOT EXISTS idx_products_genre ON products(genre);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
