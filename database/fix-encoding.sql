-- ============================================
-- UrbanS - Correction des accents (encodage UTF-8)
-- Exécuter si les noms s'affichent en Ã‰ au lieu de É, etc.
-- Depuis C:\UrbanS\database : psql -U postgres -d UrbanS -f fix-encoding.sql
-- ============================================

-- Corriger les noms des parfums (product_id 1 à 8 selon l'ordre du seed)
UPDATE products SET nom_parfum = 'Éclat de Jour' WHERE product_id = 2;
UPDATE products SET nom_parfum = 'Bois d''Éternité' WHERE product_id = 3;
UPDATE products SET nom_parfum = 'Vétiver Signature' WHERE product_id = 6;
UPDATE products SET nom_parfum = 'Ambre Précieux' WHERE product_id = 7;
UPDATE products SET nom_parfum = 'Citrus Éclat' WHERE product_id = 8;

-- Descriptions (optionnel, si elles sont aussi mal encodées)
UPDATE products SET description = 'Notes de tête lumineuses et cœur floral délicat. Idéal pour un quotidien raffiné.' WHERE product_id = 2;
UPDATE products SET description = 'Composition boisée et ambrée, signature masculine intemporelle.' WHERE product_id = 3;
UPDATE products SET description = 'Vétiver et épices pour une fraîcheur aromatique masculine. Polyvalent jour et soir.' WHERE product_id = 6;
UPDATE products SET description = 'Ambre, vanille et touches orientales. Une chaleur envoûtante et intemporelle.' WHERE product_id = 7;
UPDATE products SET description = 'Agrumes pétillants et notes vertes. Fraîcheur immédiate pour l''été.' WHERE product_id = 8;
