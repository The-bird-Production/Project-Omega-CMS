# Migrer une instance existante vers cette version

Ce document couvre ce qui **n'est pas automatique** en passant d'une
ancienne instance de Project Omega CMS à cette version — panel admin
refondu (« Papier Indigo »), installation de plugins/thèmes depuis GitHub
(+ catalogue), statistiques réécrites (audience, visiteurs uniques,
sessions), et éditeur par blocs (remplace TinyMCE).

Si votre instance est **très ancienne** (base gérée avec `db push`, avant
l'introduction des migrations trackées), commencez par relire la section
[« Base de données »](../Readme.md#-configuration) du README — le
basculement vers les migrations trackées est déjà automatique, rien à
faire de spécial pour ça non plus.

## Ce qui reste automatique

Que vous soyez en Docker (`docker compose pull && docker compose up -d`,
ou déjà via Watchtower) ou en bare-metal (voir
[`docs/deploy/bare-metal.md`](deploy/bare-metal.md)), la mise à jour
applique déjà toute seule :
- les nouvelles dépendances (`pnpm install`),
- les migrations Prisma (nouvelles tables/colonnes de stats, etc.) via
  `migrate:deploy:safe`,
- le nouveau design admin et le nouveau système de plugins/thèmes —
  aucune configuration requise, ça s'applique dès que le nouveau code
  tourne.

Ce qui suit est ce qu'**aucun de ces deux mécanismes ne fait à votre
place**.

## 1. Convertir le contenu existant en blocs (obligatoire, une seule fois)

Les pages et articles sont désormais édités avec un éditeur par blocs
(façon WordPress/Gutenberg) au lieu de TinyMCE. Le contenu déjà écrit
avant cette version est toujours du HTML brut en base — il continuera de
s'afficher correctement (l'ancien et le nouveau format cohabitent), mais
**ne sera pas éditable avec le nouvel éditeur tant qu'il n'a pas été
converti**.

Une fois le nouveau code déployé (le script a besoin des dépendances du
nouvel éditeur, donc à lancer *après* la mise à jour, pas avant) :

**Docker :**
```sh
docker compose exec omega-server pnpm run migrate:content-to-blocks
```

**Bare-metal :**
```sh
cd /opt/project-omega/apps/api   # ou votre WorkingDirectory
pnpm run migrate:content-to-blocks
```

Le script parcourt les pages, articles et brouillons, et convertit en
blocs tout ce qui est encore du HTML brut. Il est **idempotent** : une
ligne déjà convertie (ou vide) est simplement ignorée, donc le relancer
ne fait rien de mal — utile si vous l'interrompez ou si une conversion
individuelle échoue (le script continue sur les lignes suivantes et
rapporte un résumé : converti / déjà migré / échec).

La conversion HTML → blocs est automatique mais pas garantie parfaite sur
du HTML très personnalisé (mise en page complexe, `<div>`/CSS inline
exotiques) — après la migration, ouvrez rapidement vos pages/articles les
plus importants dans l'éditeur pour vérifier que le rendu vous convient.
Si un contenu s'est mal converti, il reste consultable publiquement (rien
n'est perdu) : il suffit de le retravailler dans le nouvel éditeur.

## 2. Anciens plugins/thèmes installés via l'ancien système

L'ancien « marketplace » propriétaire a été remplacé par une installation
directe depuis un dépôt GitHub (`owner/repo`), avec un
[catalogue de plugins/thèmes validés](https://github.com/The-bird-Production/Omega-Catalog)
pour parcourir plus facilement que de coller un dépôt à la main.

- **Les plugins/thèmes déjà installés continuent de fonctionner sans rien
  faire** : le chargement au démarrage (`Plugins/`, `Themes/` sur disque)
  ne dépend pas de la façon dont ils ont été installés.
- Ce qui ne fonctionne plus pour un plugin/thème installé via l'ancien
  marketplace : la vérification de mise à jour depuis l'admin (« Vérifier
  les mises à jour ») répondra qu'aucune mise à jour n'est disponible, car
  l'admin ne connaît pas de dépôt GitHub associé.
- Pour retrouver la vérification/mise à jour automatique : si l'auteur du
  plugin/thème a publié un dépôt GitHub avec des releases, réinstallez-le
  depuis ce dépôt (`/admin/plugins/install` ou `/admin/themes/install`) —
  ça écrase l'installation existante avec la même config, et l'associe
  désormais à ce dépôt pour les futures mises à jour.

## 3. Variables d'environnement

Rien n'est obligatoire ici, mais deux changements à connaître :

- **`CATALOG_REPO`** (nouvelle, optionnelle) : dépôt GitHub
  (`owner/repo`) du catalogue de plugins/thèmes affiché dans l'admin.
  Par défaut `The-bird-Production/Omega-Catalog` — à définir uniquement
  si vous curatez votre propre liste. Voir `.env.server.example`. Sous
  Docker, comme ce n'est pas une variable transmise par défaut au
  container `omega-server`, ajoutez `- CATALOG_REPO=...` à sa section
  `environment:` dans votre `docker-compose.yml` si vous la personnalisez.
- **`NEXT_PUBLIC_TINYMCE_API_KEY`** : n'est plus utilisée (TinyMCE a été
  retiré). Vous pouvez la retirer de votre `.env`, la laisser ne pose
  aucun problème non plus.

## 4. Nouveau cookie de suivi anonyme (statistiques d'audience)

Les nouvelles statistiques d'audience (visiteurs uniques, durée de
session, taux de rebond) reposent sur un cookie de première partie,
anonyme et non lié à l'IP (`omega_vid`, un UUID aléatoire généré côté
navigateur — voir `apps/web/lib/analytics.js`). C'est une amélioration
automatique, aucune action requise côté serveur. Selon votre
juridiction, un cookie de suivi — même anonyme et sans lien avec une
identité — peut nécessiter d'être mentionné dans votre politique de
confidentialité ou couvert par un bandeau de consentement ; ce point
n'est pas traité automatiquement par le CMS.

## Vérifications après migration

- `/admin` : nouveau design clair « Papier Indigo » (sidebar/topbar
  blanches, accent indigo).
- Créer une nouvelle page ou un nouvel article : le nouvel éditeur par
  blocs s'affiche (`/` pour insérer un bloc).
- Ouvrir un contenu existant après l'étape 1 : il s'affiche dans
  l'éditeur par blocs, pas dans un champ HTML brut.
- `/admin/plugins/install` et `/admin/themes/install` : la section
  « Parcourir le catalogue » liste les entrées validées.
- `/admin/stats` : une carte « Audience » affiche visiteurs uniques,
  sources de trafic, appareil/navigateur, durée de session et taux de
  rebond.

## En cas de souci

- **Le contenu migré s'affiche vide ou tronqué sur le site public** :
  revérifiez-le dans l'éditeur — la conversion HTML → blocs a pu perdre
  une mise en page trop spécifique (voir point 1). Rien n'est supprimé
  côté base tant que vous ne resauvegardez pas depuis l'éditeur.
- **Un plugin/thème a disparu de la liste après mise à jour** : il ne
  devrait pas — le chargement lit toujours `Plugins/`/`Themes/` sur
  disque, indépendamment de l'admin. Si un plugin personnalisé ajoute son
  propre bloc d'édition (`public/blocks.js` — voir
  `apps/web/lib/blocks/README.md`) et qu'il n'apparaît pas dans l'éditeur,
  vérifiez que ce fichier a bien été copié vers
  `apps/web/app/components/plugin/<id>/blocks.js` lors de l'installation
  (même mécanisme que `admin/dashboard.js` existant).
