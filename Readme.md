# 🌀 Project Omega CMS

**Un CMS moderne, modulaire et personnalisable, basé sur Next.js et Express.js.**

## 🚀 Roadmap

### 🔹 Fonctionnalités terminées
✅ **Authentification** via better-auth (rôles admin/utilisateur, permissions granulaires).<br>
✅ **Éditeur par blocs** (façon WordPress/Gutenberg) pour pages et articles, extensible par les plugins/thèmes.<br>
✅ **Plugins et thèmes installables depuis GitHub**, avec catalogue intégré de dépôts validés.<br>
✅ **Thèmes personnalisables** : couleurs/polices, en-tête/pied de page, pages entièrement sur mesure ([guide](docs/plugin-and-theme-development.md)).<br>
✅ **Menus de navigation** gérables depuis l'admin, consommés par les thèmes.<br>
✅ **Admin Dashboard** ergonomique (design « Papier Indigo ») avec gestion du contenu.<br>
✅ **Statistiques d'audience** : visiteurs uniques, sources de trafic, appareil/navigateur, durée de session, taux de rebond — en plus des statistiques API/pages.<br>
✅ **Mises à jour automatiques** depuis GitHub (Watchtower en Docker, updater intégré en bare-metal).<br>
✅ **Gestion d'articles** avec brouillons, sauvegarde auto, catégories/tags et publication planifiée.<br>
✅ **Recherche et filtrage** des articles (tags, catégories, pagination).<br>
✅ **Gestion des médias** (upload fichiers). <br>
✅ **Optimisation SEO** : sitemap.xml et robots.txt générés automatiquement, balises meta/Open Graph sur toutes les pages publiques. <br>
✅ **Support multi-langues** (interface) : socle next-intl en place, site public et chrome admin déjà traduits, français comme première langue supportée. <br>
✅ **Notifications en temps réel** (Socket.io) pour les admins.<br>
✅ **Gestion des utilisateurs en CLI**, sans dépendre de phpMyAdmin (voir Configuration ci-dessous).<br>

### 🏗 Fonctionnalités en cours de développement

🚧 **Multi-langues : reste du back-office** (formulaires admin article/page/image/utilisateur/plugin/thème) et **contenu multilingue** (plusieurs traductions d'un même article/page) — non couverts par le socle actuel.<br>
🚧 **Système de notifications email** (nouveaux commentaires, nouveaux utilisateurs).<br>


## 📦 Installation

### Prérequis
- **Node.js** (v18+)
- **PostgreSQL / MySQL** pour la base de données (via Prisma)

### Cloner le projet
```sh
 git clone https://github.com/The-bird-Production/Project-Omega-CMS.git
 cd project-omega-cms
```

### Installer les dépendances (monorepo pnpm workspace)
Le projet est un monorepo géré avec [pnpm](https://pnpm.io/) (`corepack enable` si `pnpm` n'est pas déjà disponible). Une seule commande installe les dépendances des trois packages (`apps/web`, `apps/api`, `packages/db`) :
```sh
corepack enable
pnpm install
pnpm --filter @omega/db run generate
```

### Configurer l'environnement
Copiez les fichiers d'exemple (`.env.server.example` à la racine → `apps/api/.env`, `.env.client.example` à la racine → `apps/web/.env`) puis remplissez les variables selon votre configuration.

### Lancer le projet en local (Backend + Frontend séparés)
Backend (`apps/api`)
```sh
pnpm --filter @omega/api dev
```
Frontend (`apps/web`)
```sh
pnpm --filter @omega/web dev
```

Le CMS est maintenant accessible sur `http://localhost:3000`.

## 🐳 Déploiement Docker

Deux fichiers compose :
- **`docker-compose.yml`** (officiel, pour l'auto-hébergement) : utilise les images publiées sur GHCR (`ghcr.io/the-bird-production/omega-api`/`omega-web:stable`) au lieu de builder depuis les sources.
- **`docker-compose.dev.yml`** (contribution/dev local) : builde les images depuis les sources et ajoute phpMyAdmin + le port MySQL exposé. À utiliser en overlay : `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`.

Pour un déploiement de prod :
```sh
cp .env.example .env   # puis remplir MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, BETTER_AUTH_SECRET
docker compose up -d
```

### Mises à jour automatiques (Watchtower)
Chaque push sur `main` qui passe les tests déclenche `.github/workflows/release.yml`, qui build, signe (cosign, keyless) et publie de nouvelles images `:stable` sur GHCR. Pour que votre instance se mette à jour automatiquement dès qu'une nouvelle image est publiée, sans jamais avoir à vous connecter à votre propre serveur :
```sh
docker compose --profile watchtower up -d
```
[Watchtower](https://containrrr.dev/watchtower/) surveille uniquement les containers `omega-client`/`omega-server` (via le label `com.centurylinklabs.watchtower.enable`) et les recrée dès qu'un nouveau digest apparaît sur le tag `:stable` — c'est une vérification sortante uniquement, aucun accès entrant à votre infra n'est nécessaire. C'est un choix opt-in : sans le `--profile watchtower`, les mises à jour restent manuelles (`docker compose pull && docker compose up -d`).

### Migrer une instance existante
La mise à jour (Docker ou bare-metal) applique automatiquement les nouvelles dépendances, migrations de base de données et le nouveau design admin. Certains changements récents (éditeur par blocs, ancien marketplace de plugins/thèmes) demandent une action ponctuelle de votre part — voir [`docs/migration.md`](docs/migration.md).

## 🖥️ Déploiement bare-metal (sans Docker)

Sans Docker, `apps/api` embarque son propre vérificateur/applicateur de mise à jour (basé sur `git`, pas de téléchargement de tarball ni de signature séparée à gérer) — même principe de sortie uniquement, désactivé par défaut. Voir [`docs/deploy/bare-metal.md`](docs/deploy/bare-metal.md) pour les unités systemd et comment l'activer.

## 🔧 Configuration

- **Fichiers de configuration** : `apps/api/config/` (paramètres généraux), `.env` (variables sensibles, voir `ALLOWED_ORIGINS`/`APP_URL` pour le CORS et les cookies).
- **Base de données** : le schéma Prisma est centralisé dans `packages/db/prisma/schema.prisma` et partagé par les apps via le package `@omega/db`. Migrations :
  ```sh
  pnpm --filter @omega/db run migrate:dev
  ```
  En production (Docker et bare-metal), c'est `migrate:deploy:safe` qui s'exécute automatiquement à chaque mise à jour. Les instances déjà en place avant l'introduction des migrations trackées (schéma géré jusqu'ici avec `db push`) n'ont rien à faire : ce script détecte lui-même une base non vide sans historique de migration et la fait basculer sur le nouveau système sans intervention.
- **Gestion des permissions** : gérées via better-auth (`packages` d'accès dans `apps/api/lib/permissions.js`), modifiables dans l'admin.
- **Gestion des utilisateurs en CLI** (sans passer par phpMyAdmin) : `apps/api/scripts/manage-users.mts`, utile notamment pour créer le tout premier compte admin.
  ```sh
  pnpm --filter @omega/api run manage-users create admin@exemple.com motdepasse "Nom Complet" admin
  pnpm --filter @omega/api run manage-users list
  pnpm --filter @omega/api run manage-users set-role admin@exemple.com admin
  pnpm --filter @omega/api run manage-users set-password admin@exemple.com nouveaumotdepasse
  pnpm --filter @omega/api run manage-users delete admin@exemple.com
  ```
  Passe par les mêmes mécanismes que l'application (better-auth pour la création/le hash du mot de passe) plutôt que d'écrire en base à la main — évite en particulier un compte avec un `name` manquant, qui empêche ensuite la connexion.
- **Plugins** : Ajoutez vos propres plugins en les plaçant dans `apps/api/Plugins/`. Voir le repo github : `https://github.com/The-bird-Production/OmegaPlugin`

## 🏗 Structure du projet

```
📦 Project Omega CMS (pnpm workspace)
├─ pnpm-workspace.yaml
├─ package.json
├─ apps/
│  ├─ web/ (Frontend - Next.js)
│  │  ├─ Functions/
│  │  ├─ app/
│  │  │  ├─ [slug]/
│  │  │  ├─ admin/
│  │  │  ├─ auth/
│  │  │  └─ components/
│  │  ├─ lib/
│  │  ├─ public/
│  │  ├─ package.json
│  │  └─ next.config.mjs
│  └─ api/ (Backend - Express.js)
│     ├─ Controllers/
│     ├─ Middleware/
│     ├─ Routes/
│     ├─ Functions/
│     ├─ config/
│     ├─ tests/
│     ├─ package.json
│     ├─ server.js
│     └─ app.js
├─ packages/
│  ├─ db/ (schéma Prisma unique + client partagé `@omega/db`)
│  └─ config/ (tsconfig partagée)
└─ cms.js
```

## 📜 API REST
- **Images** (CRUD)
- **Fichiers** (CRUD)
- **Utilisateurs** (authentification, gestion)
- **Logs** (consultation, suppression)
- **Statistiques** (API, Web)
- **Rôles** (gestion des permissions)
- **Pages** (CRUD, modèles personnalisés)
- **Menus** (navigation)
- **Plugins** (installation, gestion)

## 🎨 Thèmes & ⚙️ Plugins
Installables depuis un dépôt GitHub (`/admin/plugins/install`, `/admin/themes/install`) ou via le catalogue intégré. Un thème peut fournir son propre en-tête/pied de page, des pages entièrement personnalisées, et contribuer des blocs à l'éditeur ; un plugin peut ajouter des routes backend, une page d'admin, et lui aussi des blocs. Guide complet pour en développer un : [`docs/plugin-and-theme-development.md`](docs/plugin-and-theme-development.md).


## 🛠 Contribution
Les contributions sont les bienvenues ! Forkez le projet et proposez une PR.

## 📄 Licence
MIT License - Etienne Maleville

