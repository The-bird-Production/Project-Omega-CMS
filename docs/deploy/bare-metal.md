# Déploiement bare-metal (sans Docker)

Pour les instances qui ne tournent pas via `docker-compose.yml` (voir le
[README](../../Readme.md#-déploiement-docker) pour l'option Docker +
Watchtower, plus simple si elle vous convient).

## Principe

`apps/api` embarque un vérificateur de mise à jour (`apps/api/Functions/Updater/`)
qui, toutes les 6 heures par défaut :
1. Interroge l'API GitHub (`/repos/.../releases/latest`, anonyme, ce repo est
   public) pour connaître le dernier commit publié par
   [`.github/workflows/release.yml`](../../.github/workflows/release.yml).
2. Compare ce commit à `git rev-parse HEAD` dans votre installation.
3. Si `AppSettings.autoUpdateEnabled` est activé (désactivé par défaut — voir
   plus bas) et qu'une mise à jour existe, l'applique : sauvegarde la base,
   récupère le nouveau commit dans un `git worktree` séparé, synchronise le
   code par `rsync` en excluant vos données (uploads, plugins/thèmes
   installés, config, `.env`), réinstalle les dépendances, applique les
   migrations, puis quitte le processus (code 0) pour que systemd le
   relance avec le nouveau code.

Aucun accès entrant à votre serveur n'est nécessaire : tout part de votre
instance vers GitHub, jamais l'inverse.

## Pré-requis

- Le déploiement doit être un vrai clone git (`git clone https://github.com/The-bird-Production/Project-Omega-CMS.git`), pas une copie de fichiers — l'updater a besoin de `.git` pour comparer les commits et appliquer la mise à jour.
- `git`, `rsync`, `pnpm` (via `corepack enable`) et `mysqldump` (pour la sauvegarde pré-mise à jour) disponibles dans le `PATH`.
- `apps/api` et `apps/web` tournent chacun sous un service systemd avec `Restart=always` — un process Node ne peut pas remplacer son propre code en mémoire, il doit se terminer et être relancé par un superviseur externe.

## Unités systemd

`/etc/systemd/system/omega-api.service` :
```ini
[Unit]
Description=Project Omega CMS — API
After=network.target mysql.service

[Service]
Type=simple
User=omega
WorkingDirectory=/opt/project-omega/apps/api
EnvironmentFile=/opt/project-omega/apps/api/.env
ExecStart=/usr/bin/npx tsx server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/omega-web.service` :
```ini
[Unit]
Description=Project Omega CMS — Web
After=network.target omega-api.service

[Service]
Type=simple
User=omega
WorkingDirectory=/opt/project-omega/apps/web
EnvironmentFile=/opt/project-omega/apps/web/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activez-les avec :
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now omega-api omega-web
```

### Autoriser l'updater à redémarrer `omega-web`

`omega-api` se relance lui-même simplement en quittant (systemd s'en charge).
Mais la mise à jour de code touche aussi `apps/web`, qui tourne dans un
*autre* processus — l'updater a donc besoin de pouvoir exécuter
`systemctl restart omega-web`. Autorisez précisément cette seule commande,
sans droits sudo étendus, dans `/etc/sudoers.d/omega-updater` :
```
omega ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart omega-web
```
(remplacez `omega` par l'utilisateur système qui fait tourner `omega-api`).
Sans cette règle, la mise à jour de `apps/api` s'applique quand même
normalement — seul le redémarrage automatique de `apps/web` échoue (log
d'avertissement), il vous suffit alors de faire
`sudo systemctl restart omega-web` manuellement après coup.

## Activer la mise à jour automatique

Désactivée par défaut. Pour l'activer (nécessite d'être admin) :
```sh
curl -X PATCH https://votre-domaine/system/update/settings \
  -H "Content-Type: application/json" \
  --cookie "<votre cookie de session admin>" \
  -d '{"autoUpdateEnabled": true}'
```
Ou, en base, directement :
```sql
INSERT INTO AppSettings (id, autoUpdateEnabled, updateChannel, updatedAt)
VALUES (1, true, 'stable', NOW())
ON DUPLICATE KEY UPDATE autoUpdateEnabled = true;
```

Pour vérifier l'état sans rien appliquer : `GET /system/version` (public) ou,
en admin, `POST /system/update/check` pour forcer une vérification
immédiate, et `POST /system/update/apply` pour appliquer une mise à jour
disponible sans attendre le prochain passage planifié.

## ⚠️ Ce qui n'a pas été testé en conditions réelles

Le mécanisme de vérification (`checkForUpdate`) a été validé contre l'API
GitHub réelle et le dépôt réel. La séquence complète d'application
(`git worktree` + `rsync` + `pnpm install` + migrations + redémarrage
systemd inter-process) n'a en revanche pas pu être exécutée de bout en bout
dans l'environnement où elle a été écrite (pas de démon Docker, pas de
systemd disponible). **Avant d'activer `autoUpdateEnabled` en production,
testez une fois le cycle complet sur une instance jetable** (VM ou
conteneur bare-metal de test), avec une vraie base de données, pour
confirmer que la synchronisation de fichiers et les redémarrages se
déroulent comme prévu chez vous.
