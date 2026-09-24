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

### Blocs "Gutenberg" intégrés au cœur du CMS

En plus des blocs standards de BlockNote (paragraphe, titre, liste,
citation, image, vidéo, tableau...) et de ceux qu'un plugin/thème peut
contribuer (ci-dessus), l'éditeur propose un jeu de blocs de mise en
page inspirés de WordPress/Gutenberg, **toujours disponibles quel que
soit le thème actif** — contrairement aux blocs de plugin/thème, ce ne
sont pas un point d'extension, ils font partie du cœur du CMS
(`apps/web/lib/blocks/core/`). Utiles pour composer une page qui
ressemble à un vrai site (bannière, colonnes, FAQ, galerie...) sans
écrire de code :

| Bloc | Rôle | Props principales |
| --- | --- | --- |
| `cover` | Bannière plein écran : image de fond + contenu (titre, texte, bouton...) superposé | `imageUrl`, `overlayOpacity` (0-100), `minHeight` (px) |
| `buttons` / `button` | Un ou plusieurs boutons côte à côte — insérez `buttons`, puis un ou plusieurs `button` comme enfants | `button` : `url`, `variant` (`primary`/`outline`/`text`), `openInNewTab` |
| `columns` / `column` | Colonnes de largeur égale, chacune pouvant contenir n'importe quel bloc | — |
| `accordion` / `accordionItem` | Questions/réponses repliables (FAQ, équipement...) — la question est un texte simple, la réponse est le contenu de l'item (n'importe quels blocs) | `accordionItem` : `question`, `open` |
| `gallery` / `galleryImage` | Grille de photos, une image par bloc enfant (upload directement depuis l'éditeur) | `galleryImage` : `url`, `alt` |
| `spacer` | Espace vertical réglable | `height` (px) |
| `embed` | Intègre un widget tiers en iframe (réservation, webcam, carte...) | `url`, `height` (px) |
| `contactForm` | Formulaire de contact visuel (nom, e-mail, message...) — décoratif : pas de traitement d'envoi intégré, réservé à un développement futur | — |

Comme pour les blocs de plugin/thème, une page qui utilise l'un de ces
blocs bascule sur le rendu client (voir la nuance rendu serveur/client
ci-dessus) plutôt que le HTML statique côté serveur — même limitation,
même raison.

Si vous écrivez un thème, ces blocs vous dispensent souvent d'avoir à
créer un template de page personnalisé (`components/pages/*.jsx`,
voir plus bas) : une bannière + quelques colonnes + un accordéon
suffisent pour la plupart des mises en page d'un site vitrine.

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
├─ content/
│  └─ pages/
│     ├─ about-us.json     # contenu de démarrage, importé à l'installation
│     └─ contact.json
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

`components/Header.js`/`Footer.js` (export par défaut) sont rendus
autour de **chaque** page publique — voir
`apps/web/app/components/layout/MainLayout.js`. Contrairement au reste
du thème, ils prennent effet **immédiatement** après l'installation,
sans redémarrage ni reconstruction de `apps/web` : ils sont compilés une
fois (JSX → JS) au moment de l'installation puis rendus côté serveur, en
isolation complète de l'arbre React de l'application (voir
`apps/web/lib/loadCompiledComponent.js` pour le détail technique — en
résumé, Next.js utilise en interne sa propre copie de React pour son
arbre de Server Components, incompatible avec un élément React créé par
une autre copie ; le rendu isolé vers du HTML statique contourne
totalement le problème).

Cette isolation impose deux contraintes à respecter dans `Header.js`/
`Footer.js` :

- **Composants strictement serveur** : pas de `'use client'`, pas de
  hooks (`useState`, `useEffect`, `usePathname`...) — le composant ne
  reçoit que des props, une seule fois, au moment du rendu.
- **Pas de `next/link`/`next/navigation`** : ces API reposent sur des
  hooks internes à Next.js qui ne fonctionnent pas dans ce rendu isolé.
  Utilisez de simples balises `<a href="...">` — le contenu étant rendu
  en HTML statique (`dangerouslySetInnerHTML`), la préextraction
  côté client de `next/link` ne s'appliquerait de toute façon pas ici.

Props reçues par les deux composants :

```jsx
export default function Header({ menu, pathname }) {
  // menu : les éléments du menu "main" (voir /admin/menu), déjà
  //        récupérés par l'application — inutile de les recharger.
  // pathname : le chemin de la page actuelle (ex. "/about-us"), utile
  //        par exemple pour styliser différemment le header selon la
  //        page (voir le thème apdm-omega-theme pour un exemple réel).
}
```

`Button` est déclaré dans le manifeste mais n'est, pour l'instant,
consommé par aucune UI du cœur — libre à vous de l'utiliser dans vos
propres composants (templates de page) ou de l'ignorer. Contrairement à
Header/Footer, `Button` reste chargé via le bundle webpack normal de
`apps/web`, donc soumis à la même limite que les templates de page et
les blocs personnalisés ci-dessous (redémarrage nécessaire après
installation).

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

**Contrairement à Header/Footer**, un template de page reste chargé via
le bundle webpack normal de `apps/web` — il peut librement utiliser
`next/link`, des sous-composants avec hooks, etc., mais ne prend effet
qu'après un redémarrage de `apps/web` (voir
`apps/web/scripts/supervisor.mjs`, qui le fait automatiquement en tâche
de fond juste après l'installation — quelques minutes de décalage,
sans interruption de service pendant ce temps). Les blocs personnalisés
(`components/blocks.js`) et `Button` suivent la même règle. Un template
peut donc utiliser librement `<BlockContent body={...} />` pour rendre
le contenu édité par l'admin, contrairement à Header/Footer.

### Contenu de démarrage (`content/pages/*.json`)

Un thème peut importer ses propres pages à l'installation, avec un
contenu qui reproduit déjà la structure du site pour lequel il a été
conçu — plutôt que de livrer un site vide que le client doit remplir
entièrement lui-même. C'est le point d'extension à privilégier
maintenant que les blocs Gutenberg (ci-dessus) couvrent la plupart des
mises en page : nul besoin d'un template de page personnalisé pour
qu'une page "ressemble" au design prévu, un contenu de blocs bien
composé suffit — et reste, contrairement à un template, éditable comme
n'importe quelle page dès le départ (pas de "Modèle de page" à
comprendre ni à retirer pour en reprendre le contrôle).

Un fichier par page, nommé `<slug>.json`, contenant `{ title, body }` —
`body` est exactement le tableau de blocs que produit l'éditeur
(`JSON.stringify(editor.document)`), le plus simple étant de composer la
page une fois dans l'admin puis de copier le contenu de `page.body`
depuis la base :

```json
{
  "title": "Qui sommes-nous",
  "body": [
    { "type": "cover", "props": { "imageUrl": "/themes/mon-theme/img/banniere.jpg" },
      "children": [{ "type": "heading", "props": { "level": 1 }, "content": "Qui sommes-nous" }] },
    { "type": "paragraph", "content": "Notre histoire..." },
    { "type": "buttons", "children": [
      { "type": "button", "props": { "url": "/contact" }, "content": "Contactez-nous" }
    ] }
  ]
}
```

Auto-découvert par la seule présence du dossier — aucune entrée dans
`theme.json` n'est nécessaire, comme pour `blocks.js`. À l'installation
(et à chaque réinstallation/mise à jour), chaque fichier est importé
**seulement si aucune page n'existe déjà à ce slug** : une page déjà
créée, que ce soit par une installation précédente ou modifiée depuis
par le propriétaire du site, n'est jamais écrasée. Voir
`apps/api/Functions/InstallTheme.ts`'s `seedThemePages` pour
l'implémentation exacte.

Le menu de navigation, lui, n'est **pas** créé automatiquement — voir la
section suivante.

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
