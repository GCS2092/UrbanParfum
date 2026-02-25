-- Mise à jour des prix existants : passer de EUR à FCFA (Franc CFA).
-- À exécuter si vous aviez déjà inséré les parfums avec des prix en euros.
-- Depuis C:\UrbanS\database : psql -U postgres -d UrbanS -f update-prix-fcfa.sql

UPDATE products SET prix = 58380 WHERE product_id = 1;
UPDATE products SET prix = 42637 WHERE product_id = 2;
UPDATE products SET prix = 51821 WHERE product_id = 3;
UPDATE products SET prix = 62215 WHERE product_id = 4;
UPDATE products SET prix = 47229 WHERE product_id = 5;
UPDATE products SET prix = 45261 WHERE product_id = 6;
UPDATE products SET prix = 53788 WHERE product_id = 7;
UPDATE products SET prix = 38045 WHERE product_id = 8;
