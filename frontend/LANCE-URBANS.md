# Lancer le frontend UrbanS (et pas un autre projet)

Les erreurs `providers.tsx`, `NotificationProvider`, `Header.tsx` (dans `src/components/`), etc. viennent **d’un autre projet Next.js**, pas de celui-ci.

Ce frontend UrbanS n’a pas de `src/app/` ni ces composants. Il utilise uniquement le dossier `app/` à la racine du frontend.

## À faire

1. **Fermer** tout autre serveur Next.js qui tourne (notamment sur le port 3000).

2. **Ouvrir un terminal** et aller dans le bon dossier :
   ```powershell
   cd c:\UrbanS\frontend
   ```

3. **Lancer le frontend UrbanS** sur le port **3001** pour éviter tout mélange avec une autre app sur 3000 :
   ```powershell
   npm run dev:urbans
   ```
   Ou simplement :
   ```powershell
   npm run dev
   ```
   (si rien d’autre n’utilise le port 3000)

4. **Ouvrir dans le navigateur** :
   - **http://localhost:3001** si vous avez utilisé `npm run dev:urbans`
   - **http://localhost:3000** si vous avez utilisé `npm run dev` et que c’est bien ce projet qui écoute sur 3000

5. **Depuis d’autres appareils (même Wi‑Fi)** : le frontend est lancé avec `-H 0.0.0.0`, donc il écoute sur tout le réseau. Au démarrage du **backend**, la console affiche l’URL à ouvrir (ex. `http://192.168.1.5:3000`). Ouvrez cette adresse sur téléphone ou tablette pour tester le site.

Vous devez voir la page d’accueil UrbanS avec le titre « UrbanS », les liens Catalogue, La marque, Panier, etc. Si vous voyez une autre interface, c’est encore l’autre projet.
