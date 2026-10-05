# Déploiement et releases

> Remplace `QUICKSTART.md`, `BUILD_STRATEGY.md`, `GITHUB_SETUP.md`, `IMPLEMENTATION_READY.md` et `IMPLEMENTATION_SUMMARY.md`, qui se recoupaient et contenaient des informations inexactes (voir « Corrections » en bas de page).

## Vue d'ensemble

| Canal | Commande / déclencheur | Où tourne le build | Coût |
|---|---|---|---|
| **APK de release** (recommandé) | `git push origin vX.Y.Z` | Serveurs EAS, piloté par GitHub Actions | 1 build du quota EAS |
| APK manuel | Actions → *Build APK* → *Run workflow* | Serveurs EAS | 1 build du quota EAS |
| Build local Android | `npx expo run:android --variant release` | Votre PC | Gratuit, voir [ANDROID_LOCAL_BUILD.md](./ANDROID_LOCAL_BUILD.md) |
| Mise à jour OTA (optionnel) | `eas update` | Serveurs EAS Update | Non configuré aujourd'hui, voir plus bas |

Workflows GitHub :

- `.github/workflows/ci.yml` : lint, typecheck, tests et cohérence des versions sur chaque PR et chaque push sur `master`. Ne consomme aucun build EAS.
- `.github/workflows/build-apk.yml` : sur un tag `v*` (ou manuellement), relance la validation, vérifie que le tag correspond à `app.json`, lance `eas build --profile production`, télécharge l'APK, l'attache à une GitHub Release et le garde 30 jours comme artefact.

## Pré-requis (une seule fois)

1. Créer un token sur https://expo.dev/settings/tokens.
2. Dans GitHub : *Settings → Secrets and variables → Actions → New repository secret*, nom `EXPO_TOKEN`.

## Publier une version

Le skill `/release` (agent `release-manager`) automatise ces étapes.

1. Partir d'un `master` à jour et vert en CI.
2. Choisir la version (SemVer) : `fix` → patch, `feat` → minor, rupture de données ou d'usage → major.
3. Mettre la **même** version dans `package.json` et `app.json` (`expo.version`). La CI et `npm run validate` échouent sinon.
4. Déplacer les entrées de `## [Unreleased]` du `CHANGELOG.md` vers `## [X.Y.Z] - AAAA-MM-JJ`.
5. Commit `chore(release): vX.Y.Z` via une PR, puis merge.
6. Sur `master` à jour : `git tag vX.Y.Z && git push origin vX.Y.Z`.
7. Suivre le run dans l'onglet *Actions*, puis récupérer l'APK dans *Releases*.

### Numéros de version

- `expo.version` (`app.json`) : version visible, à monter à la main.
- `versionCode` Android : géré par EAS (`"appVersionSource": "remote"` + `"autoIncrement": true` dans `eas.json`). Rien à faire.
- `runtimeVersion.policy = "appVersion"` : une mise à jour OTA ne cible que les builds de la même `expo.version`.

## Profils EAS (`eas.json`)

| Profil | Usage |
|---|---|
| `development` | Dev client interne (`expo-dev-client` n'est pas installé aujourd'hui) |
| `preview` | APK interne pour tester avant release : `eas build -p android --profile preview` |
| `production` | APK de release, utilisé par `build-apk.yml` |

## Mises à jour OTA (optionnel, non configuré)

`expo-updates` est installé et `updates.url` est renseigné dans `app.json`, mais aucun `channel` n'est défini dans `eas.json`. Pour l'activer : ajouter `"channel": "production"` au profil `production`, refaire un build, puis publier avec `eas update --channel production --message "…"`. Seul du JS/des assets peuvent être livrés ainsi ; tout changement natif ou de version impose un nouveau build.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `EXPO_TOKEN` manquant / 401 | Secret absent ou expiré |
| « Tag … ne correspond pas à app.json » | Le tag a été posé avant le bump de version |
| Échec à l'étape *Validate* | Lint, typecheck ou tests rouges : corriger sur une branche, merger, re-taguer |
| Quota EAS atteint | Attendre le mois suivant ou builder en local |
| Release non créée | Le run a été lancé manuellement (pas de tag) : l'APK est seulement dans les artefacts |

Pour re-taguer après un échec : `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`, corriger, puis re-taguer.

## Corrections apportées par rapport aux anciens documents

- Les builds **ne sont pas illimités et gratuits** : GitHub Actions ne fait que piloter `eas build`, qui compile sur les serveurs Expo et consomme le quota EAS à chaque exécution.
- Node 18 n'est plus supporté par Expo SDK 54 : les workflows utilisent Node 20.
- L'ancien workflow ne pouvait pas créer de Release (`contents: read`) et contenait des étapes de commentaire de PR qui échouaient hors PR.
- `npm install -g expo-cli` est obsolète : utiliser `npx expo` et `npx eas-cli` (ou `npm i -g eas-cli`).
- `expo run:android` sans `--variant release` produit un build debug.
- `eas build --local` n'est pas supporté sous Windows (macOS/Linux uniquement, ou WSL).
- La branche par défaut est `master`, pas `main`.
