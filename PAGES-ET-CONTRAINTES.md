# Pages et contraintes – UrbanS

## Récapitulatif des pages créées

### Côté public (frontend)

| Page | Route | Contraintes |
|------|--------|-------------|
| **Accueil** | `/` | Aucune. Contenu : accroche, CTAs, bloc « Pourquoi UrbanS ». |
| **Catalogue** | `/catalogue` | Aucune. Filtres (genre, famille olfactive). Liste des produits actifs (API). |
| **Fiche produit** | `/produit/[id]` | Aucune. Détail produit, pyramide olfactive, avis, ajout panier / achat direct. |
| **Panier** | `/panier` | Données en `localStorage`. Vide si pas d’articles. |
| **Checkout** | `/checkout` | Items (panier ou query `?product=&qty=`). Adresse obligatoire. Invité : nom, prénom, email obligatoires. |
| **Succès commande** | `/checkout/success` | Query `?order_id=` optionnel. Message de confirmation. |
| **Compte** | `/compte` | Connexion / Inscription. Query `?redirect=` pour rediriger après login (ex. `/admin`). |
| **La marque** | `/marque` | Contenu statique. |
| **Contact** | `/contact` | Formulaire newsletter (email requis). |
| **FAQ** | `/faq` | Contenu statique. |
| **Mentions légales** | `/mentions` | Placeholder. |
| **Confidentialité** | `/confidentialite` | Placeholder. |

### Côté admin (frontend)

| Page | Route | Contraintes |
|------|--------|-------------|
| **Tableau de bord** | `/admin` | **Token JWT + rôle `admin`**. Sinon redirection vers `/compte` ou `/`. |
| **Liste produits** | `/admin/produits` | Idem. Liste tous les produits (actifs et inactifs). Lien « Ajouter », « Modifier », « Supprimer ». |
| **Nouveau produit** | `/admin/produits/nouveau` | Idem. Formulaire : nom*, prix*, stock, genre, type, volume, intensité, saison, moment, URL image, actif. |
| **Modifier produit** | `/admin/produits/[id]` | Idem. Même formulaire, pré-rempli. |
| **Liste commandes** | `/admin/commandes` | Idem. Toutes les commandes avec statut et client. |
| **Détail commande** | `/admin/commandes/[id]` | Idem. Adresse, client, lignes, total. Changement de statut (en_cours, payee, expediee, livree, annulee). |

Protection admin : layout `/admin` vérifie le token puis `auth.me()` ; si `role !== 'admin'` → redirection. Lien « Admin » dans le header visible uniquement si l’utilisateur connecté est admin.

### Rôles et redirections

- **Non connecté** : bouton « Connexion » ; pas de lien Admin. Accès à tout le site sauf /admin.
- **Client** : lien « Compte » ; pas de lien Admin. Accès à /admin refusé (redirection vers /).
- **Admin** : lien « Compte » + lien « Admin ». Accès à /admin (produits, commandes).
- Après connexion : redirection vers `?redirect=` si présent (ex. `/compte?redirect=/admin`), sinon /. Compte test : admin@urbans.fr / password.

### API (backend)

| Route | Méthode | Contraintes |
|-------|---------|-------------|
| `/api/health` | GET | Aucune. Test connexion DB. |
| `/api/auth/register` | POST | Body : email*, password*, nom, prenom, telephone, consentement_newsletter. |
| `/api/auth/login` | POST | Body : email*, password*. Retourne `user` + `token`. |
| `/api/auth/me` | GET | **Token JWT**. Retourne le profil. |
| `/api/products` | GET | Aucune. Query : genre, family_id, occasion_id, universe_id, intensite, minPrice, maxPrice, search. Retourne produits `actif = true`. |
| `/api/products/:id` | GET | Aucune. Retourne détail + familles, occasions, univers, notes, images. |
| `/api/filters/*` | GET | Aucune. Familles, occasions, emotional-universes, notes. |
| `/api/orders` | POST | Body : items*, address*, guestInfo (si invité). Optionnel : token pour commande connectée. |
| `/api/orders/my-orders` | GET | **Token JWT**. Commandes de l’utilisateur. |
| `/api/orders/:id` | GET | **Token JWT** (pour user) ou query `email` (pour invité). Détail commande. |
| `/api/payments/create-checkout-session` | POST | Body : order_id*, success_url*, cancel_url*. Stripe optionnel. |
| `/api/reviews/product/:productId` | GET | Aucune. Liste des avis du produit. |
| `/api/reviews` | POST | Body : product_id*, note (1–5)*, commentaire. Token ou guest_id. |
| `/api/newsletter/subscribe` | POST | Body : email*, source. |
| **Admin** | | **Token JWT + rôle admin** (middleware sur tout le préfixe `/api/admin`). |
| `/api/admin/products` | GET, POST | GET : liste tous les produits. POST : création (nom_parfum*, prix*). |
| `/api/admin/products/:id` | PUT, DELETE | PUT : mise à jour. DELETE : suppression. |
| `/api/admin/orders` | GET | Liste toutes les commandes. |
| `/api/admin/orders/:id` | GET, PATCH | GET : détail. PATCH : body `{ statut }` (en_cours, payee, expediee, livree, annulee). |

---

## Images

- Les **8 parfums** du seed ont une **URL d’image** (Unsplash) dans `image_principale`.
- Affichage : catalogue et fiche produit utilisent cette URL ; si vide, placeholder « Image ».
- `next.config.js` autorise `images.unsplash.com` pour `next/image` si besoin.

Pour réappliquer les images en base : ré-exécuter `database/seed.sql` (sur une base vide ou après avoir supprimé les produits de test), ou mettre à jour manuellement les champs `image_principale` des produits existants.
