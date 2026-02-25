-- Migration : code postal optionnel (adaptation Sénégal / Afrique)
-- À exécuter si la base a déjà été créée avec code_postal NOT NULL.
-- Les nouvelles installations utilisent déjà schema.sql avec code_postal nullable.
--
-- NE PAS COLLER DANS POWERSHELL. Exécuter avec psql depuis le dossier database :
--   psql -U postgres -d UrbanS -f migration-code_postal-optional.sql
-- Ou ouvrir ce fichier dans pgAdmin et exécuter la requête.

ALTER TABLE orders ALTER COLUMN code_postal DROP NOT NULL;
