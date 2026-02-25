-- Mise à jour des images des parfums (liens Unsplash)
-- Exécuter sur la base UrbanS si les produits existent déjà sans images.
-- Les product_id 1 à 8 correspondent à l'ordre d'insertion du seed.

UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' WHERE product_id = 1;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80' WHERE product_id = 2;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1619994121345-629e586c2c0e?w=600&q=80' WHERE product_id = 3;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80' WHERE product_id = 4;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=600&q=80' WHERE product_id = 5;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80' WHERE product_id = 6;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80' WHERE product_id = 7;
UPDATE products SET image_principale = 'https://images.unsplash.com/photo-1588405748880-12d1d2a59bd2?w=600&q=80' WHERE product_id = 8;
