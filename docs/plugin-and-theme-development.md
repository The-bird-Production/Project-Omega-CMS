# Développer un plugin ou un thème pour Project Omega CMS

Ce guide documente tout ce qu'un plugin ou un thème peut faire : structure
de fichiers, manifeste, points d'extension (routes admin, blocs de
l'éditeur, pages entièrement personnalisées, menus), et comment le
publier pour qu'il soit installable depuis GitHub — la seule méthode
d'installation aujourd'hui (voir [README](../Readme.md), section
Plugins).

Tout le mécanisme décrit ici a été vérifié dans ce dépôt (code lu et,
pour les nouveaux points d'extension, testé manuellement) — quand quelque
chose n'est *pas encore* branché ou a une limite connue, c'est indiqué
explicitement plutôt que passé sous silence.

## Comment un plugin/thème est installé

Depuis `/admin/plugins/install` ou `/admin/themes/install` (ou en collant
un `owner/repo` GitHub directement), le CMS :
1. Télécharge la dernière **release GitHub** du dépôt (il en faut au
   moins une) — l'asset `plugin.zip` ou `theme.zip` s'il existe, sinon
   l'archive source générée automatiquement par GitHub.
2. L'extrait dans `apps/api/Plugins/<id>/` ou `apps/api/Themes/<id>/`
   (`<id>` dérivé du dépôt, ex. `owner-repo`).
3. Déplace certains sous-dossiers vers `apps/web` pour qu'ils soient
   chargeables côté frontend (détaillé plus bas, par type de fichier).
4. Enregistre `{ id, name, version, source: "github:owner/repo" }` en
   base (tables `Plugin`/`Theme`) — sert à l'admin pour proposer une mise
   à jour quand une nouvelle release existe.

Peu importe où vous hébergez le code : seul compte le contenu de la
**dernière release GitHub** au moment de l'installation.

## Écrire un plugin

### Structure

```
mon-plugin/
├─ plugin.json
├─ admin/
│  └─ dashboard.js        # page d'admin du plugin
├─ public/
│  ├─ blocks.js           # blocs pour l'éditeur (pages/articles)
│  └─ publicComponent.js  # copié mais pas encore consommé (voir plus bas)
└─ Routes/
   └─ MainRoutes.js       # routes Express du plugin
```

### `plugin.json`

```json
{
  "id": "mon-plugin",
  "name": "Mon Plugin",
  "version": "1.0.0",
  "description": "Ce que fait le plugin.",
  "url": "/mon-plugin",
  "user": { "routes": [] }
}
```

- `id` : doit correspondre au nom du dossier, uniquement lettres/chiffres/`_`/`-`
  (voir `apps/api/Functions/pluginIdValidator.ts`) — sert de clé partout
  (dossier sur disque, ligne en base, URL de la page admin).
- `url` (optionnel) : chemin de montage des routes Express du plugin
  (défaut `/<id>`) — voir Routes ci-dessous.
- `user.routes` (optionnel) : renvoyé tel quel par `GET /plugins/user-routes`
  (public). Le format et l'usage sont libres pour l'instant — aucune UI
  du cœur du CMS ne les consomme encore ; c'est un point d'extension prévu
  mais pas encore branché.

### Routes backend (`Routes/MainRoutes.js`)

Doit exporter par défaut un routeur Express (ou une fonction middleware) :

```js
import { Router } from "express";
const router = Router();

router.get("/hello", (req, res) => {
  res.json({ message: "Salut depuis mon plugin !" });
});

export default router;
```

Monté automatiquement au démarrage sur `plugin.json`'s `url` (ex.
`/mon-plugin/hello`) — voir `apps/api/Functions/LoadPlugin.ts`. Ce code
tourne avec les **pleins privilèges du process Express** : accès direct à
`@omega/db`, au système de fichiers, etc. N'installez un plugin que si
vous faites confiance à son auteur — il n'y a aucun bac à sable.

### Page d'administration (`admin/dashboard.js`)

Copié vers `apps/web/app/components/plugin/<id>/dashboard.js` à
l'installation, rendu sur `/admin/plugins/<id>` :

```jsx
export default function Dashboard() {
  return <div className="card card-body">Réglages de mon plugin</div>;
}
```

Export par défaut = composant React, aucune prop particulière aujourd'hui.

### Contribuer des blocs à l'éditeur (`public/blocks.js`)

L'éditeur de pages/articles est un éditeur par blocs
([BlockNote](https://www.blocknotejs.org/)). Un plugin peut y ajouter ses
propres types de blocs : voir
[`apps/web/lib/blocks/README.md`](../apps/web/lib/blocks/README.md) pour
le contrat complet et un exemple. En résumé, `public/blocks.js` doit
exporter par défaut un objet `{ typeDeBloc: BlockSpec }` construit avec
`createReactBlockSpec` de `@blocknote/react` :

```jsx
import { createReactBlockSpec } from '@blocknote/react';

const alerte = createReactBlockSpec(
  { type: 'alerte', propSchema: { niveau: { default: 'info' } }, content: 'inline' },
  { render: (props) => (
      <div className={`alert alert-${props.block.props.niveau}`}>
        <div ref={props.contentRef} />
      </div>
    ) }
);

export default { alerte: alerte() };
```

Une fois installé, le bloc apparaît dans le menu `/` de l'éditeur — testé
manuellement pendant le développement de cette fonctionnalité avec un
bloc `testimonial` factice, en admin **et** en rendu public (voir la
section suivante pour la nuance rendu serveur/client).

**Rendu public** : une page/article composé uniquement des blocs
standards est rendu en HTML **côté serveur** (bon pour le SEO). Dès qu'il
utilise un bloc de plugin/thème, l'export HTML headless de BlockNote ne
sait pas fiablement rendre un bloc React personnalisé hors d'un arbre
React réellement monté (constaté en testant, pas juste documenté) — la
page bascule alors sur un rendu **côté client** (le même composant
`render`, mais hydraté dans le navigateur). Implication concrète : votre
fonction `render` doit fonctionner seule, montée dans le navigateur —
donc pas de dépendance à un contexte React fourni par le cœur du CMS.

### `public/publicComponent.js`

Copié vers `apps/web/app/components/plugin/<id>/publicComponent.js` à
l'installation, comme `dashboard.js` — mais **rien dans le cœur du CMS ne
l'importe ni ne le rend actuellement**. C'est un point d'extension réservé
depuis le début du projet, jamais branché. Si votre plugin a besoin
d'afficher quelque chose sur le site public, `public/blocks.js` (ci-dessus)
est le point d'extension qui fonctionne réellement aujourd'hui.

## Écrire un thème

### Structure

```
mon-theme/
├─ theme.json
├─ components/
│  ├─ Header.js
│  ├─ Footer.js
│  ├─ Button.js
│  ├─ blocks.js           # mêmes blocs personnalisés que pour un plugin
│  └─ pages/
│     ├─ galerie.jsx       # un template de page personnalisé
│     └─ menu-resto.jsx
├─ asset/
└─ style/
   └─ style.css
```

### `theme.json`

```json
{
  "id": "mon-theme",
  "name": "Mon Thème",
  "description": "Thème pour restaurant/chalet.",
  "version": "1.0.0",
  "author": "Vous",
  "config": {
    "fonts": { "body": "Inter, sans-serif", "heading": "Fraunces, serif" },
    "layout": { "header": "default", "footer": "default", "buttonStyle": "rounded" },
    "components": {
      "Header": "/components/Header.js",
      "Footer": "/components/Footer.js",
      "Button": "/components/Button.js"
    },
    "pageTemplates": [
      { "name": "galerie", "label": "Galerie photo" },
      { "name": "menu-resto", "label": "Menu du restaurant" }
    ]
  }
}
```

`id` suit la même règle que pour un plugin. `config.pageTemplates` est le
point d'extension décrit en détail plus bas — omettez-le si votre thème
n'en fournit pas.

### Header / Footer (chrome du site public)

`config.components.Header`/`Footer` pointent vers un composant React
(export par défaut), chargé dynamiquement et rendu autour de **chaque**
page publique — voir `apps/web/app/components/layout/MainLayout.js`.
Aucune prop n'est passée aujourd'hui ; le composant récupère lui-même ce
dont il a besoin (voir « Menus de navigation » ci-dessous pour la nav).

`Button` est déclaré dans le manifeste mais n'est, pour l'instant,
consommé par aucune UI du cœur — libre à vous de l'utiliser dans vos
propres composants (Header, templates de page) ou de l'ignorer.

### Copie des fichiers `components/` : Docker vs bare-metal

`components/` (Header/Footer/Button/blocks.js/pages/) doit être visible
depuis `apps/web`, qui tourne dans un process (bare-metal) ou un
container (Docker) séparé de `apps/api`, là où le thème est réellement
installé :
- **Docker** : `docker-compose.yml` partage le même dossier hôte
  (`./apps/api/Themes`) entre les deux containers, chacun à son propre
  chemin attendu — aucune copie nécessaire, ça fonctionne dès
  l'installation.
- **Bare-metal** (dev ou prod) : un seul checkout du repo, pas de volume
  partagé — `components/` est copié vers `apps/web/app/Themes/<id>/` au
  moment de l'installation (voir `apps/api/Functions/InstallTheme.ts`).

Les deux chemins ont été vérifiés dans le code ; seul le second nécessite
une copie explicite, ce que ce dépôt ne faisait pas encore correctement
en production bare-metal avant cette révision (il ne copiait qu'en mode
développement) — corrigé au passage.

### Pages entièrement personnalisées (`components/pages/*.jsx`)

C'est le point d'extension à utiliser quand une page ne rentre pas dans
le rendu par blocs générique — une mise en page sur mesure, une galerie
interactive, un plan de salle, etc.

1. Le thème fournit un fichier par template, ex.
   `components/pages/galerie.jsx` :
   ```jsx
   export default function GaleriePage({ page }) {
     // `page` = l'enregistrement complet : { title, slug, body, template, ... }
     // `body` reste les blocs JSON habituels si vous voulez vous en servir,
     // mais rien ne vous y oblige — la page peut être 100% sur mesure.
     return (
       <main className="galerie-page">
         <h1>{page.title}</h1>
         {/* votre mise en page */}
       </main>
     );
   }
   ```
2. Déclarez-le dans `theme.json` → `config.pageTemplates` (voir plus
   haut) — c'est ce qui le fait apparaître dans le sélecteur « Modèle de
   page » de l'admin (`/admin/page/new` et `/admin/page/edit/...`).
3. Dans l'admin, en éditant une page, choisissez ce modèle dans la liste
   déroulante. Le champ est stocké sur `page.template` (nom du fichier,
   sans l'extension).
4. Le rendu public (`apps/web/app/[slug]/page.jsx`) importe alors votre
   composant à la place du rendu par blocs. Si le thème change ou que le
   template est retiré, la page retombe automatiquement sur le rendu par
   blocs standard plutôt que de planter — testé manuellement en
   simulant un thème avec un template déclaré.

C'est exactement le point d'extension qu'il vous faut pour un site comme
un restaurant/chalet où la plupart des pages ont une mise en page sur
mesure (menu du jour, galerie, réservation...) plutôt que du contenu
texte+image générique.

### Menus de navigation

Les menus (`/admin/menu`) sont gérés dans l'admin — pas de code à écrire
pour ajouter/réordonner un lien. Un thème les récupère via
`apps/web/lib/menu.js` :

```jsx
import { getMenu } from '@/lib/menu'; // ou chemin relatif selon où vit votre Header

export default async function Header() {
  const items = await getMenu('main'); // ou 'footer', ou tout autre nom choisi dans l'admin
  return (
    <header>
      <nav>
        {items.map((item) => (
          <a key={item.id} href={item.url} target={item.target || undefined}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

Chaque item peut avoir des `children` (un niveau de sous-menu, pour un
menu déroulant) — voir la forme exacte renvoyée par `GET /menu/:menu`
dans `apps/api/Controllers/Menu/MenuController.ts`.

## Développer en local sans passer par une release GitHub

Pour itérer sans publier de release à chaque essai, déposez directement
votre dossier dans `apps/api/Plugins/<id>/` ou `apps/api/Themes/<id>/`
(mêmes noms de fichiers que dans une release) puis, pour un thème,
copiez manuellement (ou liez en symlink) `components/` vers
`apps/web/app/Themes/<id>/components/` — c'est exactement ce que fait
l'installeur, l'étape manuelle en moins.

## Publier et soumettre au catalogue

1. Créez une **release GitHub** sur votre dépôt (le CMS lit toujours la
   dernière). Joignez un asset `plugin.zip`/`theme.zip` si vous voulez
   maîtriser précisément le contenu de l'archive, sinon l'archive source
   auto-générée par GitHub suffit.
2. N'importe qui peut l'installer en collant `owner/repo` dans
   `/admin/plugins/install` ou `/admin/themes/install`.
3. Pour apparaître dans le catalogue intégré (section « Parcourir le
   catalogue » de ces mêmes pages), proposez une pull request sur
   [`The-bird-Production/Omega-Catalog`](https://github.com/The-bird-Production/Omega-Catalog)
   ajoutant votre dépôt à `plugins.json` ou `themes.json`.
