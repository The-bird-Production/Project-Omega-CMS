# 🌀 Project Omega CMS

**Un CMS moderne, modulaire et personnalisable, basé sur Next.js et Express.js.**

## 🚀 Fonctionnalités

- 🔑 **Authentification** avec NextAuth.js et gestion avancée des rôles.
- 📝 **Gestion d'articles** avec brouillons, sauvegarde auto et publication.(🚧WIP)
- 📁 **Gestion des médias** (upload d'images et (🚧WIP) fichiers).
- 🔎 **Recherche et filtrage avancés** (tags, catégories, pagination). (🚧WIP)
- 🏗 **Système de plugins** pour ajouter des fonctionnalités personnalisées.
- 🎨 **Système de thème** personnalisable depuis l'administration. (🚧WIP)
- 🌍 **Support multi-langues**. (🚧WIP)
- 🛠 **Admin Dashboard** ergonomique avec stats et gestion du contenu.
- 🔄 **Mises à jour automatiques** depuis un repo GitHub.
- 📡 **Notifications en temps réel** (Socket.io) pour admins. (🚧WIP)
- 📬 **Système de notifications email** (nouveaux commentaires, nouveaux utilisateurs). (🚧WIP)
- 🌐 **Optimisation SEO** avec génération auto du sitemap et balises SEO. (🚧WIP)

## 📦 Installation

### Prérequis
- **Node.js** (v18+)
- **PostgreSQL / MySQL** pour la base de données (via Prisma)

### Cloner le projet
```sh
 git clone https://github.com/The-bird-Production/Project-Omega-CMS.git
 cd project-omega-cms
```

### Installer les dépendances de chaque dossier (Server et Client)
```sh
npm install
```

### Configurer l'environnement
Copiez le fichier d'exemple 
Puis remplissez les variables selon votre configuration.

### Lancer le projet en local Backend + Frontend séparés
Front end /Client
```sh

npm run dev
```
Backend /Server
```sh

nodemon server.js
```


Le CMS est maintenant accessible sur `http://localhost:3000`.

## 🔧 Configuration

- **Fichiers de configuration** : `config.json` (paramètres généraux), `.env` (variables sensibles).
- **Base de données** : Prisma ORM est utilisé, les migrations peuvent être gérées avec :
  ```sh
  npx prisma migrate dev
  ```
- **Gestion des permissions** : Stockées en JSON et modifiables dans l'admin.
- **Plugins** : Ajoutez vos propres plugins en les plaçant dans `plugins/`. Voir le repo github : `https://github.com/The-bird-Production/OmegaPlugin`

## 🏗 Structure du projet

```
📦 Project Omega CMS
├─ .gitignore
├─ Client (Frontend - Next.js)
│  ├─ Functions/
│  ├─ app/
│  │  ├─ [slug]/
│  │  ├─ admin/
│  │  │  ├─ image/
│  │  │  ├─ log/
│  │  │  ├─ page/
│  │  │  ├─ plugins/
│  │  │  ├─ role/
│  │  │  ├─ stats/
│  │  │  ├─ user/
│  │  ├─ auth/
│  │  ├─ components/
│  │  │  ├─ admin/
│  │  │  ├─ auth/
│  │  │  ├─ layout/
│  │  │  ├─ loader/
│  │  │  ├─ plugin/
│  │  │  └─ util/
│  ├─ lib/
│  ├─ pages/
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  └─ getRole.ts
│  ├─ prisma/
│  ├─ public/
│  ├─ tsconfig.json
│  ├─ package.json
│  ├─ next.config.mjs
│  └─ README.md
├─ Server (Backend - Express.js)
│  ├─ Controllers/
│  ├─ Middleware/
│  ├─ Routes/
│  ├─ Functions/
│  ├─ config/
│  ├─ prisma/
│  ├─ package.json
│  ├─ server.js
│  └─ app.js
└─ cms.js
```

## 📜 API REST
- **Images** (CRUD)
- **Fichiers** (CRUD)
- **Utilisateurs** (authentification, gestion)
- **Logs** (consultation, suppression)
- **Statistiques** (API, Web)
- **Rôles** (gestion des permissions)
- **Pages** (CRUD)
- **Plugins** (installation, gestion)

## 🎨 Personnalisation du Thème (WIP)
Les administrateurs peuvent modifier les couleurs, polices et styles via l'interface admin.

## ⚙️ Système de Plugins
Les plugins peuvent ajouter des pages, modifier le frontend ou backend sans redémarrage.
DOC : (WIP)


## 🛠 Contribution
Les contributions sont les bienvenues ! Forkez le projet et proposez une PR.

## 📄 Licence
MIT License - Etienne Maleville

