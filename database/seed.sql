-- ============================================
-- UrbanS - Données de test (exécuter APRÈS schema.sql)
-- ============================================

-- 1. Référentiels
INSERT INTO olfactive_families (nom_famille) VALUES
  ('Florale'), ('Boisée'), ('Orientale'), ('Fraîche'), ('Gourmande'), ('Hespéridée'), ('Aromatique')
ON CONFLICT (nom_famille) DO NOTHING;

INSERT INTO occasions (libelle) VALUES
  ('Quotidien'), ('Soirée'), ('Événement'), ('Cadeau'), ('Travail')
ON CONFLICT (libelle) DO NOTHING;

INSERT INTO emotional_universes (libelle) VALUES
  ('Élégant'), ('Audacieux'), ('Sensuel'), ('Frais'), ('Intemporel'), ('Lumineux')
ON CONFLICT (libelle) DO NOTHING;

INSERT INTO olfactive_notes (nom_note, type_note) VALUES
  ('Bergamote', 'tête'), ('Citron', 'tête'), ('Lavande', 'tête'), ('Poivre', 'tête'), ('Neroli', 'tête'),
  ('Jasmin', 'cœur'), ('Rose', 'cœur'), ('Iris', 'cœur'), ('Vétiver', 'cœur'), ('Fleur d''oranger', 'cœur'),
  ('Bois de cèdre', 'fond'), ('Musc', 'fond'), ('Ambre', 'fond'), ('Vanille', 'fond'), ('Patchouli', 'fond')
ON CONFLICT DO NOTHING;

-- 2. Utilisateurs de test
-- Mot de passe pour tous : "password" (hash bcrypt)
-- Admin : admin@urbans.fr / password
-- Client test : client@urbans.fr / password
INSERT INTO users (nom, prenom, email, mot_de_passe, telephone, role) VALUES
  ('Admin', 'UrbanS', 'admin@urbans.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'admin'),
  ('Dupont', 'Marie', 'client@urbans.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '06 12 34 56 78', 'client')
ON CONFLICT (email) DO NOTHING;

-- 3. Parfums avec images (prix en FCFA - Franc CFA)
INSERT INTO products (nom_parfum, description, prix, stock, intensite, type_parfum, volume_ml, saison, genre, image_principale, moment_utilisation) VALUES
  (
    'Signature Nocturne',
    'Une fragrance envoûtante où la fraîcheur des agrumes rencontre la profondeur du bois. Pour celles et ceux qui aiment affirmer leur personnalité avec élégance.',
    58380, 50, 'Intense', 'EDP', 80, 'Toutes', 'Unisexe',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', 'Soirée'
  ),
  (
    'Éclat de Jour',
    'Notes de tête lumineuses et cœur floral délicat. Idéal pour un quotidien raffiné.',
    42637, 80, 'Légère', 'EDT', 100, 'Printemps, Été', 'Femme',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', 'Quotidien'
  ),
  (
    'Bois d''Éternité',
    'Composition boisée et ambrée, signature masculine intemporelle.',
    51821, 45, 'Modérée', 'EDP', 100, 'Automne, Hiver', 'Homme',
    'https://images.unsplash.com/photo-1619994121345-629e586c2c0e?w=600&q=80', 'Événement'
  ),
  (
    'Nuit Sensuelle',
    'Musc et vanille enveloppants, pour une présence olfactive memorable. Parfait pour les soirées.',
    62215, 30, 'Intense', 'Extrait', 50, 'Automne, Hiver', 'Unisexe',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80', 'Soirée'
  ),
  (
    'Jardin Secret',
    'Bouquet floral frais : jasmin, rose et iris. Une signature féminine et lumineuse.',
    47229, 60, 'Légère', 'EDT', 100, 'Printemps, Été', 'Femme',
    'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=600&q=80', 'Quotidien'
  ),
  (
    'Vétiver Signature',
    'Vétiver et épices pour une fraîcheur aromatique masculine. Polyvalent jour et soir.',
    45261, 55, 'Modérée', 'EDT', 100, 'Toutes', 'Homme',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80', 'Quotidien'
  ),
  (
    'Ambre Précieux',
    'Ambre, vanille et touches orientales. Une chaleur envoûtante et intemporelle.',
    53788, 40, 'Intense', 'EDP', 80, 'Automne, Hiver', 'Unisexe',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80', 'Soirée'
  ),
  (
    'Citrus Éclat',
    'Agrumes pétillants et notes vertes. Fraîcheur immédiate pour l''été.',
    38045, 70, 'Légère', 'EDT', 100, 'Été', 'Unisexe',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59bd2?w=600&q=80', 'Quotidien'
  );

-- 4. Liaisons parfums <-> familles (après insertion, ids 1..8 = products)
-- Familles: 1 Florale, 2 Boisée, 3 Orientale, 4 Fraîche, 5 Gourmande, 6 Hespéridée, 7 Aromatique
INSERT INTO product_families (product_id, family_id) VALUES
  (1, 2), (1, 3), (2, 1), (2, 4), (3, 2), (3, 7), (4, 3), (4, 5), (5, 1), (5, 4), (6, 7), (6, 2), (7, 3), (7, 5), (8, 6), (8, 4)
ON CONFLICT DO NOTHING;

-- 5. Liaisons parfums <-> univers émotionnels (1 Élégant, 2 Audacieux, 3 Sensuel, 4 Frais, 5 Intemporel, 6 Lumineux)
INSERT INTO product_emotional_universes (product_id, universe_id) VALUES
  (1, 2), (1, 3), (2, 1), (2, 6), (3, 5), (4, 3), (5, 1), (5, 6), (6, 4), (6, 5), (7, 3), (7, 5), (8, 4), (8, 6)
ON CONFLICT DO NOTHING;

-- 6. Liaisons parfums <-> occasions (1 Quotidien, 2 Soirée, 3 Événement, 4 Cadeau, 5 Travail)
INSERT INTO product_occasions (product_id, occasion_id) VALUES
  (1, 2), (1, 3), (2, 1), (2, 4), (3, 3), (3, 5), (4, 2), (5, 1), (5, 4), (6, 1), (6, 5), (7, 2), (7, 3), (8, 1), (8, 4)
ON CONFLICT DO NOTHING;

-- 7. Liaisons parfums <-> notes olfactives (notes 1..15)
INSERT INTO product_notes (product_id, note_id) VALUES
  (1, 1), (1, 4), (1, 6), (1, 11), (1, 13),
  (2, 1), (2, 6), (2, 7), (2, 14),
  (3, 3), (3, 9), (3, 11), (3, 13),
  (4, 14), (4, 12), (4, 13),
  (5, 6), (5, 7), (5, 8), (5, 14),
  (6, 3), (6, 9), (6, 11),
  (7, 13), (7, 12), (7, 15),
  (8, 1), (8, 2), (8, 5), (8, 4)
ON CONFLICT DO NOTHING;

-- 8. Code promo de test (10 % de réduction, valide 1 an)
INSERT INTO promotions (code, description, type, valeur, date_debut, date_fin, usage_max, actif) VALUES
  ('BIENVENUE10', 'Réduction de bienvenue 10 %', 'pourcentage', 10, NOW(), NOW() + INTERVAL '1 year', 100, true)
ON CONFLICT (code) DO NOTHING;

-- Fin du seed : 2 utilisateurs (admin + client), 8 parfums, référentiels, liaisons, 1 code promo.
