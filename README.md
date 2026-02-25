# UrbanS – Site e-commerce parfums

Projet de site de vente et de présentation de parfums (collection exclusive, commande avec ou sans compte, paiement Stripe).

## Stack

- **Frontend** : Next.js 14 (App Router) + React + Tailwind CSS
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL (base **UrbanS**)
- **Auth** : JWT
- **Paiement** : Stripe (optionnel)

## Prérequis

- Node.js 18+
- PostgreSQL avec une base nommée **UrbanS**
- (Optionnel) Compte Stripe pour les paiements

## Installation

### 1. Base de données (PostgreSQL)

Sans cette étape, l’API renverra **500** sur `/api/products` et `/api/filters/families`. Voir aussi `database/LIRE-MOI.txt`.

Créer la base si besoin :

```bash
createdb UrbanS
```

Exécuter le schéma puis les données de test :

```bash
psql -d UrbanS -f database/schema.sql
psql -d UrbanS -f database/seed.sql
```

(Adapter selon votre config : `-U postgres`, `-h localhost`, etc.)

**Comptes de test après seed :** admin@urbans.fr / password (admin), client@urbans.fr / password (client). Données : 8 parfums, familles, occasions, etc.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env : DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL, (optionnel) STRIPE_SECRET_KEY
npm install
npm run dev
```

L’API tourne par défaut sur **http://localhost:4000**.

### 3. Frontend

```bash
cd frontend
# Optionnel : .env.local avec NEXT_PUBLIC_API_URL (par défaut le front utilise /api et proxy vers le backend)
npm install
npm run dev
```

Le site tourne sur **http://localhost:3000**.

### Accès depuis le réseau local (téléphone, autre PC)

Pour ouvrir le site depuis un appareil sur le **même Wi‑Fi** :

1. **Backend** et **frontend** écoutent sur toutes les interfaces (`0.0.0.0` / `-H 0.0.0.0`), donc accessibles depuis le réseau local.
2. Au démarrage du **backend**, la console affiche l’URL à ouvrir sur les autres appareils (ex. `http://192.168.1.10:3000`).
3. Sur l’autre appareil (téléphone, tablette, autre PC), ouvrir cette URL dans le navigateur. Les appels API passent en relatif (`/api`) et sont **proxifiés** par Next.js vers le backend sur la machine hôte.

Connexion et admin fonctionnent comme sur localhost.

## Variables d’environnement

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL (ex. `postgresql://user:pass@localhost:5432/UrbanS`) |
| `JWT_SECRET` | Secret pour signer les tokens JWT |
| `JWT_EXPIRES_IN` | Durée de vie du token (ex. `7d`) |
| `PORT` | Port du serveur (défaut `4000`) |
| `FRONTEND_URL` | Origine du frontend (ex. `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (optionnel) |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe (optionnel) |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Optionnel. Par défaut : `/api` (requêtes proxifiées vers le backend ; permet l’accès depuis le réseau). En prod, mettre l’URL complète de l’API. |

## Structure du projet

```
UrbanS/
├── database/          # Schéma SQL et seed
│   ├── schema.sql
│   └── seed.sql
├── backend/           # API Express
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── routes/    # auth, products, orders, payments, reviews, newsletter, filters
│   │   └── index.js
│   └── package.json
├── frontend/          # Next.js
│   ├── app/           # Pages (accueil, catalogue, produit, panier, checkout, compte, contact, FAQ, marque)
│   ├── lib/api.js     # Client API
│   └── package.json
├── description        # Cahier des charges
├── Stack              # Stack technique
├── Base De Données     # Documentation base UrbanS
└── README.md
```

## Fonctionnalités

- **Catalogue** : liste des parfums, filtres (genre, famille olfactive)
- **Fiche produit** : description, pyramide olfactive, avis, ajout au panier
- **Panier** : gestion des quantités, passage au checkout
- **Checkout** : adresse de livraison, commande invité ou connectée, redirection Stripe (si configuré)
- **Compte** : inscription / connexion (JWT)
- **Pages** : La marque, Contact, FAQ, succès de commande
- **Newsletter** : inscription depuis la page Contact

## Paiement Stripe

1. Créer un compte Stripe et récupérer la clé secrète (mode test).
2. Renseigner `STRIPE_SECRET_KEY` dans `backend/.env`.
3. Pour les webhooks en local : utiliser Stripe CLI (`stripe listen --forward-to localhost:4000/api/payments/webhook`) et mettre le secret dans `STRIPE_WEBHOOK_SECRET`.

Sans Stripe, les commandes sont créées avec le statut `en_cours` ; le bouton « Payer par carte » affichera un message d’erreur si l’API n’est pas configurée.

## Licence

Projet personnel / formation.
